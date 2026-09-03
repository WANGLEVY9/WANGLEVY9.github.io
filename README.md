# WANGLEVY9 Developer Research Portfolio

A static, dependency-free developer research portfolio for GitHub Pages. The
visual system combines a terminal-like interface with research, project, and
engineering context.

## Local preview

Open `index.html` directly, or run:

```bash
python3 -m http.server 4173
```

Then visit `http://127.0.0.1:4173`.

## Structure

```text
.
├── index.html
├── assets
│   ├── css/styles.css
│   └── js/site.js
└── docs
    └── DESIGN_SYSTEM.md
```

The design rationale, content architecture, palette, typography, responsive
behavior, and accessibility rules are documented in
`docs/DESIGN_SYSTEM.md`.

## GitHub profile README

`profile/README.md` is the separate GitHub Profile Overview README designed for
`WANGLEVY9/WANGLEVY9`. GitHub only renders a profile README from that exact
same-name repository, so copy the file to its root as `README.md` after creating
or opening that repository.

The source CV is used locally for content planning and is intentionally ignored
by Git because it contains private contact information. Publish only a sanitized
PDF when the public CV download is enabled.
