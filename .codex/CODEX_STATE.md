# CODEX_STATE

## Current objective
Plan and execute the CRM described in `deep-research-report.md` using explicit goals, phased implementation, and project-local Codex skills.

## Current state
- Local Codex skills were installed in `.codex/skills` inside this project only.
- The repository is currently a Next.js admin template (`vuexy-mui-nextjs-admin-template`), not a CRM product yet.
- Main app entry points now include CRM route shells for home, inbox, leads, pipeline, billing, settings, and login, all wired into the shared layout/theme code.
- The root route and dashboard layout now redirect unauthenticated users to `/login`, and the login page handles credentials plus optional Google sign-in.
- The current shell uses a shared provider stack, a vertical or horizontal layout wrapper, and theme settings driven partly by cookies.
- The auth layer now uses NextAuth with Prisma, a `proxy.ts` guard, session helpers, and local NextAuth type augmentation.
- A server-only app context helper now resolves request host, session, tenant, and membership in one place.
- Dashboard access is now tenant-aware: platform-host requests still work with session auth, while tenant-scoped hosts require both a resolved tenant and a matching membership.
- The Prisma schema and generated client now include the tenant core plus the first CRM domain slice: contacts, leads, conversations, messages, pipelines, and pipeline stages.
- The repo now has an expanded `.env.example` that lists the initial App, Database, NextAuth, Google, and Meta placeholders we will need.
- Google OAuth and Meta WhatsApp values are still pending from the user, as requested.

## Assumptions and constraints
- Keep this journal local to the repo.
- Do not modify the global Codex skills directory.
- Treat the current codebase as the starting template and evolve it incrementally.
- Preserve existing framework conventions unless the CRM rewrite specifically requires a change.
- If the user has not answered a product-shaping question yet, proceed with the recommended default and record it instead of waiting.
- White-label work is intentionally deferred until the core CRM loop is stable.
- Keep using project-local progress notes and explicit plan updates for the long-running CRM build.

## Files touched in this journal pass
- `.codex/CODEX_STATE.md`
- `.codex/PLANS.md`
- `.codex/DECISIONS.md`
- `.codex/PROJECT_INDEX.md`
- `src/app/(dashboard)/layout.tsx`
- `src/lib/app-context.ts`
- `src/lib/tenant.ts`
- `prisma/schema.prisma`
- `prisma/generated/prisma/*`

## Next safe action
Add the first repository and bootstrap layer on top of the CRM models so we can create an initial tenant workspace, seed a default pipeline, and prepare for WhatsApp event ingestion.
