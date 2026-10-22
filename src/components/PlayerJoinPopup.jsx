// Player Join Festive Announcement Popup
import React from 'react';
import { Sparkles, UserPlus, Heart } from 'lucide-react';

export default function PlayerJoinPopup({ notifications = [], onDismiss }) {
  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 68,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
        maxWidth: '90vw'
      }}
    >
      {notifications.map((notif) => (
        <div
          key={notif.id}
          style={{
            backgroundColor: 'rgba(23, 14, 38, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '2px solid #fbbf24',
            borderRadius: 22,
            padding: '12px 24px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.85), 0 0 25px rgba(245, 158, 11, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            animation: 'joinPopupSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1), popupGlow 1.8s infinite alternate',
            pointerEvents: 'auto'
          }}
        >
          {/* Avatar Icon */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              backgroundColor: notif.color || '#ea580c',
              border: '2.5px solid #fef08a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 0 14px rgba(251, 191, 36, 0.65)',
              flexShrink: 0
            }}
          >
            {notif.turbanColor ? '👳' : '🪔'}
          </div>

          {/* Text Message */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="#fde047" />
              <span
                style={{
                  fontSize: 11,
                  color: '#f59e0b',
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  fontFamily: "'Cinzel', serif"
                }}
              >
                {notif.isSelf ? '✨ SVAGATAM • WELCOME TO MELA' : '🎆 SHUBH AAGAMAN • NEW CELEBRATOR'}
              </span>
            </div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
              <strong style={{ color: '#fef08a', fontSize: 16, fontFamily: "'Cinzel', serif" }}>
                {notif.name}
              </strong>{' '}
              {notif.isSelf
                ? 'entered the Diwali Celebration Mela! 🪔'
                : 'entered the Diwali Celebration Mela! 🪔'}
            </div>
          </div>

          {/* Close mini button */}
          {onDismiss && (
            <button
              onClick={() => onDismiss(notif.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: 16,
                cursor: 'pointer',
                padding: '0 4px',
                marginLeft: 4
              }}
              title="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
