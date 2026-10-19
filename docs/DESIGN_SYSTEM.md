# Taijie Wang Academic Portfolio — Design Foundation

## 1. Positioning

The site presents Taijie Wang as a researcher and engineer working on the
reliability of AI-driven software. It is organized as a compact research
dossier: evidence, production constraints, runnable systems, and external
signals each have a distinct page.

The visual direction combines an editorial research folio with the information
density of an instrument panel. Photography provides atmosphere; typography
sets the argument; monospaced labels only annotate technical structure.

## 2. Information Architecture

| Page        | Purpose                                       | Primary evidence                   |
| ----------- | --------------------------------------------- | ---------------------------------- |
| Profile     | Establish identity and route into the dossier | NJU, research focus, Tencent       |
| Research    | Present the current evidence base             | Three submitted manuscripts        |
| Industry    | Show production engineering and field context | Tencent governance systems, photos |
| Projects    | Explain methods through runnable systems      | SynTriageGUI, VidForge             |
| Recognition | Provide concise external validation           | Scholarships, awards, service      |

Every page shares a fixed top navigation with a current-page marker and a
scroll-progress rule. The mobile equivalent is an explicit menu panel.

## 3. Visual Language

### Palette

- Paper: `#F1EFE9`
- Bright paper: `#FCFBF7`
- Ink: `#111817`
- Forest: `#103A32`
- Deep forest: `#071F1C`
- Academic blue: `#2B5368`
- Annotation gold: `#94723A`
- Bright gold on forest: `#C5AA73`
- Verification signal: `#C65435`
- Signal tint: `#E1A38F`

Forest and ink carry the institutional weight. Warm paper keeps long text
readable. The signal color is reserved for failure nodes, active navigation,
progress, and selected states so those marks remain meaningful.

### Typography

- Display: Instrument Serif, with Iowan Old Style and Georgia fallbacks.
- Body: Newsreader, with Iowan Old Style and Georgia fallbacks.
- Technical labels, metadata, counters, and controls: IBM Plex Mono.

Display headlines use tight leading and large optical sizes. Uppercase tracking
is reserved for short metadata and instrumentation labels; body copy keeps
natural sentence case.

### Shape and spacing

- Corners remain square or nearly square.
- Borders are thin and structural.
- Repeated cards are reserved for project states, field notes, and awards.
- Sections use generous vertical intervals without turning each page into a
  single continuous scroll.
- Image composition is asymmetric but not crowded: the profile page uses a
  three-photo editorial grid plus a full-width paper diagram; the Industry page
  uses a full-bleed city image and a separate photo/brand-study wall.

## 4. Interaction Principles

- Page changes use cross-document view transitions when supported.
- Content reveals use one IntersectionObserver and a restrained stagger.
- The top navigation compresses into a blurred bar after scrolling and shows a
  page-level progress line.
- The Field Notes gallery supports drag, swipe, arrow keys, visible previous and
  next controls, a live counter, and a modal lightbox.
- The profile paper diagram and the Industry governance console use accessible
  tab patterns with arrow, Home, and End key support.
- SynTriageGUI and VidForge use the same interaction grammar for their
  instrument panels.
- All motion has a reduced-motion fallback.

## 5. Content Rules

- English is the sole public language for the current release.
- Wording should follow professional academic English rather than literal
  translations of resume shorthand.
- Submitted manuscripts must not be described as published or accepted.
- Project copy should foreground the problem, decision procedure, and
  engineering constraints before listing technologies.
- Do not publish private resume fields such as phone number, birthday, or
  messaging IDs.
- Tencent outcome metrics remain paired with system scope and require a fresh
  confidentiality check before reuse outside this portfolio.

## 6. Image Specification

- Portrait: vertical `4:5`, neutral or architectural setting, at least
  `1600 × 2000px`.
- Field notes: landscape or vertical photographs are both supported; the gallery
  applies non-destructive crops.
- Large originals should be resized to about `1800px` on the long edge and
  compressed before publication. WebP is preferred, with JPEG fallbacks where a
  `<picture>` element is used.
- The Industry masthead uses the Pearl River dusk photograph at
  `assets/images/tencent/pearl-river-dusk.*`.
- The Tencent field kit is a code-native illustration using the official
  wordmark. It is explicitly captioned as a brand study rather than official
  merchandise photography.
- Additional photographs require both a visible caption and a lightbox caption
  in `industry.html`. Gallery counts update automatically from the number of
  figures.

## 7. Components

- `TopNavigation`: wordmark, desktop page links, contact action, mobile menu,
  and scroll-progress rule.
- `PageMasthead`: page index, display headline, and an evidence-boundary note.
- `PaperEntry`: status, authorship, title, affiliation, contribution summary,
  method tags, and compact evaluation lens.
- `GovernanceFlow`: policy grounding, decision generation, audit dispatch, and
  review feedback.
- `FieldNotesGallery`: horizontally scrollable, snap-aligned photo sequence with
  controls and lightbox.
- `TraceDiagram`: a four-stage paper-workflow summary for SOCRATES that can be
  inspected by stage without leaving the profile page.
- `GovernanceConsole`: a four-stage, responsive view of the Tencent governance
  loop with changing readouts and representative system metrics.
- `TencentFieldKit`: an illustrative tote, mug, notebook, and badge composition
  that supplies visual brand context without posing as documentary photography.
- `ProjectInstrument`: interactive trace and risk view for SynTriageGUI.
- `WorkflowInstrument`: four-stage stateful workflow view for VidForge.
- `AwardGroup`: year, title, and awarding level.

## 8. Accessibility Baseline

- Semantic landmarks and heading order on every page.
- Keyboard-accessible navigation, gallery, lightbox, and project tabs.
- Visible focus behavior through native browser outlines.
- Minimum body contrast against paper, forest, and ink backgrounds.
- Responsive text and media down to `320px`.
- Reduced-motion support across CSS animation and JavaScript scrolling.
