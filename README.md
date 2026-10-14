# SmartMed — Frontend

Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui. See the [root README](../README.md) for the full project.

```bash
cp .env.example .env.local   # BACKEND_URL=http://localhost:5000
npm install
npm run dev                  # http://localhost:3000
```

- `src/app` – routes only (public site, auth, `/dashboard`, `/admin`, `/share/[token]`)
- `src/features/<feature>` – React Query hooks (`api.ts`) and the components for that feature
- `src/components/{ui,shared,layout}` – shadcn primitives, shared states/dialogs, app shell
- `src/lib` – API client with token refresh, formatting, Bangla voice, push, image compression
- `src/proxy.ts` – redirects logged-out users away from protected routes

All `/api/*` requests are rewritten to `BACKEND_URL` (see `next.config.ts`), so auth cookies stay first-party.
