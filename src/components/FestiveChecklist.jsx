// Festive Checklist & Diwali Cheer Meter HUD
import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Circle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { MELA_ZONES } from '../game/MelaCanvas';

export default function FestiveChecklist({
  coins,
  litDiyasCount,
  burstCount = 0,
  boughtCount = 0,
  bellRung = false,
  balloonPlayed = false,
  chaiDrank = false,
  wheelRode = false,
  ravanShotCount = 0,
  onNavigateTo
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tasks = [
    {
      id: 'ravan',
      title: 'Shoot 10-Headed Ravan Effigy (-1 HP)',
      done: ravanShotCount > 0,
      target: MELA_ZONES.RAVAN
    },
    {
      id: 'wheel',
      title: 'Ride the Mela Giant Wheel (झूला)',
      done: wheelRode,
      target: MELA_ZONES.FERRIS_WHEEL
    },
    {
      id: 'balloon',
      title: 'Play Balloon Shooting Game (निशानेबाजी)',
      done: balloonPlayed,
      target: MELA_ZONES.BALLOON_STALL
    },
    {
      id: 'shop',
      title: 'Visit Patakha Shop & Buy Crackers',
      done: boughtCount > 0,
      target: MELA_ZONES.CRACKER_SHOP
    },
    {
      id: 'crackers',
      title: 'Ignite & Burst Diwali Fireworks (पटाखे)',
      done: burstCount > 0,
      target: MELA_ZONES.CRACKER_SHOP
    },
    {
      id: 'mandir',
      title: 'Ring Temple Bell for Lakshmi Pooja',
      done: bellRung,
      target: MELA_ZONES.TEMPLE
    },
    {
      id: 'chai',
      title: 'Sip Kulhad Chai at Chai Tapri',
      done: chaiDrank,
      target: MELA_ZONES.CHAI_TAPRI
    },
    {
      id: 'diyas',
      title: `Light 5 Earthen Diyas (${Math.min(5, litDiyasCount)}/5)`,
      done: litDiyasCount >= 5,
      target: MELA_ZONES.CENTRAL_CHAWK
    }
  ];

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div
      style={{
        position: 'fixed',
        top: 'max(52px, calc(env(safe-area-inset-top) + 44px))',
        left: 'max(8px, env(safe-area-inset-left))',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 6,
        pointerEvents: 'auto',
        maxWidth: 'calc(100vw - 24px)',
        touchAction: 'manipulation'
      }}
    >
      {/* Mini Toggle Pill */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          backgroundColor: 'rgba(23, 16, 36, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          borderRadius: 16,
          padding: '5px 12px',
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
        <Sparkles size={12} color="#fbbf24" />
        <span>Diwali Cheer: {progressPercent}%</span>
        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </div>

      {/* Expanded Tasks Card */}
      {isExpanded && (
        <div
          style={{
            width: 265,
            backgroundColor: 'rgba(20, 14, 32, 0.96)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 14,
            padding: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxHeight: '65vh',
            overflowY: 'auto'
          }}
        >
          {/* Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#fed7aa', marginBottom: 4 }}>
              <span>Mela Attractions Checklist</span>
              <strong style={{ color: '#fbbf24' }}>{completedCount}/{tasks.length} Done</strong>
            </div>
            <div
              style={{
                width: '100%',
                height: 6,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundImage: 'linear-gradient(90deg, #f59e0b, #eab308, #22c55e)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Task Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: task.done ? '#86efac' : '#e2e8f0',
                  backgroundColor: task.done ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                  padding: '5px 8px',
                  borderRadius: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                  {task.done ? (
                    <CheckCircle2 size={13} color="#22c55e" />
                  ) : (
                    <Circle size={13} color="#94a3b8" />
                  )}
                  <span style={{ textDecoration: task.done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                  </span>
                </div>

                {!task.done && task.target && (
                  <button
                    onClick={() => onNavigateTo(task.target.x, task.target.y)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fbbf24',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Go there"
                  >
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
