'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import Image from 'next/image';

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_DISPLAY = '"Monument Extended","PP Neue Montreal","Inter",sans-serif';
const FONT_MONO    = '"JetBrains Mono","IBM Plex Mono",monospace';
const EMERALD = '#00FF9C';
const FLAME   = '#FF5A1F';
const EASE    = [0.22, 1, 0.36, 1] as const;

// ─── Partner data ─────────────────────────────────────────────────────────────
interface Partner {
  name: string;
  src?: string;
  ref: string;
}

const PARTNERS: Partner[] = [
  { name: 'NEXTGEN ROBOTICS', src: '/logo/NEXTGEN PL (Landscape) WHITE.png',    ref: '01' },
  { name: 'RECOVERDERM',      src: '/logo/ReCoverDerm Logo Varient (White).png', ref: '02' },
  { name: 'ROKEYLA',          src: '/logo/RokeylaSecondaryLogoWhite.png',        ref: '03' },
  { name: 'TQL',              src: '/logo/TQL LOGO 2-01.png',                   ref: '04' },
  { name: 'AUTOBOY',          src: '/logo/autoboy.png',                         ref: '05' },
  { name: 'SAMDUS',           src: '/logo/samdus_white.png',                    ref: '06' },
  { name: 'TECH',             src: '/logo/techwhite.png',                       ref: '07' },
  { name: 'AXFLO OIL',               src: '/logo/AXFLOOILLOGOWHITE.png',         ref: '08' },
  { name: 'ANOC.NG',                 src: '/logo/anoc.svg',                      ref: '09' },
  { name: 'TWERK QUEEN',             src: '/logo/QL LOGO 2-01.png',             ref: '0A' },
  { name: 'CHRIS CONTRERAS',         src: '/logo/chris_con.png',                 ref: '0B' },
  { name: 'AMANIGO',                                                              ref: '0C' },
];

// ─── Corner bracket decoration ────────────────────────────────────────────────
function Corners({ active }: { active: boolean }) {
  const c   = active ? `${EMERALD}CC` : `${EMERALD}28`;
  const sz  = 6;
  const base: React.CSSProperties = {
    position: 'absolute', width: sz, height: sz,
    transition: 'border-color 0.22s ease',
  };
  return (
    <>
      <div style={{ ...base, top: -1, left:  -1, borderTop:    `0.5px solid ${c}`, borderLeft:   `0.5px solid ${c}` }} />
      <div style={{ ...base, top: -1, right: -1, borderTop:    `0.5px solid ${c}`, borderRight:  `0.5px solid ${c}` }} />
      <div style={{ ...base, bottom: -1, left:  -1, borderBottom: `0.5px solid ${c}`, borderLeft:  `0.5px solid ${c}` }} />
      <div style={{ ...base, bottom: -1, right: -1, borderBottom: `0.5px solid ${c}`, borderRight: `0.5px solid ${c}` }} />
    </>
  );
}

