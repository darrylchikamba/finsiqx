import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

const AICoach = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const res = await api.post('/ai/insights');
        if (res.data && res.data.length > 0) {
          setMessages([{ text: res.data[0].message, sender: 'mali' }]);
        } else {
          setMessages([{ text: "Hello. I'm MALI. I've analyzed your latest data. How can I assist your financial journey today?", sender: 'mali' }]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride) => {
    const text = textOverride || input;
    if (!text.trim()) return;

    const newMsgs = [...messages, { text, sender: 'user' }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/query', { query: text });
      setMessages([...newMsgs, { text: res.data.answer, sender: 'mali' }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMsgs, { text: "I'm currently unable to process that. Please try again later.", sender: 'mali' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    "How can I improve my tax efficiency?",
    "Am I spending too much on food?",
    "What's my biggest expense?"
  ];

  return (
    <div>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0' }}>MALI</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 2rem 0', fontWeight: 400 }}>Your financial intelligence assistant</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', border: '1px solid var(--color-border)' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--color-accent)' }}>MALI</h2>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>by FINSIQX</span>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }}></div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Ready</span>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: 'var(--color-canvas)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '75%',
            backgroundColor: msg.sender === 'user' ? 'var(--color-surface)' : 'var(--color-surface)',
            border: msg.sender === 'user' ? '1px solid var(--color-border)' : '1px solid var(--color-border)',
            borderLeft: msg.sender === 'mali' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
            padding: '1rem',
            fontSize: '14px',
            lineHeight: '1.5',
            color: 'var(--color-text-primary)'
          }}>
            {msg.sender === 'mali' && <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 'bold', marginBottom: '8px' }}>MALI</div>}
            {msg.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--color-text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>
            MALI is analyzing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {quickChips.map((chip, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(chip)}
              style={{ padding: '0.25rem 0.75rem', fontSize: '12px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
            >
              {chip}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask MALI anything about your money..."
            style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '0' }}
          />
          <button 
            onClick={() => handleSend()}
            style={{ padding: '0 2rem', backgroundColor: 'var(--color-accent)', color: '#020f0d', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Send
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AICoach;
