import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const RadialGauge = ({ value, max = 100, color = 'var(--color-accent)', label, size = 120 }) => {
  const data = [{ name: label, value: Math.min(value, max), fill: color }];
  
  return (
    <div style={{ position: 'relative', width: '100%', minWidth: size, height: size, minHeight: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', height: size, minHeight: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius={size * 0.35} 
            outerRadius={size * 0.45} 
            barSize={10} 
            data={data} 
            startAngle={210} 
            endAngle={-30}
          >
            <PolarAngleAxis type="number" domain={[0, max]} angleAxisId={0} tick={false} />
            <RadialBar minAngle={15} background={{ fill: 'var(--color-border)' }} clockWise dataKey="value" cornerRadius={0} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <div className="mono-text" style={{ fontSize: `${size * 0.15}px`, color: 'var(--color-text-primary)' }}>{Math.round(value)}</div>
      </div>
      {label && <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '-10px' }}>{label}</div>}
    </div>
  );
};

export default RadialGauge;
