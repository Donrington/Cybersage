'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

interface PartnerLogo {
  name: string;
  src: string;
}

interface PartnerMarqueeProps {
  partners?: PartnerLogo[];
}

const DEFAULT_PARTNERS: PartnerLogo[] = [
  { name: 'NEXTGEN', src: '/logo/NEXTGEN PL (Landscape) WHITE.png' },
  { name: 'ReCoverDerm', src: '/logo/ReCoverDerm Logo Varient (White).png' },
  { name: 'Rokeyla', src: '/logo/RokeylaSecondaryLogoWhite.png' },
  { name: 'TQL', src: '/logo/TQL LOGO 2-01.png' },
  { name: 'Autoboy', src: '/logo/autoboy.png' },
  { name: 'Samdus', src: '/logo/samdus_white.png' },
  { name: 'Tech', src: '/logo/techwhite.png' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function PartnerMarquee({ partners = DEFAULT_PARTNERS }: PartnerMarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);

  const marqueeItems = [...partners, ...partners];

  useEffect(() => {
    if (!marqueeRef.current) return;
    const marquee = marqueeRef.current.querySelector('.marquee-content');
    if (!marquee) return;
    const marqueeWidth = marquee.scrollWidth / 2;
    gsap.to(marquee, { x: -marqueeWidth, duration: 50, ease: 'none', repeat: -1 });
  }, []);

  return (
    <motion.div
      ref={marqueeRef}
      initial={{ opacity: 1 }}
      animate={{ opacity: 2 }}
      transition={{ duration: 0.8, delay: 1.6, ease: EASE }}
      className="relative w-full overflow-hidden"
    >
      {/* Portal entrance */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 z-20 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-r from-cybersage-charcoal via-cybersage-charcoal/70 to-transparent" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-20 h-20 -translate-x-1/2 blur-3xl opacity-25 rounded-full bg-cybersage-emerald" />
      </div>

      {/* Portal exit */}
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 z-20 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-l from-cybersage-charcoal via-cybersage-charcoal/70 to-transparent" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-20 h-20 translate-x-1/2 blur-3xl opacity-25 rounded-full bg-cybersage-emerald" />
      </div>

      {/* Marquee track */}
      <div className="overflow-hidden">
        <div className="marquee-content flex items-center gap-6 sm:gap-8 md:gap-10 py-4 sm:py-5">
          {marqueeItems.map((partner, idx) => (
            <motion.div
              key={idx}
              className="relative shrink-0 group/item"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative px-4 sm:px-5 py-2 sm:py-2.5 flex items-center justify-center">
                {/* Border */}
                <div
                  className="absolute inset-0 border border-cybersage-emerald/20 group-hover/item:border-cybersage-emerald/50 transition-colors duration-300"
                  style={{ borderWidth: '0.5px' }}
                />
                {/* Hover glow bg */}
                <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-cybersage-emerald/5" />
                {/* Top light beam */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-px opacity-0 group-hover/item:opacity-100 blur-sm transition-opacity duration-300 bg-cybersage-emerald/60" />

                {/* Logo — fixed height, auto width */}
                <Image
                  src={partner.src}
                  alt={partner.name}
                  width={80}
                  height={42}
                  className="h-5 sm:h-6 md:h-7 w-auto object-contain opacity-50 group-hover/item:opacity-90 transition-opacity duration-300"
                  style={{ filter: 'brightness(1.1)' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Separator lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cybersage-emerald/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cybersage-emerald/15 to-transparent" />
    </motion.div>
  );
}
