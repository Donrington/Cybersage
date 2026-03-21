'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useIsMobile } from '@/lib/useIsMobile';

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_DISPLAY = '"Monument Extended","PP Neue Montreal","Inter",sans-serif';
const FONT_MONO    = '"JetBrains Mono","IBM Plex Mono",monospace';
const FLAME        = '#FF5A1F';
const EMERALD      = '#00FF9C';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Color lerp ───────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

// ─── Boot log lines ───────────────────────────────────────────────────────────
const BOOT_LOGS = [
  'LOADING_KERNEL_MODULES...',
  'NEURAL_INTERFACE: OK',
  'ENCRYPTING_SIGNAL_LAYER...',
  'THREAT_MODEL: ACTIVE',
  'PORTFOLIO_MATRIX: INITIALIZED',
  'CYBERSAGE_CORE: ONLINE',
];

// ─── Glitch scramble ──────────────────────────────────────────────────────────
const GLITCH_CHARS = '!@#$%^&*<>[]{}|/~`';
function useGlitchText(target: string, active: boolean): string {
  const [display, setDisplay] = useState('');
  const countRef = useRef(0);
  useEffect(() => {
    if (!active) { setDisplay(''); countRef.current = 0; return; }
    countRef.current = 0;
    setDisplay(
      target.split('').map(() =>
        GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
      ).join('')
    );
    const id = setInterval(() => {
      countRef.current++;
      if (countRef.current > 9) {
        setDisplay(target);
        clearInterval(id);
        return;
      }
      setDisplay(
        target.split('').map((c, i) =>
          i < (countRef.current / 9) * target.length
            ? c
            : Math.random() < 0.45
            ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            : c
        ).join('')
      );
    }, 45);
    return () => clearInterval(id);
  }, [active, target]);
  return display;
}

// ─── SVG Rings ────────────────────────────────────────────────────────────────
const RING_TEXT = 'CYBERSAGE · SECURITY_AUDIT · NEURAL_INTERFACE · PORTFOLIO_MATRIX · ';
const RING_R1 = 110;  // textPath ring radius
const RING_R2 = 126;  // dashed pulse
const RING_R3 = 142;  // particle orbitals
const CX = 250, CY = 250;

function Rings({ isMobile }: { isMobile: boolean }) {
  const ring1Ref  = useRef<SVGGElement>(null);
  const ring2Ref  = useRef<SVGCircleElement>(null);
  const particleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const NUM_PARTICLES = isMobile ? 5 : 8;

  useEffect(() => {
    // Ring 1 — continuous rotation
    const r1 = ring1Ref.current;
    if (r1) {
      gsap.to(r1, {
        rotation: 360,
        duration: 14,
        ease: 'none',
        repeat: -1,
        transformOrigin: `${CX}px ${CY}px`,
      });
    }

    // Ring 2 — dashed dash-offset pulse (handled via Framer Motion on the element)

    // Ring 3 — particle orbitals
    const particles = particleRefs.current;
    particles.forEach((el, i) => {
      if (!el) return;
      const startAngle = (i / NUM_PARTICLES) * Math.PI * 2;
      const obj = { angle: startAngle };
      const speed = 0.38 + (i % 3) * 0.09;
      gsap.to(obj, {
        angle: startAngle + Math.PI * 2,
        duration: speed * 18,
        ease: 'none',
        repeat: -1,
        onUpdate: () => {
          const x = CX + RING_R3 * Math.cos(obj.angle);
          const y = CY + RING_R3 * Math.sin(obj.angle);
          gsap.set(el, { attr: { cx: x, cy: y } });
        },
      });
    });

    return () => {
      gsap.killTweensOf(r1 ?? {});
      particles.forEach(el => el && gsap.killTweensOf(el));
    };
  }, [NUM_PARTICLES]);

  // Circumference of ring2
  const c2 = 2 * Math.PI * RING_R2;

  return (
    <svg
      viewBox="0 0 500 500"
      width="100%"
      height="100%"
      style={{ overflow: 'visible', position: 'absolute', inset: 0 }}
    >
      <defs>
        {/* Goo filter for plasma */}
        <filter id="sl-plasma" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
            result="goo"
          />
        </filter>
        {/* Particle glow */}
        <filter id="sl-bloom" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* TextPath circle */}
        <path
          id="sl-ring1-path"
          d={`M ${CX - RING_R1},${CY} A ${RING_R1},${RING_R1} 0 1 1 ${CX - RING_R1 - 0.001},${CY}`}
        />
      </defs>

      {/* ── Ring 1 — rotating text ────────────────────────────────────────── */}
      <g ref={ring1Ref}>
        <text
          style={{
            fontFamily: FONT_MONO,
            fontSize: 7,
            letterSpacing: '0.16em',
            fill: 'rgba(0,255,156,0.35)',
            fontWeight: 700,
          }}
        >
          <textPath href="#sl-ring1-path">
            {RING_TEXT}
          </textPath>
        </text>
      </g>

      {/* ── Ring 1 thin circle ────────────────────────────────────────────── */}
      <circle
        cx={CX} cy={CY} r={RING_R1}
        fill="none"
        stroke="rgba(0,255,156,0.08)"
        strokeWidth={0.5}
      />

      {/* ── Ring 2 — dashed pulse ─────────────────────────────────────────── */}
      <motion.circle
        ref={ring2Ref}
        cx={CX} cy={CY} r={RING_R2}
        fill="none"
        stroke={EMERALD}
        strokeWidth={0.8}
        strokeDasharray={`4 ${c2 / 22 - 4}`}
        animate={{ strokeDashoffset: [0, -c2 / 22 * 5] }}
        transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
        style={{ opacity: 0.3 }}
      />

      {/* ── Ring 3 — particle orbitals ────────────────────────────────────── */}
      <circle cx={CX} cy={CY} r={RING_R3} fill="none" stroke="rgba(0,255,156,0.05)" strokeWidth={0.5} />
      <g filter="url(#sl-bloom)">
        {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
          <circle
            key={i}
            ref={el => { particleRefs.current[i] = el; }}
            cx={CX + RING_R3}
            cy={CY}
            r={i % 3 === 0 ? 2.5 : 1.8}
            fill={i % 3 === 0 ? FLAME : EMERALD}
            opacity={i % 3 === 0 ? 0.9 : 0.65}
          />
        ))}
      </g>
    </svg>
  );
}

