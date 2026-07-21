# Voyageurs Design System
**V 7.0 — Mediterranean Chic · WebOS Spatial Interface**

This is the canonical reference for all visual and interaction design decisions in the Voyageurs application.

---

## 1. Brand Identity

Voyageurs is a **Mediterranean-inspired, luxury group travel platform**. The design should feel like a premium boutique travel journal — warm, tactile, and editorial — layered on top of the spatial, gesture-driven UI language of classic HP/Palm webOS.

**Two pillars drive every decision:**
- 🌊 **Mediterranean Chic** — warm linens, terracotta, sea blues, editorial serif typography
- 📱 **webOS Spatial UI** — rounded cards, horizontal navigation, swipe gestures, no back buttons

---

## 2. Color Palette

All colors are defined as CSS custom properties in `app.css` and aliased via Tailwind's `@theme inline`.

### Core Palette

| Name | CSS Token | Hex | Tailwind Class | Role |
|---|---|---|---|---|
| Med Blue | `--color-primary` | `#1E4472` | `bg-med-blue` / `text-med-blue` | Primary brand, headings, active states |
| Light Blue | `--color-primary-light` | `#AEC0D8` | `bg-med-lightBlue` | Secondary; dark-mode primary text |
| Sand | `--color-bg` | `#F5F2EB` | `bg-med-sand` | Page background (light mode) |
| Terracotta | `--color-accent` | `#D67252` | `bg-med-terracotta` | Accent, CTAs, interactive labels |
| Olive | `--color-success` | `#8A9A5B` | `bg-med-olive` | Success / confirmed states |

### Dark Mode Overrides (`.dark` class)

| Token | Dark Value | Note |
|---|---|---|
| `--color-primary` | `#AEC0D8` | Light blue becomes the primary text color |
| `--color-bg` | `#111827` | Deep slate page background |
| `--color-accent` | `#b85a3a` | Slightly deeper terracotta |
| `--color-success` | `#6b7a44` | Slightly deeper olive |
| `--onyx-shadow-card` | `rgba(0,0,0,0.5)` | Heavier shadow for depth on dark surfaces |

### Color Usage Rules

- **Med Blue** → Section headings, app name, icon surfaces, active nav states, data/status cards
- **Terracotta** → Action CTAs, micro-labels (category chips, "Official" tags), hover arrows
- **Sand** → Page background only; never use for card surfaces (use `bg-white` in light mode)
- **Olive** → Confirmed/booked status, success banners, left-accent borders on success messages
- **Light Blue** → Dark-mode body text, secondary labels, skeleton states

> **Rule:** Never use raw Tailwind color utilities (e.g., `bg-blue-600`) for brand elements. Always use the `med-*` Tailwind aliases to ensure light/dark consistency.

---

## 3. Typography

Loaded from Google Fonts in `index.html`. Configured via `--font-*` tokens in `app.css @theme inline`.

### Font Families

| Family | Usage | Tailwind Class |
|---|---|---|
| **Playfair Display** | Primary display/heading serif | `font-serif` |
| **Cormorant Garamond** | Fallback serif (elegant, classical) | `font-serif` |
| **Inter** | Primary UI / body sans-serif | `font-sans` / `font-body` |
| **Montserrat** | Fallback sans-serif | `font-sans` / `font-body` |

> Playfair Display replaced the placeholder "Voyage" font (which was never loaded). It is the closest Google Fonts match — a high-contrast editorial serif with the same luxury, magazine-quality presence.

### Type Scale

| Role | Font | Size | Tailwind Classes |
|---|---|---|---|
| Display / H1 | Playfair Display (serif) | `text-5xl` – `text-6xl` | `font-serif text-5xl text-med-blue dark:text-white` |
| H2 | Playfair Display (serif) | `text-4xl` | `font-serif text-4xl text-med-blue dark:text-white` |
| H3 | Playfair Display (serif) | `text-2xl` – `text-3xl` | `font-serif text-2xl text-med-blue dark:text-white` |
| H4 | Playfair Display (serif) | `text-lg` – `text-xl` | `font-serif text-lg text-med-blue dark:text-white` |
| Body | Inter (sans) | `text-sm` – `text-base` | `text-gray-600 dark:text-gray-300 leading-relaxed` |
| UI Label / Micro | Inter (sans) | `text-[10px]` | `text-[10px] font-bold uppercase tracking-widest text-med-terracotta` |
| Pull Quote | Playfair Display (serif) | `text-xl` | `font-serif text-xl italic text-med-blue dark:text-blue-200` |

### Typography Rules

- **Headings always use `font-serif`** — never sans-serif for section titles or card titles
- **UI labels are always `uppercase` with `tracking-widest`** — this is a hallmark of the brand voice
- **Body text uses `leading-relaxed`** for comfortable readability
- **Italic serif** is reserved for quotes, place names, and editorial flourishes
- The app name "Voyageurs" always renders as `font-serif font-bold`

