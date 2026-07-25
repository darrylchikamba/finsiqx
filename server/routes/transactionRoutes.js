const express = require('express');
const {
  getTransactions,
  addTransaction,
  importTransactions,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  reclassifyTransactions
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(protect, getTransactions)
  .post(protect, addTransaction);

router.post('/import', protect, upload.single('file'), importTransactions);
router.post('/reclassify', protect, reclassifyTransactions);
router.delete('/all', protect, deleteAllTransactions);

router.route('/:id')
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

module.exports = router;
