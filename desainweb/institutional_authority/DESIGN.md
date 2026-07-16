---
name: Institutional Authority
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#444651'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#4b1c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e2c00'
  on-tertiary-container: '#f39461'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#773205'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for institutional trust, transparency, and high-stakes efficiency. It serves a government procurement portal where data density and clarity are paramount. The brand personality is authoritative yet modern—avoiding the "bureaucratic lag" of legacy systems in favor of a crisp, systematic aesthetic.

The visual style is **Corporate Modern**, leaning into high-utility minimalism. It prioritizes the "Information First" principle, ensuring that complex procurement data remains the focal point. The interface utilizes structured layouts, consistent rhythmic spacing, and a neutral-heavy environment to ensure that status indicators (Accents) are immediately perceptible.

## Colors
The palette is rooted in a "Trust Blue" foundation to establish immediate credibility. 

- **Primary (#1E3A8A):** Used for global navigation, headers, and core brand elements. It conveys stability and legal authority.
- **Secondary (#3B82F6):** Reserved for interactive elements like links and call-to-action buttons, providing enough vibrance to be noticed without appearing casual.
- **Neutral Stack:** Use White (#FFFFFF) for card surfaces and inputs. Light Gray (#F3F4F6) is the standard canvas color for the page background to reduce eye strain compared to pure white. Dark Slate (#1F2937) is used for all body text to ensure high contrast.
- **Semantic Accents:** Success Green and Warning Amber are used exclusively for status tags and system feedback (e.g., "Tender Active" or "Revision Required").

## Typography
This design system utilizes **Inter** for all roles. Inter’s tall x-height and exceptional legibility make it ideal for the data-rich environments of procurement tables and long-form legal guidelines.

**Hierarchy Rules:**
- **Headlines:** Use tight letter spacing for large headers to maintain a compact, "news" feel.
- **Body Text:** Use `body-md` for standard reading. For dense tables, `body-sm` is preferred to maximize data visibility without sacrificing readability.
- **Labels:** Uppercase styles should be reserved for table headers and section overlines to distinguish them from actionable data.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum container width of 1280px for desktop to ensure line lengths remain readable. 

- **Grid:** A 12-column grid is used for desktop. 
- **Rhythm:** An 8pt spacing system is strictly enforced. Vertical rhythm between paragraphs should be `16px`, while spacing between unrelated sections should be `48px`.
- **Mobile Reflow:** On mobile devices, side margins reduce to `16px`. Tables should be allowed to scroll horizontally, or collapse into card-based views depending on data complexity.

## Elevation & Depth
To maintain an institutional feel, the system avoids floating elements and heavy shadows. Instead, it uses **Tonal Layers** and **Low-Contrast Outlines**.

- **Z-Index 0 (Background):** #F3F4F6.
- **Z-Index 1 (Cards/Surfaces):** White (#FFFFFF) with a 1px border of #E5E7EB. 
- **Shadows:** Use a single, soft "Institutional Shadow" for primary cards: `0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)`.
- **Active States:** Elements being interacted with (like a focused input) should remove their shadow and gain a 2px Primary Blue outline to meet accessibility requirements.

## Shapes
The shape language is **Rounded**, utilizing a consistent `8px` (0.5rem) radius for standard components like buttons, cards, and input fields. 

- **Standard (8px):** Buttons, inputs, and small cards.
- **Large (16px):** Main dashboard containers or modal windows.
- **Pill:** Reserved exclusively for status badges (e.g., "Active", "Closed") to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid #1E3A8A with white text. High emphasis.
- **Secondary:** Outlined with #3B82F6 and matching text. Used for "Cancel" or "Download" actions.
- **States:** Hover state should darken the background color by 10%. Focus state requires a 2px offset ring for accessibility.

### Tables (Core Component)
- **Header:** Background #F9FAFB, text `label-md` in #1F2937.
- **Rows:** Zebra striping using #F3F4F6 on even rows.
- **Alignment:** Numerical data (prices, dates) should be right-aligned; text should be left-aligned.

### Input Fields
- **Default:** White background, 1px #D1D5DB border.
- **Labels:** Always placed above the field in `label-sm` weight. Never use placeholders as a replacement for labels.

### Cards
- Used for tender summaries. Features an 8px border-radius, a subtle 1px border, and a 16px internal padding. 

### Status Chips
- Pill-shaped with low-opacity backgrounds (e.g., Success Green at 10% opacity) and high-contrast text for maximum legibility.