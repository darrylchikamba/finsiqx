import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChart = ({ data, xDataKey = 'name', bars = [], layout = 'horizontal' }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RechartsBarChart data={data} layout={layout} margin={{ top: 10, right: 30, left: layout === 'vertical' ? 50 : -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" horizontal={layout === 'horizontal'} vertical={layout === 'vertical'} />
          <XAxis 
            type={layout === 'vertical' ? 'number' : 'category'} 
            dataKey={layout === 'vertical' ? undefined : xDataKey} 
            stroke="#9a9a96" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={layout === 'horizontal' ? 10 : 0}
          />
          <YAxis 
            type={layout === 'vertical' ? 'category' : 'number'} 
            dataKey={layout === 'vertical' ? xDataKey : undefined}
            stroke="#9a9a96" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={layout === 'vertical' ? undefined : (val) => `R${val}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 0, fontSize: '11px' }}
            itemStyle={{ color: 'var(--color-text-primary)' }}
            cursor={{ fill: 'var(--color-active)' }}
          />
          {bars.map((bar, idx) => (
            <Bar 
              key={idx}
              dataKey={bar.dataKey} 
              fill={bar.color || 'var(--color-accent)'} 
              radius={0}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
