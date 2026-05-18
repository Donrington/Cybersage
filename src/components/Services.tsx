'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsMobile } from '@/lib/useIsMobile';

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FONT_DISPLAY = '"Monument Extended","PP Neue Montreal","Inter",sans-serif';
const FONT_MONO    = '"JetBrains Mono","IBM Plex Mono",monospace';
const FONT_BODY    = 'var(--font-geist-sans), system-ui, -apple-system, sans-serif';

// ─── Service data ─────────────────────────────────────────────────────────────
interface Service {
  id:          string;
  index:       string;
  label:       string;
  tag:         string;
  description: string;
  keywords:    string[];
  accentColor: string;
}

const SERVICES: Service[] = [
  {
    id:          'fullstack',
    index:       '01',
    label:       'FULL STACK DEVELOPMENT',
    tag:         'WEB_APP_SVC',
    description: 'End-to-end web applications. React/Next.js on the front, Django/Go on the back, Postgres underneath.',
    keywords:    ['React', 'Next.js', 'Django', 'Go', 'PostgreSQL'],
    accentColor: '#00FF9C',
  },
  {
    id:          'api',
    index:       '02',
    label:       'API & MICROSERVICES',
    tag:         'BACKEND_SVC',
    description: 'REST APIs designed for scale. Rate-limiting, idempotency, JWT auth, connection pooling.',
    keywords:    ['REST', 'Redis', 'JWT', 'Go', 'Node.js'],
    accentColor: '#FF9900',
  },
  {
    id:          'cloud',
    index:       '03',
    label:       'CLOUD & DEVOPS',
    tag:         'INFRA_SVC',
    description: 'AWS deployments, Docker containers, CI/CD pipelines from scratch.',
    keywords:    ['AWS', 'Docker', 'GitHub Actions', 'CI/CD'],
    accentColor: '#0078D4',
  },
  {
    id:          'ecommerce',
    index:       '04',
    label:       'ECOMMERCE SYSTEMS',
    tag:         'COMMERCE_SVC',
    description: 'Stripe integrations, inventory sync, order flows that handle spikes.',
    keywords:    ['Stripe', 'Webhooks', 'Inventory', 'Next.js'],
    accentColor: '#FF5A1F',
  },
  {
    id:          'performance',
    index:       '05',
    label:       'PERFORMANCE OPTIMIZATION',
    tag:         'OPTIM_SVC',
    description: 'Profiling, query tuning, Redis caching — cutting latency where it matters.',
    keywords:    ['Redis', 'Postgres', 'Profiling', 'Web Vitals'],
    accentColor: '#AE0C00',
  },
];

