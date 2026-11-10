# Unleashed Potential Psychotherapy — website

Marketing site and booking flow for a behavioral health therapy practice on Long Island, NY, founded by Jess Rebelo, LCSW. More clinicians will join. Visitors are prospective clients: each clinician is the "product", and booking a consultation is the "checkout".

Read these before writing code:

1. `docs/SPEC.md`: pages, routes, components, content model, acceptance criteria, build phases
2. `docs/BOOKING.md`: the 3-step booking flow and the Google Calendar integration
3. `docs/SCHEMA_RULES.md`: how page schemas are written (follow it for any new schema)
4. `docs/OPEN_QUESTIONS.md`: decisions still open; do not guess these, leave a `TODO(open-question #n)`

Design reference: `design/prototype/*.html` (open in a browser) and `design/tokens.css`. The prototype is the visual source of truth; the schemas in `schemas/` are the content source of truth.

## Stack

- Next.js (App Router) + TypeScript, `strict: true`
- Plain CSS: `design/tokens.css` as global custom properties + CSS Modules per component. No Tailwind, no UI kit.
- Fonts via `next/font/google`: Playfair Display (500, 700, italic 500) and Lato (400, 700, italic 400)
- Content: JSON files in `content/`, validated against `schemas/` with Ajv (draft 2020-12) at build time and in tests
- Booking: Google Calendar API, server-side only (see `docs/BOOKING.md`)
- Tests: Vitest (unit), Playwright + @axe-core/playwright (e2e and accessibility)
- Package manager: pnpm

## Commands (create these in package.json)

- `pnpm dev`: local dev server
- `pnpm build`: production build (must fail if any content file fails schema validation)
- `pnpm lint` / `pnpm typecheck`
- `pnpm test`: Vitest
- `pnpm test:e2e`: Playwright, including axe checks on every route at 1440px and 390px
- `pnpm validate:content`: validate every file in `content/` against its schema

## Project rules

### Content and CMS

- All page copy comes from `content/` through a `ContentRepository` interface (`lib/content/`). Never hard-code copy in components except true UI strings with no schema field.
- The custom CMS will later replace the filesystem adapter. Keep the interface narrow: `getPage(id)`, `getClinician(slug)`, `listClinicians()`, `getSpecialty(slug)`, `listSpecialties()`, `getBlogPost(slug)`, `listBlogPosts()`, `getMediaAppearance(id)`, `getSiteSettings()`.
- Types for content are generated from `schemas/` (json-schema-to-typescript). Do not hand-write content types.
- Each top-level schema property is a fixed zone rendered by one component. A zone with `hidden: true` renders nothing.
- References (`{ collection, id }`) are resolved in the repository layer, not in components. A reference to a missing or unpublished entry renders nothing and logs a build warning.
- Labels with tokens like `{firstName}`, `{time}`, `{format}`, `{email}`, `{count}` go through one `fillTokens()` helper.

### Booking (non-negotiable)

- Booking starts only on a clinician profile. No page other than a profile links into `/book`.
- `/book` without a valid `clinician` param redirects to `/clinicians`.
- The flow has at most 3 steps, and the chosen clinician and time are visible on every step.
- Google credentials and calendar IDs stay on the server. Never send them to the client or log them.
- Do not put client details (name, email, phone, reason for visit) in logs, analytics or URLs.

### Accessibility (WCAG 2.2 AA, required)

- Use only the color pairs listed in `docs/SPEC.md` §Accessibility. Cream colors are backgrounds and decoration only, never text, borders or icons.
- Body text ≥16px. Links in running text are underlined (not color alone).
- Every form field has a visible `<label>`. Errors appear as text, start with "Error:", and are tied to the field with `aria-describedby`; invalid fields get `aria-invalid="true"`.
- Visible focus ring on every interactive element (`--focus-ring`). Everything works with a keyboard. Use real `<button>`, `<a href>`, `<input>`; no clickable divs.
- Tap targets ≥44×44px (main buttons 48px tall).
- Exactly one `<h1>` per page. No skipped heading levels.
- No text over photos without a solid overlay. No autoplay video or carousels. Respect `prefers-reduced-motion`.
- Icon-only buttons get an `aria-label` (e.g. the calendar booking icon: "Book an appointment").
- Every image has meaningful `alt` (required by the schemas).

### Design

- Match the prototype: generous white space, square corners, hairline dividers in `--color-forest`, quiet outlined buttons that fill dark on hover. No pure white (`#fff`) backgrounds, no gradients, no shadows, no emoji.
- Pages are fluid: max-width 1200px container, 40px side gutter (20px under 900px), grids collapse to one column on phones, and no horizontal scroll at 390px.
- Tone of any UI copy you must write: clinical and warm, not motivational. Avoid coaching words like "unlock" or "potential" in new copy (the brand name is the exception).

### Privacy and compliance

- This is a healthcare site. Treat booking submissions as protected health information.
- No third-party trackers, pixels or session replay on `/book` or any page that shows booking data. See `docs/SPEC.md` §Analytics for what is allowed.
- The footer crisis notice (988 / 911) appears on every page, including `/book`.

## Definition of done for any task

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm validate:content` pass
- New or changed routes pass the Playwright + axe check at 1440px and 390px with zero violations
- Matches the prototype at both widths
- No new hard-coded copy that belongs in a schema
