import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-canvas)',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeIn 0.6s ease-out' }}>
          <img
            src="/assets/logo-dark.svg"
            alt="FINSIQX Logo"
            style={{ height: '96px', width: 'auto', mixBlendMode: 'screen' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{ display: 'none', fontWeight: 'bold', fontSize: '32px', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            <span style={{ color: '#f4f4f2' }}>FIN</span>
            <span style={{ color: '#00E5C3' }}>SIQX</span>
          </div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#444' }}>
            by FINSIQ
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>
          {error && <div style={{ color: 'var(--color-danger)', fontSize: '14px', border: '1px solid var(--color-danger)', padding: '0.75rem' }}>{error}</div>}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: 'var(--color-accent)',
              color: '#020f0d',
              fontWeight: 'bold',
              marginTop: '1rem',
              fontSize: '16px'
            }}
          >
            Sign in
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '14px' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--color-accent)' }}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