// ─── Plasma Core ──────────────────────────────────────────────────────────────
interface PlasmaProps {
  progress: number;  // 0–100
  isMobile: boolean;
}

function PlasmaCore({ progress, isMobile }: PlasmaProps) {
  const NUM_BUBBLES = isMobile ? 5 : 8;
  const bubbleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const prevBubbleTimelines = useRef<gsap.core.Tween[]>([]);

  const coreColor = lerpColor(FLAME, EMERALD, progress / 100);
  const coreSize = isMobile ? 60 : 90;

  // Spawn/absorb bubbles
  const spawnBubble = useCallback((el: SVGCircleElement | null, i: number) => {
    if (!el) return;
    const angle = (i / NUM_BUBBLES) * Math.PI * 2;
    const dist  = 55 + Math.random() * 30;
    const startX = Math.cos(angle) * dist;
    const startY = Math.sin(angle) * dist;
    const size = 6 + Math.random() * 14;

    gsap.set(el, { attr: { cx: startX, cy: startY, r: size }, opacity: 0.7 });

    const tween = gsap.to(el, {
      duration: 1.2 + Math.random() * 1.0,
      delay: i * 0.18 + Math.random() * 0.3,
      attr: { cx: 0, cy: 0, r: size * 0.25 },
      opacity: 0,
      ease: 'power2.in',
      onComplete: () => spawnBubble(el, i),
    });
    prevBubbleTimelines.current[i] = tween;
  }, [NUM_BUBBLES]);

  useEffect(() => {
    bubbleRefs.current.forEach((el, i) => spawnBubble(el, i));
    return () => {
      prevBubbleTimelines.current.forEach(t => t?.kill());
    };
  }, [spawnBubble]);

  return (
    <svg
      viewBox="-160 -160 320 320"
      width={isMobile ? 260 : 380}
      height={isMobile ? 260 : 380}
      style={{ overflow: 'visible', position: 'relative', zIndex: 2, flexShrink: 0 }}
    >
      <defs>
        <filter id="sl-goo" x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
            result="goo"
          />
        </filter>
        <radialGradient id="sl-core-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={EMERALD} stopOpacity="1" />
          <stop offset="45%" stopColor={coreColor} stopOpacity="0.85" />
          <stop offset="100%" stopColor={FLAME} stopOpacity="0" />
        </radialGradient>
        <filter id="sl-core-glow" x="-80%" y="-80%" width="360%" height="360%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glow behind core */}
      <circle cx={0} cy={0} r={coreSize * 1.5}
        fill={coreColor} opacity={0.04 + (progress / 100) * 0.08} />
      <circle cx={0} cy={0} r={coreSize * 1.1}
        fill={coreColor} opacity={0.06 + (progress / 100) * 0.06} />

      {/* Goo cluster (core + bubbles together) */}
      <g filter="url(#sl-goo)">
        {/* Main core sphere */}
        <circle cx={0} cy={0} r={coreSize} fill="url(#sl-core-grad)" filter="url(#sl-core-glow)" />

        {/* Absorbing bubbles */}
        {Array.from({ length: NUM_BUBBLES }).map((_, i) => (
          <circle
            key={i}
            ref={el => { bubbleRefs.current[i] = el; }}
            cx={0} cy={0} r={10}
            fill={i % 2 === 0 ? FLAME : EMERALD}
            opacity={0.7}
          />
        ))}
      </g>
    </svg>
  );
}

