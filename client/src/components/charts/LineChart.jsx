import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChart = ({ data, xDataKey = 'name', lines = [] }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            tickFormatter={(val) => `R${val}`} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 0, fontSize: '11px' }}
            itemStyle={{ color: 'var(--color-text-primary)' }}
          />
          {lines.map((line, idx) => (
            <Line 
              key={idx}
              type="monotone" 
              dataKey={line.dataKey} 
              stroke={line.color || 'var(--color-accent)'} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: line.color || 'var(--color-accent)', stroke: 'var(--color-surface)' }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
