'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wifi, Mouse, ArrowUpRight } from 'lucide-react';
import { AsciiCanvas } from './AsciiCanvas';
import { PortalMarquee } from './PortalMarquee';
import { useIsMobile } from '@/lib/useIsMobile';

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Glitch characters pool
const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

interface GlitchCharProps {
  char: string | React.ReactNode;
  index: number;
  isGlitching: boolean;
}

function GlitchChar({ char, index, isGlitching }: GlitchCharProps) {
  const [displayChar, setDisplayChar] = useState<string | React.ReactNode>(char);

  useEffect(() => {
    if (typeof char !== 'string') {
      setDisplayChar(char);
      return;
    }

    if (!isGlitching) {
      setDisplayChar(char);
      return;
    }

    const interval = setInterval(() => {
      setDisplayChar(GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]);
    }, 50);

    const timeout = setTimeout(() => {
      setDisplayChar(char);
      clearInterval(interval);
    }, 400 + index * 30);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isGlitching, char, index]);

  if (typeof displayChar !== 'string') {
    return <>{displayChar}</>;
  }

  return (
    <motion.span
      className="inline-block"
      initial={{ y: '110%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.9, delay: 0.15 + index * 0.04, ease: EASE }}
    >
      {displayChar}
    </motion.span>
  );
}

// HUD readout component
function HUDReadout() {
  const [activeIndex, setActiveIndex] = useState(0);

  const hudData = [
    { label: 'SYSTEM_LATENCY', value: '24ms' },
    { label: 'STACK', value: '[DJANGO, NEXT.JS, GO, POSTGRES]' },
    { label: 'STATUS', value: 'AVAILABLE' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % hudData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="font-mono text-[6px] sm:text-[7px] md:text-[8px] tracking-[0.15em] sm:tracking-[0.2em] text-cybersage-cream/20 uppercase space-y-0.5 sm:space-y-1 mb-6 sm:mb-8"
    >
      {hudData.map((item, idx) => (
        <motion.div
          key={idx}
          animate={{ opacity: activeIndex === idx ? 1 : 0.3 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-1.5 sm:gap-2"
        >
          <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-cybersage-emerald rounded-full shrink-0" />
          <span className="truncate">{item.label}:</span>
          <span className="text-cybersage-emerald/60 truncate">{item.value}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Bento scanning lines — static on mobile (no infinite animations)
function BentoLines({ mobile }: { mobile: boolean }) {
  if (mobile) {
    return (
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]">
        {[...Array(8)].map((_, i) => (
          <div key={`h-${i}`} className="absolute w-full h-px bg-cybersage-emerald" style={{ top: `${(i + 1) * 12.5}%` }} />
        ))}
        {[...Array(3)].map((_, i) => (
          <div key={`v-${i}`} className="absolute h-full w-px bg-cybersage-emerald" style={{ left: `${(i + 1) * 25}%` }} />
        ))}
      </div>
    );
  }
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
      {/* Horizontal lines */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`h-${i}`}
          className="absolute w-full h-px bg-cybersage-emerald"
          style={{ top: `${(i + 1) * 12.5}%` }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
      {/* Vertical lines */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute h-full w-px bg-cybersage-emerald"
          style={{ left: `${(i + 1) * 25}%` }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2.5, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// CTA with hex address
interface CTAButtonProps {
  href: string;
  label: string;
  hexAddr: string;
  isPrimary?: boolean;
}

function CTAButton({ href, label, hexAddr, isPrimary = false }: CTAButtonProps) {
  const [showHex, setShowHex] = useState(false);

  return (
    <motion.a
      href={href}
      onMouseEnter={() => setShowHex(true)}
      onMouseLeave={() => setShowHex(false)}
      whileHover={{ boxShadow: isPrimary ? '0 0 30px rgba(0,255,156,0.22)' : '0 0 20px rgba(0,255,156,0.10)' }}
      className={`group inline-flex items-center gap-1.5 sm:gap-2 border px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 font-mono text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] uppercase transition-all duration-300 ${
        isPrimary
          ? 'border-cybersage-emerald/40 text-cybersage-cream/50 hover:border-cybersage-emerald hover:text-cybersage-emerald'
          : 'border-white/10 text-cybersage-cream/30 transition-all duration-300 hover:border-cybersage-emerald/30 hover:text-cybersage-cream/55'
      }`}
      style={{ borderWidth: '0.5px' }}
    >
      <motion.span
        animate={{ opacity: showHex ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        {label}
      </motion.span>
      <motion.span
        animate={{ opacity: showHex ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inline-block text-cybersage-emerald/70"
      >
        {hexAddr}
      </motion.span>
      <ArrowUpRight
        size={8}
        className="sm:w-2.5 sm:h-2.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </motion.a>
  );
}

export function Hero() {
  const rightRef = useRef<HTMLDivElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isLeftPaneHovered, setIsLeftPaneHovered] = useState(false);
  const isMobile = useIsMobile();

  // Scroll parallax on the right pane — desktop only
  useEffect(() => {
    if (!rightRef.current || isMobile) return;
    gsap.to(rightRef.current, {
      yPercent: -4,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom top',
        scrub: 2,
      },
    });
  }, [isMobile]);

  // Glitch trigger on left pane hover
  useEffect(() => {
    const pane = leftPaneRef.current;
    if (!pane) return;

    const handleMouseEnter = () => { setIsGlitching(true); setIsLeftPaneHovered(true); };
    const handleMouseLeave = () => setIsLeftPaneHovered(false);
    pane.addEventListener('mouseenter', handleMouseEnter);
    pane.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      pane.removeEventListener('mouseenter', handleMouseEnter);
      pane.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const nameFirst = 'ABAKWE';
  const nameSecond = 'CARRINGTON';

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-cybersage-charcoal flex flex-col"
      style={{ border: '0.5px solid rgba(0,255,156,0.35)', boxShadow: '0 0 40px rgba(0,255,156,0.06), inset 0 0 60px rgba(0,0,0,0.5)' }}
    >

      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative z-30 flex items-center justify-between px-6 sm:px-8 md:px-12 lg:px-14 py-3 sm:py-4 lg:py-5 border-b border-white/4"
      >
        <span className="font-mono text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] lg:tracking-[0.45em] text-cybersage-cream/20 uppercase select-none">
          Cybersage
        </span>

        <div className="flex items-center gap-1 sm:gap-2">
          <Wifi size={8} className="sm:w-2.5 sm:h-2.5 text-cybersage-emerald animate-pulse" strokeWidth={2} />
          <span className="font-mono text-[7px] sm:text-[9px] md:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.35em] text-cybersage-emerald uppercase">
            Available for Work
          </span>
        </div>
      </motion.header>

      {/* Split layout */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* Left pane — 42% on desktop, full width on mobile — with bento lines */}
        <div
          ref={leftPaneRef}
          className="relative z-20 flex w-full lg:w-[42%] flex-col px-6 sm:px-8 md:px-12 lg:px-14 py-12 lg:py-0 pb-0 lg:pb-0 gap-6 sm:gap-7 lg:gap-9 overflow-hidden"
        >
          <BentoLines mobile={isMobile} />

          {/* Main content section — pushed up */}
          <div className="flex flex-col gap-6 sm:gap-7 lg:gap-9 flex-1 justify-end">
            {/* HUD Readout */}
            <HUDReadout />

            {/* H1 with glitch reveal and break */}
            <div>
              <h1 className="font-bold leading-[0.88] sm:leading-[0.9] tracking-[-0.04em] text-cybersage-cream" style={{ fontSize: 'clamp(2.25rem, 4.5vw, 7.5rem)' }}>
                <span className="block overflow-hidden">
                  <span className="inline-flex flex-wrap gap-0.5 sm:gap-1">
                    {nameFirst.split('').map((char, idx) => (
                      <GlitchChar
                        key={`first-${idx}`}
                        char={char}
                        index={idx}
                        isGlitching={isGlitching}
                      />
                    ))}
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span className="inline-flex flex-wrap gap-0.5 sm:gap-1">
                    {nameSecond.split('').map((char, idx) => (
                      <GlitchChar
                        key={`second-${idx}`}
                        char={char}
                        index={idx + nameFirst.length}
                        isGlitching={isGlitching}
                      />
                    ))}
                  </span>
                </span>
              </h1>
            </div>

            {/* Sub-text with RGB shift on glitch */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.85 }}
              className="font-mono text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] tracking-[0.15em] sm:tracking-[0.18em] md:tracking-[0.22em] text-cybersage-cream/30 uppercase"
              style={{
                filter: (!isMobile && isGlitching) ? 'drop-shadow(2px 0 0 #AE0C00) drop-shadow(-2px 0 0 #00FF9C)' : 'none',
                transition: 'filter 0.1s',
              }}
            >
              Full Stack Engineer&nbsp;// Digital Wisdom
            </motion.p>

            {/* Ghost CTA buttons with hex addresses */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1, ease: EASE }}
              className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 relative"
            >
              <CTAButton href="#work" label="View Work" hexAddr="0xWORK" isPrimary />
              <CTAButton href="#contact" label="Contact" hexAddr="0xCONT" />
            </motion.div>
          </div>

          {/* Portal Marquee Dock — floating at bottom */}
          <div className="mt-auto pt-8 sm:pt-10 lg:pt-12 pb-4 sm:pb-5 lg:pb-6">
            <PortalMarquee isParentHovered={isLeftPaneHovered} />
          </div>
        </div>

        {/* Right pane — 62% on desktop, full width on mobile — bleeds off edge */}
        <div
          ref={rightRef}
          className="relative w-full lg:w-[62%] h-64 sm:h-80 md:h-96 lg:h-auto"
          style={{ marginRight: '-3%' }}
        >
          <div className="absolute inset-y-0 left-0 w-px pointer-events-none z-10 bg-gradient-to-b from-transparent via-cybersage-emerald/18 to-transparent" />
          <AsciiCanvas />
        </div>

      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-4 sm:bottom-6 left-1/2 lg:left-[21%] -translate-x-1/2 lg:translate-x-0 z-30 flex flex-col items-center gap-1.5"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Mouse size={16} strokeWidth={1.25} className="text-cybersage-cream/20" />
        </motion.div>
        <span className="font-mono text-[8px] tracking-[0.45em] text-cybersage-cream/15 uppercase">Scroll</span>
      </motion.div>

      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_85%_85%_at_30%_55%,transparent_45%,#1A1A1A_100%)]" />

    </section>
  );
}
