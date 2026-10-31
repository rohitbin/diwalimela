// Gun Fight PvP Duel Modal & Live Combat HUD
import React from 'react';
import { Swords, Shield, Crosshair, Award, Skull, X, Check, Flame } from 'lucide-react';

export default function GunFightModal({
  gunFight,
  onAccept,
  onDecline,
  onCancelChallenge,
  onForfeit,
  myPlayer
}) {
  if (!gunFight || gunFight.status === 'IDLE') return null;

  const isChallengeReceived = gunFight.status === 'CHALLENGE_RECEIVED';
  const isChallengeSent = gunFight.status === 'CHALLENGE_SENT';
  const isCountdown = gunFight.status === 'COUNTDOWN';
  const isActive = gunFight.status === 'ACTIVE';
  const isFinished = gunFight.status === 'FINISHED';

  const myHp = Math.max(0, Math.min(150, gunFight.myHp ?? 150));
  const oppHp = Math.max(0, Math.min(150, gunFight.opponentHp ?? 150));
  const isWinner = gunFight.winner === myPlayer?.name || myHp > oppHp;

  return (
    <>
      {/* 1. Challenge Received Modal */}
      {isChallengeReceived && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 5, 12, 0.78)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <div
            style={{
              backgroundColor: '#0f0a1c',
              border: '2px solid #ef4444',
              borderRadius: 24,
              padding: '24px 28px',
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.45), 0 20px 40px rgba(0, 0, 0, 0.8)',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Top Close / Decline icon */}
            <button
              onClick={onDecline}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                border: '2px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
              }}
            >
              <Swords size={32} color="#f87171" />
            </div>

            <h2
              style={{
                margin: '0 0 6px',
                fontSize: 22,
                fontWeight: 900,
                color: '#fef08a',
                letterSpacing: 0.5,
                textTransform: 'uppercase'
              }}
            >
              ⚔️ Gun Fight Challenge! 🔫
            </h2>

            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#fca5a5',
                marginBottom: 16
              }}
            >
              गन फाइट मुकाबला!
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 14,
                padding: '12px 14px',
                marginBottom: 20,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ color: '#ffffff', fontSize: 15, fontWeight: 800 }}>
                <span style={{ color: '#38bdf8' }}>{gunFight.opponentName || 'Player'}</span> has challenged you to a Gun Duel!
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11.5, marginTop: 4 }}>
                Both fighters get 150 HP & Golden Guns (-10 HP per hit). Duel begins 5 seconds after accepting!
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={onAccept}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 18px rgba(34, 197, 94, 0.45)',
                  transition: 'transform 0.15s'
                }}
              >
                <Flame size={18} />
                <span>ACCEPT FIGHT</span>
              </button>

              <button
                onClick={onDecline}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1.5px solid #ef4444',
                  borderRadius: 14,
                  padding: '12px 18px',
                  color: '#fca5a5',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Challenge Sent Toast */}
      {isChallengeSent && (
        <div
          style={{
            position: 'fixed',
            top: 70,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 10, 28, 0.94)',
            border: '1.5px solid #38bdf8',
            borderRadius: 30,
            padding: '8px 18px',
            color: '#fef08a',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 8px 25px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.4)',
            zIndex: 9998,
            animation: 'fadeInDown 0.3s ease-out'
          }}
        >
          <span>🔫 Gun Fight challenge sent to <b>{gunFight.opponentName}</b>... Waiting ⏳</span>
          <button
            onClick={onCancelChallenge}
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid #ef4444',
              borderRadius: 12,
              padding: '2px 8px',
              color: '#fca5a5',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* 3. 5-Second Countdown Screen Overlay */}
      {isCountdown && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 5, 15, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            style={{
              color: '#fca5a5',
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 8
            }}
          >
            ⚔️ GUN FIGHT DUEL • 5-SECOND COUNTDOWN ⚔️
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              fontSize: 18,
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: 16
            }}
          >
            <span style={{ color: '#38bdf8' }}>{myPlayer?.name || 'You'}</span>
            <span style={{ color: '#eab308', fontSize: 24 }}>⚡ VS ⚡</span>
            <span style={{ color: '#f43f5e' }}>{gunFight.opponentName || 'Opponent'}</span>
          </div>

          {/* Huge Animated Countdown Number */}
          <div
            key={gunFight.countdown}
            style={{
              fontSize: gunFight.countdown === 0 ? 56 : 96,
              fontWeight: 950,
              color: gunFight.countdown === 0 ? '#ef4444' : '#facc15',
              textShadow: '0 0 35px rgba(250, 204, 21, 0.8), 0 0 70px rgba(239, 68, 68, 0.6)',
              animation: 'popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              margin: '10px 0'
            }}
          >
            {gunFight.countdown === 0 ? '💥 FIGHT! 💥' : gunFight.countdown}
          </div>

          <div
            style={{
              color: '#fef08a',
              fontSize: 14,
              fontWeight: 800,
              marginTop: 12,
              background: 'rgba(0,0,0,0.6)',
              padding: '6px 16px',
              borderRadius: 20,
              border: '1px solid rgba(250, 204, 21, 0.4)'
            }}
          >
            🔫 Golden Guns Armed! Aim and tap to shoot!
          </div>
        </div>
      )}

      {/* 4. Active Fight Top Screen Combat HUD */}
      {isActive && (
        <div
          id="gun-fight-active-hud"
          style={{
            position: 'fixed',
            top: 'max(56px, calc(env(safe-area-inset-top) + 50px))',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 10, 28, 0.96)',
            border: '2px solid #ef4444',
            borderRadius: 22,
            padding: '8px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.85), 0 0 25px rgba(239, 68, 68, 0.5)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            minWidth: 320,
            maxWidth: '92vw',
            animation: 'fadeInDown 0.3s ease-out'
          }}
        >
          {/* Left Fighter (You) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 900, color: '#38bdf8' }}>
              <Shield size={13} />
              <span style={{ maxWidth: 85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {myPlayer?.name || 'You'}
              </span>
              <span style={{ color: '#fef08a' }}>{myHp} / 150 HP</span>
            </div>
            {/* HP Bar */}
            <div
              style={{
                width: '100%',
                height: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                overflow: 'hidden',
                marginTop: 4,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div
                style={{
                  width: `${(myHp / 150) * 100}%`,
                  height: '100%',
                  background: myHp > 75 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : (myHp > 35 ? 'linear-gradient(90deg, #eab308, #ca8a04)' : 'linear-gradient(90deg, #ef4444, #dc2626)'),
                  transition: 'width 0.2s ease-out'
                }}
              />
            </div>
          </div>

          {/* Center VS Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ color: '#facc15', fontSize: 13, fontWeight: 950, letterSpacing: 0.8 }}>
              ⚡ VS ⚡
            </div>
            <div style={{ color: '#fca5a5', fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}>
              🔫 SHOOT!
            </div>
          </div>

          {/* Right Fighter (Opponent) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 900, color: '#f43f5e' }}>
              <span style={{ color: '#fef08a' }}>{oppHp} / 150 HP</span>
              <span style={{ maxWidth: 85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {gunFight.opponentName || 'Opponent'}
              </span>
              <Crosshair size={13} />
            </div>
            {/* HP Bar */}
            <div
              style={{
                width: '100%',
                height: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                overflow: 'hidden',
                marginTop: 4,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div
                style={{
                  width: `${(oppHp / 150) * 100}%`,
                  height: '100%',
                  background: oppHp > 75 ? 'linear-gradient(90deg, #ef4444, #f43f5e)' : (oppHp > 35 ? 'linear-gradient(90deg, #f97316, #ea580c)' : 'linear-gradient(90deg, #b91c1c, #991b1b)'),
                  transition: 'width 0.2s ease-out',
                  float: 'right'
                }}
              />
            </div>
          </div>

          {/* Forfeit button */}
          <button
            onClick={onForfeit}
            title="Surrender / Forfeit Duel"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              padding: '4px 6px',
              color: '#94a3b8',
              fontSize: 10,
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            🏳️
          </button>
        </div>
      )}

      {/* 5. Victory / Defeat Screen */}
      {isFinished && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 5, 15, 0.82)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div
            style={{
              backgroundColor: '#0f0a1c',
              border: isWinner ? '2px solid #facc15' : '2px solid #ef4444',
              borderRadius: 24,
              padding: '28px 32px',
              maxWidth: 400,
              width: '100%',
              boxShadow: isWinner
                ? '0 0 50px rgba(250, 204, 21, 0.5), 0 20px 40px rgba(0, 0, 0, 0.8)'
                : '0 0 50px rgba(239, 68, 68, 0.4), 0 20px 40px rgba(0, 0, 0, 0.8)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: isWinner ? 'rgba(250, 204, 21, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: isWinner ? '2px solid #facc15' : '2px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: isWinner ? '0 0 25px rgba(250, 204, 21, 0.6)' : 'none'
              }}
            >
              {isWinner ? <Award size={38} color="#facc15" /> : <Skull size={38} color="#f87171" />}
            </div>

            <h2
              style={{
                margin: '0 0 6px',
                fontSize: 26,
                fontWeight: 950,
                color: isWinner ? '#fef08a' : '#fca5a5',
                letterSpacing: 0.5
              }}
            >
              {isWinner ? '🏆 VICTORY! 🎆' : '💀 DEFEATED! 💔'}
            </h2>

            <p style={{ color: '#ffffff', fontSize: 15, fontWeight: 800, margin: '10px 0' }}>
              {isWinner
                ? `You defeated ${gunFight.opponentName} in the Gun Fight!`
                : `${gunFight.opponentName} won the duel!`}
            </p>

            {isWinner && (
              <div
                style={{
                  background: 'rgba(250, 204, 21, 0.15)',
                  border: '1px solid #facc15',
                  borderRadius: 14,
                  padding: '8px 12px',
                  color: '#fef08a',
                  fontSize: 13,
                  fontWeight: 900,
                  margin: '14px 0'
                }}
              >
                🪙 +500 Mela Bonus Coins! 🎉
              </div>
            )}

            <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 14 }}>
              Returning to Mela in a moment...
            </div>
          </div>
        </div>
      )}
    </>
  );
}

