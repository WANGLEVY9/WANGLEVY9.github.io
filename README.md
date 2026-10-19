# Taijie Wang — Academic & Engineering Portfolio

Public-facing portfolio for Taijie Wang, focused on software testing,
GUI-agent failure diagnosis, trustworthy AI, and production engineering.
The site is static, dependency-free at runtime, and deployed through GitHub
Pages.

Live site: <https://wanglevy9.github.io/>

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
│   ├── images
│   └── js/site.js
├── .github/workflows/deploy-pages.yml
└── docs
    └── DESIGN_SYSTEM.md
```

The design rationale, content architecture, palette, typography, component
rules, and portrait specification are documented in
`docs/DESIGN_SYSTEM.md`.

The source CV is used locally for content planning and is intentionally ignored
by Git because it contains private contact information. Publish only a sanitized
PDF when the public CV download is enabled.

## Content boundaries

- Three manuscripts listed in the Research section are explicitly marked as
  submitted, not accepted or published.
- The public bio omits private phone, birthday, WeChat, and other non-public
  resume fields.
- The Tencent section follows the latest CV and includes the owner-approved
  internship outcome metrics. Re-check workplace confidentiality before reusing
  those figures outside the personal portfolio.
- The Industry gallery contains five curated images; duplicate or
  lower-information photos are intentionally excluded. Images are resized and
  stripped of EXIF metadata before publication.
- The site uses English for the public research narrative. Resume wording is
  paraphrased rather than copied mechanically.

## Deployment

Push to `main` to trigger `.github/workflows/deploy-pages.yml`. The workflow
copies the static files into `_site`, uploads the Pages artifact, and deploys it
through GitHub Pages. A successful Pages run is verified separately against the
live URL.

## Checks

```bash
npx --yes prettier@3.6.2 --check index.html assets/css/styles.css assets/js/site.js README.md docs/DESIGN_SYSTEM.md
npx --yes html-validate@9.7.1 index.html
node --check assets/js/site.js
```
