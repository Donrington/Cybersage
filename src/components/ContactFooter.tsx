'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_DISPLAY = '"Monument Extended","PP Neue Montreal","Inter",sans-serif';
const FONT_MONO    = '"JetBrains Mono","IBM Plex Mono",monospace';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMERALD  = '#00FF9C';
const FLAME    = '#FF5A1F';
const DEEP_RED = '#AE0C00';

// ─── Data ─────────────────────────────────────────────────────────────────────
const TX_LINES = [
  'INITIALIZING_UPLINK_SEQUENCE...',
  'AUTHENTICATING_BIOMETRIC_SIGNATURE...',
  'ENCRYPTING_PAYLOAD...',
  'ROUTING_THROUGH_SECURE_CHANNEL...',
  'BYPASSING_FIREWALL...',
  'ESTABLISHING_SECURE_TUNNEL...',
  'HANDSHAKE_COMPLETE // STATUS: 200_OK',
];

const SOCIAL_LINKS = [
  { dir: '/LINKEDIN', href: 'https://www.linkedin.com/in/carrington-abakwe-b0b0a0217', label: 'LinkedIn' },
  { dir: '/GITHUB',   href: 'https://github.com/Donrington',                           label: 'GitHub'   },
  { dir: '/X',        href: 'https://x.com/CarlSwitch_CHUG',                           label: 'X'        },
  { dir: '/EMAIL',    href: 'mailto:carryoby@gmail.com',                               label: 'Email'    },
];

// ─── Lagos clock ──────────────────────────────────────────────────────────────
function useLagosTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      }).format(new Date());
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ─── Blinking caret ───────────────────────────────────────────────────────────
function BlinkingCaret({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!active) { setVisible(true); return; }
    const id = setInterval(() => setVisible(v => !v), 530);
    return () => clearInterval(id);
  }, [active]);
  return (
    <span style={{
      color: EMERALD, opacity: visible ? 1 : 0,
      fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700,
      transition: 'opacity 0.05s step-start', lineHeight: 1,
      display: 'inline-block', width: 8,
    }}>_</span>
  );
}

