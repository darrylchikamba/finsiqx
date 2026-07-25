import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import AreaChart from '../components/charts/AreaChart';
import RadialGauge from '../components/charts/RadialGauge';
import MALIInsightCard from '../components/MALIInsightCard';

const SAOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/sa-overview');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const tfsaProgress = data?.tfsaYTD || 0;
  const tfsaLimit = 36000;
  const tfsaPercent = Math.min((tfsaProgress / tfsaLimit) * 100, 100);
  const tfsaColor = tfsaPercent > 90 ? 'var(--color-warning)' : 'var(--color-accent)';

  const raProgress = data?.raYTD || 0;
  
  return (
    <div>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>SA Overview</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 2rem 0', fontWeight: 400 }}>South African financial snapshot</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1.5rem' }}>
          <h2 className="section-label" style={{ marginBottom: '1rem' }}>TFSA Progress</h2>
          <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--color-canvas)', marginBottom: '0.5rem' }}>
            <div style={{ width: `${tfsaPercent}%`, height: '100%', backgroundColor: tfsaColor }}></div>
          </div>
          <div className="mono-text" style={{ fontSize: '14px' }}>
            R {tfsaProgress.toFixed(2)} of R {tfsaLimit.toFixed(2)} annual limit
          </div>
        </div>

        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1.5rem' }}>
          <h2 className="section-label" style={{ marginBottom: '1rem' }}>RA Contributions YTD</h2>
          <div className="mono-text" style={{ fontSize: '24px', color: 'var(--color-accent)' }}>
            R {raProgress.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            *Estimated based on detected 'Retirement Annuity' transactions
          </div>
        </div>
      </div>

      <MALIInsightCard type="SAOverview" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1.5rem' }}>
          <h2 className="section-label" style={{ marginBottom: '1rem' }}>Stokvel / Burial Society</h2>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '0.5rem' }}>{data?.stokvel?.name || 'No active stokvel detected'}</div>
          <div className="mono-text" style={{ fontSize: '20px', color: 'var(--color-accent)' }}>
            R {data?.stokvel?.amount?.toFixed(2) || '0.00'} / month
          </div>
        </div>

        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1.5rem' }}>
          <h2 className="section-label" style={{ marginBottom: '1rem' }}>Electricity & Load-Shedding Spend (6m)</h2>
          <div style={{ width: '100%', height: 200, minHeight: 200 }}>
            <AreaChart 
              data={data?.electricityTrend || []} 
              areas={[{ dataKey: 'amount', color: 'var(--color-accent)' }]} 
            />
          </div>
        </div>
      </div>

      <h2 className="section-label" style={{ marginBottom: '1rem' }}>Resilience & Pressure Metrics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <RadialGauge value={data?.loadSheddingResilience || 0} label="Load-Shedding Resilience" />
        </div>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <RadialGauge value={data?.communityWealth || 0} label="Community Wealth" />
        </div>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <RadialGauge value={data?.costOfLivingPressure || 0} label="Cost-of-Living Pressure" color="var(--color-warning)" />
        </div>
      </div>
    </div>
  );
};

export default SAOverview;
