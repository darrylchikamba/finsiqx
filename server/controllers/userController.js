const User = require('../models/User');
const { getHealthScore } = require('../utils/analytics');

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.monthlyIncome !== undefined) {
      user.monthlyIncome = Number(req.body.monthlyIncome);
    }

    const updatedUser = await user.save();
    const updatedHealth = await getHealthScore(user._id);

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      monthlyIncome: updatedUser.monthlyIncome,
      healthScore: updatedHealth
    });
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

module.exports = { updateUserProfile };
