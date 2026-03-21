'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuditProgressBar } from './AuditProgressBar';
import { lenisInstance } from './SmoothScroll';
import { useIsMobile } from '@/lib/useIsMobile';

const CRITICAL_VELOCITY = 2500;

gsap.registerPlugin(ScrollTrigger);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@∆_!';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tier = 'large' | 'medium' | 'small';

interface HUD {
  tl:     string;
  tr?:    string;
  bl:     string;
  br?:    string;
  coord:  string;
  stress: string;
  deploy: string;
}

interface Project {
  id:          string;
  name:        string;
  category:    string;
  tagline:     string;
  insight:     string;      // technical impact line
  stack:       string[];
  status:      string;
  engine:      string;
  col:         string;      // desktop col-span
  tier:        Tier;
  accentColor: string;
  glowColor:   string;
  sysType:     string;
  payload:     string;
  bgImage:     string;
  bgOverlay:   string;      // cinematic color overlay gradient
  link?:       string;      // external project URL
  hud:         HUD;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// bgImage: picsum.photos seeded placeholders — replace with your own project shots.
// Priority preload is applied automatically to `tier: 'large'` entries.
const PROJECTS: Project[] = [
  // ── TOP TIER ──────────────────────────────────────────────────────────────
  {
    id: 'autoboy',
    name: 'AUTOBOY EXPRESS',
    category: 'B2B / B2C MARKETPLACE',
    tagline: 'Scaled a dual-sided automotive marketplace — Go microservices, real-time inventory rails, React seller dashboard, and Redis-cached product feeds.',
    insight: 'Optimised DB latency by 30% via Redis caching + Go connection pooling',
    stack: ['REACT', 'GO', 'POSTGRES', 'REDIS'],
    status: 'DEPLOYED',
    engine: 'ENGINE_v4.2',
    col: 'lg:col-span-8',
    tier: 'large',
    accentColor: '#FF5A1F',
    glowColor: 'rgba(255,90,31,0.28)',
    sysType: 'TYPE: B2B_B2C_MARKETPLACE // ARCH: GO_MICROSERVICES',
    payload: 'PAYLOAD_v4.2',
    bgImage: '/projects/autoboy.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.25) 0%, rgba(26,26,26,0.55) 45%, rgba(26,26,26,0.92) 85%), linear-gradient(135deg, rgba(255,90,31,0.22) 0%, transparent 55%)',
    link: 'https://autoboyexpress.com',
    hud: {
      tl:     'STACK_01: GO + REACT',
      tr:     'ARCH: MICROSERVICES',
      bl:     '+30%_RESPONSE_TIME',
      br:     'CLUSTER: ACTIVE',
      coord:  'COORD_6.5244°N_3.3792°E',
      stress: 'SYSTEM_STRESS: 0.03%',
      deploy: 'T_DEPLOY: 18ms',
    },
  },
  {
    id: 'recoverderm',
    name: 'RECOVERDERM',
    category: 'PARAMEDICAL PLATFORM',
    tagline: 'Advanced paramedical digital infrastructure — secure patient portals, treatment tracking dashboards, and a headless CMS for clinic management.',
    insight: 'High-security REST API with JWT + refresh token rotation; HIPAA-aligned data flow',
    stack: ['NEXT.JS', 'DJANGO', 'POSTGRES'],
    status: 'LIVE',
    engine: 'ENGINE_v1.5',
    col: 'lg:col-span-4',
    tier: 'large',
    accentColor: '#00FF9C',
    glowColor: 'rgba(0,255,156,0.25)',
    sysType: 'SYS_TYPE: PARAMEDICAL // SECURITY: HIGH_LEVEL',
    payload: 'PAYLOAD_v1.5',
    bgImage: '/projects/recoverderm.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.2) 0%, rgba(26,26,26,0.5) 45%, rgba(26,26,26,0.92) 88%), linear-gradient(150deg, rgba(0,255,156,0.2) 0%, transparent 60%)',
    link: 'https://recoverderm.ca',
    hud: {
      tl:     'SECURITY: HIGH_LEVEL',
      bl:     'API: JWT_SECURED',
      br:     'SYS: PARAMEDICAL',
      coord:  'COORD_6.5244°N_3.3792°E',
      stress: 'SYSTEM_STRESS: 0.01%',
      deploy: 'T_DEPLOY: 12ms',
    },
  },

  // ── MID TIER ──────────────────────────────────────────────────────────────
  {
    id: 'anoc',
    name: 'ANOC.NG',
    category: 'AUDIT / FINANCE',
    tagline: 'Digital ecosystem for Chartered Accountants — compliance dashboards, document management, and financial data integrity across multiple audit firms.',
    insight: 'Encrypted document pipelines; zero data-breach record since launch',
    stack: ['NEXT.JS', 'NODE.JS', 'POSTGRES'],
    status: 'LIVE',
    engine: 'ENGINE_v2.1',
    col: 'lg:col-span-4',
    tier: 'medium',
    accentColor: '#00FF9C',
    glowColor: 'rgba(0,255,156,0.2)',
    sysType: 'SECTOR: AUDIT_FINANCE // STATUS: COMPLIANCE_READY',
    payload: 'PAYLOAD_v2.1',
    bgImage: '/projects/anoc.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.3) 0%, rgba(26,26,26,0.6) 50%, rgba(26,26,26,0.93) 88%), linear-gradient(200deg, rgba(0,255,156,0.15) 0%, transparent 60%)',
    link: 'https://anoc.ng',
    hud: {
      tl:     'SECTOR: AUDIT_FINANCE',
      bl:     'INTEGRITY: VERIFIED',
      br:     'COMPLIANCE: READY',
      coord:  'COORD_9.0765°N_7.3986°E',
      stress: 'SYSTEM_STRESS: 0.04%',
      deploy: 'T_DEPLOY: 22ms',
    },
  },
  {
    id: 'nextgen',
    name: 'NEXTGEN ROBOTICS',
    category: 'AUTOMATION HUB',
    tagline: 'Scalable web applications and cloud deployment pipelines for cutting-edge robotics interfaces — CI/CD automation driving measurable user growth.',
    insight: '+25% user engagement via CI/CD pipeline automation + performance-first architecture',
    stack: ['NEXT.JS', 'GO', 'AWS', 'DOCKER'],
    status: 'DEPLOYED',
    engine: 'ENGINE_v3.8',
    col: 'lg:col-span-4',
    tier: 'medium',
    accentColor: '#00FF9C',
    glowColor: 'rgba(0,255,156,0.2)',
    sysType: 'TYPE: AUTOMATION_HUB // STACK: CLOUD_NATIVE',
    payload: 'PAYLOAD_v3.8',
    bgImage: '/projects/nextgen.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.2) 0%, rgba(26,26,26,0.55) 50%, rgba(26,26,26,0.93) 88%), linear-gradient(160deg, rgba(0,255,156,0.18) 0%, transparent 55%)',
    link: 'https://nextgenerationrobotics.org',
    hud: {
      tl:     'STACK: GO + AWS',
      tr:     'CLOUD: NATIVE',
      bl:     '+25%_ENGAGEMENT',
      coord:  'COORD_0.0000°N_0.0000°E',
      stress: 'SYSTEM_STRESS: 0.02%',
      deploy: 'T_DEPLOY: 9ms',
    },
  },
  {
    id: 'axflo',
    name: 'AXFLO OIL & GAS',
    category: 'ENTERPRISE CMS',
    tagline: 'Custom headless CMS and enterprise platform for an oil & gas conglomerate — workflow automation, document generation, and role-based access control.',
    insight: 'Custom document generation pipeline; reduced manual workflow ops by 60%',
    stack: ['NEXT.JS', 'DJANGO', 'POSTGRES'],
    status: 'DEPLOYED',
    engine: 'ENGINE_v5.0',
    col: 'lg:col-span-4',
    tier: 'medium',
    accentColor: '#FF5A1F',
    glowColor: 'rgba(255,90,31,0.22)',
    sysType: 'TYPE: ENTERPRISE_CMS // SECTOR: ENERGY',
    payload: 'PAYLOAD_v5.0',
    bgImage: '/projects/axflo.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.25) 0%, rgba(26,26,26,0.58) 48%, rgba(26,26,26,0.93) 88%), linear-gradient(120deg, rgba(255,90,31,0.2) 0%, rgba(174,12,0,0.12) 50%, transparent 100%)',
    link: 'https://axfloo.com',
    hud: {
      tl:     'STACK: DJANGO + PG',
      tr:     'SECTOR: ENERGY',
      bl:     'DOC_GEN: ACTIVE',
      br:     'CMS: HEADLESS',
      coord:  'COORD_6.5244°N_3.3792°E',
      stress: 'SYSTEM_STRESS: 0.05%',
      deploy: 'T_DEPLOY: 31ms',
    },
  },

  // ── DISCOVERY TIER ────────────────────────────────────────────────────────
  {  
    id: 'samdus',
    name: 'SAMDUS',
    category: 'CORP PORTFOLIO',
    tagline: 'High-performance corporate platform for an oil & gas company — custom motion, SEO-first architecture, and brand-grade web presence.',
    insight: 'Sub-1s LCP via ISR + asset optimization; SEO score 98/100',
    stack: ['NEXT.JS', 'DJANGO'],
    status: 'DEPLOYED',
    engine: 'ENGINE_v2.4',
    col: 'lg:col-span-3',
    tier: 'small',
    accentColor: '#FF5A1F',
    glowColor: 'rgba(255,90,31,0.2)',
    sysType: 'TYPE: CORP_PORTFOLIO // SLOGAN: INNOVATION_IN_SERVICES',
    payload: 'PAYLOAD_v2.4',
    bgImage: '/projects/samdus1_1.jpg',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.3) 0%, rgba(26,26,26,0.65) 50%, rgba(26,26,26,0.95) 90%), linear-gradient(130deg, rgba(255,90,31,0.18) 0%, transparent 60%)',
    link: 'https://samdus.com',
    hud: {
      tl:     'SECTOR: OIL_GAS',
      bl:     'SEO: 98/100',
      br:     'SYS_LINK: ACTIVE',
      coord:  'COORD_6.5244°N_3.3792°E',
      stress: 'SYSTEM_STRESS: 0.02%',
      deploy: 'T_DEPLOY: 8ms',
    },
  },
  {
    id: 'deets',
    name: 'DEETS NIGERIA',
    category: 'INDUSTRIAL SYSTEM',
    tagline: 'Industrial manufacturing platform — production tracking, compliance workflows, and enterprise-grade reporting infrastructure.',
    insight: 'Real-time production tracking with WebSocket feeds; compliance audit trail',
    stack: ['REACT', 'NODE.JS', 'POSTGRES'],
    status: 'DEPLOYED',
    engine: 'ENGINE_v1.8',
    col: 'lg:col-span-3',
    tier: 'small',
    accentColor: '#AE0C00',
    glowColor: 'rgba(174,12,0,0.28)',
    sysType: 'SECTOR: MANUFACTURING // TYPE: INDUSTRIAL_SYSTEM',
    payload: 'PAYLOAD_v1.8',
    bgImage: '/projects/deets.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.3) 0%, rgba(26,26,26,0.62) 50%, rgba(26,26,26,0.95) 90%), linear-gradient(150deg, rgba(174,12,0,0.22) 0%, transparent 60%)',
    link: 'https://deetsnigeria.org',
    hud: {
      tl:     'SECTOR: INDUSTRY',
      bl:     'REALTIME: WS',
      coord:  'COORD_9.0765°N_7.3986°E',
      stress: 'SYSTEM_STRESS: 0.06%',
      deploy: 'T_DEPLOY: 14ms',
    },
  },
  {
    id: 'handyman',
    name: 'ALL A HANDYMAN',
    category: 'LEAD GENERATION',
    tagline: 'Lead generation platforms and responsive UI systems that drove measurable growth in qualified service inquiries.',
    insight: 'Conversion-optimised landing architecture; 3× qualified lead growth',
    stack: ['REACT', 'NODE.JS', 'TAILWIND'],
    status: 'DEPLOYED',
    engine: 'ENGINE_v1.2',
    col: 'lg:col-span-3',
    tier: 'small',
    accentColor: '#FF5A1F',
    glowColor: 'rgba(255,90,31,0.2)',
    sysType: 'TYPE: WEB_APP // IMPACT: LEAD_GENERATION',
    payload: 'PAYLOAD_v1.2',
    bgImage: '/projects/handyman3.jpg',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.28) 0%, rgba(26,26,26,0.6) 50%, rgba(26,26,26,0.95) 90%), linear-gradient(140deg, rgba(255,90,31,0.16) 0%, transparent 60%)',
    hud: {
      tl:     'IMPACT: LEAD_GEN',
      bl:     '3× CONV_RATE',
      br:     'SYS_LINK: ACTIVE',
      coord:  'COORD_6.5244°N_3.3792°E',
      stress: 'SYSTEM_STRESS: 0.01%',
      deploy: 'T_DEPLOY: 11ms',
    },
  },
  {
    id: 'twerk',
    name: 'TWERK QUEEN LGS',
    category: 'EVENT PORTFOLIO',
    tagline: 'Professional event portfolio and brand presence — performance showcase, booking engine, and digital résumé infrastructure.',
    insight: 'GSAP-driven showcase with 60fps scroll animations; sub-800ms FCP',
    stack: ['NEXT.JS', 'TAILWIND', 'GSAP'],
    status: 'DEPLOYED',
    engine: 'ENGINE_v1.1',
    col: 'lg:col-span-3',
    tier: 'small',
    accentColor: '#AE0C00',
    glowColor: 'rgba(174,12,0,0.28)',
    sysType: 'TYPE: EVENT_PORTFOLIO // TAG: PROFESSIONAL_RESUME',
    payload: 'PAYLOAD_v1.1',
    bgImage: '/projects/twerkqueenlagos.jpg',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.25) 0%, rgba(26,26,26,0.6) 50%, rgba(26,26,26,0.95) 90%), linear-gradient(160deg, rgba(174,12,0,0.24) 0%, transparent 55%)',
    hud: {
      tl:     'TYPE: EVENT_PORT',
      bl:     'FCP: 800ms',
      br:     'GSAP: 60fps',
      coord:  'COORD_6.5244°N_3.3792°E',
      stress: 'SYSTEM_STRESS: 0.01%',
      deploy: 'T_DEPLOY: 6ms',
    },
  },

  // ── DIGITAL SERVICES TIER ─────────────────────────────────────────────────
  {
    id: 'chrisconteras',
    name: 'CHRIS CONTERAS',
    category: 'CLEANING AGENCY',
    tagline: 'High-converting lead generation platform for a Texas-based professional cleaning agency — responsive UI, SEO-first architecture, and optimised service inquiry funnels.',
    insight: 'Conversion-optimised landing stack; measurable growth in qualified service bookings',
    stack: ['NEXT.JS', 'TAILWIND', 'SEO'],
    status: 'LIVE',
    engine: 'ENGINE_v1.3',
    col: 'lg:col-span-4',
    tier: 'medium',
    accentColor: '#00FF9C',
    glowColor: 'rgba(0,255,156,0.2)',
    sysType: 'TYPE: LEAD_GEN // SECTOR: HOME_SERVICES',
    payload: 'PAYLOAD_v1.3',
    bgImage: '/projects/chrisconteras.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.25) 0%, rgba(26,26,26,0.55) 48%, rgba(26,26,26,0.93) 88%), linear-gradient(170deg, rgba(0,255,156,0.15) 0%, transparent 60%)',
    link: 'https://chriscleanstexas.com',
    hud: {
      tl:     'SECTOR: HOME_SERVICES',
      bl:     'CONV: OPTIMISED',
      br:     'LOC: TEXAS_US',
      coord:  'COORD_29.7604°N_95.3698°W',
      stress: 'SYSTEM_STRESS: 0.01%',
      deploy: 'T_DEPLOY: 10ms',
    },
  },
  {
    id: 'myrakeleher',
    name: 'MYRA KELEHER',
    category: 'CLEANING AGENCY',
    tagline: 'Professional cleaning agency platform for Florida — service showcase, instant quote engine, and lead capture infrastructure built for maximum conversion.',
    insight: 'Instant quote flow reduced drop-off; 40% improvement in form completion rate',
    stack: ['REACT', 'NODE.JS', 'TAILWIND'],
    status: 'LIVE',
    engine: 'ENGINE_v1.4',
    col: 'lg:col-span-4',
    tier: 'medium',
    accentColor: '#FF5A1F',
    glowColor: 'rgba(255,90,31,0.2)',
    sysType: 'TYPE: SERVICE_PLATFORM // SECTOR: HOME_SERVICES',
    payload: 'PAYLOAD_v1.4',
    bgImage: '/projects/myrakeleher.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.28) 0%, rgba(26,26,26,0.6) 50%, rgba(26,26,26,0.93) 88%), linear-gradient(130deg, rgba(255,90,31,0.18) 0%, transparent 60%)',
    link: 'https://myrakelehercleaning.com',
    hud: {
      tl:     'SECTOR: HOME_SERVICES',
      bl:     'FORM: OPTIMISED',
      br:     'LOC: FLORIDA_US',
      coord:  'COORD_27.6648°N_81.5158°W',
      stress: 'SYSTEM_STRESS: 0.01%',
      deploy: 'T_DEPLOY: 11ms',
    },
  },
  {
    id: 'techhub',
    name: 'TECHHUB',
    category: 'DEV COMMUNITY',
    tagline: 'Developer community hub — collaborative coding platform with project showcases, resource sharing, and peer-to-peer tech networking infrastructure.',
    insight: 'Community-driven architecture with real-time activity feeds and peer collaboration',
    stack: ['REACT', 'NODE.JS', 'POSTGRES'],
    status: 'OPEN_SOURCE',
    engine: 'ENGINE_v1.0',
    col: 'lg:col-span-4',
    tier: 'medium',
    accentColor: '#AE0C00',
    glowColor: 'rgba(174,12,0,0.25)',
    sysType: 'TYPE: DEV_COMMUNITY // ACCESS: OPEN_SOURCE',
    payload: 'PAYLOAD_v1.0',
    bgImage: '/projects/techhub.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.3) 0%, rgba(26,26,26,0.62) 50%, rgba(26,26,26,0.95) 90%), linear-gradient(150deg, rgba(174,12,0,0.2) 0%, transparent 60%)',
    link: 'https://github.com/Donrington/techhub',
    hud: {
      tl:     'ACCESS: OPEN_SOURCE',
      tr:     'HOST: GITHUB',
      bl:     'COLLAB: ENABLED',
      coord:  'COORD_6.5244°N_3.3792°E',
      stress: 'SYSTEM_STRESS: 0.02%',
      deploy: 'T_DEPLOY: 5ms',
    },
  },

  // ── BASE TIER ─────────────────────────────────────────────────────────────
  {
    id: 'amanigo',
    name: 'AMANIGO TRAVELS',
    category: 'TRAVEL MGMT APP',
    tagline: 'End-to-end travel management — secure CMS, booking engine, itinerary builder, and API integrations with global travel providers.',
    insight: 'Secure booking API with rate-limiting + idempotent payment transactions',
    stack: ['NEXT.JS', 'DJANGO', 'POSTGRES'],
    status: 'DEPLOYED',
    engine: 'ENGINE_v2.0',
    col: 'lg:col-span-4',
    tier: 'medium',
    accentColor: '#00FF9C',
    glowColor: 'rgba(0,255,156,0.2)',
    sysType: 'TYPE: TRAVEL_MGMT_APP // STATUS: SECURE_API',
    payload: 'PAYLOAD_v2.0',
    bgImage: '/projects/amanigo.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.25) 0%, rgba(26,26,26,0.55) 48%, rgba(26,26,26,0.93) 88%), linear-gradient(180deg, rgba(0,255,156,0.15) 0%, transparent 60%)',
    hud: {
      tl:     'TYPE: TRAVEL_MGMT',
      bl:     'PAYMENT: IDEMPOTENT',
      br:     'API: SECURE',
      coord:  'COORD_6.5244°N_3.3792°E',
      stress: 'SYSTEM_STRESS: 0.03%',
      deploy: 'T_DEPLOY: 19ms',
    },
  },
  {
    id: 'rokeyla',
    name: 'ROKEYLA FASHION',
    category: 'ECOMMERCE SCALING',
    tagline: 'High-conversion e-commerce platform — Stripe payment rails, inventory management, and demand-scaled backend infrastructure for a growing fashion brand.',
    insight: 'Stripe webhook integration with idempotency keys; inventory sync via pg_notify',
    stack: ['NEXT.JS', 'STRIPE', 'POSTGRES'],
    status: 'DEPLOYED',
    engine: 'ENGINE_v3.1',
    col: 'lg:col-span-4',
    tier: 'medium',
    accentColor: '#00FF9C',
    glowColor: 'rgba(0,255,156,0.2)',
    sysType: 'TYPE: ECOMMERCE // IMPACT: PERFORMANCE_MAX',
    payload: 'PAYLOAD_v3.1',
    bgImage: '/projects/rokeyla.jpg',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.22) 0%, rgba(26,26,26,0.52) 48%, rgba(26,26,26,0.93) 88%), linear-gradient(170deg, rgba(0,255,156,0.14) 0%, transparent 60%)',
    hud: {
      tl:     'IMPACT: PERF_MAX',
      bl:     'PAYMENT: STRIPE',
      br:     'SYNC: PG_NOTIFY',
      coord:  'COORD_6.5244°N_3.3792°E',
      stress: 'SYSTEM_STRESS: 0.02%',
      deploy: 'T_DEPLOY: 15ms',
    },
  },
  {
    id: 'zidio',
    name: 'KRK Motors',
    category: 'BRAND & LEADERSHIP',
    tagline: 'High-aesthetics brand portal for KRK Motors',
    insight: 'Led 6-engineer sprint; zero missed deadlines across 3 release cycles',
    stack: ['NEXT.JS', 'GSAP', 'AGILE'],
    status: 'COMPLETE',
    engine: 'ENGINE_v1.0',
    col: 'lg:col-span-4',
    tier: 'medium',
    accentColor: '#AE0C00',
    glowColor: 'rgba(174,12,0,0.28)',
    sysType: 'TYPE: BRAND_ARCH // LEADERSHIP: AGILE_FLOW',
    payload: 'PAYLOAD_v1.0',
    bgImage: '/projects/krkmotors.png',
    bgOverlay: 'linear-gradient(to bottom, rgba(26,26,26,0.28) 0%, rgba(26,26,26,0.58) 50%, rgba(26,26,26,0.93) 88%), linear-gradient(125deg, rgba(174,12,0,0.2) 0%, transparent 60%)',
    link: 'https://krk-motors.vercel.app',
    hud: {
      tl:     'ARCH: BRAND',
      bl:     'SPRINTS: 3_CLEAN',
      br:     'LEAD: AGILE_FLOW',
      coord:  'COORD_6.5244°N_3.3792°E',
      stress: 'SYSTEM_STRESS: 0.01%',
      deploy: 'T_DEPLOY: 7ms',
    },
  },
];

