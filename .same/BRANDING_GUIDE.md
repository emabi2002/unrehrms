# UNRE GE System - Branding Guide

## 🎨 Official UNRE Colors

The system uses the official University of Natural Resources & Environment (UNRE) forest green color scheme extracted from the official university logo.

### Primary Green Palette

```css
Official UNRE Green Scale:
--unre-green-50:  #f0fdf4  /* Lightest - backgrounds */
--unre-green-100: #dcfce7  /* Light - hover states */
--unre-green-200: #bbf7d0  /* Light accents */
--unre-green-300: #86efac  /* Medium light */
--unre-green-400: #4ade80  /* Medium */
--unre-green-500: #22c55e  /* Base green */
--unre-green-600: #0f7037  /* PRIMARY UNRE FOREST GREEN ✅ (from official logo) */
--unre-green-700: #0d5f2e  /* Dark forest green */
--unre-green-800: #0a4d25  /* Darker green */
--unre-green-900: #083f1e  /* Darkest */
--unre-green-950: #042713  /* Near black-green */
```

### Primary Brand Color

**Official UNRE Forest Green**: `#0f7037` (unre-green-600)
- **RGB**: `rgb(15, 112, 55)`
- **HSL**: `hsl(142, 78%, 25%)`
- **Extracted from**: Official UNRE circular logo
- **Used for**: Buttons, links, active states, icons, headers
- **Gradient**: `from-unre-green-600 to-unre-green-700`

---

## 🖼️ Official UNRE Logo Usage

### Logo Description

