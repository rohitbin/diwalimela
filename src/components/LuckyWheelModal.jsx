// Diwali Fortune Spin Wheel (लक्ष्मी धन वर्षा चक्र)
import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Sparkles, Trophy, X, Gift } from 'lucide-react';

const PRIZES = [
  { label: '₹100 Coins', type: 'coins', value: 100, color: '#f59e0b', icon: '🪙' },
  { label: '3x Sky Rockets', type: 'item', id: 'rocket', count: 3, color: '#8b5cf6', icon: '🚀' },
  { label: '₹250 Shagun', type: 'coins', value: 250, color: '#ea580c', icon: '💰' },
  { label: '2x Shahi Anar', type: 'item', id: 'anar', count: 2, color: '#ec4899', icon: '🪴' },
  { label: '5x Phuljhadi', type: 'item', id: 'phuljhadi', count: 5, color: '#fbbf24', icon: '✨' },
  { label: '2x Sutli Bomb', type: 'item', id: 'sutlibomb', count: 2, color: '#10b981', icon: '💣' },
  { label: '₹150 Coins', type: 'coins', value: 150, color: '#3b82f6', icon: '🪙' },
  { label: '3x Sky Lanterns', type: 'item', id: 'skylantern', count: 3, color: '#f97316', icon: '🪔' }
];

export default function LuckyWheelModal({
  isOpen,
  onClose,
  coins,
  setCoins,
  setInventory
}) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);
  const [alreadySpun, setAlreadySpun] = useState(false);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonPrize(null);
    soundEngine.init();

    // Random prize index (0 to 7)
    const prizeIdx = Math.floor(Math.random() * PRIZES.length);
    const degreesPerSlice = 360 / PRIZES.length;
    // 5 to 7 full rotations plus offset to the prize slice
    const totalExtraDegrees = 360 * 6 + (PRIZES.length - 1 - prizeIdx) * degreesPerSlice + degreesPerSlice / 2;
    const finalRot = rotation + totalExtraDegrees;

    setRotation(finalRot);

    // Play ticking sounds during spin
    let ticks = 0;
    const tickInterval = setInterval(() => {
      soundEngine.playWheelTick();
      ticks++;
      if (ticks > 25) clearInterval(tickInterval);
    }, 120);

    // Stop after 3.5 seconds
    setTimeout(() => {
      setSpinning(false);
      const prize = PRIZES[prizeIdx];
      setWonPrize(prize);
      setAlreadySpun(true);
      soundEngine.playCrowdCheer();
      soundEngine.playCoinSound();

      if (prize.type === 'coins') {
        setCoins((c) => c + prize.value);
      } else if (prize.type === 'item') {
        setInventory((prev) =>
          prev.map((i) => (i.id === prize.id ? { ...i, count: i.count + prize.count } : i))
        );
      }
    }, 3600);
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
        justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          backgroundColor: '#1c1228',
          border: '2px solid #f59e0b',
          borderRadius: 22,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 158, 11, 0.35)',
          padding: 24,
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
            top: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <span style={{ fontSize: 32, marginBottom: 4 }}>🎡</span>
        <h2
          style={{
            margin: '0 0 4px 0',
            fontSize: 24,
            color: '#fef08a',
            fontFamily: "'Rozha One', 'Cinzel', serif"
          }}
        >
          लक्ष्मी धन वर्षा चक्र (Diwali Fortune Spin)
        </h2>
        <p style={{ margin: '0 0 16px 0', color: '#fed7aa', fontSize: 13, textAlign: 'center' }}>
          Spin the auspicious golden festival wheel to receive Lakshmi Shagun coins and free fireworks!
        </p>

        {/* Wheel Container with Pointer */}
        <div style={{ position: 'relative', width: 280, height: 280, margin: '8px 0 20px 0' }}>
          {/* Top Pointer */}
          <div
            style={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '22px solid #fef08a',
              zIndex: 10,
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))'
            }}
          />

          {/* Rotating Wheel Canvas / SVG */}
          <svg
            viewBox="0 0 200 200"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '4px solid #fef08a',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)',
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3.5s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
            }}
          >
            {PRIZES.map((prize, idx) => {
              const sliceAngle = 360 / PRIZES.length;
              const startAngle = idx * sliceAngle;
              const endAngle = startAngle + sliceAngle;

              // Arc path
              const r = 100;
              const radStart = (startAngle * Math.PI) / 180;
              const radEnd = (endAngle * Math.PI) / 180;
              const x1 = 100 + r * Math.cos(radStart);
              const y1 = 100 + r * Math.sin(radStart);
              const x2 = 100 + r * Math.cos(radEnd);
              const y2 = 100 + r * Math.sin(radEnd);

              const textRad = ((startAngle + sliceAngle / 2) * Math.PI) / 180;
              const tx = 100 + 64 * Math.cos(textRad);
              const ty = 100 + 64 * Math.sin(textRad);

              return (
                <g key={idx}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                    fill={prize.color}
                    stroke="#171123"
                    strokeWidth="1.5"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="#fff"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${startAngle + sliceAngle / 2 + 90}, ${tx}, ${ty})`}
                  >
                    {prize.icon} {prize.label.split(' ')[0]}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="22" fill="#ca8a04" stroke="#fef08a" strokeWidth="3" />
            <text x="100" y="103" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle">
              DIWALI
            </text>
          </svg>
        </div>

        {/* Won Prize Notification */}
        {wonPrize && (
          <div
            style={{
              backgroundColor: '#15803d',
              border: '1px solid #4ade80',
              borderRadius: 14,
              padding: '8px 20px',
              color: '#fef08a',
              fontSize: 14,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
              animation: 'bounce 0.5s'
            }}
          >
            <Sparkles size={18} />
            <span>🎉 Lakshmi Shagun: Won {wonPrize.label}!</span>
          </div>
        )}

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={spinning}
          style={{
            backgroundColor: spinning ? '#6b7280' : '#f59e0b',
            backgroundImage: spinning ? 'none' : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            border: 'none',
            borderRadius: 14,
            padding: '12px 32px',
            color: '#1a0e05',
            fontSize: 15,
            fontWeight: 800,
            cursor: spinning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 6px 18px rgba(245, 158, 11, 0.4)'
          }}
        >
          <Gift size={18} fill="#1a0e05" />
          <span>{spinning ? 'Spinning Wheel...' : alreadySpun ? 'Spin Again!' : 'SPIN WHEEL FOR SHAGUN! 🎡'}</span>
        </button>
      </div>
    </div>
  );
}
