const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const User = require('../models/User');
const { SARS_CONFIG } = require('./saOntology');

const calculateLoadSheddingScore = async (userId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const txs = await Transaction.find({ user: userId, date: { $gte: thirtyDaysAgo } });

  let backupPowerSpend = 0;
  txs.forEach(t => {
    if (t.type === 'debit' && (t.category === 'Load Shedding' || t.subCategory === 'Load Shedding/Hardware')) {
      backupPowerSpend += t.amount;
    }
  });

  return Math.min(100, 20 + (backupPowerSpend / 500) * 80);
};

const calculateCommunityWealthScore = async (userId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const txs = await Transaction.find({ user: userId, date: { $gte: thirtyDaysAgo } });

  let communitySpend = 0;
  txs.forEach(t => {
    if (t.type === 'debit' && (t.category === 'Community & Family' || t.subCategory === 'Transfers')) {
      communitySpend += t.amount;
    }
  });

  return Math.min(100, 30 + (communitySpend / 500) * 70);
};

const calculateCostOfLivingScore = async (userId, income) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const txs = await Transaction.find({
    user: userId,
    type: 'debit',
    date: { $gte: thirtyDaysAgo }
  });

  let essentialSpend = 0;

  txs.forEach(t => {
    if (['Food & Groceries', 'Housing', 'Transport', 'Municipal', 'Utilities'].includes(t.category)) {
      essentialSpend += t.amount;
    }
  });

  const safeIncome = income && income > 0 ? income : 1;
  const costPercent = essentialSpend / safeIncome;
  const colScore = Math.max(0, ((costPercent - 0.40) / 0.40) * 100);
  return Math.min(100, Math.max(0, colScore));
};

const getTaxYearStart = (date = new Date()) => {
  const currentMonth = date.getMonth();
  const startMonth = SARS_CONFIG.TAX_YEAR_START_MONTH - 1;
  let year = date.getFullYear();
  if (currentMonth < startMonth) {
    year -= 1;
  }
  return new Date(year, startMonth, 1);
};

