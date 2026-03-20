# Hero Section Setup Guide

## ✨ Your Ultra-Modern Hero Section is Ready!

Your Cybersage portfolio hero section has been successfully built with:

- **ASCII Fragment Shader**: Renders images as ASCII characters with interactive glow
- **Lenis Smooth Scrolling**: Butter-smooth scroll animations
- **GSAP ScrollTrigger**: Parallax entrance effects
- **Framer Motion**: Character-by-character text reveal
- **Custom Palette**: Deep Rose, Electric Emerald, and Mint Cream colors
- **Global Grain Overlay**: Subtle texture at 0.04 opacity

## 🖼️ Adding Your Headshot Image

The Hero section expects a **headshot image** at `/public/hero.jpg`. Currently, it will try to load this file.

**Steps to complete:**

1. **Replace `/public/hero.jpg`**:
   - Place your high-quality headshot image in the `public` folder
   - Name it exactly `hero.jpg`
   - Recommended specs:
     - **Format**: JPG or PNG (JPG preferred for shader performance)
     - **Size**: 800x1000px or higher
     - **Aspect Ratio**: Portrait-oriented (3:4 or similar)
     - **Quality**: High contrast for better ASCII effect

2. **Optional: Adjust Shader Settings**:
   - Open `/src/lib/shaders.ts`
   - Modify the `charIndex` calculation for ASCII density
   - Adjust `uMouseInfluence` in AsciiCanvas component for glow intensity
   - Tweak `scanline` effect opacity for retro feel

## 🎨 Color Customization

All colors are defined in `tailwind.config.ts` and can be adjusted:

```ts
cybersage: {
  charcoal: '#1A1A1A',    // Background
  rose: '#D81159',        // Glow/Hover
  plum: '#8F2D56',        // Atmospheric
  emerald: '#00FF9C',     // Accents/Status
  cream: '#F9FFF6',       // Typography
}
```

## 🚀 Running Your Site

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` and enjoy your interactive hero!

## 📝 Component Files

- **[Hero.tsx](src/components/Hero.tsx)** - Main hero section with animations
- **[AsciiCanvas.tsx](src/components/AsciiCanvas.tsx)** - Three.js WebGL canvas
- **[SmoothScroll.tsx](src/components/SmoothScroll.tsx)** - Lenis integration
- **[GrainOverlay.tsx](src/components/GrainOverlay.tsx)** - SVG grain texture
- **[shaders.ts](src/lib/shaders.ts)** - GLSL vertex & fragment shaders

## 🎯 Advanced Customization

### ASCII Character Set
Edit the `chars` string in `/src/lib/shaders.ts`:
```glsl
const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
```

### Mouse Glow Influence
In `/src/components/AsciiCanvas.tsx`, adjust:
```ts
uMouseInfluence: { value: 1.5 }, // Increase for more intense glow
```

### Scroll Animation Timing
In `/src/components/Hero.tsx`, modify GSAP animations:
```ts
duration: 1.2,  // Adjust parallax speed
```

## ⚡ Performance Tips

1. **Image optimization**: Compress your hero.jpg (target: <300KB)
2. **Shader performance**: The ASCII shader is GPU-optimized but works best on modern browsers
3. **Mobile**: Shader renders efficiently on mobile, but consider disabling animations on lower-end devices

## 🐛 Troubleshooting

**"Failed to load resource: /hero.jpg"**
- Add your headshot image to the `/public` folder and rename it to exactly `hero.jpg`

**Shader not rendering correctly**
- Check browser console for WebGL errors
- Ensure your image has good contrast for ASCII effect
- Try a different image with higher contrast

**Scrolling feels janky**
- Lenis requires modern browser (Chrome 90+, Firefox 88+, Safari 15+)
- Ensure Lenis is properly initialized in SmoothScroll component

## 📞 Need Help?

All components are production-ready and fully typed. Customize the colors, text, and animations to match your brand!
