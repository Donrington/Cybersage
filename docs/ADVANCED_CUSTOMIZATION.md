# 🔧 Advanced Customization Guide

This guide covers advanced modifications to the Hero section for power users.

## 📐 Shader Customization

### Understanding the ASCII Shader

The ASCII shader (`src/lib/shaders.ts`) works by:

1. **Sampling the texture** at each pixel
2. **Calculating brightness** using standard luminance formula
3. **Mapping brightness to ASCII characters** (0-47)
4. **Adding interactivity** near mouse cursor
5. **Applying effects** (scanlines, dither, glow)

### Modifying ASCII Characters

**Current set:**
```glsl
const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
```

**More artistic alternative:**
```glsl
const string chars = "░▒▓█#@$%&*-+=:;',`^~\"";
```

**More technical alternative:**
```glsl
const string chars = "01█▀▄▌▐╔╗╚╝═║╬●◯◎◉○●";
```

**More dense ASCII:**
```glsl
const string chars = "@%#*+=-:. ";
```

### Adjusting Glow Intensity

In `AsciiCanvas.tsx`, modify the uniforms:

```ts
uniforms={{
  uTexture: { value: texture },
  uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  uTime: { value: 0 },
  uMouseInfluence: { value: 2.5 }, // ← Increase for stronger glow
}}
```

In the fragment shader, modify the influence calculation:
```glsl
float influence = smoothstep(0.3, 0.0, dist); // ← Adjust smoothstep values
// First value: falloff distance (higher = more spread)
// Second value: fade distance (lower = harder edge)
```

### Enhancing the Bloom Effect

Modify the Deep Rose color intensity in the shader:
```glsl
if (influence > 0.01) {
  vec3 roseGlow = vec3(0.847, 0.067, 0.349); // ← Adjust these values
  baseColor = mix(baseColor, roseGlow, influence * 2.0); // ← Increase multiplier
}
```

### Changing Scanline Effect

Current:
```glsl
float scanline = sin(vUv.y * 100.0) * 0.05 + 0.95;
color *= scanline;
```

**More pronounced:**
```glsl
float scanline = sin(vUv.y * 200.0) * 0.15 + 0.85;
color *= scanline;
```

**Horizontal scanlines:**
```glsl
float scanline = sin(vUv.x * 100.0) * 0.05 + 0.95;
color *= scanline;
```

**Animated scanlines:**
```glsl
float scanline = sin((vUv.y + uTime * 0.5) * 100.0) * 0.05 + 0.95;
color *= scanline;
```

### Adding CRT Distortion

Add to fragment shader:
```glsl
vec2 distortedUv = vUv;
distortedUv.x += sin(vUv.y * 3.0) * 0.02;
vec3 texColor = texture2D(uTexture, distortedUv).rgb;
```

## 🎬 Animation Customization

### Hero Entrance Animation

Modify in `Hero.tsx`:

```ts
// Slower entrance
gsap.from('.hero-content', {
  scrollTrigger: { trigger: '.hero-section', start: 'top center' },
  y: 150,          // Increase distance
  opacity: 0,
  duration: 1.8,   // Increase duration
});

// Add scale effect
gsap.from('.hero-content', {
  scrollTrigger: { trigger: '.hero-section', start: 'top center' },
  y: 100,
  opacity: 0,
  scale: 0.95,     // Add scaling
  duration: 1.2,
});
```

### Text Animation Variants

Character reveal timing:
```ts
transition={{
  delay: 0.3 + idx * 0.08,  // Increase spacing between chars
  duration: 0.8,            // Change duration
}}
```

Stagger all items:
```ts
const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.15,   // Increase stagger
      delayChildren: 0.5,      // Add initial delay
    },
  },
};
```

### Scroll Indicator Animation

Custom animation:
```tsx
// Currently: bouncing effect
animate={{ y: [0, 12, 0] }}
transition={{ duration: 2, repeat: Infinity }}

// Alternative: pulsing fade
animate={{ opacity: [0.5, 1, 0.5] }}
transition={{ duration: 1.5, repeat: Infinity }}

