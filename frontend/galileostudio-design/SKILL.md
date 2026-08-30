---
name: galileostudio-design
description: Design system skill for galileostudio. Activate when building UI components, pages, or any visual elements. Provides exact color tokens, typography scale, spacing grid, component patterns, and craft rules. Read references/DESIGN.md before writing any CSS or JSX.
---

# galileostudio Design System

You are building UI for **galileostudio**. Light-themed, warm palette, sans-serif typography (Geist), compact density on a 4px grid, expressive motion.

## Visual Reference

**IMPORTANT**: Study ALL screenshots below before writing any UI. Match colors, typography, spacing, layout, and motion exactly as shown.

### Homepage

![galileostudio Homepage](screenshots/homepage.png)

> Read `references/DESIGN.md` for full token details.

## Design Philosophy

- **Layered depth** — use shadow tokens to create a sense of physical layering. Each elevation level has a specific shadow.
- **Gradient accents** — gradients are used thoughtfully for emphasis, not decoration.
- **Single typeface** — Geist carries all text. Hierarchy comes from size, weight, and color — never font mixing.
- **compact density** — 4px base grid. Every dimension is a multiple of 4.
- **warm palette** — the color temperature runs warm, matching the sans-serif typography.
- **Restrained accent** — `#ff8b1a` is the only pop of color. Used exclusively for CTAs, links, focus rings, and active states.
- **Expressive motion** — animations are an integral part of the experience. Use spring physics and layout animations.

## Color System

### Core Palette

| Role | Token | Hex | Use |
|------|-------|-----|-----|
| Background | `--background` | `#ffffff` | Page/app background |
| Surface | `--surface` | `#07131b` | Cards, panels, modals |
| Text Primary | `--text-primary` | `#101828` | Headings, body text |
| Text Muted | `--text-muted` | `#6a7282` | Captions, placeholders |
| Accent | `--accent` | `#ff8b1a` | CTAs, links, focus rings |

### Status Colors

| Status | Hex | Use |
|--------|-----|-----|
| Warning | `#fcbb00` | Caution states, pending items |
| Danger | `#fb2c36` | Errors, destructive actions |

### Extended Palette

- **color-blue-500:** `#3080ff`
- **color-blue-400:** `#54a2ff`
- **color-violet-400:** `#a685ff`
- **color-violet-500:** `#8d54ff`
- **color-black:** `#000000` — Deep background layer or shadow color
- **ring:** `#09c6b8`
- **color-red-400:** `#ff6568`
- **color-cyan-200:** `#a2f4fd`

### CSS Variable Tokens

```css
--background: #030609;
--foreground: #f4f7fb;
--card: #07131b;
--card-foreground: #f4f7fb;
--primary: #8aceb3;
--primary-foreground: #021817;
--secondary: #10202b;
--secondary-foreground: #edf4f8;
--muted: #0a161f;
--muted-foreground: #9cb5c4;
--accent: #0b1d25;
--accent-foreground: #f4f7fb;
--border: #15414b;
--background: #030609;
--foreground: #f4f7fb;
--card: #07131b;
--card-foreground: #f4f7fb;
--primary: #8aceb3;
--primary-foreground: #021817;
--secondary: #10202b;
```

## Typography

### Font Stack

- **Geist** — Heading 1, Heading 2, Heading 3, Body, Caption
- **SFMono-Regular** — Code

### Font Sources

```css
@font-face {
  font-family: "Geist";
  src: url("fonts/Geist-Bold.ttf") format("truetype");
  font-weight: 700;
}
@font-face {
  font-family: "Geist";
  src: url("fonts/Geist-Regular.ttf") format("truetype");
  font-weight: 400;
}
```

### Type Scale

| Role | Family | Size | Weight |
|------|--------|------|--------|
| Heading 1 | Geist | 11px | 700 |
| Heading 2 | Geist | 10px | 700 |
| Heading 3 | Geist | 9px | 700 |
| Body | Geist | 8px | 400 |
| Caption | Geist | inherit | 400 |
| Code | SFMono-Regular | 14px | 400 |

### Typography Rules

- All text uses **Geist** — never add another font family
- Max 3-4 font sizes per screen
- Headings: weight 600-700, body: weight 400
- Use color and opacity for text hierarchy, not additional font sizes
- Line height: 1.5 for body, 1.2 for headings

