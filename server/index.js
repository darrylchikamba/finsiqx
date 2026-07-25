require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');

// Verify critical environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL', 'GEMINI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app = express();

// Middleware: CORS must be FIRST
app.use(cors({
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200
}));

app.use(helmet());

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs for AI
  message: { message: 'Too many AI requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for Auth
  message: { message: 'Too many auth requests, please try again later.' }
});

const conditionalLimiter = (limiter) => {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      return limiter(req, res, next);
    }
    next();
  };
};

// Middleware: Manual NoSQL Sanitizer
const sanitizeObj = (obj) => {
  if (Array.isArray(obj)) {
    obj.forEach(sanitizeObj);
  } else if (obj !== null && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      let value = obj[key];
      if (typeof value === 'string') {
        value = value.trim();
        obj[key] = value;
      }
      sanitizeObj(value);
      if (key.includes('$') || key.includes('.')) {
        const newKey = key.replace(/\$/g, '').replace(/\./g, '');
        obj[newKey] = value;
        delete obj[key];
      }
    });
  }
};

const mongoSanitize = (req, res, next) => {
  if (req.body) sanitizeObj(req.body);
  if (req.query) sanitizeObj(req.query);
  if (req.params) sanitizeObj(req.params);
  next();
};

app.use('/api/transactions/import', express.json({ limit: '5mb' }));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize);

// Routes
app.use('/api/auth', conditionalLimiter(authLimiter), authRoutes);
app.use('/api/users', conditionalLimiter(authLimiter), userRoutes);
app.use('/api/transactions', conditionalLimiter(generalLimiter), transactionRoutes);
app.use('/api/analytics', conditionalLimiter(generalLimiter), analyticsRoutes);
app.use('/api/budgets', conditionalLimiter(generalLimiter), budgetRoutes);
app.use('/api/goals', conditionalLimiter(generalLimiter), goalRoutes);
app.use('/api/ai', conditionalLimiter(aiLimiter), aiRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FINSIQX API is running' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database', err);
  process.exit(1);
});
