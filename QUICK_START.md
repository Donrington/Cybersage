# ⚡ Quick Start Guide

## 🎯 What You Have

Your Cybersage portfolio has an **ultra-modern, GPU-accelerated Hero section** with:

✨ **ASCII art shader** that renders your headshot as interactive characters
✨ **Deep Rose glow** that follows your mouse
✨ **Smooth scrolling** with Lenis
✨ **Character reveal animations** with Framer Motion
✨ **Electric Emerald accents** and grain overlay
✨ **Production-ready** with full TypeScript support

## 🚀 Get Started in 30 Seconds

### 1. Start Development
```bash
npm run dev
```
Open http://localhost:3000

### 2. See It Live
Your Hero section is ready to go! Try:
- **Move your mouse** over the canvas → see the glow effect
- **Scroll down** → see the parallax entrance
- **Refresh** → watch the text reveal animation

### 3. Add Your Headshot
1. Take/prepare a **headshot photo** (800x1000px recommended)
2. Save it as `hero.jpg` in the `/public` folder
3. Refresh browser → your image appears as ASCII art!

**That's it!** 🎉

## 📝 Quick Customization

### Change Your Name
Open `src/components/Hero.tsx` line 84:
```tsx
const heading = 'ABAKWE CARRINGTON'; // ← Change this
```

### Change Subtitle
Same file, around line 98:
```tsx
'Full Stack Software Engineer // Digital Wisdom' // ← Change this
```

### Change Status Text
Same file, around line 115:
```tsx
'Available for Remote Work' // ← Change this
```

### Change Colors
Edit `tailwind.config.ts`:
```ts
cybersage: {
  charcoal: '#1A1A1A',     // Background
  rose: '#D81159',         // Glow color
  emerald: '#00FF9C',      // Accent borders
  cream: '#F9FFF6',        // Text color
}
```

## 🎨 Color Palette Reference

| Color | Hex | Usage | Name |
|-------|-----|-------|------|
| 🖤 | `#1A1A1A` | Background | Charcoal |
| 💗 | `#D81159` | Glow/Hover | Deep Rose |
| 🟣 | `#8F2D56` | Atmospheric | Muted Plum |
| 💚 | `#00FF9C` | Accents | Electric Emerald |
| ✨ | `#F9FFF6` | Text | Mint Cream |

## 📁 Key Files

```
src/
├── components/
│   ├── Hero.tsx           ← Main component (customize text here)
│   ├── AsciiCanvas.tsx    ← Three.js canvas
│   ├── SmoothScroll.tsx   ← Lenis setup
│   └── GrainOverlay.tsx   ← Texture overlay
├── lib/
│   └── shaders.ts         ← GLSL shader code
└── app/
    ├── page.tsx           ← Home page (uses Hero)
    ├── layout.tsx         ← Root layout
    └── globals.css        ← Global styles

public/
└── hero.jpg               ← YOUR IMAGE (replace placeholder)

tailwind.config.ts        ← Color palette
```

## 💡 Common Tasks

### Test Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
```bash
# Connect your Git repo on netlify.com
# It auto-deploys on push!
```

### Change Glow Intensity
In `src/components/AsciiCanvas.tsx`:
```ts
uMouseInfluence: { value: 1.5 }, // Increase for stronger glow
```

### Change ASCII Characters
In `src/lib/shaders.ts`, replace:
```glsl
const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
```

With your preferred set, e.g.:
```glsl
const string chars = "@%#*+=:. ";
```

### Disable Animations (for performance)
In `Hero.tsx`, comment out:
```tsx
// useEffect(() => {
//   gsap.from('.hero-content', { ... });
// }, []);
```

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Image not showing | Place JPG in `/public/hero.jpg` |
| Text not visible | Check `text-cybersage-cream` color |
| Glow not working | Ensure WebGL is supported (Chrome 90+) |
| Janky scrolling | Update browser or disable animations |
| No animation | Check browser console for errors |

## 📚 Next Steps

1. **Add More Content**: Create sections below the hero
2. **Create Portfolio Grid**: Showcase your projects
3. **Add About Section**: Tell your story
4. **Build Contact Form**: Let people reach you
5. **Deploy**: Get it live on the web!

## 📖 Documentation

- **Setup & Customization**: See `HERO_SETUP.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Advanced Tweaks**: See `ADVANCED_CUSTOMIZATION.md`

## 🎯 Key Components

### AsciiCanvas
```tsx
<AsciiCanvas onMouseMove={(x, y) => setMousePos({ x, y })} />
```
Renders your image as interactive ASCII art

### Hero
```tsx
<Hero />
```
Complete hero section with all animations

### SmoothScroll
Wraps your entire app in the layout

### GrainOverlay
Fixed grain texture (subtle, beautiful)

## 🔗 Useful Links

- **Next.js**: https://nextjs.org/docs
- **Three.js**: https://threejs.org/docs
- **Tailwind**: https://tailwindcss.com/docs
- **GSAP**: https://greensock.com/gsap/
- **Framer Motion**: https://www.framer.com/motion

## ✅ Deployment Checklist

- [ ] Replace `hero.jpg` with your headshot
- [ ] Update name in Hero.tsx
- [ ] Update tagline in Hero.tsx
- [ ] Customize colors if desired
- [ ] Test on mobile
- [ ] Run `npm run build` successfully
- [ ] Deploy to hosting platform
- [ ] Test live site
- [ ] Share with the world! 🚀

---

**Questions?** Check the documentation files or inspect the component code—everything is well-commented!

**Ready to go live?** Your portfolio is production-ready. Deploy and start showcasing your work! ✨
