'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuditProgressBar } from './AuditProgressBar';
import { useIsMobile } from '@/lib/useIsMobile';

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@∆_!|><{}[]∞§¶';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Signal {
  id:             string;
  label:          string;
  source:         string;
  text:           string;
  status:         'VERIFIED';
  timestamp:      string;   // hex-format e.g. 0x7F4_SYNC
  signalStrength: 'HIGH' | 'STABLE';
  protocol:       string;
  clearance:      string;
  payload:        string;   // PAYLOAD_vX.X — shown as HUD corner label
}

// ─── Signal Data ─────────────────────────────────────────────────────────────
const SIGNALS: Signal[] = [
  {
    id: 'sig-01',
    label: 'SIGNAL_01',
    source: 'RECOVERDERM',
    text: 'INTEL: ADVANCED_PARAMEDICAL_INFRASTRUCTURE_DEPLOYED // STATUS: ACTIVE_AND_STABLE // SEC: HIGH_LEVEL_ENCRYPTION',
    status: 'VERIFIED',
    timestamp: '0x7F4_SYNC',
    signalStrength: 'STABLE',
    protocol: 'NEXT.JS // DJANGO // REST',
    clearance: 'CLEARANCE: ALPHA_1',
    payload: 'PAYLOAD_v1.5',
  },
  {
    id: 'sig-02',
    label: 'SIGNAL_02',
    source: 'AUTOBOY_B2B_B2C',
    text: 'SIGNAL_STRENGTH: HIGH // METRIC: +30%_RESPONSE_TIME // ARCH: GO_MICROSERVICES_SCALED',
    status: 'VERIFIED',
    timestamp: '0xA3B_RECV',
    signalStrength: 'HIGH',
    protocol: 'MICROSERVICES // REDIS_CACHE',
    clearance: 'CLEARANCE: ECHO_7',
    payload: 'PAYLOAD_v4.2',
  },
  {
    id: 'sig-03',
    label: 'SIGNAL_03',
    source: 'ANOC.NG',
    text: 'INTEL: FINANCIAL_DATA_INTEGRITY_VERIFIED // STATUS: COMPLIANCE_READY // SECTOR: AUDIT_FINANCE',
    status: 'VERIFIED',
    timestamp: '0xC5D_INIT',
    signalStrength: 'STABLE',
    protocol: 'NEXT.JS // NODE.JS // POSTGRES',
    clearance: 'CLEARANCE: DELTA_4',
    payload: 'PAYLOAD_v2.1',
  },
  {
    id: 'sig-04',
    label: 'SIGNAL_04',
    source: 'AXFLO_OIL_GAS',
    text: 'DATA_LOG: CUSTOM_ENTERPRISE_CMS_OPERATIONAL // METRIC: 100%_WORKFLOW_AUTOMATION // SECTOR: ENERGY_SECTOR',
    status: 'VERIFIED',
    timestamp: '0x9E2_LOCK',
    signalStrength: 'HIGH',
    protocol: 'DJANGO // POSTGRES // HEADLESS',
    clearance: 'CLEARANCE: BRAVO_3',
    payload: 'PAYLOAD_v5.0',
  },
  {
    id: 'sig-05',
    label: 'SIGNAL_05',
    source: 'SAMDUS_OIL_GAS',
    text: 'SIGNAL: CORP_PORTFOLIO_OPTIMIZED // METRIC: SEO_INFRASTRUCTURE_MAX_IMPACT // SLOGAN: INNOVATION_IN_SERVICES',
    status: 'VERIFIED',
    timestamp: '0x4F1_SENT',
    signalStrength: 'STABLE',
    protocol: 'NEXT.JS // DJANGO // ISR',
    clearance: 'CLEARANCE: GAMMA_2',
    payload: 'PAYLOAD_v2.4',
  },
  {
    id: 'sig-06',
    label: 'SIGNAL_06',
    source: 'NEXTGEN_ROBOTICS',
    text: 'DECRYPTED: +25%_USER_ENGAGEMENT // ARCH: CLOUD_NATIVE_BLUEPRINT // STATUS: DEPLOYED',
    status: 'VERIFIED',
    timestamp: '0x8B7_CONF',
    signalStrength: 'HIGH',
    protocol: 'CLOUD_NATIVE // GO + AWS',
    clearance: 'CLEARANCE: ECHO_9',
    payload: 'PAYLOAD_v3.8',
  },
];