The official University of Natural Resources & Environment logo features:
- **Design**: Circular badge with triangular abstract symbol
- **Colors**: Forest green (#0f7037) on white background
- **Text**: "PAPUA NEW GUINEA UNIVERSITY OF NATURAL RESOURCES & ENVIRONMENT" around the circle
- **Symbol**: Stylized triangular design representing natural resources

### Logo Location

The official UNRE logo is located at:
```
/public/images/unre-logo.png (primary)
/public/images/unre-logo.svg (vector fallback)
```

### Where the Logo Appears

1. **Header** (Landing Page)
   - Size: 48px × 48px
   - Format: PNG
   - Location: Top left corner with "UNRE" text

2. **Dashboard Sidebar**
   - Size: 40px × 40px
   - Format: PNG
   - Location: Top of sidebar with "GE System" text

3. **Login Page**
   - Size: 64px × 64px
   - Format: PNG
   - Location: Center top of form

4. **Mobile Menu**
   - Size: 40px × 40px
   - Format: PNG
   - Location: Mobile sidebar header

5. **PDF Documents**
   - Referenced in headers
   - Represents official UNRE branding

### Logo Implementation

```tsx
<img
  src="/images/unre-logo.png"
  alt="UNRE Logo"
  className="h-12 w-12 object-contain"
/>
```

### Logo Guidelines

- ✅ Always maintain aspect ratio
- ✅ Ensure sufficient white space around logo
- ✅ Use on white or light backgrounds for best visibility
- ✅ Never distort, rotate, or modify the logo
- ✅ Minimum size: 32px × 32px for digital use

---

## 🎯 Color Usage Throughout the System

### Updated Components

All components have been updated from blue to UNRE green:

#### ✅ Landing Page
- Background gradient: `from-slate-50 via-green-50 to-slate-50`
- Primary buttons: `from-unre-green-600 to-unre-green-700`
- Check icons: `text-unre-green-600`
- Feature highlights: `bg-unre-green-50`

#### ✅ Dashboard
- Active navigation: `bg-unre-green-50 text-unre-green-700`
- Icons: `text-unre-green-700`
- Primary actions: `from-unre-green-600 to-unre-green-700`
- Stats cards: `text-unre-green-600 bg-unre-green-50`

#### ✅ Login Page
- Background: `via-green-50`
- Logo: UNRE official logo
- Primary button: `from-unre-green-600 to-unre-green-700`
- Links: `text-unre-green-600`

#### ✅ Forms & Inputs
- Focus rings: `ring-unre-green-600`
- Active states: `border-unre-green-600`
- Success states: `bg-unre-green-50 text-unre-green-700`

---

## 🎨 CSS Variables

Updated in `globals.css`:

```css
:root {
  /* UNRE Green Primary Colors */
  --primary: 149 80% 30%; /* #16a34a */
  --primary-foreground: 0 0% 98%;

  /* Chart Colors (Green-based) */
  --chart-1: 149 80% 30%; /* Primary Green */
  --chart-2: 149 60% 45%; /* Light Green */
  --chart-3: 149 40% 60%; /* Lighter Green */
  --chart-4: 197 37% 24%; /* Teal */
  --chart-5: 173 58% 39%; /* Blue-Green */
}
```

---

## 📋 Design Principles

### Consistency
- ✅ All primary actions use `unre-green-600`
- ✅ All active states use `unre-green-50` backgrounds
- ✅ All success messages use green variants
- ✅ Logo appears consistently across all pages

### Accessibility
- ✅ Green colors meet WCAG AA contrast standards
- ✅ Text on green backgrounds uses white for readability
- ✅ Focus states are clearly visible

### Professional Appearance
- ✅ Gradients use subtle transitions (600→700→800)
- ✅ Hover states darken by one shade
- ✅ Consistent spacing around logo

---

## 🔄 Color Evolution

### Official UNRE Green Implementation

**Version 8+ (Official Logo Green)**:
- Primary color: `#0f7037` (Forest Green)
- RGB: `rgb(15, 112, 55)`
- HSL: `hsl(142, 78%, 25%)`
- Extracted from official UNRE circular logo

**Previous Version (Bright Green)**:
- Primary color: `#16a34a`
- Now replaced with official darker forest green

**Migration**:
- `#16a34a` → `#0f7037` (Official UNRE Green)
- `bg-unre-green-600` now uses official forest green
- `text-unre-green-700` darkened to match logo
- All gradients updated to use official colors

**Files Updated**:
1. `src/app/globals.css` - CSS variables (HSL values)
2. `tailwind.config.ts` - Tailwind color palette
3. `src/lib/pdf-generator.ts` - PDF header colors
4. All component files maintain class names (colors auto-update)
5. Branding guide updated with official specifications

---

## 🎯 Quick Reference

### Common Color Classes

| Usage | Tailwind Class |
|-------|---------------|
| Primary button | `bg-gradient-to-r from-unre-green-600 to-unre-green-700` |
| Active nav item | `bg-unre-green-50 text-unre-green-700` |
| Success message | `bg-unre-green-50 border-unre-green-200` |
| Icon highlight | `text-unre-green-600` |
| Hover state | `hover:bg-unre-green-700` |
| Light background | `bg-unre-green-50` |

### Common Gradients

```css
/* Primary button gradient (Official UNRE Forest Green) */
bg-gradient-to-r from-unre-green-600 to-unre-green-700
/* Result: #0f7037 → #0d5f2e */

hover:from-unre-green-700 hover:to-unre-green-800
/* Hover: #0d5f2e → #0a4d25 */

/* Hero section background */
bg-gradient-to-br from-slate-50 via-green-50 to-slate-50

/* Circular badge (Official UNRE Green) */
bg-gradient-to-br from-unre-green-600 to-unre-green-800
/* Result: #0f7037 → #0a4d25 */
```

---

## 📸 Logo Variations

### SVG Logo
- **File**: `unre-logo.svg`
- **Advantages**: Scalable, sharp at any size, small file
- **Use**: Default for all placements

### PNG Logo (Fallback)
- **File**: `unre-logo.png`
- **Advantages**: Universal compatibility
- **Use**: If SVG fails to load

---

## ✅ Branding Checklist

When adding new components:

- [ ] Use `unre-green-600` for primary actions
- [ ] Use `unre-green-50` for light backgrounds
- [ ] Use UNRE logo (not generic icons) for branding
- [ ] Use green gradients (not blue)
- [ ] Maintain consistent logo sizing
- [ ] Test colors for accessibility

---

## 🎓 UNRE Brand Identity

**University**: Papua New Guinea University of Natural Resources & Environment
**Location**: Papua New Guinea
**Primary Color**: Official Forest Green (#0f7037)
**Color Symbolism**: Natural resources, forests, environment, sustainability
**Logo Design**:
- Circular badge with text around perimeter
- Central triangular abstract symbol
- Represents natural resources and environmental stewardship
- Forest green color reflects PNG's rich natural heritage

**Official Logo Elements**:
- University name in circular text
- Abstract triangular symbol in center
- Forest green (#0f7037) as primary color
- White background for contrast

---

**This branding uses the official UNRE logo and color scheme, aligning perfectly with UNRE's identity as PNG's premier institution for natural resources and environmental education.** 🌿

---

**Last Updated**: January 2025
**Version**: 8.0
**Status**: Production Ready with Official Branding ✅
