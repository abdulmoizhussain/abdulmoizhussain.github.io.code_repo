# Conversion verification

Verified locally on 2026-10-23. No production deployment or push was performed.

## Automated

`node --test tests/tools.test.cjs` covers:

- Laundry row parsing, repeated garment aggregation, exact decimal arithmetic, case-sensitive matching, legacy saved-rate shape, zero rates, invalid/missing rates, and oversized counts.
- Git SSH/HTTPS/GitHub CLI/Bitbucket username formats and invalid inputs.
- YouTube watch, shared, embed, old `/v` and `/u`, Shorts, live, mobile, and privacy-enhanced embed hosts; unsupported domains and invalid IDs.
- RGB/RGBA and shorthand/full hex, alpha conversion and invalid channels.
- Legacy counter restore and corrupt values.
- Currency and fee formulas, including zero-base validation.
- Original text-cleaning behavior.
- Headers and local links/assets on all pages.
- Retirement worker scope, unregister, and client refresh.

The deployment helper recreates the project's `file-to-publish` folder and copies only deployable files into it. Both script entry points were checked, including a repeat run to remove stale files. The generated folder is ignored by Git. All original extensionless tool paths returned HTTP 200 from the static server.

## Browser

Checked in the Codex browser against a local static HTTP server:

- Laundry: paste → Confirm Rates → enter saved rates → Calculate Total; `2x Shirt`, `3x Trouser`, `1x Shirt` at 25.50 and 40 produces **196.50 rs**, **6 clothes**, **3 rows**, grouped into Shirt (76.50) and Trouser (120.00).
- Laundry: malformed line errors disable calculation; edits invalidate the previous bill. The clothes list is not saved and starts empty after refresh; re-entering a garment type restores its saved rate.
- Laundry rate filtering: changing the list to only Shirt hides Trouser immediately. Saving Shirt's rate retains Trouser's saved rate; switching to `3x Trouser` restores 40 rs and produces 120.00 rs. An empty list shows no rate fields.
- Home quick tools: only YouTube and text cleaning are shown; Git repository conversion remains on the URL converters page. Every page's header uses Author's GitHub.
- URL converters: long repository URLs render all clone formats; YouTube canonical output and Clean & Copy were verified against clipboard content.
- Color converter: `255 153 0 0.5` → `#FF990080`, `#0099FF80` → `rgba(0, 153, 255, 0.50)`.
- Counter: increment buttons, arrow keys, all four swipe directions, refresh persistence, reset and undo.
- Markdown: editor preview, HTML sanitization, and actual file-picker loading of README.md.
- Currency & fees: expected results and zero exchange-rate validation.
- Responsive layout: desktop and narrow viewport checks, including long URL results and Laundry bill. Native mobile browsers have not been tested.

GitHub Pages hosting and migration from an actual production CRA service worker still require deployment verification. The retirement worker behavior is tested in isolation; no production browser data was modified.
