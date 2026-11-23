# Issue Desk — Practice 08

Real user scenario: form submission → n8n webhook → GitHub Issues API → response rendered on the page. GitHub `issues:opened` webhook separately invokes Practice 7.2 classifier.

## Install and run

```bash
cp .env.example .env
# edit N8N_URL to the running n8n instance URL (origin only)
npm install
npm run dev
```

Open <http://127.0.0.1:5173>. The dev proxy sends `POST /api/create-issue` to `POST {N8N_URL}/webhook/itmo-create-issue` without exposing GitHub credentials in the browser. Activate imported n8n workflow `08_create_issue.json` beforehand. If using localhost n8n, use `N8N_URL=http://localhost:5678`.

```bash
npm test
npm run build
```

## Component library and design system

**Mantine 7** (`@mantine/core`) for Paper, Button, TextInput, Textarea, Alert, Badge. Shared theme in `src/main.jsx`, global CSS tokens and accessible focus states in `src/styles.css`.

## States

- empty: issue list with no entries
- validation: missing / short title or description
- loading: fetch in progress, synchronous `pending.current` guard blocks duplicate requests (including Enter)
- success: real GitHub Issue number and URL
- error: network / API errors with retry

## AI-assisted work and manual checks

AI produced the mockup, code and automated tests. We explicitly checked the course rubric and manually revised request-locking, server result validation, loading/error behaviour, keyboard focus styling, and tests of duplicate submission. **Automated test execution must be performed in your environment** after dependency installation; the authoring environment cannot access npm registry.

This frontend does **not** claim that the classifier has finished when a new Issue is created: GitHub webhook processing is asynchronous.
