# AI Resume Bullet Generator

Turn raw work notes into polished, ATS-friendly resume bullet points — powered by the Anthropic Claude API.

![CI](https://github.com/codingbird30/ai-resume-bullet-generator/actions/workflows/ci.yml/badge.svg)

## Why this exists

Writing bullet points for your résumé is the worst part of job-hunting. You sit staring at "managed stuff, did things" and try to twist it into something a recruiter will actually read. This tool does that twist for you: paste in rough notes, get back 5–10 bullets using strong action verbs, STAR structure, and metric placeholders you can fill in.

## Stack

| Layer    | Tech                                         |
| -------- | -------------------------------------------- |
| Frontend | React 18, Vite 6                             |
| Backend  | Express 4 (Node 18+), `@anthropic-ai/sdk`    |
| Styling  | Plain CSS with CSS variables + dark-mode    |
| Hosting  | Any Node host (see below)                    |

The backend exists for one reason: **your Anthropic API key never ships to the browser.** The React app posts to `/api/generate`, Express calls Claude, Express returns bullets.

## Quick start

Requires Node.js 18 or newer.

```bash
git clone https://github.com/codingbird30/ai-resume-bullet-generator.git
cd ai-resume-bullet-generator
npm install
cp .env.example .env
# open .env and paste your Anthropic API key
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api/*` to the Express backend on port 3001.

Get an API key at <https://console.anthropic.com/settings/keys>.

## Project structure

```
ai-resume-bullet-generator/
├── .github/workflows/
│   └── ci.yml                 # build-on-push GitHub Action
├── public/
│   └── favicon.svg
├── server/
│   └── index.js               # Express backend + Claude API call
├── src/
│   ├── App.jsx                # root component, state, persistence
│   ├── main.jsx               # React 18 entry
│   ├── styles.css             # all app styles
│   └── components/
│       ├── InputForm.jsx
│       └── BulletList.jsx
├── .env.example
├── .gitignore
├── index.html                 # Vite entry
├── LICENSE
├── package.json
├── README.md
└── vite.config.js
```

## Scripts

| Command           | What it does                                             |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Starts Vite (5173) + Express (3001) together             |
| `npm run client`  | Only the Vite dev server                                 |
| `npm run server`  | Only the Express backend                                 |
| `npm run build`   | Builds the client into `dist/`                           |
| `npm start`       | Runs Express serving `dist/` (production)                |
| `npm run preview` | Vite preview of the production build                     |

## Environment variables

| Variable             | Required | Default                        |
| -------------------- | -------- | ------------------------------ |
| `ANTHROPIC_API_KEY`  | yes      | —                              |
| `PORT`               | no       | `3001`                         |
| `CLAUDE_MODEL`       | no       | `claude-haiku-4-5-20251001`    |

Haiku is fast and cheap; switch to `claude-sonnet-4-6` for higher-quality bullets.

## API

`POST /api/generate`

```json
{
  "jobRole": "Senior Backend Engineer",
  "yearsOfExperience": "6",
  "skills": "Go, Postgres, Kafka, AWS",
  "workDescription": "Led migration off monolith...",
  "count": 5
}
```

Responds with `{ "bullets": string[], "model": string }`.

Built-in protections: per-IP rate limit (15 requests/minute), max 10 bullets per request, 200 KB request body cap.

## Hosting options

This is a Node.js app (Express + static React bundle), so you need a host that runs Node, not a pure static host.

### Easiest: Render

1. Push this repo to GitHub.
2. Go to <https://render.com> → **New → Web Service** → connect the repo.
3. **Build command:** `npm install && npm run build`
4. **Start command:** `npm start`
5. Add environment variable `ANTHROPIC_API_KEY`.
6. Deploy. Free tier works but cold-starts in ~30s.

### Also good: Railway

1. <https://railway.app> → **New Project → Deploy from GitHub repo**.
2. Railway auto-detects Node. Set `ANTHROPIC_API_KEY` in Variables.
3. It uses `npm start` by default. Done.

### If you want serverless: Vercel

Vercel doesn't love long-running Express servers, but works fine if you convert `server/index.js` into a single `api/generate.js` route under `/api`. The React part of this app deploys to Vercel out of the box — only the backend needs a small rewrite. Let me know if you want that variant.

### Fly.io / DigitalOcean App Platform / AWS

All work with `npm start`. Just pass `ANTHROPIC_API_KEY` as an env var.

### What NOT to use

- **GitHub Pages / Netlify (static-only) / Cloudflare Pages alone** — these only serve static files, so `/api/generate` will 404.
- **Putting your API key in a `VITE_*` env var** — Vite inlines those into the JS bundle, meaning anyone can view-source and steal your key.

## Security notes

- The API key lives only on the server, never the client bundle.
- Rate limit is a soft in-memory counter — fine for a personal demo, add a real limiter (e.g. `express-rate-limit` with Redis) before making it public.
- No user data is stored server-side; bullets and form state live in the browser's localStorage only.

## Troubleshooting

**"Server is missing ANTHROPIC_API_KEY"** — you didn't copy `.env.example` to `.env`, or you copied it but the server was already running. Restart with `npm run dev`.

**401 from the API** — key is wrong or revoked. Generate a new one at the console.

**429 from the local rate limiter** — you hammered refresh. Wait a minute, or lift `RATE_LIMIT_MAX` in `server/index.js`.

**Build fails on CI with "ERESOLVE"** — you edited `package.json` and created a conflict. Delete `node_modules` and `package-lock.json`, run `npm install` again, commit the new lockfile.

## License

MIT — see [LICENSE](./LICENSE).
