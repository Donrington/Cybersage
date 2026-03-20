'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import Image from 'next/image';

interface PartnerLogo {
  name: string;
  src: string;
}

const PARTNERS: PartnerLogo[] = [
  { name: 'Autoboy',    src: '/logo/autoboy.png' },
  { name: 'NextGen',    src: '/logo/NEXTGEN PL (Landscape) WHITE.png' },
  { name: 'Rokeyla',   src: '/logo/RokeylaSecondaryLogoWhite.png' },
  { name: 'TQL',       src: '/logo/TQL LOGO 2-01.png' },
  { name: 'Samdus',    src: '/logo/samdus_white.png' },
  { name: 'ReCoverDerm', src: '/logo/ReCoverDerm Logo Varient (White).png' },
  { name: 'Tech',      src: '/logo/techwhite.png' },
];

const ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;

// ─── Individual logo with ghost → glow transition ────────────────────────────
function LogoItem({ partner }: { partner: PartnerLogo }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="shrink-0 cursor-default"
      animate={{ scale: hovered ? 1.1 : 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Image
        src={partner.src}
        alt={partner.name}
        width={100}
        height={32}
        className="h-5 sm:h-6 md:h-7 w-auto object-contain"
        style={{
          filter: hovered
            ? 'brightness(2) saturate(0) drop-shadow(0 0 8px rgba(0,255,156,0.75))'
            : 'brightness(2) saturate(0)',
          opacity: hovered ? 0.8 : 0.15,
          transition: 'opacity 0.35s ease, filter 0.35s ease',
        }}
      />
    </motion.div>
  );
}

// ─── PortalMarquee ────────────────────────────────────────────────────────────
export interface PortalMarqueeProps {
  isParentHovered?: boolean;
}

export function PortalMarquee({ isParentHovered = false }: PortalMarqueeProps) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const tweenRef  = useRef<gsap.core.Tween | null>(null);

  // Double array → seamless loop
  const items = [...PARTNERS, ...PARTNERS];

  // Start GSAP infinite loop after a short delay so images paint first
  useEffect(() => {
    const id = setTimeout(() => {
      if (!trackRef.current) return;
      const halfWidth = trackRef.current.scrollWidth / 2;
      tweenRef.current = gsap.to(trackRef.current, {
        x: -halfWidth,
        duration: 38,
        ease: 'none',
        repeat: -1,
      });
    }, 150);

    return () => {
      clearTimeout(id);
      tweenRef.current?.kill();
    };
  }, []);

  // Slow down while the left pane is hovered (buttery deceleration)
  useEffect(() => {
    if (!tweenRef.current) return;
    gsap.to(tweenRef.current, {
      timeScale: isParentHovered ? 0.2 : 1,
      duration: 0.9,
      ease: 'power2.out',
    });
  }, [isParentHovered]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.6, ease: ENTRANCE_EASE }}
      className="relative w-full overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 13%, black 87%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 13%, black 87%, transparent 100%)',
      }}
    >
      {/* ── Portal entrance — icons materialize through this gate ── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 sm:w-20 z-10 pointer-events-none backdrop-blur-xl"
        style={{
          background:
            'radial-gradient(ellipse at 0% 50%, rgba(0,255,156,0.12) 0%, rgba(255,90,31,0.06) 55%, transparent 100%)',
        }}
      />

      {/* ── Portal exit — icons dematerialize through this gate ── */}
      <div
        className="absolute right-0 top-0 bottom-0 w-16 sm:w-20 z-10 pointer-events-none backdrop-blur-xl"
        style={{
          background:
            'radial-gradient(ellipse at 100% 50%, rgba(0,255,156,0.12) 0%, rgba(255,90,31,0.06) 55%, transparent 100%)',
        }}
      />

      {/* ── Marquee track ── */}
      <div
        ref={trackRef}
        className="flex items-center gap-8 sm:gap-10 md:gap-14 py-4 sm:py-5 md:py-6 will-change-transform"
      >
        {items.map((partner, idx) => (
          <LogoItem key={idx} partner={partner} />
        ))}
      </div>
    </motion.div>
  );
}
