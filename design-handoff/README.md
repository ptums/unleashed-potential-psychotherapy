# Unleashed Potential Psychotherapy: build handoff

This folder is the starting point for building the new site with Claude Code. Copy its contents into the root of the repo, commit, and start Claude Code in the repo.

```
CLAUDE.md                  Project instructions Claude Code reads automatically
docs/
  SPEC.md                  Routes, global elements, page-by-page zones, accessibility, analytics, acceptance criteria, build phases
  BOOKING.md               3-step booking flow and Google Calendar integration
  SCHEMA_RULES.md          Rules every content schema follows
  OPEN_QUESTIONS.md        Decisions still needed from the client
design/
  tokens.css / tokens.json Colors, type, spacing, controls (contrast pre-checked)
  prototype/*.html         Approved design, exported from the canvas; open in a browser
schemas/                   JSON Schema 2020-12, one per page type (9 files)
content/                   Seed content matching the schemas (from each schema's example)
scripts/check_schemas.py   Validates schemas against SCHEMA_RULES.md and their examples
```

## First prompt for Claude Code

> Read CLAUDE.md and every file in docs/. Then do Phase 0 from docs/SPEC.md §10: scaffold the Next.js app, wire up design/tokens.css and the fonts, build the header and footer shell, add Ajv content validation and generated types from schemas/, write the three missing schemas in SPEC §5 with seed content, and set up CI (typecheck, lint, Vitest, content validation, Playwright + axe at 1440 and 390). Make a plan first and show it to me before writing code.

Then go phase by phase (1 → 5), reviewing each phase before starting the next.

## Notes

- **Prototype pages:** the prototype's Booking and Blog pages are static exports. Their interactive behavior (step switching, validation, topic filter) is specified in `docs/BOOKING.md` and `docs/SPEC.md`, and is also clickable in the design canvas.
- **Brand name:** in the prototype, Home already uses the new brand name. On the other pages the old name was replaced in the export.
- **Photos:** are labelled placeholders until real photography is supplied.
