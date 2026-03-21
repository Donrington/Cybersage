'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuditProgressBar } from './AuditProgressBar';
import { useIsMobile } from '@/lib/useIsMobile';

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Data ──────────────────────────────────────────────────────────────────────
interface Milestone {
  company:      string;
  period:       string;
  role:         string;
  desc:         string;
  achievement:  string; // PDF-sourced achievement line
  isPresent:    boolean;
  sysId:        string;
  scanColor:    string;
  stack:        string[];
  impact:       string;
}

const MILESTONES: Milestone[] = [
  {
    company: 'Recoverderm', period: 'Feb 2026 – Present', isPresent: true, sysId: 'SYS-001', scanColor: '#00FF9C',
    role: 'Full Stack Developer',
    desc: 'Built advanced paramedical digital infrastructure for patient restoration and confidence. Developed secure portals, treatment tracking, and client CMS.',
    achievement: 'Lead architect for paramedical recovery systems // High-security REST API implementation.',
    stack: ['NEXT.JS', 'DJANGO', 'POSTGRES'], impact: 'RESTORE_PLATFORM',
  },
  {
    company: 'Anoc.ng', period: 'Dec 2025 – Present', isPresent: true, sysId: 'SYS-002', scanColor: '#00FF9C',
    role: 'Full Stack Developer',
    desc: 'Engineered a professional digital ecosystem for Chartered Accountants and auditing experts. Client intake, document management, and compliance dashboards.',
    achievement: 'Auditing platform optimisation // Financial data integrity protocols.',
    stack: ['NEXT.JS', 'NODE.JS', 'POSTGRES'], impact: 'AUDIT_PLATFORM',
  },
  {
    company: 'NextGen Robotics', period: 'Apr 2025 – Present', isPresent: true, sysId: 'SYS-003', scanColor: '#00FF9C',
    role: 'Software Engineer',
    desc: 'Architected scalable web applications and cloud deployment pipelines for cutting-edge robotics interfaces. Performance-focused and highly available infrastructure.',
    achievement: 'CI/CD pipeline automation // Improving user engagement by 25%.',
    stack: ['NEXT.JS', 'GO', 'AWS'], impact: '+25%_ENGAGEMENT',
  },
  {
    company: 'Autoboy', period: 'Jul 2025 – Present', isPresent: true, sysId: 'SYS-004', scanColor: '#FF5A1F',
    role: 'Sr. Full Stack Developer',
    desc: 'Architected and scaled a B2B/B2C automotive marketplace. Built real-time inventory, payment rails, and seller dashboards with React and Go microservices.',
    achievement: 'B2B/B2C marketplace scale-up // 30% increase in system response times.',
    stack: ['REACT', 'GO', 'POSTGRES'], impact: '+30%_RESPONSE',
  },
  {
    company: 'Axflo Oil & Gas', period: 'Dec 2024', isPresent: false, sysId: 'SYS-005', scanColor: '#FF5A1F',
    role: 'Full Stack Developer',
    desc: 'Delivered a custom headless CMS and enterprise corporate platform for an oil and gas conglomerate. Custom workflows, document generation and access control.',
    achievement: 'Custom enterprise CMS delivery // Document generation pipeline.',
    stack: ['NEXT.JS', 'DJANGO', 'POSTGRES'], impact: 'ENTERPRISE_CMS',
  },
  {
    company: 'KRK Motors', period: 'Dec 2024', isPresent: false, sysId: 'SYS-006', scanColor: '#AE0C00',
    role: 'Web Developer',
    desc: 'Designed and built a high-aesthetics digital brand presence and portfolio architecture for a premium automotive dealership.',
    achievement: 'High-performance brand portal // Sub-1s load times achieved.',
    stack: ['NEXT.JS', 'TAILWIND', 'GSAP'], impact: 'BRAND_ARCH',
  },
  {
    company: 'Rokeyla Fashion', period: 'Sept 2024', isPresent: false, sysId: 'SYS-007', scanColor: '#AE0C00',
    role: 'Full Stack Developer',
    desc: 'Architected a high-conversion e-commerce platform with payment systems, inventory management and demand-scaled backend infrastructure.',
    achievement: 'E-commerce architecture // Integrated payment rails and inventory scaling.',
    stack: ['NEXT.JS', 'STRIPE', 'POSTGRES'], impact: 'ECOMM_SCALE',
  },
  {
    company: 'Samdus Oil and Gas', period: 'Aug – Dec 2024', isPresent: false, sysId: 'SYS-008', scanColor: '#AE0C00',
    role: 'Web Developer',
    desc: 'Delivered high-performance corporate portfolio sites optimised for energy sector branding. Custom animations, SEO infrastructure and fast TTFB.',
    achievement: 'High-performance corporate portal // SEO infrastructure deployment.',
    stack: ['NEXT.JS', 'DJANGO'], impact: 'HIGH_PERF_PORTAL',
  },
  {
    company: 'Handyman & Contractors', period: 'Jun 2024', isPresent: false, sysId: 'SYS-009', scanColor: '#AE0C00',
    role: 'Web Developer',
    desc: 'Built lead generation platforms and responsive UI systems that drove measurable growth in qualified service inquiries.',
    achievement: 'Lead generation system // Responsive UI driving qualified inquiries.',
    stack: ['REACT', 'NODE.JS', 'TAILWIND'], impact: 'LEAD_GEN_SYS',
  },
  {
    company: 'Amanigo Travels', period: 'May – Jun 2024', isPresent: false, sysId: 'SYS-010', scanColor: '#AE0C00',
    role: 'Lead Full Stack Developer',
    desc: 'Led development of end-to-end travel management applications with secure CMS, booking engines, and itinerary builders.',
    achievement: 'Travel management platform // Secure CMS and booking engine delivery.',
    stack: ['NEXT.JS', 'DJANGO', 'POSTGRES'], impact: 'TRAVEL_MGMT',
  },
  {
    company: 'Zidio', period: 'Feb – Mar 2024', isPresent: false, sysId: 'SYS-011', scanColor: '#AE0C00',
    role: 'Team Leader (Internship)',
    desc: 'Led a cross-functional development team under Agile methodology. Optimised sprint velocity, resolved blockers, and shipped on schedule.',
    achievement: 'Agile team leadership // Sprint velocity optimisation and on-time delivery.',
    stack: ['AGILE', 'JIRA', 'SCRUM'], impact: 'TEAM_OPTIM',
  },
  {
    company: 'Dejaii', period: 'Sept 2023 – Feb 2024', isPresent: false, sysId: 'SYS-012', scanColor: '#AE0C00',
    role: 'Lead Back-End Engineer',
    desc: 'Drove API interoperability across multiple service integrations. Optimised database query performance and reduced average response latency.',
    achievement: 'API interoperability system // Reduced response latency across services.',
    stack: ['DJANGO', 'POSTGRES', 'REST_API'], impact: 'API_INTEROP',
  },
  {
    company: 'Xtus Connect', period: 'Jun 2021 – Aug 2023', isPresent: false, sysId: 'SYS-013', scanColor: '#AE0C00',
    role: 'Full Stack Developer',
    desc: 'Managed end-to-end web application development across the full product lifecycle — feature shipping, performance profiling, and client delivery.',
    achievement: 'End-to-end web application management // Full product lifecycle ownership.',
    stack: ['REACT', 'DJANGO', 'POSTGRES'], impact: 'E2E_WEB_MGMT',
  },
  {
    company: 'Nigerian Bottling Company', period: 'Jun 2019 – Jan 2020', isPresent: false, sysId: 'SYS-014', scanColor: '#AE0C00',
    role: 'QA Engineer (Intern)',
    desc: 'Automated testing for Brix level monitoring across production lines. Built test harnesses that significantly reduced manual inspection cycles.',
    achievement: 'QA Automation // 40% efficiency increase in Brix level monitoring.',
    stack: ['PYTHON', 'SELENIUM', 'POSTGRES'], impact: '+40%_QA_EFFICIENCY',
  },
];

