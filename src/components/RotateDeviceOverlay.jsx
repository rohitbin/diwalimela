// RotateDeviceOverlay - Prompts mobile/tablet users to turn device horizontally for landscape gameplay
import React, { useState, useEffect } from 'react';
import { requestLandscapeMode, isPortraitMobile } from '../utils/orientation';
import { Smartphone, RotateCw, Maximize2, X, Sparkles } from 'lucide-react';

export default function RotateDeviceOverlay() {
  const [isPortrait, setIsPortrait] = useState(() => isPortraitMobile());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOrientationOrResize = () => {
      const portrait = isPortraitMobile();
      setIsPortrait(portrait);
      // If rotated to landscape, reset dismissed flag so it will warn again if flipped back to portrait
      if (!portrait) {
        setDismissed(false);
      }
    };

    window.addEventListener('resize', handleOrientationOrResize);
    window.addEventListener('orientationchange', handleOrientationOrResize);

    return () => {
      window.removeEventListener('resize', handleOrientationOrResize);
      window.removeEventListener('orientationchange', handleOrientationOrResize);
    };
  }, []);

  if (!isPortrait || dismissed) return null;

  const handleRotateClick = async () => {
    await requestLandscapeMode();
    // Re-check orientation after a short delay to allow browser animation
    setTimeout(() => {
      setIsPortrait(isPortraitMobile());
    }, 400);
  };

  return (
    <div
      id="rotate-device-prompt-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(9, 8, 21, 0.96)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(24px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
        color: '#fef08a',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {/* Decorative Golden Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(234, 88, 12, 0) 70%)',
          pointerEvents: 'none',
          animation: 'pulse 2.5s infinite ease-in-out'
        }}
      />

      {/* Animated Phone Graphic Rotating from Portrait to Landscape */}
      <div
        style={{
          position: 'relative',
          width: 110,
          height: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}
      >
        {/* Pulsing Outer Glow Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px dashed rgba(251, 191, 36, 0.6)',
            animation: 'spinSlow 12s linear infinite'
          }}
        />

        {/* Device Rotation Icon Graphic */}
        <div
          style={{
            fontSize: 48,
            display: 'inline-block',
            animation: 'phoneRotateCycle 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }}
        >
          📱
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: '#ea580c',
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px #ea580c'
          }}
        >
          <RotateCw size={18} color="#fff" style={{ animation: 'spinSlow 3s linear infinite' }} />
        </div>
      </div>

      {/* Hindi & English Guidance Titles */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 20,
          padding: '4px 14px',
          fontSize: 12,
          fontWeight: 800,
          color: '#fbbf24',
          marginBottom: 12,
          letterSpacing: 0.5
        }}
      >
        <Sparkles size={14} color="#fbbf24" />
        <span>HORIZONTAL / LANDSCAPE MODE REQUIRED</span>
      </div>

      <h2
        style={{
          margin: '0 0 8px 0',
          fontSize: 'clamp(22px, 5.5vw, 28px)',
          fontWeight: 900,
          fontFamily: "'Rozha One', 'Cinzel', serif",
          color: '#fef08a',
          textShadow: '0 2px 14px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.4)'
        }}
      >
        फ़ोन को हॉरिजॉन्टल (आड़ा) घुमाएं 🔄
      </h2>

      <h3
        style={{
          margin: '0 0 14px 0',
          fontSize: 'clamp(14px, 3.8vw, 17px)',
          fontWeight: 700,
          color: '#f97316',
          fontFamily: "'Outfit', sans-serif"
        }}
      >
        Please Rotate Your Device to Landscape
      </h3>

      <p
        style={{
          margin: '0 0 24px 0',
          fontSize: 'clamp(12px, 3.2vw, 14px)',
          lineHeight: 1.5,
          color: '#fed7aa',
          maxWidth: 380
        }}
      >
        दीवाली मेला, गन फाइट और डांस फ्लोर का पूरा अनुभव लेने के लिए अपने फ़ोन को घुमाकर <strong>लैंडस्केप</strong> करें।
        <br />
        <span style={{ fontSize: 12, opacity: 0.85, marginTop: 4, display: 'inline-block' }}>
          (For the best wide arcade dual-thumb experience, turn phone sideways)
        </span>
      </p>

      {/* Main Action Button: Rotate & Enter Fullscreen */}
      <button
        onClick={handleRotateClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
          color: '#160d26',
          border: '2px solid #ffffff',
          borderRadius: 28,
          padding: '14px 28px',
          fontSize: 15,
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.6), 0 6px 20px rgba(0,0,0,0.6)',
          width: 'min(90vw, 320px)',
          marginBottom: 14,
          touchAction: 'manipulation'
        }}
      >
        <Maximize2 size={18} />
        <span>Rotate & Fullscreen ⛶</span>
      </button>

      {/* Secondary Dismiss Button in case physical auto-rotate is locked on device */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          fontSize: 12,
          fontWeight: 600,
          textDecoration: 'underline',
          cursor: 'pointer',
          padding: '8px 16px',
          opacity: 0.85,
          touchAction: 'manipulation'
        }}
      >
        Continue in vertical anyway ➔
      </button>

      <style>{`
        @keyframes phoneRotateCycle {
          0% {
            transform: rotate(0deg);
          }
          30% {
            transform: rotate(0deg);
          }
          55% {
            transform: rotate(90deg) scale(1.1);
          }
          85% {
            transform: rotate(90deg) scale(1.1);
          }
          100% {
            transform: rotate(0deg) scale(1);
          }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
