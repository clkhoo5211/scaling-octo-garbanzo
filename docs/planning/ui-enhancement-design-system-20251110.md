# UI Enhancement - Design System Updates

**Created:** 2025-11-10  
**Agent:** `/design`  
**Related:** `ui-enhancement-prompt-20251110.md`  
**Status:** 🎨 Ready for Design Review

---

## Design System Updates

### 1. Color Palette Refinement

**Current Palette:**
```typescript
primary: {
  DEFAULT: "#6366F1", // Indigo
  dark: "#4F46E5",
  light: "#818CF8",
}
```

**Enhanced Palette:**
```typescript
// Light Mode
background: {
  base: "#FAFAFA",      // Softer than pure white
  elevated: "#FFFFFF",  // Cards, modals
  overlay: "rgba(0,0,0,0.5)", // Backdrops
}

text: {
  primary: "#1F2937",   // Better contrast
  secondary: "#6B7280",  // Muted but readable
  tertiary: "#9CA3AF",  // Subtle metadata
}

// Dark Mode
background: {
  base: "#0F172A",      // Keep current
  elevated: "#1E293B",  // Cards
  overlay: "rgba(0,0,0,0.7)", // Backdrops
}

text: {
  primary: "#F1F5F9",   // Keep current
  secondary: "#94A3B8", // Better contrast
  tertiary: "#64748B",  // Subtle metadata
}
```

### 2. Typography Scale

**Current:** Basic Tailwind defaults  
**Enhanced:** Consistent type scale

```typescript
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1rem' }],
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  'base': ['1rem', { lineHeight: '1.5rem' }],
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
}
```

**Usage:**
- Article titles: `text-xl` or `text-2xl` (mobile/desktop)
- Body text: `text-base` with `leading-relaxed`
- Metadata: `text-sm` with `text-gray-600`
- Headings: `font-semibold` or `font-bold`

### 3. Spacing System

**Enhanced Spacing:**
- Cards: `p-5` or `p-6` (more breathing room)
- Feed gaps: `gap-4` or `gap-6` between cards
- Section spacing: `py-8` or `py-12`
- Container padding: `px-4 sm:px-6 lg:px-8`

### 4. Shadow & Elevation

**Card Shadows:**
```typescript
shadow: {
  'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
}
```

**Usage:**
- Default cards: `shadow-card`
- Hover state: `hover:shadow-card-hover`
- Modals: `shadow-modal`

### 5. Border Radius

**Consistent Radius:**
```typescript
borderRadius: {
  'sm': '0.375rem',   // 6px - Small elements
  'md': '0.5rem',     // 8px - Buttons
  'lg': '0.75rem',    // 12px - Cards
  'xl': '1rem',       // 16px - Large cards
  '2xl': '1.5rem',    // 24px - Modals
  'full': '9999px',   // Pills, avatars
}
```

### 6. Animation & Transitions

**Transition Timing:**
```typescript
transitionDuration: {
  'fast': '150ms',
  'normal': '200ms',
  'slow': '300ms',
}
```

**Easing Functions:**
- Default: `ease-out`
- Hover: `ease-in-out`
- Modal: `ease-out` with slight bounce

**Animation Patterns:**
- Card hover: `transform scale-[1.02]` + `shadow-card-hover`
- Button press: `scale-[0.98]` on active
- Modal enter: `fade-in` + `slide-up`
- Loading: `shimmer` effect on skeletons

### 7. Component Variants

**Button Variants:**
- Primary: Solid background, white text
- Secondary: Outlined, transparent background
- Ghost: No border, hover background
- Danger: Red variant for destructive actions

**Card Variants:**
- Default: Standard article card
- Compact: Smaller for lists
- Featured: Larger with emphasis
- Minimal: Borderless, subtle background

### 8. Responsive Breakpoints

**Tailwind Defaults (Enhanced):**
```typescript
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

**Usage Patterns:**
- Mobile-first: Base styles for mobile
- Progressive enhancement: Add desktop styles with `md:`, `lg:`
- Hide/show: Use `hidden md:block` for responsive visibility

---

## Design Consistency Checklist

- [ ] Colors follow palette consistently
- [ ] Typography uses scale consistently
- [ ] Spacing follows system
- [ ] Shadows/elevation used correctly
- [ ] Border radius consistent
- [ ] Animations smooth and purposeful
- [ ] Components follow variant patterns
- [ ] Responsive breakpoints used correctly
- [ ] Dark mode colors properly implemented
- [ ] Accessibility contrast ratios met

---

## Reference: Modern Design Patterns

**From Folo & Similar Platforms:**
- Clean, minimal interfaces
- Generous whitespace
- Subtle shadows for depth
- Smooth, purposeful animations
- Content-first design
- Consistent visual language

---

**Next Steps:** Coordinate with `/develop` for implementation