// ─── Pixel-grit glitch variants — desktop only ─────────────────────────────────
const glitchEnter = {
  initial: {
    opacity: 0,
    clipPath: 'inset(100% 0 0 0)',
    filter: 'hue-rotate(180deg) saturate(250%) brightness(1.6)',
  },
  animate: {
    opacity:  [0, 0.55, 0.82, 1, 1],
    clipPath: [
      'inset(100% 0 0 0)',
      'inset(55%  0 0 0)',
      'inset(22%  0 0 0)',
      'inset(4%   0 0 0)',
      'inset(0%   0 0 0)',
    ],
    filter: [
      'hue-rotate(180deg) saturate(250%) brightness(1.6)',
      'hue-rotate(90deg)  saturate(150%) brightness(1.3)',
      'hue-rotate(20deg)  saturate(110%) brightness(1.1)',
      'none',
      'none',
    ],
    transition: {
      duration: 0.45,
      ease: EASE,
      times: [0, 0.3, 0.6, 0.85, 1],
    },
  },
  exit: {
    opacity:  0,
    clipPath: 'inset(0 0 100% 0)',
    filter:   'hue-rotate(90deg) brightness(1.4)',
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
};

// ─── Simple fade — mobile replacement for glitchEnter ─────────────────────────
const fadeEnter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

// ─── Shared card content ──────────────────────────────────────────────────────
function RightCard({ milestone }: { milestone: Milestone }) {
  const isPast  = !milestone.isPresent;
  const legacyFilter = isPast ? 'grayscale(0.2) saturate(0.85)' : 'none';

  return (
    <div
      data-bento-card
      className="relative w-full p-5 sm:p-7"
      style={{
        background:          'rgba(26,26,26,0.82)',
        backdropFilter:      'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        border:              '0.5px solid rgba(249,255,246,0.08)',
        filter:              legacyFilter,
        boxShadow: milestone.isPresent
          ? 'inset 0 0 32px rgba(0,0,0,0.5), 0 0 36px rgba(0,255,156,0.07)'
          : 'inset 0 0 28px rgba(0,0,0,0.45)',
      }}
    >
      {/* Corner accents */}
      {(['tl','tr','bl','br'] as const).map((c) => (
        <div
          key={c}
          className={[
            'absolute w-3 h-3',
            c === 'tl' ? 'top-0 left-0 border-t border-l'    : '',
            c === 'tr' ? 'top-0 right-0 border-t border-r'   : '',
            c === 'bl' ? 'bottom-0 left-0 border-b border-l' : '',
            c === 'br' ? 'bottom-0 right-0 border-b border-r': '',
            milestone.isPresent ? 'border-cybersage-emerald/30' : 'border-cybersage-cream/10',
          ].join(' ')}
          style={{ borderWidth: '0.5px' }}
        />
      ))}
      <div
        className="absolute left-0 top-0 bottom-0 w-px"
        style={{ background: `linear-gradient(to bottom, transparent, ${milestone.scanColor}55, transparent)` }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <span className="font-mono text-[6px] tracking-[0.35em] text-cybersage-cream/18 uppercase block mb-1">
            {milestone.sysId}
          </span>
          <span
            className="font-mono text-[6px] sm:text-[7px] tracking-[0.22em] uppercase"
            style={{ color: milestone.scanColor, opacity: 0.82 }}
          >
            {milestone.role}
          </span>
        </div>
        <span className="font-mono text-[6px] tracking-[0.15em] uppercase shrink-0" style={{ color: 'rgba(249,255,246,0.28)' }}>
          {milestone.period}
        </span>
      </div>

      {/* Description */}
      <p className="font-mono text-[8px] sm:text-[9px] tracking-[0.08em] leading-[1.88] uppercase text-cybersage-cream/55 mb-5">
        {milestone.desc}
      </p>

      {/* PDF Achievement line */}
      <div
        className="mb-5 px-3 py-2.5"
        style={{
          background: `${milestone.scanColor}0a`,
          borderLeft: `1px solid ${milestone.scanColor}40`,
        }}
      >
        <span className="font-mono text-[5px] tracking-[0.3em] uppercase block mb-1" style={{ color: 'rgba(249,255,246,0.3)' }}>
          // Achievement
        </span>
        <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.06em] leading-[1.75] uppercase" style={{ color: milestone.scanColor, opacity: 0.85 }}>
          {milestone.achievement}
        </span>
      </div>

      {/* Technical payload */}
      <div className="pt-4 space-y-2" style={{ borderTop: '0.5px solid rgba(249,255,246,0.07)' }}>
        <span className="font-mono text-[5px] tracking-[0.4em] text-cybersage-cream/22 uppercase block mb-2.5">
          // Technical Payload
        </span>
        {[
          { label: 'ENGINE_STACK',   value: `[${milestone.stack.join(', ')}]` },
          { label: 'IMPACT_METRIC',  value: milestone.impact },
          { label: 'SECURITY_LEVEL', value: 'ENCRYPTED_v2.0' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[5px] sm:text-[6px] tracking-[0.25em] uppercase" style={{ color: 'rgba(249,255,246,0.55)' }}>
              {label}:
            </span>
            <span className="font-mono text-[5px] sm:text-[6px] tracking-[0.18em] uppercase" style={{ color: milestone.scanColor, opacity: 0.9 }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Active badge */}
      {milestone.isPresent && (
        <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: '0.5px solid rgba(0,255,156,0.12)' }}>
          <motion.span
            className="w-1 h-1 rounded-full shrink-0"
            style={{ background: '#00FF9C' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="font-mono text-[5px] tracking-[0.35em] uppercase" style={{ color: '#00FF9C', opacity: 0.65 }}>
            ACTIVE — CURRENT ENGAGEMENT
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Mobile: single milestone section (sticky-stack) ─────────────────────────
function MobileMilestoneSection({
  milestone,
  index,
  total,
}: {
  milestone: Milestone;
  index:     number;
  total:     number;
}) {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  // z-index: later entries stack on top of earlier ones (push-up effect)
  const zIndex = total - index;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // One-shot reveal — no continuous per-frame updates on mobile
    const revealST = ScrollTrigger.create({
      trigger: section,
      start:   'top 85%',
      once:    true,
      onEnter: () => setRevealed(true),
    });

    return () => { revealST.kill(); };
  }, []);

  const dotColor   = milestone.isPresent ? '#00FF9C' : '#AE0C00';
  const legacyFilter = !milestone.isPresent ? 'grayscale(0.2) saturate(0.85)' : 'none';

  return (
    <div ref={sectionRef} className="relative" style={{ filter: legacyFilter }}>

      {/* ── Sticky company header ── */}
      <div
        ref={headerRef}
        className="sticky top-0"
        style={{
          zIndex,
          willChange: 'transform',
          background:          'rgba(20,20,20,0.95)',
          backdropFilter:      'blur(24px)',
          WebkitBackdropFilter:'blur(24px)',
          borderBottom:        `0.5px solid ${milestone.isPresent ? 'rgba(0,255,156,0.12)' : 'rgba(249,255,246,0.05)'}`,
        }}
      >
        {/* Horizontal scan line at bottom of header */}
        <motion.div
          className="absolute bottom-0 left-0 h-px"
          style={{ background: `linear-gradient(to right, ${dotColor}, transparent)` }}
          animate={revealed ? { width: ['0%', '60%'] } : { width: '0%' }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        />

        {/* Vertical accent (right edge) — static on mobile */}
        <div
          className="absolute right-0 top-0 bottom-0 w-0.5"
          style={{ background: `linear-gradient(to bottom, ${dotColor}33, transparent)` }}
        />

        <div className="px-5 py-3.5 pr-6">
          {/* Meta row */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[5px] tracking-[0.4em] text-cybersage-cream/20 uppercase">
              {milestone.sysId}
            </span>
            {milestone.isPresent ? (
              <div className="flex items-center gap-1.5">
                <motion.span
                  className="w-1 h-1 rounded-full shrink-0"
                  style={{ background: '#00FF9C' }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.3, repeat: Infinity }}
                />
                <span className="font-mono text-[5px] tracking-[0.3em] uppercase" style={{ color: '#00FF9C', opacity: 0.7 }}>
                  ACTIVE
                </span>
              </div>
            ) : (
              <span className="font-mono text-[5px] tracking-[0.2em] uppercase" style={{ color: '#AE0C00', opacity: 0.55 }}>
                ARCHIVE
              </span>
            )}
          </div>

          {/* Company name — simple fade reveal on mobile */}
          <div className="overflow-hidden">
            <AnimatePresence>
              {revealed && (
                <motion.h3
                  initial={fadeEnter.initial}
                  animate={fadeEnter.animate}
                  className="font-black uppercase leading-tight"
                  style={{
                    fontFamily:    '"Inter", system-ui, sans-serif',
                    fontSize:      'clamp(1.3rem, 4.5vw, 2rem)',
                    letterSpacing: '-0.03em',
                    color: milestone.isPresent
                      ? '#F9FFF6'
                      : 'rgba(249,255,246,0.6)',
                  }}
                >
                  {milestone.company}
                </motion.h3>
              )}
              {!revealed && (
                <div
                  className="font-black uppercase leading-tight"
                  style={{
                    fontFamily:    '"Inter", system-ui, sans-serif',
                    fontSize:      'clamp(1.3rem, 4.5vw, 2rem)',
                    letterSpacing: '-0.03em',
                    color:         'transparent',
                  }}
                >
                  {milestone.company}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Role */}
          <span
            className="font-mono text-[6px] tracking-[0.22em] uppercase block mt-1"
            style={{ color: dotColor, opacity: 0.7 }}
          >
            {milestone.role} · {milestone.period}
          </span>
        </div>
      </div>

      {/* ── Scrollable content (scrolls under sticky header) ── */}
      <div className="px-4 pt-5 pb-14 sm:px-6">
        <RightCard milestone={milestone} />
      </div>
    </div>
  );
}

// ─── Mobile timeline ──────────────────────────────────────────────────────────
function MobileTimeline() {
  return (
    <div>
      {MILESTONES.map((m, i) => (
        <MobileMilestoneSection
          key={m.sysId}
          milestone={m}
          index={i}
          total={MILESTONES.length}
        />
      ))}
    </div>
  );
}

// ─── HUD block (desktop left column) ─────────────────────────────────────────
function HUDBlock({ milestone }: { milestone: Milestone }) {
  return (
    <div className="mt-5 space-y-1.5">
      {[
        { label: 'ENGINE_STACK',   value: `[${milestone.stack.join(', ')}]` },
        { label: 'IMPACT_METRIC',  value: milestone.impact },
        { label: 'SECURITY_LEVEL', value: 'ENCRYPTED_v2.0' },
      ].map(({ label, value }) => (
        <motion.div
          key={label}
          className="flex items-center gap-2"
          animate={{ opacity: [0.18, 0.38, 0.18] }}
          transition={{ duration: 3.8 + Math.random() * 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-mono text-[5px] sm:text-[6px] tracking-[0.28em] uppercase" style={{ color: 'rgba(249,255,246,0.25)' }}>
            {label}:
          </span>
          <span className="font-mono text-[5px] sm:text-[6px] tracking-[0.18em] uppercase" style={{ color: milestone.scanColor, opacity: 0.6 }}>
            {value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Desktop: GSAP sticky-scroll two-column ───────────────────────────────────
function DesktopTimeline() {
  const sectionRef   = useRef<HTMLDivElement>(null);
  const innerRef     = useRef<HTMLDivElement>(null);
  const railRef      = useRef<HTMLDivElement>(null);
  const nameWrapRef  = useRef<HTMLDivElement>(null);
  const activeIdxRef = useRef(0);
  const cardHRef     = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = MILESTONES[activeIndex];

  useEffect(() => {
    const inner  = innerRef.current;
    const rail   = railRef.current;
    if (!inner || !rail) return;

    cardHRef.current = inner.offsetHeight;
    const cardH = cardHRef.current;

    // Set initial rail card heights now that we know cardH
    Array.from(rail.children).forEach((child) => {
      (child as HTMLElement).style.height = `${cardH}px`;
    });

    const st = ScrollTrigger.create({
      trigger:      inner,
      start:        'top top',
      end:          `+=${(MILESTONES.length - 1) * cardH}`,
      pin:          true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const vel    = self.getVelocity();
        const newIdx = Math.min(
          MILESTONES.length - 1,
          Math.floor(self.progress * MILESTONES.length),
        );

        if (newIdx !== activeIdxRef.current) {
          activeIdxRef.current = newIdx;
          setActiveIndex(newIdx);
          gsap.to(rail, { y: -newIdx * cardHRef.current, duration: 0.72, ease: 'power3.inOut' });
        }

        // Chromatic aberration on scroll velocity
        const wrap     = nameWrapRef.current;
        const aberrPx  = gsap.utils.clamp(0, 9, Math.abs(vel) / 140);
        const aberrStr = gsap.utils.clamp(0, 0.65, Math.abs(vel) / 1100);
        if (wrap) {
          gsap.to(wrap, {
            filter: Math.abs(vel) > 380
              ? `drop-shadow(${aberrPx}px 0 0 rgba(174,12,0,${aberrStr})) drop-shadow(-${aberrPx}px 0 0 rgba(0,255,156,${aberrStr * 0.7}))`
              : 'none',
            duration: 0.28, ease: 'power2', overwrite: 'auto',
          });
        }
      },
    });

    const onResize = () => {
      cardHRef.current = inner.offsetHeight;
      Array.from(rail.children).forEach((child) => {
        (child as HTMLElement).style.height = `${cardHRef.current}px`;
      });
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);

    return () => { st.kill(); window.removeEventListener('resize', onResize); };
  }, []);

  const spinePercent = ((activeIndex + 1) / MILESTONES.length) * 100;

  return (
    <div ref={sectionRef}>
      <div ref={innerRef} className="h-screen overflow-hidden">
        <div className="grid h-full" style={{ gridTemplateColumns: '40% 60%' }}>

          {/* ── Left column ── */}
          <div
            className="relative flex flex-col justify-center px-8 xl:px-14 py-10 overflow-hidden"
            style={{ borderRight: '0.5px solid rgba(249,255,246,0.05)' }}
          >
            {/* Grain */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.025 }} aria-hidden>
              <filter id="et-grain-l">
                <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#et-grain-l)" />
            </svg>

            {/* Label + counter */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full" style={{ background: active.scanColor }} />
                <span className="font-mono text-[6px] tracking-[0.45em] text-cybersage-cream/22 uppercase">
                  Career_Stream.log
                </span>
              </div>
              <span className="font-mono text-[6px] tracking-[0.2em] text-cybersage-cream/18 uppercase">
                {String(activeIndex + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(MILESTONES.length).padStart(2, '0')}
              </span>
            </div>

            {/* SYS ID */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`id-${activeIndex}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
                className="mb-3"
              >
                <span className="font-mono text-[6px] tracking-[0.4em] text-cybersage-cream/20 uppercase">
                  {active.sysId}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Company name — pixel-grit glitch */}
            <div ref={nameWrapRef} className="mb-4 overflow-hidden" style={{ willChange: 'transform' }}>
              <AnimatePresence mode="wait">
                <motion.h3
                  key={`name-${activeIndex}`}
                  initial={glitchEnter.initial}
                  animate={glitchEnter.animate}
                  exit={glitchEnter.exit}
                  className="font-black uppercase leading-[0.88]"
                  style={{
                    fontFamily:    '"Inter", system-ui, sans-serif',
                    fontSize:      'clamp(2rem, 4.2vw, 5.5rem)',
                    letterSpacing: '-0.035em',
                    color:         active.isPresent ? '#F9FFF6' : 'rgba(249,255,246,0.65)',
                    filter:        !active.isPresent ? 'grayscale(0.2)' : 'none',
                    textShadow:    active.isPresent ? `0 0 30px ${active.scanColor}22` : 'none',
                  }}
                >
                  {active.company}
                </motion.h3>
              </AnimatePresence>
            </div>

            {/* Role */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`role-${activeIndex}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.32, delay: 0.1 }}
                className="mb-1"
              >
                <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.25em] uppercase" style={{ color: active.scanColor, opacity: 0.82 }}>
                  {active.role}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Period */}
            <AnimatePresence mode="wait">
              <motion.span
                key={`period-${activeIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, delay: 0.12 }}
                className="font-mono text-[6px] tracking-[0.2em] text-cybersage-cream/30 uppercase"
              >
                {active.period}
              </motion.span>
            </AnimatePresence>

            <HUDBlock milestone={active} />

            {/* Progress spine */}
            <div
              className="absolute right-0 top-10 bottom-10 w-px"
              style={{ background: 'rgba(0,255,156,0.07)' }}
            >
              <motion.div
                className="w-full origin-top"
                style={{ background: `linear-gradient(to bottom, ${active.scanColor}, ${active.scanColor}44)`, boxShadow: `0 0 6px ${active.scanColor}55` }}
                animate={{ height: `${spinePercent}%` }}
                transition={{ duration: 0.6, ease: EASE }}
              />
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                style={{ background: active.scanColor, boxShadow: `0 0 8px ${active.scanColor}dd, 0 0 18px ${active.scanColor}44` }}
                animate={{ top: `${spinePercent}%` }}
                transition={{ duration: 0.65, ease: EASE }}
              />
            </div>
          </div>

          {/* ── Right column: card rail ── */}
          <div className="relative overflow-hidden h-full" style={{ willChange: 'transform' }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ opacity: 0.018 }} aria-hidden>
              <filter id="et-grain-r">
                <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#et-grain-r)" />
            </svg>

            <div ref={railRef} className="flex flex-col" style={{ willChange: 'transform' }}>
              {MILESTONES.map((m) => (
                <div
                  key={m.sysId}
                  className="shrink-0 flex items-center"
                  /* height set imperatively in useEffect once we know cardH */
                >
                  <div className="w-full px-6 sm:px-10 lg:px-12 py-6">
                    <RightCard milestone={m} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── ExperienceTimeline ───────────────────────────────────────────────────────
export function ExperienceTimeline() {
  const isMobile    = useIsMobile();
  const isDesktop   = !isMobile;
  const sectionRef  = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative w-full bg-cybersage-charcoal">
      <AuditProgressBar sectionRef={sectionRef} totalCards={14} />
      <div className="absolute top-0 left-0 right-0 h-px z-10 bg-linear-to-r from-transparent via-white/8 to-transparent" />

      {/* Section header */}
      <div className="relative z-10 px-6 sm:px-12 lg:px-16 pt-20 sm:pt-24 pb-10 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-1 rounded-full bg-cybersage-emerald" />
            <span className="font-mono text-[7px] tracking-[0.5em] text-cybersage-cream/22 uppercase">Career_Stream.log</span>
          </div>
          <div className="overflow-hidden">
            <h2
              className="font-black uppercase text-cybersage-cream leading-none"
              style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 'clamp(3rem, 9vw, 10rem)', letterSpacing: '-0.04em', lineHeight: 0.88 }}
            >
              EXPERIENCE
            </h2>
          </div>
          <div className="overflow-hidden mt-1">
            <span
              className="font-black uppercase leading-none block"
              style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 'clamp(3rem, 9vw, 10rem)', letterSpacing: '-0.04em', lineHeight: 0.88, WebkitTextStroke: '1px rgba(249,255,246,0.16)', color: 'transparent' }}
            >
              TIMELINE
            </span>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <div className="h-px w-24" style={{ background: 'linear-gradient(to right, #00FF9C44, transparent)' }} />
            <span className="font-mono text-[6px] tracking-[0.4em] text-cybersage-cream/20 uppercase">
              {MILESTONES.length} Engagements Loaded
            </span>
          </div>
        </motion.div>
      </div>

      {isDesktop ? <DesktopTimeline /> : <MobileTimeline />}

      <div className="relative h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}
