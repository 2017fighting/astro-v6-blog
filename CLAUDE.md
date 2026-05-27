# astro-paper-v6

## Commands

- `bun run dev` — start dev server
- `bun run build` — typecheck + build + pagefind index
- `bun run preview` — preview production build
- `bun run format` — format with prettier
- `bun run format:check` — check formatting
- `bun run lint` — lint with eslint
- `bun run sync` — sync astro types

## Stack

- Astro 6 + React 19 + TypeScript
- Tailwind CSS 4
- MDX content, Pagefind search, Giscus comments
- Deploy: Cloudflare Pages (wrangler)

## Notes

- Build copies pagefind output to `public/` after indexing
- Static assets uploaded to R2 separately via `bun run upload:assets`
- Full release: `bun run release` (build → upload assets → deploy)
