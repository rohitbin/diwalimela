// Diwali Celebration Mela Guide & Cultural Significance Modal
import React from 'react';
import { X, Sparkles, Compass, Shield, Flame, Heart } from 'lucide-react';

export default function DiwaliGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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
          maxWidth: 640,
          maxHeight: '90vh',
          backgroundColor: '#1a1326',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 22,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9)'
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

        <div>
          <h2
            style={{
              margin: '0 0 6px 0',
              fontSize: 24,
              color: '#fef08a',
              fontFamily: "'Rozha One', 'Cinzel', serif"
            }}
          >
            🪔 Diwali Mahotsav Mela Guide
          </h2>
          <span style={{ fontSize: 13, color: '#fed7aa' }}>
            The Festival of Lights • Victory of Light over Darkness
          </span>
        </div>

        {/* 1. Cultural Meaning */}
        <div
          style={{
            backgroundColor: 'rgba(120, 53, 15, 0.25)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 14,
            padding: 14,
            fontSize: 13,
            color: '#fef08a',
            lineHeight: 1.6
          }}
        >
          <strong>About Deepawali:</strong> Deepawali (दिवाली) symbolizes the triumph of light over spiritual darkness and knowledge over ignorance. People illuminate homes with earthen oil lamps (diyas), craft vibrant rangolis, share sweets (mithai), and gather with loved ones to celebrate with sparkling fireworks.
        </div>

        {/* 2. Controls & How to Play */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h4 style={{ margin: 0, fontSize: 16, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Compass size={18} /> How to Celebrate in the Mela
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: '#cbd5e1' }}>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
              <strong style={{ color: '#fbbf24' }}>🚶 Movement:</strong>
              <div>• Use <strong>W, A, S, D</strong> or <strong>Arrow Keys</strong></div>
              <div>• Or simply <strong>Click/Tap</strong> anywhere on ground to walk there</div>
              <div>• On mobile, use the virtual touch joystick</div>
            </div>

            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
              <strong style={{ color: '#fbbf24' }}>🧨 Buying Fireworks:</strong>
              <div>• Visit <strong>Shri Ganesh Patakha Bhandar</strong> in the East</div>
              <div>• Claim ₹200 free Shagun bonus</div>
              <div>• Test sounds and buy Phuljhadi, Anar, Rockets, Chakri, Sutli bomb</div>
            </div>

            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
              <strong style={{ color: '#fbbf24' }}>🎆 Bursting Fireworks:</strong>
              <div>• Select cracker from bottom hotbar (Keys 1-8)</div>
              <div>• Tap or click anywhere on the ground to place it</div>
              <div>• Watch the fuse sizzle, run back, and enjoy the realistic blast!</div>
            </div>

            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10 }}>
              <strong style={{ color: '#fbbf24' }}>👥 Real People & Townspeople:</strong>
              <div>• Real friends can join you in real-time via <strong>Invite Link</strong></div>
              <div>• Chat and send festive greetings with speech bubbles</div>
              <div>• NPCs react and cheer when you light fireworks!</div>
            </div>
          </div>
        </div>

        {/* 3. Safety Notice */}
        <div
          style={{
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: 12,
            padding: 12,
            fontSize: 12,
            color: '#fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <Shield size={20} color="#f87171" />
          <span>
            <strong>Eco & Safety Friendly Celebration:</strong> This virtual webgame provides 100% pollution-free, safe, and thrilling fireworks joy with realistic particle physics and spatial audio!
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            backgroundColor: '#f59e0b',
            border: 'none',
            borderRadius: 12,
            padding: '10px',
            color: '#1e1b4b',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          Got it! Let's Celebrate Shubh Deepawali! 🪔
        </button>
      </div>
    </div>
  );
}
