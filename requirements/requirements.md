# PMCPA website prototypes — requirements (V1)

Source: ClerksWell phase 1 review of pmcpa.org.uk, 7 October 2026. Idea numbers (#) refer to the opportunities list.
Every section in `src/` carries an HTML comment naming the requirement it answers.

## Global
- R01 Prototype navigator replaces the PMCPA header: pack name, Overview, prototypes 1–5, Notes switch.
- R02 Previous / next pager replaces the PMCPA footer.
- R03 Notes switch, off by default, remembered for the session: proposal panel plus numbered annotations (yellow behaviour, red open questions).
- R04 Context passes between pages by `?param=` with a sessionStorage fallback.
- R05 Works at 390px with no horizontal scroll; keyboard-operable; Escape closes overlays.
- R06 Descriptive link text throughout; no "click here" (#43).
- R07 Sample data is labelled. Company names, case references (CASE/9xxx) and rulings are invented. Code clause titles, Clause 14 text, Q&A and guidance titles, training dates and performance figures are as published on pmcpa.org.uk.

## 1 Case finder — `pages/cases.html`
- R10 Newest completed first by default; sort control visible and kept in the URL (#1).
- R11 Keyword search over reference, parties, headline and summary; accepts AUTH/ and CASE/ in any case (#8).
- R12 Facets with counts: outcome, clause (grouped by Code section, numeric order), respondent company with type-ahead, complainant type, Code year, sanctions, appeal (#2, #3, #16).
- R13 Completed date presets and a custom range (#4).
- R14 Outcome pill and clause chips (breach / no breach) on every result (#5).
- R15 Headline plus one-sentence outcome summary on every result (#6).
- R16 Phone: one-line intro, "How to search" disclosure, filters in a drawer, results on the first screen (#7).
- R17 Active filter chips, clear all, 10 results per page with pagination, empty state.
- R18 Email alerts for a search or a clause (#12).
- R19 Filter state in the URL so a search can be shared; arrives pre-filtered from a clause page.

## 2 Case report — `pages/case.html?case=<id>`
- R20 Header: reference, parties, headline, outcome pill, key facts (#9).
- R21 Rulings table by clause, each clause linked to its clause page (#9, #14).
- R22 Case timeline (received, Panel ruling, appeal, completed) (#9).
- R23 Report in HTML with a contents list that tracks scrolling; PDF kept as a download (#9).
- R24 Sanctions grouped with the case, linked to the published advertisement or reprimand (#32).
- R25 Related cases: same clause, same company (#10).
- R26 Copy link, suggested citation, print (#11).
- R27 Follow this company or clause (#12).

## 3 The Code, connected — `pages/code.html`, `pages/clause.html?clause=<n>`
- R30 Code landing titled for today, effective date stated once (#13).
- R31 One search across Code, Q&As, guidance and cases, with tabs, counts and no duplicates (#15).
- R32 Sections as expandable groups with their own addresses, not pop-ups (#19).
- R33 "Go to clause" accepts "14.2"; clause lists in numeric order (#16).
- R34 Clause hub: text, supplementary information, Q&As, guidance and cases per sub-clause; "See all cases under 14.4" opens the filtered finder (#14).
- R35 Q&As and guidance carry dates and clause tags (#17, #18).
- R36 Glossary terms in clause text open a definition popover (#20).
- R37 "Changed in 2024" marker with the earlier wording a click away (#21).
- R38 Section index beside the clause; previous / next clause.

## 4 Raise a concern — `pages/raise-a-concern.html`
- R40 Scope check on-site, with out-of-scope concerns routed to the right body (#22).
- R41 Answers carry into the form (#22).
- R42 Steps: the matter, evidence, about you, your interests, check and send, with progress (#23).
- R43 Guidance beside each field rather than above the form (#23).
- R44 Validation per step; review screen with edit links.
- R45 Anonymity at a glance (named, confidential, anonymous) (#26).
- R46 Corrected appeal wording (#25).
- R47 Confirmation with reference and a timeline of what happens next (#24).
- R48 Save and finish later.
- R49 Company complainants routed to intercompany dialogue first (#27).

## 5 Open by default — `pages/home.html`, `pages/performance.html`, `pages/alerts.html`
- R50 Homepage routes: raise a concern, check the Code, search cases, media (#40).
- R51 Latest rulings strip with outcome pills (#40).
- R52 News with real headlines as links; titles name the company and case (#34, #35).
- R53 Training dates with honest status and a waiting list (#38).
- R54 Our performance: rulings by year, open cases over time, Panel rulings upheld, as charts with the figures as text (#29).
- R55 Ongoing cases table with labelled totals and change since the previous snapshot (#30).
- R56 Ongoing case list with status timeline and follow (#31).
- R57 eAlert preference centre: content types, Code sections, companies, frequency, sample alert (#37).

## Quick wins tab — `pages/quick-wins/`
- R60 A second tab in the navigator ("Big improvements" / "Quick wins"), with the quick-win themes as its sub-navigation.
- R61 One page per small-effort idea (all 29 ideas with effort S in the phase 1 list), each independent of the five prototypes.
- R62 Each page shows Today (as observed on pmcpa.org.uk) and Proposed, one at a time or side by side; the choice is remembered for the session.
- R63 Each page says what we saw and what changes, links to the prototype it also appears in, and has previous / next.
- R64 Overview grouped by theme, filterable by theme and by high impact.
- No effort or cost estimates in the pack (to follow in the proposal).
