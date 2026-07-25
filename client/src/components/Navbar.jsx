import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const navItems = [
    'Dashboard', 'Transactions', 'Analytics', 'Budget', 'Goals'
  ];

  const secondaryItems = [
    'Subscriptions', 'Simulator', 'MALI', 'SA Overview', 'Tax Snapshot', 'Profile'
  ];

  const getLinkStyle = ({ isActive }) => ({
    display: 'block',
    padding: '0.75rem 1rem',
    paddingLeft: '1.5rem',
    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
    borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
    backgroundColor: isActive ? 'var(--color-active)' : 'transparent',
    textDecoration: 'none',
    fontSize: '14px',
  });

  return (
    <nav style={{
      width: '240px',
      height: '100vh',
      backgroundColor: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <div style={{ padding: '1.5rem 1rem 1rem 1rem', textAlign: 'center' }}>
        <img
          src="/assets/logo-mark-dark.svg"
          alt="FINSIQX Logo"
          style={{ height: '48px', width: 'auto', display: 'block', margin: '0 auto 6px auto', mixBlendMode: 'screen' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ display: 'none', fontWeight: 600, fontSize: '16px' }}>
          <span style={{ color: '#f4f4f2' }}>FIN</span>
          <span style={{ color: '#00E5C3' }}>SIQX</span>
        </div>
        <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#444', marginTop: '2px' }}>
          by FINSIQ
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="section-label" style={{ padding: '0 1rem', marginBottom: '0.5rem', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555' }}>Main</div>
        {navItems.map(item => (
          <NavLink key={item} to={`/${item.toLowerCase()}`} style={getLinkStyle}>
            {item}
          </NavLink>
        ))}

        <div className="section-label" style={{ padding: '0 1rem', marginTop: '2rem', marginBottom: '0.5rem', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555' }}>Tools & Insights</div>
        {secondaryItems.map(item => (
          <NavLink key={item} to={`/${item.toLowerCase().replace(' ', '-')}`} style={getLinkStyle}>
            {item}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
