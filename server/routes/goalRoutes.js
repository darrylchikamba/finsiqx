const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getGoals, addGoal, updateGoal, deleteGoal } = require('../controllers/goalController');

const router = express.Router();

router.route('/')
  .get(protect, getGoals)
  .post(protect, addGoal);

router.route('/:id')
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

module.exports = router;
