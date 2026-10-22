# WebUtils

Build-free HTML, CSS, and JavaScript tools for GitHub Pages. No npm install, React, TypeScript, bundler, or compilation is required.

## Run

Open `index.html` directly, or serve the repository with any static HTTP server. With Python installed:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8080`. A local server best matches hosted behavior; copy actions also have a fallback for direct-file use.

## Tools

- **Laundry** (`laundry/`): paste one `COUNTx TYPE` entry per line, Confirm Rates, check garment rates in rupees, then Calculate Total. Repeated garment names are grouped in the bill. Total rows counts input entries; total clothes sums quantities. Garment matching remains case-sensitive, as in `revamp`. Blank lines are ignored; malformed lines must be corrected before calculation. Counts must be non-negative safe integers, and rates must be non-negative decimals (zero is allowed). Decimal arithmetic is exact before display rounding to two decimal places. Check rates shows only types in the current clothes list. Rates for other types stay saved and reappear when those types are added again.
- **URL converters** (`url_converters/`): Git SSH/HTTPS conversion, GitHub CLI clone commands, Bitbucket username URLs, YouTube shared/embed/watch/Shorts/live links, and Clean & Copy. Home's quick tools contain only YouTube conversion and Clean & Copy. The text cleaner preserves the original English-letter/number behavior. YouTube conversion produces the original canonical watch link and removes timestamps/tracking parameters. Repository inputs target a single owner/repository; nested GitLab groups are not supported.
- **Colors** (`rgb_to_hex/`): RGB/RGBA to uppercase eight-digit hex (opaque colors retain `FF`), plus 3/4/6/8-digit hex to RGBA. Alpha output keeps the original two-decimal display convention; RGB to hex now rounds alpha directly to the nearest byte.
- **Counter** (`counter/`): +/− controls; up/right arrow or swipe increments, down/left decrements. Swipe threshold remains 60px. Every change is saved, including reset. Undo reset is available; Save is retained. Arrow keys do not intercept typing inside editable controls.
- **Markdown** (`render_markdown/`): file picker, drag/drop, editable input, and sanitized preview. Files must be `.md`, `.markdown`, or `.txt` and under 2 MB.
- **Currency & fees** (`percentage/`): original exchange/fee formulas, with editable actual charge and clearly labelled results. Rates are user-entered, not live.

## Saved data

Existing keys and shapes are preserved:

- `ClotheTypeAndRates`: array of `{ key, clotheType, rate }`, compatible with the React Laundry tool from `revamp`.
- `COUNTER`: integer stored as text, compatible with the old counter.

The Laundry clothes-list text is not saved and starts empty on each page load. Only detected garment types and their last entered rates are preserved. The obsolete `LAUNDRY_DRAFT` key is removed when the Laundry page opens.

Storage belongs to the browser and origin. Existing values carry over when deployed at the same origin (`https://abdulmoizhussain.github.io`); they do not automatically transfer from Netlify, another browser, `file://`, or localhost. Unreadable saved rates are left untouched at startup. Storage failures show a notice and the tools continue working in memory.

## Deploy to GitHub Pages

Copy these files/folders to the publishing repository:

```text
index.html  404.html  favicon.ico  .nojekyll  service-worker.js
assets/  laundry/  url_converters/  rgb_to_hex/
counter/  render_markdown/  percentage/
```

To collect the deployable files in this project, run:

```powershell
.\deploy.ps1
```

You can also run `deploy.bat`. The script removes the project's existing `file-to-publish` folder, recreates it, and copies only the site files into it. It does nothing else. This generated folder is excluded from Git by `.gitignore`.

Copy the contents of `file-to-publish` into your GitHub Pages publishing repository when ready. Configure Pages to publish its root.

`.nojekyll` is an empty marker file that tells GitHub Pages to skip Jekyll processing and publish the static HTML, CSS, JavaScript, and assets as-is. This project does not need Jekyll because its files are already ready to serve. Keep `.nojekyll` in the root of the publishing repository; the deployment helper copies it automatically. It has no effect when running the site locally.

Each tool has a physical `index.html`; direct links such as `/laundry/` and `/counter/` survive refreshes without SPA fallback tricks. Old extensionless paths are served by the same directories. Links and assets are relative and also work under a repository subpath. The custom `404.html` assumes the intended domain-root deployment.

`service-worker.js` is a retirement worker at the previous CRA worker URL. Keep it available so returning visitors can leave the cached React app; it unregisters itself without deleting localStorage or unrelated caches. The new app does not register a worker. An already-controlled tab may need to be reopened/reloaded while the browser checks its old worker for an update.

## Maintain

- Edit HTML in each tool folder; edit shared styles in `assets/css/styles.css`.
- The same static header is present in every HTML file. Update its links consistently on all pages, including `404.html`; no runtime fetch or generator is required.
- `assets/js/tools.js` contains pure parsing/calculation functions. `assets/js/app.js` connects controls to those functions.
- Pinned libraries live in `assets/vendor/`; see its README and license files. There are no CDN runtime requests.
- The original React code is preserved in Git history, including the merge of `revamp` into `master` before conversion.

Optional verification (Node.js only; no package installation):

```powershell
node --test tests/tools.test.cjs
node --check assets/js/app.js
node --check service-worker.js
```
