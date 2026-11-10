# Build spec

## 1. Goal

Replace the practice's current coaching-oriented site with a clinical, trustworthy site that brings in therapy clients. The current phase is done when the new site is live with its new architecture (including booking) and a Google Ads campaign is running against it.

Brand: **Unleashed Potential Psychotherapy**. Some prototype screens and older notes say "Up Therapy Group"; that name is retired. Use the brand from `siteSettings` everywhere.

## 2. Routes

| Route | Schema | Content file | Prototype |
|---|---|---|---|
| `/` | `home.json` | `content/pages/home.json` | `index.html` |
| `/our-approach` | `our-approach.json` | `content/pages/our-approach.json` | `our-approach.html` |
| `/clinicians` | none yet (see §5) | — | — |
| `/clinicians/[slug]` | `clinician-profile.json` | `content/clinicians/*.json` | `clinician-jess-rebelo.html` |
| `/specialties/[slug]` | `specialty.json` | `content/specialties/*.json` | `specialty-emdr.html` |
| `/what-to-expect` | `what-to-expect.json` | `content/pages/what-to-expect.json` | `what-to-expect.html` |
| `/book` | `booking.json` | `content/pages/booking.json` | `booking.html` + canvas |
| `/featured-in` | `featured-in.json` | `content/pages/featured-in.json` | `featured-in.html` |
| `/blog` | `blog.json` | `content/pages/blog.json` | `blog.html` |
| `/blog/[slug]` | `blog-post.json` | `content/blogPosts/*.json` | `blog-post.html` |

Collection slugs: the CMS owns slugs. In the filesystem adapter, the slug is the file name.

Pages linked from the nav but not designed yet: Careers, Contact, Privacy Notice, In Person & Online, Fees & Insurance, FAQs, Who We Work With. Phase 1 behavior is in `OPEN_QUESTIONS.md` #3. Until it is decided, render them from a simple `textPage` layout with an H1 and a markdown body, and keep them out of the sitemap.

`/clinicians`: while exactly one clinician is published, redirect `/clinicians` to that profile, so the header booking icon reaches a profile in 1 click. With 2+ clinicians, render a list of clinician cards (same card as the Home clinicians zone).

## 3. Global elements

These come from a `siteSettings` singleton. Its schema does not exist yet; write it first, following `SCHEMA_RULES.md` (see §5).

### Header

- **Wordmark:** brand name in Playfair 26px, with a tagline below in 12px uppercase, linking to `/`.
- **Desktop nav (≥900px):** `Our Mission ▾ | Specialties ▾ | Experience ▾ | Blog | [calendar icon]`.
  - **Our Mission:** Our Approach, Our Clinicians, Featured In, Careers
  - **Specialties:** What We Treat (`/#specialties`), How We Help (specialty pages), Who We Work With
  - **Experience:** What to Expect, In Person & Online, Fees & Insurance, FAQs
- **Dropdowns:** keyboard operable. The prototype uses `<details>`. In production, use a disclosure button with `aria-expanded` that closes on Escape and on outside click, and returns focus to the trigger.
- **Booking icon:** a 48×48 outlined square with a calendar-check icon, `aria-label="Book an appointment"`, linking to `/clinicians` (one clinician: the redirect makes it 1 click).
- **Mobile (<900px):** the booking icon plus a 44×44 menu button that opens a full-width panel with the three groups and Blog.
- **Current page:** marked with `aria-current="page"` and a 2px underline.

### Footer (dark band)

- **Crisis box:** "In crisis or in danger? Call or text 988 (Suicide & Crisis Lifeline) or call 911. We are not an emergency service." `tel:` links. It appears on every page, including `/book`.
- **Practice details:** name and address.
- **Links:** Careers, Contact, Privacy Notice, Our Clinicians.
- **Social:** Instagram and Facebook, as icon links with `aria-label`.
- **Copyright:** © year and brand.

The `/book` route uses a minimal checkout header: the wordmark and "Back to {firstName}'s profile". It uses a slim footer with the crisis line and Privacy Notice.

## 4. Pages: zone → component

Every top-level schema property is one zone rendered by one component, in the `x-cms.zones` order. `hidden: true` renders nothing. The prototype shows exact layout and spacing.

### Home (`home.json`)

| Zone | Component | Notes |
|---|---|---|
| `hero` | `HeroSplit` | Text left, 4:5 image right; stacks on mobile. Trust line items joined with " · ". |
| `featuredIn` | `FeaturedInStrip` | Hairline top and bottom. Outlet names in Playfair italic, linked to each appearance's primary URL. |
| `specialties` | `TileGrid` | Bordered tiles; a tile links to `/specialties/[slug]` only if that page is published, otherwise it is not a link. |
| `clinicians` | `ClinicianCards` + `RecruitingCard` | Card shows portrait, name, credentials, specialties and **live** "Next open: {date}" (from the availability API, cached ≤15 min). The button goes to the profile. |
| `howItWorks` | `NumberedSteps` | 01/02/03 numerals in Playfair. |
| `approachBand` | `StatementBand` | Dark band, large Playfair italic statement. |

