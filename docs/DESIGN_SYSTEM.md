# WANGLEVY9 Developer Research Portfolio

## Direction

The portfolio translates the signal density of a strong developer README into
a standalone personal site. Its visual thesis is **research under inspection**:
terminal syntax, repo-like section labels, system status, and explicit evidence
make the engineering identity legible before the visitor reaches the details.
The design is inspired by developer profile conventions at the level of
hierarchy and information rhythm only. It does not reuse another profile's
identity, copy, or assets.

## Information architecture

| Section | Purpose |
| --- | --- |
| Hero | `whoami` introduction, current status, metrics, and GitHub CTA |
| About | Short research-minded biography and portrait |
| Research | Three active threads with advisors, dates, and concise contributions |
| Manuscripts | Two selected manuscripts with authorship and conservative status labels |
| Projects | Visual project index for autonomous-system testing, SynTriageGUI, and VidForge |
| Stack | Languages, systems, and engineering habits |
| Contact | Research and collaboration invitation |

## Visual language

- Background: `#08110F`, with raised surfaces at `#0D1916` and `#111F1B`.
- Text: `#E8EFE8`; secondary copy: `#98AAA0`; structural lines use low-opacity
  versions of the same palette.
- Acid green `#C8FF5A` is reserved for actions, prompts, active states, and
  data accents. Mint `#83D8B0` carries research emphasis. Orange `#FF9C6B`
  marks the occasional status exception.
- `Space Grotesk` handles display and body copy. `DM Mono` handles navigation,
  labels, code-like content, metadata, and status indicators.
- Shapes are mostly square, with thin borders and grid lines. Rings, route
  lines, and terminal panels are interface/data graphics rather than narrative
  illustrations.

## Interaction and accessibility

- The desktop header remains fixed and exposes numbered section anchors. At
  `1000px` and below it becomes a compact top bar with an explicit mobile menu.
- Scroll reveals are progressive enhancements. The full semantic content is
  present without JavaScript and `prefers-reduced-motion` disables reveals,
  typing, and looping decorative motion.
- Native links, visible focus states, a skip link, descriptive image alt text,
  semantic headings, and responsive wrapping form the baseline.
- No third-party image assets are used for the new visuals. The portrait is the
  existing provided `assets/images/portrait.jpg` asset. Fonts are loaded from
  Google Fonts with local system fallbacks.

## Implementation

- Dependency-free static HTML, CSS, and JavaScript for GitHub Pages.
- `assets/js/site.js` owns menu state, active section state, reveal observers,
  year rendering, and the restrained terminal typing loop.
- `assets/css/styles.css` owns the responsive layout, system graphics, motion,
  focus/hover states, and reduced-motion fallback.
- No smooth-scroll library or WebGL runtime is used. The page uses native
  browser scrolling to keep the site portable and lightweight.
