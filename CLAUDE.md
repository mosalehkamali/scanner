# CLAUDE.md — Design System & Project Guidelines

> Read this file **before** writing any code, component, or style.
> This is the single source of truth for all UI/UX decisions.

---

## 🎨 Design Philosophy

This project uses a **Bold & Colorful** design language:
- High visual energy — colors are vivid, not muted
- Strong typographic hierarchy — size and weight contrasts are dramatic
- Every screen should feel like a product from a top-tier design studio
- Inspiration: **Linear**, **Loom**, **Arc**, **Raycast**, **Vercel**, **Resend**

**Anti-patterns to avoid at all costs:**
- ❌ Default blue (`blue-500`) as primary color with no personality
- ❌ Gray-on-white layouts with no visual identity
- ❌ Bootstrap-style cards with generic shadows
- ❌ System font stack (always use custom fonts)
- ❌ Unstyled HTML tables
- ❌ Missing hover/focus/active states
- ❌ Empty states left unstyled
- ❌ Flat, boring buttons with no character

---

## 🖋 Typography

```
Font Pairing:
  - Headings: "Bricolage Grotesque" (Google Fonts) — bold, expressive
  - Body:     "Inter" (Google Fonts) — clean, readable
  - Mono:     "JetBrains Mono" (Google Fonts) — for code/data
```

**Add to `layout.tsx`:**
```tsx
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google"

const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700", "800"],
})
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
})
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
})
```

**Scale:**
| Element      | Size        | Weight | Class Example                        |
|-------------|-------------|--------|--------------------------------------|
| Hero H1     | text-5xl–7xl| 800    | `font-heading text-7xl font-extrabold` |
| Section H2  | text-3xl–4xl| 700    | `font-heading text-4xl font-bold`    |
| Card title  | text-xl–2xl | 600    | `font-heading text-2xl font-semibold`|
| Body        | text-base   | 400    | `font-body text-base`                |
| Small/meta  | text-sm     | 400    | `text-sm text-zinc-400`              |
| Code        | text-sm     | 400    | `font-mono text-sm`                  |

---

## 🎨 Color System

Define in `tailwind.config.ts` under `theme.extend.colors`:

```ts
colors: {
  brand: {
    50:  "#fdf2ff",
    100: "#f5d0fe",
    200: "#e879f9",   // Electric violet-pink
    300: "#d946ef",
    400: "#c026d3",
    500: "#a21caf",   // Primary brand
    600: "#86198f",
    700: "#701a75",
    800: "#4a044e",
    900: "#2e0032",
  },
  acid: {
    400: "#a3e635",   // Lime accent
    500: "#84cc16",
  },
  neon: {
    400: "#22d3ee",   // Cyan accent
    500: "#06b6d4",
  },
  hot: {
    400: "#fb923c",   // Orange accent
    500: "#f97316",
  },
}
```

**Usage rules:**
- `brand.*` — primary actions, CTAs, focus rings, active states
- `acid.*` — success states, "new" badges, growth metrics
- `neon.*` — info states, links, highlights
- `hot.*` — warnings, trending, notifications
- `zinc.*` — neutrals (prefer zinc over gray for warmer neutrals)

---

## 🧩 Component Patterns

### Buttons

```tsx
// PRIMARY — bold, gradient, animated
<button className="
  relative px-6 py-3 rounded-xl font-heading font-bold text-white
  bg-gradient-to-r from-brand-500 to-neon-500
  hover:from-brand-400 hover:to-neon-400
  active:scale-[0.97]
  transition-all duration-200
  shadow-[0_0_20px_rgba(162,28,175,0.4)]
  hover:shadow-[0_0_30px_rgba(162,28,175,0.6)]
">
  Get Started
</button>

// SECONDARY — outlined with color
<button className="
  px-6 py-3 rounded-xl font-heading font-semibold
  border-2 border-brand-500 text-brand-400
  hover:bg-brand-500 hover:text-white
  transition-all duration-200
">
  Learn More
</button>

// GHOST — subtle
<button className="
  px-4 py-2 rounded-lg font-medium text-zinc-400
  hover:text-white hover:bg-white/10
  transition-all duration-150
">
  Cancel
</button>
```

### Cards

```tsx
// GLASS CARD — primary card style
<div className="
  relative rounded-2xl overflow-hidden
  bg-zinc-900/60 backdrop-blur-xl
  border border-white/10
  hover:border-brand-500/50
  transition-all duration-300
  hover:shadow-[0_8px_40px_rgba(162,28,175,0.2)]
  p-6
">
  {/* Gradient accent top border */}
  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
  {children}
</div>

// COLORED CARD — for features/stats
<div className="
  rounded-2xl p-6
  bg-gradient-to-br from-brand-900/80 to-brand-800/40
  border border-brand-700/50
  hover:scale-[1.02]
  transition-transform duration-200
">
  {children}
</div>
```

### Badges / Pills

