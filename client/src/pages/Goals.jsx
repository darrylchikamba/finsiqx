import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState({ name: '', type: 'savings', targetAmount: 0, currentAmount: 0, targetDate: '' });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/goals');
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSave = async () => {
    try {
      if (currentGoal._id) {
        await api.put(`/goals/${currentGoal._id}`, currentGoal);
      } else {
        await api.post('/goals', currentGoal);
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (goal = { name: '', type: 'savings', targetAmount: 0, currentAmount: 0, targetDate: '' }) => {
    setCurrentGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async () => {
    try {
      await api.delete(`/goals/${confirmDelete.id}`);
      setConfirmDelete({ isOpen: false, id: null });
      fetchGoals();
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>Goals</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 2rem 0', fontWeight: 400 }}>Savings targets and progress</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-accent)', border: '1px solid var(--color-accent)', fontWeight: 'bold' }}
        >
          Add Goal
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {goals.map(g => {
          const percent = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
          return (
            <div key={g._id} style={{ 
              border: '1px solid var(--color-border)', 
              backgroundColor: 'var(--color-surface)', 
              padding: '1.5rem',
              opacity: g.isComplete ? 0.5 : 1,
              position: 'relative'
            }}>
              {g.isComplete && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-accent)' }}>
                  ✓ Completed
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{g.name}</h3>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', padding: '2px 6px', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)' }}>
                  {g.type}
                </span>
              </div>
              
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-canvas)', marginBottom: '0.5rem' }}>
                <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--color-accent)' }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono-text" style={{ fontSize: '14px' }}>
                  R {g.currentAmount.toFixed(2)} of R {g.targetAmount.toFixed(2)}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Target: {new Date(g.targetDate).toLocaleDateString('en-GB')}
                </span>
              </div>

              {!g.isComplete && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px dashed var(--color-border)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Projected: <span className="mono-text" style={{ color: 'var(--color-text-primary)' }}>
                      {(() => {
                        if (g.currentAmount <= 0) return 'Add funds to see projection';
                        const created = new Date(g.createdAt || Date.now());
                        const monthsPassed = Math.max(1, (new Date() - created) / (1000 * 60 * 60 * 24 * 30.44));
                        const avgMonthly = g.currentAmount / monthsPassed;
                        const monthsLeft = (g.targetAmount - g.currentAmount) / avgMonthly;
                        
                        if (monthsLeft <= 0) return 'Completed';
                        if (monthsLeft > 1200) return '100+ years';
                        
                        const projDate = new Date();
                        projDate.setMonth(projDate.getMonth() + monthsLeft);
                        return projDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                      })()}
                    </span>
                  </div>
                </div>
              )}
              
              {!g.isComplete && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => openModal(g)}
                    style={{ marginTop: '1rem', padding: '0.25rem 0', backgroundColor: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Edit Goal
                  </button>
                  <button 
                    onClick={() => setConfirmDelete({ isOpen: true, id: g._id })}
                    style={{ marginTop: '1rem', padding: '0.25rem 0', backgroundColor: 'transparent', border: 'none', color: 'var(--color-danger)', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {goals.length === 0 && <div style={{ color: 'var(--color-text-secondary)', gridColumn: 'span 2' }}>No goals defined yet.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentGoal._id ? 'Edit Goal' : 'Add Goal'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
            <input 
              type="text" 
              value={currentGoal.name} 
              onChange={e => setCurrentGoal({...currentGoal, name: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
            <select 
              value={currentGoal.type} 
              onChange={e => setCurrentGoal({...currentGoal, type: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="savings">Savings</option>
              <option value="debtPayoff">Debt Payoff</option>
              <option value="emergency">Emergency</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Target Amount (R)</label>
              <input 
                type="number" 
                value={currentGoal.targetAmount} 
                onChange={e => setCurrentGoal({...currentGoal, targetAmount: Number(e.target.value)})}
                className="mono-text"
                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Current Amount (R)</label>
              <input 
                type="number" 
                value={currentGoal.currentAmount} 
                onChange={e => setCurrentGoal({...currentGoal, currentAmount: Number(e.target.value)})}
                className="mono-text"
                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Target Date</label>
            <input 
              type="date" 
              value={currentGoal.targetDate ? new Date(currentGoal.targetDate).toISOString().split('T')[0] : ''} 
              onChange={e => setCurrentGoal({...currentGoal, targetDate: e.target.value})}
              className="mono-text"
              style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>
        <button onClick={handleSave} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-accent)', color: '#020f0d', fontWeight: 'bold', border: 'none' }}>
          {currentGoal._id ? 'Update Goal' : 'Create Goal'}
        </button>
      </Modal>

      <ConfirmDialog 
        isOpen={confirmDelete.isOpen}
        title="Delete goal?"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteGoal}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Goals;
