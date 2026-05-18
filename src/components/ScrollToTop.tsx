'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { lenisInstance } from './SmoothScroll';

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_MONO = '"JetBrains Mono","IBM Plex Mono",monospace';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMERALD = '#00FF9C';
const FLAME   = '#FF5A1F';

// Ring geometry
const SIZE         = 56;
const RING_RADIUS  = 24;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ─── Scroll progress hook ─────────────────────────────────────────────────────
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, scrolled / total) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return progress;
}

// ─── ScrollToTop ──────────────────────────────────────────────────────────────
export function ScrollToTop() {
  const btnRef   = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress();
  const visible  = progress > 0.15;
  const [hovered, setHovered] = useState(false);

  // ── Magnetic pull ──────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left  - rect.width  / 2) * 0.32;
    const y = (e.clientY - rect.top   - rect.height / 2) * 0.32;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (btnRef.current) btnRef.current.style.transform = 'translate(0,0)';
    setHovered(false);
  }, []);

  const handleClick = () => {
    (lenisInstance.current as any)?.scrollTo(0, {
      duration: 1.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
  };

  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const pct = Math.round(progress * 100);

  // Color shifts from flame to emerald as you scroll deeper
  const ringColor = progress > 0.5 ? EMERALD : FLAME;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 24 }}
          transition={{ duration: 0.52, ease: EASE }}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 90,
            display: 'flex', alignItems: 'center', gap: 10,
            pointerEvents: 'auto',
          }}
        >
          {/* Vertical label */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <motion.span
              animate={{ opacity: hovered ? 0.75 : 0.22 }}
              transition={{ duration: 0.22 }}
              style={{
                fontFamily: FONT_MONO, fontSize: 5.5, letterSpacing: '0.34em',
                color: EMERALD, fontWeight: 700,
                writingMode: 'vertical-lr',
                transform: 'rotate(180deg)',
                whiteSpace: 'nowrap', userSelect: 'none',
                textTransform: 'uppercase',
              }}
            >
              REBOOT_ORIGIN
            </motion.span>

            {/* Scroll percentage readout */}
            <motion.span
              animate={{ opacity: hovered ? 0.9 : 0.28 }}
              transition={{ duration: 0.22 }}
              style={{
                fontFamily: FONT_MONO, fontSize: 5, letterSpacing: '0.2em',
                color: ringColor, fontWeight: 700,
                writingMode: 'vertical-lr',
                transform: 'rotate(180deg)',
                whiteSpace: 'nowrap', userSelect: 'none',
                textShadow: hovered ? `0 0 8px ${ringColor}88` : 'none',
                transition: 'color 0.4s ease, text-shadow 0.22s ease',
              }}
            >
              {String(pct).padStart(3, '0')}%
            </motion.span>
          </div>

          {/* Magnetic wrapper + button */}
          <div
            ref={btnRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{
              position: 'relative', width: SIZE, height: SIZE,
              transition: 'transform 0.38s cubic-bezier(0.22,1,0.36,1)',
              willChange: 'transform', cursor: 'crosshair',
            }}
          >
            {/* ── Outer pulsing glow ring on hover ──────────────────────── */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.4, 0.1, 0.4], scale: [1, 1.2, 1] }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${ringColor}22 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </AnimatePresence>

            {/* ── SVG progress ring ─────────────────────────────────────── */}
            <svg
              width={SIZE}
              height={SIZE}
              style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
              aria-hidden="true"
            >
              {/* Track */}
              <circle
                cx={SIZE / 2} cy={SIZE / 2} r={RING_RADIUS}
                fill="none"
                stroke="rgba(0,255,156,0.1)"
                strokeWidth="0.8"
              />
              {/* Progress fill */}
              <circle
                cx={SIZE / 2} cy={SIZE / 2} r={RING_RADIUS}
                fill="none"
                stroke={ringColor}
                strokeWidth={hovered ? 1.8 : 1.2}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.18s linear, stroke 0.4s ease, stroke-width 0.22s ease',
                  filter: hovered ? `drop-shadow(0 0 3px ${ringColor}AA)` : 'none',
                }}
              />
              {/* Corner tick marks */}
              {[0, 90, 180, 270].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const cx2 = SIZE / 2 + RING_RADIUS * Math.cos(rad);
                const cy2 = SIZE / 2 + RING_RADIUS * Math.sin(rad);
                return (
                  <circle
                    key={deg}
                    cx={cx2} cy={cy2} r={1}
                    fill={`rgba(0,255,156,0.3)`}
                  />
                );
              })}
            </svg>

            {/* ── Glass square ──────────────────────────────────────────── */}
            <motion.div
              animate={{
                background: hovered ? 'rgba(0,255,156,0.06)' : 'rgba(6,6,6,0.82)',
                borderColor: hovered ? 'rgba(0,255,156,0.42)' : 'rgba(0,255,156,0.14)',
                boxShadow: hovered
                  ? `0 0 32px ${EMERALD}28, 0 0 14px ${EMERALD}14, inset 0 0 14px ${EMERALD}06`
                  : '0 0 0px transparent',
              }}
              transition={{ duration: 0.28 }}
              style={{
                position: 'absolute', inset: 7,
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '0.5px solid rgba(0,255,156,0.14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {/* Grain overlay on glass */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                opacity: 0.04,
              }} />

              {/* Corner accents — all 4 */}
              {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
                <div key={c} style={{
                  position: 'absolute',
                  top:    c === 'tl' || c === 'tr' ? 0 : 'auto',
                  bottom: c === 'bl' || c === 'br' ? 0 : 'auto',
                  left:   c === 'tl' || c === 'bl' ? 0 : 'auto',
                  right:  c === 'tr' || c === 'br' ? 0 : 'auto',
                  width: 6, height: 6,
                  borderTop:    (c === 'tl' || c === 'tr') ? `0.5px solid ${EMERALD}${hovered ? 'AA' : '44'}` : 'none',
                  borderBottom: (c === 'bl' || c === 'br') ? `0.5px solid ${EMERALD}${hovered ? 'AA' : '44'}` : 'none',
                  borderLeft:   (c === 'tl' || c === 'bl') ? `0.5px solid ${EMERALD}${hovered ? 'AA' : '44'}` : 'none',
                  borderRight:  (c === 'tr' || c === 'br') ? `0.5px solid ${EMERALD}${hovered ? 'AA' : '44'}` : 'none',
                  transition: 'border-color 0.22s ease',
                }} />
              ))}

              {/* Up arrow */}
              <motion.svg
                width={11} height={11} viewBox="0 0 12 12" fill="none"
                animate={{
                  y: hovered ? -2 : 0,
                  opacity: hovered ? 1 : 0.4,
                  filter: hovered ? `drop-shadow(0 0 4px ${EMERALD}AA)` : 'none',
                }}
                transition={{ duration: 0.22 }}
                aria-hidden="true"
              >
                <path
                  d="M6 10V2M2.5 5.5L6 2l3.5 3.5"
                  stroke={EMERALD} strokeWidth="1.1"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </motion.svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