// ─── Glitch text decryption ───────────────────────────────────────────────────
function GlitchText({ text, revealed }: { text: string; revealed: boolean }) {
  const [display, setDisplay]   = useState(text);
  const rafRef                  = useRef<number>(0);
  const resolvedRef             = useRef<boolean[]>([]);

  useEffect(() => {
    if (!revealed) return;
    cancelAnimationFrame(rafRef.current);

    const chars = text.split('');
    resolvedRef.current = chars.map(() => false);
    let frame = 0;

    // Tuned to resolve in ~36 frames (0.6 s at 60 fps)
    const tick = () => {
      frame++;
      const threshold = frame * (chars.length / 32);
      let allDone = true;

      const next = chars.map((ch, i) => {
        if (ch === ' ' || ch === ':' || ch === '/' || ch === '.' || ch === '%') return ch;
        if (resolvedRef.current[i]) return ch;
        if (i < threshold && Math.random() > 0.25) {
          resolvedRef.current[i] = true;
          return ch;
        }
        allDone = false;
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      });

      setDisplay(next.join(''));
      if (!allDone) rafRef.current = requestAnimationFrame(tick);
      else          setDisplay(text);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [revealed, text]);

  return <>{display}</>;
}

// ─── Signal card ("Data Packet") ─────────────────────────────────────────────
function SignalCard({ signal }: { signal: Signal }) {
  const cardRef              = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  // IntersectionObserver — fires based on visual (transformed) rect,
  // correctly clipped by the overflow:hidden marquee window.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isHigh = signal.signalStrength === 'HIGH';

  return (
    <div
      ref={cardRef}
      className="relative"
      style={{
        background: 'rgba(26,26,26,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(0,255,156,0.28)',
        padding: '14px 16px',
        marginBottom: 10,
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      {/* Scanline overlay — 0.02 opacity micro-lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.018) 3px, rgba(0,0,0,0.018) 4px)',
        }}
      />

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${
            isHigh ? 'rgba(0,255,156,0.7)' : 'rgba(0,255,156,0.35)'
          }, transparent)`,
        }}
      />

      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-start justify-between mb-3">
        <div className="flex flex-col gap-0.5">
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 7,
              letterSpacing: '0.22em',
              color: '#00FF9C',
              fontWeight: 700,
            }}
          >
            {signal.label}
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 5.5,
              letterSpacing: '0.16em',
              color: 'rgba(249,255,246,0.2)',
              fontWeight: 700,
            }}
          >
            {signal.clearance}
          </span>
          {/* HUD label — PAYLOAD version */}
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 5,
              letterSpacing: '0.18em',
              color: 'rgba(0,255,156,0.22)',
              fontWeight: 700,
            }}
          >
            {signal.payload}
          </span>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          {/* Status badge */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5"
            style={{
              border: '0.5px solid rgba(0,255,156,0.32)',
              background: 'rgba(0,255,156,0.06)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#00FF9C',
                boxShadow: '0 0 5px rgba(0,255,156,0.85)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 5.5,
                letterSpacing: '0.16em',
                color: '#00FF9C',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              STATUS: {signal.status}
            </span>
          </div>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 5.5,
              letterSpacing: '0.14em',
              color: 'rgba(249,255,246,0.22)',
              fontWeight: 700,
            }}
          >
            {signal.timestamp}
          </span>
        </div>
      </div>

      {/* ── Quote text (glitch-decrypt on reveal) ────────────────────────── */}
      <p
        className="relative z-10 leading-relaxed mb-3"
        style={{
          fontFamily: '"PP Neue Montreal","Inter",sans-serif',
          fontSize: 12,
          color: 'rgba(249,255,246,0.82)',
          letterSpacing: '0.015em',
        }}
      >
        <GlitchText text={signal.text} revealed={revealed} />
      </p>

      {/* Divider */}
      <div
        className="relative z-10 mb-2.5"
        style={{ height: '0.5px', background: 'rgba(0,255,156,0.1)' }}
      />

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 6,
              letterSpacing: '0.14em',
              color: 'rgba(249,255,246,0.2)',
              fontWeight: 700,
            }}
          >
            {signal.protocol}
          </span>
          <div className="flex items-center gap-1">
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: isHigh ? '#00FF9C' : 'rgba(249,255,246,0.35)',
                boxShadow: isHigh ? '0 0 5px rgba(0,255,156,0.7)' : 'none',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 5.5,
                letterSpacing: '0.14em',
                color: isHigh ? 'rgba(0,255,156,0.55)' : 'rgba(249,255,246,0.28)',
                fontWeight: 700,
              }}
            >
              SIGNAL: {signal.signalStrength}
            </span>
          </div>
        </div>

        {/* Source — Deep Red accent */}
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 6.5,
            letterSpacing: '0.16em',
            color: '#AE0C00',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          SOURCE: {signal.source}
        </span>
      </div>

      {/* HUD corner label — bottom-right absolute */}
      <div
        className="absolute bottom-2 right-2 pointer-events-none"
        style={{
          fontFamily: 'monospace',
          fontSize: 5,
          letterSpacing: '0.16em',
          color: 'rgba(174,12,0,0.35)',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        INTEL_SOURCE: ENCRYPTED
      </div>
    </div>
  );
}

// ─── Desktop section header ───────────────────────────────────────────────────
function DesktopHeader({ entered }: { entered: boolean }) {
  return (
    <div
      className="hidden lg:flex items-end justify-between pb-6 border-b"
      style={{ borderColor: 'rgba(0,255,156,0.1)' }}
    >
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          style={{
            fontFamily: 'monospace',
            fontSize: 9,
            letterSpacing: '0.3em',
            color: '#00FF9C',
            fontWeight: 700,
          }}
          className="mb-2 uppercase"
        >
          MODULE_04 // INTEL_NETWORK
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={entered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
          className="font-black uppercase tracking-tight leading-none"
          style={{
            fontFamily: '"Monument Extended","PP Neue Montreal","Inter",sans-serif',
            fontSize: 'clamp(3rem,5.5vw,5rem)',
            color: '#F9FFF6',
          }}
        >
          VERIFIED{' '}
          <span style={{ WebkitTextStroke: '1.5px rgba(249,255,246,0.32)', color: 'transparent' }}>
            SIGNALS
          </span>
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        className="flex flex-col items-end gap-1"
        style={{
          fontFamily: 'monospace',
          fontSize: 8,
          letterSpacing: '0.2em',
          color: 'rgba(249,255,246,0.2)',
        }}
      >
        <span>SIGNALS_INTERCEPTED: 06_ACTIVE</span>
        <span>NETWORK_STATUS: SECURE</span>
        <span>CLEARANCE: PUBLIC_RECORD</span>
      </motion.div>
    </div>
  );
}

// ─── Mobile sticky header ─────────────────────────────────────────────────────
function MobileStickyHeader() {
  return (
    <div
      className="lg:hidden sticky top-0 z-40 py-3 px-1 mb-4"
      style={{
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '0.5px solid rgba(0,255,156,0.12)',
      }}
    >
      <p
        style={{
          fontFamily: 'monospace',
          fontSize: 8,
          letterSpacing: '0.28em',
          color: '#00FF9C',
          fontWeight: 700,
        }}
      >
        MODULE_04 // INTEL_NETWORK
      </p>
      <h2
        className="text-2xl font-black uppercase tracking-tight leading-none mt-1"
        style={{
          fontFamily: '"Monument Extended","Inter",sans-serif',
          color: '#F9FFF6',
        }}
      >
        INTEL //{' '}
        <span style={{ WebkitTextStroke: '1px rgba(249,255,246,0.3)', color: 'transparent' }}>
          NETWORK_SIGNALS
        </span>
      </h2>
    </div>
  );
}

// ─── NetworkIntel ─────────────────────────────────────────────────────────────
const VEL_BOOST = 1800; // px/s — above this, speed-up + chromatic aberration

export function NetworkIntel() {
  const sectionRef       = useRef<HTMLElement>(null);
  const marqueeWindowRef = useRef<HTMLDivElement>(null);
  const colARef          = useRef<HTMLDivElement>(null);
  const colBRef          = useRef<HTMLDivElement>(null);
  const tweenARef        = useRef<gsap.core.Tween | null>(null);
  const tweenBRef        = useRef<gsap.core.Tween | null>(null);
  const isHoverRef       = useRef(false);
  const chromaTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [entered, setEntered] = useState(false);
  const isMobile = useIsMobile();

  // Column A: natural order, scrolls UP. Column B: reversed, scrolls DOWN.
  // Each duplicated so GSAP can loop seamlessly (y snaps at exactly half-height).
  const colAItems = [...SIGNALS, ...SIGNALS];
  const colBItems = [...[...SIGNALS].reverse(), ...[...SIGNALS].reverse()];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Section entrance
    const entryTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      once: true,
      onEnter: () => setEntered(true),
    });

    // Initialise marquees after first paint so scrollHeight is accurate
    const id = setTimeout(() => {
      if (colARef.current) {
        const half = colARef.current.scrollHeight / 2;
        tweenARef.current = gsap.to(colARef.current, {
          y: -half,
          duration: 32,
          ease: 'none',
          repeat: -1,
        });
      }
      if (colBRef.current) {
        const half = colBRef.current.scrollHeight / 2;
        tweenBRef.current = gsap.fromTo(
          colBRef.current,
          { y: -half },
          { y: 0, duration: 28, ease: 'none', repeat: -1 }
        );
      }
    }, 180);

    if (isMobile) {
      return () => {
        clearTimeout(id);
        entryTrigger.kill();
        tweenARef.current?.kill();
        tweenBRef.current?.kill();
      };
    }

    // ── Velocity sync + chromatic aberration — desktop only ───────────────
    const clearChroma = () => {
      if (marqueeWindowRef.current) marqueeWindowRef.current.style.filter = 'none';
      if (!isHoverRef.current) {
        tweenARef.current?.timeScale(1);
        tweenBRef.current?.timeScale(1);
      }
      chromaTimerRef.current = null;
    };
    const velocityTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const absVel = Math.abs(self.getVelocity());
        if (absVel > VEL_BOOST) {
          if (!isHoverRef.current) {
            const boost = Math.min(1 + absVel / 6000, 2.8);
            tweenARef.current?.timeScale(boost);
            tweenBRef.current?.timeScale(boost);
          }
          if (marqueeWindowRef.current) {
            const intensity = Math.min((absVel - VEL_BOOST) / 4000, 1);
            const px        = (intensity * 1.2).toFixed(2);
            const alpha     = (intensity * 0.28).toFixed(2);
            marqueeWindowRef.current.style.filter =
              `drop-shadow(-${px}px 0 rgba(255,0,100,${alpha})) ` +
              `drop-shadow(${px}px 0 rgba(0,200,255,${alpha}))`;
          }
          if (chromaTimerRef.current) clearTimeout(chromaTimerRef.current);
          chromaTimerRef.current = setTimeout(clearChroma, 450);
        }
      },
    });

    // ── Hover: slow both columns to 30% speed ─────────────────────────────
    const handleEnter = () => {
      isHoverRef.current = true;
      if (tweenARef.current) gsap.to(tweenARef.current, { timeScale: 0.3, duration: 0.8 });
      if (tweenBRef.current) gsap.to(tweenBRef.current, { timeScale: 0.3, duration: 0.8 });
    };
    const handleLeave = () => {
      isHoverRef.current = false;
      if (tweenARef.current) gsap.to(tweenARef.current, { timeScale: 1, duration: 0.8 });
      if (tweenBRef.current) gsap.to(tweenBRef.current, { timeScale: 1, duration: 0.8 });
    };

    section.addEventListener('mouseenter', handleEnter);
    section.addEventListener('mouseleave', handleLeave);

    return () => {
      clearTimeout(id);
      if (chromaTimerRef.current) clearTimeout(chromaTimerRef.current);
      entryTrigger.kill();
      velocityTrigger.kill();
      tweenARef.current?.kill();
      tweenBRef.current?.kill();
      section.removeEventListener('mouseenter', handleEnter);
      section.removeEventListener('mouseleave', handleLeave);
    };
  }, [isMobile]);

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1, ease: EASE }}
      className="relative w-full"
      style={{ background: '#0A0A0A', isolation: 'isolate' }}
    >
      <AuditProgressBar sectionRef={sectionRef} totalCards={6} />
      {/* ── Grain overlay (0.05) ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.05,
        }}
      />

      {/* ── Radial ambient glow — centre ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,255,156,0.03) 0%, transparent 100%)',
        }}
      />

      {/* ── Top separator ────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(0,255,156,0.18), transparent)',
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-360 mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-20 lg:pt-24 pb-20 lg:pb-24">

        <MobileStickyHeader />

        <DesktopHeader entered={entered} />

        {/* ── Marquee window ───────────────────────────────────────────────── */}
        <div
          ref={marqueeWindowRef}
          className="relative mt-8 lg:mt-10 overflow-hidden"
          style={{
            height: 'clamp(480px, 55vw, 600px)',
            // Top/bottom gradient mask — signals materialise and dissolve
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%)',
            // filter is mutated directly by the velocity/chroma engine
          }}
        >
          <div className="flex gap-3 sm:gap-4 h-full">

            {/* ── Column A — scrolls UP ──────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              <div
                ref={colARef}
                style={{ willChange: 'transform', transform: 'translateZ(0)' }}
              >
                {colAItems.map((signal, i) => (
                  <SignalCard key={`a-${signal.id}-${i}`} signal={signal} />
                ))}
              </div>
            </div>

            {/* ── Column B — scrolls DOWN — hidden on mobile ─────────────── */}
            <div className="hidden sm:block flex-1 min-w-0">
              <div
                ref={colBRef}
                style={{ willChange: 'transform', transform: 'translateZ(0)' }}
              >
                {colBItems.map((signal, i) => (
                  <SignalCard key={`b-${signal.id}-${i}`} signal={signal} />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Section footer metadata ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          className="hidden lg:flex items-center justify-between mt-6 pt-4 border-t"
          style={{ borderColor: 'rgba(0,255,156,0.08)' }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 7,
              letterSpacing: '0.2em',
              color: 'rgba(249,255,246,0.15)',
              fontWeight: 700,
            }}
          >
            STREAM: CONTINUOUS // REFRESH: REAL_TIME
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 7,
              letterSpacing: '0.2em',
              color: 'rgba(0,255,156,0.28)',
              fontWeight: 700,
            }}
          >
            SYS_REF: INTEL_v2.0 // OPERATOR: ABAKWE.CARRINGTON
          </span>
        </motion.div>

      </div>

      {/* ── Bottom separator ─────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(0,255,156,0.18), transparent)',
        }}
      />
    </motion.section>
  );
}
