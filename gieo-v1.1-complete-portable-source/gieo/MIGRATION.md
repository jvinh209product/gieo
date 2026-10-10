# GIEO migration: new GitHub + new Vercel

This export performs no GitHub/Vercel actions and does not alter the old GIEO Site. Target repository: `jvinh209product/gieo` (you create it). Target new Vercel project: `gieo`. Preferred `https://gieo.vercel.app` is subject to Vercel availability.

## 1. Extract and inspect

Extract `gieo-v1.1-complete-portable-source.zip`. Its single top-level folder is `gieo/`; `gieo/package.json` resolves directly. Do not wrap it in another `gieo/` folder. Read `README.md`, `VALIDATION.md`, `THIRD-PARTY-NOTICES.md` and `EXPORT-MANIFEST.json`.

From inside the extracted project, use Node 24.x:

```bash
npm ci
npm run build
npm run check
npm test
npm run preview
```

Inspect locally at `http://localhost:4173`. For editing use `npm run dev`. In Codespaces, use `npm run dev -- --host 0.0.0.0 --port 3000` and forward port 3000. Browser storage there is also separate from your eventual production origin.

## 2. Create and upload your new repository

Create the new GitHub repository named `gieo` under `jvinh209product`. Do not reuse Portfolio or PMShipIt. Choose visibility yourself; this package does not assign an open-source license to the application.

For the cleanest root, use GitHub's upload workflow to upload the **contents of `gieo/`**, including hidden configuration files, so `package.json`, `src/`, `public/` and `vercel.json` are at the repository root. Commit them to `main`. The ZIP file itself is not the deployable repository. Keep `.env`, `dist/`, `node_modules/` and local caches out.

Alternatively, uploading the entire extracted folder as `gieo/` is supported, but Vercel must use **Root Directory `gieo`**. Verify the actual location of `package.json`; do not guess from the repository name.

## 3. Import into a new Vercel project

Use Vercel's new-project workflow and import only `jvinh209product/gieo`. Name the new project `gieo`. Apply these actual settings:

| Setting | Correct value |
| --- | --- |
| Framework Preset | **Other** |
| Root Directory | **`./`** for project files at repo root; **`gieo`** for project files nested in that folder |
| Node.js Version | **24.x** |
| Install Command | **`npm ci`** |
| Build Command | **`npm run build`** |
| Output Directory | **`dist`** |
| Required environment variables | **None** |

The supplied `vercel.json` sets the build/output commands and only the 23 known route rewrites. Each chapter/story has a real prerendered HTML file, so refreshing `/explore/impermanence` or `/stories/living-with-absence` does not depend on arriving through the homepage. Real assets are served normally; do not replace these rules with a blanket `/(.*)` → `/index.html` rewrite. Missing assets must remain 404s.

Optionally set `SITE_URL` to the HTTPS origin Vercel has **actually assigned** to your project and redeploy to generate absolute canonical/social metadata and the sitemap. It is build-time configuration, not a private key. Without a custom value the build can use exposed Vercel production/deployment URL variables; without either, the application works with local metadata paths and no sitemap. Confirm the domain in your project before assuming `gieo.vercel.app` is available.

## 4. Explicitly transfer My Garden reflections

localStorage belongs to a browser profile **and origin** (scheme + hostname + port). The old ChatGPT Site and the new Vercel/custom domain have different origins. Using the same `gieo.garden.v1` key and schema does not transfer entries automatically. Language preferences are also local and do not automatically migrate.

1. In the browser/profile where the old reflections were saved, open the **old GIEO Site**, then My Garden.
2. Use its JSON **export** control and save the reflection file privately. Keep that backup before changing domains or clearing browser data.
3. Open the **new** confirmed production URL, then My Garden.
4. Use its **import** control to select the JSON file. Import validates schema version 1 and preserves original text, titles, timestamps and source references. The import limit is 5 MiB.
5. Check the entries, refresh, switch EN/VI, and confirm their text remains exact. Test edits/deletions on a temporary reflection, keeping the original backup.

Import merges entries with new IDs; an ID already in the new Garden is retained and not overwritten. JSON exports contain private text: store/share them accordingly. Importing does not delete the old origin's entries. Later edits on either domain do not sync back to the other. A domain change or browser/profile change requires explicit export/import again. The source ZIP contains no real user reflections.

## 5. Verify the new deployment

Follow `VALIDATION.md` in a real browser, including desktop/tablet/mobile, all direct detail URLs, EN default/VI switching, timer pause/resume/completion, synthesized sound, Garden create/edit/delete/export/import and exact footer credit. Test missing `/assets/nonexistent.js`: it must return 404 rather than HTML with status 200. Check browser console/network for missing assets. Treat real Vercel behavior as unverified until this is done.

## 6. Fix or roll back independently

If a deployment fails, inspect its build log. Common fixes are the correct Root Directory, Node 24, `npm ci`, `npm run build` and `dist`. A missing asset should be added to `public/assets/` with the correct case/path; do not hide it with a catch-all rewrite. Keep `package-lock.json` synchronized if dependencies are later added. Commit the fix to your **new** repository.

For a broken published deployment, use Vercel's rollback/redeploy controls to restore a previously working deployment, or revert the faulty change in the new repository and deploy it again. Rollback restores code, not a visitor's local journal state; keep private JSON backups. The original ChatGPT GIEO Site remains a separate project and can stay available while you validate migration. Do not modify its project, or Portfolio/PMShipIt, to repair this new deployment.

Use later `upgrade/...` branches → Vercel Preview → Pull Request → merge to `main`. No repository, branch, project or domain was changed by the export process.
