# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Product landing page for the Hanger Lamp — a wall-mounted sconce/hanger made from teak and aluminum. Single-page marketing site with scroll-linked product viewer, light/dark mode toggle, and a Batch 2 waitlist signup modal.

Deployed via Vercel from `main` branch to https://hangerlamp.com.

## Commands

- `npm run dev` — start dev server (Next.js)
- `npm run build` — production build
- `npm run lint` — ESLint (Next.js core-web-vitals + TypeScript rules)

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 (PostCSS plugin, config in `globals.css` via `@theme inline`)
- React Compiler enabled (`reactCompiler: true` in `next.config.ts`)
- `sharp` for image optimization

## Architecture

**Single-page app** — all UI lives in `app/page.tsx` (client component). No routing beyond the index page.

Key state in `page.tsx`:
- `activeImage` — controls which product shot is displayed (scroll-linked scrubber, vertical slider on desktop)
- `isOff` — light on/off toggle that swaps to dark mode
- `showSignup` / `signupSubmitted` / `signupLoading` — modal signup flow
- `scrollPos` — drives the marquee banner horizontal movement

Sections: Marquee banner → Hero (mobile text-first + desktop overlay) → Gallery grid → "Want in on Batch 2?" signup CTA → Footer

## Layout Breakpoints

Uses `lg:` (1024px) as the mobile/desktop breakpoint (not `md`). This ensures iPad gets the mobile layout which works better at tablet widths.

## Fonts

Loaded via Fontshare CDN in `layout.tsx`:
- **Satoshi 300 + 700** — headings, nav, buttons, marquee (`font-heading`)
- **Erode 400** — body text (`font-sans`, set as default on `body`)

## Colors & Theming

Light/dark mode is driven by the `isOff` React state, not CSS media queries:
- Light bg: `#E2DCDB`, dark bg: `#2a2a2a` / `#1a1a1a`
- Transitions use `duration-500` for smooth toggle

## Images

- Product shots: `public/images/productshots/_0.webp` through `_7.webp` (no `_6`)
- Dark mode variant: `public/images/productshots/_dark_on.webp`
- Gallery photos: `public/images/gallery/` (real product/lifestyle photos)
- Logo SVG: `public/logo.svg` (inlined in JSX for `currentColor` support)
- Spec sheet: `public/images/HangerLamp_Spec_Sheet.pdf`

**Hero image rendering**: All product shots are stacked with opacity toggling and `unoptimized` prop. Do NOT use src swapping or opacity transitions — this causes visible flashing. Images are preloaded via `new Image()` on mount.

## Signup Modal

Modal collects name, email, location, and room. Submits via GET request to a Google Apps Script endpoint (URL hardcoded in page.tsx). Shows a fake waitlist position number on confirmation.
