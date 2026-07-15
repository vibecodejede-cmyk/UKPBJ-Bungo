---
name: Civic Authority
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#434652'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#747783'
  outline-variant: '#c4c6d3'
  surface-tint: '#345baf'
  primary: '#002869'
  on-primary: '#ffffff'
  primary-container: '#0b3d91'
  on-primary-container: '#8dadff'
  inverse-primary: '#b1c5ff'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#262d33'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c434a'
  on-tertiary-container: '#a9afb8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001947'
  on-primary-fixed-variant: '#144296'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#dde3ec'
  tertiary-fixed-dim: '#c1c7d0'
  on-tertiary-fixed: '#161c23'
  on-tertiary-fixed-variant: '#41474f'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
  stack-xs: 0.25rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system is engineered for public trust, stability, and administrative efficiency. It prioritizes clarity and institutional authority, ensuring that citizens and administrators feel a sense of security and professionalism.

The aesthetic follows a **Corporate / Modern** direction with a strict adherence to accessibility standards. It utilizes a structured grid, high-contrast typography, and a "clean official" look that avoids unnecessary decoration in favor of functional density and hierarchical clarity. The interface should feel permanent, reliable, and meticulously organized.

## Colors

The palette is anchored by "Garuda Blue," representing the state's authority and depth. This is complemented by "State Gold," reserved for high-value accents, active states, and honors.

- **Primary (Garuda Blue):** Used for headers, primary buttons, and institutional branding.
- **Secondary (State Gold):** Used sparingly for highlighting key actions, active navigation markers, and premium status indicators.
- **Surface & Backgrounds:** The design utilizes a systematic grayscale. Backgrounds are kept at a clean `#F8FAFC` to ensure content readability, while borders use a subtle `#CBD5E1` to define structure without adding visual noise.
- **Semantic Colors:** 
  - Success: `#15803D` (Forest Green)
  - Warning: `#B45309` (Amber)
  - Error: `#B91C1C` (Crimson)

## Typography

This design system uses **Inter** exclusively for its exceptional legibility across digital displays and its neutral, systematic character. 

- **Headlines:** Use Bold (700) or SemiBold (600) weights to establish clear hierarchy. Display sizes are reserved for landing pages and major portal entry points.
- **Body Text:** Standardized at 16px for optimal readability. For dense data tables or admin panels, the `body-sm` (14px) variant is permissible.
- **Labels:** Used for buttons, navigation items, and table headers. Always use Medium (500) or SemiBold (600) to distinguish them from body copy.

## Layout & Spacing

The system uses a **Fixed Grid** for desktop (12 columns) and a **Fluid Grid** for mobile (4 columns). 

- **Sidebars:** The admin dashboard utilizes a fixed-width left navigation (280px) that collapses to an icon-only rail (72px) on smaller viewports.
- **Content Density:** In administrative contexts, use a compact spacing scale (8px increments) to allow for data-heavy views. In public-facing portal pages, increase vertical rhythm (`stack-lg`) to facilitate scanning.
- **Safe Areas:** Ensure a minimum margin of 24px around all primary content containers on desktop and 16px on mobile.

## Elevation & Depth

To maintain an authoritative and professional feel, the design system avoids heavy shadows and floating elements. Depth is communicated through **Tonal Layers** and **Low-contrast Outlines**.

- **Level 0 (Floor):** Background color `#F8FAFC`.
- **Level 1 (Cards/Sidebar):** White surface with a 1px solid border of `#E2E8F0`. No shadow.
- **Level 2 (Dropdowns/Modals):** White surface with a subtle ambient shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) and a border of `#CBD5E1`.
- **Interactions:** Hover states on interactive cards should transition from a 1px border to a 2px border using the Primary color or a slightly darker neutral tint.

## Shapes

The design system uses a **Soft (0.25rem)** roundedness profile. This subtle rounding removes the harshness of a strictly sharp UI while maintaining a disciplined, institutional appearance.

- **Buttons & Inputs:** Use the standard 0.25rem (4px) radius.
- **Document Cards:** May use the `rounded-lg` (0.5rem) variant to slightly soften larger surface areas.
- **Status Badges:** Use a fully rounded "pill" shape to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Garuda Blue (#0B3D91) background with White text.
- **Secondary:** White background with Garuda Blue border and text.
- **Action:** State Gold (#C5A059) used exclusively for "final" or "highlighted" actions like 'Submit' or 'Pay'.

### Document Cards
Document containers must include a 1px border, a file-type icon in the top left, and a metadata footer (Date, Size, Visibility) separated by a subtle horizontal rule.

### Status Badges
Used for institutional tracking. Consistent height of 24px with uppercase 12px bold text:
- **Open:** Light Blue background, Garuda Blue text.
- **In Progress:** Light Gold background, Brown/Gold text.
- **Resolved:** Light Green background, Dark Green text.

### Admin Multi-level Sidebar
- **Top Level:** Icon + Label in Medium weight.
- **Nested Level:** Indented 32px with a vertical connecting line. Active state is indicated by a 4px thick "State Gold" left-edge border on the active item.

### Input Fields
Strict rectangular forms with 1px border. On focus, the border thickens to 2px in Garuda Blue with a 2px offset "halo" in a 10% opacity blue. Label text sits strictly above the field.