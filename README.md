# PMCPA — website improvement prototypes (V4)

Five clickable designed prototypes for improvements to pmcpa.org.uk, prepared by ClerksWell following the
phase 1 review (7 October 2026). V1 was greyscale; V2 adds the PMCPA design layer in
`src/css/theme.css` alone, using the phase 1 design system tokens.

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
- `src/js/code-data.js`: the whole 2024 Code as published on pmcpa.org.uk (read 6 November 2026): clause text,
  supplementary information, the most recent cases listed under each sub-clause, the clause-tagged Q&As with their
  answers, and the eight guidance items. Guidance clause tags come from the guidance page where it gives one; the rest
  are ours. Generated, not edited by hand.
- `src/js/case-reports.js`: three real cases (Case/0395/12/24, Case/0440/01/25, Case/0466/01/25) in the new report
  format supplied by the PMCPA.
- `src/js/data.js`: everything else. Other cases in the finder are invented: fictional companies, CASE/9xxx and
  AUTH/9xxx references outside the PMCPA's numbering, and invented rulings. Training dates and performance figures are
  as published.

## V4 changes (6 November 2026, after PMCPA feedback)
- Case report: justification changed (the full report is already on the page, but pasted from Word); three real
  reports in the PMCPA's new format; annexes fold; contents list built from the headings.
- The Code: every clause populated from the live site; Q&A, guidance and case panels appear only where they have
  content (thirds, halves or full width).
- Raise a concern: email confirmation by link first (simulated); the in-scope or out-of-scope answer appears under the
  concern question straight away; who you are adds advice beneath, such as the whistleblowing policy.

## Status
V2, designed prototypes for internal review. The PMCPA design layer lives entirely in `src/css/theme.css`, with images hotlinked from pmcpa.org.uk by `src/js/photos.js` (images © PMCPA; the repository and Pages site are public). Delete both to return to the greyscale V1. Gilroy and Meno Banner are licensed, so Urbanist and Libre Caslon Text stand in. The PMCPA header and footer are replaced by a prototype
navigator. Notes are off by default; switch "Notes on" in the top bar to show what each prototype proposes and why,
plus in-page annotations (yellow: behaviour; red: questions for the PMCPA).
