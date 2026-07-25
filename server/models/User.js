const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const getCurrentSATaxYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 1 = Feb, 2 = Mar
  
  if (month < 2) {
    return `${year - 1}/${year}`;
  }
  return `${year}/${year + 1}`;
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    default: 'ZAR'
  },
  monthlyIncome: {
    type: Number,
    required: true
  },
  financialPersonality: {
    type: String,
    default: 'Unknown'
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  taxYear: {
    type: String,
    default: getCurrentSATaxYear
  }
}, { timestamps: true });

// Pre-save hook: async, NO next parameter
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match entered password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