// ─── CLI Input ────────────────────────────────────────────────────────────────
function CLIInput({
  label, value, onChange, multiline, placeholder, validate,
}: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; placeholder?: string; validate?: (v: string) => boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const isValid    = !validate || validate(value);
  const isError    = touched && !isValid;
  const borderColor = isError ? DEEP_RED : focused ? EMERALD : 'rgba(249,255,246,0.1)';
  const labelColor  = isError ? DEEP_RED : focused ? EMERALD : 'rgba(249,255,246,0.35)';
  const statusLabel = isError ? 'ERR: INVALID_INPUT' : focused ? 'FIELD_ACTIVE' : 'STANDBY';
  const statusColor = isError ? DEEP_RED : focused ? EMERALD : 'rgba(249,255,246,0.14)';

  const inputStyle: React.CSSProperties = {
    background: 'transparent', border: 'none', outline: 'none',
    color: 'rgba(249,255,246,0.88)', fontFamily: FONT_MONO,
    fontSize: 13, letterSpacing: '0.04em', lineHeight: 1.6,
    width: '100%', padding: 0, resize: 'none',
    caretColor: isError ? DEEP_RED : EMERALD,
    minHeight: multiline ? 80 : undefined, display: 'block',
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{
          fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.28em',
          color: labelColor, fontWeight: 700, transition: 'color 0.2s ease',
        }}>
          {label}
        </span>
        <BlinkingCaret active={focused} />
      </div>

      <div style={{
        position: 'relative', padding: '10px 14px',
        border: `0.5px solid ${borderColor}`,
        transition: 'border-color 0.2s ease, background 0.2s ease',
        background: focused ? 'rgba(0,255,156,0.018)' : 'rgba(255,255,255,0.01)',
        minHeight: 48,
      }}>
        {/* Corner ticks */}
        <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: `1px solid ${borderColor}`, borderLeft: `1px solid ${borderColor}`, transition: 'border-color 0.2s ease' }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}`, transition: 'border-color 0.2s ease' }} />

        {/* Float status label */}
        <div style={{
          position: 'absolute', top: -8, right: 12,
          fontFamily: FONT_MONO, fontSize: 5.5, letterSpacing: '0.18em',
          color: statusColor, fontWeight: 700, background: '#060606',
          padding: '0 5px', transition: 'color 0.2s ease',
        }}>
          {statusLabel}
        </div>

        {multiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setTouched(true); }}
            placeholder={placeholder}
            rows={4}
            className="cli-textarea"
            style={inputStyle}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setTouched(true); }}
            placeholder={placeholder}
            className="cli-input"
            style={inputStyle}
          />
        )}
      </div>
    </div>
  );
}

// ─── Fingerprint SVG ──────────────────────────────────────────────────────────
function FingerprintSVG({ color }: { color: string }) {
  return (
    <svg width="60" height="72" viewBox="0 0 64 76" fill="none" aria-hidden="true">
      <path d="M32 40V33"                                                      stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 44 Q24 35 26 27 Q30 16 32 16 Q34 16 38 27 Q40 35 38 44"  stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M20 50 Q16 38 18 24 Q22 8 32 6 Q42 8 46 24 Q48 38 44 50"     stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M14 56 Q8 42 10 22 Q14 2 32 0 Q50 2 54 22 Q56 42 50 56"      stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M8 64 Q4 53 4 40"                                               stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M56 64 Q60 53 60 40"                                            stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 64 Q18 74 32 76 Q46 74 56 64"                               stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M28 36 Q27 29 32 27 Q37 29 36 36"                              stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ─── Biometric Submit Button ──────────────────────────────────────────────────
function BiometricButton({ onSubmit, disabled }: { onSubmit: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false);
  const accentColor = disabled
    ? 'rgba(249,255,246,0.15)'
    : hovered ? EMERALD : 'rgba(249,255,246,0.35)';
  const borderColor = disabled
    ? 'rgba(249,255,246,0.06)'
    : hovered ? `${EMERALD}44` : 'rgba(249,255,246,0.1)';

  return (
    <motion.div
      animate={disabled ? {} : {
        scale: [1, 1.018, 1],
        boxShadow: [`0 0 0px ${EMERALD}00`, `0 0 28px ${EMERALD}1A`, `0 0 0px ${EMERALD}00`],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ display: 'inline-block' }}
    >
      <button
        type="button"
        onClick={disabled ? undefined : onSubmit}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          width: 'clamp(160px, 22vw, 220px)',
          aspectRatio: '1 / 1',
          background: hovered && !disabled ? 'rgba(0,255,156,0.04)' : 'rgba(12,12,12,0.72)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: `0.5px solid ${borderColor}`,
          cursor: disabled ? 'not-allowed' : 'crosshair',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 14, padding: 24,
          transition: 'background 0.25s ease, border-color 0.25s ease',
        }}
      >
        {/* Laser sweep */}
        <AnimatePresence>
          {hovered && !disabled && (
            <motion.div
              key="laser"
              initial={{ top: '0%' }}
              animate={{ top: ['0%', 'calc(100% - 1px)', '0%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', left: 0, right: 0, height: 1,
                background: `linear-gradient(to right, transparent, ${FLAME}CC, ${FLAME}, ${FLAME}CC, transparent)`,
                boxShadow: `0 0 10px ${FLAME}88`,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        {/* Corner accents */}
        {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
          <div key={c} style={{
            position: 'absolute',
            top:    c[0] === 't' ? 0 : 'auto',
            bottom: c[0] === 'b' ? 0 : 'auto',
            left:   c[1] === 'l' ? 0 : 'auto',
            right:  c[1] === 'r' ? 0 : 'auto',
            width: 14, height: 14,
            borderTop:    c[0] === 't' ? `1px solid ${accentColor}` : 'none',
            borderBottom: c[0] === 'b' ? `1px solid ${accentColor}` : 'none',
            borderLeft:   c[1] === 'l' ? `1px solid ${accentColor}` : 'none',
            borderRight:  c[1] === 'r' ? `1px solid ${accentColor}` : 'none',
            transition: 'border-color 0.25s ease',
          }} />
        ))}

        {/* Fingerprint */}
        <div style={{ opacity: hovered && !disabled ? 0.6 : 0.2, transition: 'opacity 0.25s ease' }}>
          <FingerprintSVG color={disabled ? 'rgba(249,255,246,0.3)' : EMERALD} />
        </div>

        {/* Label */}
        <div style={{
          fontFamily: FONT_MONO, fontSize: 6.5, letterSpacing: '0.2em',
          color: accentColor, fontWeight: 700, textAlign: 'center',
          whiteSpace: 'nowrap', transition: 'color 0.25s ease',
        }}>
          {disabled ? 'IDENTITY_UNVERIFIED' : 'BIOMETRIC_TRANSMIT'}
        </div>

        {/* Inner grain */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }} />
      </button>
    </motion.div>
  );
}

// ─── Transmission Log ─────────────────────────────────────────────────────────
function TransmissionLog({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done,  setDone]  = useState(false);
  const onCompleteRef     = useRef(onComplete);
  onCompleteRef.current   = onComplete;

  useEffect(() => {
    let cancelled = false;
    let idx = 0;
    const schedule = () => {
      if (cancelled) return;
      if (idx < TX_LINES.length) {
        const line = TX_LINES[idx++];
        setLines(prev => [...prev, line]);
        setTimeout(schedule, 260 + Math.random() * 190);
      } else {
        setTimeout(() => {
          if (!cancelled) {
            setDone(true);
            setTimeout(() => { if (!cancelled) onCompleteRef.current(); }, 2400);
          }
        }, 360);
      }
    };
    setTimeout(schedule, 220);
    return () => { cancelled = true; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      style={{ fontFamily: FONT_MONO, minHeight: 300, paddingTop: 8 }}
    >
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{
            fontSize: 9.5, letterSpacing: '0.16em',
            color: (line.includes('COMPLETE') || line.includes('200_OK'))
              ? EMERALD : 'rgba(249,255,246,0.5)',
            marginBottom: 9,
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <span style={{ color: EMERALD, opacity: 0.45, flexShrink: 0 }}>{'>'}</span>
          {line}
        </motion.div>
      ))}

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{ marginTop: 36 }}
          >
            <div style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(20px, 3.5vw, 40px)',
              fontWeight: 900, color: EMERALD,
              letterSpacing: '-0.02em', lineHeight: 1.08,
              textShadow: `0 0 48px ${EMERALD}44`,
            }}>
              CONNECTION_ESTABLISHED
            </div>
            <div style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 'clamp(14px, 2.5vw, 24px)',
              fontWeight: 900, color: 'rgba(249,255,246,0.32)',
              letterSpacing: '-0.02em', marginTop: 6,
            }}>
              // UPLINK_SUCCESS
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── ContactFooter ────────────────────────────────────────────────────────────
export function ContactFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const isMobile   = useIsMobile();

  const [entered,   setEntered]   = useState(false);
  const [name,      setName]      = useState('');
  const [subject,   setSubject]   = useState('');
  const [payload,   setPayload]   = useState('');
  const [formState, setFormState] = useState<'idle' | 'transmitting' | 'complete'>('idle');

  const lagosTime   = useLagosTime();
  const isFormValid = name.trim().length >= 2 && subject.trim().length >= 3 && payload.trim().length >= 10;

  // ── Z-axis push reveal ─────────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const wrap    = wrapRef.current;
    if (!section || !wrap) return;

    const entry = ScrollTrigger.create({
      trigger: section, start: 'top 82%', once: true,
      onEnter: () => setEntered(true),
    });

    const tween = gsap.fromTo(
      wrap,
      { scale: 0.96, opacity: 0, y: 36 },
      {
        scale: 1, opacity: 1, y: 0, ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end:   'top 18%',
          scrub: 0.7,
        },
      }
    );

    return () => { entry.kill(); tween.kill(); };
  }, []);

  return (
    <footer
      ref={sectionRef}
      style={{ position: 'relative', width: '100%', background: '#060606', overflow: 'hidden' }}
    >
      {/* ── Atmospheric gradients — static on mobile, animated on desktop ── */}
      {isMobile ? (
        <>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 75% 55% at 20% 60%, rgba(0,255,156,0.05) 0%, transparent 65%)', opacity: 0.75 }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 75% 55% at 80% 40%, rgba(0,255,156,0.04) 0%, transparent 65%)', opacity: 0.7 }} />
        </>
      ) : (
        <>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 75% 55% at 20% 60%, rgba(0,255,156,0.05) 0%, transparent 65%)' }}
          />
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 75% 55% at 80% 40%, rgba(0,255,156,0.04) 0%, transparent 65%)' }}
          />
        </>
      )}

      {/* ── CRT scanlines ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 4px)',
      }} />

      {/* ── Grain overlay ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.05,
      }} />

      {/* ── "DIGITAL WISDOM" watermark ────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }}>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(68px, 15vw, 196px)',
          fontWeight: 900, color: 'rgba(249,255,246,0.028)',
          letterSpacing: '-0.04em', whiteSpace: 'nowrap',
          userSelect: 'none', lineHeight: 1,
        }}>
          DIGITAL WISDOM
        </div>
      </div>

      {/* ── Top separator ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 2,
        background: 'linear-gradient(to right, transparent, rgba(0,255,156,0.18), transparent)',
      }} />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div ref={wrapRef} style={{ position: 'relative', zIndex: 10 }}>
        <div
          className="max-w-360 mx-auto px-4 sm:px-6 lg:px-10 xl:px-14"
          style={{ paddingTop: 'clamp(64px,10vw,120px)', paddingBottom: 'clamp(48px,8vw,96px)' }}
        >
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24">

            {/* ─── LEFT: CLI Terminal ────────────────────────────────────── */}
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={entered ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, ease: EASE }}
                style={{
                  fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.3em',
                  color: EMERALD, fontWeight: 700, marginBottom: 16,
                }}
              >
                MODULE_05 // SECURE_UPLINK
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                animate={entered ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 'clamp(34px, 5.5vw, 70px)',
                  fontWeight: 900, color: '#F9FFF6',
                  letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 40,
                }}
              >
                ESTABLISH{' '}
                <span style={{ WebkitTextStroke: '1.5px rgba(249,255,246,0.28)', color: 'transparent' }}>
                  CONTACT
                </span>
              </motion.h2>

              {/* ── Form / Transmission states ─────────────────────────── */}
              <AnimatePresence mode="wait">
                {formState === 'idle' && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.32, ease: EASE }}
                  >
                    <CLIInput
                      label="USER_IDENTITY:"
                      value={name}
                      onChange={setName}
                      placeholder="ENTER_OPERATOR_NAME"
                      validate={v => v.trim().length >= 2}
                    />
                    <CLIInput
                      label="UPLINK_SUBJECT:"
                      value={subject}
                      onChange={setSubject}
                      placeholder="DEFINE_MISSION_OBJECTIVE"
                      validate={v => v.trim().length >= 3}
                    />
                    <CLIInput
                      label="DATA_PAYLOAD:"
                      value={payload}
                      onChange={setPayload}
                      multiline
                      placeholder="ENTER_ENCRYPTED_MESSAGE_DATA"
                      validate={v => v.trim().length >= 10}
                    />
                    <div style={{ marginTop: 8 }}>
                      <BiometricButton
                        onSubmit={() => setFormState('transmitting')}
                        disabled={!isFormValid}
                      />
                    </div>
                  </motion.div>
                )}

                {formState === 'transmitting' && (
                  <motion.div
                    key="tx"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.32, ease: EASE }}
                  >
                    <TransmissionLog onComplete={() => setFormState('complete')} />
                  </motion.div>
                )}

                {formState === 'complete' && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.55, ease: EASE }}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'flex-start', gap: 14,
                      paddingTop: 16, minHeight: 300,
                    }}
                  >
                    <div style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 'clamp(22px, 4vw, 52px)',
                      fontWeight: 900, color: EMERALD,
                      letterSpacing: '-0.02em', lineHeight: 1.05,
                      textShadow: `0 0 48px ${EMERALD}44`,
                    }}>
                      CONNECTION<br />ESTABLISHED
                    </div>
                    <div style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 'clamp(14px, 2.8vw, 28px)',
                      fontWeight: 900, color: 'rgba(249,255,246,0.32)',
                      letterSpacing: '-0.02em',
                    }}>
                      // UPLINK_SUCCESS
                    </div>
                    <div style={{
                      fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.2em',
                      color: 'rgba(249,255,246,0.18)', marginTop: 8, lineHeight: 1.9,
                    }}>
                      <div>MESSAGE_ENCRYPTED // DELIVERY_CONFIRMED</div>
                      <div>OPERATOR_NOTIFIED // ETA: 24_HOURS</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── RIGHT: System HUD ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={entered ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
              style={{
                display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-start', gap: 32, paddingTop: 4,
              }}
            >
              {/* Online status */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                border: '0.5px solid rgba(0,255,156,0.14)',
                background: 'rgba(0,255,156,0.025)',
              }}>
                <motion.div
                  animate={{ opacity: [1, 0.28, 1], scale: [1, 0.8, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: EMERALD, boxShadow: `0 0 8px ${EMERALD}`,
                    flexShrink: 0,
                  }}
                />
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 8, letterSpacing: '0.2em',
                  color: EMERALD, fontWeight: 700,
                }}>
                  STATUS: ONLINE_FOR_PROJECTS
                </span>
              </div>

              {/* Lagos clock */}
              <div style={{
                padding: '14px 16px',
                border: '0.5px solid rgba(249,255,246,0.07)',
                background: 'rgba(255,255,255,0.01)',
              }}>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 6.5, letterSpacing: '0.22em',
                  color: 'rgba(249,255,246,0.22)', fontWeight: 700, marginBottom: 8,
                }}>
                  TERMINAL_CLOCK // LAGOS, NG (WAT)
                </div>
                <div style={{
                  fontFamily: FONT_MONO,
                  fontSize: 'clamp(28px, 4.5vw, 48px)',
                  color: 'rgba(249,255,246,0.82)',
                  fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1,
                }}>
                  {lagosTime || '00:00:00'}
                </div>
              </div>

              {/* Operator metadata */}
              <div style={{
                fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.2em',
                fontWeight: 700, lineHeight: 1.9,
              }}>
                <div style={{ color: 'rgba(249,255,246,0.22)' }}>SYS_OPERATOR: ABAKWE.CARRINGTON</div>
                <div style={{ color: 'rgba(249,255,246,0.18)' }}>VERSION: v2.0.26</div>
                <div style={{ color: 'rgba(255,90,31,0.45)' }}>LOCATION: LAGOS_TERMINAL_NG</div>
              </div>

              {/* Social directories */}
              <div>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.22em',
                  color: 'rgba(249,255,246,0.18)', fontWeight: 700, marginBottom: 14,
                }}>
                  SOCIAL_DIRECTORIES
                </div>
                {SOCIAL_LINKS.map((link, i) => (
                  <motion.a
                    key={link.dir}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 14 }}
                    animate={entered ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.45, delay: 0.32 + i * 0.08, ease: EASE }}
                    whileHover={{ x: 6 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0',
                      borderBottom: '0.5px solid rgba(249,255,246,0.05)',
                      textDecoration: 'none', cursor: 'crosshair',
                    }}
                  >
                    <span style={{
                      fontFamily: FONT_MONO, fontSize: 7, letterSpacing: '0.12em',
                      color: 'rgba(249,255,246,0.18)', fontWeight: 700,
                    }}>
                      DIR:
                    </span>
                    <span style={{
                      fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.18em',
                      color: 'rgba(249,255,246,0.6)', fontWeight: 700, flex: 1,
                    }}>
                      {link.dir}
                    </span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: `${EMERALD}55` }}>
                      ↗
                    </span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── System footer bar ─────────────────────────────────────────────── */}
        <div style={{
          borderTop: '0.5px solid rgba(0,255,156,0.07)',
          padding: 'clamp(14px, 2.5vw, 22px) clamp(16px, 6vw, 56px)',
        }}>
          <div style={{
            maxWidth: 1440, margin: '0 auto',
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <span style={{
              fontFamily: FONT_MONO, fontSize: 6.5, letterSpacing: '0.18em',
              color: 'rgba(249,255,246,0.12)', fontWeight: 700,
            }}>
              © 2026 CYBERSAGE_v2 // ALL_RIGHTS_RESERVED
            </span>
            <span style={{
              fontFamily: FONT_MONO, fontSize: 6.5, letterSpacing: '0.18em',
              color: 'rgba(0,255,156,0.22)', fontWeight: 700,
            }}>
              SYS_OPERATOR: ABAKWE.CARRINGTON // v2.0.26
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
