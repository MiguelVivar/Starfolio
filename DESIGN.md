<!-- SEED: established with the user before implementation; re-run $impeccable document once there's real code to capture the actual tokens and components. -->

---
name: Starfolio
description: A monochrome instrument for cataloguing GitHub stars, with one warm accent reserved for the thing that matters.
colors:
  neutral-0: "oklch(99% 0 0)"
  neutral-50: "oklch(97% 0.002 250)"
  neutral-100: "oklch(93% 0.003 250)"
  neutral-300: "oklch(75% 0.004 250)"
  neutral-600: "oklch(45% 0.004 250)"
  neutral-800: "oklch(22% 0.004 250)"
  neutral-950: "oklch(12% 0.004 250)"
  star-accent: "oklch(78% 0.15 75)"
  star-accent-deep: "oklch(62% 0.16 70)"
  signal-danger: "oklch(58% 0.21 27)"
typography:
  ui:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
  data:
    fontFamily: "Geist Mono, 'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
---

# Design System: Starfolio

## Overview

**Creative North Star: "The Star Ledger"**

Starfolio is an instrument, not a brochure: a developer types a username and the tool produces a precise, dense, trustworthy record of every repository that person has starred. The visual world is pinned to the brief's own canon — Linear, Vercel, and GitHub — three products that share one discipline: an almost-monochrome surface, restrained motion, and typography that never competes with the data it's presenting. Starfolio inherits that discipline directly, at that craft bar, rather than inventing a softer or more decorative alternative.

The one deliberate departure from pure monochrome is the product's own subject: a star. A single warm, low-saturation gold — the same character as GitHub's star glyph, desaturated enough to sit inside a restrained system rather than shout — is reserved for the primary action, the star count itself, and focus states. Everywhere else stays neutral. The accent's rarity is what makes it legible as "the thing that matters" rather than decoration.

This is an Operate surface: a visitor came to complete a task (export their stars), not to be persuaded or entertained. Expression never gets in front of the task, the data, or a familiar keyboard-driven affordance.

**Key Characteristics:**
- Near-monochrome neutral scale, both themes fully supported, no forced default
- One accent color (warm gold), used on well under 10% of any screen
- Dense, tabular, information-first layout — the table is the product
- Flat by default; hairline borders do the separating work shadows would otherwise do
- Geist for UI text, Geist Mono for every numeric or identifier-shaped value (stars, forks, dates, repo names)

## Colors

Two theme-aware neutral ramps (light and dark share the same roles, inverted), plus one warm accent. Restrained strategy: the accent never owns a region, only small, meaningful marks.

### Primary
- **Star Gold** (`star-accent`, oklch(78% 0.15 75)): primary button fill, star-count emphasis in the table, active/selected row indicator, focus ring. `star-accent-deep` (oklch(62% 0.16 70)) is its hover/pressed state.

### Neutral
- **Paper** (`neutral-0`, oklch(99% 0 0)): light-mode page background.
- **Panel** (`neutral-50`, oklch(97% 0.002 250)): light-mode surface (table header, toolbar).
- **Hairline** (`neutral-100` light / lightened `neutral-800` dark): borders, table row dividers.
- **Muted text** (`neutral-600`, oklch(45% 0.004 250)): secondary text — descriptions, timestamps, counts labels.
- **Ink** (`neutral-950` on light / `neutral-0` on dark): primary text.
- **Void** (`neutral-950`, oklch(12% 0.004 250)): dark-mode page background; `neutral-800` is dark-mode surface.

### Named Rules
**The One Spark Rule.** Star Gold appears only where it names the product's literal subject (a star count, the primary action, focus) or a selection state. It never fills a background region, a nav bar, or a decorative shape.

## Typography

**UI Font:** Geist (fallback: system sans stack) — chosen because Vercel, one of the three canon references, is this font's own source; using it is a direct citation, not a default.
**Data/Mono Font:** Geist Mono (fallback: JetBrains Mono, ui-monospace) — every cell that is a number, a date, or an identifier (repo `owner/name`, star count, size) renders in mono so columns of numbers actually align.

