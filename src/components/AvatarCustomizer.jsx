// Avatar & Attire Customization Modal
import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

const COLOR_OPTIONS = [
  { name: 'Saffron Gold (केसरिया)', hex: '#ea580c' },
  { name: 'Royal Crimson (शाही लाल)', hex: '#dc2626' },
  { name: 'Emerald Green (पन्ना हरा)', hex: '#059669' },
  { name: 'Sapphire Blue (नीलम नीला)', hex: '#2563eb' },
  { name: 'Regal Purple (जामुनी)', hex: '#7c3aed' },
  { name: 'Rani Pink (रानी गुलाबी)', hex: '#db2777' }
];

const TURBAN_OPTIONS = [
  { name: 'Royal Turban (शाही पगड़ी)', color: '#f59e0b' },
  { name: 'Red Rajwadi Pagdi (लाल पगड़ी)', color: '#dc2626' },
  { name: 'Golden Safa (सुनहरा साफ़ा)', color: '#eab308' },
  { name: 'Festive Hairstyle (केश विन्यास)', color: null }
];

export default function AvatarCustomizer({
  isOpen,
  onClose,
  player,
  setPlayer,
  multiplayerManager
}) {
  const [name, setName] = useState(player.name || 'Diwali Celebrator');
  const [selectedColor, setSelectedColor] = useState(player.color || '#ea580c');
  const [selectedTurban, setSelectedTurban] = useState(player.turbanColor || '#f59e0b');

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = {
      ...player,
      name: name.trim() || 'Diwali Celebrator',
      color: selectedColor,
      turbanColor: selectedTurban
    };
    setPlayer(updated);
    if (multiplayerManager) {
      multiplayerManager.broadcastPlayerState(updated);
    }
    soundEngine.playCoinSound();
    onClose();
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
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: '#1b1227',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 22,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
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
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <h3
          style={{
            margin: 0,
            fontSize: 22,
            color: '#fef08a',
            fontFamily: "'Cinzel', serif",
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Sparkles size={20} color="#fbbf24" /> Customize Diwali Avatar
        </h3>

        {/* Live Preview Badge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backgroundColor: 'rgba(0,0,0,0.35)',
            borderRadius: 16,
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              backgroundColor: selectedColor,
              border: '3px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.5)'
            }}
          >
            {selectedTurban ? '👳' : '🪔'}
          </div>
          <span style={{ marginTop: 8, color: '#fde047', fontWeight: 700, fontSize: 14 }}>
            {name || 'Your Name'}
          </span>
        </div>

        {/* Name Input */}
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#fed7aa', marginBottom: 6, fontWeight: 600 }}>
            Your Name / Player Handle
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#fff',
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>

        {/* Kurta / Saree Color */}
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#fed7aa', marginBottom: 8, fontWeight: 600 }}>
            Festive Attire Color (कुर्ता / साड़ी रंग)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.hex}
                onClick={() => setSelectedColor(c.hex)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: selectedColor === c.hex ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: selectedColor === c.hex ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: '8px 10px',
                  color: '#e2e8f0',
                  fontSize: 11,
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: c.hex }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Turban / Hairstyle */}
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#fed7aa', marginBottom: 8, fontWeight: 600 }}>
            Festive Headgear (पगड़ी / केश)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {TURBAN_OPTIONS.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTurban(t.color)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: selectedTurban === t.color ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: selectedTurban === t.color ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: '8px 10px',
                  color: '#e2e8f0',
                  fontSize: 11,
                  cursor: 'pointer'
                }}
              >
                <span>{t.color ? '👳' : '✨'}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#f59e0b',
            border: 'none',
            borderRadius: 12,
            padding: '12px',
            color: '#1e1b4b',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 4
          }}
        >
          <Check size={18} /> Save & Enter Mela
        </button>
      </div>
    </div>
  );
}
