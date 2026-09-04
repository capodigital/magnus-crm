This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## WhatsApp operations

The CRM follows WhatsApp's customer-care window:

- A customer message opens a 24-hour window for free-form replies.
- Each new customer message refreshes the window.
- When the window is closed, the inbox blocks free-form text and only approved, active templates can be sent.
- Templates belong to the connected customer's WhatsApp Business Account. They are not global assets of Magnus CRM.

For a new environment, deploy the tracked Prisma migration with the production `DATABASE_URL`:

```bash
npm run db:migrate:deploy
```

If the schema was already applied with `prisma db push`, backfill existing conversation timestamps through Prisma instead of running SQL manually:

```bash
npm run db:backfill:whatsapp-reply-windows
```

Keep `META_ACCESS_TOKEN` server-only. The app creates text templates in the tenant's connected WABA, sends them to Meta for review, and shows the resulting status in Settings. Existing templates created in Meta Business Manager can be imported from **Settings > WhatsApp > Sincronizar con Meta**.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
