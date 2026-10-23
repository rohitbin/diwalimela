import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

const QUICK_GREETINGS = [
  'Shubh Deepawali! 🪔',
  'Happy Diwali! ✨',
  'Let us burst fireworks together! 🎆',
  'Look at my rocket! 🚀',
  'Enjoying delicious sweets! 🥨',
  'Lakshmi Mata ki Jai! 🙏'
];

export default function ChatOverlay({
  onSendMessage,
  chatMessages,
  player,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;

  const [hasUnread, setHasUnread] = useState(false);
  const [customText, setCustomText] = useState('');
  const chatEndRef = useRef(null);

  const handleSend = (text) => {
    if (!text || !text.trim()) return;
    onSendMessage(text.trim());
    soundEngine.playCoinSound();
    setCustomText('');
  };

  const userChatMessages = (chatMessages || []).filter(
    (msg) => msg.senderId !== 'system' && !msg.isSystem
  );

  const prevCountRef = useRef(userChatMessages.length);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevCountRef.current = userChatMessages.length;
      return;
    }

    if (userChatMessages.length > prevCountRef.current) {
      // New chat message arrived!
      if (!isOpen) {
        setHasUnread(true);
      }
    }
    prevCountRef.current = userChatMessages.length;
  }, [userChatMessages.length, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, userChatMessages.length]);

  return (
    <div
      style={{
        position: 'fixed',
        left: 'max(14px, env(safe-area-inset-left))',
        bottom: 'max(78px, calc(env(safe-area-inset-bottom) + 70px))',
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
        maxWidth: 'calc(100vw - 16px)',
        touchAction: 'manipulation'
      }}
    >
      {/* Expanded Chat Box */}
      {isOpen && (
        <div
          className="modal-scrollable"
          style={{
            width: 'min(320px, calc(100vw - 24px))',
            maxHeight: 'min(320px, 45vh)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ color: '#fef08a', fontSize: 13, fontWeight: 700 }}>
                💬 Mela Live Chat
              </span>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 6px #22c55e'
                }}
                title="Live Chat Active"
              />
            </div>
            <button
              id="chat-close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: 6,
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 8px',
                touchAction: 'manipulation'
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
            {userChatMessages.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: '16px 8px' }}>
                💬 No chat messages yet.<br />
                <span style={{ fontSize: 11, color: '#fde047' }}>Send a Diwali greeting or message below!</span>
              </div>
            ) : (
              userChatMessages.map((msg, i) => (
                <div key={i} style={{ fontSize: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <strong style={{ color: msg.senderName === player?.name ? '#fbbf24' : '#38bdf8' }}>
                    {msg.senderName}:
                  </strong>{' '}
                  <span style={{ color: '#f1f5f9' }}>{msg.text}</span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
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
          id="chat-toggle-button"
          onClick={() => {
            setIsOpen(true);
            setHasUnread(false);
          }}
          style={{
            position: 'relative',
            backgroundColor: 'rgba(18, 12, 30, 0.92)',
            border: hasUnread ? '1.5px solid #ef4444' : '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 20,
            padding: '7px 14px',
            color: '#fef08a',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            cursor: 'pointer',
            boxShadow: hasUnread
              ? '0 0 14px rgba(239, 68, 68, 0.65), 0 4px 16px rgba(0,0,0,0.5)'
              : '0 4px 16px rgba(0,0,0,0.5)',
            touchAction: 'manipulation',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <MessageCircle size={16} color={hasUnread ? '#f87171' : '#fbbf24'} />
          <span>Chat</span>

          {/* Red notification dot */}
          {hasUnread && (
            <span
              id="chat-unread-dot"
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 10,
                height: 10,
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                border: '2px solid #ffffff',
                boxShadow: '0 0 8px #ef4444',
                animation: 'redDotPulse 1.4s infinite ease-in-out'
              }}
            />
          )}
        </button>
      )}
    </div>
  );
}
