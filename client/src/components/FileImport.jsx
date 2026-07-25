import React, { useState } from 'react';
import api from '../api/axiosConfig';

const FileImport = ({ onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSummary(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setSummary(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/transactions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSummary(data);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)' }}>Import Transactions</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input 
          type="file" 
          accept=".csv, .xls, .xlsx"
          onChange={handleFileChange}
          style={{
            border: '1px solid var(--color-border)',
            padding: '0.5rem',
            backgroundColor: 'var(--color-canvas)',
            color: 'var(--color-text-primary)',
            flex: 1
          }}
        />
        <button 
          onClick={handleImport}
          disabled={!file || loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: loading || !file ? 'var(--color-border)' : 'var(--color-accent)',
            color: loading || !file ? 'var(--color-text-secondary)' : '#020f0d',
            fontWeight: 'bold',
            border: 'none',
            cursor: loading || !file ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Upload & Classify'}
        </button>
      </div>

      {error && <div style={{ color: 'var(--color-danger)', marginTop: '1rem', fontSize: '14px' }}>{error}</div>}
      {summary && (
        <div style={{ marginTop: '1rem', fontSize: '14px', border: '1px solid var(--color-border)', padding: '1rem', backgroundColor: 'var(--color-canvas)' }}>
          <div style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
            Successfully imported {summary.imported} transactions.
          </div>
          {summary.uncategorizedCount > 0 && (
            <div style={{ color: 'var(--color-warning)', marginTop: '0.5rem' }}>
              Warning: {summary.uncategorizedCount} transactions were marked as 'Uncategorized'. Please review and manually update them or reclassify later.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileImport;
