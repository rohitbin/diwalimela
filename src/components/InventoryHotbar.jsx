// Enhanced Bottom Hotbar & Quick Action Dock with Festive Attractions
import React from 'react';
import { CRACKERS } from '../data/crackers';
import { DANCE_STEPS } from '../game/MelaCanvas';
import { Flame, Sparkles, Store, Utensils, Bell, Coffee, Target, Gift } from 'lucide-react';

export default function InventoryHotbar({
  inventory,
  selectedCracker,
  setSelectedCracker,
  coins,
  onOpenShop,
  onOpenTemple,
  onOpenBalloonGame,
  onOpenChaiTapri,
  onOpenArmory,
  onOpenDjJukebox,
  onTriggerDance,
  isDancing,
  danceStep = 0
}) {
  const [dimensions, setDimensions] = React.useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  }));

  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isLandscape = dimensions.width >= dimensions.height;
  const isCompactLandscape = isLandscape && dimensions.height <= 520;
  const slotSize = isCompactLandscape ? 44 : 52;
  const iconSize = isCompactLandscape ? 15 : 18;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isCompactLandscape ? 'max(6px, env(safe-area-inset-bottom))' : 'max(8px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isCompactLandscape ? 4 : 6,
        maxWidth: isLandscape ? 'min(660px, calc(100vw - 250px))' : 'calc(100vw - 16px)',
        pointerEvents: 'none'
      }}
    >

      {/* 2. Main RPG Hotbar Dock */}
      <div
        className="horizontal-touch-scroll"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          backgroundColor: 'rgba(15, 10, 26, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(245, 158, 11, 0.45)',
          borderRadius: 20,
          padding: '6px 10px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.25)',
          overflowX: 'auto',
          maxWidth: '100%',
          pointerEvents: 'auto',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x'
        }}
      >
        {/* Quick Stalls & Games Group */}
        <div style={{ display: 'flex', gap: isCompactLandscape ? 4 : 5, paddingRight: isCompactLandscape ? 4 : 6, borderRight: '1px solid rgba(245, 158, 11, 0.3)' }}>
          {/* Shastra Armory (Bow & Gun) */}
          <button
            onClick={onOpenArmory}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selectedCracker?.isWeapon ? 'rgba(239, 68, 68, 0.4)' : 'rgba(180, 83, 9, 0.25)',
              border: selectedCracker?.isWeapon ? '1.5px solid #f87171' : '1px solid #b45309',
              borderRadius: 12,
              padding: isCompactLandscape ? '2px 6px' : '4px 8px',
              color: '#fef08a',
              fontSize: isCompactLandscape ? 9 : 10,
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: isCompactLandscape ? 42 : 50,
              height: slotSize
            }}
            title="Shastra Armory - Buy Ram Dhanush & Gun to Shoot Ravan"
          >
            <span style={{ fontSize: iconSize }}>🏹</span>
            <span style={{ marginTop: 1 }}>Armory</span>
          </button>

          {/* Yo Yo Honey Singh DJ Jukebox & Dance Floor */}
          <button
            onClick={onOpenDjJukebox}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(236, 72, 153, 0.25)',
              border: '1.5px solid #ec4899',
              borderRadius: 12,
              padding: isCompactLandscape ? '2px 6px' : '4px 8px',
              color: '#fbcfe8',
              fontSize: isCompactLandscape ? 9 : 10,
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: isCompactLandscape ? 44 : 50,
              height: slotSize
            }}
            title="Yo Yo Honey Singh DJ Jukebox & Songs"
          >
            <span style={{ fontSize: iconSize }}>🎧</span>
            <span style={{ marginTop: 1 }}>DJ Yo Yo</span>
          </button>

          {/* Dance / Celebrate Emote */}
          <button
            onClick={onTriggerDance}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDancing ? '#dc2626' : 'rgba(236, 72, 153, 0.25)',
              border: isDancing ? '1.5px solid #fef08a' : '1px solid #ec4899',
              borderRadius: 12,
              padding: isCompactLandscape ? '2px 4px' : '4px 6px',
              color: '#fbcfe8',
              fontSize: isCompactLandscape ? 8.5 : 9.5,
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: isCompactLandscape ? 44 : 54,
              height: slotSize,
              animation: isDancing ? 'pulse 0.5s infinite' : 'none'
            }}
            title={isDancing ? "Auto-Dancing! Tap to Stop (Key V)" : "Dance to Festive Dhol Beats (Key V)"}
          >
            <span style={{ fontSize: iconSize }}>
              {isDancing ? (DANCE_STEPS[danceStep % DANCE_STEPS.length]?.icon || '💃') : '💃'}
            </span>
            <span style={{ marginTop: 1 }}>
              {isDancing ? (DANCE_STEPS[danceStep % DANCE_STEPS.length]?.name?.split(' ')[0] || 'Dance') : 'Dance'}
            </span>
          </button>

          {/* Balloon Game */}
          <button
            onClick={onOpenBalloonGame}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(59, 130, 246, 0.25)',
              border: '1px solid #3b82f6',
              borderRadius: 12,
              padding: isCompactLandscape ? '2px 6px' : '4px 8px',
              color: '#bfdbfe',
              fontSize: isCompactLandscape ? 9 : 10,
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: isCompactLandscape ? 42 : 50,
              height: slotSize
            }}
            title="Lucky Balloon Shooting Stall"
          >
            <span style={{ fontSize: iconSize }}>🎯</span>
            <span style={{ marginTop: 1 }}>Shoot</span>
          </button>

          {/* Chai Tapri */}
          <button
            onClick={onOpenChaiTapri}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(234, 88, 12, 0.25)',
              border: '1px solid #ea580c',
              borderRadius: 12,
              padding: isCompactLandscape ? '2px 6px' : '4px 8px',
              color: '#fed7aa',
              fontSize: isCompactLandscape ? 9 : 10,
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: isCompactLandscape ? 42 : 50,
              height: slotSize
            }}
            title="Kulhad Chai & Samosa"
          >
            <span style={{ fontSize: iconSize }}>☕</span>
            <span style={{ marginTop: 1 }}>Chai</span>
          </button>

          {/* Cracker Shop */}
          <button
            onClick={onOpenShop}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(220, 38, 38, 0.25)',
              border: '1px solid #ef4444',
              borderRadius: 12,
              padding: isCompactLandscape ? '2px 6px' : '4px 10px',
              color: '#fecaca',
              fontSize: isCompactLandscape ? 9 : 10,
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: isCompactLandscape ? 42 : 50,
              height: slotSize
            }}
            title="Open Shri Ganesh Patakha Bhandar"
          >
            <span style={{ fontSize: iconSize }}>🧨</span>
            <span style={{ marginTop: 1 }}>Shop</span>
          </button>

          {/* Mandir */}
          <button
            onClick={onOpenTemple}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(202, 138, 4, 0.25)',
              border: '1px solid #ca8a04',
              borderRadius: 12,
              padding: isCompactLandscape ? '2px 6px' : '4px 8px',
              color: '#fef08a',
              fontSize: isCompactLandscape ? 9 : 10,
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: isCompactLandscape ? 42 : 50,
              height: slotSize
            }}
            title="Visit Lakshmi-Ganesh Mandir"
          >
            <span style={{ fontSize: iconSize }}>🔔</span>
            <span style={{ marginTop: 1 }}>Mandir</span>
          </button>
        </div>

        {/* Crackers Hotbar Slots */}
        <div style={{ display: 'flex', gap: isCompactLandscape ? 4 : 6, paddingLeft: 4 }}>
          {CRACKERS.map((cracker, idx) => {
            const invItem = inventory.find((i) => i.id === cracker.id);
            const count = invItem ? invItem.count : 0;
            const isSelected = selectedCracker?.id === cracker.id;

            return (
              <button
                key={cracker.id}
                onClick={() => {
                  if (count > 0) {
                    setSelectedCracker(isSelected ? null : cracker);
                  } else {
                    onOpenShop();
                  }
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected
                    ? 'rgba(245, 158, 11, 0.35)'
                    : count > 0
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.35)',
                  border: isSelected
                    ? '2px solid #fbbf24'
                    : count > 0
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : '1px dashed rgba(255, 255, 255, 0.12)',
                  borderRadius: isCompactLandscape ? 11 : 14,
                  width: slotSize,
                  height: slotSize,
                  cursor: 'pointer',
                  opacity: count > 0 ? 1 : 0.45,
                  boxShadow: isSelected ? '0 0 14px rgba(251, 191, 36, 0.6)' : 'none',
                  transform: isSelected ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'all 0.15s ease'
                }}
                title={`${cracker.name} (Hotkey ${idx + 1}) - ${count} in bag`}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 4,
                    fontSize: isCompactLandscape ? 8 : 9,
                    color: '#94a3b8',
                    fontWeight: 700
                  }}
                >
                  {idx < 9 ? idx + 1 : (idx === 9 ? '0' : '')}
                </span>

                <span style={{ fontSize: isCompactLandscape ? 16 : 19 }}>{cracker.icon}</span>

                <span
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 4,
                    fontSize: isCompactLandscape ? 9 : 10,
                    fontWeight: 700,
                    color: count > 0 ? '#fde047' : '#94a3b8'
                  }}
                >
                  {count > 0 ? `x${count}` : '+'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
