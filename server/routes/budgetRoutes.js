const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getBudget, upsertBudget, deleteCategory } = require('../controllers/budgetController');

const router = express.Router();

router.route('/:month')
  .get(protect, getBudget)
  .put(protect, upsertBudget);

router.delete('/:month/category/:categoryName', protect, deleteCategory);

module.exports = router;
