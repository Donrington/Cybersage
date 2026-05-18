'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { lenisInstance } from './SmoothScroll';

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_DISPLAY = '"Monument Extended","PP Neue Montreal","Inter",sans-serif';
const FONT_MONO    = '"JetBrains Mono","IBM Plex Mono",monospace';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMERALD = '#00FF9C';
const FLAME   = '#FF5A1F';

const NAV_LINKS = [
  { label: '[01]_ABOUT',      id: 'narrative', num: '01' },
  { label: '[02]_EXPERIENCE', id: 'audit',     num: '02' },
  { label: '[03]_PROJECTS',   id: 'bento',     num: '03' },
  { label: '[04]_SKILLS',     id: 'intel',     num: '04' },
  { label: '[05]_CONTACT',    id: 'uplink',    num: '05' },
];

const GLITCH_CHARS = '!@#$%^&*<>[]{}|/~`';

// ─── WAT clock ────────────────────────────────────────────────────────────────
function useWATTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }).format(new Date());
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ─── Single nav link with stagger-glitch entry reveal ─────────────────────────
function GlitchNavLink({
  item, index, onClose,
}: {
  item: typeof NAV_LINKS[0];
  index: number;
  onClose: () => void;
}) {
  const [display, setDisplay] = useState(item.label);
  const [hovered, setHovered] = useState(false);

  // Glitch scramble on first mount — resolves to real label
  useEffect(() => {
    let count = 0;
    const target = item.label;
    const id = setInterval(() => {
      count++;
      if (count > 7 + index) {
        setDisplay(target);
        clearInterval(id);
        return;
      }
      setDisplay(
        target.split('').map(c => {
          if (c === '_' || c === '[' || c === ']') return c;
          return Math.random() < 0.48
            ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            : c;
        }).join('')
      );
    }, 48);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    onClose();
    // Defer scroll until after the sidebar exit animation finishes
    setTimeout(() => {
      const el = document.getElementById(item.id);
      if (el) {
        (lenisInstance.current as any)?.scrollTo(el, { offset: -80, duration: 1.4 });
      }
    }, 580);
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -44 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.52, delay: 0.22 + index * 0.075, ease: EASE }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none', border: 'none', cursor: 'crosshair', padding: 0,
        display: 'flex', alignItems: 'center', gap: 22,
        width: '100%', textAlign: 'left',
        paddingTop: 14, paddingBottom: 14,
        borderBottom: '0.5px solid rgba(249,255,246,0.04)',
        outline: 'none',
      }}
    >
      {/* Index number */}
      <span style={{
        fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em', fontWeight: 700,
        color: hovered ? FLAME : 'rgba(249,255,246,0.14)',
        transition: 'color 0.2s ease',
        minWidth: 36, flexShrink: 0,
      }}>
        {item.num}
      </span>

      {/* Label with chromatic aberration on hover */}
      <span style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 'clamp(22px, 5.5vw, 46px)',
        fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1,
        color: hovered ? '#F9FFF6' : 'rgba(249,255,246,0.55)',
        filter: hovered
          ? `drop-shadow(2px 0 0 ${FLAME}7A) drop-shadow(-2px 0 0 ${EMERALD}55)`
          : 'none',
        transition: 'color 0.22s ease, filter 0.22s ease',
      }}>
        {display}
      </span>
    </motion.button>
  );
}

// ─── MobileSidebar ────────────────────────────────────────────────────────────
export interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const lagosTime = useWATTime();

  // Scroll-driven background — transparent at top, slightly more opaque on scroll
  const scrollY   = useMotionValue(0);
  const bgOpacity = useTransform(scrollY, [0, 320], [0.08, 0.42]);
  const blurPx    = useTransform(scrollY, [0, 320], [32, 22]);

  // Capture scroll position at the moment the sidebar opens (body scroll is
  // locked while open, so scrollY is "frozen" at the open-time value — which
  // is exactly what we want: opened deep in the page → more opaque)
  const lastScrollRef = useRef(0);
  useEffect(() => {
    const onScroll = () => { lastScrollRef.current = window.scrollY; scrollY.set(window.scrollY); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollY]);

  // Sync motion value when sidebar opens
  useEffect(() => {
    if (open) scrollY.set(lastScrollRef.current);
  }, [open, scrollY]);

  // Escape key to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const bgColor = useTransform(bgOpacity, v => `rgba(6,6,6,${Math.min(v + 0.72, 0.96).toFixed(3)})`);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mob-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: EASE }}
          className="lg:hidden"
          style={{
            position: 'fixed', inset: 0, zIndex: 190,
            background: bgColor,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            overflow: 'hidden',
          }}
        >
          {/* ── CRT scanlines ──────────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.022) 3px,rgba(0,0,0,0.022) 4px)',
          }} />

          {/* ── Grain overlay ──────────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
            opacity: 0.05,
          }} />

          {/* ── Electric Emerald laser scan — fires once on open ──────────── */}
          <motion.div
            initial={{ left: '-10%' }}
            animate={{ left: '112%' }}
            transition={{ duration: 1.1, delay: 0.1, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 0, bottom: 0, width: '7%',
              background: `linear-gradient(to right, transparent, ${EMERALD}33, ${EMERALD}BB, ${EMERALD}33, transparent)`,
              filter: `blur(12px)`,
              zIndex: 6, pointerEvents: 'none', opacity: 0.9,
            }}
          />

          {/* ── Top separator glow ─────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 2,
            background: `linear-gradient(to right, transparent, ${EMERALD}2E, transparent)`,
          }} />

          {/* ── Atmospheric radial glow ────────────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: `radial-gradient(ellipse 70% 55% at 15% 50%, rgba(0,255,156,0.04) 0%, transparent 65%)`,
          }} />

          {/* ── Content ────────────────────────────────────────────────────── */}
          <div style={{
            position: 'relative', zIndex: 10, height: '100%',
            display: 'flex', flexDirection: 'column',
            padding: 'clamp(84px,13vw,104px) clamp(24px,7vw,52px) clamp(28px,5vh,44px)',
          }}>
            {/* Navigation links */}
            <nav
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              aria-label="Mobile navigation"
            >
              {NAV_LINKS.map((item, i) => (
                <GlitchNavLink key={item.id} item={item} index={i} onClose={onClose} />
              ))}
            </nav>

            {/* ── Bottom system metadata ─────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7, ease: EASE }}
              style={{
                borderTop: '0.5px solid rgba(249,255,246,0.06)',
                paddingTop: 20,
                display: 'flex', alignItems: 'flex-end',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
              }}
            >
              <div style={{
                fontFamily: FONT_MONO, fontSize: 6.5, letterSpacing: '0.18em',
                fontWeight: 700, lineHeight: 2,
              }}>
                <div style={{ color: 'rgba(249,255,246,0.22)' }}>SYS_OPERATOR: ABAKWE.CARRINGTON</div>
                <div style={{ color: 'rgba(255,90,31,0.4)' }}>LOCATION: REMOTE // AVAILABLE</div>
              </div>

              {/* Live WAT clock */}
              <div style={{
                fontFamily: FONT_MONO,
                fontSize: 'clamp(15px, 3.8vw, 22px)',
                color: 'rgba(249,255,246,0.45)', fontWeight: 700, letterSpacing: '0.07em',
              }}>
                {lagosTime || '00:00:00'}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
