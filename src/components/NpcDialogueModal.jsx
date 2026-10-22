// Dialogue modal for interacting with lively townspeople
import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { MessageSquare, Sparkles, X, Gift } from 'lucide-react';

export default function NpcDialogueModal({
  npc,
  onClose,
  coins,
  setCoins
}) {
  const [shagunClaimed, setShagunClaimed] = useState(false);

  if (!npc) return null;

  const handleGreet = () => {
    soundEngine.playCoinSound();
    if (!shagunClaimed) {
      setShagunClaimed(true);
      const gift = npc.giftCoins || 40;
      setCoins((c) => c + gift);
      alert(`${npc.name}: "Jeete raho! Here is ₹${gift} Shagun Coins for your Diwali fireworks and sweets!"`);
    } else {
      alert(`${npc.name}: "Shubh Deepawali to you and your entire family! Enjoy the festive mela!"`);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 3, 15, 0.82)',
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
          maxWidth: 520,
          maxHeight: 'min(94vh, 650px)',
          overflowY: 'auto',
          backgroundColor: '#1c152a',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 22,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)',
          padding: 'clamp(16px, 4vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* NPC Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: npc.color || '#ea580c',
              border: '3px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)'
            }}
          >
            {npc.turban ? '👳' : '🪔'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, color: '#fef08a' }}>{npc.name}</h3>
            <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>{npc.role}</span>
          </div>
        </div>

        {/* Dialogue Box */}
        <div
          style={{
            backgroundColor: 'rgba(30, 20, 48, 0.9)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 14,
            padding: 16,
            color: '#e2e8f0',
            fontSize: 14,
            lineHeight: 1.6
          }}
        >
          <p style={{ margin: 0 }}>
            "{npc.bubble || 'Shubh Deepawali! The mela is so lively today. Don’t miss the fireworks in the night sky!'}"
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={handleGreet}
            style={{
              backgroundColor: '#f59e0b',
              border: 'none',
              borderRadius: 10,
              padding: '10px 18px',
              color: '#1e1b4b',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <Gift size={16} /> Greet "Happy Diwali!" 🙏
          </button>
        </div>
      </div>
    </div>
  );
}
