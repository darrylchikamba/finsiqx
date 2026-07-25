import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import BarChart from '../components/charts/BarChart';
import CategoryPill from '../components/CategoryPill';
import LoadingSpinner from '../components/LoadingSpinner';
import MALIInsightCard from '../components/MALIInsightCard';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);
  const [recentTxs, setRecentTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayMonth, setDisplayMonth] = useState(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : 'afternoon';
  const username = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).username : 'User';

  useEffect(() => {
    const fetchData = async () => {
      try {
        let month = new Date().toISOString().slice(0, 7);
        let [sumRes, healthRes, txRes] = await Promise.all([
          api.get(`/analytics/summary?month=${month}`),
          api.get('/analytics/health-score'),
          api.get('/transactions?limit=5')
        ]);

        if (sumRes.data.totalIncome === 0 && sumRes.data.totalSpend === 0) {
          const prevDate = new Date();
          prevDate.setMonth(prevDate.getMonth() - 1);
          month = prevDate.toISOString().slice(0, 7);
          const prevRes = await api.get(`/analytics/summary?month=${month}`);
          sumRes = prevRes;
        }

        setDisplayMonth(month);

        setSummary(sumRes.data);
        setHealth(healthRes.data);
        setRecentTxs(txRes.data.transactions);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const categoryData = summary ? Object.keys(summary.byCategory).map(cat => ({
    name: cat,
    amount: summary.byCategory[cat]
  })).sort((a, b) => b.amount - a.amount).slice(0, 5) : [];

  const displayDateStr = displayMonth ? new Date(displayMonth + '-01T00:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '';

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>Dashboard</h1>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 2rem 0', fontWeight: 400 }}>
        Financial overview &middot; {displayDateStr}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', borderRight: '1px solid var(--color-border)' }}>
          <div className="section-label">Total Income</div>
          <div className="mono-text" style={{ fontSize: '24px', marginTop: '0.5rem' }}>R {(summary?.totalIncome || 0).toFixed(2)}</div>
        </div>
        <div style={{ padding: '1.5rem', borderRight: '1px solid var(--color-border)' }}>
          <div className="section-label">Total Spend</div>
          <div className="mono-text" style={{ fontSize: '24px', marginTop: '0.5rem' }}>R {(summary?.totalSpend || 0).toFixed(2)}</div>
        </div>
        <div style={{ padding: '1.5rem', borderRight: '1px solid var(--color-border)' }}>
          <div className="section-label">Net Cash Flow</div>
          <div className="mono-text" style={{ fontSize: '24px', marginTop: '0.5rem', color: (summary?.netCashFlow >= 0) ? 'var(--color-accent)' : 'var(--color-danger)' }}>
            {(summary?.netCashFlow >= 0) ? '+' : '-'}R {Math.abs(summary?.netCashFlow || 0).toFixed(2)}
          </div>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div className="section-label">Health Score</div>
          <div className="mono-text" style={{ fontSize: '24px', marginTop: '0.5rem', color: 'var(--color-accent)' }}>
            {health?.score || 0}/100
          </div>
        </div>
      </div>

      <MALIInsightCard type="Dashboard" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h2 className="section-label" style={{ marginBottom: '1rem' }}>Spending by Category</h2>
          <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1rem' }}>
            <BarChart
              data={categoryData}
              xDataKey="name"
              layout="vertical"
              bars={[{ dataKey: 'amount', color: 'var(--color-accent)' }]}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-label" style={{ margin: 0 }}>Recent Transactions</h2>
            <Link to="/transactions" style={{ fontSize: '12px', color: 'var(--color-accent)', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            {recentTxs.map((tx, i) => (
              <div key={tx._id} style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: i < recentTxs.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' }}>
                  {tx.merchant || tx.description}
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    {new Date(tx.date).toLocaleDateString('en-GB')}
                  </div>
                </div>
                <div style={{ margin: '0 1rem' }}>
                  <CategoryPill category={tx.category} />
                </div>
                <div className="mono-text" style={{ fontSize: '14px', color: tx.type === 'debit' ? 'var(--color-text-primary)' : 'var(--color-accent)' }}>
                  {tx.type === 'debit' ? '-' : '+'}R {tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
