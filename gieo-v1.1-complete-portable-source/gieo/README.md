# GIEO. — Current v1.1 source export

GIEO is a bilingual living philosophy and mindfulness experience: **Every moment plants a seed. / Mỗi khoảnh khắc là một hạt giống.**

This package starts from the latest saved GIEO source, **Site version 2**, commit `e2519cc1502efd04b251f5eb0b0e73bb9a106b1e`. That version was also published; no newer saved/unpublished version was listed at export. It includes the actual v1.1 reading typography and shared creator credit. This is a source export with portability changes, not a redesign. See `EXPORT-MANIFEST.json` for provenance and `VALIDATION.md` for measured checks and verification limits.

## Actual stack and requirements

- Vanilla JavaScript ES modules, semantic HTML, CSS and procedural SVG artwork.
- Native browser scrolling, CSS transitions/animation and JavaScript scene progression. The source does **not** use React, Next.js, Vite, Three.js, GSAP or Lenis.
- A real Node build prerenders the public routes and copies runtime assets into `dist/`. Node is needed for development/building, not for serving the finished application.
- **Node 24.x** and **npm 10 or newer**. The export was checked with Node 24.19.0 and npm 11.9.0. `.nvmrc` and `package.json` select Node 24.
- No npm runtime or development dependencies. There is a genuine npm lockfile. No backend, account, API key, Sites runtime, Cloudflare D1/R2 or authentication dependency.
- Optional `scripts/content.py` uses Python's standard library to regenerate editorial data from the original specification. Python is **not** required for install, dev, build, tests or deployment. Edit `src/content.js` directly for normal maintenance; regeneration overwrites that file.

## Start locally

Extract the ZIP once. It contains one project folder, `gieo/`. The package file is **`gieo/package.json`**; the HTML template is **`gieo/src/index.html`** and browser entry is **`gieo/src/app.js`**.

```bash
cd gieo
npm ci
npm run dev
```

Open `http://localhost:4173`. Development builds immediately, watches `src/` and `public/`, and rebuilds after changes. Refresh the browser after a rebuild; there is no hot module replacement. Changes to scripts/configuration require restarting the dev command. Stop with Ctrl+C.

For Codespaces or another container, forward the port and bind to all interfaces:

```bash
npm run dev -- --host 0.0.0.0 --port 3000
```

Production build and checks:

```bash
npm run build
npm run check
npm test
npm run preview
```

Preview serves the built `dist/` at `http://localhost:4173`; it does not rebuild or watch. Run the build before tests and preview. `npm run check` checks JavaScript syntax; it is not a TypeScript typecheck or ESLint command. No typecheck/lint script existed in the source and none is claimed.

## Source and assets

| Location | Purpose |
| --- | --- |
| `src/app.js` | Browser routing, language switching, interaction state, journal actions, audio and timer UI |
| `src/views.js` | Shared header/footer, all pages, reading sections and dialogs |
| `src/core.js` | Elapsed-time session clock, language resolution, journal schema and serialization |
| `src/content.js` | Full EN/VI lessons, stories, guided sessions and library content |
| `src/i18n.js` | EN/VI UI labels, errors, navigation, metadata and captions |
| `src/art.js` | Original procedural SVG scenes and lesson illustrations |
| `src/styles.css` | Original identity, responsive layouts, motion and appended v1.1 reading rules |
| `public/assets/` | Original landscape WebP, three self-hosted WOFF fonts and favicon |
| `licenses/`, `THIRD-PARTY-NOTICES.md` | Font license, provenance and actual asset/license scope |
| `scripts/build.mjs` | Clean prerender/copy build; generates all real pages and a 404 |
| `scripts/serve.mjs` | Local development/preview server; direct-route handling and real asset 404s |
| `scripts/checks.mjs`, `scripts/portable-checks.mjs` | Source functionality and export/routing/resource checks |
| `vercel.json` | Build/output configuration, exact known-route rewrites and response headers |
| `specification.md` | Original build reference; current implemented source remains the export's authority |

`dist/` is generated and intentionally excluded from the source ZIP and Git. A clean checkout builds its own output from `src/` and `public/`; there is no dependency on an old build folder.

## Routes and content

There are **23 public routes**, plus a generated `404.html`:

| Family | Routes/content |
| --- | --- |
| Home | `/` — seven continuous scenes: Beginning, Seed, Ripple, Change, Mystery, Return, Choice |
| Explore | `/explore` and eight `/explore/:slug` chapter pages, each with its existing distinct interaction |
| Life Stories | `/stories` and eight `/stories/:slug` story pages |
| Sanctuary | `/sanctuary` — quiet minute, breathing, guided reflection and quiet atmosphere |
| Garden | `/garden` — private local reflections and JSON import/export |
| Library | `/library` — 27 searchable/filterable records and real linked/details content |
| About | `/about` — mission, manifesto and editorial principles |

Chapter slugs: `karma-and-intention`, `impermanence`, `interdependence`, `not-self`, `holding-and-letting-go`, `mindful-presence`, `compassionate-speech`, `rebirth-and-continuity`.

Story slugs: `loving-without-owning`, `why-family-words-hurt`, `when-effort-is-not-enough`, `how-much-is-enough`, `the-other-life-on-your-screen`, `living-with-absence`, `forgiveness-and-boundaries`, `waiting-to-begin-living`.

