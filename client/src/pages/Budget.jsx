import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import MALIInsightCard from '../components/MALIInsightCard';

const Budget = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategories, setEditCategories] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, index: null });

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/budgets/${month}`);
      setBudget(data);
      setEditCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [month]);

  const handleSave = async () => {
    try {
      await api.put(`/budgets/${month}`, { categories: editCategories });
      setIsEditing(false);
      fetchBudget();
    } catch (err) {
      console.error(err);
    }
  };

  const addEditCategory = () => {
    setEditCategories([...editCategories, { category: 'New Category', limit: 0, spent: 0 }]);
  };

  const updateEditCat = (index, field, value) => {
    const updated = [...editCategories];
    if (field === 'limit') {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value;
    }
    setEditCategories(updated);
  };

  const removeEditCategory = async () => {
    if (confirmDelete.index !== null) {
      const categoryToDelete = editCategories[confirmDelete.index];
      
      try {
        await api.delete(`/budgets/${month}/category/${encodeURIComponent(categoryToDelete.category)}`);
        const updated = [...editCategories];
        updated.splice(confirmDelete.index, 1);
        setEditCategories(updated);
        
        const res = await api.get(`/budgets/${month}`);
        setBudget(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to delete budget category');
      }
    }
    setConfirmDelete({ isOpen: false, index: null });
  };

  if (loading && !budget) return <LoadingSpinner fullScreen />;

  const cats = budget?.categories || [];
  const totalLimit = cats.reduce((acc, c) => acc + c.limit, 0);
  const totalSpent = cats.reduce((acc, c) => acc + c.spent, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>Budget</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 2rem 0', fontWeight: 400 }}>Monthly category limits and tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="month" 
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mono-text"
            style={{ padding: '0.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
          />
          <button 
            onClick={() => setIsEditing(true)}
            style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-accent)', border: '1px solid var(--color-accent)', fontWeight: 'bold' }}
          >
            Edit limits
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        {cats.map((c, i) => {
          const over = c.spent > c.limit;
          const percent = c.limit > 0 ? Math.min(100, (c.spent / c.limit) * 100) : 0;
          return (
            <div key={i} style={{ 
              display: 'grid', 
              gridTemplateColumns: '150px 1fr 200px 100px', 
              gap: '1rem', 
              alignItems: 'center', 
              padding: '1rem', 
              borderBottom: '1px solid var(--color-border)',
              borderLeft: over ? '2px solid var(--color-danger)' : '2px solid transparent'
            }}>
              <span style={{ fontSize: '14px' }}>{c.category}</span>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-canvas)' }}>
                <div style={{ width: `${percent}%`, height: '100%', backgroundColor: over ? 'var(--color-danger)' : 'var(--color-accent)' }}></div>
              </div>
              <span className="mono-text" style={{ fontSize: '14px', textAlign: 'right' }}>
                R {c.spent.toFixed(2)} / R {c.limit.toFixed(2)}
              </span>
              <span style={{ 
                fontSize: '11px', 
                textTransform: 'uppercase', 
                padding: '2px 6px', 
                backgroundColor: over ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 229, 195, 0.1)', 
                color: over ? 'var(--color-danger)' : 'var(--color-accent)',
                textAlign: 'center'
              }}>
                {over ? 'Over' : 'Track'}
              </span>
            </div>
          );
        })}
        {cats.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            No budget limits set. Click "Edit limits" to create your budget.
          </div>
        )}
        {cats.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '150px 1fr 200px 100px', 
            gap: '1rem', 
            alignItems: 'center', 
            padding: '1rem', 
            backgroundColor: 'var(--color-canvas)',
            fontWeight: 'bold'
          }}>
            <span style={{ fontSize: '14px' }}>Total</span>
            <div></div>
            <span className="mono-text" style={{ fontSize: '14px', textAlign: 'right', color: totalSpent > totalLimit ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
              R {totalSpent.toFixed(2)} / R {totalLimit.toFixed(2)}
            </span>
            <div></div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <MALIInsightCard type="Budget" />
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Budget Limits">
        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {editCategories.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={c.category} 
                onChange={(e) => updateEditCat(i, 'category', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
              <input 
                type="number" 
                value={c.limit} 
                onChange={(e) => updateEditCat(i, 'limit', e.target.value)}
                className="mono-text"
                style={{ width: '120px', padding: '0.5rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
              <button 
                onClick={() => setConfirmDelete({ isOpen: true, index: i })}
                style={{ padding: '0.5rem', backgroundColor: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 'bold' }}
                title="Delete limit"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button onClick={addEditCategory} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>+ Add Category</button>
        <button onClick={handleSave} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--color-accent)', color: '#020f0d', fontWeight: 'bold', border: 'none' }}>Save Limits</button>
      </Modal>

      <ConfirmDialog 
        isOpen={confirmDelete.isOpen}
        title="Delete budget category?"
        message="Are you sure you want to remove this budget limit?"
        confirmText="Delete"
        onConfirm={removeEditCategory}
        onCancel={() => setConfirmDelete({ isOpen: false, index: null })}
      />
    </div>
  );
};

export default Budget;
