const Transaction = require('../models/Transaction');
const { parseImportBuffer } = require('../utils/importParser');
const { classifyLocally, classifyBatchWithGemini } = require('../utils/classifier');

const getTransactions = async (req, res) => {
  try {
    const { month, category, type, page = 1, limit = 50, taxRelevant } = req.query;
    
    const query = { user: req.user.id };
    
    if (taxRelevant === 'true') {
      query.$or = [
        { 'taxRelevant.isRA': true },
        { 'taxRelevant.isTFSA': true },
        { 'taxRelevant.isMedicalAid': true },
        { 'taxRelevant.isDonation': true }
      ];
    }
    
    if (category && category !== 'All') query.category = category;
    if (type && type !== 'All') query.type = type.toLowerCase();
    
    if (month) {
      // month is expected as YYYY-MM
      const startDate = new Date(`${month}-01T00:00:00Z`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    const total = await Transaction.countDocuments(query);
    
    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

const addTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      user: req.user.id,
      source: 'manual',
      classifiedBy: 'user'
    });
    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

const importTransactions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const normalized = parseImportBuffer(req.file.buffer, req.file.mimetype);
    if (normalized.length === 0) {
      return res.status(400).json({ message: 'No valid transactions found in file' });
    }

    const aiDescriptionsToClassify = new Set();
    const localClassifications = {};

    // Pass 1 & 2: Local Ontology
    for (const tx of normalized) {
      const localClassification = classifyLocally(tx.description, tx.type);
      if (localClassification) {
        localClassifications[tx.description] = localClassification;
      } else {
        aiDescriptionsToClassify.add(tx.description);
      }
    }

    // Pass 3: Claude batch processing
    const aiDescriptionsArray = Array.from(aiDescriptionsToClassify);
    let aiClassifications = {};
    if (aiDescriptionsArray.length > 0) {
      const recentTx = await Transaction.find({ user: req.user.id })
        .sort({ date: -1 }).limit(20).select('description category subCategory merchant -_id');
      aiClassifications = await classifyBatchWithClaude(aiDescriptionsArray, recentTx);
    }

    // Deduplication check
    const existingTxs = await Transaction.find({ user: req.user.id })
      .select('date amount description')
      .lean();
    
    const existingSet = new Set(existingTxs.map(tx => 
      `${new Date(tx.date).toISOString().split('T')[0]}_${tx.amount}_${tx.description.trim().toLowerCase()}`
    ));

    // Prepare for insertion
    const transactionsToInsert = [];
    let uncategorizedCount = 0;
    let duplicateCount = 0;

    for (const tx of normalized) {
      const txKey = `${tx.date.toISOString().split('T')[0]}_${tx.amount}_${tx.description.trim().toLowerCase()}`;
      if (existingSet.has(txKey)) {
        duplicateCount++;
        continue;
      }

      let classification = localClassifications[tx.description];
      if (!classification && aiClassifications[tx.description]) {
         classification = aiClassifications[tx.description];
         classification.classifiedBy = 'ai';
      }
      
      // Fallback
      if (!classification || classification.category === 'Uncategorized') {
         uncategorizedCount++;
         classification = {
           category: 'Uncategorized',
           merchant: tx.description.substring(0, 30),
           classifiedBy: 'ai',
           taxRelevant: { isRA: false, isTFSA: false, isMedicalAid: false, isDonation: false }
         };
      }

      transactionsToInsert.push({
        user: req.user.id,
        date: tx.date,
        amount: tx.amount,
        description: tx.description,
        merchant: classification.merchant || tx.description.substring(0, 30),
        type: tx.type,
        category: classification.category || 'Uncategorized',
        subCategory: classification.subCategory || '',
        classifiedBy: classification.classifiedBy || 'ai',
        source: 'import',
        taxRelevant: classification.taxRelevant || {}
      });
    }

    const inserted = await Transaction.insertMany(transactionsToInsert);
    const skippedReasons = [];
    if (duplicateCount > 0) skippedReasons.push(`${duplicateCount} duplicate(s) skipped`);

    res.status(201).json({ 
      imported: inserted.length, 
      skipped: duplicateCount, 
      skippedReasons, 
      uncategorizedCount 
    });
  } catch (error) {
    console.error('Import error', error);
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    Object.assign(transaction, req.body);
    transaction.classifiedBy = 'user';
    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

const deleteAllTransactions = async (req, res) => {
  try {
    await Transaction.deleteMany({ user: req.user.id });
    res.json({ message: 'All transactions cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

const reclassifyTransactions = async (req, res) => {
  try {
    const txs = await Transaction.find({ user: req.user.id });
    if (txs.length === 0) return res.json({ message: 'No transactions to reclassify' });

    const aiDescriptionsToClassify = new Set();
    const localClassifications = {};

    for (const tx of txs) {
      const result = classifyLocally(tx.description, tx.type);
      if (tx.description.toUpperCase().includes('LEKGOTLA')) {
        console.log('Reclassify result for', tx.description, ':', result);
      }
      if (result) {
        localClassifications[tx.description] = result;
      } else {
        aiDescriptionsToClassify.add(tx.description);
      }
    }

    const aiDescriptionsArray = Array.from(aiDescriptionsToClassify);
    let aiClassifications = {};
    if (aiDescriptionsArray.length > 0) {
      const recentTx = await Transaction.find({ user: req.user.id })
        .sort({ date: -1 }).limit(20).select('description category subCategory merchant -_id');
      aiClassifications = await classifyBatchWithGemini(aiDescriptionsArray, recentTx);
    }

    let updatedCount = 0;
    const bulkOps = [];

    for (const tx of txs) {
      let classification = localClassifications[tx.description];
      if (!classification && aiClassifications[tx.description]) {
         classification = aiClassifications[tx.description];
         classification.classifiedBy = 'ai';
      }

      if (classification) {
        bulkOps.push({
          updateOne: {
            filter: { _id: tx._id },
            update: {
              $set: {
                category: classification.category,
                subCategory: classification.subCategory || '',
                merchant: classification.merchant || tx.merchant,
                classifiedBy: classification.classifiedBy || 'ai',
                taxRelevant: classification.taxRelevant || {},
                isSubscription: false,
                isAnomaly: false
              }
            }
          }
        });
        updatedCount++;
      } else {
        bulkOps.push({
          updateOne: {
            filter: { _id: tx._id },
            update: {
              $set: {
                isSubscription: false,
                isAnomaly: false
              }
            }
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      await Transaction.bulkWrite(bulkOps);
    }

    res.json({ message: `Successfully reclassified ${updatedCount} transactions` });
  } catch (error) {
    console.error('Reclassify error:', error);
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  importTransactions,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  reclassifyTransactions
};
