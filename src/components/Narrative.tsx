'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuditProgressBar } from './AuditProgressBar';
import { useIsMobile } from '@/lib/useIsMobile';

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Data stream particles ────────────────────────────────────────────────────
function DataParticles({ velocityRef }: { velocityRef: React.RefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Particle = { x: number; y: number; speed: number; opacity: number; size: number };
    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      speed:   0.35 + Math.random() * 1.1,
      opacity: 0.03 + Math.random() * 0.07,
      size:    Math.random() > 0.72 ? 1.5 : 1,
    }));

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const boost = 1 + Math.abs(velocityRef.current) / 180;
      particles.forEach((p) => {
        p.x += p.speed * boost;
        if (p.x > canvas.width + 4) p.x = -4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,255,246,${Math.min(p.opacity * boost, 0.18)})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [velocityRef]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
  );
}

// ─── Panel data ───────────────────────────────────────────────────────────────
interface PanelData {
  sysId:     string;
  header:    string;
  body:      React.ReactNode;
  scanColor: string;
}

const PANELS: PanelData[] = [
  {
    sysId:     '001-ALPHA',
    header:    'ORIGIN // LAGOS_NG',
    scanColor: '#00FF9C',
    body: (
      <>
        5+ years building real systems for real clients.{' '}
        <span style={{ color: '#AE0C00' }}>Lagos</span>-based,{' '}
        deployed{' '}
        <span style={{ color: '#AE0C00' }}>worldwide</span>.
      </>
    ),
  },
  {
    sysId:     '002-BETA',
    header:    'STACK // CORE_ENGINE',
    scanColor: '#FF5A1F',
    body: (
      <>
        <span style={{ color: '#AE0C00' }}>Next.js, Django, Go, PostgreSQL</span>.{' '}
        I design APIs that hold up under load and microservices that don&apos;t become a liability.
      </>
    ),
  },
  {
    sysId:     '003-GAMMA',
    header:    'IMPACT // PROJECT_LIVE',
    scanColor: '#00FF9C',
    body: (
      <>
        Current work:{' '}
        <span style={{ color: '#AE0C00' }}>Autoboy</span>{' '}
        marketplace,{' '}
        <span style={{ color: '#AE0C00' }}>NextGen Robotics</span>,{' '}
        <span style={{ color: '#AE0C00' }}>Axflo Oil &amp; Gas</span>.
      </>
    ),
  },
];

// ─── Desktop panel positions (strict percentage-based triptych) ─────────────────
const DESKTOP_STYLES: React.CSSProperties[] = [
  { left: '5%',   top: '50%', transform: 'translateY(-50%)', width: '28vw', maxWidth: '22rem' },
  { left: '42%',  top: '50%', transform: 'translateY(-50%)', width: '28vw', maxWidth: '22rem' },
  { right: '5%',  left: 'auto', top: '50%', transform: 'translateY(-50%)', width: '28vw', maxWidth: '22rem' },
];

const MOBILE_STYLE: React.CSSProperties = {
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
};

// ─── Boot-up animation variants ───────────────────────────────────────────────
const panelVariants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.52,
      ease: EASE,
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.28, ease: 'easeIn' as const },
  },
};

const lineVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.36, ease: EASE },
  },
};