The build writes an `index.html` for each route, including nested detail folders. Vercel rules rewrite **only these known URLs** to their own files; there is no catch-all rewrite to the homepage. Missing assets remain 404s. Client navigation uses the History API and `popstate`; direct loads and refreshes have real prerendered pages. Host the project at a domain root, not under an arbitrary URL subfolder, because the existing asset and route URLs are root-relative.

## English and Vietnamese

`src/content.js` and `src/i18n.js` store paired `{en, vi}` content. New visitors default to English; the app never infers Vietnamese from geography. `?lang=en` / `?lang=vi` take precedence over the saved `gieo.language` preference. The global desktop/mobile switch changes the current page, `html[lang]` and page metadata while retaining in-memory lesson choices, drafts and the current session clock. User reflections remain verbatim and are never translated. The self-hosted Noto Serif/Sans fonts include Vietnamese glyphs.

The preserved v1.1 CSS scopes larger body text to reading sections: 19px desktop, 18px tablet, 17.5px mobile, 1.78 leading and 720px article columns, with distinct headings, quotations and captions. The homepage hero hierarchy remains unchanged. The single shared footer preserves **Design and Develop by Vinh Nguyen**, linking to `https://vinh-nguyen-portfolio-three.vercel.app/` with `target="_blank" rel="noopener noreferrer"` in both languages.

## Sanctuary and local data

`SessionClock` measures real elapsed time rather than counting interval ticks. The UI updates every 250ms, catches up after a hidden tab, and supports start, pause/resume, end and reset. One Quiet Minute is 60s; breathing uses 3/5 minutes; guided reflection and quiet atmosphere use 5/10 minutes. The four original guided sessions (`returning`, `emotions`, `rest`, `gratitude`) have six bilingual progress cues each. The session remains in memory across language switching; a full page reload resets it. Leaving Sanctuary pauses practice and stops sound.

The optional breeze is synthesized using Web Audio after a user action. It is not a voice recording, streaming sound or licensed audio file. No audio files or WebGL models existed in this implementation.

Garden uses localStorage key **`gieo.garden.v1`** and schema version **1**. Reflection fields include ID, exact body/title, optional emotion/source reference, timestamps and schema version. Create/view/edit/delete, destructive confirmations, clear-all, storage error handling and JSON import/export are preserved. Import accepts up to 5 MiB and merges new IDs; IDs already present are retained rather than overwritten.

Data stays in that browser profile and origin. It is not encrypted, shared across devices or cloud-synced. Clearing browser storage removes it; someone with access to the profile can access it. No private browser data was read or packaged. Tests contain synthetic reflection fixtures only. **Entries on the old ChatGPT Site will not automatically appear on Vercel**; follow the explicit export/import process in `MIGRATION.md`.

## New GitHub repository and Vercel project

No repository or deployment was created by this export. Create your new repository **`jvinh209product/gieo`** yourself. Keep it separate from Portfolio and PMShipIt. Upload the **contents** of the extracted `gieo/` project to the new repository's `main` branch, including `.gitignore`, `.nvmrc` and `.env.example`. Do not upload the ZIP itself, `dist/`, `.env`, Git metadata or `node_modules/` as the project.

Import that repository into a **new** Vercel project named **`gieo`**:

| Setting | Value for this package |
| --- | --- |
| Framework Preset | **Other** (`framework: null` in `vercel.json`) |
| Root Directory | **`./`** if `package.json` is at repository root; **`gieo`** if the repository contains the entire project inside a `gieo/` folder |
| Node.js | **24.x** |
| Install Command | **`npm ci`** |
| Build Command | **`npm run build`** |
| Output Directory | **`dist`** |
| Required environment variables | **None** |

`SITE_URL` is optional build-time metadata configuration, not a secret or runtime dependency. To customize it locally, copy `.env.example` to `.env` and set it to the **confirmed HTTPS origin** with no path/query. The build otherwise uses Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, when those system variables are exposed. Without an origin it still builds and runs, uses local metadata paths and omits the sitemap. With an origin it emits absolute canonical/social URLs and `sitemap.xml`. Do not set `https://gieo.vercel.app` until Vercel confirms that address belongs to your project; availability was not checked or promised.

See `MIGRATION.md` for import, data transfer and rollback steps. Reference: [Vercel project configuration](https://vercel.com/docs/project-configuration), [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).

## Visual and functional review

Run dev/preview in your browser, check fresh storage defaults to EN, choose VI, refresh, and switch back on every route. Follow the checklist in `VALIDATION.md`: scene progression/skip, all lessons/stories, Library search and links, timed practice, audio, Garden CRUD/import/export, footer link, 375px/820px/1440px layouts, Vietnamese accents, 200% zoom, keyboard navigation and reduced motion. No real browser/GPU visual QA or live Vercel test was run during this export. Automated checks do not establish absence of all clipping or interaction defects.

## Maintain after migration

Make later changes on `upgrade/...` branches, run `npm ci`, build, syntax checks and tests, then inspect a Vercel Preview and merge through a Pull Request into `main`. Edit the existing source/content/artwork rather than regenerating a replacement site. If adding/removing routes, update `scripts/routes.mjs`, the build route list, existing route tests and the exact rewrite list in `vercel.json`. Keep font notices with the redistributed assets. No open-source license for the application was assigned by this export; `private: true` prevents accidental npm publication.
