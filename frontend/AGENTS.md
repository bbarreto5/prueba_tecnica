<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend architecture

Next.js (App Router) + TypeScript. The project is currently a fresh scaffold (`app/`, `public/`); the structure below is the target architecture and should be built out incrementally as features are added — don't create empty placeholder folders in advance.

```text
frontend/
├── app/            # routes, layouts, composition (App Router only)
├── components/     # reusable, feature-agnostic UI
├── features/       # domain logic: auth/, requests/, users/, companies/
├── services/       # backend communication + response adaptation
├── hooks/          # hooks shared across features
├── types/          # types shared across features
├── lib/            # cross-cutting utilities/config, not a feature dumping ground
├── tests/
```

## Layer responsibilities

- `app/`: routing and composition only. No business logic — that belongs in `features/`. Don't turn a whole page into a Client Component when only one small part needs interactivity.
- `components/`: agnostic to any specific domain. Nothing here should know about `auth`/`requests`/`users`/`companies` concepts.
- `features/`: one folder per domain (`auth`, `requests`, `users`, `companies`). Keep a feature's own components/hooks/services/types inside that feature until there's *real* reuse across features — then promote to `components/`, `hooks/`, or `types/`. Don't promote speculatively ("might be reused someday").
- `services/`: backend I/O and response adaptation only, no UI or presentation logic. Centralizes API base URL / auth headers.
- `lib/`: transversal utilities and config. Not a place to hide feature-specific business logic.

Data flow direction: `app → features/components → hooks/services/lib`. Don't go the other way (e.g. `services` importing from `components`, `lib` reaching into a specific feature).

## Server vs Client Components

Default to Server Components. Add `"use client"` only where a component actually needs state, effects, event handlers, or browser-only APIs — scope it to the smallest subtree that needs it, not the whole page.

## Backend as source of truth

The frontend doesn't duplicate backend business rules or authorization logic. Frontend-side validation is for UX only; permissions and roles (`admin`, `support`, `company`, `user`) are enforced by the backend — hiding a UI option is not access control. Auth/session logic lives centrally in `features/auth`, not duplicated per page.

## State management

Keep it simple: local state + Server Components first. Don't add Redux, Zustand, React Query, SWR, Axios, or similar before checking, in order: (1) does Next.js/React already solve this, (2) is a local/feature hook enough, (3) does this data actually need to be global. If you do add one of these, note the reasoning in the PR — it's an architectural change, not a routine dependency bump.

## Environment variables

Never hardcode URLs/secrets/tokens. Document required vars in `.env.example`. Don't expose anything sensitive via `NEXT_PUBLIC_*`.

## Styling

Tailwind is the project's styling solution (see `tailwind.config.ts`). Don't introduce another styling approach without an architectural reason.

## TypeScript

Avoid `any`. When a type represents a backend response shape used in more than one place, centralize it in `types/` (or the owning feature's `types/` if it's feature-specific) instead of redefining it.

---

When more than one valid approach exists, prefer in order: simplest solution → reuse of existing code/services/types → clearest separation of responsibilities → easiest to test/maintain → new abstraction or dependency, only if the above don't cover it.

Update this file only when architecture, layer responsibilities, or conventions actually change — not for routine feature work.
