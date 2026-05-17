# MORTALIS — Feed it, or forget it.

Deflationary pixel-art NFT pets that die if you forget to feed them.
No servers. No admins. Only `block.timestamp`.

Landing page built with Vite + React + TypeScript + Tailwind. Pixel-art
sprites are rendered inline from SVG/grid maps — no external assets.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint
npm run build    # outputs to dist/
npm run preview
```

## Deploy

Configured for Vercel out of the box (`vercel.json`). Link this repo to a
Vercel project named `mortalis-nft` and the public URL becomes
`https://mortalis-nft.vercel.app`.

## Structure

- `index.html` — fonts (`Press Start 2P`, `VT323`), meta tags.
- `src/App.tsx` — landing page (hero, hatch box, species, elements,
  lifecycle, roadmap, FAQ, footer) + inline pixel sprites.
- `src/App.css` — pixel theme tokens, frames, buttons, animations.
- `src/index.css` — Tailwind base.
- `vercel.json` — SPA rewrite + Vite framework hint.

## Concept

- Sealed hatch boxes — species, element, and stats roll on-chain.
- Four species (Slime, Spirit, Bug, Vine) × five elements.
- Lifecycle: `HEALTHY → WEAK → DYING → SKELETAL → tombstone`.
- After 28 days without a feed, `executeDeath()` burns the NFT
  permanently — only a tombstone remains.
