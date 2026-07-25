import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import CategoryPill from '../components/CategoryPill';
import LoadingSpinner from '../components/LoadingSpinner';

const TaxSnapshot = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month < 2 ? year - 1 : year;
  const endYear = startYear + 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/transactions?taxRelevant=true&limit=1000');
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  let raTotal = 0;
  let tfsaTotal = 0;
  let medicalTotal = 0;
  let donationTotal = 0;

  transactions.forEach(tx => {
    if (tx.taxRelevant?.isRA) raTotal += tx.amount;
    if (tx.taxRelevant?.isTFSA) tfsaTotal += tx.amount;
    if (tx.taxRelevant?.isMedicalAid) medicalTotal += tx.amount;
    if (tx.taxRelevant?.isDonation) donationTotal += tx.amount;
  });

  return (
    <div>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>Tax Snapshot</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 2rem 0', fontWeight: 400 }}>Tax-relevant transaction summary</p>
      </div>
      <div style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Tax year: March {startYear} – February {endYear}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', borderRight: '1px solid var(--color-border)' }}>
          <div className="section-label">RA Total</div>
          <div className="mono-text" style={{ fontSize: '20px', marginTop: '0.5rem', color: 'var(--color-accent)' }}>R {raTotal.toFixed(2)}</div>
        </div>
        <div style={{ padding: '1.5rem', borderRight: '1px solid var(--color-border)' }}>
          <div className="section-label">TFSA Total</div>
          <div className="mono-text" style={{ fontSize: '20px', marginTop: '0.5rem', color: 'var(--color-accent)' }}>R {tfsaTotal.toFixed(2)}</div>
        </div>
        <div style={{ padding: '1.5rem', borderRight: '1px solid var(--color-border)' }}>
          <div className="section-label">Medical Aid</div>
          <div className="mono-text" style={{ fontSize: '20px', marginTop: '0.5rem', color: 'var(--color-accent)' }}>R {medicalTotal.toFixed(2)}</div>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div className="section-label">Donations</div>
          <div className="mono-text" style={{ fontSize: '20px', marginTop: '0.5rem', color: 'var(--color-accent)' }}>R {donationTotal.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ borderLeft: '2px solid var(--color-warning)', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-warning)', fontWeight: 'bold', marginBottom: '8px' }}>
          MALI · Disclaimer
        </div>
        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
          These figures are for your reference only. Consult a registered tax practitioner for formal submissions.
        </div>
      </div>

      <h2 className="section-label" style={{ marginBottom: '1rem' }}>Transaction List</h2>
      <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        {transactions.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No tax-relevant transactions found for this period.</div>}
        {transactions.map((tx, i) => (
          <div key={tx._id} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 2fr 1fr', gap: '1rem', alignItems: 'center', padding: '1rem', borderBottom: i < transactions.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{new Date(tx.date).toLocaleDateString('en-GB')}</span>
            <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.merchant || tx.description}</span>
            <div>
              {tx.taxRelevant?.isRA && <CategoryPill category="Retirement Annuity" />}
              {tx.taxRelevant?.isTFSA && <CategoryPill category="TFSA" />}
              {tx.taxRelevant?.isMedicalAid && <CategoryPill category="Healthcare" />}
              {tx.taxRelevant?.isDonation && <CategoryPill category="Donation" />}
            </div>
            <span className="mono-text" style={{ fontSize: '14px', textAlign: 'right' }}>R {tx.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxSnapshot;
