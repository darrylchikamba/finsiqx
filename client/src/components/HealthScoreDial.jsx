import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const HealthScoreDial = ({ score }) => {
  const data = [{ name: 'Score', value: score, fill: 'var(--color-accent)' }];

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 200, height: 200, minHeight: 200 }}>
      <div style={{ width: '100%', height: 200, minHeight: 200, flex: '0 0 200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            barSize={10}
            data={data}
            startAngle={210}
            endAngle={-30}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar minAngle={15} background={{ fill: 'var(--color-border)' }} clockWise dataKey="value" cornerRadius={0} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <div className="mono-text" style={{ fontSize: '36px', color: 'var(--color-text-primary)' }}>{score}</div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-secondary)' }}>Health Score</div>
      </div>
    </div>
  );
};

export default HealthScoreDial;
