const Goal = require('../models/Goal');

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ targetDate: 1 });
    res.json(goals);
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

const addGoal = async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      user: req.user.id
    });
    const createdGoal = await goal.save();
    res.status(201).json(createdGoal);
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    Object.assign(goal, req.body);
    
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isComplete = true;
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();
    res.json({ message: 'Goal removed' });
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

module.exports = { getGoals, addGoal, updateGoal, deleteGoal };
