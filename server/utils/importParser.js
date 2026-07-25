const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');

const parseImportBuffer = (buffer, mimetype) => {
  let rows = [];

  if (mimetype === 'text/csv') {
    const records = parse(buffer, {
      columns: false,
      skip_empty_lines: true
    });
    rows = records;
  } else {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  }

  const normalized = [];
  if (rows.length === 0) return normalized;

  let headerIndex = 0;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const rowStr = rows[i].join(' ').toLowerCase();
    if (rowStr.includes('date') || rowStr.includes('amount') || rowStr.includes('description') || rowStr.includes('narrative')) {
      headerIndex = i;
      break;
    }
  }

  const headers = rows[headerIndex].map(h => String(h || '').toLowerCase());
  
  let dateIdx = headers.findIndex(h => h.includes('date'));
  let descIdx = headers.findIndex(h => h.includes('description') || h.includes('narrative') || h.includes('reference'));
  let debitIdx = headers.findIndex(h => h.includes('debit') || h.includes('money out') || h.includes('paid out') || h.includes('withdrawal'));
  let creditIdx = headers.findIndex(h => h.includes('credit') || h.includes('money in') || h.includes('paid in') || h.includes('deposit'));
  let amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('value'));
  let typeIdx = headers.findIndex(h => h === 'type' || h === 'transaction type');
  
  if (dateIdx === -1 || descIdx === -1 || (amountIdx === -1 && debitIdx === -1 && creditIdx === -1)) {
     const dataRow = rows[headerIndex + 1] || rows[0];
     for (let j = 0; j < dataRow.length; j++) {
       const val = String(dataRow[j] || '');
       if (dateIdx === -1 && (val.match(/\d{4}-\d{2}-\d{2}/) || val.match(/\d{2}\/\d{2}\/\d{4}/))) dateIdx = j;
       else if (amountIdx === -1 && !isNaN(parseFloat(val)) && val.match(/\d/)) amountIdx = j;
       else if (descIdx === -1 && isNaN(parseFloat(val)) && val.length > 3) descIdx = j;
     }
  }

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const dateStr = row[dateIdx];
    const descStr = String(row[descIdx] || '').trim();
    let amtVal = NaN;
    let type = 'debit';
    
    if (debitIdx !== -1 || creditIdx !== -1) {
      let dVal = debitIdx !== -1 ? parseFloat(String(row[debitIdx] || '').replace(/,/g, '')) : NaN;
      let cVal = creditIdx !== -1 ? parseFloat(String(row[creditIdx] || '').replace(/,/g, '')) : NaN;
      
      if (!isNaN(dVal) && dVal !== 0) {
        amtVal = Math.abs(dVal);
        type = 'debit';
      } else if (!isNaN(cVal) && cVal !== 0) {
        amtVal = Math.abs(cVal);
        type = 'credit';
      }
    } else if (amountIdx !== -1) {
      let amtStr = String(row[amountIdx] || '').replace(/,/g, '').trim();
      amtVal = parseFloat(amtStr);
      if (typeIdx !== -1 && row[typeIdx]) {
        const t = String(row[typeIdx]).toLowerCase().trim();
        if (t === 'debit' || t === 'credit') {
          type = t;
        } else {
          type = 'debit';
        }
      } else {
        type = amtVal < 0 ? 'debit' : 'credit';
      }
    }

    if (dateStr && descStr && !isNaN(amtVal)) {
      normalized.push({
        date: new Date(dateStr),
        description: descStr,
        amount: Math.abs(amtVal),
        type: type
      });
    }
  }

  console.log('--- CSV PARSE DEBUG: FIRST 3 ROWS ---');
  normalized.slice(0, 3).forEach((r, i) => {
    console.log(`Row ${i + 1}: Date=${r.date.toISOString().split('T')[0]}, Desc="${r.description}", Amount=${r.amount}, Type=${r.type}`);
  });
  console.log('---------------------------------------');

  return normalized;
};

module.exports = { parseImportBuffer };
