# Little Name Club

A mobile-first, dependency-free baby-name discovery app for GitHub Pages. Swipe right to like, left to pass, or use the large buttons. Likes and passes are remembered in this browser. Passed names stay hidden across collections until you undo or explicitly restore them.

## Run locally

Requires Node.js 22 or newer. No package installation needed.

```sh
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Run `npm test` for filtering and backup validation tests.

## Host on GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch, including `data/names/yob*.txt`.
2. In the repository's **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. Run the **Deploy to GitHub Pages** workflow, or push to `main` to trigger it.

The workflow builds and deploys only `dist/`. Relative asset URLs support both project and root Pages sites. No backend, API keys, or runtime dependencies are needed. Alternatively, build locally and publish the contents of `dist/` with any static host.

## Data and privacy

- National SSA files in `data/names` are the source; state files are not aggregated, because suppression would distort national counts.
- All available years are included. The build detects the newest year automatically. Add future `yobYYYY.txt` files and rebuild to update.
- The initial catalog contains all name/sex combinations. Detailed annual counts are split by initial letter and fetched on demand.
- Rank follows source-file order within each SSA sex category for the latest year. Ties follow SSA file order. Peak year is the earliest year with the maximum recorded birth count, not population share.
- Charts show raw birth counts, not a percentage of births. Missing records are gaps, not zero: the source omits name/sex combinations with fewer than five occurrences.
- The default collection contains names in the latest year. Historical-only names are in **From the archives**. Themed lists are editorial inspiration, not claims about origins or meanings.
- Girls/boys describe SSA sex categories. Identical names in different categories are distinct records and choices.
- Choices are local to the browser and site origin; they do not sync automatically. **Your data** exports/imports JSON backups; the shortlist exports CSV. Imports merge, with imported choices winning conflicts. Removing a liked name makes it discoverable again.
- Fonts are optionally loaded from Google Fonts, with local fallbacks. No analytics or account service.

## Structure

`src/` contains the app; `scripts/build.mjs` compiles data and copies the app into `dist/`; `scripts/serve.mjs` is a small local preview server. Edit sources and rebuild to see changes.
