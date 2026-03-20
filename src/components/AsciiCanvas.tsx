'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '@/lib/shaders';

// ─── Scene (inside Canvas, inside Suspense) ──────────────────────────────────
function AsciiPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size, gl } = useThree();

  // Set renderer background to charcoal
  useEffect(() => {
    gl.setClearColor('#1A1A1A', 1);
  }, [gl]);

  // useTexture suspends until the image is ready — no async state needed
  const texture = useTexture('/sage.png');
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Aspect ratio from the actual image so the face isn't stretched
  const imgW   = (texture.image as HTMLImageElement)?.naturalWidth  ?? 1;
  const imgH   = (texture.image as HTMLImageElement)?.naturalHeight ?? 1;
  const aspect = imgW / imgH;

  // Canvas-relative mouse → shader UV
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!matRef.current) return;
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      matRef.current.uniforms.uMouse.value.set(
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      );
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Per-frame: update time uniform for character jitter
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (matRef.current) {
      matRef.current.uniforms.uResolution.value.set(size.width, size.height);
      matRef.current.uniforms.uTime.value = t;
    }
  });

  // Plane height = full viewport, width respects image aspect ratio
  const planeH = viewport.height;
  const planeW = planeH * aspect;

  return (
    <mesh ref={meshRef}>
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
          uResolution:    { value: new THREE.Vector2(size.width, size.height) },
          uColorMuted:    { value: new THREE.Vector3(0.239, 0.016, 0.0) },      // #3D0500
          uColorActive:   { value: new THREE.Vector3(0.682, 0.047, 0.0) },      // #AE0C00
          uColorIgnition: { value: new THREE.Vector3(1.0, 0.35, 0.12) },        // #FF5A1F
          uHoverRadius:   { value: 0.18 },
          uContrast:      { value: 1.9 },
          uTime:          { value: 0 },
        }}
      />
    </mesh>
  );
}

// ─── Canvas wrapper ───────────────────────────────────────────────────────────
export function AsciiCanvas() {
  return (
    <Canvas
      className="w-full h-full"
      camera={{ position: [0, 0, 1], fov: 75, near: 0.01, far: 10 }}
      gl={{ antialias: false, toneMapping: THREE.NoToneMapping, alpha: false }}
    >
      <Suspense fallback={null}>
        <AsciiPlane />
      </Suspense>

      {/* Bloom — only fires on the ignition pixels (luma > 0.45) */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.40} luminanceSmoothing={0.04} intensity={2.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