## Spacing & Layout

### Base Grid: 4px

Every dimension (margin, padding, gap, width, height) must be a multiple of **4px**.

### Spacing Scale

`4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48` px

### Spacing as Meaning

| Spacing | Use |
|---------|-----|
| 4-8px | Tight: related items (icon + label, avatar + name) |
| 12-16px | Medium: between groups within a section |
| 24-32px | Wide: between distinct sections |
| 48px+ | Vast: major page section breaks |

### Border Radius

Scale: `.25rem, 1.1rem, 1.25rem, 1.5rem, 2px, 2rem, 2.5rem, 3rem, inherit, 12px`
Default: `2rem`

### Container

Max-width: `96rem`, centered with auto margins.

### Breakpoints

| Name | Value |
|------|-------|
| sm | 40rem |
| md | 48rem |
| lg | 64rem |
| xl | 80rem |
| 2xl | 96rem |

Mobile-first: design for small screens, layer on responsive overrides.

## Component Patterns

### Card

```css
.card {
  background: #07131b;
  border-radius: 2rem;
  padding: 16px;
  box-shadow: 0 0 12px #09c6b840;
}
```

```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</div>
```

### Button

```css
/* Primary */
.btn-primary {
  background: #ff8b1a;
  color: #101828;
  border-radius: 2rem;
  padding: 8px 16px;
  font-weight: 500;
  transition: opacity 150ms ease;
}
.btn-primary:hover { opacity: 0.9; }

/* Ghost */
.btn-ghost {
  background: transparent;
  border: 1px solid #cccccc;
  color: #101828;
  border-radius: 2rem;
  padding: 8px 16px;
}
```

```html
<button class="btn-primary">Get Started</button>
<button class="btn-ghost">Learn More</button>
```

### Input

```css
.input {
  background: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 2rem;
  padding: 8px 12px;
  color: #101828;
  font-size: 14px;
}
.input:focus { border-color: #ff8b1a; outline: none; }
```

```html
<input class="input" type="text" placeholder="Search..." />
```

### Badge / Chip

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  background: #07131b;
  color: #6a7282;
}
```

```html
<span class="badge">New</span>
<span class="badge">Beta</span>
```

### Modal / Dialog

```css
.modal-backdrop { background: rgba(0, 0, 0, 0.6); }
.modal {
  background: #07131b;
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  width: 90vw;
  box-shadow: 0 0 12px #09c6b840;
}
```

```html
<div class="modal-backdrop">
  <div class="modal">
    <h2>Dialog Title</h2>
    <p>Dialog content.</p>
    <button class="btn-primary">Confirm</button>
    <button class="btn-ghost">Cancel</button>
  </div>
</div>
```

### Table

```css
.table { width: 100%; border-collapse: collapse; }
.table th {
  text-align: left;
  padding: 8px 12px;
  font-weight: 500;
  font-size: 12px;
  color: #6a7282;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #cccccc;
}
.table td {
  padding: 12px;
  border-bottom: 1px solid #cccccc;
}
```

```html
<table class="table">
  <thead><tr><th>Name</th><th>Status</th><th>Date</th></tr></thead>
  <tbody>
    <tr><td>Item One</td><td>Active</td><td>Jan 1</td></tr>
    <tr><td>Item Two</td><td>Pending</td><td>Jan 2</td></tr>
  </tbody>
