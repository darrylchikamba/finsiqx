const analytics = require('../utils/analytics');

const getSummary = async (req, res) => {
  try {
    const { month } = req.query; 
    if (!month) return res.status(400).json({ message: 'Month query param required' });
    const data = await analytics.getMonthlySummary(req.user.id, month);
    res.json(data);
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

const getHealthScore = async (req, res) => {
  try {
    const data = await analytics.getHealthScore(req.user.id);
    res.json(data);
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

const getSubscriptions = async (req, res) => {
  try {
    const data = await analytics.detectSubscriptions(req.user.id);
    res.json(data);
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

const getAnomalies = async (req, res) => {
  try {
    const data = await analytics.detectAnomalies(req.user.id);
    res.json(data);
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

const getForecast = async (req, res) => {
  try {
    const data = await analytics.getForecast(req.user.id);
    res.json(data);
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

const getPersonality = async (req, res) => {
  try {
    const data = await analytics.getFinancialPersonality(req.user.id);
    res.json({ personality: data });
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

const getHeatmap = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: 'Month query param required' });
    const data = await analytics.getHeatmap(req.user.id, month);
    res.json(data);
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

const getSAOverview = async (req, res) => {
  try {
    const data = await analytics.getSAOverview(req.user.id);
    res.json(data);
  } catch (error) { res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }); }
};

module.exports = {
  getSummary,
  getHealthScore,
  getSubscriptions,
  getAnomalies,
  getForecast,
  getPersonality,
  getHeatmap,
  getSAOverview
};