---

## 4. Spacing & Layout

### Border Radius — Consolidated Token Scale

All radius values are defined as design tokens in `app.css :root`. **Do not use ad-hoc `rounded-[Xrem]` values** — map every surface to one of these tokens.

| Token | Value | Tailwind Equivalent | Usage |
|---|---|---|---|
| `--radius-card` | `32px` | `rounded-[32px]` | WebOS cards, primary content cards |
| `--radius-modal` | `24px` | `rounded-[24px]` / `rounded-3xl` | Modals, bottom sheets, detail panels |
| `--radius-surface` | `16px` | `rounded-2xl` | List items, inputs, inner surfaces |
| `--radius-chip` | `8px` | `rounded-lg` | Tags, chips, image overlays |
| `--radius-pill` | `9999px` | `rounded-full` | Buttons, segmented control tabs, badges |

> `--onyx-card-radius` is kept as an alias for `--radius-card` for backward compatibility.

> **Rule:** Never use `rounded-none`, `rounded-sm`, or `rounded` (4px) on UI components. The only exception is full-bleed images inside a rounded container.

### Elevation / Shadow

| Level | Use Case | Value |
|---|---|---|
| `shadow-sm` | Subtle card borders | Tailwind default |
| `shadow-lg` + color glow | Colored CTA buttons | `shadow-lg shadow-med-terracotta/20` |
| `shadow-xl` | Floating elements, popovers | Tailwind default |
| `shadow-2xl` | Modals, bottom sheets | Tailwind default |
| `--onyx-shadow-card` | WebOS card surfaces | `0 10px 25px -5px rgba(0,0,0,0.12)` |
| Deep glass (dark) | Dark mode card surfaces | `0 8px 32px rgba(0,0,0,0.5)` |

---

## 5. Components

### 5.1 Button (`Button.tsx`)

Always use the shared `<Button>` component. Never use raw `<button>` tags for application actions.

**Two-tier CTA hierarchy (intentional):**

| Variant | Color | Usage |
|---|---|---|
| `primary` | Saffron `#E2923D` | Default CTA — warm, inviting, the first offer |
| `action` | Terracotta `#D67252` | Secondary CTA — accent, urgent, confirmatory |
| `secondary` | White / slate-800 | Supporting action |
| `outline` | Terracotta border | Tertiary / alternative action |
| `ghost` | Muted gray | Links, quiet nav items |
| `destructive` | Red | Delete or dangerous action |
| `success` | Olive green | Confirmed state (non-interactive, `cursor-default`) |

**Sizes:** `sm` (`rounded-xl`), `md` (`rounded-2xl`), `lg` (`rounded-2xl`), `icon` (44×44, `rounded-full`)

All buttons share: `uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50`

### 5.2 Segmented Control (`SegmentedControl.tsx`)

Used for tab-style navigation within a view.

```
Container: bg-white/80 dark:bg-gray-800/80 p-1.5 rounded-full border
Active tab: bg-med-blue text-white shadow-md rounded-full
Inactive:   text-gray-600 hover:text-med-blue hover:bg-gray-50
Labels:     text-[10px] font-bold uppercase tracking-widest
Badge:      bg-med-terracotta animate-pulse (inactive) | bg-white text-med-blue (active)
```

### 5.3 Content Card

Standard white surface for feature content.

```tsx
<div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800">
  <div className="p-3 bg-med-blue/10 rounded-xl text-med-blue dark:text-blue-300">
    <Icon size={24} />
  </div>
  <h3 className="font-serif text-xl text-med-blue dark:text-white">Title</h3>
  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subtitle</p>
  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">Body text.</p>
</div>
```

### 5.4 Interactive / Media Card

For activities, venues, hotels.

- Base: `rounded-[32px] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all`
- Image: `group-hover:scale-110 transition-transform duration-700` (Ken Burns)
- Category chip: `bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase text-med-blue`
- Arrow: `group-hover:translate-x-1 transition-transform`

### 5.5 Status / KPI Card

For financial summaries and key metrics.

```tsx
<div className="bg-med-blue text-white p-6 rounded-[24px] shadow-xl relative overflow-hidden">
  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
  <p className="font-serif text-4xl font-bold">$1,250</p>
</div>
```

### 5.6 Success / Alert Banner

```tsx
<div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-l-4 border-l-med-olive border-gray-100">
  <Check size={16} className="text-med-olive" />
  <p className="text-xs font-bold">Success</p>
</div>
```

### 5.7 WebOS Card (`WebOSCard.tsx`)

Top-level container for all full-screen app views.

