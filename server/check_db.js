const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

mongoose.connect('mongodb://127.0.0.1:27017/finsiqx_dev')
  .then(async () => {
    const txs = await Transaction.find({});
    console.log(`Total DB transactions: ${txs.length}`);
    const debits = txs.filter(t => t.type === 'debit');
    const credits = txs.filter(t => t.type === 'credit');
    console.log(`Debits: ${debits.length}, Credits: ${credits.length}`);
    if (debits.length > 0) {
      console.log('Sample debit date:', debits[0].date);
      console.log('Sample debit amount:', debits[0].amount);
    }
    const amountsType = typeof txs[0]?.amount;
    console.log('Amount type:', amountsType, 'Value:', txs[0]?.amount);
    process.exit(0);
  });
