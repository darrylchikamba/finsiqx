import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AreaChart = ({ data, xDataKey = 'name', areas = [] }) => {
  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" vertical={false} />
          <XAxis 
            dataKey={xDataKey} 
            stroke="#9a9a96" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={10} 
          />
          <YAxis 
            stroke="#9a9a96" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 0, fontSize: '11px' }}
            itemStyle={{ color: 'var(--color-text-primary)' }}
          />
          {areas.map((area, idx) => (
            <Area 
              key={idx}
              type="monotone" 
              dataKey={area.dataKey} 
              stroke={area.color || 'var(--color-accent)'} 
              fill={area.color || 'var(--color-accent)'} 
              fillOpacity={0.2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
