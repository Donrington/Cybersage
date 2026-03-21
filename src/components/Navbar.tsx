'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MobileSidebar } from './MobileSidebar';
import { lenisInstance } from './SmoothScroll';

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_DISPLAY = '"Monument Extended","PP Neue Montreal","Inter",sans-serif';
const FONT_MONO    = '"JetBrains Mono","IBM Plex Mono",monospace';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMERALD = '#00FF9C';
const FLAME   = '#FF5A1F';

const NAV_LINKS = [
  { label: '[01]_NARRATIVE', id: 'narrative' },
  { label: '[02]_AUDIT',     id: 'audit'     },
  { label: '[03]_BENTO',     id: 'bento'     },
  { label: '[04]_INTEL',     id: 'intel'     },
  { label: '[05]_UPLINK',    id: 'uplink'    },
];

// ─── Blinking status dot ──────────────────────────────────────────────────────
function BlinkingDot() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn(v => !v), 1100);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{
      display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
      background: EMERALD, boxShadow: `0 0 7px ${EMERALD}`,
      opacity: on ? 1 : 0.18,
      transition: 'opacity 0.1s step-start',
      flexShrink: 0,
    }} />
  );
}

// ─── Nav link with chromatic aberration + flame underscore ────────────────────
function NavLink({ label, id }: { label: string; id: string }) {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      (lenisInstance.current as any)?.scrollTo(el, { offset: -80, duration: 1.4 });
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none', border: 'none', cursor: 'crosshair',
        position: 'relative', padding: '5px 0', outline: 'none',
      }}
    >
      <span style={{
        fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.28em', fontWeight: 700,
        color: hovered ? 'rgba(249,255,246,0.92)' : 'rgba(249,255,246,0.35)',
        transition: 'color 0.18s ease',
        filter: hovered
          ? `drop-shadow(1.5px 0 0 ${FLAME}B0) drop-shadow(-1.5px 0 0 ${EMERALD}B0)`
          : 'none',
        display: 'block', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      {/* Flame underscore */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.22, ease: EASE }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(to right, ${FLAME}, ${FLAME}66)`,
          transformOrigin: 'left center',
        }}
      />
    </button>
  );
}

// ─── Data Toggle (hamburger ↔ X morph) ───────────────────────────────────────
function DataToggle({ open }: { open: boolean }) {
  return (
    <div style={{ width: 22, height: 16, position: 'relative' }}>
      {/* Top bar */}
      <motion.span
        animate={open ? { rotate: 45, y: 7, scaleX: 1 } : { rotate: 0, y: 0, scaleX: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{
          display: 'block', position: 'absolute', top: 0, left: 0,
          width: '100%', height: 1, background: 'rgba(249,255,246,0.7)',
          transformOrigin: 'center center',
        }}
      />
      {/* Middle bar — emerald accent, fades out when open */}
      <motion.span
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.3 : 1 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{
          display: 'block', position: 'absolute', top: '50%', left: 0,
          width: '100%', height: 1, background: EMERALD, marginTop: -0.5,
        }}
      />
      {/* Bottom bar — short at rest */}
      <motion.span
        animate={open ? { rotate: -45, y: -7, scaleX: 1 } : { rotate: 0, y: 0, scaleX: 0.65 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{
          display: 'block', position: 'absolute', bottom: 0, left: 0,
          width: '100%', height: 1, background: 'rgba(249,255,246,0.7)',
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
}

// ─── Magnetic pill wrapper ─────────────────────────────────────────────────────
function MagneticPill({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left  - rect.width  / 2) * 0.1;
    const y = (e.clientY - rect.top   - rect.height / 2) * 0.1;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'inline-block',
        transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while sidebar is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, pointerEvents: 'none' }}
        aria-label="Primary navigation"
      >
        {/* ── Desktop centered pill ─────────────────────────────────────────── */}
        <div
          className="hidden lg:flex"
          style={{ justifyContent: 'center', paddingTop: 18, pointerEvents: 'none' }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <MagneticPill>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '10px 22px',
                background: scrolled ? 'rgba(6,6,6,0.92)' : 'rgba(6,6,6,0.76)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '0.5px solid rgba(0,255,156,0.15)',
                borderRadius: 999,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 12px 44px rgba(0,0,0,0.38), 0 0 60px rgba(0,255,156,0.04)',
                transition: 'background 0.3s ease',
              }}>
                {/* Logo sig */}
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: 8, letterSpacing: '0.26em',
                  fontWeight: 900, color: 'rgba(249,255,246,0.5)', whiteSpace: 'nowrap',
                }}>
                  CYBERSAGE
                </span>

                <div style={{ width: 1, height: 12, background: 'rgba(249,255,246,0.07)', flexShrink: 0 }} />

                {/* Nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {NAV_LINKS.map(l => <NavLink key={l.id} label={l.label} id={l.id} />)}
                </div>

                <div style={{ width: 1, height: 12, background: 'rgba(249,255,246,0.07)', flexShrink: 0 }} />

                {/* System status HUD */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
                  <BlinkingDot />
                  <span style={{
                    fontFamily: FONT_MONO, fontSize: 6, letterSpacing: '0.22em',
                    color: `${EMERALD}99`, fontWeight: 700,
                  }}>
                    SYS_ACTIVE // LAGOS_NODE
                  </span>
                </div>
              </div>
            </MagneticPill>
          </div>
        </div>

        {/* ── Mobile top bar ────────────────────────────────────────────────── */}
        <div
          className="lg:hidden"
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: '14px 20px',
            background: 'transparent',
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
            borderBottom: 'none',
            transition: 'backdrop-filter 0.3s ease',
          }}
        >
          {/* Data Toggle button — right-aligned, no CYBERSAGE text */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'crosshair', padding: 8, outline: 'none' }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <DataToggle open={menuOpen} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile sidebar — rendered as sibling, zIndex 190 (below navbar at 200) */}
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
