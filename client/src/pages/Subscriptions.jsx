import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import CategoryPill from '../components/CategoryPill';
import LoadingSpinner from '../components/LoadingSpinner';

const Subscriptions = () => {
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/subscriptions');
        setData(res.data);
        
        api.post('/ai/insights').then(aiRes => {
          if (aiRes.data && aiRes.data.length > 0) {
            setInsight(aiRes.data[0]);
          }
        }).catch(err => console.error("MALI error", err));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const subs = data?.subscriptions || [];
  const trueSubs = subs.filter(s => !s.isRecurringBill);
  const bills = subs.filter(s => s.isRecurringBill);
  
  const subsTotal = trueSubs.reduce((acc, s) => acc + s.estimatedCost, 0);
  const billsTotal = bills.reduce((acc, s) => acc + s.estimatedCost, 0);
  const total = data?.totalMonthlyCost || 0;

  const renderRow = (sub, i, arr) => (
    <div key={i} style={{ 
      display: 'grid', 
      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
      gap: '1rem', 
      alignItems: 'center', 
      padding: '1rem', 
      borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none'
    }}>
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{sub.merchant}</span>
      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{sub.frequency || 'Monthly'}</span>
      <span className="mono-text" style={{ fontSize: '14px' }}>R {sub.estimatedCost.toFixed(2)}</span>
      <CategoryPill category={sub.category} />
      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
        since {new Date(sub.lastDetected).toLocaleDateString('en-GB')}
      </span>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>Subscriptions</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 2rem 0', fontWeight: 400 }}>Recurring payments detected</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="section-label">TOTAL MONTHLY COMMITMENTS</div>
          <div className="mono-text" style={{ fontSize: '24px', color: 'var(--color-accent)' }}>R {total.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <h2 className="section-label">SUBSCRIPTIONS</h2>
          <div className="mono-text" style={{ fontSize: '16px', color: 'var(--color-text-primary)', textAlign: 'right' }}>R {subsTotal.toFixed(2)}</div>
        </div>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          {trueSubs.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>None detected</div>}
          {trueSubs.map((sub, i) => renderRow(sub, i, trueSubs))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <h2 className="section-label">RECURRING BILLS</h2>
          <div className="mono-text" style={{ fontSize: '16px', color: 'var(--color-text-primary)', textAlign: 'right' }}>R {billsTotal.toFixed(2)}</div>
        </div>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          {bills.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>None detected</div>}
          {bills.map((sub, i) => renderRow(sub, i, bills))}
        </div>
      </div>

      {insight && (
        <div style={{ borderLeft: '2px solid var(--color-accent)', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1.5rem' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 'bold', marginBottom: '8px' }}>
            MALI · {insight.type}
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{insight.message}</div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
