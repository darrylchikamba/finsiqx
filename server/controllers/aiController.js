// server/controllers/aiController.js
//
// MALI AI controller — Gemini 1.5 Flash with mock fallback.
// MOCK_MODE is active when MOCK_AI=true in .env or GEMINI_API_KEY is missing/placeholder.
// To go live: set a real GEMINI_API_KEY and MOCK_AI=false in .env.

const axios = require('axios');
const analytics = require('../utils/analytics');

const MOCK_MODE = process.env.MOCK_AI === 'true' ||
  !process.env.GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY === 'not-yet-funded' ||
  process.env.GEMINI_API_KEY === '<user will paste their key>';

const MALI_SYSTEM_PROMPT = `You are MALI, the AI assistant inside FINSIQX, a South
African personal finance intelligence platform. Mali means "money" in several South
African Bantu languages. Speak in first person, calm and direct. Use real rand amounts (R).
Never use the words "optimise", "leverage", or "funds". Never use emoji.
Acknowledge South African realities directly: load shedding, fuel price adjustments,
stokvel cycles, 13th cheque season, TFSA and RA limits. Give one clear observation,
then one clear suggestion. Never more than 2-3 sentences per insight.`;

// ─────────────────────────────────────────────────────────
// MOCK INSIGHTS — type-aware, never identical across pages
// ─────────────────────────────────────────────────────────

function buildMockInsights(summary, saOverview, type) {
  const netCashFlow = summary?.netCashFlow ?? 0;
  const tfsaRemaining = saOverview?.tfsaRemaining ?? 0;

  const insightsByType = {
    Dashboard: [
      {
        type: 'positive',
        message: `Review your largest spending category for the quickest wins. Lifestyle is consistently your highest variable expense.`
      },
      {
        type: 'saving',
        message: `Lifestyle is your highest variable category this month. A 15% reduction could free up meaningful budget without changing your standard of living.`
      }
    ],
    Analytics: [
      {
        type: 'warning',
        message: `Transport costs have been climbing month on month. Fuel price adjustments are the most likely driver — worth checking against your last three months.`
      },
      {
        type: 'saving',
        message: `Your grocery spend is consistent. Takeaway frequency is where most households find the easiest savings without feeling the difference.`
      }
    ],
    Budget: [
      {
        type: 'positive',
        message: `Staying within your category limits this month will directly improve your Financial Health Score. Even one overspent category pulls the score down significantly.`
      },
      {
        type: 'warning',
        message: `Categories without set limits are invisible to your budget. Add limits to your top three spending categories to get a complete picture.`
      }
    ],
    SAOverview: [
      {
        type: tfsaRemaining > 0 ? 'saving' : 'positive',
        message: tfsaRemaining > 0
          ? `You have R${tfsaRemaining.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} remaining in your TFSA allowance for this tax year. Worth topping up before February.`
          : `Your TFSA annual limit is fully utilised. Consider increasing your RA contribution for additional tax efficiency before the tax year ends.`
      },
      {
        type: 'positive',
        message: `Your stokvel contributions are being tracked. Consistent community savings build long-term financial resilience that formal products alone cannot replicate.`
      }
    ]
  };

  // Normalise the type key — handle casing variations from different pages
  const normalisedType = Object.keys(insightsByType).find(
    k => k.toLowerCase() === (type || '').toLowerCase()
  ) || 'Dashboard';

  return insightsByType[normalisedType];
}