// ─── Glitch character reveal + fault corruption ───────────────────────────────
const FAULT_STRINGS = ['ERR_0x404', 'NULL_PTR', 'FAULT___', 'OVERFLOW', '0x000000'] as const;
const FAULT_CHARS   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!_∆X';

function GlitchTitle({
  text,
  entered,
  isFault,
}: {
  text:    string;
  entered: boolean;
  isFault: boolean;
}) {
  const [display, setDisplay] = useState(text);
  const rafRef      = useRef<number>(0);
  const resolvedRef = useRef<boolean[]>([]);

  useEffect(() => {
    if (!entered) return;
    cancelAnimationFrame(rafRef.current);

    if (isFault) {
      // ── Continuous corruption loop — never resolves ────────────────────────
      let frame = 0;
      const tick = () => {
        frame++;
        // Every 10 frames snap to a fault string for 2 frames (visual stutter)
        if (frame % 10 < 2) {
          const err = FAULT_STRINGS[Math.floor(Math.random() * FAULT_STRINGS.length)];
          setDisplay(err.slice(0, Math.max(text.length, err.length)).padEnd(text.length, '_'));
        } else {
          setDisplay(
            text.split('').map(() =>
              FAULT_CHARS[Math.floor(Math.random() * FAULT_CHARS.length)]
            ).join('')
          );
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }

    // ── Resolve left-to-right (entrance OR recovery from fault) ───────────────
    const chars = text.split('');
    resolvedRef.current = chars.map(() => false);
    let frame = 0;

    const tick = () => {
      frame++;
      const threshold = frame * 0.6;
      let allDone = true;

      const next = chars.map((ch, i) => {
        if (ch === ' ' || ch === '/' || ch === '&' || ch === '.') return ch;
        if (resolvedRef.current[i]) return ch;
        if (i < threshold && Math.random() > 0.35) {
          resolvedRef.current[i] = true;
          return ch;
        }
        allDone = false;
        return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      });

      setDisplay(next.join(''));
      if (!allDone) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(text);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [entered, isFault, text]);

  return <>{display}</>;
}

// ─── Custom cursor ────────────────────────────────────────────────────────────
function BentoCursor({ active }: { active: boolean }) {
  const x  = useMotionValue(0);
  const y  = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 500, damping: 28 });
  const sy = useSpring(y, { stiffness: 500, damping: 28 });

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      className="fixed z-9999 pointer-events-none"
      style={{ left: sx, top: sy, x: '-50%', y: '-50%' }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.3 }}
      transition={{ duration: 0.2, ease: EASE }}
    >
      <div className="flex items-center justify-center" style={{
        width: 52, height: 52, borderRadius: '50%',
        border: '1.5px solid #AE0C00',
        boxShadow: '0 0 14px rgba(174,12,0,0.65), inset 0 0 8px rgba(174,12,0,0.12)',
      }}>
        <span style={{
          fontSize: 5.5, fontFamily: 'monospace', letterSpacing: '0.12em',
          color: '#AE0C00', fontWeight: 700, textAlign: 'center',
          lineHeight: 1.3, maxWidth: 38, whiteSpace: 'pre-line',
        }}>
          {'VIEW_\nPROJECT'}
        </span>
      </div>
    </motion.div>
  );
}

