import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const MALIInsightCard = ({ type }) => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallbacks = {
    Dashboard: "Your net cash flow this month gives you room to build toward your goals. Review your largest category for quick wins.",
    Analytics: "Your spending pattern is consistent month to month. Transport and lifestyle categories are the most variable.",
    Budget: "Staying within your category limits this month will improve your Financial Health Score directly.",
    SAOverview: "Your TFSA utilisation is tracking well. Consider increasing your RA contribution before the February tax year end."
  };

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await api.post('/ai/insights', { context: type });
        const dataArr = Array.isArray(res.data) ? res.data : (res.data?.insights || []);
        if (dataArr.length > 0) {
          setInsight(dataArr[0]);
        } else {
          throw new Error('No insights returned');
        }
      } catch (err) {
        console.error("MALI error", err);
        setInsight({
          type: 'tip',
          message: fallbacks[type] || fallbacks.Dashboard
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsight();
  }, [type]);

  return (
    <div style={{ 
      borderLeft: '2px solid var(--color-accent)', 
      backgroundColor: 'var(--color-card)', 
      padding: '1rem 1.25rem', 
      marginBottom: '1.5rem' 
    }}>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-accent)', marginBottom: '6px' }}>
        MALI &middot; {insight ? (insight.type || type) : type}
      </div>
      {loading ? (
        <div style={{ animation: 'pulseOpacity 1s infinite alternate' }}>
          <div style={{ height: '14px', backgroundColor: 'var(--color-border)', width: '80%', marginBottom: '8px' }}></div>
          <div style={{ height: '14px', backgroundColor: 'var(--color-border)', width: '60%' }}></div>
        </div>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
          {insight?.message}
        </div>
      )}
    </div>
  );
};

export default MALIInsightCard;
