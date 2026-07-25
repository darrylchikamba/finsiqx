const { ontology } = require('./saOntology');
const axios = require('axios');

const classifyLocally = (description, type = 'debit') => {
  const descUpper = description.toUpperCase();

  const LS_RETAILERS = ['BUILDERS WAREHOUSE', 'GAME', 'MAKRO', 'LEROY MERLIN', 'CHAMBERLAINS'];
  const LS_KEYWORDS = ['INVERTER', 'SOLAR', 'BATTERY', 'GENERATOR', 'GAS CYLINDER'];

  if (LS_RETAILERS.some(r => descUpper.includes(r)) && LS_KEYWORDS.some(k => descUpper.includes(k))) {
    return {
      category: 'Load Shedding',
      subCategory: 'Backup Power',
      merchant: LS_RETAILERS.find(r => descUpper.includes(r)),
      classifiedBy: 'ontology',
      taxRelevant: { isRA: false, isTFSA: false, isMedicalAid: false, isDonation: false }
    };
  }

  let result = null;

  for (const group of ontology) {
    if (group.keywords && group.keywords.some(kw => descUpper.includes(kw))) {
      result = {
        category: group.category,
        subCategory: group.subCategory,
        merchant: group.keywords.find(kw => descUpper.includes(kw)),
        classifiedBy: 'ontology'
      };
      break;
    }
    if (group.regexes) {
      for (const rx of group.regexes) {
        if (rx.pattern.test(description)) {
          result = {
            category: group.category,
            subCategory: group.subCategory,
            merchant: rx.merchant,
            classifiedBy: 'ontology'
          };
          break;
        }
      }
      if (result) break;
    }
  }

  if (result && result.category === 'Community & Family' && result.subCategory === 'Support') {
    if (['STOKVEL', 'LEKGOTLA', 'INVESTMENT GROUP', 'BURIAL SOCIETY'].some(kw => descUpper.includes(kw))) {
      result.subCategory = 'Stokvel';
      result.merchant = description;
    }
  }

  if (result) {
    const isTFSA =
      result.subCategory === 'TFSA' ||
      result.subCategory === 'Investments/TFSA/RA' && ['EASYEQUITIES', 'SATRIX', 'SYGNIA'].includes(result.merchant?.toUpperCase()) ||
      descUpper.includes('TFSA') ||
      descUpper.includes('TAX FREE');

    const isRA =
      result.subCategory === 'Retirement Annuity' ||
      (result.subCategory === 'Investments/TFSA/RA' && ['ALLAN GRAY', 'CORONATION', 'NINETY ONE', 'OLD MUTUAL', 'SANLAM'].includes(result.merchant?.toUpperCase())) ||
      descUpper.includes('RETIREMENT ANNUITY') ||
      descUpper.includes('PROVIDENT FUND') ||
      descUpper.includes('PENSION FUND');

    result.taxRelevant = {
      isRA: !!isRA,
      isTFSA: !!isTFSA,
      isMedicalAid: result.subCategory === 'Medical Aid' && type === 'debit',
      isDonation: false
    };
  }

  return result;
};

const classifyBatchWithGemini = async (descriptions, recentHistory = []) => {
  if (descriptions.length === 0) return {};

  const MOCK_MODE = process.env.MOCK_AI === 'true' ||
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === 'not-yet-funded' ||
    process.env.GEMINI_API_KEY === '<user will paste their key>';

  if (MOCK_MODE) {
    console.log(`MOCK_AI active — skipping Gemini classification for ${descriptions.length} descriptions.`);
    const mockClassifications = {};
    descriptions.forEach(desc => {
      mockClassifications[desc] = {
        category: 'Uncategorized',
        subCategory: '',
        merchant: desc.substring(0, 30),
        classifiedBy: 'ontology',
        taxRelevant: { isRA: false, isTFSA: false, isMedicalAid: false, isDonation: false }
      };
    });
    return mockClassifications;
  }

  const prompt = `
You are an expert South African personal finance categorizer.
Classify the following array of transaction descriptions.
Available Primary Categories: Income, Deductions, Housing, Transport, Food & Groceries, Community & Family, Investments, Insurance, Education, Healthcare, Load Shedding, Utilities, Lifestyle, Debt Service, Cash, Municipal.
If category is Investments and merchant is EasyEquities, Satrix, or Sygnia, set taxRelevant.isTFSA to true.
If category is Investments and merchant is Allan Gray, Coronation, Ninety One, Old Mutual, or Sanlam, set taxRelevant.isRA to true.
Only set taxRelevant.isMedicalAid to true if the merchant is an actual Medical Aid provider (e.g. Discovery Health, Bonitas) and it is a debit. Do NOT flag pharmacies or short-term insurance.
Return a pure JSON object mapping the EXACT description string to its classification object:
{
  "description string here": {
    "category": "Primary Category",
    "subCategory": "Sub category name",
    "merchant": "Cleaned merchant name",
    "taxRelevant": { "isRA": false, "isTFSA": false, "isMedicalAid": false, "isDonation": false }
  }
}

Descriptions to classify:
${JSON.stringify(descriptions)}

Recent history:
${JSON.stringify(recentHistory)}
`;

  try {
    const message = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: {
          parts: [{ text: "You are a JSON-only bot. Always return pure JSON with NO markdown wrapping." }]
        },
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 4000
        }
      }
    );

    let rawOutput = message.data.candidates[0].content.parts[0].text;
    if (rawOutput.startsWith('\`\`\`json')) {
      rawOutput = rawOutput.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (rawOutput.startsWith('\`\`\`')) {
      rawOutput = rawOutput.replace(/\`\`\`/g, '').trim();
    }

    return JSON.parse(rawOutput);
  } catch (error) {
    console.error('Gemini API Error:', error?.response?.data || error);
    return {};
  }
};

module.exports = { classifyLocally, classifyBatchWithGemini };
