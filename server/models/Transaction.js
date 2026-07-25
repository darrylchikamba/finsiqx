const mongoose = require('mongoose');

const taxRelevantSchema = new mongoose.Schema({
  isRA: { type: Boolean, default: false },
  isTFSA: { type: Boolean, default: false },
  isMedicalAid: { type: Boolean, default: false },
  isDonation: { type: Boolean, default: false }
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  description: {
    type: String,
    required: true
  },
  merchant: {
    type: String
  },
  type: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String
  },
  classifiedBy: {
    type: String,
    enum: ['ontology', 'ai', 'user'],
    required: true
  },
  isSubscription: {
    type: Boolean,
    default: false
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['import', 'manual'],
    required: true
  },
  taxRelevant: taxRelevantSchema
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
