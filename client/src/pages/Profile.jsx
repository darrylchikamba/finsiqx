import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import HealthScoreDial from '../components/HealthScoreDial';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastNotification from '../components/ToastNotification';

const Profile = () => {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [personality, setPersonality] = useState('Unknown');
  const [loading, setLoading] = useState(true);

  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};
  const [monthlyIncome, setMonthlyIncome] = useState(userInfo.monthlyIncome || 0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, persRes] = await Promise.all([
          api.get('/analytics/health-score'),
          api.get('/analytics/personality')
        ]);
        setHealth(healthRes.data);
        setPersonality(persRes.data.personality);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateIncome = async () => {
    try {
      const { data } = await api.put('/users/profile', { monthlyIncome });
      const updatedUserInfo = { ...userInfo, monthlyIncome: data.monthlyIncome };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setToast({ message: 'Profile updated. Health score recalculated.', type: 'success' });

      // Refresh health score using the newly returned value or fetching again
      const healthRes = await api.get('/analytics/health-score');
      setHealth(healthRes.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to update profile', type: 'error' });
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>Profile</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 2rem 0', fontWeight: 400 }}>Account, health score and financial personality</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '2rem' }}>
          <HealthScoreDial score={health?.score || 0} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
            <div className="section-label">Tax Efficiency</div>
            <div className="mono-text" style={{ fontSize: '24px', marginTop: '0.5rem', color: 'var(--color-accent)' }}>{health?.breakdown?.taxEfficiency?.toFixed(0) || 0}%</div>
          </div>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <div className="section-label">Load-Shedding Resilience</div>
            <div className="mono-text" style={{ fontSize: '24px', marginTop: '0.5rem', color: 'var(--color-accent)' }}>{health?.breakdown?.loadSheddingResilience?.toFixed(0) || 0}%</div>
          </div>
          <div style={{ padding: '1.5rem', borderRight: '1px solid var(--color-border)' }}>
            <div className="section-label">Community Wealth</div>
            <div className="mono-text" style={{ fontSize: '24px', marginTop: '0.5rem', color: 'var(--color-accent)' }}>{health?.breakdown?.communityWealth?.toFixed(0) || 0}%</div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div className="section-label">Cost-of-Living Pressure</div>
            <div className="mono-text" style={{ fontSize: '24px', marginTop: '0.5rem', color: 'var(--color-warning)' }}>{health?.breakdown?.costOfLivingPressure?.toFixed(0) || 0}%</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 className="section-label" style={{ marginBottom: '1rem' }}>Financial Personality</h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--color-accent)', backgroundColor: 'rgba(0, 229, 195, 0.05)', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '14px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }}></div>
          {personality}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '1.5rem' }}>
          <h2 className="section-label" style={{ marginBottom: '1.5rem' }}>Account Details</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
            <input type="text" value={userInfo.username} disabled style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input type="email" value={userInfo.email} disabled style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Monthly Take-home Income (R)</label>
            <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} className="mono-text" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
          </div>
          <button onClick={handleUpdateIncome} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', fontWeight: 'bold', cursor: 'pointer' }}>Update Profile</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <button onClick={handleSignOut} style={{ padding: '0.75rem 2rem', backgroundColor: 'transparent', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', fontWeight: 'bold', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Profile;