const getHealthScore = async (userId) => {
  const user = await User.findById(userId).select('monthlyIncome');
  if (!user) throw new Error('User not found');

  const income = user?.monthlyIncome || 1;

  if (!income || income <= 0) {
    return {
      score: 50,
      breakdown: {
        savingsRate: 50,
        budgetAdherence: 50,
        taxEfficiency: 50,
        costOfLivingPressure: 50,
        loadSheddingResilience: 50,
        communityWealth: 50
      }
    };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const txs = await Transaction.find({ user: userId, date: { $gte: thirtyDaysAgo } });
  let spend = 0;
  let tfsaYtd = 0;
  let raYtd = 0;
  let hasMedicalAid = false;

  const taxStart = getTaxYearStart();
  const ytdTxs = await Transaction.find({ user: userId, date: { $gte: taxStart } });

  ytdTxs.forEach(t => {
    if (t.taxRelevant?.isTFSA && t.type === 'debit') tfsaYtd += t.amount;
    if (t.taxRelevant?.isRA && t.type === 'debit') raYtd += t.amount;
    if (t.taxRelevant?.isMedicalAid) hasMedicalAid = true;
  });

  txs.forEach(t => {
    if (t.type === 'debit') {
      spend += t.amount;
    }
  });

  const netCashFlow = income - spend;
  const savingsPercent = income === 0 ? 50 : Math.max(0, netCashFlow / income);
  const savingsScore = Math.min(100, (savingsPercent / 0.20) * 100);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const budget = await Budget.findOne({ user: userId, month: currentMonthStr });
  let budgetScore = 50;
  if (budget && budget.categories.length > 0) {
    let withinLimits = 0;
    budget.categories.forEach(c => {
      if (c.spent <= c.limit) withinLimits++;
    });
    budgetScore = (withinLimits / budget.categories.length) * 100;
  }

  const tfsaProgress = Math.min(1, tfsaYtd / SARS_CONFIG.TFSA_ANNUAL);
  const raProgress = Math.min(1, raYtd / SARS_CONFIG.RA_MAX_AMOUNT);
  let taxScore = ((tfsaProgress + raProgress) / 2) * 80;
  if (hasMedicalAid) taxScore += 20;
  taxScore = Math.min(100, taxScore);

  const lsScore = await calculateLoadSheddingScore(userId);
  const cwScore = await calculateCommunityWealthScore(userId);
  const colScore = await calculateCostOfLivingScore(userId, income);

  const finalScore =
    (savingsScore * 0.25) +
    (budgetScore * 0.20) +
    (taxScore * 0.20) +
    (colScore * 0.20) +
    (lsScore * 0.08) +
    (cwScore * 0.07);

  return {
    score: Math.round(finalScore),
    breakdown: {
      savingsRate: Math.round(savingsScore),
      budgetAdherence: Math.round(budgetScore),
      taxEfficiency: Math.round(taxScore),
      costOfLivingPressure: Math.round(colScore),
      loadSheddingResilience: Math.round(lsScore),
      communityWealth: Math.round(cwScore)
    }
  };
};

const getFinancialPersonality = async (userId) => {
  const health = await getHealthScore(userId);
  const { breakdown } = health;

  if (breakdown.savingsRate > 80 && breakdown.taxEfficiency < 40) return 'Saver';
  if (breakdown.taxEfficiency > 70 && breakdown.savingsRate > 50) return 'Investor';
  if (breakdown.budgetAdherence > 80) return 'Planner';
  if (breakdown.costOfLivingPressure < 40 && breakdown.savingsRate < 20) return 'ImpulseSpender';
  return 'Balanced';
};

const detectAnomalies = async (userId) => {
  const txs = await Transaction.find({ user: userId, type: 'debit', isAnomaly: false });
  if (!txs.length) return [];

  const catStats = {};
  txs.forEach(t => {
    if (!catStats[t.category]) catStats[t.category] = { sum: 0, count: 0 };
    catStats[t.category].sum += t.amount;
    catStats[t.category].count += 1;
  });

  Object.keys(catStats).forEach(c => {
    catStats[c].avg = catStats[c].sum / catStats[c].count;
  });

  const anomalyIds = [];
  const flagged = [];

  txs.sort((a, b) => a.date - b.date);

  for (let i = 0; i < txs.length; i++) {
    const t = txs[i];
    let isAnomaly = false;

    if (catStats[t.category] && t.amount > (catStats[t.category].avg * 3)) {
      isAnomaly = true;
    }

    if (!isAnomaly) {
      for (let j = i - 1; j >= 0; j--) {
        const prev = txs[j];
        const daysDiff = (t.date - prev.date) / (1000 * 60 * 60 * 24);
        if (daysDiff > 3) break;

        if (t.merchant === prev.merchant && t.amount === prev.amount) {
          isAnomaly = true;
          break;
        }
      }
    }

    if (isAnomaly) {
      anomalyIds.push(t._id);
      flagged.push(t);
    }
  }

  if (anomalyIds.length > 0) {
    await Transaction.updateMany({ _id: { $in: anomalyIds } }, { $set: { isAnomaly: true } });
  }

  return flagged;
};

const detectSubscriptions = async (userId) => {
  const txs = await Transaction.find({ user: userId, type: 'debit' });
  const byMerchant = {};

  txs.forEach(t => {
    const merchantKey = t.merchant ? t.merchant.trim().toUpperCase() : 'UNKNOWN';
    if (!byMerchant[merchantKey]) byMerchant[merchantKey] = [];
    byMerchant[merchantKey].push(t);
  });

  const subIds = [];
  const flagged = [];
  const groupsFound = Object.keys(byMerchant).length;
  let groupsWithThresholdMet = 0;

  Object.keys(byMerchant).forEach(merchant => {
    const records = byMerchant[merchant].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (records.length < 2) return;

    let thresholdMet = false;

    for (let i = 1; i < records.length; i++) {
      const prev = records[i - 1];
      const curr = records[i];
      const daysDiff = Math.round(Math.abs(new Date(curr.date) - new Date(prev.date)) / (1000 * 60 * 60 * 24));

      if (daysDiff >= 25 && daysDiff <= 37 && Math.abs(curr.amount - prev.amount) < 10) {
        thresholdMet = true;
        if (!subIds.includes(curr._id.toString())) {
          subIds.push(curr._id.toString());
          flagged.push(curr);
        }
        if (!subIds.includes(prev._id.toString())) {
          subIds.push(prev._id.toString());
          flagged.push(prev);
        }
      }
    }

    if (thresholdMet) groupsWithThresholdMet++;
  });

  console.log(`[Subscriptions] Scanned ${groupsFound} unique merchants. Merchants with 25-35 day recurring interval: ${groupsWithThresholdMet}`);

  if (subIds.length > 0) {
    await Transaction.updateMany({ _id: { $in: subIds } }, { $set: { isSubscription: true } });
  }

  const subscriptions = [];
  let totalMonthlyCost = 0;

  const grouped = {};
  flagged.forEach(t => {
    if (!grouped[t.merchant]) {
      grouped[t.merchant] = { cost: t.amount, category: t.category, lastDetected: t.date };
    } else {
      if (t.date > grouped[t.merchant].lastDetected) {
        grouped[t.merchant].lastDetected = t.date;
      }
    }
  });

  Object.keys(grouped).forEach(m => {
    const cat = grouped[m].category;
    const isRecurringBill = ['Housing', 'Insurance', 'Education', 'Healthcare', 'Investments', 'Debt Service', 'Municipal', 'Utilities', 'Community & Family'].includes(cat);

    subscriptions.push({
      merchant: m,
      frequency: 'Monthly',
      estimatedCost: grouped[m].cost,
      category: cat,
      lastDetected: grouped[m].lastDetected,
      isRecurringBill
    });
    totalMonthlyCost += grouped[m].cost;
  });

  return { subscriptions, totalMonthlyCost };
};

const getMonthlySummary = async (userId, month) => {
  const startDate = new Date(`${month}-01T00:00:00Z`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const txs = await Transaction.find({ user: userId, date: { $gte: startDate, $lt: endDate } });

  let totalIncome = 0;
  let totalSpend = 0;
  const byCategory = {};
  const merchants = {};

  txs.forEach(t => {
    if (t.type === 'credit') {
      totalIncome += t.amount;
    } else {
      totalSpend += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      merchants[t.merchant] = (merchants[t.merchant] || 0) + t.amount;
    }
  });

  const topMerchants = Object.keys(merchants)
    .map(m => ({ merchant: m, amount: merchants[m] }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  return {
    totalIncome,
    totalSpend,
    netCashFlow: totalIncome - totalSpend,
    byCategory,
    topMerchants
  };
};

const getSAOverview = async (userId) => {
  const taxStart = getTaxYearStart();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const txs = await Transaction.find({ user: userId, date: { $gte: sixMonthsAgo } });

  let tfsaYTD = 0;
  let raYTD = 0;
  let stokvelMap = {};
  let loadshedResilienceScore = 0;

  const monthlyElectricity = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthlyElectricity[d.toISOString().slice(0, 7)] = 0;
  }

  txs.forEach(t => {
    if (t.date >= taxStart) {
      if (t.taxRelevant?.isTFSA && t.type === 'debit') tfsaYTD += t.amount;
      if (t.taxRelevant?.isRA && t.type === 'debit') raYTD += t.amount;

      const desc = t.description.toLowerCase();
      if (desc.includes('stokvel') || desc.includes('lekgotla') || desc.includes('investment group') || desc.includes('burial society')) {
        if (!stokvelMap[t.merchant]) stokvelMap[t.merchant] = 0;
        if (t.type === 'debit') {
          stokvelMap[t.merchant] += t.amount;
        }
      }
    }

    const monthKey = new Date(t.date).toISOString().slice(0, 7);
    if (monthlyElectricity[monthKey] !== undefined && t.type === 'debit') {
      const isElectricity = (t.category === 'Utilities' && (t.subCategory?.includes('Electricity') || t.subCategory?.includes('Prepaid'))) ||
        (t.merchant && (t.merchant.toUpperCase().includes('EASYPAY') || t.merchant.toUpperCase().includes('CITIQ'))) ||
        (/EASYPAY/i.test(t.description) || /PREPAID.*ELEC/i.test(t.description));

      if (isElectricity) {
        monthlyElectricity[monthKey] += t.amount;
      }
    }
  });

  const user = await User.findById(userId).select('monthlyIncome');
  const income = user?.monthlyIncome || 1;
  const lsScore = await calculateLoadSheddingScore(userId);
  const cwScore = await calculateCommunityWealthScore(userId);
  const colScore = await calculateCostOfLivingScore(userId, income);

  const electricityTrend = Object.keys(monthlyElectricity).map(month => ({
    name: month,
    amount: monthlyElectricity[month]
  })).sort((a, b) => a.name.localeCompare(b.name));

  let bestStokvel = null;
  let maxStokvelAmount = 0;
  Object.keys(stokvelMap).forEach(k => {
    if (stokvelMap[k] > maxStokvelAmount) {
      maxStokvelAmount = stokvelMap[k];
      bestStokvel = { name: k, amount: maxStokvelAmount / ((new Date().getMonth() - taxStart.getMonth() + 12) % 12 || 1) }; // avg per month since tax start
    }
  });

  return {
    tfsaYTD,
    tfsaRemaining: Math.max(0, SARS_CONFIG.TFSA_ANNUAL - tfsaYTD),
    raYTD,
    raLimit: SARS_CONFIG.RA_MAX_AMOUNT,
    electricityTrend,
    stokvel: bestStokvel,
    loadSheddingResilience: lsScore,
    communityWealth: cwScore,
    costOfLivingPressure: colScore
  };
};

const getHeatmap = async (userId, month) => {
  const startDate = new Date(`${month}-01T00:00:00Z`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const txs = await Transaction.find({ user: userId, type: 'debit', date: { $gte: startDate, $lt: endDate } });
  const map = {};

  txs.forEach(t => {
    const day = new Date(t.date).toISOString().split('T')[0];
    map[day] = (map[day] || 0) + t.amount;
  });

  return map;
};

const getForecast = async (userId) => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const txs = await Transaction.find({ user: userId, type: 'debit', date: { $gte: threeMonthsAgo } });
  const byCategory = {};

  txs.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const forecast = {};
  Object.keys(byCategory).forEach(c => {
    forecast[c] = byCategory[c] / 3;
  });

  return forecast;
};

module.exports = {
  getHealthScore,
  getFinancialPersonality,
  detectAnomalies,
  detectSubscriptions,
  getMonthlySummary,
  getSAOverview,
  getHeatmap,
  getForecast
};
