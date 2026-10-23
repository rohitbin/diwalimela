// Shri Lakshmi-Ganesh Mandir Modal - Temple Bell & Shagun Blessings
import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Bell, Sparkles, X, Heart } from 'lucide-react';

export default function TempleModal({ isOpen, onClose, setCoins, multiplayerManager, player }) {
  const [isRinging, setIsRinging] = useState(false);
  const [ringCount, setRingCount] = useState(0);
  const [blessingMessage, setBlessingMessage] = useState(null);

  if (!isOpen) return null;

  const handleRingBell = () => {
    setIsRinging(true);
    soundEngine.playTempleBell();
    soundEngine.playCoinSound();

    setRingCount((c) => c + 1);
    setCoins((c) => c + 50);

    if (multiplayerManager) {
      multiplayerManager.broadcastTempleBell({
        playerName: player?.name || 'Devotee'
      });
    }

    const blessings = [
      '🔔 "Shubh Deepawali! Goddess Lakshmi blesses your home with abundant wealth and peace!" (+50 Coins)',
      '🪔 "Lord Ganesha removes all obstacles and brings success to your endeavors!" (+50 Coins)',
      '✨ "Auspicious blessings received! May your year ahead shine with happiness!" (+50 Coins)'
    ];

    setBlessingMessage(blessings[ringCount % blessings.length]);

    setTimeout(() => setIsRinging(false), 900);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 3, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left))'
      }}
      onClick={onClose}
    >
      <div
        className="modal-scrollable"
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: 'min(94vh, 680px)',
          overflowY: 'auto',
          backgroundColor: '#1f1322',
          border: '2px solid #f59e0b',
          borderRadius: 24,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.35)',
          padding: 'clamp(16px, 4vw, 28px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          <X size={18} />
        </button>

        <span style={{ fontSize: 36, marginBottom: 4 }}>🪔</span>
        <h2
          style={{
            margin: '0 0 6px 0',
            fontSize: 'clamp(18px, 4.8vw, 26px)',
            color: '#fef08a',
            fontFamily: "'Rozha One', 'Cinzel', serif"
          }}
        >
          श्री महालक्ष्मी-गणेश मंदिर
        </h2>
        <p style={{ margin: '0 0 20px 0', color: '#fed7aa', fontSize: 13, maxWidth: 440 }}>
          Ring the auspicious brass temple bell to seek blessings from Goddess Lakshmi and Lord Ganesha for joy, prosperity, and light.
        </p>

        {/* Interactive Hanging Bell */}
        <div
          onClick={handleRingBell}
          style={{
            margin: '16px 0 24px 0',
            cursor: 'pointer',
            padding: 20,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
            transition: 'transform 0.15s ease-out'
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              backgroundColor: '#ca8a04',
              border: '4px solid #fef08a',
              boxShadow: isRinging
                ? '0 0 40px #fbbf24, 0 0 80px rgba(245, 158, 11, 0.6)'
                : '0 0 20px rgba(202, 138, 4, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isRinging ? 'rotate(18deg) scale(1.08)' : 'rotate(0deg) scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <Bell size={54} color="#fef08a" fill="#eab308" />
          </div>
          <div style={{ marginTop: 12, color: '#fde047', fontSize: 13, fontWeight: 700 }}>
            🔔 Click Bell to Ring & Receive Shagun!
          </div>
        </div>

        {/* Shloka Box */}
        <div
          style={{
            backgroundColor: 'rgba(120, 53, 15, 0.3)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 14,
            padding: '12px 18px',
            color: '#fef08a',
            fontSize: 13,
            lineHeight: 1.6,
            marginBottom: 20,
            fontFamily: "'Cinzel', serif"
          }}
        >
          "नमस्तेस्तु महामाये श्रीपीठे सुरपूजिते। शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते॥"
        </div>

        {/* Blessing Message notification */}
        {blessingMessage && (
          <div
            style={{
              backgroundColor: '#065f46',
              border: '1px solid #10b981',
              color: '#d1fae5',
              padding: '10px 18px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              animation: 'bounce 0.5s'
            }}
          >
            <Sparkles size={16} color="#fbbf24" />
            {blessingMessage}
          </div>
        )}
      </div>
    </div>
  );
}
