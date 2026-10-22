import React, { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import { MELA_ZONES } from '../game/MelaCanvas';

export default function MiniMap({
  player,
  onNavigateTo,
  remotePlayers,
  multiplayerManager,
  diyas = []
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [crackerPings, setCrackerPings] = useState([]);

  useEffect(() => {
    if (!multiplayerManager) return;
    const unsub = multiplayerManager.onCracker((evt) => {
      if (!evt || !evt.x || !evt.y) return;
      const pingId = `ping_${Date.now()}_${Math.random()}`;
      setCrackerPings((prev) => [
        ...prev.slice(-4),
        { id: pingId, x: evt.x, y: evt.y, icon: evt.icon || '💥', name: evt.placedBy || 'Friend' }
      ]);
      setTimeout(() => {
        setCrackerPings((prev) => prev.filter((p) => p.id !== pingId));
      }, 3500);
    });
    return () => unsub();
  }, [multiplayerManager]);

  const mapW = 190;
  const mapH = 133;
  const scaleX = mapW / 2000;
  const scaleY = mapH / 1400;

  const toMapX = (wx) => wx * scaleX;
  const toMapY = (wy) => wy * scaleY;

  const litDiyasCount = diyas.filter((d) => d.isLit).length;

  const poiList = [
    { key: 'ENTRANCE', label: 'Entrance', icon: '🏮', x: MELA_ZONES.ENTRANCE.x, y: MELA_ZONES.ENTRANCE.y },
    { key: 'FERRIS_WHEEL', label: 'Giant Wheel', icon: '🎡', x: MELA_ZONES.FERRIS_WHEEL.x, y: MELA_ZONES.FERRIS_WHEEL.y },
    { key: 'BALLOON_STALL', label: 'Balloons', icon: '🎯', x: MELA_ZONES.BALLOON_STALL.x, y: MELA_ZONES.BALLOON_STALL.y },
    { key: 'CRACKER_SHOP', label: 'Patakha Shop', icon: '🧨', x: MELA_ZONES.CRACKER_SHOP.x, y: MELA_ZONES.CRACKER_SHOP.y },
    { key: 'DHAMAKA_GROUND', label: 'Dhamaka Ground', icon: '🎆', x: MELA_ZONES.DHAMAKA_GROUND.x, y: MELA_ZONES.DHAMAKA_GROUND.y },
    { key: 'SWEETS_STALL', label: 'Sweets', icon: '🥨', x: MELA_ZONES.SWEETS_STALL.x, y: MELA_ZONES.SWEETS_STALL.y },
    { key: 'CHAI_TAPRI', label: 'Chai Tapri', icon: '☕', x: MELA_ZONES.CHAI_TAPRI.x, y: MELA_ZONES.CHAI_TAPRI.y },
    { key: 'FORTUNE_WHEEL', label: 'Fortune Spin', icon: '💰', x: MELA_ZONES.FORTUNE_WHEEL.x, y: MELA_ZONES.FORTUNE_WHEEL.y },
    { key: 'TEMPLE', label: 'Mandir', icon: '🔔', x: MELA_ZONES.TEMPLE.x, y: MELA_ZONES.TEMPLE.y },
    { key: 'RANGOLI_PAVILION', label: 'Rangoli', icon: '🌸', x: MELA_ZONES.RANGOLI_PAVILION.x, y: MELA_ZONES.RANGOLI_PAVILION.y },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 66,
        right: 16,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        pointerEvents: 'auto'
      }}
    >
      {/* Header pill */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          backgroundColor: 'rgba(23, 16, 36, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 16,
          padding: '4px 12px',
          color: '#fef08a',
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
        }}
      >
        <Navigation size={12} color="#f59e0b" />
        <span>Mela Radar</span>
        <span style={{ color: '#94a3b8', fontSize: 10 }}>
          {collapsed ? '▼' : '▲'}
        </span>
      </div>

      {/* MiniMap Canvas Box */}
      {!collapsed && (
        <div
          style={{
            width: mapW,
            height: mapH,
            backgroundColor: 'rgba(13, 11, 26, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '2px solid rgba(245, 158, 11, 0.45)',
            borderRadius: 14,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'crosshair'
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickMapX = e.clientX - rect.left;
            const clickMapY = e.clientY - rect.top;
            const worldTargetX = clickMapX / scaleX;
            const worldTargetY = clickMapY / scaleY;
            onNavigateTo(worldTargetX, worldTargetY);
          }}
          title="Click anywhere to walk there!"
        >
          {/* Main roads */}
          <div
            style={{
              position: 'absolute',
              left: toMapX(880),
              top: toMapY(160),
              width: 240 * scaleX,
              height: 1100 * scaleY,
              backgroundColor: 'rgba(153, 27, 27, 0.35)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: toMapX(400),
              top: toMapY(590),
              width: 1200 * scaleX,
              height: 120 * scaleY,
              backgroundColor: 'rgba(245, 158, 11, 0.14)'
            }}
          />

          {/* Dhamaka Ground outline */}
          <div
            style={{
              position: 'absolute',
              left: toMapX(1250),
              top: toMapY(740),
              width: 480 * scaleX,
              height: 500 * scaleY,
              border: '1px dashed #eab308',
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              borderRadius: 4
            }}
          />

          {/* POI Markers */}
          {poiList.map((poi) => (
            <div
              key={poi.key}
              style={{
                position: 'absolute',
                left: toMapX(poi.x),
                top: toMapY(poi.y),
                transform: 'translate(-50%, -50%)',
                fontSize: 10,
                cursor: 'pointer',
                filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.9))'
              }}
              title={poi.label}
            >
              {poi.icon}
            </div>
          ))}

          {/* Live Online Real Players on MiniMap */}
          {remotePlayers &&
            Array.from(remotePlayers.values()).map((p) => (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: toMapX(p.x),
                  top: toMapY(p.y),
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  zIndex: 10
                }}
                title={`🟢 ${p.name || 'Player'} (Live)`}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    border: '1.5px solid #ffffff',
                    boxShadow: '0 0 8px #22c55e',
                    animation: 'pulse 1.2s infinite'
                  }}
                />
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    color: '#86efac',
                    textShadow: '0 1px 4px rgba(0,0,0,0.95)',
                    whiteSpace: 'nowrap',
                    marginTop: 1
                  }}
                >
                  {p.name ? p.name.split(' ')[0] : 'Live'}
                </span>
              </div>
            ))}

          {/* Current Local Player Blip */}
          <div
            style={{
              position: 'absolute',
              left: toMapX(player.x),
              top: toMapY(player.y),
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#fbbf24',
              border: '1.5px solid #fff',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 8px #f59e0b',
              animation: 'pulse 1s infinite'
            }}
          />

          {/* Real-time Cracker Bursts on MiniMap Radar */}
          {crackerPings.map((cp) => (
            <div
              key={cp.id}
              style={{
                position: 'absolute',
                left: toMapX(cp.x),
                top: toMapY(cp.y),
                transform: 'translate(-50%, -50%)',
                fontSize: 12,
                animation: 'bounce 0.6s infinite',
                filter: 'drop-shadow(0 0 6px #f59e0b)',
                pointerEvents: 'none',
                zIndex: 15
              }}
              title={`${cp.name} burst a cracker!`}
            >
              {cp.icon}
            </div>
          ))}

          {/* Diya stats in corner */}
          <div
            style={{
              position: 'absolute',
              bottom: 3,
              left: 6,
              fontSize: 9,
              color: '#fef08a',
              fontWeight: 700,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)'
            }}
          >
            🪔 {litDiyasCount}/16 Lit
          </div>
        </div>
      )}
    </div>
  );
}
