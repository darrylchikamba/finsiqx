import React, { useEffect } from 'react';

const ToastNotification = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'var(--color-surface)' : 'var(--color-danger)';
  const borderColor = type === 'success' ? 'var(--color-accent)' : 'var(--color-danger)';
  const color = type === 'success' ? 'var(--color-text-primary)' : '#fff';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      color: color,
      padding: '1rem',
      zIndex: 9999,
      borderRadius: '0',
      minWidth: '250px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: 'none' // zero blur/shadow rule
    }}>
      <span style={{ fontSize: '14px' }}>{message}</span>
      <button 
        onClick={onClose} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: color, 
          cursor: 'pointer',
          fontWeight: 'bold' 
        }}
      >
        ×
      </button>
    </div>
  );
};

export default ToastNotification;