// ─── SystemLoader ─────────────────────────────────────────────────────────────
interface SystemLoaderProps {
  onComplete: () => void;
}

export function SystemLoader({ onComplete }: SystemLoaderProps) {
  const isMobile  = useIsMobile();
  const [progress, setProgress]         = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [visibleLogs, setVisibleLogs]   = useState<number[]>([]);
  const [blasting, setBlasting]         = useState(false);
  const [done, setDone]                 = useState(false);
  const scanRef   = useRef<HTMLDivElement>(null);
  const coreRef   = useRef<HTMLDivElement>(null);
  const pctRef    = useRef<HTMLDivElement>(null);
  const gsapCtx   = useRef<gsap.Context | null>(null);

  const titleText = useGlitchText('INITIALIZING_CYBERSAGE_CORE...', glitchActive);

  // Animate CRT scanline (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const el = scanRef.current;
    if (!el) return;
    const tween = gsap.fromTo(
      el,
      { top: '-2px' },
      { top: '100%', duration: 2.4, ease: 'none', repeat: -1, repeatDelay: 0.3 }
    );
    return () => { tween.kill(); };
  }, [isMobile]);

  // Main progress timeline
  useEffect(() => {
    setGlitchActive(true);

    // Stagger log reveals
    const logTimers: ReturnType<typeof setTimeout>[] = [];
    BOOT_LOGS.forEach((_, i) => {
      logTimers.push(
        setTimeout(() => {
          setVisibleLogs(prev => [...prev, i]);
        }, 400 + i * 480)
      );
    });

    // Progress counter — eased cubic to 100 over ~3800ms
    const DURATION = 3800;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      // Ease: cubic out
      const eased = 1 - Math.pow(1 - t, 3);
      const pct = Math.round(eased * 100);
      setProgress(pct);

      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        // Blast handoff
        setTimeout(() => {
          setBlasting(true);
          setTimeout(() => {
            setDone(true);
            onComplete();
          }, 900);
        }, 200);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      logTimers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  const coreColor = lerpColor(FLAME, EMERALD, progress / 100);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="system-loader"
          initial={{ opacity: 1 }}
          animate={blasting ? { opacity: 0 } : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={blasting ? { duration: 0.85, ease: EASE } : { duration: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#060606',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* ── CRT Scanline (desktop) ───────────────────────────────────── */}
          {!isMobile && (
            <div
              ref={scanRef}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(to right, transparent, ${EMERALD}22, ${EMERALD}44, ${EMERALD}22, transparent)`,
                zIndex: 12,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* ── Grain overlay ────────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
            opacity: 0.035,
          }} />

          {/* ── CRT scanlines (horizontal) ───────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.018) 3px,rgba(0,0,0,0.018) 4px)',
          }} />

          {/* ── Background radial glow ───────────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${coreColor}0A 0%, transparent 70%)`,
            transition: 'background 0.4s ease',
          }} />

          {/* ── Big glitch percentage — background ───────────────────────── */}
          <div
            ref={pctRef}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: FONT_DISPLAY,
              fontSize: isMobile ? 'clamp(120px, 32vw, 180px)' : 'clamp(180px, 22vw, 320px)',
              fontWeight: 900,
              color: 'transparent',
              WebkitTextStroke: `1px ${coreColor}18`,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              pointerEvents: 'none',
              zIndex: 0,
              userSelect: 'none',
              transition: 'WebkitTextStroke 0.3s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {String(progress).padStart(3, '0')}%
          </div>

          {/* ── Rings + core composition ─────────────────────────────────── */}
          <motion.div
            animate={blasting ? {
              scale: 18,
              filter: [
                'none',
                `drop-shadow(3px 0 0 ${FLAME}BB) drop-shadow(-3px 0 0 ${EMERALD}BB)`,
                'none',
              ],
            } : {
              scale: 1,
              filter: 'none',
            }}
            transition={blasting ? { duration: 0.7, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
            style={{
              position: 'relative',
              width: isMobile ? 260 : 380,
              height: isMobile ? 260 : 380,
              zIndex: 10,
            }}
          >
            {/* Rings (behind core visually) */}
            <div style={{ position: 'absolute', inset: 0 }}>
              <Rings isMobile={isMobile} />
            </div>

            {/* Core — centered */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <motion.div
                animate={{ scale: [1, 1.035, 1] }}
                transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
              >
                <PlasmaCore progress={progress} isMobile={isMobile} />
              </motion.div>
            </div>
          </motion.div>

          {/* ── Boot title ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
            style={{
              fontFamily: FONT_MONO,
              fontSize: isMobile ? 8 : 10,
              letterSpacing: '0.24em',
              color: `${EMERALD}CC`,
              fontWeight: 700,
              marginTop: isMobile ? 16 : 24,
              textAlign: 'center',
              zIndex: 10,
              userSelect: 'none',
            }}
          >
            {titleText || 'INITIALIZING_CYBERSAGE_CORE...'}
          </motion.div>

          {/* ── Progress bar ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.35, ease: EASE }}
            style={{
              width: isMobile ? '72vw' : 340,
              height: 1,
              background: 'rgba(249,255,246,0.06)',
              marginTop: 14,
              position: 'relative',
              zIndex: 10,
              borderRadius: 1,
              overflow: 'visible',
            }}
          >
            <div style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              width: `${progress}%`,
              background: `linear-gradient(to right, ${FLAME}, ${coreColor})`,
              transition: 'width 0.06s linear',
              borderRadius: 1,
            }} />
            {/* Leading dot */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${progress}%`,
              transform: 'translate(-50%, -50%)',
              width: 5, height: 5, borderRadius: '50%',
              background: coreColor,
              boxShadow: `0 0 8px ${coreColor}, 0 0 16px ${coreColor}88`,
              transition: 'left 0.06s linear, background 0.3s ease, box-shadow 0.3s ease',
            }} />
          </motion.div>

          {/* ── Percentage readout ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.5, ease: EASE }}
            style={{
              fontFamily: FONT_MONO,
              fontSize: 7,
              letterSpacing: '0.28em',
              color: 'rgba(249,255,246,0.3)',
              marginTop: 8,
              zIndex: 10,
              userSelect: 'none',
            }}
          >
            {String(progress).padStart(3, '0')}% · PORTFOLIO_AUDIT
          </motion.div>

          {/* ── Boot log stream — bottom-left ────────────────────────────── */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? 20 : 32,
            left: isMobile ? 16 : 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            zIndex: 10,
            pointerEvents: 'none',
          }}>
            {BOOT_LOGS.map((line, i) => (
              <AnimatePresence key={i}>
                {visibleLogs.includes(i) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: isMobile ? 5.5 : 6.5,
                      letterSpacing: '0.18em',
                      color: i === BOOT_LOGS.length - 1
                        ? `${EMERALD}CC`
                        : 'rgba(249,255,246,0.28)',
                      fontWeight: 700,
                    }}
                  >
                    {'> '}{line}
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          {/* ── Top-right system ID ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6, ease: EASE }}
            style={{
              position: 'absolute',
              top: isMobile ? 16 : 24,
              right: isMobile ? 16 : 32,
              zIndex: 10,
              textAlign: 'right',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              fontFamily: FONT_MONO, fontSize: 5.5, letterSpacing: '0.2em',
              color: 'rgba(249,255,246,0.18)', fontWeight: 700, lineHeight: 2,
            }}>
              <div>SYS_OPERATOR: ABAKWE.CARRINGTON</div>
              <div style={{ color: `${FLAME}44` }}>LOCATION: LAGOS_TERMINAL_NG</div>
              <div style={{ color: `${EMERALD}44` }}>NODE_STATUS: ACTIVE</div>
            </div>
          </motion.div>

          {/* ── Top-left logo sig ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
            style={{
              position: 'absolute',
              top: isMobile ? 16 : 24,
              left: isMobile ? 16 : 32,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <span style={{
              fontFamily: FONT_DISPLAY, fontSize: isMobile ? 7 : 8,
              letterSpacing: '0.26em', fontWeight: 900,
              color: 'rgba(249,255,246,0.35)',
            }}>
              CYBERSAGE
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
