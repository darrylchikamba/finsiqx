const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getSummary,
  getHealthScore,
  getSubscriptions,
  getAnomalies,
  getForecast,
  getPersonality,
  getHeatmap,
  getSAOverview
} = require('../controllers/analyticsController');

const router = express.Router();

router.use(protect); // Protect all routes

router.get('/summary', getSummary);
router.get('/health-score', getHealthScore);
router.get('/subscriptions', getSubscriptions);
router.get('/anomalies', getAnomalies);
router.get('/forecast', getForecast);
router.get('/personality', getPersonality);
router.get('/heatmap', getHeatmap);
router.get('/sa-overview', getSAOverview);

module.exports = router;
