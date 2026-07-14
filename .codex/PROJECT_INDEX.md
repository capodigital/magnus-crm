# PROJECT_INDEX

## Repository snapshot

- Stack: Next.js 16, React 19, TypeScript, MUI, Tailwind CSS v4.
- Current package name: `vuexy-mui-nextjs-admin-template`.
- The repo is a UI-heavy admin template with shared layout, menu, theme, and utility layers already in place.
- The shell now contains a CRM-oriented home page and route placeholders for inbox, leads, pipeline, billing, and settings.

## Key files

- `package.json` - scripts, dependencies, and package identity.
- `.env.example` - required environment placeholders for app, database, NextAuth, and Meta.
- `src/app/layout.tsx` - root HTML/body shell and app metadata.
- `src/app/page.tsx` - root redirect into the CRM workspace.
- `src/app/globals.css` - global styles and Tailwind/theme integration.
- `src/app/(dashboard)/home/page.tsx` - CRM dashboard landing page.
- `src/app/(dashboard)/inbox/page.tsx` - inbox shell for WhatsApp conversations.
- `src/app/(dashboard)/leads/page.tsx` - leads shell.
- `src/app/(dashboard)/pipeline/page.tsx` - pipeline shell.
- `src/app/(dashboard)/billing/page.tsx` - billing shell.
- `src/app/(dashboard)/settings/page.tsx` - workspace settings shell.
- `src/app/(blank-layout-pages)/login/page.tsx` - login route entry point.
- `src/views/Login.tsx` - login view component.
- `src/views/NotFound.tsx` - not-found view component.
- `src/components/crm/SectionPage.tsx` - shared route shell for CRM sections.

## Important directories

- `src/app/` - App Router routes and layouts.
- `src/components/` - reusable components, shared UI, and layout pieces.
- `src/@core/` - core theme, hooks, utilities, and design-system primitives.
- `src/@layouts/` - layout wrappers and layout-specific components.
- `src/@menu/` - navigation system and menu rendering.
- `src/configs/` - theme and color configuration.
- `public/` - static images and assets.
- `.codex/skills/` - project-local Codex skills installed for this repo.

## Useful commands

- `npm run dev` - start the local Next.js dev server.
- `npm run build` - build production output.
- `npm run lint` - run ESLint across the repo.
- `npm run lint:fix` - apply automatic lint fixes.
- `npm run format` - format `src/**/*.{js,jsx,ts,tsx}` with Prettier.
- `npm run build:icons` - regenerate the icon CSS bundle.

## Notes

- A `git status` check was not available from the current workspace view, so this index is based on the filesystem and package metadata.
- The dashboard home now frames the workspace around leads, conversations, pipeline, billing, and settings instead of generic template content.
