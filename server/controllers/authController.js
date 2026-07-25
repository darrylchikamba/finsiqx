const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, monthlyIncome } = req.body;

    const userExists = await User.findOne({ email: { $eq: email } });

    if (userExists) {
      return res.status(400).json({ message: process.env.NODE_ENV === 'production' ? 'Invalid request' : 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      monthlyIncome
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: process.env.NODE_ENV === 'production' ? 'Invalid request' : 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: { $eq: email } });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: process.env.NODE_ENV === 'production' ? 'Invalid credentials' : 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
