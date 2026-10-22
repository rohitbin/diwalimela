// Lucky Balloon Shooting Carnival Game (गुब्बारा निशानेबाजी)
import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Target, Trophy, Sparkles, X, RefreshCw } from 'lucide-react';

const BALLOON_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316'];

export default function BalloonShootingModal({
  isOpen,
  onClose,
  coins,
  setCoins,
  setInventory
}) {
  const [balloons, setBalloons] = useState([]);
  const [shotsLeft, setShotsLeft] = useState(8);
  const [score, setScore] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [wonItem, setWonItem] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  // Initialize Balloons Grid
  const initGame = () => {
    const newBalloons = [];
    const rows = 4;
    const cols = 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isGolden = Math.random() < 0.15;
        newBalloons.push({
          id: `${r}-${c}`,
          r,
          c,
          color: isGolden ? '#fbbf24' : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
          isGolden,
          popped: false,
          value: isGolden ? 50 : 20,
          wobbleOffset: Math.random() * Math.PI * 2
        });
      }
    }
    setBalloons(newBalloons);
    setShotsLeft(8);
    setScore(0);
    setEarnedCoins(0);
    setWonItem(null);
    setGameOver(false);
  };

  useEffect(() => {
    if (isOpen) {
      initGame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShootBalloon = (balloon) => {
    if (balloon.popped || shotsLeft <= 0 || gameOver) return;

    soundEngine.init();
    soundEngine.playAirGunShot();
    soundEngine.playBalloonPop();

    // Mark popped
    setBalloons((prev) =>
      prev.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b))
    );

    const pts = balloon.value;
    const newScore = score + pts;
    const newEarned = earnedCoins + pts;
    setScore(newScore);
    setEarnedCoins(newEarned);
    setCoins((c) => c + pts);

    const remainingShots = shotsLeft - 1;
    setShotsLeft(remainingShots);

    // If popped golden balloon, win bonus rocket/anar!
    if (balloon.isGolden) {
      const rareBonus = Math.random() > 0.5 ? 'rocket' : 'anar';
      setInventory((prev) =>
        prev.map((i) => (i.id === rareBonus ? { ...i, count: i.count + 1 } : i))
      );
      setWonItem(rareBonus === 'rocket' ? '🚀 Bonus Sky Rocket Won!' : '🪴 Bonus Shahi Anar Won!');
    }

    if (remainingShots <= 0) {
      setGameOver(true);
      soundEngine.playCrowdCheer();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 3, 15, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        padding: 'max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left))'
      }}
      onClick={onClose}
    >
      <div
        className="modal-scrollable"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: 'min(94vh, 700px)',
          overflowY: 'auto',
          backgroundColor: '#1b1227',
          border: '2px solid #f59e0b',
          borderRadius: 22,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 158, 11, 0.3)',
          padding: 'clamp(14px, 3.5vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          userSelect: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 28, marginBottom: 2 }}>🎯</div>
          <h2
            style={{
              margin: '0 0 4px 0',
              fontSize: 'clamp(18px, 4.8vw, 24px)',
              color: '#fef08a',
              fontFamily: "'Rozha One', 'Cinzel', serif"
            }}
          >
            गुब्बारा निशानेबाजी (Balloon Shooting Stall)
          </h2>
          <p style={{ margin: 0, color: '#fed7aa', fontSize: 'clamp(11px, 2.8vw, 13px)' }}>
            Aim and pop the festive balloons with your air rifle! Golden balloons award free fireworks!
          </p>
        </div>

        {/* Stats Row */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 14,
            padding: '6px 12px',
            marginBottom: 14,
            fontSize: 'clamp(11px, 2.8vw, 13px)',
            color: '#fed7aa',
            fontWeight: 700
          }}
        >
          <span>🎯 Pellets: <strong style={{ color: shotsLeft > 2 ? '#4ade80' : '#f87171' }}>{shotsLeft}</strong></span>
          <span>🏆 Score: <strong style={{ color: '#fbbf24' }}>{score}</strong></span>
          <span>🪙 Won: <strong style={{ color: '#fde047' }}>+₹{earnedCoins}</strong></span>
        </div>

        {/* Balloon Board */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#451a03',
            border: '3px solid #78350f',
            borderRadius: 16,
            padding: 'clamp(8px, 2vw, 16px)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)',
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 'clamp(5px, 1.6vw, 12px)',
            justifyItems: 'center',
            cursor: shotsLeft > 0 ? 'crosshair' : 'default',
            touchAction: 'manipulation'
          }}
        >
          {balloons.map((b) => (
            <div
              key={b.id}
              onClick={() => handleShootBalloon(b)}
              style={{
                width: 'clamp(32px, 8vw, 48px)',
                height: 'clamp(42px, 10vw, 60px)',
                borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                backgroundColor: b.popped ? 'transparent' : b.color,
                boxShadow: b.popped
                  ? 'none'
                  : b.isGolden
                  ? '0 0 16px #fbbf24, inset 0 -6px 10px rgba(0,0,0,0.3)'
                  : 'inset 0 -6px 10px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)',
                border: b.popped ? '1px dashed rgba(255,255,255,0.1)' : b.isGolden ? '2px solid #fff' : 'none',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: b.popped ? 'default' : 'crosshair',
                touchAction: 'manipulation',
                transform: b.popped ? 'scale(0.3)' : 'scale(1)',
                transition: 'transform 0.1s ease',
                opacity: b.popped ? 0.2 : 1
              }}
            >
              {!b.popped && (
                <>
                  {/* Balloon knot */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -5,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 6,
                      height: 5,
                      backgroundColor: b.color,
                      clipPath: 'polygon(50% 100%, 0 0, 100% 0)'
                    }}
                  />
                  {b.isGolden && <span style={{ fontSize: 16 }}>⭐</span>}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Won bonus item notification */}
        {wonItem && (
          <div
            style={{
              marginTop: 12,
              backgroundColor: '#15803d',
              border: '1px solid #4ade80',
              borderRadius: 12,
              padding: '6px 16px',
              color: '#fef08a',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              animation: 'bounce 0.5s'
            }}
          >
            <Sparkles size={16} /> {wonItem}
          </div>
        )}

        {/* Game Over / Play Again Banner */}
        {gameOver && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#fef08a', fontSize: 18 }}>
              🎉 Stall Master: "Zabardast nishanebaazi! You scored {score} points and won ₹{earnedCoins} coins!"
            </h3>
            <button
              onClick={initGame}
              style={{
                backgroundColor: '#f59e0b',
                border: 'none',
                borderRadius: 12,
                padding: '8px 22px',
                color: '#1e1b4b',
                fontSize: 13,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
