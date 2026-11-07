# Asset map

Four repository screenshots moved to `assets/images/screenshots/` with kebab-case names. The public dashboard image remains under `public/` for the Vite static asset convention and was renamed to kebab-case. Source components and Vite assets remain under `src/`.

Verification: `npm run build` fails before and after because Vite is unavailable; `npm ci` also fails on the pre-existing lockfile mismatch.
