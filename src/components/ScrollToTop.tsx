'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { lenisInstance } from './SmoothScroll';

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_MONO = '"JetBrains Mono","IBM Plex Mono",monospace';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMERALD = '#00FF9C';

// Ring geometry
const SIZE         = 52;
const RING_RADIUS  = 22;
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
  const visible  = progress > 0.15;            // derived — no extra state/effect
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.82, y: 14 }}
          transition={{ duration: 0.42, ease: EASE }}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 90,
            display: 'flex', alignItems: 'center', gap: 10,
            pointerEvents: 'auto',
          }}
        >
          {/* Vertical label */}
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
                stroke={EMERALD}
                strokeWidth="1.2"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.18s linear' }}
              />
            </svg>

            {/* ── Glass square ──────────────────────────────────────────── */}
            <motion.div
              animate={{
                background: hovered ? 'rgba(0,255,156,0.05)' : 'rgba(6,6,6,0.76)',
                borderColor: hovered ? 'rgba(0,255,156,0.38)' : 'rgba(0,255,156,0.14)',
                boxShadow: hovered
                  ? `0 0 28px ${EMERALD}22, inset 0 0 14px ${EMERALD}06`
                  : '0 0 0px transparent',
              }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute', inset: 6,
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '0.5px solid rgba(0,255,156,0.14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {/* Corner accents */}
              {(['tl', 'br'] as const).map(c => (
                <div key={c} style={{
                  position: 'absolute',
                  top:    c === 'tl' ? 0 : 'auto',
                  bottom: c === 'br' ? 0 : 'auto',
                  left:   c === 'tl' ? 0 : 'auto',
                  right:  c === 'br' ? 0 : 'auto',
                  width: 7, height: 7,
                  borderTop:    c === 'tl' ? `1px solid ${EMERALD}55` : 'none',
                  borderLeft:   c === 'tl' ? `1px solid ${EMERALD}55` : 'none',
                  borderBottom: c === 'br' ? `1px solid ${EMERALD}55` : 'none',
                  borderRight:  c === 'br' ? `1px solid ${EMERALD}55` : 'none',
                  transition: 'border-color 0.22s ease',
                }} />
              ))}

              {/* Up arrow */}
              <motion.svg
                width={11} height={11} viewBox="0 0 12 12" fill="none"
                animate={{ y: hovered ? -1.5 : 0, opacity: hovered ? 0.95 : 0.4 }}
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
