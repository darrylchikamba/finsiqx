const SARS_CONFIG = {
  TFSA_ANNUAL: 36000,
  TFSA_LIFETIME: 500000,
  RA_MAX_PERCENT: 27.5,
  RA_MAX_AMOUNT: 350000,
  TAX_YEAR_START_MONTH: 3
};

const ontology = [
  {
    category: 'Income',
    subCategory: 'Stokvel Payout',
    keywords: ['STOKVEL PAYOUT']
  },
  {
    category: 'Income',
    subCategory: 'Salary',
    keywords: ['SALARY', 'COMMISSION PAYOUT', 'COMMISSION', 'WAGE', 'WAGES', 'PAY DAY', 'PAYDAY', 'NETT PAY', 'NET SALARY', 'MONTHLY PAY']
  },
  {
    category: 'Transport',
    subCategory: 'Fuel',
    keywords: ['ENGEN', 'SASOL', 'SHELL', 'BP', 'TOTALENERGIES', 'CALTEX']
  },
  {
    category: 'Cash',
    subCategory: 'Transfers',
    keywords: ['SHOPRITE MONEY'],
    regexes: [{ pattern: /CASHSEND/i, merchant: 'CashSend' }, { pattern: /EWALLET/i, merchant: 'eWallet' }, { pattern: /MUKURU/i, merchant: 'Mukuru' }]
  },
  {
    category: 'Cash',
    subCategory: 'ATM',
    keywords: [],
    regexes: [{ pattern: /ATM WITHDRAWAL/i, merchant: 'ATM Withdrawal' }]
  },
  {
    category: 'Utilities',
    subCategory: 'Electricity',
    keywords: ['CITIQ', 'FNB', 'STANDARD BANK'],
    regexes: [{ pattern: /EASYPAY\s*\d+/i, merchant: 'EasyPay' }, { pattern: /PREPAID.?ELEC/i, merchant: 'Prepaid Electricity' }, { pattern: /ELECTRICITY.?TOKEN/i, merchant: 'Electricity Token' }]
  },
  {
    category: 'Investments',
    subCategory: 'Investments/TFSA/RA',
    keywords: ['EASYEQUITIES', 'SATRIX', 'ALLAN GRAY', 'CORONATION', 'NINETY ONE', 'OLD MUTUAL', 'SANLAM', 'SYGNIA']
  },
  {
    category: 'Healthcare',
    subCategory: 'Medical Aid',
    keywords: ['DISCOVERY HEALTH', 'BONITAS', 'MOMENTUM HEALTH', 'FEDHEALTH', 'MEDIHELP', 'BESTMED', 'GEMS']
  },
  {
    category: 'Insurance',
    subCategory: 'Insurance',
    keywords: ['DISCOVERY INSURE', 'OUTSURANCE', 'SANTAM', 'MIWAY', 'KING PRICE', 'HOLLARD', 'DISCOVERY LIFE', 'OLD MUTUAL LIFE', 'SANLAM LIFE', 'MOMENTUM LIFE', 'ASSUPOL'],
    regexes: [{ pattern: /FUNERAL/i, merchant: 'Funeral Policy' }, { pattern: /BURIAL POLICY/i, merchant: 'Burial Policy' }]
  },

  {
    category: 'Housing',
    subCategory: 'Rent/Bond',
    keywords: ['RENT TRANSFER', 'RENT PAYMENT', 'RENTAL', 'BOND PAYMENT', 'HOME LOAN', 'MORTGAGE']
  },
  {
    category: 'Municipal',
    subCategory: 'Municipal Rates',
    keywords: [],
    regexes: [
      { pattern: /COJ\s/i, merchant: 'City of Johannesburg' }, 
      { pattern: /CITY OF JOHANNESBURG/i, merchant: 'City of Johannesburg' }, 
      { pattern: /TSHWANE\s/i, merchant: 'City of Tshwane' }, 
      { pattern: /CITY OF TSHWANE/i, merchant: 'City of Tshwane' }, 
      { pattern: /EKURHULENI\s/i, merchant: 'Ekurhuleni Municipality' }, 
      { pattern: /EKURHULENI METRO/i, merchant: 'Ekurhuleni Municipality' }, 
      { pattern: /ETHEKWINI\s/i, merchant: 'eThekwini Municipality' }, 
      { pattern: /CTCC/i, merchant: 'City of Cape Town' }, 
      { pattern: /CITY OF CAPE TOWN/i, merchant: 'City of Cape Town' }, 
      { pattern: /MANGAUNG/i, merchant: 'Mangaung Municipality' }, 
      { pattern: /BUFFALO CITY/i, merchant: 'Buffalo City' }, 
      { pattern: /NELSON MANDELA BAY/i, merchant: 'Nelson Mandela Bay' }
    ]
  },
  {
    category: 'Transport',
    subCategory: 'Public Transport',
    keywords: ['GAUTRAIN', 'MYCITI', 'REA VAYA', 'PRASA']
  },
  {
    category: 'Transport',
    subCategory: 'Rideshare',
    keywords: ['BOLT', 'INDRIVER'],
    regexes: [{ pattern: /UBER TRIP/i, merchant: 'Uber' }, { pattern: /UBER\s/i, merchant: 'Uber' }]
  },
  {
    category: 'Education',
    subCategory: 'Schools/Tuition',
    keywords: ['CURRO', 'ADVTECH', 'CRAWFORD'],
    regexes: [
      { pattern: /SCHOOL FEES/i, merchant: 'School Fees' }, 
      { pattern: /TUITION/i, merchant: 'Tuition' }, 
      { pattern: /UNIVERSITY OF/i, merchant: 'University' }, 
      { pattern: /UNISA/i, merchant: 'UNISA' }, 
      { pattern: /CRECHE/i, merchant: 'Creche' }
    ]
  },
  {
    category: 'Housing',
    subCategory: 'Security',
    keywords: ['ADT', 'FIDELITY', 'CHUBB'],
    regexes: [{ pattern: /ARMED RESPONSE/i, merchant: 'Armed Response' }]
  },
  {
    category: 'Lifestyle',
    subCategory: 'Betting/Lotto',
    keywords: ['HOLLYWOODBETS', 'BETWAY'],
    regexes: [{ pattern: /LOTTO/i, merchant: 'National Lottery' }, { pattern: /NATIONAL LOTTERY/i, merchant: 'National Lottery' }]
  },
  {
    category: 'Lifestyle',
    subCategory: 'Shopping',
    keywords: ['MAKRO', 'BUILDERS WAREHOUSE', 'GAME STORES', 'LEROY MERLIN', 'CHAMBERLAINS', 'TAKEALOT', 'SUPERBALIST', 'ZANDO', 'INCREDIBLE CONNECTION', 'HI-FI CORP', 'GAME', 'AMAZON']
  },
  {
    category: 'Load Shedding',
    subCategory: 'Load Shedding/Hardware',
    keywords: ['INVERTER', 'SOLAR', 'BATTERY', 'GENERATOR']
  },
  {
    category: 'Utilities',
    subCategory: 'Telecoms',
    keywords: ['VODACOM', 'WEBAFRICA', 'TELKOM', 'MTN', 'CELL C', 'RAIN', 'AFRIHOST', 'VOX TELECOM', 'CYBERSMART']
  },
  {
    category: 'Community & Family',
    subCategory: 'Support',
    keywords: ['AVBOB', 'STOKVEL', 'LEKGOTLA', 'INVESTMENT GROUP', 'BURIAL SOCIETY']
  },
  {
    category: 'Healthcare',
    subCategory: 'Medical',
    keywords: ['NETCARE', 'LIFE HEALTHCARE', 'MEDICLINIC', 'CLICKS PHARMACY', 'DISCHEM', 'DIS-CHEM']
  },
  {
    category: 'Lifestyle',
    subCategory: 'Fitness',
    keywords: ['PLANET FITNESS', 'VIRGIN ACTIVE', 'ANYTIME FITNESS']
  },
  {
    category: 'Lifestyle',
    subCategory: 'Clothing',
    keywords: ['EDGARS', 'MR PRICE', 'TRUWORTHS', 'FOSCHINI', 'MARKHAM', 'MILADYS', 'ACKERMANS']
  },
  {
    category: 'Food & Groceries',
    subCategory: 'Supermarkets',
    keywords: ['WOOLWORTHS', 'PICK N PAY', 'CHECKERS', 'SHOPRITE', 'SPAR', "FOOD LOVER'S MARKET"]
  },
  {
    category: 'Food & Groceries',
    subCategory: 'Takeaways',
    keywords: ['KFC', 'STEERS', "NANDO'S", 'WIMPY', 'DEBONAIRS', "MCDONALD'S", 'BURGER KING', 'ROMANS PIZZA', 'CHICKEN LICKEN']
  },
  {
    category: 'Lifestyle',
    subCategory: 'Subscriptions',
    keywords: ['NETFLIX', 'SHOWMAX', 'DSTV', 'SPOTIFY', 'APPLE', 'AMAZON PRIME']
  }
];

module.exports = { SARS_CONFIG, ontology };
