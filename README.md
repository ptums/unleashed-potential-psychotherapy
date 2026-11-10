# Unleashed Potential Psychotherapy

Website for Up Therapy Group (TWS-117).

`design-handoff/` holds the approved Claude Design export: prototype HTML, tokens, schemas and seed content.

## Develop

```bash
pnpm install
cp .env.example .env.local   # CONTENT_SOURCE=mock by default
pnpm dev
```

Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` (Playwright + axe at 1440 and 390).

## Content

Pages read content through `lib/content` (`getContent()`). `CONTENT_SOURCE=mock` uses `content/mock` (from the handoff); `CONTENT_SOURCE=cms` uses the CMS at `CMS_API_URL`. Schemas in `schemas/` are copied from `unleashed-cms/json` with `pnpm sync:schemas`, which also regenerates `lib/content/generated/`.

## Deploy

Merges to `main` deploy to Cloudflare Workers (OpenNext) after CI passes. Needs repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and optional repo variables `CONTENT_SOURCE` and `CMS_API_URL`.
