// WhoCan — Border Radius Tokens
// Based on Untitled UI PRO v4.0
//
// Radius rules for this project:
//   interactive  → 9999px (full pill): buttons/CTAs, single-line inputs, dropdowns, badges, tags
//   container    → 16px  (2xl):        cards, modals, panels, multi-line inputs, taller elements
//   element      → 8px   (md):         tooltips, popovers, small chips, menus

export const radii = {
  none: '0px',
  xxs:  '2px',
  xs:   '4px',
  sm:   '6px',
  md:   '8px',
  lg:   '10px',
  xl:   '12px',
  '2xl': '16px',
  '3xl': '20px',
  '4xl': '24px',
  full: '9999px',
} as const;

// Semantic radius map — use these in components instead of raw values
export const componentRadii = {
  interactive: radii.full,    // buttons, single-line inputs, dropdowns, badges
  container:   radii['2xl'],  // cards, modals, multi-line inputs, panels
  element:     radii.md,      // tooltips, menus, small chips
} as const;

export type RadiusKey = keyof typeof radii;
export type ComponentRadiusKey = keyof typeof componentRadii;
