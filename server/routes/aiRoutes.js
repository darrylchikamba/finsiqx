const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMaliInsights, queryMali } = require('../controllers/aiController');

const router = express.Router();

router.use(protect);

router.post('/insights', getMaliInsights);
router.post('/query', queryMali);

module.exports = router;
