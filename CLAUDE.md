@AGENTS.md

# Rover Notes

A mobile-first personal notebook for a roving listener tracking neighbors' gifts, dreams, and connections. Single user, ~100 people in scope.

## Stack

- Next.js 15 (App Router) with TypeScript
- Supabase (Postgres + magic link auth)
- Anthropic Claude API via `@anthropic-ai/sdk` (server-side only, never expose the key client-side)
- Tailwind CSS with custom theme (paper/ink/terracotta/sage palette)
- Fonts: Fraunces (serif headings/names), DM Sans (body), Caveat (handwritten marginalia)
- Lucide React icons (heavier stroke weight)

## Project structure

- `src/app/` — Next.js App Router pages and API routes
- `src/app/api/` — server-side API routes (parse-note, remember, people, notes, search)
- `src/components/` — shared React components
- `src/lib/` — Supabase clients, types, helpers
- `supabase/migrations/` — Postgres schema

## Key conventions

- All Claude API calls go through server-side API routes (never client-side)
- The data model uses notes as source of truth — gifts and connections always link back to their source note
- Gift kinds: head, heart, hand, teachable, dream (from McKnight/Block's ABCD framework)
- Supabase clients: `supabase-server.ts` for API routes (uses service role key), `supabase-browser.ts` for client components (uses anon key)

## Aesthetic constraints

This is NOT a CRM, SaaS dashboard, or data management tool. It is a personal notebook.

- Background: cream/paper (#F8F1E4), not white
- Text: deep brown ink (#3B2A1E), not black
- No gradients, glass-morphism, neon, or "snappy fintech" motion
- Cards get subtle organic rotation (0.5-2 degrees) to feel like a real pile
- Empty states are warm and quiet, not corporate onboarding
- Tap targets at least 48px tall
- Motion is slow and gentle (fades, not slides)

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npx tsc --noEmit # type check
```

## Environment variables

See `.env.example`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`.