// ─── ServiceCard ──────────────────────────────────────────────────────────────
function ServiceCard({ service, index, isMobile }: { service: Service; index: number; isMobile: boolean }) {
  const cardRef   = useRef<HTMLDivElement>(null);
  const isInView  = useInView(cardRef, { once: true, margin: '-6% 0px' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.09, ease: EASE }}
      onHoverStart={() => !isMobile && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'rgba(18,18,18,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `0.5px solid ${hovered ? service.accentColor + '44' : 'rgba(0,255,156,0.14)'}`,
        padding: '28px 28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        overflow: 'hidden',
        willChange: 'transform',
        transition: 'border-color 0.2s ease, background 0.2s ease',
        cursor: 'default',
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(to right, transparent, ${service.accentColor}${hovered ? 'AA' : '60'}, transparent)`,
        transition: 'all 0.3s ease',
      }} />

      {/* Hover scan line — desktop only */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="scan"
            initial={{ top: '0%', opacity: 0 }}
            animate={{ top: ['0%', '100%'], opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'linear' }}
            style={{
              position: 'absolute', left: 0, right: 0, height: 1,
              background: `linear-gradient(to right, transparent, ${service.accentColor}88, transparent)`,
              pointerEvents: 'none', zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* Grain overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.035,
      }} />

      {/* Index + tag row */}
      <div className="relative z-10 flex items-center justify-between">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.75 } : {}}
          transition={{ duration: 0.5, delay: index * 0.09 + 0.3 }}
          style={{
            fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.24em',
            color: service.accentColor, fontWeight: 700,
          }}
        >
          _{service.index}
        </motion.span>
        <span style={{
          fontFamily: FONT_MONO, fontSize: 6.5, letterSpacing: '0.18em',
          color: 'rgba(249,255,246,0.2)', fontWeight: 700,
          border: `0.5px solid rgba(249,255,246,0.08)`, padding: '2px 7px',
        }}>
          {service.tag}
        </span>
      </div>

      {/* Animated accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: index * 0.09 + 0.2, ease: EASE }}
        style={{
          height: 1, width: '100%', transformOrigin: 'left',
          background: `linear-gradient(to right, ${service.accentColor}44, transparent)`,
        }}
      />

      {/* Service label */}
      <h3 className="relative z-10" style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 'clamp(14px, 1.8vw, 21px)',
        fontWeight: 900, color: '#F9FFF6',
        letterSpacing: '-0.01em', lineHeight: 1.1, margin: 0,
      }}>
        {service.label}
      </h3>

      {/* Description */}
      <p className="relative z-10" style={{
        fontFamily: FONT_BODY,
        fontSize: 'clamp(12.5px, 1.3vw, 14px)',
        color: 'rgba(249,255,246,0.58)',
        lineHeight: 1.68, margin: 0, letterSpacing: '0.01em',
      }}>
        {service.description}
      </p>

      {/* Keyword pills */}
      <div className="relative z-10 flex flex-wrap gap-2 pt-1">
        {service.keywords.map((kw, kwIdx) => (
          <motion.span
            key={kw}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: index * 0.09 + 0.45 + kwIdx * 0.06, ease: EASE }}
            style={{
              fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.15em',
              color: service.accentColor,
              background: `${service.accentColor}0D`,
              border: `0.5px solid ${service.accentColor}28`,
              padding: '3px 8px', whiteSpace: 'nowrap',
            }}
          >
            {kw}
          </motion.span>
        ))}
      </div>

      {/* Bottom-right HUD corner */}
      <div style={{
        position: 'absolute', bottom: 10, right: 12,
        fontFamily: FONT_MONO, fontSize: 5, letterSpacing: '0.16em',
        color: `${service.accentColor}${hovered ? '55' : '28'}`,
        fontWeight: 700, pointerEvents: 'none',
        transition: 'color 0.2s ease',
      }}>
        SVC_{service.index}_ACTIVE
      </div>

      {/* Corner ticks on hover */}
      {hovered && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 12, borderTop: `1px solid ${service.accentColor}88`, borderLeft: `1px solid ${service.accentColor}88` }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderBottom: `1px solid ${service.accentColor}88`, borderRight: `1px solid ${service.accentColor}88` }} />
        </>
      )}
    </motion.div>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: '-10% 0px' });
  const isMobile   = useIsMobile();

  // GSAP parallax on heading — desktop only
  React.useEffect(() => {
    if (isMobile || !headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { x: 0 },
        {
          x: '-4%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        },
      );
    });
    return () => ctx.revert();
  }, [isMobile]);

  // GSAP — draw grid reveal line + stagger cards — desktop only
  React.useEffect(() => {
    if (isMobile || !gridRef.current || !lineRef.current) return;
    const ctx = gsap.context(() => {
      // Horizontal draw line above grid
      gsap.fromTo(lineRef.current,
        { scaleX: 0, transformOrigin: 'left center', opacity: 0.6 },
        {
          scaleX: 1, opacity: 0,
          duration: 1.1, ease: 'power3.inOut',
          scrollTrigger: { trigger: gridRef.current, start: 'top 78%' },
        }
      );
    });
    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative', width: '100%',
        background: '#0A0A0A', isolation: 'isolate', overflow: 'hidden',
      }}
    >
      {/* Grain overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.05,
      }} />

      {/* Ambient glow — animated desktop, static mobile */}
      {isMobile ? (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(0,255,156,0.025) 0%, transparent 100%)',
        }} />
      ) : (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(0,255,156,0.025) 0%, transparent 100%)',
          }}
        />
      )}

      {/* Top separator */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 1,
        background: 'linear-gradient(to right, transparent, rgba(0,255,156,0.18), transparent)',
      }} />

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 max-w-360 mx-auto"
        style={{
          paddingLeft: 'clamp(24px,6vw,96px)',
          paddingRight: 'clamp(24px,6vw,96px)',
          paddingTop: 'clamp(64px,10vw,120px)',
          paddingBottom: 'clamp(64px,10vw,120px)',
        }}
      >
        {/* ── Section header ───────────────────────────────────────────────── */}
        <div className="mb-12 lg:mb-16">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE }}
            style={{
              fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.3em',
              color: '#00FF9C', fontWeight: 700, marginBottom: 16, opacity: 0.8,
            }}
          >
            MODULE_05 // CAPABILITIES
          </motion.p>

          {/* Heading — overflow parallax on desktop, wraps on mobile */}
          <div
            ref={headerRef}
            style={{
              overflow: 'visible',
              whiteSpace: isMobile ? 'normal' : 'nowrap',
            }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: isMobile
                  ? 'clamp(2.1rem, 13vw, 3.6rem)'
                  : 'clamp(3.4rem, 8.5vw, 9rem)',
                fontWeight: 900,
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              <span style={{ color: '#F9FFF6' }}>WHAT</span>{' '}
              <span style={{
                WebkitTextStroke: '1.5px rgba(249,255,246,0.28)',
                color: 'transparent',
              }}>
                I BUILD
              </span>
            </motion.h2>
          </div>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.22, ease: EASE }}
            style={{
              fontFamily: FONT_BODY,
              fontSize: 'clamp(13px, 1.5vw, 16px)',
              color: 'rgba(249,255,246,0.42)',
              marginTop: 20, maxWidth: 480, lineHeight: 1.65,
            }}
          >
            Five service areas. Every engagement ships production-quality code.
          </motion.p>
        </div>

        {/* Grid reveal line */}
        <div
          ref={lineRef}
          style={{
            height: 1, marginBottom: 24,
            background: 'linear-gradient(to right, #00FF9C, rgba(0,255,156,0.1), transparent)',
            transformOrigin: 'left',
          }}
        />

        {/* ── Service grid ─────────────────────────────────────────────────── */}
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(12px, 2vw, 20px)',
          }}
        >
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} isMobile={isMobile} />
          ))}
        </div>

        {/* ── Section footer ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
          style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: 8,
            marginTop: 'clamp(32px, 4vw, 48px)', paddingTop: 16,
            borderTop: '0.5px solid rgba(0,255,156,0.08)',
          }}
        >
          <span style={{
            fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.2em',
            color: 'rgba(249,255,246,0.15)', fontWeight: 700,
          }}>
            SVC_COUNT: 05 // STATUS: AVAILABLE
          </span>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.2em',
            color: 'rgba(0,255,156,0.28)', fontWeight: 700,
          }}>
            OPERATOR: ABAKWE.CARRINGTON // OPEN_TO_REMOTE
          </span>
        </motion.div>
      </div>

      {/* Bottom separator */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, zIndex: 1,
        background: 'linear-gradient(to right, transparent, rgba(0,255,156,0.18), transparent)',
      }} />
    </section>
  );
}
