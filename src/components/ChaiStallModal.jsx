// Sharma Ji Ki Chai Tapri - Street Food & Kulhad Chai Modal
import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Coffee, Sparkles, X, Heart } from 'lucide-react';

const CHAI_ITEMS = [
  {
    id: 'kulhad_chai',
    name: 'Kulhad Wali Masala Chai',
    hindiName: 'कुल्हड़ वाली मसाला चाय',
    price: 20,
    icon: '☕',
    buff: 'Warm Festive Glow + Speed',
    description: 'Freshly brewed aromatic tea infused with crushed ginger, cardamom, and tulsi in a traditional clay cup. Warms the soul!'
  },
  {
    id: 'samosa',
    name: 'Garma-Garam Samosa',
    hindiName: 'गरमा-गरम समोसा',
    price: 30,
    icon: '🥟',
    buff: 'Energy Boost +30%',
    description: 'Crispy golden pastry stuffed with spiced potatoes and green peas, served with sweet tamarind and spicy mint chutneys.'
  },
  {
    id: 'bhutta',
    name: 'Roasted Bhutta (Corn)',
    hindiName: 'भुना हुआ भुट्टा',
    price: 25,
    icon: '🌽',
    buff: 'Festival Happiness +40',
    description: 'Charcoal-grilled sweet corn rubbed with juicy lime and tangy rock salt chaat masala. Classic Mela delicacy!'
  }
];

export default function ChaiStallModal({
  isOpen,
  onClose,
  coins,
  setCoins,
  setActiveBuffs
}) {
  const [consumedMessage, setConsumedMessage] = useState(null);

  if (!isOpen) return null;

  const handleBuyItem = (item) => {
    if (coins < item.price) {
      alert(`Insufficient coins! You need ₹${item.price - coins} more coins.`);
      return;
    }

    setCoins((c) => c - item.price);
    soundEngine.playCoinSound();
    soundEngine.playDiyaLight();

    setActiveBuffs((prev) => ({
      ...prev,
      [item.id]: {
        expiresAt: Date.now() + 45000,
        name: item.name,
        buff: item.buff
      }
    }));

    setConsumedMessage(`Wah! Enjoyed ${item.name} — ${item.buff}!`);
    setTimeout(() => setConsumedMessage(null), 3000);
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
        padding: 'max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left))'
      }}
      onClick={onClose}
    >
      <div
        className="modal-scrollable"
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: 'min(94vh, 680px)',
          overflowY: 'auto',
          backgroundColor: '#1d1324',
          border: '2px solid #f97316',
          borderRadius: 22,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(249, 115, 22, 0.3)',
          padding: 'clamp(14px, 4vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
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

        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 30 }}>☕</span>
          <h2
            style={{
              margin: '4px 0',
              fontSize: 'clamp(18px, 4.8vw, 24px)',
              color: '#fef08a',
              fontFamily: "'Rozha One', 'Cinzel', serif"
            }}
          >
            शर्मा जी की चाय टपरी (Chai & Street Food Corner)
          </h2>
          <p style={{ margin: 0, color: '#fed7aa', fontSize: 'clamp(11px, 2.8vw, 13px)' }}>
            "Aao aao bhai! Kulhad chai ki khushboo aur garma-garam samosa! Diwali Mela ka asli mazaa!"
          </p>
        </div>

        {consumedMessage && (
          <div
            style={{
              backgroundColor: '#15803d',
              border: '1px solid #4ade80',
              borderRadius: 12,
              padding: '6px 16px',
              color: '#fef08a',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 12,
              animation: 'bounce 0.5s'
            }}
          >
            <Sparkles size={16} /> {consumedMessage}
          </div>
        )}

        {/* Food Items Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CHAI_ITEMS.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'rgba(38, 25, 48, 0.85)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: 'rgba(249, 115, 22, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, color: '#fef08a' }}>{item.name}</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: 11, color: '#cbd5e1' }}>{item.description}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 120, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#fef08a' }}>₹{item.price}</span>
                <button
                  onClick={() => handleBuyItem(item)}
                  style={{
                    backgroundColor: '#ea580c',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 14px',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Coffee size={14} /> Enjoy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