// ─── BentoCard ────────────────────────────────────────────────────────────────
function BentoCard({
  project,
  index,
  onMouseEnter,
  onMouseLeave,
  isFault,
  isMobile,
}: {
  project:      Project;
  index:        number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isFault:      boolean;
  isMobile:     boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const leakRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Magnetic tilt
  const rotateX  = useMotionValue(0);
  const rotateY  = useMotionValue(0);
  const sRotateX = useSpring(rotateX, { stiffness: 160, damping: 18 });
  const sRotateY = useSpring(rotateY, { stiffness: 160, damping: 18 });

  // Parallax — bg moves at a different rate than the card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], isMobile ? ['0%', '0%'] : ['0%', '-18%']);

  // ScrollTrigger entrance
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const st = ScrollTrigger.create({
      trigger: card,
      start: 'top 90%',
      once: true,
      onEnter: () => setEntered(true),
    });
    return () => st.kill();
  }, []);

  // Priority preload for large tier (best-effort LCP assist)
  useEffect(() => {
    if (project.tier !== 'large') return;
    const link = document.createElement('link');
    link.rel  = 'preload';
    link.as   = 'image';
    link.href = project.bgImage;
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, [project.bgImage, project.tier]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left  - rect.width  / 2;
    const cy = e.clientY - rect.top   - rect.height / 2;
    rotateX.set(-(cy / rect.height) * 5);
    rotateY.set( (cx / rect.width)  * 5);

    // Light leak — direct DOM manipulation (zero re-renders)
    if (leakRef.current) {
      const lx = ((e.clientX - rect.left) / rect.width)  * 100;
      const ly = ((e.clientY - rect.top)  / rect.height) * 100;
      leakRef.current.style.background =
        `radial-gradient(circle 220px at ${lx}% ${ly}%, ${project.accentColor}2e 0%, transparent 72%)`;
    }
  };

  const handleLeave = () => {
    rotateX.set(0); rotateY.set(0);
    setHovered(false);
    onMouseLeave();
    if (leakRef.current) leakRef.current.style.background = 'none';
  };

  const isLarge  = project.tier === 'large';
  const isSmall  = project.tier === 'small';
  const rowClass = isLarge ? 'lg:row-span-4' : 'lg:row-span-2';
  const delay    = Math.min(index * 0.08, 0.72);
  const hasLink  = !!project.link;

  const handleCardClick = () => {
    if (hasLink) window.open(project.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      ref={cardRef}
      data-bento-card="true"
      className={`col-span-12 ${project.col} ${rowClass} relative group ${
        isLarge  ? 'min-h-[300px] lg:min-h-[480px]' :
        isSmall  ? 'min-h-[200px] lg:min-h-[220px]' :
                   'min-h-[240px] lg:min-h-[320px]' 
      }`}
      style={isMobile ? {
        cursor: hasLink ? 'crosshair' : 'default',
      } : {
        perspective: 900,
        rotateX: sRotateX,
        rotateY: sRotateY,
        transformStyle: 'preserve-3d',
        cursor: hasLink ? 'crosshair' : 'default',
      }}
      initial={{ opacity: 0, y: 28 }}
      animate={entered ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, delay, ease: EASE }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { setHovered(true); onMouseEnter(); }}
      onMouseLeave={handleLeave}
      onClick={handleCardClick}
    >
      {/* ── Glass shell ────────────────────────────────────────────────────── */}
      <div
        className="relative h-full overflow-hidden flex flex-col"
        style={{
          background: 'rgba(14,14,14,0.35)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '0.5px solid rgba(0,255,156,0.2)',
          boxShadow: hovered
            ? `0 0 0 0.5px rgba(0,255,156,0.75), inset 0 0 50px ${project.glowColor}`
            : 'none',
          transition: 'box-shadow 0.28s ease',
        }}
      >
        {/* Parallax background image */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y: bgY, scale: 1.22, transformOrigin: 'center center' }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${project.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </motion.div>

        {/* Cinematic color overlay */}
        <div className="absolute inset-0" style={{ background: project.bgOverlay }} />

        {/* Mobile extra darkening — ensures text legibility on small screens */}
        <div className="lg:hidden absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,14,14,0.82) 0%, rgba(14,14,14,0.35) 55%, rgba(14,14,14,0.1) 100%)' }} />

        {/* Grain */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            opacity: 0.038,
          }}
        />

        {/* Lens flare light leak (cursor-following, DOM-direct) */}
        <div
          ref={leakRef}
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.25s ease' }}
        />

        {/* Accent top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-px z-20"
          style={{ background: `linear-gradient(to right, transparent, ${project.accentColor}cc, transparent)` }}
        />

        {/* ── Film camera HUD — top-left cluster ──────────────────────────── */}
        <div className="absolute top-3 left-3 z-30 pointer-events-none flex flex-col gap-0.75">
          <span style={{ fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.18em', color: project.accentColor, opacity: 0.78, fontWeight: 700 }}>
            {project.hud.tl}
          </span>
          {/* Data-points — desktop only to avoid mobile clutter */}
          <span className="hidden lg:block" style={{ fontFamily: 'monospace', fontSize: 5, letterSpacing: '0.14em', color: 'rgba(249,255,246,0.3)', fontWeight: 700 }}>
            {project.hud.coord}
          </span>
          <span className="hidden lg:block" style={{ fontFamily: 'monospace', fontSize: 5, letterSpacing: '0.14em', color: 'rgba(249,255,246,0.25)', fontWeight: 700 }}>
            {project.hud.stress}
          </span>
          <span className="hidden lg:block" style={{ fontFamily: 'monospace', fontSize: 5, letterSpacing: '0.14em', color: 'rgba(249,255,246,0.25)', fontWeight: 700 }}>
            {project.hud.deploy}
          </span>
        </div>

        {/* HUD — top-right (desktop only) */}
        {project.hud.tr && (
          <div className="hidden lg:block absolute top-3 right-3 z-30 pointer-events-none text-right">
            <span style={{ fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.18em', color: 'rgba(249,255,246,0.38)', fontWeight: 700 }}>
              {project.hud.tr}
            </span>
          </div>
        )}

        {/* HUD — bottom-left */}
        <div className="hidden sm:block absolute bottom-3 left-3 z-30 pointer-events-none">
          <span style={{ fontFamily: 'monospace', fontSize: 6.5, letterSpacing: '0.16em', color: 'rgba(249,255,246,0.32)', fontWeight: 700 }}>
            {project.hud.bl}
          </span>
        </div>

        {/* HUD — bottom-right (desktop only) */}
        {project.hud.br && (
          <div className="hidden lg:block absolute bottom-3 right-3 z-30 pointer-events-none text-right">
            <span style={{ fontFamily: 'monospace', fontSize: 6.5, letterSpacing: '0.16em', color: 'rgba(249,255,246,0.32)', fontWeight: 700 }}>
              {project.hud.br}
            </span>
          </div>
        )}

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div className={`relative z-30 flex flex-col h-full justify-end ${isLarge ? 'p-5 sm:p-7 lg:p-9' : isSmall ? 'p-4' : 'p-4 sm:p-5 lg:p-6'}`}>

          {/* Sys ID + payload — top anchor (desktop) */}
          <div className="mb-auto pt-6 lg:pt-8">
            <span style={{ fontFamily: 'monospace', fontSize: isSmall ? 6.5 : 8, letterSpacing: '0.22em', color: project.accentColor, opacity: 0.72, fontWeight: 700 }}>
              {project.payload} // {project.status}
            </span>
          </div>

          {/* Bottom content block */}
          <div className="mt-auto">
            {/* Category chip — visible on mobile, replaces sysType block */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-2 py-0.5"
                style={{
                  fontFamily: 'monospace',
                  fontSize: 7,
                  letterSpacing: '0.18em',
                  color: project.accentColor,
                  border: `0.5px solid ${project.accentColor}55`,
                  background: `${project.accentColor}12`,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {project.category}
              </span>
            </div>

            {/* Sys type — desktop only (too verbose for mobile) */}
            <div className="hidden lg:block mb-2">
              <span style={{ fontFamily: 'monospace', fontSize: 6, letterSpacing: '0.18em', color: 'rgba(249,255,246,0.28)', fontWeight: 700 }}>
                {project.sysType}
              </span>
            </div>

            {/* ── Project name — shown on ALL screens ─────────────────────── */}
            <h3
              className="block font-black uppercase tracking-tight leading-none mb-2"
              style={{
                fontFamily: '"Monument Extended","PP Neue Montreal","Inter",sans-serif',
                fontSize: isLarge
                  ? 'clamp(1.5rem,5vw,3rem)'
                  : isSmall
                  ? 'clamp(1rem,4vw,1.25rem)'
                  : 'clamp(1.1rem,4.5vw,1.9rem)',
                color: '#F9FFF6',
                // blend-mode only where background contrast is controlled (desktop)
                mixBlendMode: 'difference',
                textShadow: '0 2px 16px rgba(0,0,0,0.7)',
              }}
            >
              <GlitchTitle text={project.name} entered={entered} isFault={isFault} />
            </h3>

            {/* Technical insight */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={entered ? { opacity: 1 } : {}}
              transition={{ duration: 0.45, delay: delay + 0.22, ease: EASE }}
              className="mb-2"
              style={{
                fontFamily: 'monospace',
                fontSize: isSmall ? 7 : 8,
                letterSpacing: '0.1em',
                color: project.accentColor,
                opacity: 0.92,
                fontWeight: 700,
              }}
            >
              ↗ {project.insight}
            </motion.p>

            {/* Tagline — show on medium+ on mobile, always on desktop */}
            {(!isSmall) && (
              <p
                className="text-xs leading-relaxed mb-3 hidden sm:block"
                style={{ fontFamily: 'monospace', color: 'rgba(249,255,246,0.42)', maxWidth: isLarge ? '40rem' : '26rem' }}
              >
                {project.tagline}
              </p>
            )}

            {/* Stack pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {project.stack.slice(0, isSmall ? 2 : 4).map((tech) => (
                <span key={tech} className="px-1.5 py-0.5" style={{
                  fontFamily: 'monospace',
                  fontSize: isSmall ? 6.5 : 7.5,
                  letterSpacing: '0.16em',
                  color: project.accentColor,
                  border: `0.5px solid ${project.accentColor}55`,
                  background: `${project.accentColor}0c`,
                  fontWeight: 700,
                }}>
                  {tech}
                </span>
              ))}
              <span className="ml-auto" style={{ fontFamily: 'monospace', fontSize: 6.5, letterSpacing: '0.14em', color: 'rgba(249,255,246,0.18)', fontWeight: 700 }}>
                {project.engine}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom sweep line on entrance */}
        {/* Visit site badge — fades in on hover when link exists */}
        {hasLink && (
          <motion.div
            className="absolute top-3 right-3 z-40 pointer-events-none hidden lg:flex items-center gap-1.5"
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -4 }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{
              background: 'rgba(10,10,10,0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `0.5px solid ${project.accentColor}55`,
              padding: '4px 8px',
            }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 6.5, letterSpacing: '0.18em', color: project.accentColor, fontWeight: 700, whiteSpace: 'nowrap' }}>
              VISIT_SITE
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 8, color: project.accentColor }}>↗</span>
          </motion.div>
        )}

        {/* Bottom sweep line on entrance */}
        <motion.div
          className="absolute bottom-0 left-0 h-px z-30"
          style={{ background: project.accentColor, opacity: 0.45 }}
          initial={{ width: '0%' }}
          animate={entered ? { width: '100%' } : {}}
          transition={{ duration: 0.9, delay: delay + 0.3, ease: EASE }}
        />
      </div>
    </motion.div>
  );
}

// ─── Mobile sticky section header ────────────────────────────────────────────
function MobileStickyHeader() {
  return (
    <div
      className="lg:hidden sticky top-0 z-40 col-span-12 py-3 px-1"
      style={{
        background: 'rgba(26,26,26,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '0.5px solid rgba(0,255,156,0.12)',
      }}
    >
      <p style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.28em', color: '#00FF9C', fontWeight: 700 }}>
        MODULE_03 // PROJECT_SHOWCASE
      </p>
      <h2
        className="text-2xl font-black uppercase tracking-tight leading-none mt-1"
        style={{ fontFamily: '"Monument Extended","Inter",sans-serif', color: '#F9FFF6' }}
      >
        SELECT{' '}
        <span style={{ WebkitTextStroke: '1px rgba(249,255,246,0.3)', color: 'transparent' }}>
          PROJECTS
        </span>
      </h2>
    </div>
  );
}

// ─── Desktop section header ───────────────────────────────────────────────────
function DesktopHeader({ entered }: { entered: boolean }) {
  return (
    <div className="hidden lg:flex col-span-12 items-end justify-between pb-6 border-b"
      style={{ borderColor: 'rgba(0,255,156,0.1)' }}>
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.3em', color: '#00FF9C', fontWeight: 700 }}
          className="mb-2 uppercase"
        >
          MODULE_03 // PROJECT_SHOWCASE
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={entered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
          className="font-black uppercase tracking-tight leading-none"
          style={{ fontFamily: '"Monument Extended","PP Neue Montreal","Inter",sans-serif', fontSize: 'clamp(3rem,6vw,5.5rem)', color: '#F9FFF6' }}
        >
          SELECT{' '}
          <span style={{ WebkitTextStroke: '1.5px rgba(249,255,246,0.32)', color: 'transparent' }}>
            PROJECTS
          </span>
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        className="flex flex-col items-end gap-1"
        style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(249,255,246,0.2)' }}
      >
        <span>SYS_REF: BENTO_v3.0</span>
        <span>MODULES: 12_LOADED</span>
        <span>STATUS: ALL_DEPLOYED</span>
      </motion.div>
    </div>
  );
}

// ─── ProjectBento ─────────────────────────────────────────────────────────────
export function ProjectBento() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const isMobile   = useIsMobile();
  const [sectionEntered, setSectionEntered] = useState(false);
  const [cursorActive,   setCursorActive]   = useState(false);
  const [isSystemFault,  setIsSystemFault]  = useState(false);

  // Refs are stable across renders — safe to use inside GSAP callbacks
  const faultActiveRef = useRef(false);
  const faultTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Section entrance trigger
    const entryTrigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => setSectionEntered(true),
    });

    // Capture baseline Lenis duration so we can restore it on recovery
    const baseDuration: number = (lenisInstance.current as any)?.options?.duration ?? 1.2;

    const recover = () => {
      faultActiveRef.current = false;
      setIsSystemFault(false);
      const l = lenisInstance.current as any;
      if (l?.options) l.options.duration = baseDuration;
      faultTimerRef.current = null;
    };

    // Velocity-based grid skew + fault detection — desktop only
    if (isMobile) return () => { entryTrigger.kill(); };

    const skewTrigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const vel    = self.getVelocity();
        const absVel = Math.abs(vel);

        // Skew distortion (existing)
        const skew = Math.max(-3.5, Math.min(3.5, vel / -7500));
        gsap.to(gridRef.current, {
          skewY: skew,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
        });

        // ── Fault detection ──────────────────────────────────────────────────
        if (absVel > CRITICAL_VELOCITY) {
          if (!faultActiveRef.current) {
            faultActiveRef.current = true;
            setIsSystemFault(true);
            // Make Lenis feel heavy — duration is read per scroll-call
            const l = lenisInstance.current as any;
            if (l?.options) l.options.duration = 3.5;
          }
          // Debounce recovery: reset timer on each new high-velocity frame
          if (faultTimerRef.current) clearTimeout(faultTimerRef.current);
          faultTimerRef.current = setTimeout(recover, 700);
        }
      },
    });

    return () => {
      if (faultTimerRef.current) clearTimeout(faultTimerRef.current);
      entryTrigger.kill();
      skewTrigger.kill();
    };
  }, [isMobile]);

  return (
    <>
      <AuditProgressBar sectionRef={sectionRef} isSystemFault={isSystemFault} />
      {!isMobile && <BentoCursor active={cursorActive} />}

      <section
        ref={sectionRef}
        className="relative w-full py-20 lg:py-28 px-4 sm:px-6 lg:px-10 xl:px-14"
        style={{
          background: '#0E0E0E',
          cursor: cursorActive ? 'none' : 'auto',
          // Fast onset (0.18s) → alarming. Slow recovery (0.5s) → deliberate reboot feel.
          filter: isSystemFault ? 'hue-rotate(90deg) contrast(1.2)' : 'none',
          transition: isSystemFault ? 'filter 0.18s ease' : 'filter 0.5s ease',
        }}
        onMouseEnter={() => setCursorActive(true)}
        onMouseLeave={() => setCursorActive(false)}
      >
        {/* Section grain */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
            opacity: 0.04,
          }}
        />

        <div className="relative z-10 max-w-360 mx-auto">
          <div
            ref={gridRef}
            className="grid grid-cols-12 gap-3 sm:gap-4"
            style={{ gridAutoRows: 'auto', willChange: 'transform' }}
          >
            <MobileStickyHeader />
            <DesktopHeader entered={sectionEntered} />

            {PROJECTS.map((project, i) => {
              const prev = PROJECTS[i - 1];
              const isDiscoveryStart = prev && prev.tier !== 'small' && project.tier === 'small';
              const isBaseStart      = prev && prev.tier === 'small'  && project.tier !== 'small';
              return (
                <React.Fragment key={project.id}>
                  {isDiscoveryStart && (
                    <div className="col-span-12 h-10 lg:h-14" />
                  )}
                  {isBaseStart && (
                    <div className="col-span-12 h-10 lg:h-14" />
                  )}
                  <BentoCard
                    project={project}
                    index={i}
                    onMouseEnter={() => setCursorActive(true)}
                    onMouseLeave={() => setCursorActive(false)}
                    isFault={isSystemFault}
                    isMobile={isMobile}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