function buildMockQueryResponse(question) {
  const q = question.toLowerCase();

  if (q.includes('tax') || q.includes('efficiency') || q.includes('tfsa') || q.includes('ra')) {
    return 'Your RA contributions are your strongest tax lever right now. Every rand contributed reduces your taxable income directly. If your TFSA still has annual allowance remaining, that is the next priority — growth inside a TFSA is completely tax-free.';
  }
  if (q.includes('biggest') || q.includes('largest') || q.includes('most')) {
    return 'Your largest spending category this month is Lifestyle, driven mainly by subscriptions and entertainment. Housing and school fees are your biggest fixed commitments. Transport has been climbing due to recent fuel price adjustments.';
  }
  if (q.includes('food') || q.includes('groceries') || q.includes('eating')) {
    return 'Your food and grocery spend is within a reasonable range. The area worth watching is takeaway frequency — it adds up faster than supermarket shopping at the same total spend.';
  }
  if (q.includes('saving') || q.includes('save') || q.includes('emergency')) {
    return 'Your current net cash flow gives you room to save. The most immediate opportunity is your subscription stack — review which ones you actively use. Redirecting even R500 a month to an emergency fund builds meaningful resilience within six months.';
  }
  if (q.includes('subscription') || q.includes('recurring')) {
    return 'Your subscriptions are being tracked on the Subscriptions page. You have several recurring services detected. Review which ones you actively use — cancelling one or two could free up R400 to R900 per month.';
  }
  if (q.includes('electricity') || q.includes('load shedding') || q.includes('eskom')) {
    return 'Your prepaid electricity spend has been higher than your summer average — a pattern consistent with increased load shedding hours. Your backup power investment is tracking on the SA Overview page.';
  }

  return 'I have looked at your recent transactions. Your spending pattern is fairly consistent month to month. The areas worth watching are transport costs and your subscription total. Ask me about a specific category for a more detailed breakdown.';
}

// ─────────────────────────────────────────────────────────
// CACHE
// ─────────────────────────────────────────────────────────

const queryCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(userId, question) {
  return `${userId}_${question.trim().toLowerCase()}`;
}

// ─────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────

exports.getMaliInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    // Accept type from either 'type' or 'context' key — handles both MALIInsightCard variants
    const type = req.body.type || req.body.context || 'Dashboard';

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const summary = await analytics.getMonthlySummary(userId, month);
    const saOverview = await analytics.getSAOverview(userId);

    if (MOCK_MODE) {
      try {
        return res.json({
          mock: true,
          insights: buildMockInsights(summary, saOverview, type)
        });
      } catch (mockErr) {
        console.error('MOCK_MODE getMaliInsights Error:', mockErr);
        return res.status(500).json({ message: 'Error generating mock insights' });
      }
    }

    const context = `Monthly summary: ${JSON.stringify(summary)}\nSA overview: ${JSON.stringify(saOverview)}\nPage context: ${type}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: {
          parts: [{ text: MALI_SYSTEM_PROMPT }]
        },
        contents: [{
          parts: [{ text: `Based on this user's data and page context (${type}), give 2 short insights as a JSON array of objects with "type" (one of: saving, anomaly, warning, positive) and "message". Data:\n${context}` }]
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 500
        }
      }
    );

    const text = response.data.candidates[0].content.parts[0].text ?? '[]';
    let insights;
    try {
      let rawText = text;
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/```/g, '').trim();
      }
      insights = JSON.parse(rawText);
    } catch {
      insights = [{ type: 'positive', message: text }];
    }

    res.json({ mock: false, insights });
  } catch (error) {
    console.error('MALI error:', error.response?.data || error.message);
    res.status(500).json({
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message
    });
  }
};

exports.queryMali = async (req, res) => {
  try {
    const userId = req.user.id;
    const question = req.body.query || req.body.question;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ message: 'A query is required.' });
    }

    const cacheKey = getCacheKey(userId, question);
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ mock: cached.mock, answer: cached.answer, cached: true });
    }

    if (MOCK_MODE) {
      try {
        const answer = buildMockQueryResponse(question);
        queryCache.set(cacheKey, { answer, mock: true, timestamp: Date.now() });
        return res.json({ mock: true, answer, cached: false });
      } catch (mockErr) {
        console.error('MOCK_MODE queryMali Error:', mockErr);
        return res.status(500).json({ message: 'Error generating mock answer' });
      }
    }

    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const summaries = [];
    for (let d = new Date(threeMonthsAgo); d <= now; d.setMonth(d.getMonth() + 1)) {
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      summaries.push(await analytics.getMonthlySummary(userId, m));
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: {
          parts: [{ text: MALI_SYSTEM_PROMPT }]
        },
        contents: [{
          parts: [{ text: `User's last 3 months of financial data: ${JSON.stringify(summaries)}\n\nQuestion: ${question}` }]
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 400
        }
      }
    );

    const answer = response.data.candidates[0].content.parts[0].text ?? '';
    queryCache.set(cacheKey, { answer, mock: false, timestamp: Date.now() });
    res.json({ mock: false, answer, cached: false });
  } catch (error) {
    console.error('MALI error:', error.response?.data || error.message);
    res.status(500).json({
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message
    });
  }
};