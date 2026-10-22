// Radhey Sweets Corner - Diwali Sweets & Festive Food Modal
import React, { useState } from 'react';
import { SWEETS } from '../data/crackers';
import { soundEngine } from '../audio/soundEngine';
import { X, Sparkles, Zap, Heart } from 'lucide-react';

export default function SweetsShopModal({
  isOpen,
  onClose,
  coins,
  setCoins,
  activeBuffs,
  setActiveBuffs
}) {
  const [eatenEffect, setEatenEffect] = useState(null);

  if (!isOpen) return null;

  const handleBuyAndEatSweet = (sweet) => {
    if (coins < sweet.price) {
      alert(`Insufficient coins! You need ₹${sweet.price - coins} more coins.`);
      return;
    }

    setCoins((c) => c - sweet.price);
    soundEngine.playCoinSound();
    soundEngine.playDiyaLight();

    // Activate Buff
    setActiveBuffs((prev) => ({
      ...prev,
      [sweet.id]: {
        expiresAt: Date.now() + sweet.durationSec * 1000,
        name: sweet.name,
        buff: sweet.buff
      }
    }));

    setEatenEffect(`Delicious! You ate ${sweet.name} — ${sweet.buff}!`);
    setTimeout(() => setEatenEffect(null), 3000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 3, 15, 0.85)',
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
          maxWidth: 780,
          backgroundColor: '#1b1429',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(249, 115, 22, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div
          style={{
            position: 'relative',
            height: 150,
            backgroundImage: `linear-gradient(to bottom, rgba(27, 20, 41, 0.1), rgba(27, 20, 41, 0.95)), url('/diwali_sweets_shop.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                backgroundColor: 'rgba(15, 10, 25, 0.8)',
                backdropFilter: 'blur(6px)',
                border: '1px solid #f59e0b',
                borderRadius: 24,
                padding: '6px 16px',
                color: '#fef08a',
                fontSize: 15,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>🪙 ₹{coins} Coins</span>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                color: '#fef08a',
                fontFamily: "'Rozha One', 'Cinzel', serif"
              }}
            >
              🥨 राधे स्वीट्स कॉर्नर (Radhey Sweets)
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#fed7aa', fontSize: 13 }}>
              "Diwali celebrations are incomplete without mouth-watering sweets! Pure desi ghee delicacies."
            </p>
          </div>
        </div>

        {/* Eaten notification banner */}
        {eatenEffect && (
          <div
            style={{
              backgroundColor: '#15803d',
              color: '#fef08a',
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Sparkles size={16} />
            {eatenEffect}
          </div>
        )}

        {/* Sweets Grid */}
        <div
          style={{
            padding: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16
          }}
        >
          {SWEETS.map((sweet) => {
            const isBuffActive = activeBuffs && activeBuffs[sweet.id] && activeBuffs[sweet.id].expiresAt > Date.now();

            return (
              <div
                key={sweet.id}
                style={{
                  backgroundColor: 'rgba(38, 28, 58, 0.85)',
                  border: isBuffActive ? '2px solid #22c55e' : '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: 'rgba(249, 115, 22, 0.15)',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22
                    }}
                  >
                    {sweet.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, color: '#fef08a' }}>{sweet.name}</h4>
                    <span style={{ fontSize: 12, color: '#fb923c' }}>{sweet.hindiName}</span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>
                  {sweet.description}
                </p>

                <div
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 11,
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Zap size={14} />
                  <span>{sweet.buff}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#fef08a' }}>₹{sweet.price}</span>

                  <button
                    onClick={() => handleBuyAndEatSweet(sweet)}
                    style={{
                      backgroundColor: '#ea580c',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 16px',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Heart size={14} fill="#fff" /> Eat Sweet
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
