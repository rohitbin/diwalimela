// Live Chat Overlay & Quick Festive Greetings Dock
import React, { useState } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

const QUICK_GREETINGS = [
  'Shubh Deepawali! 🪔',
  'Happy Diwali! ✨',
  'Come to Dhamaka Ground! 🎆',
  'Look at my rocket! 🚀',
  'Enjoying delicious sweets! 🥨',
  'Lakshmi Mata ki Jai! 🙏'
];

export default function ChatOverlay({
  onSendMessage,
  chatMessages,
  player
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  const handleSend = (text) => {
    if (!text || !text.trim()) return;
    onSendMessage(text.trim());
    soundEngine.playCoinSound();
    setCustomText('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        bottom: 80,
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
        maxWidth: 340
      }}
    >
      {/* Expanded Chat Box */}
      {isOpen && (
        <div
          style={{
            width: 320,
            maxHeight: 320,
            backgroundColor: 'rgba(18, 12, 30, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 18,
            boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#1b122c',
              borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ color: '#fef08a', fontSize: 13, fontWeight: 700 }}>
              💬 Mela Live Chat
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages list */}
          <div
            style={{
              padding: 12,
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 180
            }}
          >
            {chatMessages.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
                Send a Diwali greeting to people in the mela!
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} style={{ fontSize: 12 }}>
                  <strong style={{ color: msg.senderName === player?.name ? '#fbbf24' : '#38bdf8' }}>
                    {msg.senderName}:
                  </strong>{' '}
                  <span style={{ color: '#f1f5f9' }}>{msg.text}</span>
                </div>
              ))
            )}
          </div>

          {/* Quick Greetings Chips */}
          <div
            style={{
              padding: '6px 10px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              display: 'flex',
              gap: 6,
              overflowX: 'auto'
            }}
          >
            {QUICK_GREETINGS.slice(0, 3).map((greet) => (
              <button
                key={greet}
                onClick={() => handleSend(greet)}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 12,
                  padding: '4px 8px',
                  color: '#fde047',
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {greet}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(customText);
            }}
            style={{
              padding: 8,
              display: 'flex',
              gap: 6,
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Say something festive..."
              maxLength={70}
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 10,
                padding: '6px 10px',
                color: '#fff',
                fontSize: 12,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#f59e0b',
                border: 'none',
                borderRadius: 10,
                padding: '6px 12px',
                color: '#1e1b4b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: 'rgba(18, 12, 30, 0.9)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 20,
            padding: '8px 16px',
            color: '#fef08a',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
          }}
        >
          <MessageCircle size={16} color="#fbbf24" />
          <span>Chat & Greetings</span>
        </button>
      )}
    </div>
  );
}
