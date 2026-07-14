# DECISIONS

## Durable decisions

1. Keep Codex progress notes local to this repository under `.codex/`.
2. Keep installed project skills in `.codex/skills`, not in the global Codex skills directory.
3. Treat the current app as a Next.js admin template baseline and evolve it toward CRM functionality incrementally.
4. Prefer small, inspectable changes before any broad refactor.
5. Build the product as a multi-tenant SaaS from day one.
6. Use a combined NextAuth strategy for the first auth cut.
7. Plan WhatsApp Embedded Signup from the start.
8. Defer white-label implementation until the core CRM workflow is stable.

## Rationale

- Local notes travel with the project and stay relevant to the repo history.
- Keeping skills local avoids side effects on other projects and on the user-wide environment.
- The template already provides shared layout, theme, and navigation primitives that can be reused while the CRM is being introduced.
- The shell work should stay on the current template base instead of forcing a cleanup rewrite first.
