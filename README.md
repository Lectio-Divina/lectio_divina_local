# Lectio Divina Timer

A standalone React/Vite version of the Lectio Divina Timer.

## What changed from the Gemini version

- Removed Firebase initialization, authentication, Firestore, listeners, and cloud persistence.
- Timer settings are stored in browser `localStorage`.
- Prayer journal entries are stored in browser `localStorage`.
- Journal editing, deleting, and export/copy remain available.
- Wake Lock and the generated bell sound remain.
- The daily Gospel reference is loaded from the local `public/Daily_Gospel.txt` file.
- No external data request is required by the app.

## Run locally

```bash
npm install
npm run dev
```

## Build for GitHub Pages

```bash
npm run build
```

The production files will be in `dist/`.

## GitHub Pages

Push this repository to GitHub, then configure GitHub Pages to deploy from the `dist` output using GitHub Actions, or use a Pages workflow.

## Fully local behavior

The Firebase database has been removed, so journal/settings data never leaves the user's browser.

The daily Gospel data is bundled into the application as `public/Daily_Gospel.txt`. The app reads that local file, so it does not need an external Gospel-data server.