// ─── Single diagnostic panel ──────────────────────────────────────────────────
function DiagnosticPanel({
  panel,
  panelIndex,
  activeIndex,
  isDesktop,
}: {
  panel:       PanelData;
  panelIndex:  number;
  activeIndex: number;
  isDesktop:   boolean;
}) {
  // Desktop: cumulative — show once triggered, stay visible
  // Mobile:  sequential — show only the active panel
  const visible = isDesktop
    ? panelIndex <= activeIndex
    : panelIndex === activeIndex;

  const posStyle = isDesktop ? DESKTOP_STYLES[panelIndex] : MOBILE_STYLE;

  return (
    <div
      className={isDesktop ? '' : 'absolute inset-0 flex items-center justify-center px-6 z-30 pointer-events-none'}
      style={!isDesktop ? { top: '50%', transform: 'translateY(-50%)' } : undefined}
    >
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate={visible ? 'visible' : 'hidden'}
        exit="exit"
        className={isDesktop ? 'absolute z-30 pointer-events-none' : 'w-full max-w-sm'}
        style={isDesktop ? posStyle : undefined}
      >
      {/* Glassmorphism card */}
      <div
        className="relative p-3 sm:p-4 md:p-5"
        style={{
          background:          'rgba(26,26,26,0.78)',
          backdropFilter:      'blur(22px)',
          WebkitBackdropFilter:'blur(22px)',
          border:              '0.5px solid rgba(249,255,246,0.10)',
          boxShadow:           'inset 0 0 28px rgba(0,0,0,0.45), 0 10px 40px rgba(0,0,0,0.55)',
        }}
      >
        {/* Corner accents */}
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <div
            key={c}
            className={[
              'absolute w-2.5 h-2.5',
              c === 'tl' ? 'top-0 left-0 border-t border-l'    : '',
              c === 'tr' ? 'top-0 right-0 border-t border-r'   : '',
              c === 'bl' ? 'bottom-0 left-0 border-b border-l' : '',
              c === 'br' ? 'bottom-0 right-0 border-b border-r': '',
              'border-cybersage-cream/20',
            ].join(' ')}
            style={{ borderWidth: '0.5px' }}
          />
        ))}

        {/* Vertical scanning line */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${panel.scanColor} 30%, ${panel.scanColor} 70%, transparent 100%)`,
          }}
          animate={visible ? { opacity: [0.4, 1, 0.4] } : { opacity: 0 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* SYS ID badge */}
        <motion.div variants={lineVariants} className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <motion.span
            className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full shrink-0"
            style={{ background: panel.scanColor }}
            animate={visible ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.2 }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
          <span className="font-mono text-[5px] sm:text-[6px] tracking-[0.3em] sm:tracking-[0.4em] text-cybersage-cream/25 uppercase">
            {panel.sysId}
          </span>
        </motion.div>

        {/* Header */}
        <motion.div variants={lineVariants} className="mb-2 sm:mb-3">
          <span
            className="font-mono text-[6px] sm:text-[7px] md:text-[8px] tracking-[0.2em] sm:tracking-[0.25em] uppercase"
            style={{ color: panel.scanColor, opacity: 0.82 }}
          >
            {panel.header}
          </span>
        </motion.div>

        {/* Body */}
        <motion.p
          variants={lineVariants}
          className="font-mono text-[7px] sm:text-[8px] md:text-[9px] tracking-[0.08em] sm:tracking-[0.11em] text-cybersage-cream/55 leading-[1.75] sm:leading-[1.85] uppercase mb-3 sm:mb-4"
        >
          {panel.body}
        </motion.p>

        {/* Scanning progress bar */}
        <motion.div
          variants={lineVariants}
          className="relative h-px w-full overflow-hidden mt-3 sm:mt-4"
          style={{ background: 'rgba(249,255,246,0.08)' }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full w-1/2"
            style={{
              background: `linear-gradient(to right, transparent, ${panel.scanColor}, transparent)`,
            }}
            animate={visible ? { x: ['-100%', '200%'] } : { x: '-100%' }}
            transition={visible ? { duration: 2.0, ease: 'linear', repeat: Infinity } : {}}
          />
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={lineVariants}
          className="flex justify-between items-center mt-2 sm:mt-3 gap-2"
        >
          <span className="font-mono text-[5px] sm:text-[6px] tracking-[0.2em] sm:tracking-[0.28em] uppercase truncate" style={{ color: 'rgba(249,255,246,0.18)' }}>
            ABAKWE.CARRINGTON
          </span>
          <span
            className="font-mono text-[5px] sm:text-[6px] tracking-[0.15em] sm:tracking-[0.2em] uppercase shrink-0"
            style={{ color: panel.scanColor, opacity: 0.5 }}
          >
            ONLINE
          </span>
        </motion.div>
      </div>
      </motion.div>
    </div>
  );
}

// ─── Narrative — Warp Drive ───────────────────────────────────────────────────
export function Narrative() {
  const sectionRef  = useRef<HTMLElement>(null);
  const stageRef    = useRef<HTMLDivElement>(null);
  const layer1Ref   = useRef<HTMLDivElement>(null);
  const layer2Ref   = useRef<HTMLDivElement>(null);
  const layer3Ref   = useRef<HTMLDivElement>(null);
  const velocityRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(-1);
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;

  // ── Desktop: GSAP warp + velocity distortion ─────────────────────────────
  useEffect(() => {
    if (!isDesktop) return;
    const section = sectionRef.current;
    const stage   = stageRef.current;
    const layer1  = layer1Ref.current;
    const layer2  = layer2Ref.current;
    const layer3  = layer3Ref.current;
    if (!section || !stage || !layer1 || !layer2 || !layer3) return;

    const vw = window.innerWidth;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start:   'top top',
        end:     '+=310%',
        pin:     true,
        scrub:   1.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          if      (p >= 0.92) setActiveIndex(2);
          else if (p >= 0.82) setActiveIndex(1);
          else if (p >= 0.70) setActiveIndex(0);
          else                setActiveIndex(-1);
        },
      },
    });

    tl.fromTo(layer1,
      { z: -700, scale: 0.15, x:  vw * 0.40,  opacity: 0   },
      { z:  120, scale: 1.05, x: -vw * 0.45,  opacity: 0.9, ease: 'none' }, 0);
    tl.fromTo(layer2,
      { z: -500, scale: 0.25, x:  vw * 0.50,  opacity: 0   },
      { z:  180, scale: 1.15, x: -vw * 0.90,  opacity: 1,   ease: 'none' }, 0);
    tl.fromTo(layer3,
      { z: -300, scale: 0.35, x:  vw * 0.35,  opacity: 0   },
      { z:  260, scale: 1.30, x: -vw * 1.35,  opacity: 1,   ease: 'none' }, 0);

    const velTrigger = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     '+=310%',
      onUpdate: (self) => {
        const vel      = self.getVelocity();
        velocityRef.current = vel;
        const skew     = gsap.utils.clamp(-14, 14, vel / 88);
        const spacing  = gsap.utils.clamp(0, 0.09, Math.abs(vel) / 10500);
        const isFast   = Math.abs(vel) > 580;
        const aberrStr = gsap.utils.clamp(0, 0.7, Math.abs(vel) / 1400);
        const aberrPx  = gsap.utils.clamp(0, 9,   Math.abs(vel) / 130);

        gsap.to([layer1, layer2, layer3], {
          skewX: skew, letterSpacing: `${spacing}em`,
          ease: 'power3', duration: 0.4, overwrite: 'auto',
        });

        gsap.to([layer1, layer2, layer3], {
          filter: isFast
            ? `drop-shadow(${aberrPx}px 0 0 rgba(174,12,0,${aberrStr})) drop-shadow(-${aberrPx}px 0 0 rgba(0,255,156,${aberrStr * 0.6}))`
            : 'none',
          ease: 'power2', duration: 0.35, overwrite: 'auto',
        });

        const keywords = section.querySelectorAll<HTMLElement>('[data-kw]');
        gsap.to(keywords, {
          textShadow: isFast ? '0 0 20px rgba(0,255,156,0.5), 0 0 40px rgba(0,255,156,0.2)' : 'none',
          color:      isFast ? '#FF5A1F' : 'inherit',
          duration:   isFast ? 0.08 : 0.55, overwrite: 'auto',
        });
      },
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);
    return () => {
      tl.kill();
      velTrigger.kill();
      window.removeEventListener('resize', onResize);
    };
  }, [isDesktop]);

  // ── Mobile: auto-cycle panels when section is in viewport ────────────────
  useEffect(() => {
    if (!isMobile) return;
    const section = sectionRef.current;
    if (!section) return;

    let intervalId: ReturnType<typeof setInterval>;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveIndex(0);
          let idx = 0;
          intervalId = setInterval(() => {
            idx = (idx + 1) % PANELS.length;
            setActiveIndex(idx);
          }, 2800);
        } else {
          clearInterval(intervalId);
          setActiveIndex(-1);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-cybersage-charcoal"
    >
      <AuditProgressBar sectionRef={sectionRef} totalCards={0} />
      {!isMobile && <DataParticles velocityRef={velocityRef} />}

      <div className="absolute top-0 left-0 right-0 h-px z-20 bg-linear-to-r from-transparent via-white/8 to-transparent" />

      {/* 3D stage — desktop only */}
      <div
        ref={stageRef}
        className="absolute inset-0"
        style={isDesktop ? { perspective: '900px', perspectiveOrigin: '50% 50%' } : { display: 'none' }}
      >
        <div
          ref={layer1Ref}
          className="absolute top-[15%] left-0 whitespace-nowrap will-change-transform select-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <span
            className="font-black uppercase"
            style={{
              fontFamily:       '"Inter", system-ui, sans-serif',
              fontSize:         'clamp(4.5rem, 11vw, 13rem)',
              lineHeight:       1,
              WebkitTextStroke: '1px rgba(249,255,246,0.28)',
              color:            'transparent',
              letterSpacing:    '-0.04em',
            }}
          >
            SCALABLE&nbsp;ARCHITECTURE
          </span>
        </div>

        <div
          ref={layer2Ref}
          className="absolute top-[40%] left-0 whitespace-nowrap will-change-transform select-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <span
            className="font-black uppercase"
            style={{
              fontFamily:    '"Inter", system-ui, sans-serif',
              fontSize:      'clamp(2.2rem, 5.5vw, 6.5rem)',
              lineHeight:    1,
              color:         '#AE0C00',
              letterSpacing: '-0.04em',
            }}
          >
            <span data-kw>5+ YEARS</span>{' '}// FULL STACK
          </span>
        </div>

        <div
          ref={layer3Ref}
          className="absolute top-[63%] left-0 whitespace-nowrap will-change-transform select-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <span
            className="font-black uppercase"
            style={{
              fontFamily:    '"Inter", system-ui, sans-serif',
              fontSize:      'clamp(1.6rem, 3.8vw, 4.8rem)',
              lineHeight:    1,
              color:         '#F9FFF6',
              letterSpacing: '-0.04em',
            }}
          >
            <span data-kw>PERFORMANCE-FIRST</span>{' '}// PRESSURE-TESTED
          </span>
        </div>
      </div>

      {/* Triptych panels */}
      {PANELS.map((panel, i) => (
        <DiagnosticPanel
          key={panel.sysId}
          panel={panel}
          panelIndex={i}
          activeIndex={activeIndex}
          isDesktop={isDesktop}
        />
      ))}

      <div className="absolute bottom-0 left-0 right-0 h-px z-20 bg-linear-to-r from-transparent via-white/8 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_90%_90%_at_50%_50%,transparent_35%,#1A1A1A_100%)]" />
    </section>
  );
}
