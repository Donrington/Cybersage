'use client';

import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  { name: 'NEXTGEN ROBOTICS', src: '/logo/NEXTGEN PL (Landscape) WHITE.png',   ref: '01' },
  { name: 'RECOVERDERM',      src: '/logo/ReCoverDerm Logo Varient (White).png', ref: '02' },
  { name: 'ROKEYLA',          src: '/logo/RokeylaSecondaryLogoWhite.png',       ref: '03' },
  { name: 'TQL',              src: '/logo/TQL LOGO 2-01.png',                  ref: '04' },
  { name: 'AUTOBOY',          src: '/logo/autoboy.png',                        ref: '05' },
  { name: 'SAMDUS',           src: '/logo/samdus_white.png',                   ref: '06' },
  { name: 'TECH',             src: '/logo/techwhite.png',                      ref: '07' },
  { name: 'AXFLO OIL',               src: '/logo/AXFLOOILLOGOWHITE.png',        ref: '08' },
  { name: 'ANOC.NG',                 src: '/logo/anoc.svg',                     ref: '09' },
  { name: 'TWERK QUEEN',             src: '/projects/twerkqueenlagos.jpg',      ref: '0A' },
  { name: 'CHRIS CONTRERAS',         src: '/logo/chris_con.png',                ref: '0B' },
  { name: 'AMANIGO',                                                             ref: '0C' },
];

// ─── Corner bracket decoration ────────────────────────────────────────────────
function Corners({ active }: { active: boolean }) {
  const sz = 7;
  const c  = active ? `${EMERALD}CC` : `${EMERALD}2A`;
  const base: React.CSSProperties = {
    position: 'absolute', width: sz, height: sz,
    transition: 'border-color 0.22s ease',
  };
  return (
    <>
      <div style={{ ...base, top: -1, left:  -1, borderTop: `0.5px solid ${c}`, borderLeft:   `0.5px solid ${c}` }} />
      <div style={{ ...base, top: -1, right: -1, borderTop: `0.5px solid ${c}`, borderRight:  `0.5px solid ${c}` }} />
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
  const sx = useSpring(mx, { stiffness: 290, damping: 22 });
  const sy = useSpring(my, { stiffness: 290, damping: 22 });

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
              position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontFamily: FONT_DISPLAY, fontSize: 5.5, letterSpacing: '0.18em', fontWeight: 900,
              color: EMERALD, pointerEvents: 'none', zIndex: 10,
            }}
          >
            VERIFIED_PARTNER // [REF_0x{partner.ref}]
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Data-cell container ───────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        padding: '9px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 96,
      }}>
        <Corners active={hovered} />

        {/* Outer glow on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: -5,
            boxShadow: `0 0 14px ${EMERALD}2A, 0 0 28px ${EMERALD}14`,
            pointerEvents: 'none',
          }} />
        )}

        {/* Logo image */}
        {partner.src ? (
          <Image
            src={partner.src}
            alt={partner.name}
            width={80}
            height={28}
            style={{
              height: 24, width: 'auto', objectFit: 'contain',
              filter: hovered
                ? 'grayscale(0) brightness(1.18)'
                : 'grayscale(100%) brightness(0.85)',
              opacity: hovered ? 1 : 0.36,
              transition: 'filter 0.26s ease, opacity 0.26s ease',
              mixBlendMode: 'screen',
            }}
          />
        ) : (
          /* Text-only partner */
          <span style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 7,
            letterSpacing: '0.18em',
            fontWeight: 900,
            color: hovered ? '#F9FFF6' : 'rgba(249,255,246,0.3)',
            transition: 'color 0.26s ease',
            whiteSpace: 'nowrap',
            mixBlendMode: 'screen',
            textShadow: hovered ? `0 0 10px ${EMERALD}55` : 'none',
          }}>
            {partner.name}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── PartnerMarquee ───────────────────────────────────────────────────────────
interface PartnerMarqueeProps {
  partners?: Partner[];
}

