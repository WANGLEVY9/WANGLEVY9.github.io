# Taijie Wang Academic Portfolio — Design Foundation

## 1. Positioning

The site presents Taijie Wang as a researcher in formation and an engineer in
practice. Its central narrative is not a chronological resume dump. It is the
connection between three concerns:

1. AI for software testing.
2. Human-agent collaboration.
3. Assurance for autonomous systems.

The visual tone should feel composed, rigorous, quiet, and assured. It should
avoid startup marketing language, excessive decoration, and generic academic
blog styling.

## 2. Information Architecture

| Section | Purpose | Primary evidence |
| --- | --- | --- |
| Hero | Establish name, affiliation, and research identity | NJU, research statement |
| Profile | Give a concise academic biography | Education, affiliations, interests |
| Research Focus | Explain the intellectual agenda | Three connected research themes |
| Experience | Show academic and professional trajectory | Labs, Tencent, leadership |
| Selected Work | Turn methods into tangible systems | Testing platform, VidForge |
| Honors | Provide concise external validation | Competitions, scholarships |
| Contact | Invite research and engineering conversations | Email, GitHub, CV |

Later additions can introduce Publications and News between Research Focus and
Experience without changing the overall visual rhythm.

## 3. Visual Language

### Palette

- Paper: `#F4F1EA`
- Bright paper: `#FBFAF6`
- Ink: `#17211D`
- Forest: `#143B34`
- Deep forest: `#0D2924`
- Academic blue: `#345B72`
- Champagne gold: `#AD8B50`
- Oxblood accent: `#713F3D`

Gold is an annotation color, not a dominant fill. Forest carries the main
institutional tone. Blue and oxblood prevent the system from becoming a
single-hue palette.

### Typography

- Display and editorial copy: Cormorant Garamond, with Iowan Old Style and
  Georgia as local fallbacks.
- Navigation, metadata, and interface copy: Manrope, with the system UI stack as
  a fallback.
- The serif family provides an expressive editorial voice; the sans-serif
  family preserves precision and legibility for navigation and dense metadata.
- Display sizes use bounded `clamp()` values and retain stable mobile limits.

### Shape and spacing

- Corners stay square or nearly square.
- Major sections are full-width bands.
- Cards are reserved for repeated project items.
- Borders are thin and structural.
- Section rhythm uses a generous `96–176px` vertical range.

## 4. Interaction Principles

- Motion is quiet and directional: short reveals, line travel, and a subtle
  research-graph canvas.
- Every animation has a reduced-motion fallback.
- A fixed left-side index provides desktop navigation and reflects the active
  section without consuming vertical space.
- Tablet and mobile layouts return to a compact top navigation bar with explicit
  open and close states.
- Email, GitHub, CV, and future paper/code links remain standard links.

## 5. Content Rules

- English is the sole public language for the first international release.
- Wording should follow professional academic English rather than literal
  translations of resume shorthand.
- Avoid claims that are not publicly verifiable or ready to announce.
- Planned submissions must be phrased as ongoing work, not accepted work.
- Publications should expose `paper`, `code`, `data`, and `demo` as optional
  links.
- Project descriptions should foreground the problem and contribution before
  listing technology.

## 6. Portrait Specification

The reserved portrait area expects:

- A vertical image with a `4:5` crop.
- Neutral or architectural background.
- Soft directional light, natural expression, and restrained clothing.
- At least `1600 × 2000px`.
- No heavy beauty retouching or busy laboratory props.

The current portrait is stored at `assets/images/portrait.jpg` and displayed
with a non-destructive CSS crop. Adjust `object-position`, `transform`, and
`transform-origin` to refine the composition without modifying the source image.

## 7. Planned Components

- `PublicationItem`: preview, venue, title, author line, and optional links.
- `NewsEntry`: date, event, and optional source.
- `ProjectCard`: category, period, visual, description, tags, links.
- `TimelineItem`: period, type, institution, role, and contribution.
- `HonorRow`: year, award, and level.
- `LanguageSwitch`: future full Chinese/English content switch.

## 8. Accessibility Baseline

- Semantic regions and heading order.
- Keyboard-accessible navigation and skip link.
- Visible focus behavior through native browser outlines.
- Minimum body contrast against both paper and forest backgrounds.
- Responsive text wrapping down to `320px`.
- Reduced-motion support.
