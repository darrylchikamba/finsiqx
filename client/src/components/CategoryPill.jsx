import React from 'react';

const CATEGORY_COLORS = {
  // SA Taxonomy mappings
  'Income': { bg: 'rgba(0, 229, 195, 0.1)', color: '#00E5C3' }, // Accent
  'Housing': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }, // Muted blue
  'Transport': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }, // Amber
  'Food & Groceries': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }, // Green
  'Utilities': { bg: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }, // Light blue
  'Load Shedding': { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }, // Purple
  'Debt Service': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }, // Danger red
  'Insurance': { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }, // Indigo
  'Healthcare': { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }, // Pink
  'Education': { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }, // Orange
  'Investments': { bg: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6' }, // Teal
  'Community & Family': { bg: 'rgba(217, 70, 239, 0.1)', color: '#d946ef' }, // Fuchsia
  'Lifestyle': { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }, // Yellow
  'Municipal': { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b' }, // Slate
  'Cash': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }, // Emerald
  'Uncategorized': { bg: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' }, // Gray
  'Deductions': { bg: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' } // Rose
};

const CategoryPill = ({ category }) => {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS['Uncategorized'];

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      backgroundColor: colors.bg,
      color: colors.color,
      border: `1px solid ${colors.color}40`,
      borderRadius: '0',
      whiteSpace: 'nowrap'
    }}>
      {category}
    </span>
  );
};

export default CategoryPill;
