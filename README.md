# Ephemeral Reverie

Next.js (App Router) + Tailwind v4 site, hosted on Netlify, video via Bunny.net Stream.

- `app/page.tsx` – full-screen muted looping hero video
- `app/projects` – gallery driven by `lib/projects.ts` (add a film = add an entry)
- `app/projects/[slug]` – watch page with "Support this Short Film" gate (Stripe)
- `app/about`, `app/contact` – shader backgrounds; contact posts to Web3Forms
- `components/ui/shader-state.tsx` – WebGL shader background
- Images live in `public/`

Stripe: set the Payment Link's after-payment redirect to
`https://<your-site>/projects/the-curse-of-the-miller?unlocked=true`.

```bash
npm install
npm run dev
```
