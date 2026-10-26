// Yo Yo Honey Singh - DJ Jukebox & Hit Tracks Selector Modal
import React, { useState, useEffect } from 'react';
import { soundEngine, HONEY_SINGH_TRACKS } from '../audio/soundEngine';
import { Disc, Play, Volume2, VolumeX, Sparkles, X, Check, Music } from 'lucide-react';

export default function DjJukeboxModal({
  isOpen,
  onClose,
  onGoToDanceFloor,
  player
}) {
  const [currentTrack, setCurrentTrack] = useState(() => soundEngine.getCurrentHoneySinghTrack());
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);

  // Sync state when track changes from anywhere (e.g., in-game hotkeys or canvas)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) {
        setCurrentTrack(e.detail);
      }
    };
    window.addEventListener('honeySinghTrackChanged', handler);
    return () => window.removeEventListener('honeySinghTrackChanged', handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentTrack(soundEngine.getCurrentHoneySinghTrack());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTrack = (track) => {
    soundEngine.setHoneySinghTrack(track.id);
    setCurrentTrack(track);
    soundEngine.playCoinSound?.();
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.toggleMute();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        backgroundColor: 'rgba(7, 4, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          backgroundColor: '#120b22',
          border: '2px solid rgba(236, 72, 153, 0.65)',
          borderRadius: 24,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(236, 72, 153, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #831843 0%, #3b0764 50%, #0f172a 100%)',
            borderBottom: '1px solid rgba(236, 72, 153, 0.4)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #facc15 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 18px rgba(236, 72, 153, 0.8)',
                fontSize: 22
              }}
            >
              🎧
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: 0.5,
                    color: '#ffffff',
                    fontFamily: '"Outfit", sans-serif'
                  }}
                >
                  YO YO DJ JUKEBOX
                </h2>
                <span
                  style={{
                    backgroundColor: '#ec4899',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 10,
                    letterSpacing: 0.5
                  }}
                >
                  HONEY SINGH HITS
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#fbcfe8', fontWeight: 500 }}>
                यो यो हनी सिंह • Desi Club Sound System & Spatial Dance Floor
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handleToggleMute}
              style={{
                background: isMuted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 10,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isMuted ? '#fca5a5' : '#fef08a',
                cursor: 'pointer'
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                borderRadius: '50%',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            padding: 18,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {/* Active Now Playing Showcase Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.18) 0%, rgba(139, 92, 246, 0.2) 100%)',
              border: '2px solid rgba(236, 72, 153, 0.55)',
              borderRadius: 18,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(236, 72, 153, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Spinning Vinyl Record Visual */}
              <div
                style={{
                  position: 'relative',
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #334155 0%, #0f172a 40%, #000000 80%)',
                  border: '3px solid #ec4899',
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'spin 4s linear infinite',
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#f43f5e',
                    border: '2px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12
                  }}
                >
                  {currentTrack.emoji || '🎵'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span
                    style={{
                      backgroundColor: '#22c55e',
                      color: '#052e16',
                      fontSize: 9,
                      fontWeight: 900,
                      padding: '2px 7px',
                      borderRadius: 6,
                      letterSpacing: 0.8
                    }}
                  >
                    ● NOW PLAYING
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>
                    {currentTrack.bpm} BPM • {currentTrack.style}
                  </span>
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 900,
                    color: '#fef08a',
                    fontFamily: '"Outfit", sans-serif'
                  }}
                >
                  {currentTrack.title} <span style={{ fontSize: 14, color: '#fbcfe8', fontWeight: 600 }}>({currentTrack.hindiTitle})</span>
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#fed7aa', fontWeight: 600 }}>
                  {currentTrack.tagline}
                </p>
              </div>
            </div>

            {/* Equalizer Spectrum Animation */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32, flexShrink: 0 }}>
              {[0.4, 0.9, 0.6, 1.0, 0.7, 0.5].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: `${h * 100}%`,
                    backgroundColor: i % 2 === 0 ? '#ec4899' : '#06b6d4',
                    borderRadius: 2,
                    animation: `pulse ${0.4 + i * 0.15}s ease-in-out infinite alternate`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Honey Singh Hit Songs Tracklist */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#fbcfe8', letterSpacing: 0.5 }}>
                SELECT YO YO TRACK ({HONEY_SINGH_TRACKS.length} SONGS)
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Tap song to switch immediately
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {HONEY_SINGH_TRACKS.map((track, idx) => {
                const isSelected = track.id === currentTrack.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 14,
                      backgroundColor: isSelected ? 'rgba(236, 72, 153, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1.8px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected ? '0 4px 18px rgba(236, 72, 153, 0.35)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: isSelected ? '#ec4899' : '#1e1b4b',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          fontWeight: 900
                        }}
                      >
                        {track.emoji}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: isSelected ? '#fef08a' : '#ffffff' }}>
                            {idx + 1}. {track.title}
                          </span>
                          <span style={{ fontSize: 12, color: '#f472b6', fontWeight: 600 }}>
                            {track.hindiTitle}
                          </span>
                          <span
                            style={{
                              fontSize: 9.5,
                              color: '#cbd5e1',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              padding: '2px 6px',
                              borderRadius: 6
                            }}
                          >
                            {track.year}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          {track.style} • {track.bpm} BPM • <span style={{ color: '#fbcfe8' }}>"{track.lyrics[0].replace(/.*"([^"]+)".*/, '$1')}"</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isSelected ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            backgroundColor: '#ec4899',
                            color: '#ffffff',
                            padding: '6px 12px',
                            borderRadius: 18,
                            fontSize: 11,
                            fontWeight: 800,
                            boxShadow: '0 2px 10px rgba(236, 72, 153, 0.5)'
                          }}
                        >
                          <Check size={14} />
                          <span>PLAYING</span>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#fbcfe8',
                            padding: '6px 12px',
                            borderRadius: 18,
                            fontSize: 11,
                            fontWeight: 700
                          }}
                        >
                          <Play size={13} />
                          <span>PLAY</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Karaoke Lyrics Preview Box */}
          <div
            style={{
              backgroundColor: 'rgba(15, 10, 26, 0.7)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 14,
              padding: '12px 16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>🎤</span>
              <span style={{ color: '#fef08a', fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
                DJ YO YO KARAOKE LYRICS & PUNCHLINES:
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {currentTrack.lyrics.map((line, idx) => (
                <div key={idx} style={{ color: '#fed7aa', fontSize: 12, fontWeight: 500 }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bar with "Dance on Floor" Button */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#0a0714',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🎧</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Spatial Audio: Sounds loud on the floor, fades smoothly away!
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onGoToDanceFloor) onGoToDanceFloor();
              onClose();
            }}
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 50%, #8b5cf6 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 20,
              padding: '10px 22px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 18px rgba(236, 72, 153, 0.6)'
            }}
          >
            <span>🕺</span>
            <span>Go to Dance Floor Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
