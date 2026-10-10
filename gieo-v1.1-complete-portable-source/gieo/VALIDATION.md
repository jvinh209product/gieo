# GIEO source export validation

This report distinguishes automated/source checks from browser and hosting checks. **PASS** means the described check ran successfully; **FAIL** means an unresolved failure; **NOT RUN / NOT VERIFIED** means no such result is claimed. There are no unresolved failures in the executed install/build/syntax/test checks. This is not a claim that every browser behavior or visual layout has been tested.

## Provenance and executed checks

Source selected: latest saved **Site version 2**, commit `e2519cc1502efd04b251f5eb0b0e73bb9a106b1e`, also successfully published. The version listing contained versions 1 and 2, with no newer saved/unpublished version. The source worktree was clean. The source commit timestamp is `2026-10-09T04:49:05Z`; the checked deployment status was `succeeded`, updated `2026-10-09T04:51:22.295965Z`. Exact export time is recorded in `EXPORT-MANIFEST.json`.

Environment: Node **24.19.0**, npm **11.9.0**. Commands executed on the isolated portable project: `npm ci`, `npm run build`, `npm run check`, `npm test`, `npm audit --json`. The build and 15-test suite also passed with optional `SITE_URL=https://gieo.example` test configuration. That reserved example domain is test input only and is not configured as the production domain.

| Category | Status | Evidence / limit |
| --- | --- | --- |
| Current source/version choice | PASS | Latest saved version 2 matches local commit; published variant explicitly identified; no newer draft listed |
| Original GIEO Site preservation | PASS | All original tracked-file hashes and clean Git state remained unchanged; no save/deploy/push occurred |
| Code and data completeness | PASS | Original source/content/art/reading CSS/journal logic retained; portable source inventory and SHA-256 hashes in manifest |
| Runtime portability | PASS | All browser imports/resources resolve locally; no Sites runtime, internal asset hosts, backend/auth/API dependencies |
| Lockfile / clean installation | PASS | Generated npm lockfile v3 matches package; `npm ci` succeeds with zero external npm dependencies |
| Clean production build | PASS | Clean `dist/` built from source and `public/`; 23 public routes + 404; 48 EN/VI page renders validated |
| JavaScript syntax | PASS | `npm run check` checks all 13 JS/MJS source/script files |
| Automated tests | PASS | 15 tests, 15 passed, 0 failed/skipped; includes original 10 checks and 5 export checks |
| Typecheck / lint | NOT RUN / NOT APPLICABLE | Plain JavaScript source; no TypeScript or lint scripts/tools are present or claimed |
| Dependency audit | PASS | `npm audit --json`: 0 reported vulnerabilities; 0 external dependency packages |
| Local route/deep-link mapping | PASS | Every real path, nested path, trailing slash and `?lang=vi` resolves to its own prerendered file; unknown pages/assets tested as 404 |
| Vercel configuration | PASS (static checks) | Valid JSON; exact known-route coverage, install/build/output settings and all rewrite destinations checked |
| Full JSON Schema validator | NOT RUN | JSON Schema validator libraries were not available; no formal validator result claimed |
| Real Vercel deployment / nested refresh | NOT RUN / NOT VERIFIED | User requested source export only; no project, CLI deployment or hosted response was created/tested |
| EN/VI completeness | PASS (source/render) | Recursive nonempty EN/VI field checks, 23 route renders per language, lesson branches and default/explicit/saved locale logic |
| Browser EN/VI switching/persistence | NOT RUN / NOT VERIFIED | Global handlers/state were preserved; actual clicks, refresh and full browser page translation require manual QA |
| Vietnamese font coverage | PASS | All 126 distinct alphabetic glyphs in UI/editorial source exist in each of the three font character maps |
| Vietnamese accent appearance | NOT RUN / NOT VERIFIED | Glyph presence checked; actual shaping/rendering/line breaks need browser review |
| v1.1 reading typography | PASS (source preservation) | Original updated CSS retained byte for byte: 19/18/17.5px reading bodies, 1.78 leading, 720px columns, scoped responsive rules |
| v1.1 visual comfort / no clipping | NOT RUN / NOT VERIFIED | Desktop/tablet/mobile/zoom layout not visually tested during export |
| Seven home scenes / skip | PASS (render/source) | Seven scene sections and skip-journey control in both languages; original progression/motion code preserved |
| Home scrolling/parallax/transitions | NOT RUN / NOT VERIFIED | No real browser scrolling/animation test |
| Eight philosophy chapters | PASS | All exact slugs, bilingual text and distinct interaction branches render; cross-links resolve |
| Eight Life Stories | PASS | All exact slugs, substantive bilingual bodies/practices, reflections and related links retained |
| Sanctuary session engine | PASS (unit/source) | Elapsed-time, delayed/hidden-tab catch-up, pause/resume, end/reset logic tested; four sessions × six bilingual cues validated |
| Sanctuary controls and audible sound | NOT RUN / NOT VERIFIED | Browser start/pause/end and user-initiated Web Audio need listening/interaction QA |
| My Garden serialization/privacy | PASS (unit/source) | Version/key retained; exact multilingual text roundtrip, invalid import rejection, quota failures, escaped markup; no real user data included |
| Garden browser CRUD/import/export | NOT RUN / NOT VERIFIED | Existing handlers preserved, but actual create/reload/edit/delete/file-picker/download interactions were not run |
| Library / About | PASS (render/logic) | 27 localized library records, accent-insensitive search, categories/types, links/anchors and About render checked |
| Image / fonts / SVG illustrations | PASS | Five original binary/vector assets match original hashes; font notices included; procedural SVG/CSS source retained |
| Portrait / WebGL / model assets | NOT APPLICABLE | None existed in this implementation; no absent model, portrait, shader or recording is claimed |
| Shared footer credit | PASS (render) | Exactly one footer/credit per route in both languages; exact name, portfolio URL, `_blank` and `noopener noreferrer` checked |
| Portfolio destination opening | NOT RUN / NOT VERIFIED | Link markup verified; external site's availability/new-tab browser behavior was not tested |
| Responsive layout / 200% zoom | NOT RUN / NOT VERIFIED | Original responsive rules preserved; real devices/viewports require manual review |
| Reduced motion | PASS (source preservation) / NOT VERIFIED (browser) | Original OS preference and user motion controls, CSS fallbacks and hidden-tab behavior retained; actual toggling not tested |
| GPU/WebGL | NOT APPLICABLE | SVG/CSS implementation needs no WebGL; no GPU benchmark or WebGL behavior claimed |
| Local dev/preview server startup | NOT RUN / NOT VERIFIED | Commands and routing resolver provided/tested; no preview/browser server session started in this export environment |
| ZIP structure and fresh extraction | PASS | One `gieo/` root; no Git metadata/dependencies/secrets/build cache; clean install/build/syntax/15 tests reproduced from extracted source before delivery |

