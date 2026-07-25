import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';

const Simulator = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reductionPct, setReductionPct] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let month = new Date().toISOString().slice(0, 7);
        let res = await api.get(`/analytics/summary?month=${month}`);
        
        if (res.data.totalIncome === 0 && res.data.totalSpend === 0) {
          const prevDate = new Date();
          prevDate.setMonth(prevDate.getMonth() - 1);
          month = prevDate.toISOString().slice(0, 7);
          res = await api.get(`/analytics/summary?month=${month}`);
        }
        
        const data = res.data;
        setSummary(data);
        if (Object.keys(data.byCategory).length > 0) {
          setSelectedCategory(Object.keys(data.byCategory)[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const categorySpend = summary?.byCategory[selectedCategory] || 0;
  const monthlySaving = (categorySpend * reductionPct) / 100;
  const annualSaving = monthlySaving * 12;

  const categories = Object.keys(summary?.byCategory || {});

  if (categories.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        No spending data available for this month. Please import transactions first.
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>Simulator</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 2rem 0', fontWeight: 400 }}>Model the impact of spending changes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} (R {summary.byCategory[cat].toFixed(2)})</option>
              ))}
            </select>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="section-label">Reduction Target</label>
              <span className="mono-text" style={{ color: 'var(--color-accent)' }}>{reductionPct}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="50" 
              step="5" 
              value={reductionPct} 
              onChange={e => setReductionPct(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-accent)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: '0', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label">Monthly saving</span>
            <span className="mono-text" style={{ fontSize: '20px', color: 'var(--color-accent)' }}>R {monthlySaving.toFixed(2)}</span>
          </div>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label">Annual saving</span>
            <span className="mono-text" style={{ fontSize: '20px', color: 'var(--color-accent)' }}>R {annualSaving.toFixed(2)}</span>
          </div>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label">Goal impact</span>
            <span className="mono-text" style={{ fontSize: '20px', color: 'var(--color-accent)' }}>+ {reductionPct > 0 ? (annualSaving / 1200).toFixed(1) : '0'}%</span>
          </div>
        </div>
      </div>

      {monthlySaving > 0 && (
        <div style={{ borderLeft: '2px solid var(--color-accent)', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1.5rem' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 'bold', marginBottom: '8px' }}>
            MALI · Simulation Note
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            Redirecting R {monthlySaving.toFixed(2)} monthly from {selectedCategory} into a high-yield account or debt servicing can dramatically accelerate your financial goals.
          </div>
        </div>
      )}
    </div>
  );
};

export default Simulator;
