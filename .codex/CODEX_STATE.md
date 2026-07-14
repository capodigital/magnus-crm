# CODEX_STATE

## Current objective
Plan and execute the CRM described in `deep-research-report.md` using explicit goals, phased implementation, and project-local Codex skills.

## Current state
- Local Codex skills were installed in `.codex/skills` inside this project only.
- No existing `CODEX_STATE.md`, `PLANS.md`, `DECISIONS.md`, or `PROJECT_INDEX.md` were present before this pass.
- The repository is currently a Next.js admin template (`vuexy-mui-nextjs-admin-template`), not a CRM product yet.
- Main app entry points today are the dashboard and blank-layout routes, with a simple placeholder home page and a login page wired to shared layout/theme code.
- A first-pass execution plan now exists in `.codex/PLANS.md` with phases, deliverables, skills, and open questions.
- The current shell uses a shared provider stack, a vertical or horizontal layout wrapper, and theme settings driven partly by cookies.
- The first CRM shell slice is now in place: root redirects to `/home`, navigation points to CRM modules, and the dashboard landing page is CRM-oriented.
- The repo now has an expanded `.env.example` that lists the initial App, Database, NextAuth, and Meta placeholders we will need.

## Assumptions and constraints
- Keep this journal local to the repo.
- Do not modify the global Codex skills directory.
- Treat the current codebase as the starting template and evolve it incrementally.
- Preserve existing framework conventions unless the CRM rewrite specifically requires a change.
- If the user has not answered a product-shaping question yet, proceed with the recommended default and record it instead of waiting.
- White-label work is intentionally deferred until the core CRM loop is stable.

## Files touched in this journal pass
- `.codex/CODEX_STATE.md`
- `.codex/PLANS.md`
- `.codex/DECISIONS.md`
- `.codex/PROJECT_INDEX.md`
- `src/app/page.tsx`
- `src/app/(dashboard)/home/page.tsx`
- `src/app/(dashboard)/inbox/page.tsx`
- `src/app/(dashboard)/leads/page.tsx`
- `src/app/(dashboard)/pipeline/page.tsx`
- `src/app/(dashboard)/billing/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/components/crm/SectionPage.tsx`
- `src/data/navigation/verticalMenuData.tsx`
- `src/data/navigation/horizontalMenuData.tsx`
- `src/app/layout.tsx`
- `src/configs/themeConfig.ts`

## Next safe action
Inspect the auth and tenant boundaries next so we can turn the shell into a secured multi-tenant app, then ask for the required keys.
