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
import { useIsMobile } from '@/lib/useIsMobile';

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMERALD = '#00FF9C';
const FLAME   = '#FF5A1F';
const RED     = '#AE0C00';
const FONT_MONO = '"JetBrains Mono","IBM Plex Mono",monospace';

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
    ? show ? RED : 'rgba(174,12,0,0.25)'
    : complete
    ? show ? EMERALD : 'rgba(0,255,156,0.28)'
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

// ─── Scan pulse on bar ────────────────────────────────────────────────────────
function ScanPulse({ width, color }: { width: string; color: string }) {
  return (
    <motion.div
      animate={{ x: ['-100%', '200%'] }}
      transition={{ duration: 1.6, ease: 'linear', repeat: Infinity, repeatDelay: 0.5 }}
      style={{
        position: 'absolute',
        top: 0, bottom: 0,
        left: 0,
        width: '30%',
        background: `linear-gradient(to right, transparent, ${color}55, transparent)`,
        pointerEvents: 'none',
        clipPath: `inset(0 0 0 0)`,
      }}
    />
  );
}

// ─── AuditProgressBar ─────────────────────────────────────────────────────────
export function AuditProgressBar({ sectionRef, isSystemFault = false, totalCards = 12 }: AuditProgressBarProps) {
  const fillRef    = useRef<HTMLDivElement>(null);
  const trailRef   = useRef<HTMLDivElement>(null);
  const isFaultRef = useRef(false);
  isFaultRef.current = isSystemFault;
  const isMobile   = useIsMobile();
  const rafPending = useRef(false);

  const [mounted,      setMounted]      = useState(false);
  const [visible,      setVisible]      = useState(false);
  const [complete,     setComplete]     = useState(false);
  const [blink,        setBlink]        = useState(false);
  const [displayPct,   setDisplayPct]   = useState(0);
  const [displayCards, setDisplayCards] = useState(0);

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

  // Override fill glow on fault
  useEffect(() => {
    if (!fillRef.current) return;
    if (isSystemFault) {
      fillRef.current.style.boxShadow =
        `0 0 20px rgba(174,12,0,0.9), 0 0 40px rgba(255,90,31,0.45)`;
    } else {
      fillRef.current.style.boxShadow = 'none';
    }
  }, [isSystemFault]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

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

    const progTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        rawPct.set(self.progress * 100);

        if (!isMobile && fillRef.current && !isFaultRef.current && !rafPending.current) {
          rafPending.current = true;
          requestAnimationFrame(() => {
            rafPending.current = false;
            if (!fillRef.current || isFaultRef.current) return;
            const vel  = Math.abs(self.getVelocity());
            const glow = Math.min(vel / 1800, 1);
            fillRef.current.style.boxShadow = glow > 0.08
              ? `0 0 ${(6 + glow * 14).toFixed(1)}px rgba(0,255,156,${(0.55 + glow * 0.45).toFixed(2)}), ` +
                `0 0 ${(3 + glow * 8).toFixed(1)}px rgba(174,12,0,${(0.35 + glow * 0.4).toFixed(2)})`
              : 'none';
          });
        }
      },
    });

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

  const fillColor = isSystemFault
    ? `linear-gradient(to right, ${RED} 0%, ${FLAME} 100%)`
    : complete
    ? `linear-gradient(to right, ${EMERALD}, ${RED}, ${EMERALD})`
    : `linear-gradient(to right, ${EMERALD} 0%, ${RED} 100%)`;

  const dotColor = isSystemFault ? FLAME : complete ? EMERALD : RED;

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
            {/* ── Track — thicker, 4px ─────────────────────────────────────── */}
            <div
              className="relative w-full"
              style={{
                height: 4,
                background: 'rgba(249,255,246,0.05)',
                overflow: 'visible',
              }}
            >
              {/* Glow trail behind fill */}
              <motion.div
                ref={trailRef}
                className="absolute top-0 left-0 h-full pointer-events-none"
                style={{
                  width: barWidth,
                  background: isSystemFault
                    ? `linear-gradient(to right, transparent, ${FLAME}22, ${FLAME}44)`
                    : `linear-gradient(to right, transparent, ${EMERALD}22, ${EMERALD}44)`,
                  filter: 'blur(4px)',
                  transform: 'scaleY(3)',
                  transformOrigin: 'top',
                }}
              />

              {/* Filled portion */}
              <motion.div
                ref={fillRef}
                className="absolute top-0 left-0 h-full"
                style={{
                  width: barWidth,
                  background: fillColor,
                  transition: 'background 0.2s ease',
                  willChange: 'width, box-shadow',
                  overflow: 'hidden',
                }}
              >
                {/* Scan pulse on bar (desktop only) */}
                {!isMobile && (
                  <ScanPulse
                    width={`${displayPct}%`}
                    color={isSystemFault ? FLAME : EMERALD}
                  />
                )}
              </motion.div>

              {/* Leading-edge glow dot */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: barWidth,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: dotColor,
                  boxShadow: isSystemFault
                    ? `0 0 10px ${FLAME}, 0 0 24px rgba(174,12,0,0.8)`
                    : complete
                    ? `0 0 10px ${EMERALD}, 0 0 24px rgba(0,255,156,0.65)`
                    : `0 0 10px ${RED}, 0 0 24px rgba(174,12,0,0.65)`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'background 0.2s ease, box-shadow 0.2s ease',
                  pointerEvents: 'none',
                }}
              />

              {/* Percentage label on bar (desktop) */}
              {!isMobile && displayPct > 5 && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: barWidth,
                    transform: 'translateX(-50%)',
                    fontFamily: FONT_MONO,
                    fontSize: 6,
                    letterSpacing: '0.2em',
                    color: complete ? EMERALD : 'rgba(249,255,246,0.5)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    textShadow: complete ? `0 0 8px ${EMERALD}66` : 'none',
                    transition: 'color 0.3s ease',
                    pointerEvents: 'none',
                  }}
                >
                  {String(displayPct).padStart(3, '0')}%
                </motion.div>
              )}
            </div>

            {/* ── Glass pill — desktop ───────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
              className="hidden sm:flex absolute top-6 right-4 items-center gap-3"
              style={{
                background: 'rgba(14,14,14,0.72)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: `0.5px solid ${complete ? 'rgba(0,255,156,0.28)' : 'rgba(0,255,156,0.18)'}`,
                padding: '6px 12px',
                boxShadow: complete
                  ? `0 0 18px rgba(0,255,156,0.12), 0 0 36px rgba(0,255,156,0.06)`
                  : '0 0 18px rgba(0,255,156,0.06)',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
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
                    color: complete ? `${EMERALD}CC` : 'rgba(249,255,246,0.3)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    transition: 'color 0.3s ease',
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

            {/* ── Mobile micro readout ─────────────────────────────────────── */}
            <div
              className="sm:hidden absolute top-5 left-4"
              style={{
                fontFamily: 'monospace',
                fontSize: 6,
                letterSpacing: '0.18em',
                color: complete ? EMERALD : 'rgba(249,255,246,0.4)',
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
