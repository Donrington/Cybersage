'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import gsap from 'gsap';

const EASE = [0.22, 1, 0.36, 1] as const;

const COMPANIES = [
  'RECOVERDERM',
  'ANOC.NG',
  'AUTOBOY',
  'NEXTGEN ROBOTICS',
  'AXFLO OIL',
  'SAMDUS OIL',
  'DEETS',
  'HANDYMAN',
  'TWERK QUEEN',
  'ROKEYLA',
  'AMANIGO',
  'CHRIS CONTRERAS',
  'MYRA KALEHER',
];

// Diagnostic entry codes — zero-padded
const ENTRY_CODES: Record<string, string> = Object.fromEntries(
  COMPANIES.map((name, i) => [name, `ENTRY_${String(i + 1).padStart(3, '0')}`])
);

// ─── Single company name ──────────────────────────────────────────────────────
function CompanyItem({ name }: { name: string }) {
  const [hovered, setHovered] = useState(false);
  const code = ENTRY_CODES[name] ?? 'ENTRY_000';

  return (
    <div
      className="relative shrink-0 cursor-default flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Floating diagnostic tag */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="tag"
            initial={{ opacity: 0, y: 6, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute left-1/2 pointer-events-none z-50"
            style={{
              bottom: 'calc(100% + 6px)',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 6,
                letterSpacing: '0.22em',
                fontWeight: 700,
                color: '#AE0C00',
                background: 'rgba(174,12,0,0.1)',
                border: '0.5px solid rgba(174,12,0,0.55)',
                padding: '2px 6px',
                display: 'block',
                textTransform: 'uppercase',
              }}
            >
              [{code}]
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.span
        className="uppercase font-black whitespace-nowrap select-none"
        animate={{ scale: hovered ? 1.06 : 1 }}
        transition={{ duration: 0.25, ease: EASE }}
        style={{
          fontFamily: '"Monument Extended", "PP Neue Montreal", "Inter", sans-serif',
          fontSize: 12,
          letterSpacing: '0.8em',
          opacity: hovered ? 1 : 0.28,
          color: '#F9FFF6',
          mixBlendMode: 'difference',
          textShadow: hovered
            ? '0 0 22px rgba(249,255,246,0.85), 0 0 48px rgba(174,12,0,0.4), 0 0 80px rgba(0,255,156,0.15)'
            : 'none',
          transition: 'opacity 0.32s ease, text-shadow 0.32s ease',
          willChange: 'transform',
          filter: hovered
            ? 'drop-shadow(1.5px 0 0 rgba(174,12,0,0.5)) drop-shadow(-1.5px 0 0 rgba(0,255,156,0.35))'
            : 'none',
        }}
      >
        {name}
      </motion.span>

      {/* Separator dot */}
      <span
        className="ml-10 sm:ml-14 shrink-0"
        style={{
          display: 'inline-block',
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: hovered ? '#AE0C00' : 'rgba(249,255,246,0.15)',
          transition: 'background 0.3s ease',
          mixBlendMode: 'difference',
          flexShrink: 0,
        }}
      />
    </div>
  );
}

// ─── CompanyMarquee ───────────────────────────────────────────────────────────
export function CompanyMarquee() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const scanRef    = useRef<HTMLDivElement>(null);
  const tweenRef   = useRef<gsap.core.Tween | null>(null);

  // Triple the array for a fully seamless infinite loop
  const items = [...COMPANIES, ...COMPANIES, ...COMPANIES];

  useEffect(() => {
    if (!trackRef.current) return;

    // ── Marquee tween (rate-controllable via timeScale) ──────────────────────
    const init = () => {
      if (!trackRef.current) return;
      const third = trackRef.current.scrollWidth / 3;
      tweenRef.current = gsap.to(trackRef.current, {
        x: -third,
        duration: 48,
        ease: 'none',
        repeat: -1,
      });
    };

    const id = setTimeout(init, 120);

    // ── Background parallax — slow drift opposite to marquee ─────────────────
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        x: '4%',
        duration: 60,
        ease: 'none',
        repeat: -1,
        yoyo: true,
      });
    }

    // ── Scanning light beam ───────────────────────────────────────────────────
    if (scanRef.current) {
      gsap.fromTo(
        scanRef.current,
        { x: '-20%', opacity: 0 },
        {
          x: '140%',
          opacity: 1,
          duration: 2.8,
          ease: 'power1.inOut',
          repeat: -1,
          repeatDelay: 5.5,
          delay: 1.8,
          onRepeat: () => {
            if (scanRef.current) gsap.set(scanRef.current, { x: '-20%', opacity: 0 });
          },
        }
      );
    }

    // ── Variable speed on mouse move ──────────────────────────────────────────
    const section = sectionRef.current;
    if (!section) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!tweenRef.current) return;
      const rect = section.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const isEdge = relX < 0.14 || relX > 0.86;
      gsap.to(tweenRef.current, { timeScale: isEdge ? 1.9 : 0.45, duration: 0.7 });
    };

    const handleMouseEnter = () => {
      if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 0.45, duration: 0.9 });
    };

    const handleMouseLeave = () => {
      if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 1, duration: 0.9 });
    };

    section.addEventListener('mouseenter', handleMouseEnter);
    section.addEventListener('mouseleave', handleMouseLeave);
    section.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(id);
      if (tweenRef.current) tweenRef.current.kill();
      gsap.killTweensOf([bgRef.current, scanRef.current]);
      section.removeEventListener('mouseenter', handleMouseEnter);
      section.removeEventListener('mouseleave', handleMouseLeave);
      section.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, ease: EASE }}
      className="relative w-full overflow-hidden"
      style={{ background: '#1A1A1A', isolation: 'isolate' }}
    >
      {/* ── Background image — blurred, parallax ─────────────────────────────── */}
      <div
        ref={bgRef}
        className="absolute inset-0 scale-110 will-change-transform"
        style={{
          backgroundImage: 'url(/sage.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(52px) saturate(1.4) brightness(0.55)',
          transform: 'scale(1.15)',
          transformOrigin: 'center center',
        }}
      />

      {/* ── Charcoal overlay ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ background: 'rgba(26,26,26,0.86)' }} />

      {/* ── Grain overlay ─────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.05,
        }}
      />

      {/* ── Scanning emerald light beam ───────────────────────────────────────── */}
      <div
        ref={scanRef}
        className="absolute top-0 bottom-0 pointer-events-none z-10"
        style={{
          width: '14%',
          left: '-20%',
          background:
            'radial-gradient(ellipse 50% 100% at 50% 50%, rgba(0,255,156,0.28) 0%, rgba(0,255,156,0.06) 55%, transparent 100%)',
          filter: 'blur(6px)',
        }}
      />

      {/* ── Separator lines ───────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,transparent,rgba(0,255,156,0.18),transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,transparent,rgba(0,255,156,0.18),transparent)' }} />

      {/* ── Marquee wrapper with radial + edge masks ──────────────────────────── */}
      <div
        className="relative z-20 overflow-hidden"
        style={{
          maskImage:
            'radial-gradient(ellipse 85% 100% at 50% 50%, black 42%, rgba(0,0,0,0.6) 72%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 100% at 50% 50%, black 42%, rgba(0,0,0,0.6) 72%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'destination-in',
        }}
      >
        {/* Edge blur zones */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 z-10 pointer-events-none"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            background: 'radial-gradient(ellipse at 0% 50%, rgba(0,255,156,0.04) 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 z-10 pointer-events-none"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            background: 'radial-gradient(ellipse at 100% 50%, rgba(0,255,156,0.04) 0%, transparent 100%)',
          }}
        />

        {/* Marquee track */}
        <div
          ref={trackRef}
          className="flex items-center py-8 sm:py-10 will-change-transform"
          style={{ gap: 0 }}
        >
          {items.map((name, idx) => (
            <CompanyItem key={`${name}-${idx}`} name={name} />
          ))}
        </div>
      </div>

      {/* ── Bottom accent glow ────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(0,255,156,0.06) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
    </motion.section>
  );
}