// ─── LogoCard ─────────────────────────────────────────────────────────────────
function LogoCard({ partner }: { partner: Partner }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 300, damping: 22 });
  const sy = useSpring(my, { stiffness: 300, damping: 22 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left  - r.width  / 2) * 0.14);
    my.set((e.clientY - r.top   - r.height / 2) * 0.14);
  }, [mx, my]);

  const handleMouseLeave = useCallback(() => {
    mx.set(0); my.set(0); setHovered(false);
  }, [mx, my]);

  return (
    <motion.div
      ref={cardRef}
      style={{ x: sx, y: sy, flexShrink: 0, position: 'relative', cursor: 'crosshair' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Verified label ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.16, ease: EASE }}
            style={{
              position: 'absolute', bottom: '100%', left: '50%',
              transform: 'translateX(-50%)', marginBottom: 4,
              whiteSpace: 'nowrap',
              fontFamily: FONT_DISPLAY, fontSize: 5, letterSpacing: '0.18em', fontWeight: 900,
              color: EMERALD, pointerEvents: 'none', zIndex: 20,
            }}
          >
            VERIFIED // [REF_0x{partner.ref}]
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Data-cell ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        padding: '6px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 72,
      }}>
        <Corners active={hovered} />

        {/* Emerald glow on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: -4,
            boxShadow: `0 0 10px ${EMERALD}28, 0 0 20px ${EMERALD}14`,
            pointerEvents: 'none',
          }} />
        )}

        {partner.src ? (
          <Image
            src={partner.src}
            alt={partner.name}
            width={80}
            height={28}
            style={{
              height: 20, width: 'auto', objectFit: 'contain',
              filter: hovered
                ? 'grayscale(0) brightness(1.2)'
                : 'grayscale(100%) brightness(0.85)',
              opacity: hovered ? 1 : 0.32,
              transition: 'filter 0.26s ease, opacity 0.26s ease',
              mixBlendMode: 'screen',
            }}
          />
        ) : (
          <span style={{
            fontFamily: FONT_DISPLAY, fontSize: 6.5, letterSpacing: '0.16em', fontWeight: 900,
            color: hovered ? '#F9FFF6' : 'rgba(249,255,246,0.28)',
            transition: 'color 0.26s ease',
            whiteSpace: 'nowrap',
            mixBlendMode: 'screen',
            textShadow: hovered ? `0 0 8px ${EMERALD}55` : 'none',
          }}>
            {partner.name}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── PortalMarquee ────────────────────────────────────────────────────────────
export interface PortalMarqueeProps {
  isParentHovered?: boolean;
}

export function PortalMarquee({ isParentHovered = false }: PortalMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const items = [...PARTNERS, ...PARTNERS];

  // ── Seamless GSAP marquee ─────────────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      const w = track.scrollWidth / 2;
      tweenRef.current = gsap.to(track, {
        x: -w, duration: 42, ease: 'none', repeat: -1,
      });
    }, 150);
    return () => { clearTimeout(id); tweenRef.current?.kill(); };
  }, []);

  // ── Buttery time-dilation when parent pane is hovered ────────────────────
  useEffect(() => {
    if (!tweenRef.current) return;
    gsap.to(tweenRef.current, {
      timeScale: isParentHovered ? 0.2 : 1,
      duration: 0.9, ease: 'power2.out',
    });
  }, [isParentHovered]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.6, ease: EASE }}
      style={{
        position: 'relative', width: '100%', overflow: 'hidden',
        // Soft grain on top
        isolation: 'isolate',
      }}
    >
      {/* ── Grain texture ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.04,
      }} />

      {/* ── Micro-scanlines ────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.02) 3px,rgba(0,0,0,0.02) 4px)',
      }} />

      {/* ── Marquee track ──────────────────────────────────────────────────── */}
      <div style={{ overflow: 'visible', position: 'relative', zIndex: 2 }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 20, paddingTop: 12, paddingBottom: 10,
            width: 'max-content',
            willChange: 'transform',
          }}
        >
          {items.map((partner, idx) => (
            <LogoCard key={`${partner.ref}-${idx}`} partner={partner} />
          ))}
        </div>
      </div>

      {/* ── Left fade — logos materialise ───────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 80,
        background: `radial-gradient(ellipse at 0% 50%, ${EMERALD}0F 0%, ${FLAME}07 55%, transparent 100%)`,
        pointerEvents: 'none', zIndex: 6,
      }} />

      {/* ── Right fade — logos dematerialise ────────────────────────────────── */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
        background: `radial-gradient(ellipse at 100% 50%, ${EMERALD}0F 0%, ${FLAME}07 55%, transparent 100%)`,
        pointerEvents: 'none', zIndex: 6,
      }} />

      {/* ── Top / bottom separator hairlines ───────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(to right, transparent, rgba(0,255,156,0.1), transparent)',
        pointerEvents: 'none', zIndex: 4,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(to right, transparent, rgba(0,255,156,0.1), transparent)',
        pointerEvents: 'none', zIndex: 4,
      }} />
    </motion.div>
  );
}
