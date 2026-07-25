import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import FileImport from '../components/FileImport';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

  // Filters
  const [month, setMonth] = useState(''); // YYYY-MM
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reclassifying, setReclassifying] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, targetId: null });
  const [editTarget, setEditTarget] = useState(null);

  const categories = [
    'All', 'Income', 'Deductions', 'Housing', 'Transport',
    'Food & Groceries', 'Community & Family', 'Investments',
    'Insurance', 'Education', 'Healthcare', 'Load Shedding',
    'Utilities', 'Lifestyle', 'Debt Service', 'Cash', 'Municipal', 'Uncategorized'
  ];

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (month) params.month = month;
      if (category !== 'All') params.category = category;
      if (type !== 'All') params.type = type;

      const { data } = await api.get('/transactions', { params });
      setTransactions(data.transactions);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [month, category, type, page]);

  const handleReclassifyAll = async () => {
    setReclassifying(true);
    try {
      await api.post('/transactions/reclassify');
      await fetchTransactions();
    } catch (err) {
      console.error('Reclassify failed:', err);
      alert('Reclassify failed.');
    } finally {
      setReclassifying(false);
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmState.type === 'deleteAll') {
        await api.delete('/transactions/all');
      } else if (confirmState.type === 'deleteSingle') {
        await api.delete(`/transactions/${confirmState.targetId}`);
      }
      setConfirmState({ isOpen: false, type: null, targetId: null });
      fetchTransactions();
    } catch (err) {
      console.error('Action failed:', err);
      alert('Action failed.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/transactions/${editTarget._id}`, editTarget);
      setEditTarget(null);
      fetchTransactions();
    } catch (err) {
      console.error(err);
      alert('Failed to update transaction');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>Transactions</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 2rem 0', fontWeight: 400 }}>Import, review and manage your transactions</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setConfirmState({ isOpen: true, type: 'deleteAll', targetId: null })}
            disabled={transactions.length === 0}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger)',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Clear all transactions
          </button>
          <button
            onClick={handleReclassifyAll}
            disabled={reclassifying || transactions.length === 0}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: (reclassifying || transactions.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {reclassifying ? 'Reclassifying...' : 'Reclassify All'}
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent)',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {showImport ? 'Close Import' : 'Import'}
          </button>
        </div>
      </div>

      {showImport && <FileImport onImportSuccess={() => { fetchTransactions(); setShowImport(false); }} />}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-surface)', padding: '1rem', border: '1px solid var(--color-border)' }}>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mono-text"
          style={{ padding: '0.5rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '0.5rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', flex: 1 }}
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: '0.5rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        >
          <option value="All">All Types</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
      </div>

      <div className="grid-container">
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '900px' }}>

            {/* Header Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1.5fr 150px 120px 140px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
              <div className="grid-item section-label">Date</div>
              <div className="grid-item section-label">Description</div>
              <div className="grid-item section-label">Merchant</div>
              <div className="grid-item section-label">Category</div>
              <div className="grid-item section-label" style={{ textAlign: 'right' }}>Amount</div>
              <div className="grid-item section-label" style={{ textAlign: 'center' }}>Action</div>
            </div>

            {/* Data Rows */}
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading...</div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No transactions found.</div>
            ) : (
              transactions.map(tx => (
                <div key={tx._id} style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1.5fr 150px 120px 140px', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="grid-item mono-text" style={{ fontSize: '14px', borderTop: 'none', borderBottom: 'none' }}>
                    {new Date(tx.date).toISOString().split('T')[0]}
                  </div>
                  <div className="grid-item" style={{ fontSize: '14px', borderTop: 'none', borderBottom: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.description}
                  </div>
                  <div className="grid-item" style={{ fontSize: '14px', borderTop: 'none', borderBottom: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-secondary)' }}>
                    {tx.merchant}
                  </div>
                  <div className="grid-item" style={{ borderTop: 'none', borderBottom: 'none' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      backgroundColor: 'var(--color-active)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {tx.category}
                    </span>
                  </div>
                  <div className="grid-item mono-text" style={{
                    fontSize: '14px',
                    textAlign: 'right',
                    color: tx.type === 'debit' ? 'var(--color-danger)' : 'var(--color-accent)',
                    borderTop: 'none', borderBottom: 'none'
                  }}>
                    {tx.type === 'debit' ? '-' : '+'}R {tx.amount.toFixed(2)}
                  </div>
                  <div className="grid-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: 'none', borderBottom: 'none' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => setEditTarget(tx)}
                        style={{ fontSize: '12px', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--color-text-secondary)', cursor: 'pointer', borderRadius: 0, padding: '2px 8px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmState({ isOpen: true, type: 'deleteSingle', targetId: tx._id })}
                        style={{ fontSize: '12px', color: 'var(--color-danger)', backgroundColor: 'transparent', border: '1px solid var(--color-danger)', cursor: 'pointer', borderRadius: 0, padding: '2px 8px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        >
          Previous
        </button>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        >
          Next
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.type === 'deleteAll' ? "Clear all transactions?" : "Delete transaction?"}
        message={confirmState.type === 'deleteAll'
          ? "This will permanently delete all your transaction history. You will need to re-import your data to restore it. This action cannot be undone."
          : "Are you sure you want to delete this transaction? This action cannot be undone."}
        confirmText="Delete"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState({ isOpen: false, type: null, targetId: null })}
      />

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Transaction">
        {editTarget && (
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
              <input
                type="text"
                value={editTarget.description}
                onChange={e => setEditTarget({ ...editTarget, description: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: 0 }}
              />
            </div>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
              <select
                value={editTarget.category}
                onChange={e => setEditTarget({ ...editTarget, category: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: 0 }}
              >
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Amount</label>
              <input
                type="number"
                step="0.01"
                value={editTarget.amount}
                onChange={e => setEditTarget({ ...editTarget, amount: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: 0 }}
              />
            </div>
            <button type="submit" style={{ padding: '0.75rem', backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem', borderRadius: 0 }}>
              Save Changes
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Transactions;