| State | Surface |
|---|---|
| Light | `bg-med-sand/95 backdrop-blur-3xl border border-white/60` |
| Dark | `bg-[#1a202c]/80 backdrop-blur-[40px] border border-white/10` |
| Overview radius | `rounded-[32px]` |
| Active/full | `rounded-none md:rounded-[24px]` |

- Header: `h-14`, terracotta dot (`w-2 h-2 rounded-full bg-med-terracotta`), label `text-[10px] font-bold uppercase tracking-[0.2em]`
- Dismiss: drag up with `velocity.y < -500` or `offset.y < -200`
- Spring: `stiffness: 400, damping: 40`

### 5.8 Glassmorphism Surface
### Layout Rules
- **Primary Text**: The main header/title text should always be top-aligned.
- **Form/Detail Content**: Inputs or details (like an invite code) should be middle-aligned vertically.
- **Consents**: Any checkboxes or agreements should be anchored above the bottom CTA button.
- **Actions**: Buttons (CTAs) should always be bottom-aligned (e.g., using `mt-auto` in a flex container).
- **Distractions**: Do not place progress bars, icons, or logos inside the detail content of the cards.
```
Light:   bg-white/80 backdrop-blur-2xl border border-white/60
Dark:    bg-[#1a202c]/80 backdrop-blur-[40px] border border-white/10
Neutral: bg-white/10 backdrop-blur-md border border-white/5
```

Always pair `backdrop-blur-*` with a semi-transparent background. Never use pure transparency.

---

## 6. Animation & Motion

### Easing Functions

| Name | Value | Use Case |
|---|---|---|
| WebOS Spring | `cubic-bezier(0.175, 0.885, 0.32, 1.15)` (`--onyx-spring`) | Card entrances, button pops |
| Smooth Ease | `cubic-bezier(0.19, 1, 0.22, 1)` | Pane slides, menu transitions |
| Standard | `ease-in-out` (Tailwind default) | General hover/focus |

### Framer Motion Presets

```ts
// WebOS Card physics
{ type: "spring", stiffness: 400, damping: 40 }

// Card dismiss
{ y: -1000, opacity: 0, scale: 0.5 }

// Label entrance
initial={{ opacity: 0, y: 10 }} → animate={{ opacity: 1, y: 0 }}, delay: 0.2
```

### Micro-interactions

| Interaction | Class |
|---|---|
| Button press | `active:scale-95` |
| Card hover lift | `hover:-translate-y-1 transition-all` |
| Image zoom | `group-hover:scale-110 transition-transform duration-700` |
| Arrow nudge | `group-hover:translate-x-1 transition-transform` |
| Icon pulse | `animate-subtle-pulse` (in `app.css`) |
| FAB hover | `hover:scale-110 transition-transform` |

Theme color transitions: `transition-colors duration-300` on all light/dark-switching elements.

---

## 7. Navigation Patterns (webOS Rules)

### ✅ Do
- Use the **horizontal sliding pane** architecture for multi-level navigation
- Pin primary actions in a **bottom command bar**
- Use `<SegmentedControl>` for tab-style views within a card
- Dismiss cards with an **upward swipe** gesture
- Show the **"peek"** of the previous pane when navigating deeper
- Use **transient banner notifications** for alerts

### ❌ Don't
- Use a top-left **"Back" button**
- Use a **hamburger menu** as the primary navigation model
- Show **modal dialogs** for non-destructive actions
- Use `rounded-none` or flat/square styling on UI surfaces
- Create deep, full-screen navigational stacks

---

## 8. Icons

- **Library:** Lucide React
- **Sizes:** `16px` (inline), `20px` (button), `24px` (feature), `32px` (nav controls)
- **Framed icon:** `p-3 bg-med-blue/10 rounded-xl text-med-blue dark:text-blue-300`

---

## 9. Dark Mode

Toggled via `.dark` class on `<html>`. CSS variant: `@custom-variant dark (&:where(.dark, .dark *))`.

### Implementation Checklist

- Every light-mode surface needs a `dark:` counterpart
- Card surface: `dark:bg-gray-900`
- Page background: `dark:bg-[#111827]` / `dark:bg-slate-950`
- Headings: `dark:text-white`
- Body text: `dark:text-gray-300`
- Muted text: `dark:text-gray-400`
- Colored shadows (`shadow-med-blue/20`) remain unchanged in dark mode

---

## 10. File Structure

| File | Role |
|---|---|
| `app.css` | **Single source of truth** for all design tokens |
| `styles/global.css` | Baseline resets only — no design tokens |
| `components/Button.tsx` | Canonical button — all variants and sizes |
| `components/SegmentedControl.tsx` | Canonical tab control |
| `components/WebOSCard.tsx` | Canonical full-screen card container |
| `components/StyleGuide.tsx` | Live rendered reference — route to `/style-guide` for dev use |

> **Rule:** All design tokens live in `app.css`. `global.css` handles baseline resets only and must never define colors, fonts, or layout variables.
