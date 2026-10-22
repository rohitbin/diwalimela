// Shri Ganesh Patakha Bhandar - Diwali Cracker Shop Modal
import React, { useState } from 'react';
import { CRACKERS, CRACKER_CATEGORIES } from '../data/crackers';
import { soundEngine } from '../audio/soundEngine';
import { Volume2, ShoppingCart, Sparkles, X, Check, ShieldCheck, Flame } from 'lucide-react';

export default function CrackerShopModal({
  isOpen,
  onClose,
  coins,
  setCoins,
  inventory,
  setInventory,
  onGoToDhamakaGround
}) {
  const [selectedCat, setSelectedCat] = useState(CRACKER_CATEGORIES.ALL);
  const [justPurchased, setJustPurchased] = useState(null);
  const [freeGiftClaimed, setFreeGiftClaimed] = useState(false);

  if (!isOpen) return null;

  const filteredCrackers = CRACKERS.filter((c) =>
    selectedCat === CRACKER_CATEGORIES.ALL ? true : c.category === selectedCat
  );

  const getInventoryCount = (id) => {
    const item = inventory.find((i) => i.id === id);
    return item ? item.count : 0;
  };

  const handleBuy = (cracker, quantity = 1) => {
    const totalCost = cracker.price * quantity;
    if (coins < totalCost) {
      alert(`Aapke paas पर्याप्त सिक्‍के (insufficient coins) nahi hain! You need ₹${totalCost - coins} more coins. Light diyas or ring temple bell to earn more!`);
      return;
    }

    setCoins((c) => c - totalCost);
    setInventory((prev) => {
      const existing = prev.find((i) => i.id === cracker.id);
      if (existing) {
        return prev.map((i) => (i.id === cracker.id ? { ...i, count: i.count + quantity } : i));
      }
      return [...prev, { id: cracker.id, count: quantity }];
    });

    soundEngine.playCoinSound();
    setJustPurchased(cracker.id);
    setTimeout(() => setJustPurchased(null), 1200);
  };

  const handlePreviewSound = (cracker) => {
    soundEngine.init();
    switch (cracker.id) {
      case 'phuljhadi':
        soundEngine.playPhuljhadiSparkle();
        break;
      case 'chakri':
        soundEngine.playChakriWhistle();
        break;
      case 'anar':
        soundEngine.playAnarFountain();
        break;
      case 'rocket':
        soundEngine.playRocketLaunch();
        setTimeout(() => soundEngine.playFireworkBang(1.1, 1.0), 750);
        break;
      case 'ladi':
        soundEngine.playLadiPop();
        break;
      case 'sutlibomb':
        soundEngine.playSutliBomb();
        break;
      case 'skyshot':
        soundEngine.playFireworkBang(0.9, 1.2);
        break;
      case 'skylantern':
        soundEngine.playDiyaLight();
        break;
      default:
        break;
    }
  };

  const handleClaimShagun = () => {
    if (freeGiftClaimed) return;
    setFreeGiftClaimed(true);
    setCoins((c) => c + 200);
    soundEngine.playCoinSound();
    soundEngine.playTempleBell();
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
          maxWidth: 920,
          maxHeight: '92vh',
          backgroundColor: '#171123',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Festive Image Banner */}
        <div
          style={{
            position: 'relative',
            height: 160,
            backgroundImage: `linear-gradient(to bottom, rgba(23, 17, 35, 0.1), rgba(23, 17, 35, 0.95)), url('/diwali_cracker_shop.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Top Row: Close button and Coins counter */}
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
              <span>🪙</span>
              <span>₹{coins}</span>
              <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 500 }}>Shagun Coins</span>
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

          {/* Shop Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 26,
                  color: '#fef08a',
                  fontFamily: "'Rozha One', 'Cinzel', serif",
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                }}
              >
                श्री गणेश पटाखा भंडार
              </h2>
              <span
                style={{
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 10
                }}
              >
                ESTD. 1985
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: '#fed7aa', fontSize: 13 }}>
              "Aao beta aao! Top quality certified Diwali firecrackers. Burst responsibly at Dhamaka ground!"
            </p>
          </div>
        </div>

        {/* Free Shagun Banner & Category Tabs */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#1f1631',
            borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* Categories */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {Object.values(CRACKER_CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedCat === cat ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: selectedCat === cat ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCat === cat ? '#1e1b4b' : '#e2e8f0',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Shagun Gift Claim Button */}
          {!freeGiftClaimed ? (
            <button
              onClick={handleClaimShagun}
              style={{
                backgroundColor: '#dc2626',
                border: '1px solid #f87171',
                borderRadius: 16,
                padding: '6px 14px',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                animation: 'pulse 2s infinite'
              }}
            >
              <Sparkles size={14} color="#fde047" />
              Claim Free ₹200 Shagun Gift!
            </button>
          ) : (
            <span style={{ fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} /> Shagun Claimed!
            </span>
          )}
        </div>

        {/* Crackers Grid */}
        <div
          style={{
            padding: 24,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 16,
            flex: 1
          }}
        >
          {filteredCrackers.map((cracker) => {
            const count = getInventoryCount(cracker.id);
            const isPurchased = justPurchased === cracker.id;

            return (
              <div
                key={cracker.id}
                style={{
                  backgroundColor: 'rgba(35, 26, 54, 0.85)',
                  border: isPurchased ? '2px solid #22c55e' : '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  position: 'relative',
                  transition: 'transform 0.2s, border-color 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                {/* Cracker Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22
                      }}
                    >
                      {cracker.icon}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, color: '#fef08a' }}>{cracker.name}</h4>
                      <span style={{ fontSize: 12, color: '#fb923c' }}>{cracker.hindiName}</span>
                    </div>
                  </div>

                  {count > 0 && (
                    <span
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid #22c55e',
                        color: '#4ade80',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10
                      }}
                    >
                      In Bag: {count}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>
                  {cracker.description}
                </p>

                {/* Power & Safety */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#94a3b8'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={13} color="#4ade80" />
                    {cracker.safetyRating}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b' }}>
                    <Flame size={13} /> Power {cracker.burstPower}/5
                  </span>
                </div>

                {/* Price and Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#fef08a' }}>₹{cracker.price}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}> / box</span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {/* Sound preview button */}
                    <button
                      onClick={() => handlePreviewSound(cracker)}
                      title="Preview Sound Effect"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 8,
                        width: 34,
                        height: 34,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fbbf24',
                        cursor: 'pointer'
                      }}
                    >
                      <Volume2 size={16} />
                    </button>

                    {/* Buy 1 button */}
                    <button
                      onClick={() => handleBuy(cracker, 1)}
                      style={{
                        backgroundColor: '#f59e0b',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 14px',
                        color: '#1e1b4b',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <ShoppingCart size={14} /> Buy
                    </button>

                    {/* Buy 5 Pack button */}
                    <button
                      onClick={() => handleBuy(cracker, 5)}
                      title="Buy pack of 5"
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid #f59e0b',
                        borderRadius: 8,
                        padding: '6px 10px',
                        color: '#fbbf24',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      x5
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with shortcut to Dhamaka Ground */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#110b1d',
            borderTop: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ fontSize: 13, color: '#cbd5e1' }}>
            🎆 <strong>Celebration Area:</strong> Head to the <strong>Dhamaka Ground</strong> (South-East) to place and burst your crackers!
          </div>

          <button
            onClick={() => {
              onClose();
              if (onGoToDhamakaGround) onGoToDhamakaGround();
            }}
            style={{
              backgroundColor: '#ea580c',
              border: 'none',
              borderRadius: 12,
              padding: '8px 20px',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <span>Go to Dhamaka Ground</span> 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
