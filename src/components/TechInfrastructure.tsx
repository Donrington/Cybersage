'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuditProgressBar } from './AuditProgressBar';
import { useIsMobile } from '@/lib/useIsMobile';

gsap.registerPlugin(ScrollTrigger);

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_DISPLAY = '"Monument Extended","PP Neue Montreal","Inter",sans-serif';
const FONT_MONO    = '"JetBrains Mono","IBM Plex Mono",monospace';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Types ────────────────────────────────────────────────────────────────────
interface TechIcon {
  id:       string;
  label:    string;
  abbr:     string;
  category: 'CORE_INFRASTRUCTURE' | 'BACKEND_STREAMS' | 'DATA_VAULTS' | 'CLOUD_STATIONS';
  x:        number; // % of stage width
  y:        number; // % of stage height
  z:        number; // 0–400 – higher = closer to viewer
  stat:     string;
  statVal:  string;
  color:    string;
  svgPath:   string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TECH_ICONS: TechIcon[] = [
  {
    id: 'nextjs', label: 'Next.js', abbr: 'NXT', category: 'CORE_INFRASTRUCTURE',
    x: 20, y: 22, z: 380, stat: 'RENDER_MODE', statVal: 'SSR + ISR',
    color: '#F9FFF6',
    svgPath: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 14.5V7.5l7 9H18V7.5h-1.5v6.9L9.5 5H8v11.5h2.5z',
  },
  {
    id: 'react', label: 'React', abbr: 'RCT', category: 'CORE_INFRASTRUCTURE',
    x: 40, y: 15, z: 340, stat: 'RENDER_CYCLE', statVal: '16ms / frame',
    color: '#61DAFB',
    svgPath: 'M12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0-9.5C7.5 4 3.5 7.7 3.5 12S7.5 20 12 20s8.5-3.7 8.5-8S16.5 4 12 4zm0 14.5c-2 0-3.8-1.3-5-3.3 1.2-2 3-3.3 5-3.3s3.8 1.3 5 3.3c-1.2 2-3 3.3-5 3.3zm0-8.5c-2 0-3.8-1.3-5-3.3C8.2 5.2 10 4 12 4s3.8 1.2 5 3.2c-1.2 2-3 3.3-5 3.3z',
  },
  {
    id: 'django', label: 'Django', abbr: 'DJG', category: 'BACKEND_STREAMS',
    x: 65, y: 20, z: 300, stat: 'LATENCY_REDUCTION', statVal: '−25ms avg',
    color: '#44B78B',
    svgPath: 'M11.5 2h1v13.5c-3.5.5-4.5-2.5-4.5-2.5s1 1 3.5.5V2zm3 2.5h1V17c0 3.5-3 4.5-5 4.5-2 0-3-.5-3-.5l.5-1s.7.5 2.5.5c1.8 0 4-1 4-3.5V4.5z',
  },
  {
    id: 'flask', label: 'Flask', abbr: 'FLK', category: 'BACKEND_STREAMS',
    x: 78, y: 38, z: 240, stat: 'API_LATENCY', statVal: '8ms p99',
    color: '#E8E8E8',
    svgPath: 'M9 3v8.5L4.5 18.5c-.5 1 .2 2 1.5 2h12c1.3 0 2-1 1.5-2L15 11.5V3H9zm1.5 1.5h3V11l3.8 6H7.2l3.8-6V4.5z',
  },
  {
    id: 'go', label: 'Go', abbr: 'GOL', category: 'BACKEND_STREAMS',
    x: 55, y: 55, z: 360, stat: 'THROUGHPUT', statVal: '12k req / s',
    color: '#00ACD7',
    svgPath: 'M3.5 13.5c-.5 0-.8-.3-.5-.8l1-2.2c.2-.4.6-.5 1-.5h12c.4 0 .7.3.5.7l-1 2.2c-.2.4-.6.6-1 .6H3.5zM5 8.5c-.2-.4 0-.8.5-.8h11c.4 0 .9.3 1 .8l.5 2.2H5.5L5 8.5zM15 17c.5.8-.1 1.5-1 1.5H3c-.9 0-1.4-.7-1-1.5l1-2h13l-1 2z',
  },
  {
    id: 'node', label: 'Node.js', abbr: 'NOD', category: 'BACKEND_STREAMS',
    x: 30, y: 48, z: 200, stat: 'EVENT_LOOP', statVal: '0.1ms tick',
    color: '#539E43',
    svgPath: 'M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3L19 8l-7 3.8L5 8l7-3.7zM4.5 9.2l7 3.8v7.5L4.5 16.8V9.2zm8.5 11.3v-7.5l7-3.8v7.6l-7 3.7z',
  },
  {
    id: 'postgres', label: 'PostgreSQL', abbr: 'PGS', category: 'DATA_VAULTS',
    x: 18, y: 65, z: 160, stat: 'DB_OPTIMIZATION', statVal: '+30% queries',
    color: '#336791',
    svgPath: 'M17.5 7.5c0-2.8-2.5-5-5.5-5S6.5 4.7 6.5 7.5c0 1.5.7 2.9 1.7 3.8L7 18.5h1.5l.5-3h6l.5 3H17l-1.2-7.2c1-.9 1.7-2.3 1.7-3.8zm-5.5-3c2 0 3.5 1.3 3.5 3s-1.5 3-3.5 3S8.5 9 8.5 7.5s1.5-3 3.5-3z',
  },
  {
    id: 'mysql', label: 'MySQL / SQLite', abbr: 'SQL', category: 'DATA_VAULTS',
    x: 35, y: 75, z: 120, stat: 'QUERY_CACHE', statVal: '98.5% hit',
    color: '#4479A1',
    svgPath: 'M12 3C7 3 3 4.5 3 6.5v11C3 19.5 7 21 12 21s9-1.5 9-3.5v-11C21 4.5 17 3 12 3zm0 2c4.4 0 7 1.3 7 1.5S16.4 8 12 8 5 6.7 5 6.5 7.6 5 12 5zm7 12.5c0 .2-2.6 1.5-7 1.5s-7-1.3-7-1.5V15c1.7.9 4.2 1.5 7 1.5s5.3-.6 7-1.5v2.5zm0-5c0 .2-2.6 1.5-7 1.5s-7-1.3-7-1.5V10c1.7.9 4.2 1.5 7 1.5s5.3-.6 7-1.5v2.5z',
  },
  {
    id: 'aws', label: 'AWS', abbr: 'AWS', category: 'CLOUD_STATIONS',
    x: 60, y: 72, z: 280, stat: 'DEPLOY_EFFICIENCY', statVal: '+40% uptime',
    color: '#FF9900',
    svgPath: 'M6.5 14.5c-1.1-.5-2-1.4-2-2.5C4.5 10 6.5 9 9 9c.6 0 1.1.1 1.6.2.4-2.1 2.3-3.7 4.4-3.7 2.5 0 4.5 2 4.5 4.5 0 .3 0 .5-.1.8.6.4 1.1 1 1.1 1.7 0 1.1-.9 2-2 2H7c-.2 0-.3 0-.5-.1zm3.5 2l-2.5 2.5h10L15 16.5H10zm-1 2.5h6',
  },
  {
    id: 'azure', label: 'Azure', abbr: 'AZR', category: 'CLOUD_STATIONS',
    x: 75, y: 62, z: 220, stat: 'FAILOVER_RTO', statVal: '<2min SLA',
    color: '#0078D4',
    svgPath: 'M13.5 3L8 13.5 4.5 7.5 2 18h7.5l-1.7-3L13.5 3zm1 0L22 18H14l-3-5 3.5-10z',
  },
  {
    id: 'docker', label: 'Docker', abbr: 'DCK', category: 'CLOUD_STATIONS',
    x: 50, y: 35, z: 320, stat: 'CONTAINER_BOOT', statVal: '340ms cold',
    color: '#2496ED',
    svgPath: 'M14.5 9h2v2h-2V9zm-3 0h2v2h-2V9zm-3 0h2v2H8.5V9zm-3 0h2v2h-2V9zm9-3h2v2h-2V6zm-3 0h2v2h-2V6zm-3 0h2v2H8.5V6zm9 6c.1 1-.5 2-1.5 2.5-1 .6-3.5.5-4.5.5H4c-1-.5-2-2-1.5-3.5H21z',
  },
];

const CATEGORY_META: Record<string, { short: string; color: string }> = {
  CORE_INFRASTRUCTURE: { short: 'CORE_INFRA', color: '#00FF9C' },
  BACKEND_STREAMS:     { short: 'BACKEND',    color: '#FF9900' },
  DATA_VAULTS:         { short: 'DATA_VAULT', color: '#4479A1' },
  CLOUD_STATIONS:      { short: 'CLOUD_STA',  color: '#0078D4' },
};

// ─── useMousePosition (rAF-throttled, 60fps) ──────────────────────────────────
function useMousePosition(containerRef: React.RefObject<HTMLElement | null>) {
  const pending = useRef(false);
  const latest  = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      latest.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (!pending.current) {
        pending.current = true;
        requestAnimationFrame(() => {
          setPos({ ...latest.current });
          pending.current = false;
        });
      }
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [containerRef]);

