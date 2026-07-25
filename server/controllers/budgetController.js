const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const getBudget = async (req, res) => {
  try {
    const { month } = req.params;
    let budget = await Budget.findOne({ user: req.user.id, month });

    if (!budget) {
      budget = new Budget({ user: req.user.id, month, categories: [] });
      await budget.save();
    }

    // Recalculate spent dynamically based on actual transactions
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const txs = await Transaction.find({ 
      user: req.user.id, 
      type: 'debit', 
      date: { $gte: startDate, $lte: endDate } 
    });

    const spendMap = {};
    txs.forEach(t => {
      spendMap[t.category] = (spendMap[t.category] || 0) + t.amount;
    });

    // Update the budget categories spent amounts
    budget.categories = budget.categories.map(c => ({
      category: c.category,
      limit: c.limit,
      spent: spendMap[c.category] || 0
    }));

    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

const upsertBudget = async (req, res) => {
  try {
    const { month } = req.params;
    const { categories } = req.body; // array of { category, limit }

    let budget = await Budget.findOne({ user: req.user.id, month });

    if (!budget) {
      budget = new Budget({ user: req.user.id, month, categories: [] });
    }

    // Merge incoming categories with existing or create new
    categories.forEach(inCat => {
      const existing = budget.categories.find(c => c.category === inCat.category);
      if (existing) {
        existing.limit = inCat.limit;
      } else {
        budget.categories.push({ category: inCat.category, limit: inCat.limit, spent: 0 });
      }
    });

    await budget.save();
    
    // Trigger getBudget logic to recalculate spend before returning
    req.params.month = month;
    return getBudget(req, res);
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { month, categoryName } = req.params;
    let budget = await Budget.findOne({ user: req.user.id, month });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    budget.categories = budget.categories.filter(c => c.category !== categoryName);
    await budget.save();
    
    // Trigger getBudget logic to recalculate spend before returning
    req.params.month = month;
    return getBudget(req, res);
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

module.exports = { getBudget, upsertBudget, deleteCategory };