</table>
```

### Navigation

```css
.nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
}
.nav-link {
  color: #6a7282;
  padding: 8px 12px;
  border-radius: 2rem;
  transition: color 150ms;
}
.nav-link:hover { color: #101828; }
.nav-link.active { color: #ff8b1a; }
```

```html
<nav class="nav">
  <a href="/" class="nav-link active">Home</a>
  <a href="/about" class="nav-link">About</a>
  <a href="/pricing" class="nav-link">Pricing</a>
  <button class="btn-primary" style="margin-left: auto">Get Started</button>
</nav>
```

### Extracted Components

These components were found in the codebase:

**Button** (`html`)

**Card** (`html`)
- Variants: `/60`, `/70`, `/40`, `/50`, `/80`

**Navigation** (`html`)

## Page Structure

The following page sections were detected:

- **Navigation** — Top navigation bar (2 items)
- **Hero** — Hero section (detected from heading structure)
- **Faq** — FAQ/accordion section
- **Footer** — Page footer with links and info (17 items)
- **Cards** — Grid of 13 card elements (13 items)

When building pages, follow this section order and structure.

## Animation & Motion

This project uses **expressive motion**. Animations are part of the design language.

### CSS Animations

- `marquee`
- `orbit-spin`
- `orbit-counter-spin`
- `pulse-glow`
- `spin`

### Motion Tokens

- **Duration scale:** `.2s`, `.3s`, `.5s`, `.7s`, `1s`, `200ms`
- **Animated properties:** `box-shadow`, `border-color`

### Motion Guidelines

- **Duration:** Use values from the duration scale above. Short (.2s) for micro-interactions, long (200ms) for page transitions
- **Easing:** `ease-out` for enters, `ease-in` for exits
- **Direction:** Elements enter from bottom/right, exit to top/left
- **Reduced motion:** Always respect `prefers-reduced-motion` — disable animations when set

## Depth & Elevation

### Shadow Tokens

- Floating (dropdowns, popovers): `0 0 12px #09c6b840`
- Floating (dropdowns, popovers): `0 0 20px #09c6b866`

### Z-Index Scale

`0, 10, 20, 30, 50, 90, 95, 100, 110, 2147483647`

Use these exact values — never invent z-index values.

## Anti-Patterns (Never Do)

- **No zebra striping** — tables and lists use borders for separation
- **No invented colors** — every hex value must come from the palette above
- **No arbitrary spacing** — every dimension is a multiple of 4px
- **No extra fonts** — only Geist and SFMono-Regular are allowed
- **No arbitrary border-radius** — use the scale: .25rem, 1.1rem, 1.25rem, 1.5rem, 2px, 2rem, 2.5rem, 3rem, 12px
- **No opacity for disabled states** — use muted colors instead

## Workflow

1. **Read** `references/DESIGN.md` before writing any UI code
2. **Pick colors** from the Color System section — never invent new ones
3. **Set typography** — Geist, SFMono-Regular only, using the type scale
4. **Build layout** on the 4px grid — check every margin, padding, gap
5. **Match components** to patterns above before creating new ones
6. **Apply elevation** — use shadow tokens
7. **Validate** — every value traces back to a design token. No magic numbers.

## Brand Spec

- **Favicon:** `/favicon.ico`
- **Site URL:** `https://www.galileostudio.ai/es`
- **Brand color:** `#ff8b1a`
- **Brand typeface:** Geist

## Quick Reference

```
Background:     #ffffff
Surface:        #07131b
Text:           #101828 / #6a7282
Accent:         #ff8b1a
Border:         (not extracted)
Font:           Geist
Spacing:        4px grid
Radius:         2rem
Components:     8 detected
```

## When to Trigger

Activate this skill when:
- Creating new components, pages, or visual elements for galileostudio
- Writing CSS, Tailwind classes, styled-components, or inline styles
- Building page layouts, templates, or responsive designs
- Reviewing UI code for design consistency
- The user mentions "galileostudio" design, style, UI, or theme
- Generating mockups, wireframes, or visual prototypes

---

# Full Reference Files

> Every output file is embedded below. Claude has full design system context from /skills alone.

## Design System Tokens (DESIGN.md)

# galileostudio DESIGN.md

> Auto-generated design system — reverse-engineered via static analysis by skillui.
> Frameworks: None detected
> Colors: 20 · Fonts: 2 · Components: 8
> Icon library: not detected · State: not detected
> Primary theme: light · Dark mode toggle: no · Motion: expressive

## Visual Reference

**Match this design exactly** — study colors, fonts, spacing, and component shapes before writing any UI code.

![galileostudio Homepage](../screenshots/homepage.png)

---

## 1. Visual Theme & Atmosphere

This is a **light-themed** interface with a warm, approachable feel. The light background emphasizes content clarity. Typography uses **Geist** throughout — a clean, modern choice that maintains consistency. Spacing follows a **4px base grid** (compact density), with scale: 4, 8, 12, 16, 20, 24, 28, 32px. The accent color **#ff8b1a** anchors interactive elements (buttons, links, focus rings). Motion is expressive — spring physics, layout animations, and staggered reveals are part of the visual language.

---

## 2. Color Palette & Roles

| Token | Hex | Role | Use |
|---|---|---|---|
| tw-ring-offset-color | `#ffffff` | background | Page background, darkest surface |
| card | `#07131b` | surface | Card and panel backgrounds |
| color-gray-100 | `#f3f4f6` | surface | Card and panel backgrounds |
| color-gray-900 | `#101828` | text-primary | Headings and body text |
| color-gray-500 | `#6a7282` | text-muted | Captions, placeholders, secondary info |
| color-orange-400 | `#ff8b1a` | accent | CTAs, links, focus rings, active states |
| color-red-500 | `#fb2c36` | danger | Error states, destructive actions |
| color-amber-400 | `#fcbb00` | warning | Warning states, caution indicators |
| color-blue-500 | `#3080ff` | info | Informational highlights |
| color-blue-400 | `#54a2ff` | unknown | Palette color |
| color-violet-400 | `#a685ff` | unknown | Palette color |
| color-violet-500 | `#8d54ff` | unknown | Palette color |
| color-black | `#000000` | unknown | Palette color |
| ring | `#09c6b8` | unknown | Palette color |
| color-red-400 | `#ff6568` | unknown | Palette color |
| color-cyan-200 | `#a2f4fd` | unknown | Palette color |
| color-cyan-400 | `#00d2ef` | unknown | Palette color |
| color-violet-300 | `#c4b4ff` | unknown | Palette color |
| color-zinc-900 | `#18181b` | unknown | Palette color |
| color-red-700 | `#bf000f` | unknown | Palette color |

### CSS Variable Tokens

```css
--tw-border-style: solid;
--tw-border-style: dashed;
--background: #030609;
--foreground: #f4f7fb;
--card: #07131b;
--card-foreground: #f4f7fb;
--primary: #8aceb3;
--primary-foreground: #021817;
--secondary: #10202b;
--secondary-foreground: #edf4f8;
--muted: #0a161f;
--muted-foreground: #9cb5c4;
--accent: #0b1d25;
--accent-foreground: #f4f7fb;
--border: #15414b;
--tw-border-style: solid;
--tw-border-style: dashed;
--background: #030609;
--foreground: #f4f7fb;
--card: #07131b;
```


---

## 3. Typography Rules

**Font Stack:**
- **Geist** — Heading 1, Heading 2, Heading 3, Body, Caption
- **SFMono-Regular** — Code

**Font Sources:**

```css
@font-face {
  font-family: "Geist";
  src: url("fonts/Geist-Bold.ttf") format("truetype");
  font-weight: 700;
}
@font-face {
  font-family: "Geist";
  src: url("fonts/Geist-Regular.ttf") format("truetype");
  font-weight: 400;
}
```

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading 1 | Geist | 11px | 700 |
| Heading 2 | Geist | 10px | 700 |
| Heading 3 | Geist | 9px | 700 |
| Body | Geist | 8px | 400 |
| Caption | Geist | inherit | 400 |
| Code | SFMono-Regular | 14px | 400 |

**Typographic Rules:**
- Use **Geist** for all text — do not mix font families
- Maintain consistent hierarchy: no more than 3-4 font sizes per screen
- Headings use bold (600-700), body uses regular (400)
- Line height: 1.5 for body text, 1.2 for headings
- Use color and opacity for secondary hierarchy, not additional font sizes


---

## 4. Component Stylings

### Layout (1)

**Footer** — `html`

### Navigation (1)

**Navigation** — `html`

### Data Display (2)

**Card** — `html`
- Variants: `/60`, `/70`, `/40`, `/50`, `/80`

**List** — `html`

### Data Input (1)

**Button** — `html`
- Animation: 

### Media (3)

**Image** — `html`

**Icon** — `html`

**Map/Canvas** — `html`



---

## 5. Layout Principles

- **Base spacing unit:** 4px
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48
- **Border radius:** .25rem, 1.1rem, 1.25rem, 1.5rem, 2px, 2rem, 2.5rem, 3rem, inherit, 12px
- **Max content width:** 96rem

**Spacing as Meaning:**
| Spacing | Use |
|---|---|
| 4-8px | Tight: related items within a group |
| 12-16px | Medium: between groups |
| 24-32px | Wide: between sections |
| 48px+ | Vast: major section breaks |


---

## 6. Depth & Elevation

### Floating — dropdowns, popovers, modals

- `0 0 12px #09c6b840`
- `0 0 20px #09c6b866`

### Z-Index Scale

`0, 10, 20, 30, 50, 90, 95, 100, 110, 2147483647`



---

## 7. Animation & Motion

This project uses **expressive motion**. Animations are an integral part of the experience.

### CSS Animations

- `@keyframes marquee`
- `@keyframes orbit-spin`
- `@keyframes orbit-counter-spin`
- `@keyframes pulse-glow`
- `@keyframes spin`
- `@keyframes pulse`

### Animated Components

- **Button**: 

### Motion Guidelines

- Duration: 150-300ms for micro-interactions, 300-500ms for page transitions
- Easing: `ease-out` for enters, `ease-in` for exits
- Always respect `prefers-reduced-motion`


---

## 8. Do's and Don'ts

### Do's

- Use `#ff8b1a` for interactive elements (buttons, links, focus rings)
- Use `#ffffff` as the primary page background
- Use **Geist** for all UI text
- Follow the **4px** spacing grid for all margins, padding, and gaps
- Use the defined shadow tokens for elevation — see Section 6
- Use border-radius from the scale: .25rem, 1.1rem, 1.25rem, 1.5rem, 2px
- Reuse existing components from Section 4 before creating new ones

### Don'ts

- Don't introduce colors outside this palette — extend the design tokens first
- Don't mix font families — use Geist consistently
- Don't use arbitrary spacing values — stick to multiples of 4px
- Don't create custom box-shadow values outside the system tokens
- Don't use arbitrary border-radius values — pick from the defined scale
- Don't duplicate component patterns — check Section 4 first


---

## 9. Responsive Behavior

| Name | Value | Source |
|---|---|---|
| sm | 40rem | css |
| md | 48rem | css |
| lg | 64rem | css |
| xl | 80rem | css |
| 2xl | 96rem | css |

**Approach:** Use `@media (min-width: ...)` queries matching the breakpoints above.


---

## 10. Agent Prompt Guide

Use these as starting points when building new UI:

### Build a Card

```
Background: #07131b
Border: 1px solid var(--border)
Radius: 2rem
Padding: 16px
Font: Geist
Use shadow tokens from Section 6.
```

### Build a Button

```
Primary: bg #ff8b1a, text white
Ghost: bg transparent, border var(--border)
Padding: 8px 16px
Radius: 2rem
Hover: opacity 0.9 or lighter shade
Focus: ring with #ff8b1a
```

### Build a Page Layout

```
Background: #ffffff
Max-width: 96rem, centered
Grid: 4px base
Responsive: mobile-first, breakpoints from Section 9
```

### Build a Stats Card

```
Surface: #07131b
Label: #6a7282 (muted, 12px, uppercase)
Value: #101828 (primary, 24-32px, bold)
Status: use success/warning/danger from Section 2
```

### Build a Form

```
Input bg: #ffffff
Input border: 1px solid var(--border)
Focus: border-color #ff8b1a
Label: #6a7282 12px
Spacing: 16px between fields
Radius: 2rem
```

### General Component

```
1. Read DESIGN.md Sections 2-6 for tokens
2. Colors: only from palette
3. Font: Geist, type scale from Section 3
4. Spacing: 4px grid
5. Components: match patterns from Section 4
6. Elevation: shadow tokens
```

## Bundled Fonts (fonts/)

The following font files are bundled in the `fonts/` directory:

- `fonts/Geist-Black.ttf`
- `fonts/Geist-Bold.ttf`
- `fonts/Geist-ExtraBold.ttf`
- `fonts/Geist-ExtraLight.ttf`
- `fonts/Geist-Light.ttf`
- `fonts/Geist-Medium.ttf`
- `fonts/Geist-Regular.ttf`
- `fonts/Geist-SemiBold.ttf`
- `fonts/Geist-Thin.ttf`

Use these local font files in `@font-face` declarations instead of fetching from Google Fonts.

## Homepage Screenshots (screenshots/)

![homepage.png](screenshots/homepage.png)

