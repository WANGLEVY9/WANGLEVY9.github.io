# Taijie Wang — Academic & Engineering Portfolio

Public-facing portfolio for Taijie Wang, focused on software testing,
GUI-agent failure diagnosis, trustworthy AI, and production engineering.
The site is static, dependency-free at runtime, and deployed through GitHub
Pages.

Live site: <https://wanglevy9.github.io/>

## Pages

- `index.html` — profile, current coordinates, and routes into the dossier
- `research.html` — submitted manuscripts and evidence boundaries
- `industry.html` — Tencent governance systems and the Guangzhou field notes
- `projects.html` — SynTriageGUI and VidForge case studies
- `recognition.html` — scholarships, competition results, and service

Navigation stays at the top of the viewport on every page. Each section has its
own URL rather than sharing one long-scroll document.

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
├── research.html
├── industry.html
├── projects.html
├── recognition.html
├── assets
│   ├── css
│   │   ├── core.css
│   │   └── pages.css
│   ├── images
│   └── js/site.js
├── .github/workflows/deploy-pages.yml
└── docs
    └── DESIGN_SYSTEM.md
```

`core.css` contains design tokens, layout, typography, navigation, footer,
motion, and shared responsive rules. `pages.css` contains page-specific
compositions, galleries, project instruments, and page-level responsive rules.

## Content boundaries

- Three manuscripts in the Research page are explicitly marked as submitted,
  not accepted or published.
- The public bio omits private phone, birthday, WeChat, and other non-public
  resume fields.
- The Tencent section follows the latest CV and includes owner-approved
  internship outcome metrics. Re-check workplace confidentiality before reusing
  those figures outside this personal portfolio.
- The Industry gallery currently contains six curated images. New images belong
  in `assets/images/tencent/`, should be resized before publication, and should
  be added as another `figure` in `industry.html`; gallery controls and the
  counter derive their state from the markup.
- The Tencent field-kit treatment is a code-native editorial illustration. Its
  caption states that it is not a photograph of official merchandise.
- The site uses English for the public research narrative. Resume wording is
  paraphrased rather than copied mechanically.

## Deployment

Push to `main` to trigger `.github/workflows/deploy-pages.yml`. The workflow
copies all top-level HTML files and static assets into `_site`, uploads the
Pages artifact, and deploys through GitHub Pages. Verify the live URLs
separately after the workflow completes.

## Checks

```bash
npx --yes prettier@3.6.2 --check \
  index.html research.html industry.html projects.html recognition.html \
  assets/css/core.css assets/css/pages.css assets/js/site.js \
  README.md docs/DESIGN_SYSTEM.md
npx --yes html-validate@9.7.1 \
  index.html research.html industry.html projects.html recognition.html
node --check assets/js/site.js
```
