'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import { MobileSidebar } from './MobileSidebar';
import { lenisInstance } from './SmoothScroll';
import { useIsMobile } from '@/lib/useIsMobile';

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_DISPLAY = '"Monument Extended","PP Neue Montreal","Inter",sans-serif';
const FONT_MONO    = '"JetBrains Mono","IBM Plex Mono",monospace';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMERALD = '#00FF9C';
const FLAME   = '#FF5A1F';

const NAV_LINKS = [
  { label: '[01]_ABOUT',      id: 'narrative' },
  { label: '[02]_EXPERIENCE', id: 'audit'     },
  { label: '[03]_PROJECTS',   id: 'bento'     },
  { label: '[04]_SKILLS',     id: 'intel'     },
  { label: '[05]_CONTACT',    id: 'uplink'    },
];

const SECTION_IDS = ['hero', 'narrative', 'audit', 'bento', 'intel', 'uplink'];

// ─── Scroll progress hook ─────────────────────────────────────────────────────
function useScrollDepth() {
  const [depth, setDepth] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setDepth(total > 0 ? Math.min(1, scrolled / total) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return depth;
}

// ─── Active section hook ──────────────────────────────────────────────────────
function useActiveSection() {
  const [active, setActive] = useState('hero');
  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY + 120;
      let current = 'hero';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) current = id;
      }
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return active;
}

// ─── Hide/show on scroll direction ───────────────────────────────────────────
function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      if (y < 100) { setHidden(false); lastY.current = y; return; }
      if (y - lastY.current > 8) setHidden(true);
      else if (lastY.current - y > 8) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return hidden;
}

