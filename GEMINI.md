# portofolio — agent handoff

Latif's personal portfolio site: Next.js 16, React 19, framer-motion, GSAP, lenis. Each project is
themed as a **tarot "arcana" card** (images in `public/img/arcana/`). State as of 2026-09-26.

## How projects are defined
- All entries live in `data/projects.ts`. Fields: `id` (display label only, like '07'), stack string
  (`'NEXT.JS • PRISMA • MONGODB'`), category and year, roles array, description (1–2 sentences),
  optional `overviewHeading`, image paths under `public/img/<Project>/` (thumbnail, optional video,
  gallery images, which can be vertical), arcana card and mobile label (like `XVIII. THE MOON`), and theme `light`/`dark`.
- `scripts/verify_data.ts` checks that every referenced image path exists. Run it after adding assets.
- Unused arcana cards: moon, sun, tower, devil, death, hermit, emperor, empress, strength, chariot, and more.

## Uncommitted work
- **HYDE entry** added as `id: '07'` (Pantheon moved to '08' so it stays last). Stack
  `NEXT.JS • PRISMA • MONGODB`, Web Dev 2026, roles FULLSTACK + UI/UX, arcana **The Hierophant**
  (`hiero.webp`), dark theme, heading "Bureaucracy, Digitized.". The copy was derived from HYDE's
  code, so the user should confirm roles and wording.
- **Image paths are placeholders** (`/img/HYDE/thumbn.avif`, `1.avif`, `2.avif`) and don't exist yet, so the card
  shows broken images. Only login-page screenshots exist (PNG, in `.playwright-mcp/`). Real shots
  of the dashboard, admin review and QR scan need a working HYDE login (see `D:\proj\HYDE\GEMINI.md`),
  converted to AVIF.
- `package.json` bumped `next` 16.1.1 → `^16.3.5`, and the lockfile changed. Unclear whether that was
  intentional, so ask before committing.
- `.claude/launch.json` and `.playwright-mcp/` are untracked leftovers. Delete them or gitignore them.