### Our Approach (`our-approach.json`)

The zones are hero (centered), featureImage (21:9), values (definition list grid), standardOfCare (light cream band, list with bold lead-ins), founderNote (portrait + blockquote) and closingCta (dark band).

### Clinician profile (`clinician-profile.json`)

- **Breadcrumb:** Home / Our Clinicians / {name}.
- **`profileHeader` row:** portrait (3:4), name H1, role line, summary, quick facts and specialty chips. A chip links when its specialty page is published.
- **`booking` card (light cream):**
  - **Header:** heading and subhead.
  - **Times:** "Next open times · ET", then a grid of `slotsShown` slot links from the availability API. Each slot is a link to `/book?clinician={slug}&slot={ISO}`.
  - **Buttons:** "Book a Consultation" goes to `/book?clinician={slug}` (step 1 with no time preselected). "See all open times" goes to the same place.
  - **Not accepting clients:** if `acceptingNewClients` is false, replace the times with `waitlistMessage`.
  - **API down:** the card shows "Open times are unavailable right now" plus the practice phone number. Never show an empty grid.
- **Detail rows:** approach, credentials, fees (table: session label · duration, price; "free" → "Free"; "contact" → "Contact us"; money → "$amount"), and featuredIn. Each is a two-column row with a hairline above.
- **`closingCta`:** dark band. If `heading` is null, show "Next open: {weekday, Mon D} · {time}" from the API.
- **Structured data:** JSON-LD `Person` + `MedicalBusiness` (or `ProfessionalService`), with name, credentials and areaServed.

### Specialty (`specialty.json`)

The zones are hero (text and 5:4 image; the CTA scrolls to `#clinicians`), whoItHelps (light cream band, list), process (numbered steps), clinicians (cards for clinicians whose profile lists this specialty when `mode: auto`), faq (accessible accordion; a `<details>` element is acceptable) and closingCta. `tileSummary` is used only on the Home tile.

### What to Expect (`what-to-expect.json`)

The hero is centered. In the steps zone, each step shows a big numeral, a "Step n of N" eyebrow, the title, the body and a row of facts (bold label, value). The formats zone is an image and text pair on light cream. closingCta follows.

### Booking (`booking.json`)

See `docs/BOOKING.md`.

### Featured In (`featured-in.json`)

- **hero:** centered, with outlet names listed below the intro.
- **featuredEpisode:**
  - **Image:** a 16:9 image linking to the video URL, with a solid "Watch on YouTube" label. No embedded player, no autoplay.
  - **Text:** title and outlet from the appearance, plus the summary override.
  - **Buttons:** one per platform link.
- **appearances:** rows with type and outlet on the left, and title, summary and platform buttons on the right.
- **pressCta:** dark band with a `mailto:` link.

### Blog index (`blog.json`)

- **hero:** centered.
- **featuredPost:** the latest post (or the manual pick) in a large split card.
- **articleList:**
  - **Filters:** topic buttons with `aria-pressed`, plus "All".
  - **Results:** a live count message, then a 3-column grid of cards (3:2 image, topic, title link, dek, date, read time).
  - **Paging:** shows `pageSize` posts, with Next/Previous links (`?page=2&topic=EMDR`) so filtering works without JavaScript.
- **closingCta:** dark band.

### Blog post (`blog-post.json`)

- **articleHeader:** breadcrumb, then a centered header (topic · read time, H1, dek, "By {author link} · {date}"), then a 21:9 image.
- **body:** a 680px reading column, 19px text. Markdown supports H2 and H3, lists, quotes (rendered as a centered Playfair italic pull quote) and links.
- **crisisCallout:** a light cream box.
- **authorBox:** pulls name, portrait and summary from the author's clinician entry. The `bio` field overrides the summary.
- **related:** 3 cards.
- **closingCta:** dark band.
- **Structured data:** JSON-LD `BlogPosting`.

## 5. Schemas still to write (Phase 0)

Write these with `SCHEMA_RULES.md`, add a seed file for each, and make them pass `scripts/check_schemas.py`:

1. **`site-settings.json`** (singleton, no route). Zones:
   - `brand`: name, tagline, logo image optional
   - `header`: nav groups and links, booking icon label
   - `footer`: address, links, social URLs, crisis text
   - `contact`: phone, email
   - `meta`: default SEO and OG image
2. **`media-appearance.json`** (collection, no route). Fields:
   - `type`: podcast, video, article or interview series
   - `outlet`, `title`, `summary`, `date`
   - `primaryUrl`
   - `platformLinks[]`: label and URL; YouTube, Spotify, Apple Podcasts, outlet page, MP3
   - Seed with the real items in `content/pages/featured-in.json` and the URLs below.