// ─── Elapsed time HUD ────────────────────────────────────────────────────────
function useElapsed() {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(0);
  useEffect(() => {
    startRef.current = performance.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((performance.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  return `${m}:${s}`;
}

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

// ─── Nav link with active state + chromatic aberration + flame underscore ────
function NavLink({ label, id, isActive }: { label: string; id: string; isActive: boolean }) {
  const [hovered, setHovered] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 380, damping: 28 });
  const sy = useSpring(my, { stiffness: 380, damping: 28 });
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.22);
    my.set((e.clientY - rect.top  - rect.height / 2) * 0.22);
  }, [mx, my]);

  const handleMouseLeave = useCallback(() => {
    mx.set(0); my.set(0); setHovered(false);
  }, [mx, my]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      (lenisInstance.current as any)?.scrollTo(el, { offset: -80, duration: 1.4 });
    }
  };

  const lit = hovered || isActive;

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: sx,
        y: sy,
        background: 'none', border: 'none', cursor: 'crosshair',
        position: 'relative', padding: '5px 0', outline: 'none',
        willChange: 'transform',
      }}
    >
      {/* Active indicator dot */}
      {isActive && !hovered && (
        <motion.span
          layoutId="nav-active-dot"
          style={{
            position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
            width: 3, height: 3, borderRadius: '50%',
            background: EMERALD,
            boxShadow: `0 0 6px ${EMERALD}`,
          }}
        />
      )}
      <span style={{
        fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.28em', fontWeight: 700,
        color: lit ? 'rgba(249,255,246,0.92)' : 'rgba(249,255,246,0.35)',
        transition: 'color 0.18s ease',
        filter: hovered
          ? `drop-shadow(1.5px 0 0 ${FLAME}B0) drop-shadow(-1.5px 0 0 ${EMERALD}B0)`
          : isActive
          ? `drop-shadow(0 0 6px ${EMERALD}55)`
          : 'none',
        display: 'block', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      {/* Flame underscore — shows on hover; emerald on active */}
      <motion.div
        animate={{ scaleX: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
        transition={{ duration: 0.22, ease: EASE }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: hovered
            ? `linear-gradient(to right, ${FLAME}, ${FLAME}66)`
            : `linear-gradient(to right, ${EMERALD}88, ${EMERALD}22)`,
          transformOrigin: 'left center',
        }}
      />
    </motion.button>
  );
}

// ─── Data Toggle (hamburger ↔ X morph) ───────────────────────────────────────
function DataToggle({ open }: { open: boolean }) {
  return (
    <div style={{ width: 22, height: 16, position: 'relative' }}>
      <motion.span
        animate={open ? { rotate: 45, y: 7, scaleX: 1 } : { rotate: 0, y: 0, scaleX: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{
          display: 'block', position: 'absolute', top: 0, left: 0,
          width: '100%', height: 1, background: 'rgba(249,255,246,0.7)',
          transformOrigin: 'center center',
        }}
      />
      <motion.span
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.3 : 1 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{
          display: 'block', position: 'absolute', top: '50%', left: 0,
          width: '100%', height: 1, background: EMERALD, marginTop: -0.5,
        }}
      />
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
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const isMobile   = useIsMobile();
  const scrollDepth = useScrollDepth();
  const activeSection = useActiveSection();
  const navHidden = useScrollDirection();
  const elapsed = useElapsed();

  // Blur intensifies with scroll
  const blurAmount = scrolled ? 32 : 18;
  const bgAlpha    = scrolled ? 0.94 : 0.76;

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
        animate={{ opacity: 1, y: navHidden ? -90 : 0 }}
        transition={{ duration: navHidden ? 0.38 : 0.55, ease: EASE, delay: navHidden ? 0 : (scrolled ? 0 : 0.4) }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, pointerEvents: 'none' }}
        aria-label="Primary navigation"
      >
        {/* ── Scroll depth progress line at very top of viewport ─────────── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'rgba(249,255,246,0.04)',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <motion.div
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: `${scrollDepth * 100}%`,
              background: `linear-gradient(to right, ${FLAME}99, ${EMERALD}CC)`,
              transition: 'width 0.1s linear',
              boxShadow: scrollDepth > 0.02 ? `0 0 6px ${EMERALD}66` : 'none',
            }}
          />
          {/* Leading glow dot */}
          {scrollDepth > 0.02 && (
            <div style={{
              position: 'absolute', top: '50%',
              left: `${scrollDepth * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: 4, height: 4, borderRadius: '50%',
              background: EMERALD,
              boxShadow: `0 0 8px ${EMERALD}`,
              transition: 'left 0.1s linear',
            }} />
          )}
        </div>

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
                background: `rgba(6,6,6,${bgAlpha})`,
                backdropFilter: `blur(${blurAmount}px)`,
                WebkitBackdropFilter: `blur(${blurAmount}px)`,
                border: `0.5px solid rgba(0,255,156,${scrolled ? 0.22 : 0.15})`,
                borderRadius: 999,
                boxShadow: scrolled
                  ? `0 0 0 1px rgba(0,0,0,0.5), 0 12px 44px rgba(0,0,0,0.48), 0 0 60px rgba(0,255,156,0.07)`
                  : `0 0 0 1px rgba(0,0,0,0.5), 0 12px 44px rgba(0,0,0,0.38), 0 0 60px rgba(0,255,156,0.04)`,
                transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
              }}>
                {/* Logo sig */}
                <Image
                  src="/logo/logo_white_horizontal.png"
                  alt="Cybersage"
                  width={320}
                  height={40}
                  style={{
                    height: 40,
                    width: 'auto',
                    objectFit: 'contain',
                    opacity: 0.9,
                  }}
                  priority
                />

                <div style={{ width: 1, height: 12, background: 'rgba(249,255,246,0.07)', flexShrink: 0 }} />

                {/* Nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {NAV_LINKS.map(l => (
                    <NavLink
                      key={l.id}
                      label={l.label}
                      id={l.id}
                      isActive={activeSection === l.id}
                    />
                  ))}
                </div>

                <div style={{ width: 1, height: 12, background: 'rgba(249,255,246,0.07)', flexShrink: 0 }} />

                {/* System status HUD + elapsed timer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
                  <BlinkingDot />
                  <span style={{
                    fontFamily: FONT_MONO, fontSize: 6, letterSpacing: '0.22em',
                    color: `${EMERALD}99`, fontWeight: 700,
                  }}>
                    SYS_ACTIVE // REMOTE_NODE
                  </span>
                  <span style={{
                    fontFamily: FONT_MONO, fontSize: 5.5, letterSpacing: '0.18em',
                    color: `rgba(249,255,246,0.22)`, fontWeight: 700,
                  }}>
                    T+{elapsed}
                  </span>
                </div>
              </div>
            </MagneticPill>
          </div>
        </div>

        {/* ── Active section readout below pill (desktop) ────────────────────── */}
        {!isMobile && activeSection !== 'hero' && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{
              display: 'flex', justifyContent: 'center', marginTop: 6,
              pointerEvents: 'none',
            }}
          >
            <span style={{
              fontFamily: FONT_MONO, fontSize: 5.5, letterSpacing: '0.28em',
              color: `${EMERALD}55`, fontWeight: 700,
              textTransform: 'uppercase',
            }}>
              // VIEWING: {activeSection.toUpperCase()}
            </span>
          </motion.div>
        )}
      </motion.nav>

      {/* ── Mobile bottom toggle — fixed, bottom-center ──────────────────────── */}
      <motion.div
        className="lg:hidden"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
        style={{
          position: 'fixed', bottom: 28, left: 24, zIndex: 201,
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          style={{
            background: 'rgba(6,6,6,0.72)',
            border: '0.5px solid rgba(0,255,156,0.18)',
            borderRadius: 999,
            cursor: 'crosshair',
            padding: '10px 14px',
            outline: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <DataToggle open={menuOpen} />
        </button>
      </motion.div>

      {/* Mobile sidebar — rendered as sibling, zIndex 190 (below toggle at 201) */}
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
