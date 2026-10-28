// Diwali Mahotsav Mela - Progressive Web App (PWA) Install Prompt Modal
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Share, PlusSquare, Check, Bell } from 'lucide-react';
import { notificationService } from '../services/notificationService';

export default function InstallPromptModal({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallAccepted
}) {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // Detect standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(isStandalone);
  }, []);

  if (!isOpen || isInstalled) return null;

  const handleInstallClick = async () => {
    // Request notification permission so the installed app receives live mela entrance alerts!
    if (notificationService.isSupported()) {
      notificationService.requestPermission().catch(() => {});
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          if (onInstallAccepted) onInstallAccepted();
          onClose();
        }
      } catch (err) {
        console.error('PWA install error:', err);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(9, 6, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        touchAction: 'manipulation'
      }}
      onClick={onClose}
    >
      <div
        className="modal-scrollable"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(440px, 95vw)',
          maxHeight: '90vh',
          backgroundColor: 'rgba(23, 14, 38, 0.98)',
          border: '2px solid #f59e0b',
          borderRadius: 24,
          boxShadow: '0 16px 48px rgba(0,0,0,0.85), 0 0 28px rgba(245, 158, 11, 0.45)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflowY: 'auto',
          animation: 'joinPopupSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* App Icon with Glow */}
        <div
          style={{
            position: 'relative',
            marginTop: 4,
            marginBottom: 14
          }}
        >
          <img
            src="/icon-192.png"
            alt="Diwali Mela Icon"
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.6), 0 0 16px rgba(234, 88, 12, 0.5)',
              border: '2.5px solid #fbbf24',
              objectFit: 'cover'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -6,
              right: -6,
              backgroundColor: '#ea580c',
              borderRadius: '50%',
              padding: 4,
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Smartphone size={14} color="#fff" />
          </div>
        </div>

        {/* Heading */}
        <h2
          style={{
            color: '#fef08a',
            fontSize: 'clamp(18px, 4.5vw, 22px)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: 4,
            fontFamily: "'Cinzel', serif",
            textShadow: '0 2px 8px rgba(0,0,0,0.6)'
          }}
        >
          Install Diwali Mela 🪔
        </h2>
        <p
          style={{
            color: '#fcd34d',
            fontSize: 13,
            textAlign: 'center',
            marginBottom: 16,
            fontWeight: 500
          }}
        >
          Add to Home Screen for 60FPS Fullscreen Phone Gameplay!
        </p>

        {/* Key Benefits List */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 16,
            padding: '12px 14px',
            marginBottom: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#f8fafc' }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span><strong>1-Tap Instant Launch:</strong> Opens directly like a native mobile app</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#f8fafc' }}>
            <span style={{ fontSize: 16 }}>📱</span>
            <span><strong>Fullscreen Experience:</strong> No browser URL bars or navigation clutter</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#f8fafc' }}>
            <span style={{ fontSize: 16 }}>🎆</span>
            <span><strong>Faster 60FPS Speed:</strong> Pre-caches fireworks, sounds, and stalls</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#fef08a' }}>
            <span style={{ fontSize: 16 }}>🔔</span>
            <span><strong>Live Friend Alerts:</strong> Get notified instantly when friends arrive at the Mela!</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#f8fafc' }}>
            <span style={{ fontSize: 16 }}>🪙</span>
            <span><strong>Zero Play Store Required:</strong> Free, lightweight (under 2MB) install</span>
          </div>
        </div>

        {/* Platform Specific Action / Instructions */}
        {deferredPrompt ? (
          // Android / Chrome / Edge 1-Tap Native Install
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleInstallClick}
              style={{
                width: '100%',
                backgroundColor: '#f59e0b',
                backgroundImage: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
                color: '#1a102a',
                border: 'none',
                borderRadius: 16,
                padding: '13px 20px',
                fontSize: 15,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.5)',
                animation: 'pulse 2s infinite ease-in-out'
              }}
            >
              <Download size={18} />
              <span>📲 Install App on Phone</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: 12,
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              Continue in Browser (Play Later)
            </button>
          </div>
        ) : isIOS ? (
          // iOS Safari Step-by-Step Instructions
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1.5px dashed rgba(245, 158, 11, 0.5)',
                borderRadius: 14,
                padding: '12px 14px',
                color: '#fef08a',
                fontSize: 12,
                lineHeight: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Share size={15} />
                <span>How to Install on iPhone / iPad:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ backgroundColor: '#ea580c', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>1</span>
                <span>Tap the <strong>Share</strong> button <Share size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> at the bottom of Safari.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ backgroundColor: '#ea580c', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>2</span>
                <span>Scroll down and tap <strong>'Add to Home Screen'</strong> <PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ backgroundColor: '#ea580c', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>3</span>
                <span>Tap <strong>Add</strong> in the top-right corner. Done!</span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 14,
                padding: '10px 16px',
                color: '#fef08a',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Got it, let's play!
            </button>
          </div>
        ) : (
          // Generic Mobile / Desktop Prompt (Browser menu install or auto-hook)
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 14,
                padding: '10px 12px',
                color: '#fef08a',
                fontSize: 12,
                textAlign: 'center',
                lineHeight: 1.4
              }}
            >
              💡 Tap your browser menu <strong>(⋮ or ⋯)</strong> and select <strong>'Install App'</strong> or <strong>'Add to Home screen'</strong>.
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                backgroundColor: '#f59e0b',
                color: '#1a102a',
                border: 'none',
                borderRadius: 14,
                padding: '11px 18px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Continue Playing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
