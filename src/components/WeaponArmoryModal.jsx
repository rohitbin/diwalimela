// Diwali Weapon Armory Modal (दिव्य शस्त्रागार - Ravan Shastra)
import React from 'react';
import { CRACKERS } from '../data/crackers';
import { soundEngine } from '../audio/soundEngine';
import { X, Sparkles, Check, Crosshair } from 'lucide-react';

export default function WeaponArmoryModal({
  isOpen,
  onClose,
  coins,
  setCoins,
  inventory,
  setInventory,
  selectedCracker,
  setSelectedCracker,
  onGoToRavan
}) {
  if (!isOpen) return null;

  const weapons = CRACKERS.filter((c) => c.isWeapon);

  const handleBuyOrEquip = (weapon) => {
    soundEngine.init();
    const invItem = inventory.find((i) => i.id === weapon.id);
    const isOwned = invItem && invItem.count > 0;

    if (isOwned) {
      // Equip directly
      setSelectedCracker(weapon);
      soundEngine.playCoinSound();
      return;
    }

    // Purchase
    if (coins < weapon.price) {
      alert(`Not enough Shagun Coins! You need ₹${weapon.price} coins.`);
      return;
    }

    setCoins((c) => c - weapon.price);
    soundEngine.playCoinSound();

    setInventory((prev) => {
      const existing = prev.find((i) => i.id === weapon.id);
      if (existing) {
        return prev.map((i) => (i.id === weapon.id ? { ...i, count: i.count + 1 } : i));
      }
      return [...prev, { id: weapon.id, count: 1 }];
    });

    setSelectedCracker(weapon);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 7, 18, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 65,
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
          maxWidth: 580,
          backgroundColor: '#1b1429',
          borderRadius: 24,
          border: '2px solid rgba(245, 158, 11, 0.6)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(245, 158, 11, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #7c2d12 0%, #451a03 50%, #1e112a 100%)',
            borderBottom: '1.5px solid rgba(251, 191, 36, 0.4)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>🏹</span>
              <div>
                <h2 style={{ margin: 0, color: '#fef08a', fontFamily: '"Cinzel", serif', fontSize: 20 }}>
                  दिव्य शस्त्रागार (Diwali Weapon Armory)
                </h2>
                <p style={{ margin: '3px 0 0', color: '#fed7aa', fontSize: 12 }}>
                  Equip weapons to shoot Ravan effigy in Ravan Dahan! (1 shot = -1 HP)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Shagun Coins Pill */}
          <div
            style={{
              position: 'absolute',
              right: 24,
              bottom: -14,
              backgroundColor: '#9a3412',
              border: '1.5px solid #fbbf24',
              borderRadius: 16,
              padding: '2px 12px',
              fontSize: 12,
              fontWeight: 800,
              color: '#fef08a',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
            }}
          >
            <span>🪙 ₹{coins.toLocaleString()}</span>
          </div>
        </div>

        {/* Weapons Catalog Grid */}
        <div style={{ padding: '26px 20px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {weapons.map((w) => {
            const invItem = inventory.find((i) => i.id === w.id);
            const isOwned = invItem && invItem.count > 0;
            const isEquipped = selectedCracker?.id === w.id;

            return (
              <div
                key={w.id}
                style={{
                  backgroundColor: isEquipped
                    ? 'rgba(234, 88, 12, 0.22)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isEquipped
                    ? '2px solid #fbbf24'
                    : isOwned
                    ? '1.5px solid rgba(16, 185, 129, 0.5)'
                    : '1px solid rgba(251, 191, 36, 0.25)',
                  borderRadius: 18,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 16,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      boxShadow: isEquipped ? '0 0 16px #fbbf24' : 'none'
                    }}
                  >
                    {w.icon}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ margin: 0, color: '#fef08a', fontSize: 16, fontWeight: 700 }}>
                        {w.name}
                      </h3>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          backgroundColor: '#7c2d12',
                          color: '#fed7aa',
                          padding: '2px 6px',
                          borderRadius: 8
                        }}
                      >
                        {w.tag}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: 12, lineHeight: 1.4 }}>
                      {w.description}
                    </p>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700 }}>
                        🎯 Damage: -1 HP / shot
                      </span>
                      <span style={{ fontSize: 11, color: '#4ade80' }}>
                        ♾️ Unlimited festive ammo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buy / Equip Button */}
                <button
                  onClick={() => handleBuyOrEquip(w)}
                  style={{
                    backgroundColor: isEquipped
                      ? '#10b981'
                      : isOwned
                      ? '#ea580c'
                      : coins >= w.price
                      ? '#ea580c'
                      : '#4b5563',
                    border: 'none',
                    borderRadius: 14,
                    padding: '10px 18px',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: isEquipped
                      ? '0 0 12px #10b981'
                      : '0 4px 12px rgba(0,0,0,0.5)',
                    flexShrink: 0
                  }}
                >
                  {isEquipped ? (
                    <>
                      <Check size={16} /> EQUIPPED
                    </>
                  ) : isOwned ? (
                    <>
                      <Crosshair size={16} /> EQUIP
                    </>
                  ) : (
                    <>
                      <span>BUY ₹{w.price}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info & shortcut to Ravan */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#120d1c',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <div style={{ fontSize: 12, color: '#fed7aa' }}>
            👹 <strong>Ravan Effigy:</strong> Stands in the South-East fairground with <strong>10,000,000 HP</strong>.
          </div>

          {onGoToRavan && (
            <button
              onClick={() => {
                onClose();
                onGoToRavan();
              }}
              style={{
                backgroundColor: '#7c2d12',
                border: '1px solid #fbbf24',
                borderRadius: 12,
                padding: '6px 14px',
                color: '#fef08a',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Walk to Ravan</span> 👹
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
