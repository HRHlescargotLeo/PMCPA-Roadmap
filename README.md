# PMCPA — website improvement prototypes (V1)

Five clickable greyscale prototypes for improvements to pmcpa.org.uk, prepared by ClerksWell following the
phase 1 review (7 October 2026). They agree structure and behaviour first; the PMCPA design layer will be added in
`src/css/theme.css` alone, which is empty in this version.

## View
Live: https://hrhlescargotleo.github.io/PMCPA-Roadmap/

Or open `docs/index.html` in a browser. No server or install needed.

GitHub Pages publishes from the `docs/` folder on `main`
(Settings → Pages → Deploy from a branch → `main` / `/docs`).

## Prototypes
1. Case finder — `pages/cases.html` (filters are kept in the address, e.g. `?clause=14.4&outcome=breach`)
2. Case report — `pages/case.html` (opens any case with `?case=<id>`)
3. The Code, connected — `pages/code.html` and the clause hub `pages/clause.html?clause=14`
4. Raise a concern — `pages/raise-a-concern.html`
5. Open by default — `pages/home.html`, `pages/performance.html`, `pages/alerts.html`

Module library: `modules/library.html`. Requirements: `requirements/requirements.md`.

## Build
```
node build-includes.js && node validate.js
```
Edit files in `src/`; `docs/` is generated (commit it, as GitHub Pages serves it). The prototype navigator, Notes
switch and previous/next footer live in `src/includes/`. Behaviour is in `src/js/wireframe.js` (shared) and
`src/js/prototypes.js`; sample data in `src/js/data.js`.

## Data
Case data is invented: fictional companies, CASE/9xxx and AUTH/9xxx references outside the PMCPA's numbering, and
invented rulings. Code section and clause titles, the text of Clause 14, Q&A and guidance titles, training dates and
the performance figures are as published on pmcpa.org.uk on 7 October 2026. Clause tags on Q&As and guidance are
illustrative.

## Status
V1, greyscale prototypes for internal review. The PMCPA's own header and footer are replaced by a prototype
navigator. Notes are off by default; switch "Notes on" in the top bar to show what each prototype proposes and why,
plus in-page annotations (yellow: behaviour; red: questions for the PMCPA).
