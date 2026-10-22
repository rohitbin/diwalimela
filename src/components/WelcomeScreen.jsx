// Grand Entrance Welcome Screen for Diwali Mahotsav Mela
import React, { useState } from 'react';
import { Sparkles, Users, Flame, Heart, Play } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

export default function WelcomeScreen({ onEnterMela, defaultRoomId }) {
  const [name, setName] = useState('Ankit');
  const [roomId, setRoomId] = useState(defaultRoomId || 'diwali-mela-main');
  const [color, setColor] = useState('#ea580c');
  const [turban, setTurban] = useState('#f59e0b');

  const handleSubmit = (e) => {
    e.preventDefault();
    soundEngine.init();
    soundEngine.playTempleBell();
    onEnterMela({
      name: name.trim() || 'Festive Friend',
      color,
      turbanColor: turban,
      roomId: roomId.trim() || 'diwali-mela-main'
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#090815',
        backgroundImage: `linear-gradient(to bottom, rgba(9, 8, 21, 0.55), rgba(9, 8, 21, 0.95)), url('/diwali_mela_banner.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          backgroundColor: 'rgba(23, 16, 36, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(245, 158, 11, 0.5)',
          borderRadius: 24,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 45px rgba(245, 158, 11, 0.3)',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Auspicious Diya Icon */}
        <div
          style={{
            fontSize: 48,
            marginBottom: 4,
            filter: 'drop-shadow(0 0 20px #f59e0b)'
          }}
        >
          🪔
        </div>

        {/* Title */}
        <h1
          style={{
            margin: '0 0 6px 0',
            fontSize: 32,
            color: '#fef08a',
            fontFamily: "'Rozha One', 'Cinzel', serif",
            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
          }}
        >
          दिवाली महोत्सव मेला
        </h1>
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: 18,
            color: '#f59e0b',
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            letterSpacing: 1.5
          }}
        >
          DIWALI CELEBRATION MELA
        </h2>

        <p
          style={{
            margin: '0 0 24px 0',
            color: '#fed7aa',
            fontSize: 13,
            lineHeight: 1.5,
            maxWidth: 460
          }}
        >
          Step into India's grandest festival fair! Visit the <strong>Cracker Shop</strong>, buy traditional fireworks, walk to the <strong>Dhamaka Ground</strong> to burst them, and celebrate live with <strong>real people</strong>!
        </p>

        {/* Feature Highlights Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 24
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 14,
              padding: '6px 12px',
              fontSize: 11,
              color: '#fde047',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Flame size={14} color="#f97316" /> Authentic Cracker Shop
          </div>
          <div
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 14,
              padding: '6px 12px',
              fontSize: 11,
              color: '#7dd3fc',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Users size={14} color="#38bdf8" /> Real People & Live Multiplayer
          </div>
          <div
            style={{
              backgroundColor: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: 14,
              padding: '6px 12px',
              fontSize: 11,
              color: '#f472b6',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sparkles size={14} color="#ec4899" /> 60FPS Fireworks Physics
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: 12, color: '#fed7aa', marginBottom: 6, fontWeight: 600 }}>
              Your Name:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name (e.g. Rahul, Priya)..."
              maxLength={20}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: 12, color: '#fed7aa', marginBottom: 6, fontWeight: 600 }}>
              Festival Room (Share room code with friends to celebrate together):
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="e.g. diwali-mela-main"
              maxLength={24}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#fde047',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          {/* Quick Attire Color Picker */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: 12, color: '#fed7aa', marginBottom: 6, fontWeight: 600 }}>
              Festive Kurta / Saree Color:
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { hex: '#ea580c', label: 'Gold' },
                { hex: '#dc2626', label: 'Red' },
                { hex: '#059669', label: 'Green' },
                { hex: '#2563eb', label: 'Blue' },
                { hex: '#7c3aed', label: 'Purple' }
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: c.hex,
                    border: color === c.hex ? '3px solid #fef08a' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transform: color === c.hex ? 'scale(1.08)' : 'scale(1)',
                    transition: 'transform 0.15s ease'
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Enter Button */}
          <button
            type="submit"
            style={{
              marginTop: 10,
              backgroundColor: '#f59e0b',
              backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              border: 'none',
              borderRadius: 14,
              padding: '14px 24px',
              color: '#1a0e05',
              fontSize: 16,
              fontWeight: 800,
              fontFamily: "'Cinzel', serif",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
              transition: 'transform 0.15s'
            }}
          >
            <Play size={18} fill="#1a0e05" />
            <span>ENTER DIWALI MELA (मेला में प्रवेश करें)</span>
          </button>
        </form>

        <span style={{ marginTop: 16, fontSize: 11, color: '#94a3b8' }}>
          ✨ Free ₹500 Shagun Bonus granted upon entrance!
        </span>
      </div>
    </div>
  );
}