// Alternative: smooth rotation
animate={{ rotate: 360 }}
transition={{ duration: 4, repeat: Infinity, linear: true }}
```

## 🎨 Advanced Color Effects

### Adding Color Shifts

Modify shader to respond to time:
```glsl
vec3 getCharColor(float b, vec2 uv) {
  vec3 baseColor = vec3(0.98, 1.0, 0.96);

  // Time-based color shift
  vec3 timeShift = vec3(
    sin(uTime * 0.5) * 0.1,
    cos(uTime * 0.3) * 0.1,
    sin(uTime * 0.7) * 0.1
  );
  baseColor += timeShift;

  // ... rest of function
}
```

### Gradient on Interactive Glow

Replace single color with gradient:
```glsl
if (influence > 0.01) {
  // Interpolate between rose and emerald based on distance
  vec3 roseGlow = vec3(0.847, 0.067, 0.349);
  vec3 emeraldGlow = vec3(0.0, 1.0, 0.6);
  vec3 gradientColor = mix(roseGlow, emeraldGlow, influence);

  baseColor = mix(baseColor, gradientColor, influence * uMouseInfluence);
}
```

## ⚡ Performance Optimizations

### Reducing Shader Complexity

**Lower character count (faster):**
```glsl
const string chars = "@%#*+=:. ";
```

**Disable dithering:**
```glsl
// Remove or comment out:
float dither = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.15;
b += dither;
```

**Simplify glow:**
```glsl
// Faster glow calculation
float influence = max(0.0, 1.0 - dist * 3.0);
```

### Optimizing Canvas Render Size

In `AsciiCanvas.tsx`:
```ts
<Plane args={[
  size.width / 100,   // Increase denominator for lower resolution
  size.height / 100,  // (more performance, less detail)
]} ref={meshRef}>
```

## 🔌 Adding Custom Uniforms

Pass data from React to shaders:

```tsx
// In AsciiCanvas.tsx
const [intensity, setIntensity] = useState(1.0);

return (
  <shaderMaterial
    ref={materialRef}
    uniforms={{
      uMouseInfluence: { value: intensity },
      // ... other uniforms
    }}
  />
);

// Update from parent
useEffect(() => {
  setIntensity(Math.sin(Date.now() / 1000) * 0.5 + 1);
}, []);
```

## 🎪 Advanced Effects

### Parallax on Mouse Move

Add to `Hero.tsx`:

```tsx
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;

    gsap.to('.hero-content', {
      x: x * 20,
      y: y * 20,
      duration: 0.3,
    });
  };

  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, []);
```

### Responsive Shader Quality

Detect device and adjust:

```tsx
// In AsciiCanvas.tsx
const isMobile = window.innerWidth < 768;
const charDensity = isMobile ? 30 : 47; // Lower on mobile
```

Pass to shader as uniform.

### Time-Based Animations

Add uniform to automatically animate effects:

```ts
useFrame((state) => {
  if (materialRef.current) {
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * 2;
  }
});
```

Use in shader:
```glsl
float wave = sin(uTime + vUv.y * 5.0) * 0.1;
color.r += wave;
```

## 🌐 Responsive Adjustments

### Mobile-Specific Tweaks

```tsx
// In Hero.tsx
const isMobile = useMediaQuery('(max-width: 640px)');

return (
  <motion.h1
    className={isMobile ? 'text-4xl' : 'text-8xl'}
    // ...
  >
```

### Disable Effects on Low-End Devices

```tsx
const isSlowDevice = performance.memory?.jsHeapSizeLimit < 500000000;

if (!isSlowDevice) {
  // Run heavy animations
}
```

## 🧪 Testing Your Changes

### Debug Shader with DevTools

Add to fragment shader:
```glsl
// Show mouse distance as color
gl_FragColor = vec4(vec3(dist), 1.0);
```

### Console Logging in Shaders

Use Three.js Material Property Inspector:
```ts
// React Three Fiber Dev Tools
import { Inspect } from '@react-three/drei';
```

## 📚 Resources

- **Three.js Documentation**: https://threejs.org/docs/
- **GLSL Reference**: https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf
- **Shader Toy**: https://www.shadertoy.com/ (for shader testing)
- **GSAP Docs**: https://greensock.com/gsap/
- **Framer Motion**: https://www.framer.com/motion/

---

**Tip**: Use Chrome DevTools WebGL Inspector to debug shader issues in production!
