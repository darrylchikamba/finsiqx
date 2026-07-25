import React, { useState, useEffect } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../api/axiosConfig';
import BarChart from '../components/charts/BarChart';
import HeatmapCalendar from '../components/charts/HeatmapCalendar';
import LoadingSpinner from '../components/LoadingSpinner';
import MALIInsightCard from '../components/MALIInsightCard';

const Analytics = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let currentMonth = month;
        let [sumRes, heatRes] = await Promise.all([
          api.get(`/analytics/summary?month=${currentMonth}`),
          api.get(`/analytics/heatmap?month=${currentMonth}`)
        ]);

        if (isInitialLoad && sumRes.data.totalIncome === 0 && sumRes.data.totalSpend === 0) {
          const prevDate = new Date(`${currentMonth}-01T00:00:00Z`);
          prevDate.setMonth(prevDate.getMonth() - 1);
          currentMonth = prevDate.toISOString().slice(0, 7);
          const [newSumRes, newHeatRes] = await Promise.all([
            api.get(`/analytics/summary?month=${currentMonth}`),
            api.get(`/analytics/heatmap?month=${currentMonth}`)
          ]);
          sumRes = newSumRes;
          heatRes = newHeatRes;
          setMonth(currentMonth);
        }

        setIsInitialLoad(false);
        setSummary(sumRes.data);
        setHeatmap(heatRes.data);

        // Fetch real 6-month trend data
        const trend = [];
        const base = new Date(`${currentMonth}-01T00:00:00Z`);
        for (let i = 5; i >= 0; i--) {
          const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleString('en-GB', { month: 'short' });
          try {
            const r = await api.get(`/analytics/summary?month=${key}`);
            const inc = r.data.totalIncome || 0;
            const spd = r.data.totalSpend || 0;
            trend.push({ name: label, income: inc, spend: spd, net: inc - spd });
          } catch {
            trend.push({ name: label, income: 0, spend: 0, net: 0 });
          }
        }
        setTrendData(trend);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  if (loading) return <LoadingSpinner fullScreen />;

  const categoryData = summary
    ? Object.keys(summary.byCategory).map(cat => ({
      name: cat,
      amount: summary.byCategory[cat]
    })).sort((a, b) => b.amount - a.amount)
    : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>Analytics</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 0 0', fontWeight: 400 }}>Spending patterns and trends</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mono-text"
          style={{ padding: '0.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* Monthly Trend — ComposedChart */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          {[
            { label: 'Income', color: '#00E5C3' },
            { label: 'Spend', color: '#E0A64B' },
            { label: 'Net', color: '#f4f4f2' }
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1rem' }}>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#9a9a96' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9a9a96' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={val => val >= 1000 ? 'R' + Math.round(val / 1000) + 'k' : 'R' + val}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '0.5px solid var(--color-border)',
                    borderRadius: 0,
                    fontSize: 12
                  }}
                  formatter={(val, name) => [
                    `R ${Number(val).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Area type="monotone" dataKey="income" stroke="#00E5C3" strokeWidth={1.5} fill="rgba(0,229,195,0.08)" dot={false} />
                <Area type="monotone" dataKey="spend" stroke="#E0A64B" strokeWidth={1.5} fill="rgba(224,166,75,0.08)" dot={false} />
                <Line type="monotone" dataKey="net" stroke="#f4f4f2" strokeWidth={1} strokeDasharray="4 2" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <MALIInsightCard type="Analytics" />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
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
          <h2 className="section-label" style={{ marginBottom: '1rem' }}>Merchant Top 10</h2>
          <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            {summary?.topMerchants.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: i < 9 ? '1px solid var(--color-border)' : 'none' }}>
                <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i + 1}. {m.merchant}</span>
                <span className="mono-text" style={{ fontSize: '14px' }}>R {m.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 className="section-label" style={{ marginBottom: '1rem' }}>Spending Heatmap</h2>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1.5rem' }}>
          <HeatmapCalendar data={heatmap} month={month} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;