export function PartnerMarquee({ partners = PARTNERS }: PartnerMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  const marqueeItems = [...partners, ...partners];

  // ── Seamless GSAP marquee tween ───────────────────────────────────────────
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Measure after paint so scrollWidth is accurate
    const id = requestAnimationFrame(() => {
      const w = track.scrollWidth / 2;
      const tween = gsap.to(track, {
        x: -w, duration: 60, ease: 'none', repeat: -1,
      });
      tweenRef.current = tween;
    });
    return () => {
      cancelAnimationFrame(id);
      tweenRef.current?.kill();
    };
  }, []);

  // ── Cyber Nebula slow drift ────────────────────────────────────────────────
  useEffect(() => {
    const b1 = blob1Ref.current;
    const b2 = blob2Ref.current;
    if (!b1 || !b2) return;
    const t1 = gsap.to(b1, { x: 50, y: -35, duration: 20, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    const t2 = gsap.to(b2, { x: -40, y: 28, duration: 26, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    return () => { t1.kill(); t2.kill(); };
  }, []);

  // ── Time dilation on section hover (50% slowdown) ─────────────────────────
  const handleSectionEnter = useCallback(() => tweenRef.current?.timeScale(0.45), []);
  const handleSectionLeave = useCallback(() => tweenRef.current?.timeScale(1), []);

  return (
    <div
      onMouseEnter={handleSectionEnter}
      onMouseLeave={handleSectionLeave}
      style={{
        position: 'relative', width: '100%', overflow: 'hidden',
        background: 'radial-gradient(ellipse 90% 120% at 50% 50%, #161616 0%, #050505 100%)',
        paddingTop: 32, paddingBottom: 32,
      }}
    >
      {/* ── Cyber Nebula — Emerald blob ────────────────────────────────────── */}
      <div
        ref={blob1Ref}
        style={{
          position: 'absolute', left: '18%', top: '-50%',
          width: 460, height: 460, borderRadius: '50%',
          background: EMERALD, opacity: 0.05, filter: 'blur(90px)',
          pointerEvents: 'none', zIndex: 1,
        }}
      />

      {/* ── Cyber Nebula — Flame blob ──────────────────────────────────────── */}
      <div
        ref={blob2Ref}
        style={{
          position: 'absolute', right: '12%', bottom: '-50%',
          width: 380, height: 380, borderRadius: '50%',
          background: FLAME, opacity: 0.05, filter: 'blur(80px)',
          pointerEvents: 'none', zIndex: 1,
        }}
      />

      {/* ── Grain texture ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.05,
      }} />

      {/* ── Micro-scanlines ────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.022) 3px,rgba(0,0,0,0.022) 4px)',
      }} />

      {/* ── Top / bottom separator lines ───────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 4,
        background: 'linear-gradient(to right, transparent, rgba(0,255,156,0.14), transparent)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, zIndex: 4,
        background: 'linear-gradient(to right, transparent, rgba(0,255,156,0.14), transparent)',
      }} />

      {/* ── HUD label ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)',
        fontFamily: FONT_MONO, fontSize: 6, letterSpacing: '0.24em', fontWeight: 700,
        color: 'rgba(0,255,156,0.26)', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
      }}>
        TRUSTED_BY: {PARTNERS.length}_VERIFIED_PARTNERS // NETWORK_ACTIVE
      </div>

      {/* ── Marquee track ──────────────────────────────────────────────────── */}
      <div style={{ overflow: 'visible', position: 'relative', zIndex: 2 }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 32, paddingTop: 20, paddingBottom: 16,
            width: 'max-content',
          }}
        >
          {marqueeItems.map((partner, idx) => (
            <LogoCard key={`${partner.ref}-${idx}`} partner={partner} />
          ))}
        </div>
      </div>

      {/* ── Left portal blur mask — logos materialise out of blur ──────────── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 110,
        backdropFilter: 'blur(7px)',
        WebkitBackdropFilter: 'blur(7px)',
        maskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
        pointerEvents: 'none', zIndex: 5,
      }} />
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 110,
        background: 'linear-gradient(to right, #080808 20%, transparent 100%)',
        pointerEvents: 'none', zIndex: 6,
      }} />

      {/* ── Right portal blur mask ─────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 110,
        backdropFilter: 'blur(7px)',
        WebkitBackdropFilter: 'blur(7px)',
        maskImage: 'linear-gradient(to left, black 25%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to left, black 25%, transparent 100%)',
        pointerEvents: 'none', zIndex: 5,
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 110,
        background: 'linear-gradient(to left, #080808 20%, transparent 100%)',
        pointerEvents: 'none', zIndex: 6,
      }} />
    </div>
  );
}
