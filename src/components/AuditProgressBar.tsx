'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface AuditProgressBarProps {
  sectionRef:    React.RefObject<HTMLElement | null>;
  isSystemFault?: boolean;
  totalCards?:    number;
}

// ─── Blinking status label ────────────────────────────────────────────────────
function BlinkingStatus({ complete, isFault }: { complete: boolean; isFault: boolean }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!complete && !isFault) { setShow(true); return; }
    // Fault blinks faster (200ms) for urgency; completion blinks slower (560ms)
    const speed = isFault ? 200 : 560;
    const id = setInterval(() => setShow(s => !s), speed);
    return () => clearInterval(id);
  }, [complete, isFault]);

  const label = isFault
    ? 'SYSTEM_FAULT: BUFFER_OVERFLOW'
    : complete
    ? 'AUDIT_SUCCESS // ACCESS_GRANTED'
    : 'PORTFOLIO_AUDIT_IN_PROGRESS...';

  const color = isFault
    ? show ? '#AE0C00' : 'rgba(174,12,0,0.25)'
    : complete
    ? show ? '#00FF9C' : 'rgba(0,255,156,0.28)'
    : 'rgba(249,255,246,0.45)';

  return (
    <span
      style={{
        fontFamily: '"Monument Extended","PP Neue Montreal","Inter",monospace',
        fontSize: 6.5,
        letterSpacing: '0.22em',
        color,
        fontWeight: 700,
        textTransform: 'uppercase',
        transition: 'color 0.08s step-start',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

// ─── AuditProgressBar ─────────────────────────────────────────────────────────
export function AuditProgressBar({ sectionRef, isSystemFault = false, totalCards = 12 }: AuditProgressBarProps) {
  const fillRef    = useRef<HTMLDivElement>(null);
  // Mirror prop into a ref so the GSAP onUpdate closure reads it without staling
  const isFaultRef = useRef(false);
  isFaultRef.current = isSystemFault;

  const [mounted,      setMounted]      = useState(false);
  const [visible,      setVisible]      = useState(false);
  const [complete,     setComplete]     = useState(false);
  const [blink,        setBlink]        = useState(false);
  const [displayPct,   setDisplayPct]   = useState(0);
  const [displayCards, setDisplayCards] = useState(0);

  // Portal requires document.body — only available after mount
  useEffect(() => setMounted(true), []);

  const rawPct   = useMotionValue(0);
  const rawCards = useMotionValue(0);

  const smoothPct   = useSpring(rawPct,   { stiffness: 80, damping: 22 });
  const smoothCards = useSpring(rawCards, { stiffness: 60, damping: 20 });

  const barWidth = useTransform(
    smoothPct,
    v => `${Math.min(Math.max(v, 0), 100).toFixed(2)}%`
  );

  useMotionValueEvent(smoothPct, 'change', (v) => {
    const clamped = Math.min(Math.round(v), 100);
    setDisplayPct(clamped);
    if (clamped >= 100 && !complete) {
      setComplete(true);
      setBlink(true);
      setTimeout(() => setBlink(false), 1200);
    }
  });

  useMotionValueEvent(smoothCards, 'change', (v) => {
    setDisplayCards(Math.min(Math.round(v), totalCards));
  });

  // Override fill glow to red pulse when faulted; clear on recovery
  useEffect(() => {
    if (!fillRef.current) return;
    if (isSystemFault) {
      fillRef.current.style.boxShadow =
        '0 0 20px rgba(174,12,0,0.9), 0 0 40px rgba(255,90,31,0.45)';
    } else {
      fillRef.current.style.boxShadow = 'none';
    }
  }, [isSystemFault]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // ── Visibility trigger ─────────────────────────────────────────────────
    const visTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 65%',
      onEnter:     () => setVisible(true),
      onLeaveBack: () => {
        setVisible(false);
        setComplete(false);
        rawPct.set(0);
        rawCards.set(0);
      },
    });

    // ── Progress + velocity glow ───────────────────────────────────────────
    const progTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        rawPct.set(self.progress * 100);

        // Direct DOM glow — zero re-renders; skip during fault (fault owns the glow)
        if (fillRef.current && !isFaultRef.current) {
          const vel  = Math.abs(self.getVelocity());
          const glow = Math.min(vel / 1800, 1);
          fillRef.current.style.boxShadow = glow > 0.08
            ? `0 0 ${(6 + glow * 14).toFixed(1)}px rgba(0,255,156,${(0.55 + glow * 0.45).toFixed(2)}), ` +
              `0 0 ${(3 + glow * 8).toFixed(1)}px rgba(174,12,0,${(0.35 + glow * 0.4).toFixed(2)})`
            : 'none';
        }
      },
    });

    // ── Card intersection observer ─────────────────────────────────────────
    const cards = section.querySelectorAll('[data-bento-card]');
    let seenCount = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) seenCount = Math.min(seenCount + 1, totalCards);
          else                      seenCount = Math.max(0, seenCount - 1);
        });
        rawCards.set(seenCount);
      },
      { threshold: 0.3 }
    );

    cards.forEach(card => observer.observe(card));

    return () => {
      visTrigger.kill();
      progTrigger.kill();
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionRef]);

  if (!mounted) return null;

  return createPortal(
    (<>
      {/* ── Screen-wide glitch flash on completion ──────────────────────────── */}
      <AnimatePresence>
        {blink && (
          <motion.div
            key="glitch-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.18, 0, 0.12, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, times: [0, 0.15, 0.35, 0.6, 1] }}
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: 9998,
              background:
                'linear-gradient(135deg, rgba(0,255,156,0.3) 0%, rgba(174,12,0,0.3) 100%)',
              mixBlendMode: 'screen',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Bar + pill ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="audit-bar"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed top-0 left-0 right-0 pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            {/* ── 2px track ─────────────────────────────────────────────────── */}
            <div
              className="relative w-full"
              style={{ height: 2, background: 'rgba(249,255,246,0.06)' }}
            >
              {/* Filled portion */}
              <motion.div
                ref={fillRef}
                className="absolute top-0 left-0 h-full"
                style={{
                  width: barWidth,
                  background: isSystemFault
                    ? 'linear-gradient(to right, #AE0C00 0%, #FF5A1F 100%)'
                    : complete
                    ? 'linear-gradient(to right, #00FF9C, #AE0C00, #00FF9C)'
                    : 'linear-gradient(to right, #00FF9C 0%, #AE0C00 100%)',
                  transition: 'background 0.2s ease',
                  willChange: 'width, box-shadow',
                }}
              />

              {/* Leading-edge glow dot */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: barWidth,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isSystemFault ? '#FF5A1F' : complete ? '#00FF9C' : '#AE0C00',
                  boxShadow: isSystemFault
                    ? '0 0 8px #FF5A1F, 0 0 18px rgba(174,12,0,0.8)'
                    : complete
                    ? '0 0 8px #00FF9C, 0 0 18px rgba(0,255,156,0.65)'
                    : '0 0 8px #AE0C00, 0 0 18px rgba(174,12,0,0.65)',
                  transform: 'translate(-50%, -50%)',
                  transition: 'background 0.2s ease, box-shadow 0.2s ease',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* ── Glass pill — desktop ───────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
              className="hidden sm:flex absolute top-4 right-4 items-center gap-3"
              style={{
                background: 'rgba(14,14,14,0.72)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '0.5px solid rgba(0,255,156,0.18)',
                padding: '6px 12px',
                boxShadow: '0 0 18px rgba(0,255,156,0.06)',
              }}
            >
              {/* Grain on pill */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                  opacity: 0.04,
                }}
              />

              {/* Status label */}
              <BlinkingStatus complete={complete} isFault={isSystemFault} />

              {/* Divider */}
              <div
                className="shrink-0 self-stretch"
                style={{ width: 1, background: 'rgba(0,255,156,0.15)' }}
              />

              {/* Metrics */}
              <div className="flex flex-col gap-0.5">
                {totalCards > 0 && (
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 6,
                    letterSpacing: '0.16em',
                    color: 'rgba(249,255,246,0.3)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  DATA_PACKETS_RETRIEVED: {String(displayCards).padStart(2, '0')}/{String(totalCards).padStart(2, '0')}
                </span>
                )}
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 6,
                    letterSpacing: '0.16em',
                    color: 'rgba(249,255,246,0.3)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  COMPLETION_STRESS: {String(displayPct).padStart(3, '0')}%
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 5.5,
                    letterSpacing: '0.14em',
                    color: 'rgba(0,255,156,0.45)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  SYS_OPERATOR: ABAKWE.CARRINGTON
                </span>
              </div>
            </motion.div>

            {/* ── Mobile micro readout — left side, clear of hamburger ─────── */}
            <div
              className="sm:hidden absolute top-3 left-4"
              style={{
                fontFamily: 'monospace',
                fontSize: 6,
                letterSpacing: '0.18em',
                color: complete ? '#00FF9C' : 'rgba(249,255,246,0.4)',
                fontWeight: 700,
              }}
            >
              {displayPct}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>),
    document.body
  );
}
