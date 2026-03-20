export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Fragment shader — refined red palette
//
// New colors:
//   • Muted (inactive): #3D0500 (very dark red)
//   • Active (hover outer): #AE0C00 (deep red)
//   • Ignition (hover inner): #FF5A1F (reddish orange glow)
//
// Features:
//   • 300+ grid density for fine details
//   • Character jitter synced to hover intensity
//   • Discard on both dark pixels AND light background
//   • Charcoal background bleeds through
// ─────────────────────────────────────────────────────────────────────────────
export const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2      uResolution;
  uniform vec2      uMouse;
  uniform vec3      uColorMuted;    // #3D0500 (dark red)
  uniform vec3      uColorActive;   // #AE0C00 (deep red)
  uniform vec3      uColorIgnition; // #FF5A1F (reddish orange glow)
  uniform float     uHoverRadius;
  uniform float     uContrast;
  uniform float     uTime;

  varying vec2 vUv;

  float getLuma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
  float boost(float v) { return clamp((v - 0.5) * uContrast + 0.5, 0.0, 1.0); }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float sdSeg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
  }

  float charShape(float idx, vec2 p) {
    float r  = length(p);
    float th = 0.07;

    if (idx < 0.5) return 0.0;
    if (idx < 1.5) return step(r, 0.09);
    if (idx < 2.5)
      return max(step(length(p - vec2(0.0,  0.20)), 0.08),
                 step(length(p + vec2(0.0,  0.20)), 0.08));
    if (idx < 3.5)
      return step(sdSeg(p, vec2(-0.42, 0.0), vec2(0.42, 0.0)), th);
    if (idx < 4.5) {
      float t = step(sdSeg(p, vec2(-0.42,  0.16), vec2(0.42,  0.16)), th);
      float b = step(sdSeg(p, vec2(-0.42, -0.16), vec2(0.42, -0.16)), th);
      return max(t, b);
    }
    if (idx < 5.5) {
      float h = step(sdSeg(p, vec2(-0.42, 0.0), vec2(0.42, 0.0)), th);
      float v = step(sdSeg(p, vec2(0.0, -0.42), vec2(0.0, 0.42)), th);
      return max(h, v);
    }
    if (idx < 6.5) {
      float h  = step(sdSeg(p, vec2(-0.40,  0.0 ), vec2(0.40,  0.0 )), th);
      float v  = step(sdSeg(p, vec2( 0.0, -0.40 ), vec2( 0.0,  0.40 )), th);
      float d1 = step(sdSeg(p, vec2(-0.32, -0.32), vec2(0.32,  0.32)), th);
      float d2 = step(sdSeg(p, vec2( 0.32, -0.32), vec2(-0.32, 0.32)), th);
      return max(max(h, v), max(d1, d2));
    }
    if (idx < 7.5) {
      float h1 = step(sdSeg(p, vec2(-0.42,  0.16), vec2(0.42,  0.16)), th);
      float h2 = step(sdSeg(p, vec2(-0.42, -0.16), vec2(0.42, -0.16)), th);
      float v1 = step(sdSeg(p, vec2( 0.16, -0.42), vec2( 0.16,  0.42)), th);
      float v2 = step(sdSeg(p, vec2(-0.16, -0.42), vec2(-0.16,  0.42)), th);
      return max(max(h1, h2), max(v1, v2));
    }
    if (idx < 8.5) {
      float tl  = step(length(p - vec2(-0.19,  0.21)), 0.15);
      float tlH = step(length(p - vec2(-0.19,  0.21)), 0.07);
      float br  = step(length(p + vec2(-0.19,  0.21)), 0.15);
      float brH = step(length(p + vec2(-0.19,  0.21)), 0.07);
      float d   = step(sdSeg(p, vec2(0.38, -0.42), vec2(-0.38, 0.42)), th);
      return max(d, max(tl - tlH, br - brH));
    }

    float outer = step(0.26, r) * step(r, 0.44);
    float iC    = clamp(step(length(p - vec2(0.08, 0.02)), 0.17)
                      - step(length(p - vec2(0.08, 0.02)), 0.09), 0.0, 1.0);
    float stem  = step(sdSeg(p, vec2(0.25, -0.18), vec2(0.25, 0.22)), th * 0.85);
    return max(outer, max(iC, stem));
  }

  void main() {
    // ── 1. High-density grid ─────────────────────────────────────────────────
    vec2 grid    = vec2(300.0, 300.0 * (uResolution.y / uResolution.x));
    vec2 uvCell  = floor(vUv * grid);
    vec2 uvGrid  = (uvCell + 0.5) / grid;
    vec2 cellPos = fract(vUv * grid) - 0.5;

    // ── 2. Sample + contrast ─────────────────────────────────────────────────
    float raw        = getLuma(texture2D(uTexture, uvGrid).rgb);
    float brightness = boost(raw);

    // Discard dark background AND bright background → only face remains
    if (brightness < 0.12 || brightness > 0.88) discard;

    // ── 3. Character jitter (alive engine) ────────────────────────────────
    float baseIndex = floor(clamp(brightness * 10.0, 1.0, 9.0));
    float cellHash = hash(uvCell);
    float dist       = distance(vUv, uMouse);
    float hoverFactor = smoothstep(uHoverRadius * 1.5, 0.0, dist);

    // Jitter speed: 3-10 Hz based on hover
    float jitterSpeed = 3.0 + hoverFactor * 7.0;
    float jitterAmount = sin(uTime * jitterSpeed + cellHash * 6.28) * 1.2;
    float charIdx = clamp(baseIndex + jitterAmount, 1.0, 9.0);

    // ── 4. Shape rendering ───────────────────────────────────────────────────
    float pattern = charShape(charIdx, cellPos);
    if (pattern < 0.5) discard;

    // ── 5. Colour + glow (new red palette) ────────────────────────────────
    float flashOuter = smoothstep(uHoverRadius,        0.0, dist);
    float flashInner = smoothstep(uHoverRadius * 0.35, 0.0, dist);

    vec3 color = uColorMuted;
    color = mix(color, uColorActive,   flashOuter);
    color = mix(color, uColorIgnition, flashInner);

    // Brightness modulation — increased for visibility
    color *= 0.99 + brightness * 0.9;

    // Ambient halo
    color += uColorActive * smoothstep(uHoverRadius * 0.8, 0.0, dist) * 0.12;

    // Micro-scanline
    color *= sin(vUv.y * 400.0) * 0.02 + 0.98;

    gl_FragColor = vec4(color, 1.0);
  }
`;