  return pos;
}

// ─── GlitchLabel ──────────────────────────────────────────────────────────────
const GLITCH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@%&';
function GlitchLabel({ text, triggered }: { text: string; triggered: boolean }) {
  const [display, setDisplay] = useState(text);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!triggered) return;
    cancelAnimationFrame(raf.current);
    let frame = 0;
    const chars = text.split('');
    const tick = () => {
      frame++;
      const thr = frame * 0.5;
      setDisplay(chars.map((c, i) => {
        if (c === ' ' || c === '_') return c;
        if (i < thr) return c;
        return GLITCH[Math.floor(Math.random() * GLITCH.length)];
      }).join(''));
      if (thr < chars.length) raf.current = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [triggered, text]);
  return <span>{display}</span>;
}

// ─── ScanReadout ──────────────────────────────────────────────────────────────
function ScanReadout({
  label, stat, statVal, color, visible,
}: { label: string; stat: string; statVal: string; color: string; visible: boolean }) {
  const [pct,  setPct]  = useState(0);
  const [done, setDone] = useState(false);
  const tw = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    tw.current?.kill();
    if (!visible) { setPct(0); setDone(false); return; }
    const proxy = { val: 0 };
    tw.current = gsap.to(proxy, {
      val: 100, duration: 0.55, ease: 'power2.inOut',
      onUpdate() { setPct(Math.round(proxy.val)); },
      onComplete() { setDone(true); },
    });
    return () => { tw.current?.kill(); };
  }, [visible]);

  return (
    <div style={{
      background: 'rgba(8,8,8,0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `0.5px solid ${color}50`,
      padding: '9px 13px',
      minWidth: 164,
      boxShadow: `0 0 22px ${color}18, inset 0 0 24px rgba(0,0,0,0.5)`,
    }}>
      {/* Icon name */}
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 8, letterSpacing: '0.2em', color, fontWeight: 900, marginBottom: 7 }}>
        {label}
      </div>
      {/* Scan progress bar */}
      <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 6, position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(to right, ${color}99, ${color})`,
          boxShadow: `0 0 5px ${color}`,
        }} />
      </div>
      {/* Stat or scanning state */}
      {done ? (
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 6, letterSpacing: '0.18em', color: 'rgba(249,255,246,0.35)', marginBottom: 3 }}>
            {stat}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.08em', color: 'rgba(249,255,246,0.9)', fontWeight: 700 }}>
            {statVal}
          </div>
        </div>
      ) : (
        <div style={{ fontFamily: FONT_MONO, fontSize: 6, letterSpacing: '0.18em', color: 'rgba(249,255,246,0.22)' }}>
          SCANNING... {pct}%
        </div>
      )}
    </div>
  );
}

// ─── CoreRings — multi-ring SVG that reacts to scroll velocity ────────────────
function CoreRings({ isEntered, isMobile }: { isEntered: boolean; isMobile: boolean }) {
  const r1 = useRef<SVGGElement>(null);
  const r2 = useRef<SVGGElement>(null);
  const r3 = useRef<SVGGElement>(null);
  const t1 = useRef<gsap.core.Tween | null>(null);
  const t2 = useRef<gsap.core.Tween | null>(null);
  const t3 = useRef<gsap.core.Tween | null>(null);
  const recovery = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isEntered) return;
    t1.current = gsap.to(r1.current, { rotation: 360,  duration: 14, repeat: -1, ease: 'none', transformOrigin: '40px 40px' });
    t2.current = gsap.to(r2.current, { rotation: -360, duration: 9,  repeat: -1, ease: 'none', transformOrigin: '40px 40px' });
    t3.current = gsap.to(r3.current, { rotation: 360,  duration: 22, repeat: -1, ease: 'none', transformOrigin: '40px 40px' });

    let velTrigger: ReturnType<typeof ScrollTrigger.create> | null = null;
    if (!isMobile) {
      velTrigger = ScrollTrigger.create({
        onUpdate(self) {
          const vel = Math.abs(self.getVelocity());
          if (vel > 150) {
            const boost = Math.min(1 + vel / 1200, 7);
            t1.current?.timeScale(boost);
            t2.current?.timeScale(boost);
            t3.current?.timeScale(boost);
            if (recovery.current) clearTimeout(recovery.current);
            recovery.current = setTimeout(() => {
              t1.current?.timeScale(1);
              t2.current?.timeScale(1);
              t3.current?.timeScale(1);
            }, 450);
          }
        },
      });
    }

    return () => {
      t1.current?.kill(); t2.current?.kill(); t3.current?.kill();
      velTrigger?.kill();
      if (recovery.current) clearTimeout(recovery.current);
    };
  }, [isEntered, isMobile]);

  const C = 40;
  return (
    <svg width={80} height={80} viewBox="0 0 80 80" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00FF9C" stopOpacity={1} />
          <stop offset="55%"  stopColor="#00FF9C" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#00FF9C" stopOpacity={0} />
        </radialGradient>
        <filter id="bloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer glow halo */}
      <circle cx={C} cy={C} r={38} fill="none" stroke="rgba(0,255,156,0.05)" strokeWidth={14} />

      {/* Ring 1 — outer, dashed, clockwise */}
      <g ref={r1}>
        <circle cx={C} cy={C} r={34} fill="none" stroke="rgba(0,255,156,0.28)" strokeWidth={0.8} strokeDasharray="5 10" />
        <circle cx={C + 34} cy={C} r={2.5} fill="#00FF9C" filter="url(#bloom)" opacity={0.9} />
        <circle cx={C - 34} cy={C} r={1.5} fill="#AE0C00"   opacity={0.6} />
      </g>

      {/* Ring 2 — mid, anti-clockwise */}
      <g ref={r2}>
        <circle cx={C} cy={C} r={25} fill="none" stroke="rgba(0,255,156,0.18)" strokeWidth={0.6} strokeDasharray="2 14" />
        <circle cx={C}      cy={C - 25} r={2}   fill="#FF5A1F" opacity={0.75} />
        <circle cx={C}      cy={C + 25} r={2}   fill="#FF5A1F" opacity={0.75} />
      </g>

      {/* Ring 3 — inner, slow */}
      <g ref={r3}>
        <circle cx={C} cy={C} r={15} fill="none" stroke="rgba(174,12,0,0.3)" strokeWidth={0.8} strokeDasharray="3 5" />
        <circle cx={C + 15} cy={C} r={1.5} fill="#AE0C00" opacity={0.65} />
        <circle cx={C - 15} cy={C} r={1.5} fill="#AE0C00" opacity={0.65} />
      </g>

      {/* Core orb */}
      <circle cx={C} cy={C} r={11} fill="url(#cg)" filter="url(#bloom)" />
      <circle cx={C} cy={C} r={5}  fill="#00FF9C" opacity={0.95} />
    </svg>
  );
}

// ─── DataParticle — animated dot travelling along a filament ─────────────────
function DataParticle({
  x1, y1, x2, y2, speed, color, initDelay,
}: { x1: number; y1: number; x2: number; y2: number; speed: number; color: string; initDelay: number }) {
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tween = gsap.fromTo(
      el,
      { attr: { cx: x1, cy: y1 } },
      { attr: { cx: x2, cy: y2 }, duration: speed, repeat: -1, ease: 'none', delay: initDelay },
    );
    return () => { tween.kill(); };
  }, [x1, y1, x2, y2, speed, initDelay]);

  return (
    <circle
      ref={ref}
      r={1.2}
      fill={color}
      opacity={0.85}
      style={{ willChange: 'cx, cy' }}
    />
  );
}

// ─── FilamentLine — line + particle + chromatic on hover ─────────────────────
function FilamentLine({
  x1, y1, x2, y2, color, delay, isHovered, particleSpeed,
}: {
  x1: number; y1: number; x2: number; y2: number;
  color: string; delay: number; isHovered: boolean; particleSpeed: number;
}) {
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;

    gsap.to(el, { strokeDashoffset: 0, duration: 1.1, delay, ease: 'power2.inOut' });
    gsap.to(el, {
      opacity: 0.18, duration: 2, delay: delay + 1.1,
      yoyo: true, repeat: -1, ease: 'sine.inOut',
    });
  }, [x1, y1, x2, y2, delay]);

  // Chromatic shift on hover via inline filter style
  const chromaFilter = isHovered
    ? `drop-shadow(-1.5px 0 rgba(255,0,100,0.55)) drop-shadow(1.5px 0 rgba(0,200,255,0.55))`
    : 'none';

  return (
    <g style={{ filter: isHovered ? chromaFilter : 'none', transition: 'filter 0.2s ease' }}>
      <line
        ref={lineRef}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={isHovered ? color : `${color}88`}
        strokeWidth={isHovered ? 1 : 0.5}
        style={{ willChange: 'stroke-dashoffset, opacity', transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
      />
      <DataParticle
        x1={x1} y1={y1} x2={x2} y2={y2}
        speed={particleSpeed}
        color={isHovered ? color : `${color}cc`}
        initDelay={delay + 1.1 + Math.random() * particleSpeed}
      />
    </g>
  );
}

// ─── TechNode (forwardRef) ────────────────────────────────────────────────────
interface TechNodeProps {
  tech:      TechIcon;
  mousePos:  { x: number; y: number };
  stageW:    number;
  stageH:    number;
  isEntered: boolean;
  index:     number;
  isHovered:  boolean;
  onHoverChange: (id: string | null) => void;
}

const TechNode = React.forwardRef<HTMLDivElement, TechNodeProps>(
  function TechNode({ tech, mousePos, stageW, stageH, isEntered, index, isHovered, onHoverChange }, ref) {
    const [labelTriggered, setLabelTriggered] = useState(false);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 260, damping: 26 });
    const sy = useSpring(my, { stiffness: 260, damping: 26 });
    // Node's resting center in stage coordinate space
    const nodeX = (tech.x / 100) * stageW;
    const nodeY = (tech.y / 100) * stageH;
    const depthScale = 0.62 + (tech.z / 400) * 0.58;

    // Magnetic pull when hovered
    useEffect(() => {
      if (!isHovered) { mx.set(0); my.set(0); return; }
      const dx   = mousePos.x - nodeX;
      const dy   = mousePos.y - nodeY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200 && dist > 0) {
        const pull = (1 - dist / 200) * 22;
        mx.set((dx / dist) * pull);
        my.set((dy / dist) * pull);
      } else {
        mx.set(0); my.set(0);
      }
    }, [mousePos, isHovered, nodeX, nodeY, mx, my]);

    useEffect(() => {
      if (!isEntered) return;
      const tid = setTimeout(() => setLabelTriggered(true), 280 + index * 75);
      return () => clearTimeout(tid);
    }, [isEntered, index]);


    const cat = CATEGORY_META[tech.category];

    return (
      <motion.div
        ref={ref}
        style={{
          position: 'absolute',
          left: nodeX,
          top: nodeY,
          x: sx,
          y: sy,
          translateX: '-50%',
          translateY: '-50%',
          zIndex: Math.round(tech.z / 10),
          willChange: 'transform',
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={isEntered ? { opacity: 1, scale: depthScale } : { opacity: 0, scale: 0.3 }}
        transition={{ duration: 0.7, delay: 0.04 * index, ease: EASE }}
        onHoverStart={() => onHoverChange(tech.id)}
        onHoverEnd={()  => onHoverChange(null)}
      >
        {/* Hex */}
        <motion.div
          animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
          transition={{ duration: 0.2, ease: EASE }}
          style={{
            width: 52, height: 52,
            position: 'relative', cursor: 'crosshair',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backfaceVisibility: 'hidden',
          }}
        >
          <svg width={52} height={52} viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0 }}>
            {isHovered && (
              <defs>
                <filter id={`chr-${tech.id}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feOffset in="SourceGraphic" dx="-2" dy="0" result="r" />
                  <feOffset in="SourceGraphic" dx="2"  dy="0" result="b" />
                  <feBlend in="r" in2="b" mode="screen" result="rb" />
                  <feBlend in="rb" in2="SourceGraphic" mode="normal" />
                </filter>
              </defs>
            )}
            <polygon
              points="26,2 48,14 48,38 26,50 4,38 4,14"
              fill="rgba(8,8,8,0.88)"
              stroke={isHovered ? tech.color : 'rgba(0,255,156,0.2)'}
              strokeWidth={isHovered ? 1.5 : 0.7}
              filter={isHovered ? `url(#chr-${tech.id})` : undefined}
              style={{ transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
            />
            {isHovered && (
              <polygon
                points="26,2 48,14 48,38 26,50 4,38 4,14"
                fill="none" stroke={tech.color} strokeWidth={0.5}
                strokeOpacity={0.25} strokeDasharray="3 5"
              />
            )}
          </svg>

          {/* Icon SVG */}
          <svg
            width={22} height={22} viewBox="0 0 24 24"
            style={{
              position: 'relative', zIndex: 1,
              filter: isHovered
                ? `drop-shadow(0 0 6px ${tech.color}) drop-shadow(-2px 0 rgba(255,0,100,0.5)) drop-shadow(2px 0 rgba(0,200,255,0.5))`
                : `drop-shadow(0 0 4px ${tech.color}44)`,
              transition: 'filter 0.2s ease',
            }}
          >
            <path d={tech.svgPath} fill={tech.color} />
          </svg>

          {/* Z-depth indicator dot */}
          <div style={{
            position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
            width: 4, height: 4, borderRadius: '50%',
            background: tech.color, boxShadow: `0 0 6px ${tech.color}`, opacity: 0.7,
          }} />
        </motion.div>

        {/* Abbreviation */}
        <div style={{
          textAlign: 'center', marginTop: 7,
          fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.2em',
          color: 'rgba(249,255,246,0.55)', fontWeight: 700,
          whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
        }}>
          <GlitchLabel text={tech.abbr} triggered={labelTriggered} />
        </div>

        {/* Category beam label */}
        <div style={{
          textAlign: 'center', marginTop: 2,
          fontFamily: FONT_DISPLAY, fontSize: 5, letterSpacing: '0.18em',
          color: cat.color, fontWeight: 900, opacity: 0.6,
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          [{cat.short}]
        </div>

        {/* Scan tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.14 }}
              style={{
                position: 'absolute',
                top: tech.y < 30 ? 62 : -82,
                left: tech.x > 65 ? 'auto' : tech.x < 20 ? '0' : '50%',
                right: tech.x > 65 ? 0 : 'auto',
                transform: tech.x > 65 ? 'none' : tech.x < 20 ? 'none' : 'translateX(-50%)',
                pointerEvents: 'none', zIndex: 100,
              }}
            >
              <ScanReadout
                label={tech.label} stat={tech.stat} statVal={tech.statVal}
                color={tech.color} visible={isHovered}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

// ─── TechInfrastructure ───────────────────────────────────────────────────────
export function TechInfrastructure() {
  const sectionRef  = useRef<HTMLElement>(null);
  const stageRef    = useRef<HTMLDivElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);
  const svgRef      = useRef<SVGSVGElement>(null);
  const scanRef     = useRef<HTMLDivElement>(null);
  const mobileGridRef = useRef<HTMLDivElement>(null);
  const [isEntered,  setIsEntered]  = useState(false);
  const [stageSize,  setStageSize]  = useState({ w: 900, h: 560 });
  const [hoveredId,  setHoveredId]  = useState<string | null>(null);

  const isMobile = useIsMobile();

  // rAF-throttled mouse position — desktop only (no pointer on touch)
  const mouse = useMousePosition(isMobile ? { current: null } as React.RefObject<HTMLElement | null> : stageRef as React.RefObject<HTMLElement | null>);

  // Mouse parallax springs for 3D grid
  const paraX = useMotionValue(0);
  const paraY = useMotionValue(0);
  const spX   = useSpring(paraX, { stiffness: 38, damping: 18 });
  const spY   = useSpring(paraY, { stiffness: 38, damping: 18 });

  // Refs for each TechNode — used in useLayoutEffect for precise filament coords
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Measured center coords per node in stage-space (fallback: calculated)
  const [nodeCoords, setNodeCoords] = useState<Record<string, { x: number; y: number }>>({});

  const coreX = stageSize.w * 0.5;
  const coreY = stageSize.h * 0.52;

  // ── Scroll-based parallax for mobile background grid ─────────────────────
  const { scrollYProgress: mobileScrollProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const mobileBgY = useTransform(mobileScrollProgress, [0, 1], ['0%', '-25%']);

  // ── Measure stage ──────────────────────────────────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (stageRef.current) {
        const r = stageRef.current.getBoundingClientRect();
        setStageSize({ w: r.width, h: r.height });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // ── ScrollTrigger entrance ─────────────────────────────────────────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const t = ScrollTrigger.create({
      trigger: el, start: 'top 68%',
      onEnter:     () => setIsEntered(true),
      onLeaveBack: () => setIsEntered(false),
    });
    return () => t.kill();
  }, []);

  // ── useLayoutEffect: measure each node center relative to SVG coordinate space.
  //    Both TechNodes and the filament SVG live inside the same gridRef div,
  //    so their coordinate origins are identical — we use this for mathematical
  //    precision and to account for any future layout changes.
  useLayoutEffect(() => {
    if (!isEntered || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const coords: Record<string, { x: number; y: number }> = {};
    for (const [id, el] of Object.entries(nodeRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      coords[id] = {
        x: r.left + r.width  / 2 - svgRect.left,
        y: r.top  + r.height / 2 - svgRect.top,
      };
    }
    setNodeCoords(coords);
  }, [isEntered, stageSize]);

  // ── Mouse → parallax values — desktop only ────────────────────────────────
  useEffect(() => {
    if (isMobile || !stageRef.current) return;
    const nx = (mouse.x / stageSize.w - 0.5) * 2;
    const ny = (mouse.y / stageSize.h - 0.5) * 2;
    paraX.set(nx * 16);
    paraY.set(ny * 9);
  }, [mouse, stageSize, paraX, paraY, isMobile]);

  // ── GSAP slow-float tilt on the grid — desktop only ───────────────────────
  useEffect(() => {
    const g = gridRef.current;
    if (!g || isMobile) return;
    const t = gsap.to(g, {
      rotateX: '+=2', rotateY: '-=1.2',
      duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut',
    });
    return () => { t.kill(); };
  }, [isMobile]);

  // ── CRT scanline scroll — desktop only ────────────────────────────────────
  useEffect(() => {
    const el = scanRef.current;
    if (!el || isMobile) return;
    const t = gsap.to(el, { backgroundPositionY: '+=120px', duration: 4, repeat: -1, ease: 'none' });
    return () => { t.kill(); };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative', width: '100%',
        background: '#050505', overflow: 'hidden',
        paddingTop: 'clamp(64px, 10vw, 120px)',
        paddingBottom: 'clamp(64px, 10vw, 120px)',
      }}
    >
      <AuditProgressBar sectionRef={sectionRef} totalCards={11} />
      {/* CRT scanlines */}
      <div
        ref={scanRef}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          backgroundSize: '100% 4px',
        }}
      />
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.72) 100%)',
      }} />

      {/* ── Section header ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative', zIndex: 10,
          paddingLeft: 'clamp(24px,6vw,96px)', paddingRight: 'clamp(24px,6vw,96px)',
          paddingTop: 'clamp(14px,2vw,24px)', paddingBottom: 'clamp(14px,2vw,24px)',
          marginBottom: 64,
        }}
      >
        <div style={{ fontFamily: FONT_MONO, fontSize: 'clamp(8px, 1.2vw, 10px)', letterSpacing: '0.22em', color: '#00FF9C', fontWeight: 700, marginBottom: 12, opacity: 0.65, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          SYSTEM_BLUEPRINT // STACK_OVERVIEW
        </div>
        <h2 style={{
          fontFamily: FONT_DISPLAY, fontSize: 'clamp(26px,5vw,64px)',
          fontWeight: 900, color: '#F9FFF6', letterSpacing: '-0.02em', lineHeight: 1, margin: 0,
        }}>
          TECH
          <span style={{ color: '#FF5A1F' }}> INFRASTRUCTURE</span>
        </h2>
        <div style={{ fontFamily: FONT_MONO, fontSize: 'clamp(7px, 1.2vw, 10px)', letterSpacing: 'clamp(0.1em, 0.5vw, 0.22em)', color: 'rgba(249,255,246,0.25)', marginTop: 14, fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          NODE_COUNT: {String(TECH_ICONS.length).padStart(2, '0')} // CATEGORIES: 04 // CORE: CYBERSAGE_ENGINE
        </div>
      </div>

      {/* ── 3D Stage (desktop) ──────────────────────────────────────────────── */}
      <div
        className="hidden md:block"
        style={{
          position: 'relative', zIndex: 5,
          paddingLeft: 'clamp(24px,6vw,96px)', paddingRight: 'clamp(24px,6vw,96px)',
        }}
      >
        <motion.div
          ref={stageRef}
          style={{
            position: 'relative', width: '100%',
            height: 'clamp(460px, 46vw, 680px)',
            perspective: 1200, cursor: 'crosshair',
          }}
          onMouseLeave={() => { paraX.set(0); paraY.set(0); }}
        >
          {/* 3D grid plane */}
          <motion.div
            ref={gridRef}
            style={{
              position: 'absolute', inset: 0,
              x: spX, y: spY,
              transformOrigin: '50% 58%',
              transform: 'rotateX(20deg) rotateY(-4deg)',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
          >
            {/* Grid lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.1 }}>
              {Array.from({ length: 15 }, (_, i) => (
                <line key={`v${i}`} x1={`${(i / 14) * 100}%`} y1="0" x2={`${(i / 14) * 100}%`} y2="100%" stroke="#00FF9C" strokeWidth={0.5} />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={`${(i / 9) * 100}%`} x2="100%" y2={`${(i / 9) * 100}%`} stroke="#00FF9C" strokeWidth={0.5} />
              ))}
            </svg>

            {/* Filament SVG layer — all filaments share one SVG for performance */}
            {isEntered && (
              <svg
                ref={svgRef}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
              >
                {TECH_ICONS.map((tech, i) => {
                  // Prefer DOM-measured coords for precision; fall back to calculated
                  const np = nodeCoords[tech.id] ?? {
                    x: (tech.x / 100) * stageSize.w,
                    y: (tech.y / 100) * stageSize.h,
                  };
                  const cat         = CATEGORY_META[tech.category];
                  const particleSpd = 1.8 - (tech.z / 400) * 0.9; // closer = faster
                  return (
                    <FilamentLine
                      key={tech.id}
                      x1={np.x}   y1={np.y}
                      x2={coreX}  y2={coreY}
                      color={cat.color}
                      delay={0.25 + i * 0.065}
                      isHovered={hoveredId === tech.id}
                      particleSpeed={particleSpd}
                    />
                  );
                })}
              </svg>
            )}

            {/* Cybersage Core */}
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={isEntered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
              style={{
                position: 'absolute', left: coreX, top: coreY,
                translateX: '-50%', translateY: '-50%',
                zIndex: 22, display: 'flex', flexDirection: 'column', alignItems: 'center',
                willChange: 'transform',
              }}
            >
              <CoreRings isEntered={isEntered} isMobile={isMobile} />
              <div style={{ marginTop: 6, fontFamily: FONT_DISPLAY, fontSize: 7, letterSpacing: '0.2em', color: '#00FF9C', fontWeight: 900, whiteSpace: 'nowrap', textShadow: '0 0 10px rgba(0,255,156,0.5)' }}>
                CYBERSAGE_CORE
              </div>
              <div style={{ marginTop: 2, fontFamily: FONT_MONO, fontSize: 5.5, letterSpacing: '0.16em', color: 'rgba(255,90,31,0.6)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                SYS: ONLINE // NODES: {TECH_ICONS.length}
              </div>
            </motion.div>

            {/* Tech nodes */}
            {TECH_ICONS.map((tech, i) => (
              <TechNode
                key={tech.id}
                ref={(el) => { nodeRefs.current[tech.id] = el; }}
                tech={tech}
                mousePos={mouse}
                stageW={stageSize.w}
                stageH={stageSize.h}
                isEntered={isEntered}
                index={i}
                isHovered={hoveredId === tech.id}
                onHoverChange={(id) => setHoveredId(id)}
              />
            ))}
          </motion.div>

          {/* Category legend — bottom-left */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={isEntered ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.5, delay: 0.9, ease: EASE }}
            style={{ position: 'absolute', bottom: 20, left: 0, display: 'flex', flexDirection: 'column', gap: 5, pointerEvents: 'none' }}
          >
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 18, height: 1, background: meta.color, opacity: 0.65 }} />
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 5.5, letterSpacing: '0.22em', color: meta.color, fontWeight: 900, opacity: 0.65 }}>
                  {key}
                </span>
              </div>
            ))}
          </motion.div>

          {/* HUD — top right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isEntered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.1, ease: EASE }}
            style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none', textAlign: 'right' }}
          >
            <div style={{ fontFamily: FONT_MONO, fontSize: 6, letterSpacing: '0.2em', color: 'rgba(0,255,156,0.38)', fontWeight: 700, lineHeight: 1.85 }}>
              <div>PERSPECTIVE: 1200px</div>
              <div>RENDER: CSS_3D + GSAP</div>
              <div style={{ color: 'rgba(255,90,31,0.45)' }}>SEC: BLUEPRINT_MODE</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Mobile vertical Tower ────────────────────────────────────────────── */}
      <div
        className="md:hidden"
        style={{ position: 'relative', zIndex: 5, paddingLeft: 'clamp(20px,5vw,48px)', paddingRight: 'clamp(20px,5vw,48px)' }}
      >
        {/* Parallax background grid — moves slower than content for depth */}
        <motion.div
          ref={mobileGridRef}
          style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
            backgroundImage: `
              repeating-linear-gradient(90deg, rgba(0,255,156,0.04) 0px, rgba(0,255,156,0.04) 1px, transparent 1px, transparent 48px),
              repeating-linear-gradient(0deg, rgba(0,255,156,0.04) 0px, rgba(0,255,156,0.04) 1px, transparent 1px, transparent 48px)
            `,
            y: mobileBgY,
            willChange: 'transform',
          }}
        />

        {/* Tower spine */}
        <div style={{
          position: 'absolute',
          left: 'calc(clamp(20px,5vw,48px) + clamp(20px, 5.5vw, 27px))',
          top: 0, bottom: 0, width: 1,
          background: 'linear-gradient(to bottom, transparent, rgba(0,255,156,0.25) 15%, rgba(0,255,156,0.25) 85%, transparent)',
        }} />

        {(['CORE_INFRASTRUCTURE', 'BACKEND_STREAMS', 'DATA_VAULTS', 'CLOUD_STATIONS'] as const).map((cat, catIdx) => {
          const techs   = TECH_ICONS.filter(t => t.category === cat);
          const catMeta = CATEGORY_META[cat];
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, x: -14 }}
              animate={isEntered ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
              transition={{ duration: 0.5, delay: 0.12 * catIdx, ease: EASE }}
              style={{ marginBottom: 32, position: 'relative' }}
            >
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(6px, 2vw, 7px)', letterSpacing: 'clamp(0.08em, 0.5vw, 0.18em)', color: catMeta.color, fontWeight: 900, marginBottom: 14, paddingLeft: 'clamp(44px, 12vw, 56px)', opacity: 0.8, wordBreak: 'break-word' }}>
                [{cat}]
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingLeft: 'clamp(44px, 12vw, 56px)' }}>
                {techs.map(tech => (
                  <div key={tech.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 'clamp(44px, 12vw, 60px)', maxWidth: 72 }}>
                    <div style={{ position: 'relative', width: 44, height: 44 }}>
                      <svg width={44} height={44} viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0 }}>
                        <polygon points="26,2 48,14 48,38 26,50 4,38 4,14" fill="rgba(8,8,8,0.9)" stroke={catMeta.color} strokeWidth={0.7} strokeOpacity={0.4} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width={18} height={18} viewBox="0 0 24 24">
                          <path d={tech.svgPath} fill={tech.color} />
                        </svg>
                      </div>
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 6, letterSpacing: '0.16em', color: 'rgba(249,255,246,0.5)', fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {tech.abbr}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 5.5, letterSpacing: '0.12em', color: catMeta.color, fontWeight: 700, textAlign: 'center', opacity: 0.6, whiteSpace: 'nowrap' }}>
                      {tech.statVal}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Core bottom */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isEntered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 16 }}
        >
          <CoreRings isEntered={isEntered} isMobile={isMobile} />
          <div style={{ marginTop: 6, fontFamily: FONT_DISPLAY, fontSize: 7, letterSpacing: '0.2em', color: '#00FF9C', fontWeight: 900, textShadow: '0 0 6px rgba(0,255,156,0.4)' }}>
            CYBERSAGE_CORE
          </div>
        </motion.div>
      </div>

      {/* ── Bottom HUD strip ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isEntered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 1.2, ease: EASE }}
        style={{
          position: 'relative', zIndex: 10, marginTop: 48,
          paddingLeft: 'clamp(24px,6vw,96px)', paddingRight: 'clamp(24px,6vw,96px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          borderTop: '0.5px solid rgba(0,255,156,0.07)', paddingTop: 20,
        }}
      >
        <div style={{ fontFamily: FONT_MONO, fontSize: 'clamp(6px, 1.1vw, 7px)', letterSpacing: 'clamp(0.1em, 0.4vw, 0.2em)', color: 'rgba(249,255,246,0.18)', fontWeight: 700, whiteSpace: 'nowrap' }}>
          BLUEPRINT_MODE: ACTIVE // FILAMENTS: {TECH_ICONS.length}
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 'clamp(6px, 1.1vw, 7px)', letterSpacing: 'clamp(0.1em, 0.4vw, 0.2em)', color: 'rgba(255,90,31,0.38)', fontWeight: 700, whiteSpace: 'nowrap' }}>
          SYS_OPERATOR: ABAKWE.CARRINGTON
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 'clamp(6px, 1.1vw, 7px)', letterSpacing: 'clamp(0.1em, 0.4vw, 0.2em)', color: 'rgba(0,255,156,0.22)', fontWeight: 700, whiteSpace: 'nowrap' }}>
          ENGINE: CYBERSAGE_v2.0
        </div>
      </motion.div>
    </section>
  );
}
