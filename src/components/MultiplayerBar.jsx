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
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 12,
        left: 16,
        right: 16,
        zIndex: 40,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        pointerEvents: 'none'
      }}
    >
      {/* 1. Left: Player Profile & Wallet */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
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
            padding: '5px 14px 5px 6px',
            color: '#fef08a',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
          }}
          title="Customize Avatar & Name"
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: player?.color || '#ea580c',
              border: '2px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14
            }}
          >
            {player?.turbanColor ? '👳' : '🪔'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ color: '#fff', fontSize: 12, lineHeight: 1.1 }}>{player?.name || 'You'}</span>
            <span style={{ color: '#f59e0b', fontSize: 10, fontWeight: 500 }}>Customize</span>
          </div>
        </button>

        {/* Coins Badge */}
        <div
          style={{
            backgroundColor: 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #f59e0b',
            borderRadius: 20,
            padding: '6px 14px',
            color: '#fef08a',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
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
            padding: '6px 12px',
            color: '#4ade80',
            fontSize: 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 6px #22c55e'
            }}
          />
          <span>{onlineCount > 1 ? `${onlineCount} Real People` : 'Public Mela'}</span>
        </div>
      </div>

      {/* 2. Center: Location Title Badge */}
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
          pointerEvents: 'auto'
        }}
      >
        <span style={{ fontSize: 16 }}>🪔</span>
        <span>
          Diwali Mela •{' '}
          <strong style={{ color: '#fbbf24' }}>{currentZone}</strong>
        </span>
      </div>

      {/* 3. Right: Audio, Invite Friends, Guide */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
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
            borderRadius: 20,
            padding: '6px 14px',
            color: '#38bdf8',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
          }}
          title="Invite friends with room link"
        >
          {copied ? <Check size={14} color="#4ade80" /> : <Share2 size={14} />}
          <span>{copied ? 'Link Copied!' : 'Invite Friends'}</span>
        </button>

        {/* Music Button */}
        <button
          onClick={handleToggleMusic}
          style={{
            backgroundColor: isMusicOn ? 'rgba(245, 158, 11, 0.35)' : 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: isMusicOn ? '1.5px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isMusicOn ? '#fef08a' : '#cbd5e1',
            cursor: 'pointer'
          }}
          title={isMusicOn ? 'Mute Festive Drone' : 'Play Festive Drone Music'}
        >
          <Music size={16} />
        </button>

        {/* SFX Mute/Unmute */}
        <button
          onClick={handleToggleMute}
          style={{
            backgroundColor: 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isMuted ? '#f87171' : '#cbd5e1',
            cursor: 'pointer'
          }}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Guide / How to Play */}
        <button
          onClick={onOpenGuide}
          style={{
            backgroundColor: 'rgba(20, 14, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
          title="Guide & How to Play"
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </header>
  );
}
