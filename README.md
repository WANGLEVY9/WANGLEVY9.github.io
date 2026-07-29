# WANGLEVY9 Academic Portfolio

A static, dependency-free academic portfolio for GitHub Pages.

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

The design rationale, content architecture, palette, typography, component
rules, and portrait specification are documented in
`docs/DESIGN_SYSTEM.md`.

The source CV is used locally for content planning and is intentionally ignored
by Git because it contains private contact information. Publish only a sanitized
PDF when the public CV download is enabled.
