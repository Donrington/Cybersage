'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '@/lib/shaders';

// ─── AsciiInner (runs inside Canvas) ─────────────────────────────────────────
// All rendering is driven by a plain requestAnimationFrame loop.
// Uniforms are updated directly (no useFrame). The EffectComposer is rendered
// via a forwarded ref so we never depend on R3F's frame scheduler — the canvas
// keeps animating regardless of scroll position or visibility.
function AsciiInner() {
  const matRef      = useRef<THREE.ShaderMaterial>(null);
  const composerRef = useRef<{ render: (delta: number) => void } | null>(null);
  const { viewport, gl, scene, camera } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture imperatively — no Suspense boundary that can re-fire
  useEffect(() => {
    // alpha:true canvas → clear to fully transparent so the CSS #1A1A1A
    // background on the wrapper shows through, guaranteeing an exact color match
    // regardless of the EffectComposer's output color-space pipeline.
    gl.setClearColor(0x000000, 0);
    new THREE.TextureLoader().load('/sage.png', (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setTexture(tex);
    });
  }, [gl]);

  // Canvas-relative mouse → shader UV
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: MouseEvent) => {
      if (!matRef.current) return;
      const rect = el.getBoundingClientRect();
      matRef.current.uniforms.uMouse.value.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      );
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [gl]);

  // ── The render loop ──────────────────────────────────────────────────────
  // Uses requestAnimationFrame directly — NOT R3F's advance/useFrame/invalidate.
  // RAF fires at 60fps regardless of whether the canvas is in the viewport.
  // We render by calling composerRef.current.render() (the postprocessing
  // EffectComposer instance), which drives Bloom + base scene in one call.
  useEffect(() => {
    let rafId: number;
    let startTime = -1;
    let prevTime  = -1;

    const tick = (time: number) => {
      if (startTime < 0) startTime = time;
      const elapsed = (time - startTime) / 1000;
      const delta   = prevTime < 0 ? 1 / 60 : (time - prevTime) / 1000;
      prevTime = time;

      // Update uniforms directly — no useFrame subscriber needed
      if (matRef.current) {
        matRef.current.uniforms.uTime.value       = elapsed;
        matRef.current.uniforms.uResolution.value.set(
          gl.domElement.clientWidth,
          gl.domElement.clientHeight,
        );
      }

      // Render: EffectComposer (Bloom) if ready, else bare gl.render fallback
      if (composerRef.current) {
        composerRef.current.render(delta);
      } else {
        gl.render(scene, camera);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [gl, scene, camera]);

  const aspect = texture
    ? ((texture.image as HTMLImageElement)?.naturalWidth  ?? 1) /
      ((texture.image as HTMLImageElement)?.naturalHeight ?? 1)
    : 1;
  const planeH = viewport.height;
  const planeW = planeH * aspect;

  return (
    <>
      {texture && (
        <mesh>
          <planeGeometry args={[planeW, planeH]} />
          <shaderMaterial
            ref={matRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            side={THREE.DoubleSide}
            uniforms={{
              uTexture:       { value: texture },
              uMouse:         { value: new THREE.Vector2(-5, -5) },
              uResolution:    { value: new THREE.Vector2(gl.domElement.clientWidth, gl.domElement.clientHeight) },
              uColorMuted:    { value: new THREE.Vector3(0.239, 0.016, 0.0) },
              uColorActive:   { value: new THREE.Vector3(0.682, 0.047, 0.0) },
              uColorIgnition: { value: new THREE.Vector3(1.0, 0.35, 0.12) },
              uHoverRadius:   { value: 0.18 },
              uContrast:      { value: 2.1 },
              uTime:          { value: 0 },
            }}
          />
        </mesh>
      )}

      {/* ref gives direct access to composer.render() for our RAF loop */}
      <EffectComposer ref={composerRef as any}>
        <Bloom luminanceThreshold={0.38} luminanceSmoothing={0.03} intensity={2.8} mipmapBlur />
      </EffectComposer>
    </>
  );
}

// ─── HUD overlays ─────────────────────────────────────────────────────────────
function CanvasHUD() {
  return (
    <>
      {(['tl','tr','bl','br'] as const).map((c) => (
        <div
          key={c}
          className="absolute pointer-events-none z-20 hidden lg:block"
          style={{
            width: 22, height: 22,
            top:    c[0] === 't' ? 16 : 'auto',
            bottom: c[0] === 'b' ? 44 : 'auto',
            left:   c[1] === 'l' ? 16 : 'auto',
            right:  c[1] === 'r' ? 16 : 'auto',
            borderTop:    c[0] === 't' ? '1px solid rgba(174,12,0,0.6)'  : 'none',
            borderBottom: c[0] === 'b' ? '1px solid rgba(174,12,0,0.6)'  : 'none',
            borderLeft:   c[1] === 'l' ? '1px solid rgba(174,12,0,0.6)'  : 'none',
            borderRight:  c[1] === 'r' ? '1px solid rgba(174,12,0,0.6)'  : 'none',
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute top-9 left-10 pointer-events-none z-20 hidden lg:flex flex-col gap-0.5"
        style={{ fontFamily: 'monospace', fontSize: 5.5, letterSpacing: '0.22em', fontWeight: 700, lineHeight: 1.9 }}
      >
        <div style={{ color: 'rgba(255,90,31,0.5)' }}>ASCII_RENDER_CORE</div>
        <div style={{ color: 'rgba(174,12,0,0.42)' }}>FRAME_LOOP: LIVE</div>
        <div style={{ color: 'rgba(255,90,31,0.28)' }}>SHADER: GLSL_v3.0</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-14 right-6 pointer-events-none z-20 hidden lg:flex flex-col gap-0.5 text-right"
        style={{ fontFamily: 'monospace', fontSize: 5.5, letterSpacing: '0.22em', fontWeight: 700, lineHeight: 1.9 }}
      >
        <div style={{ color: 'rgba(174,12,0,0.4)' }}>BLOOM: ACTIVE</div>
        <div style={{ color: 'rgba(255,90,31,0.32)' }}>DENSITY: 300×300</div>
        <div style={{ color: 'rgba(174,12,0,0.25)' }}>JITTER: ENABLED</div>
      </motion.div>

      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse 75% 80% at 55% 45%, transparent 35%, rgba(26,26,26,0.65) 100%)',
        }}
      />
    </>
  );
}

// ─── AsciiCanvas (exported) ───────────────────────────────────────────────────
export function AsciiCanvas() {
  return (
    <div
      className="relative w-full h-full"
      style={{ background: '#1A1A1A', willChange: 'transform', transform: 'translateZ(0)' }}
    >
      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 0, 1], fov: 75, near: 0.01, far: 10 }}
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping, alpha: true }}
        frameloop="never"
      >
        <AsciiInner />
      </Canvas>

      <CanvasHUD />
    </div>
  );
}
