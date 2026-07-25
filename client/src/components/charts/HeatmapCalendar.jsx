import React from 'react';
import { useState } from "react";

// Expects data format: { "2025-06-01": 450, "2025-06-02": 0, ... }
const HeatmapCalendar = ({ data = {}, month }) => {
  const [tooltip, setTooltip] = useState(null);

  if (!month) return null;

  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const firstDayRaw = new Date(year, monthNum - 1, 1).getDay();
  const firstDayOffset = (firstDayRaw + 6) % 7;

  const maxVal = Math.max(...Object.values(data).filter(v => v > 0), 1);

  const getColor = (val) => {
    if (!val || val === 0) return '#2a2a35';
    const r = val / maxVal;
    if (r < 0.2) {
      const t = r / 0.2;
      return `rgb(${Math.round(28 + 30 * t)},${Math.round(100 + 25 * t)},${Math.round(40 + 28 * t)})`;
    }
    if (r < 0.45) {
      const t = (r - 0.2) / 0.25;
      return `rgb(${Math.round(58 + 142 * t)},${Math.round(125 + 55 * t)},${Math.round(68 - 68 * t)})`;
    }
    if (r < 0.7) {
      const t = (r - 0.45) / 0.25;
      return `rgb(${Math.round(200 + 12 * t)},${Math.round(180 - 68 * t)},0)`;
    }
    const t = (r - 0.7) / 0.3;
    return `rgb(${Math.round(212 - 20 * t)},${Math.round(112 - 55 * t)},${Math.round(10 - 10 * t)})`;
  };

  const monthName = new Date(year, monthNum - 1, 1)
    .toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  const blanks = Array(firstDayOffset).fill(null);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    const mo = String(monthNum).padStart(2, '0');
    return `${year}-${mo}-${day}`;
  });

  const legendItems = [
    { color: '#2a2a35', label: 'No spend' },
    { color: '#3a7d44', label: 'Low' },
    { color: '#c8b400', label: 'Medium' },
    { color: '#d4700a', label: 'High' },
    { color: '#c0392b', label: 'Very high' },
  ];

  return (
    <div style={{ position: 'relative' }}>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {legendItems.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {i > 0 && i === 1 && (
              <div style={{ width: '1px', height: '14px', background: 'var(--color-border)', marginRight: '4px' }} />
            )}
            <div style={{ width: '14px', height: '14px', borderRadius: '2px', backgroundColor: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '4px' }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} style={{ aspectRatio: '1' }} />
        ))}
        {dayCells.map((date) => {
          const val = data[date] || 0;
          const dayNum = parseInt(date.split('-')[2], 10);
          return (
            <div
              key={date}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({ date, val, x: rect.right + 8, y: rect.top - 4 });
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.zIndex = '10';
                e.currentTarget.style.outline = '1px solid rgba(255,255,255,0.25)';
              }}
              onMouseLeave={(e) => {
                setTooltip(null);
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = 'auto';
                e.currentTarget.style.outline = 'none';
              }}
              style={{
                aspectRatio: '1',
                backgroundColor: getColor(val),
                borderRadius: '2px',
                position: 'relative',
                cursor: 'default',
                transition: 'transform 0.1s',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '2px',
                left: '3px',
                fontSize: '9px',
                fontFamily: 'monospace',
                color: 'rgba(255,255,255,0.2)',
                lineHeight: 1,
                userSelect: 'none'
              }}>
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Month label */}
      <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {monthName}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x,
          top: tooltip.y,
          backgroundColor: 'var(--color-card)',
          border: '0.5px solid var(--color-border)',
          padding: '5px 10px',
          fontSize: '12px',
          color: 'var(--color-text-primary)',
          pointerEvents: 'none',
          zIndex: 1000,
          borderRadius: 0,
          whiteSpace: 'nowrap',
          lineHeight: 1.6
        }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>{tooltip.date}</span>
          <br />
          <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
            {tooltip.val > 0
              ? `R ${tooltip.val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'No spend'}
          </span>
        </div>
      )}
    </div>
  );
};

export default HeatmapCalendar;