**Character:** Functional and quiet. Geist's low-contrast, slightly condensed forms read as an engineering tool, not a marketing face; mono for data gives the table the feel of a real ledger rather than a styled list.

### Hierarchy
- **Title** (600, 1.25rem, 1.3 line-height): page title / "Starfolio" wordmark, section headers.
- **Body** (400, 0.9375rem, 1.45 line-height): labels, descriptions, buttons, form text.
- **Data** (400, 0.8125rem mono, 1.4 line-height): every table cell holding a repo name, count, date, or language.
- **Label** (500, 0.75rem, 0.02em tracking, uppercase): table column headers, small status badges.

### Named Rules
**The Mono-For-Numbers Rule.** Any value a user might scan down a column — stars, forks, size, dates — is set in Geist Mono, full stop, so the eye can compare across rows without re-parsing proportional digits.

## Layout

Single-column, task-first composition: username input at top, a fixed toolbar (search, sort, format export) once results exist, then the table filling the remaining viewport. No marketing hero, no sidebar chrome — the mode is Operate, so the interface gets out of the way of the task within one viewport wherever possible. Spacing rhythm uses the `xs`–`xl` scale (4/8/16/24/40px); more space sits above a new section than below its own heading. Responsive collapse: the table degrades to a stacked card list below ~640px rather than horizontal-scrolling a dense grid.

## Elevation & Depth

Flat by default, matching the canon (Linear, Vercel, GitHub all favor tonal/hairline separation over shadow). Depth is conveyed by a one-step surface shift (`neutral-0` → `neutral-50`, or `neutral-950` → `neutral-800`) plus a 1px hairline border, not by shadow. A shadow appears only on truly floating layers — a dropdown menu, a toast — never on resting cards or table rows.

### Named Rules
**The Flat-By-Default Rule.** Surfaces at rest use a tonal step and a hairline, never a shadow. Shadow is reserved for elements that visually float above the page (menus, toasts, modals).

## Shapes

Modest, consistent rounding (6-8px) on every interactive surface — buttons, inputs, the table container, badges — never sharp rectangles, never heavily pilled. Borders are hairline (1px) and low-contrast; they divide, they don't decorate.

## Components

### Buttons
- **Shape:** 8px radius (`rounded.md`)
- **Primary:** Star Gold fill, `neutral-950` text, used once per view (the export action / the submit action)
- **Secondary/Ghost:** hairline border or no border, neutral text, used for everything else (sort toggles, format picks)
- **Hover/Focus:** primary darkens to `star-accent-deep`; all interactive elements get a visible Star Gold focus ring for keyboard use

### Inputs
- **Style:** hairline border, `rounded.sm` (6px), neutral surface, mono type if the value being typed is itself an identifier (the GitHub username field uses mono)
- **Focus:** border shifts to Star Gold, no glow/blur — a crisp state change, not a soft one

### Table (signature component)
- Dense rows, hairline row dividers, sticky header in `Label` type
- Sortable columns show a small mono arrow beside the active column's label
- Star count column is the one place Star Gold appears inside a row
- Row hover: a one-step tonal surface shift only, no shadow, no border color change

### Badges / Chips
- Used for language, license, visibility (public/archived/fork)
- Neutral hairline chip by default; archived/fork states use `neutral-600` text to read as de-emphasized rather than alarming

## Do's and Don'ts

### Do:
- **Do** keep Star Gold under 10% of any single view.
- **Do** set every numeric/identifier table value in Geist Mono.
- **Do** support both light and dark themes from day one, following system preference with no forced default.
- **Do** use hairlines and tonal steps for separation before reaching for shadow.

### Don't:
- **Don't** add a marketing hero, gradient background, or decorative illustration — this is an Operate surface.
- **Don't** let Star Gold fill a background region, nav bar, or icon tile.
- **Don't** introduce a second accent color; the restrained strategy is the point.
- **Don't** use proportional type for anything a user would scan down a column.