## Warnings and scope

- npm printed the runner's `Unknown env config "http-proxy"` warning. No proxy configuration is packaged, and all commands exited successfully. Missing `.env` notices are expected because it is optional and private local configuration is excluded.
- The default local build has no absolute origin and omits the sitemap. Optional valid `SITE_URL` configuration was tested; Vercel system URL variables are supported. No production domain availability is promised.
- This is a copy/prerender build, not a bundler; there were no bundle chunk or large-3D warnings. Three fonts total 1,109,164 bytes and the optimized landscape is 209,000 bytes. Browser/network performance was not benchmarked.
- The current app uses the original SVG/CSS implementation. Three.js, GSAP, Lenis, portrait models and narrated recordings were not implemented in this source. They were not removed or replaced during export.
- No Sites-only feature remains essential to the app. Private Garden entries remain origin-local and require explicit JSON export/import for migration. No real private reflections were accessed or included.
- No GitHub repository, Vercel project, Portfolio or PMShipIt resource was modified. The original GIEO Site was not saved, published, unpublished or changed.

## Browser checklist before accepting a deployment

1. Use a fresh browser profile/storage on the new URL: verify EN, choose VI, refresh, switch back, and navigate every listed route. Check navigation, form/errors/dialogs, metadata and Vietnamese accents.
2. Scroll all seven scenes, use the seed/ripple controls and skip journey, then open every Explore and Stories detail slug directly and refresh. Test all lesson interactions and reflection actions.
3. Search Library in EN/VI, test accent-insensitive search, categories/types, article/session links and details; review About.
4. Start/pause/resume/end/restart each practice; test durations, progress cues, switching language mid-session, hidden-tab elapsed time, sound opt-in/volume/stop and leaving Sanctuary.
5. In Garden, save a **temporary** reflection, refresh, view/edit it, export/import its JSON, switch languages and confirm text stays exact. Test delete/clear confirmations and keep backups of real entries.
6. Review 375px mobile, 820px tablet and 1440px desktop plus 200% zoom: no clipping, overlap or horizontal overflow. Check keyboard focus, dialogs, footer wrapping and new-tab portfolio link.
7. Enable OS reduced motion and the site's motion setting; confirm readable scenes, working links and practice controls. Inspect browser console/network for errors or missing resources. `/assets/nonexistent.js` must remain a genuine 404.
