// Modern Glassmorphic Top Navigation & HUD Bar
import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Users, Volume2, VolumeX, Music, Share2, HelpCircle, User, Sparkles, Check, MapPin } from 'lucide-react';

export default function MultiplayerBar({
  roomId,
  onlineCount,
  onOpenCustomizer,
  onOpenGuide,
  coins,
  player,
  currentZone
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 680;
  const isTablet = windowWidth < 960;

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMusic = () => {
    const playing = soundEngine.toggleFestiveMusic();
    setIsMusicOn(playing);
  };

  const handleShareInvite = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    const shareData = {
      title: 'Diwali Mahotsav Mela 🪔',
      text: 'Join me in the Diwali Mela! Burst crackers, enjoy sweets, and celebrate live together! ✨🎆',
      url: url.toString()
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(url.toString()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
          });
        }
      });
    } else {
      navigator.clipboard.writeText(url.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 'max(8px, env(safe-area-inset-top))',
        left: 'max(8px, env(safe-area-inset-left))',
        right: 'max(8px, env(safe-area-inset-right))',
        zIndex: 40,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: isMobile ? 6 : 10,
        pointerEvents: 'none'
      }}
    >
      {/* 1. Left: Player Profile & Wallet */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 5 : 8,
          pointerEvents: 'auto'
        }}
      >
        {/* Profile Chip */}
        <button
          onClick={onOpenCustomizer}
          style={{
            backgroundColor: 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(245, 158, 11, 0.45)',
            borderRadius: 24,
            padding: isMobile ? '4px 8px 4px 5px' : '5px 14px 5px 6px',
            color: '#fef08a',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 6 : 8,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            touchAction: 'manipulation'
          }}
          title="Customize Avatar & Name"
        >
          <div
            style={{
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28,
              borderRadius: '50%',
              backgroundColor: player?.color || '#ea580c',
              border: '2px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? 12 : 14,
              flexShrink: 0
            }}
          >
            {player?.turbanColor ? '👳' : '🪔'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span
              style={{
                color: '#fff',
                fontSize: isMobile ? 11 : 12,
                lineHeight: 1.1,
                maxWidth: isMobile ? 65 : 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {player?.name || 'You'}
            </span>
            {!isMobile && (
              <span style={{ color: '#f59e0b', fontSize: 10, fontWeight: 500 }}>Customize</span>
            )}
          </div>
        </button>

        {/* Coins Badge */}
        <div
          style={{
            backgroundColor: 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #f59e0b',
            borderRadius: 20,
            padding: isMobile ? '5px 8px' : '6px 14px',
            color: '#fef08a',
            fontSize: isMobile ? 11 : 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap'
          }}
        >
          <span>🪙</span>
          <span>₹{coins}</span>
        </div>

        {/* Online real people count */}
        <div
          style={{
            backgroundColor: 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            borderRadius: 20,
            padding: isMobile ? '5px 8px' : '6px 12px',
            color: '#4ade80',
            fontSize: isMobile ? 10 : 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap'
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              flexShrink: 0
            }}
          />
          <span>
            {isMobile
              ? onlineCount > 1
                ? onlineCount
                : 'Mela'
              : onlineCount > 1
              ? `${onlineCount} Real People`
              : 'Public Mela'}
          </span>
        </div>
      </div>

      {/* 2. Center: Location Title Badge (Visible on Tablet & Desktop) */}
      {!isTablet && (
        <div
          style={{
            backgroundColor: 'rgba(18, 12, 30, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 24,
            padding: '6px 20px',
            color: '#fef08a',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            boxShadow: '0 4px 18px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            pointerEvents: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: 16 }}>🪔</span>
          <span>
            Diwali Mela •{' '}
            <strong style={{ color: '#fbbf24' }}>{currentZone}</strong>
          </span>
        </div>
      )}

      {/* 3. Right: Audio, Invite Friends, Guide */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 5 : 8,
          pointerEvents: 'auto'
        }}
      >
        {/* Invite Friends */}
        <button
          onClick={handleShareInvite}
          style={{
            backgroundColor: 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            borderRadius: isMobile ? '50%' : 20,
            width: isMobile ? 32 : 'auto',
            height: isMobile ? 32 : 'auto',
            padding: isMobile ? 0 : '6px 14px',
            color: '#38bdf8',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            touchAction: 'manipulation'
          }}
          title={copied ? 'Link Copied!' : 'Invite friends with room link'}
        >
          {copied ? <Check size={isMobile ? 15 : 14} color="#4ade80" /> : <Share2 size={isMobile ? 15 : 14} />}
          {!isMobile && <span>{copied ? 'Link Copied!' : 'Invite Friends'}</span>}
        </button>

        {/* Music Button */}
        <button
          onClick={handleToggleMusic}
          style={{
            backgroundColor: isMusicOn ? 'rgba(245, 158, 11, 0.35)' : 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: isMusicOn ? '1.5px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isMusicOn ? '#fef08a' : '#cbd5e1',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
          title={isMusicOn ? 'Mute Festive Drone' : 'Play Festive Drone Music'}
        >
          <Music size={isMobile ? 14 : 16} />
        </button>

        {/* SFX Mute/Unmute */}
        <button
          onClick={handleToggleMute}
          style={{
            backgroundColor: 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isMuted ? '#f87171' : '#cbd5e1',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX size={isMobile ? 14 : 16} /> : <Volume2 size={isMobile ? 14 : 16} />}
        </button>

        {/* Guide / How to Play */}
        <button
          onClick={onOpenGuide}
          style={{
            backgroundColor: 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
          title="Guide & How to Play"
        >
          <HelpCircle size={isMobile ? 14 : 16} />
        </button>
      </div>
    </header>
  );
}