3. **`text-page.json`** (collection, `/[slug]`): H1 and markdown body, for the undesigned pages.

Real media URLs to seed:

- YouTube: https://youtu.be/AOTdkjDBdzM
- Spotify: https://open.spotify.com/episode/5nWVZ64dgqsg7F4DT5iJiv
- Apple Podcasts: https://podcasts.apple.com/us/podcast/jessica-rebelo-self-worth-is-key-in-relationship-dynamics/id1617927566?i=1000596320700
- WomLEAD: https://www.womleadmag.com/jessica-rebelo/
- Female Founders Podcast, Ep. 77 (MP3): https://traffic.libsyn.com/3d217128-111a-4aac-a1a5-dce8b932b1ac/Female_Founders_Podcast_-_Episode_77_-_Jessica_Rebelo.mp3
- PBN Podcasts, Steve Harper interviews (4 parts, 2024): URLs not yet known

## 6. Accessibility

WCAG 2.2 AA. Allowed text and background pairs (ratios checked):

| Text | Background | Ratio | Use |
|---|---|---|---|
| `#31464B` | `#FAF7F2` | 9.32 | default |
| `#31464B` | `#EEE8D4` | 8.12 | light cream sections |
| `#31464B` | `#D9CEB5` | 6.38 | text on placeholders only |
| `#506967` | `#FAF7F2` | 5.52 | secondary text, eyebrows |
| `#506967` | `#EEE8D4` | 4.81 | secondary text |
| `#FAF7F2` | `#31464B` | 9.32 | dark bands |
| `#FAF7F2` | `#506967` | 5.52 | allowed, not used yet |
| `#9B2C2C` | `#FAF7F2` | ≈7 | errors |

Not allowed:

- `#506967` text on `#D9CEB5` (3.78)
- Any cream color as text, border or icon

See `CLAUDE.md` for the full rule list. CI runs axe on every route at 1440px and 390px.

## 7. Analytics and ads

The phase goal includes a Google Ads campaign, which needs conversion tracking. Health-related tracking is regulated (HHS guidance on online tracking technologies, and Google's health ad policies), so:

- No third-party tags (Google Ads, GA4, Meta) on `/book` or any page rendering booking data.
- Track the conversion **server-side**: when a booking succeeds, send a Google Ads offline/enhanced conversion containing only the `gclid` captured on landing, which is stored in a first-party cookie, and a timestamp. Never send name, email, phone or appointment details.
- On content pages, load tags only after consent (cookie banner).
- Before launch, the client confirms the approach in `OPEN_QUESTIONS.md` #5.

## 8. SEO and performance

- Every page uses `seo.title`, `seo.description` and `seo.ogImage`, falling back to the site defaults.
- Generate `sitemap.xml` and `robots.txt`; `/book` is `noindex`.
- Canonical URLs.
- 301 redirects from old site URLs to the closest new page; the map goes in `next.config`.
- Lighthouse targets on mobile: Performance ≥90, Accessibility 100, Best Practices ≥95, SEO 100.
- Static-generate all content pages. Availability is fetched at request time with a short cache.
- Images: `next/image`, using the schema focal point for cropping.

## 9. Acceptance criteria

1. Booking starts only on a clinician profile, and a visitor reaches a profile in 1 click from every page (the header booking icon).
2. Booking takes at most 3 steps, and the chosen clinician and time stay visible on every step.
3. Every text and UI color pair passes WCAG 2.2 AA; axe reports zero violations on every route at both widths.
4. All content renders from `content/` and validates against `schemas/`; hiding a zone removes it.
5. A booking creates a Google Calendar event on the clinician's calendar, does not double-book, and the confirmation page shows add-to-calendar links (Google, .ics, Outlook).
6. Pages match the prototype at 1440px and 390px with no horizontal scroll.

## 10. Build phases

0. **Foundations:**
   - Scaffold Next.js, tokens, fonts, layout shell (header and footer)
   - Ajv validation and generated types
   - The schemas from §5 and their seed content
   - CI: typecheck, lint, tests, content validation, axe
1. **Content pages:** Home, Our Approach, What to Expect, Featured In, specialty template, text pages.
2. **Clinicians:** profile template, `/clinicians` behavior, and availability read path (Google Calendar freebusy) with a mock adapter for local dev.
3. **Booking:**
   - The 3-step flow and booking API (create event, conflict re-check, rate limiting, spam protection)
   - Confirmation page and .ics download
4. **Blog:** index with filters and paging, post template, related posts.
5. **Launch:**
   - Redirects, sitemap, structured data, analytics and consent
   - Server-side ads conversion
   - Lighthouse pass, real photos and copy, DNS cut-over
