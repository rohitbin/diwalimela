// Yo Yo Honey Singh & Diwali Festive - DJ Jukebox & Real Music Player Modal
import React, { useState, useEffect } from 'react';
import { soundEngine, HONEY_SINGH_TRACKS, FESTIVE_DIWALI_TRACKS } from '../audio/soundEngine';
import {
  Disc,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Check,
  Music,
  Radio,
  Sliders
} from 'lucide-react';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function DjJukeboxModal({
  isOpen,
  onClose,
  onGoToDanceFloor,
  player
}) {
  const [activeTab, setActiveTab] = useState('honey'); // 'honey' | 'festive'
  const [currentTrack, setCurrentTrack] = useState(() => soundEngine.getCurrentHoneySinghTrack());
  const [currentFestiveTrack, setCurrentFestiveTrack] = useState(() => soundEngine.getCurrentFestiveTrack());
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  // Sync state when track changes from anywhere (e.g., in-game hotkeys or canvas)
  useEffect(() => {
    const handleHoneyChange = (e) => {
      if (e.detail) {
        setCurrentTrack(e.detail);
      }
    };
    const handleFestiveChange = (e) => {
      if (e.detail) {
        setCurrentFestiveTrack(e.detail);
      }
    };
    window.addEventListener('honeySinghTrackChanged', handleHoneyChange);
    window.addEventListener('festiveTrackChanged', handleFestiveChange);
    return () => {
      window.removeEventListener('honeySinghTrackChanged', handleHoneyChange);
      window.removeEventListener('festiveTrackChanged', handleFestiveChange);
    };
  }, []);

  // Update timer & playback state periodically while modal is open
  useEffect(() => {
    if (!isOpen) return;

    setCurrentTrack(soundEngine.getCurrentHoneySinghTrack());
    setCurrentFestiveTrack(soundEngine.getCurrentFestiveTrack());
    setIsMuted(soundEngine.isMuted);

    const updateAudioStatus = () => {
      if (activeTab === 'honey') {
        const audio = soundEngine.djAudio;
        if (audio) {
          setIsPlaying(!audio.paused && audio.currentTime > 0);
          setCurrentTime(audio.currentTime || 0);
          setDuration(audio.duration || 0);
        }
      } else {
        const audio = soundEngine.festiveAudio;
        if (audio) {
          setIsPlaying(!audio.paused && audio.currentTime > 0);
          setCurrentTime(audio.currentTime || 0);
          setDuration(audio.duration || 0);
        }
      }
    };

    updateAudioStatus();
    const timer = setInterval(updateAudioStatus, 250);
    return () => clearInterval(timer);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSelectTrack = (track) => {
    if (activeTab === 'honey') {
      soundEngine.setHoneySinghTrack(track.id);
      setCurrentTrack(track);
      soundEngine.playDjTrackManually?.();
      setIsPlaying(true);
    } else {
      const idx = FESTIVE_DIWALI_TRACKS.findIndex((t) => t.id === track.id);
      soundEngine.setFestiveTrack(idx);
      setCurrentFestiveTrack(track);
      if (!soundEngine.musicPlaying) {
        soundEngine.toggleFestiveMusic();
      }
      setIsPlaying(true);
    }
    soundEngine.playCoinSound?.();
  };

  const handleTogglePlay = () => {
    if (activeTab === 'honey') {
      if (isPlaying) {
        soundEngine.pauseDjTrackManually?.();
        setIsPlaying(false);
      } else {
        soundEngine.playDjTrackManually?.();
        setIsPlaying(true);
      }
    } else {
      const nextPlaying = soundEngine.toggleFestiveMusic();
      setIsPlaying(nextPlaying);
    }
  };

  const handleNextTrack = () => {
    if (activeTab === 'honey') {
      const next = soundEngine.nextHoneySinghTrack();
      if (next) {
        setCurrentTrack(next);
        soundEngine.playDjTrackManually?.();
        setIsPlaying(true);
      }
    } else {
      const next = soundEngine.nextFestiveTrack();
      if (next) {
        setCurrentFestiveTrack(next);
        if (!soundEngine.musicPlaying) soundEngine.toggleFestiveMusic();
        setIsPlaying(true);
      }
    }
  };

  const handlePrevTrack = () => {
    if (activeTab === 'honey') {
      const idx = HONEY_SINGH_TRACKS.findIndex((t) => t.id === currentTrack.id);
      const prevIdx = (idx - 1 + HONEY_SINGH_TRACKS.length) % HONEY_SINGH_TRACKS.length;
      const prev = soundEngine.setHoneySinghTrack(HONEY_SINGH_TRACKS[prevIdx].id);
      if (prev) {
        setCurrentTrack(prev);
        soundEngine.playDjTrackManually?.();
        setIsPlaying(true);
      }
    } else {
      const idx = FESTIVE_DIWALI_TRACKS.findIndex((t) => t.id === currentFestiveTrack.id);
      const prevIdx = (idx - 1 + FESTIVE_DIWALI_TRACKS.length) % FESTIVE_DIWALI_TRACKS.length;
      const prev = soundEngine.setFestiveTrack(prevIdx);
      if (prev) {
        setCurrentFestiveTrack(prev);
        if (!soundEngine.musicPlaying) soundEngine.toggleFestiveMusic();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e) => {
    const newPercent = parseFloat(e.target.value);
    const audio = activeTab === 'honey' ? soundEngine.djAudio : soundEngine.festiveAudio;
    if (audio && audio.duration) {
      const newTime = (newPercent / 100) * audio.duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (activeTab === 'honey' && soundEngine.djAudio) {
      soundEngine.djAudio.volume = isMuted ? 0 : val;
      soundEngine.djTargetVol = val;
    } else if (soundEngine.festiveAudio) {
      soundEngine.festiveAudio.volume = isMuted ? 0 : val;
      soundEngine.festiveVolume = val;
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.toggleMute();
  };

  const activeSong = activeTab === 'honey' ? currentTrack : currentFestiveTrack;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
          maxWidth: 640,
          maxHeight: '92vh',
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
                  REAL MUSIC JUKEBOX
                </h2>
                <span
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 10,
                    letterSpacing: 0.5
                  }}
                >
                  ● REAL MP3 AUDIO
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#fbcfe8', fontWeight: 500 }}>
                Yo Yo Honey Singh Hits & Diwali Festive Anthems • CD Quality Sound
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

        {/* Tab Selector: Honey Singh Hits vs Festive Diwali */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '6px 16px',
            gap: 8
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('honey')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 12,
              border: activeTab === 'honey' ? '1.5px solid #ec4899' : '1px solid transparent',
              backgroundColor: activeTab === 'honey' ? 'rgba(236, 72, 153, 0.22)' : 'transparent',
              color: activeTab === 'honey' ? '#fef08a' : '#94a3b8',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s'
            }}
          >
            <span>🎧</span>
            <span>Yo Yo Honey Singh Hits ({HONEY_SINGH_TRACKS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('festive')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 12,
              border: activeTab === 'festive' ? '1.5px solid #f59e0b' : '1px solid transparent',
              backgroundColor: activeTab === 'festive' ? 'rgba(245, 158, 11, 0.22)' : 'transparent',
              color: activeTab === 'festive' ? '#fef08a' : '#94a3b8',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s'
            }}
          >
            <span>🪔</span>
            <span>Diwali Festive Songs ({FESTIVE_DIWALI_TRACKS.length})</span>
          </button>
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
              background: activeTab === 'honey'
                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.25) 100%)'
                : 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(180, 83, 9, 0.25) 100%)',
              border: `2px solid ${activeTab === 'honey' ? 'rgba(236, 72, 153, 0.6)' : 'rgba(245, 158, 11, 0.6)'}`,
              borderRadius: 20,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(236, 72, 153, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Spinning Vinyl Record Visual */}
                <div
                  style={{
                    position: 'relative',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #334155 0%, #0f172a 40%, #000000 80%)',
                    border: `3px solid ${activeTab === 'honey' ? '#ec4899' : '#f59e0b'}`,
                    boxShadow: `0 0 20px ${activeTab === 'honey' ? 'rgba(236, 72, 153, 0.6)' : 'rgba(245, 158, 11, 0.6)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: isPlaying ? 'spin 3s linear infinite' : 'none',
                    flexShrink: 0
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: activeTab === 'honey' ? '#f43f5e' : '#f59e0b',
                      border: '2px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12
                    }}
                  >
                    {activeSong?.emoji || '🎵'}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span
                      style={{
                        backgroundColor: isPlaying ? '#22c55e' : '#64748b',
                        color: '#052e16',
                        fontSize: 9,
                        fontWeight: 900,
                        padding: '2px 7px',
                        borderRadius: 6,
                        letterSpacing: 0.8
                      }}
                    >
                      {isPlaying ? '● NOW PLAYING' : '❚❚ PAUSED'}
                    </span>
                    <span style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>
                      {activeSong?.style || activeSong?.artist || 'Festive Audio'}
                    </span>
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 19,
                      fontWeight: 900,
                      color: '#fef08a',
                      fontFamily: '"Outfit", sans-serif'
                    }}
                  >
                    {activeSong?.title}{' '}
                    <span style={{ fontSize: 14, color: '#fbcfe8', fontWeight: 600 }}>
                      ({activeSong?.hindiTitle})
                    </span>
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: 11.5, color: '#fed7aa', fontWeight: 600 }}>
                    {activeSong?.tagline}
                  </p>
                </div>
              </div>

              {/* Play / Pause / Skip Audio Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handlePrevTrack}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: 34,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                  title="Previous Song"
                >
                  <SkipBack size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlay}
                  style={{
                    background: activeTab === 'honey'
                      ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
                  }}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
                </button>

                <button
                  type="button"
                  onClick={handleNextTrack}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: 34,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                  title="Next Song"
                >
                  <SkipForward size={16} />
                </button>
              </div>
            </div>

            {/* Audio Scrubbing Bar & Time */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progressPercent}
                onChange={handleSeek}
                style={{
                  width: '100%',
                  accentColor: activeTab === 'honey' ? '#ec4899' : '#f59e0b',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
                <span>{formatTime(currentTime)}</span>
                <span>{duration > 0 ? formatTime(duration) : 'Live Stream'}</span>
              </div>
            </div>

            {/* Volume Control Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px 0' }}>
              <Volume2 size={15} color="#94a3b8" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{
                  flex: 1,
                  accentColor: activeTab === 'honey' ? '#ec4899' : '#f59e0b',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: 10, color: '#94a3b8', minWidth: 32, textAlign: 'right' }}>
                {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>

          {/* Tracklist Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#fbcfe8', letterSpacing: 0.5 }}>
                {activeTab === 'honey'
                  ? `SELECT YO YO HIT (${HONEY_SINGH_TRACKS.length} SONGS)`
                  : `SELECT FESTIVE DIWALI SONG (${FESTIVE_DIWALI_TRACKS.length} SONGS)`}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Click track to play in full HQ audio
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {(activeTab === 'honey' ? HONEY_SINGH_TRACKS : FESTIVE_DIWALI_TRACKS).map((track, idx) => {
                const isSelected = activeTab === 'honey'
                  ? track.id === currentTrack.id
                  : track.id === currentFestiveTrack.id;

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
                          {track.year && (
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
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          {track.style || track.artist} •{' '}
                          <span style={{ color: '#22c55e', fontWeight: 700 }}>MP3 Audio</span> •{' '}
                          <span style={{ color: '#fed7aa' }}>{track.tagline}</span>
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
                          <span>{isPlaying ? 'PLAYING' : 'LOADED'}</span>
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
          {activeTab === 'honey' && currentTrack.lyrics && (
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
          )}
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