```tsx
// Color-coded badges
const badgeVariants = {
  new:     "bg-acid-400/20 text-acid-400 border border-acid-400/30",
  hot:     "bg-hot-400/20 text-hot-400 border border-hot-400/30",
  info:    "bg-neon-400/20 text-neon-400 border border-neon-400/30",
  brand:   "bg-brand-500/20 text-brand-300 border border-brand-500/30",
}

<span className={`
  inline-flex items-center gap-1.5 px-2.5 py-1
  rounded-full text-xs font-semibold font-mono tracking-wide
  uppercase ${badgeVariants.new}
`}>
  ✦ New
</span>
```

### Inputs

```tsx
<input className="
  w-full px-4 py-3 rounded-xl
  bg-zinc-900/80 text-white placeholder:text-zinc-500
  border border-zinc-700
  focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
  transition-all duration-200
  font-body text-sm
" />
```

### Section Headers

```tsx
<div className="flex flex-col items-center text-center gap-4 mb-16">
  {/* Eyebrow label */}
  <span className="
    px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-widest
    bg-brand-500/20 text-brand-300 border border-brand-500/30
  ">
    Features
  </span>
  
  {/* Gradient headline */}
  <h2 className="
    font-heading text-5xl font-extrabold
    bg-gradient-to-r from-white via-brand-200 to-neon-400
    bg-clip-text text-transparent
  ">
    Built for the bold
  </h2>
  
  {/* Subtitle */}
  <p className="max-w-2xl text-zinc-400 text-lg leading-relaxed">
    Description text here.
  </p>
</div>
```

---

## 🌑 Dark Mode (Default)

This project is **dark-first**. Set in `layout.tsx`:
```html
<html lang="en" className="dark">
```

Base background palette:
```
bg-zinc-950  → page background (#09090b)
bg-zinc-900  → card surfaces
bg-zinc-800  → elevated elements
bg-zinc-700  → borders, dividers
bg-zinc-400  → muted text
bg-white      → primary text
```

---

## ✨ Decorative Elements

Use these to elevate layouts:

```tsx
// Gradient orb — ambient background glow
<div className="
  absolute -top-40 -right-40 w-[600px] h-[600px]
  bg-brand-500/30 rounded-full blur-[120px] pointer-events-none
" />

// Grid background pattern (add to tailwind.config)
// bg-grid: add to global CSS:
// background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
//                   linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
// background-size: 32px 32px;

// Gradient text
<span className="bg-gradient-to-r from-brand-300 to-neon-400 bg-clip-text text-transparent">
  highlighted word
</span>

// Divider with glow
<div className="h-px w-full bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

// Noise texture overlay (add to global CSS):
// background-image: url("data:image/svg+xml,..."); opacity: 0.02;
```

---

## 📐 Spacing & Layout

- Page max width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Section vertical padding: `py-24 lg:py-32`
- Card grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Consistent rounded corners: prefer `rounded-2xl` for cards, `rounded-xl` for buttons/inputs, `rounded-full` for pills/avatars

---

## 🎞 Animations

Use `tailwindcss-animate` or define in `globals.css`:

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  from { background-position: 200% center; }
  to   { background-position: -200% center; }
}

.animate-fade-up { animation: fade-up 0.5s ease forwards; }
.animate-shimmer { 
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
}
```

Standard transitions: `transition-all duration-200` for micro-interactions, `duration-300` for layout changes.

---

## 📋 Empty States

Every list/table/feed MUST have a styled empty state:

```tsx
<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl">
    📭
  </div>
  <h3 className="font-heading text-xl font-semibold text-white">Nothing here yet</h3>
  <p className="text-zinc-400 text-sm max-w-xs">Start by creating your first item.</p>
  <button className="mt-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-400 transition-colors">
    + Create
  </button>
</div>
```

---

## ⚡ Loading States

Use skeleton screens, never spinners alone:

```tsx
// Skeleton card
<div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 animate-pulse">
  <div className="h-4 bg-zinc-800 rounded-full w-3/4" />
  <div className="h-3 bg-zinc-800 rounded-full w-full" />
  <div className="h-3 bg-zinc-800 rounded-full w-2/3" />
</div>
```

---

## 🧠 Code Quality Rules

- Use TypeScript strictly — no `any`
- All components in `src/components/` with PascalCase filenames
- Server Components by default; add `"use client"` only when needed
- Extract repeated Tailwind class combos into `cn()` variants with `clsx` + `tailwind-merge`
- All images via `next/image` with explicit `width`/`height`
- Accessible: every interactive element has `aria-label` when icon-only

---

## 🔁 When Redesigning Existing Pages

1. **Keep logic, replace markup** — don't touch API calls or state management
2. Apply dark background (`bg-zinc-950`) to root
3. Add gradient orb(s) to hero/header sections
4. Upgrade all `<button>` → use Button component patterns above
5. Upgrade all `<input>` → use Input pattern above
6. Add hover states to every interactive element
7. Make all headings use `font-heading` with gradient text
8. Replace plain lists with styled cards
9. Add empty + loading states if missing
10. Ensure mobile-first responsive layout
