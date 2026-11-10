# Page schema rules

Every content type in `schemas/` follows these rules. Use them for any new schema (site settings, media appearances, text pages, and future page types). `scripts/check_schemas.py` enforces them. Run it with `python3 scripts/check_schemas.py schemas/*.json`, or port it to an Ajv-based test.

## Format

- One JSON Schema 2020-12 file per page type, named `[page-id].json` (lowercase, hyphens).
- `"additionalProperties": false` on every object.
- Shared shapes go in `$defs` and are referenced with local `$ref` only (`#/$defs/name`). No external refs and no recursive refs.
- Allowed keywords only:
  - `type`: string, number, integer, boolean, array, object, or a type list that includes `"null"`
  - `enum`, `const`, `required`, `properties`, `additionalProperties: false`, `unevaluatedProperties: false`
  - `$ref`, `$defs`, `allOf` (objects only), `oneOf`, `anyOf`
  - `items`, `prefixItems`, `minItems`, `maxItems`
  - `minLength`, `maxLength`, `minimum`, `maximum`, `pattern`, `format`
  - `default`, `title`, `description`, `readOnly`, `contentMediaType`, `examples`, `x-cms`, `x-ui`
- Not allowed: `if`/`then`/`else`, `not`, `patternProperties`, `dependentSchemas`, `additionalProperties` as a schema.
- Allowed formats: `uri`, `email`, `date-time`, `date`, `uuid`.

## Zones, not sections

- The template fixes the page layout. There is no reorderable `sections` array, block list or `oneOf` of block types.
- Each top-level property is one zone: an object holding that block's fields, with `"x-cms": { "zone": "<property name>", "order": 1 }`.
- Every zone except the first (hero) has `"hidden": { "type": "boolean", "default": false }`.
- Lists inside a zone (steps, FAQ items, tiles) are arrays with `minItems` and `maxItems`.
- Top-level `seo` object with `"x-cms": { "zone": "meta", "order": 1 }`. Its fields are `title` (max 60), `description` (max 160), `ogImage` (image) and `noindex` (boolean, default false).

## Page-level x-cms

```json
"x-cms": { "kind": "singleton", "route": "/[route]", "template": "[TemplateName]", "zones": ["…zones in render order…", "meta"] }
```

Use `"kind": "collection"` for page types with many entries (clinician profile, specialty, blog post). The route uses `{slug}`; the CMS owns the slug.

## Owned by the CMS (never in a schema)

`id`, `status`, `internalTitle`, `slug`, `createdAt`, `updatedAt`, `publishedAt`, and any workflow state.

## Shared shapes (copy exactly)

- **reference:** `{ collection: enum ["pages", "clinicians", "specialties", "mediaAppearances", "blogPosts"], id: string }`. Extend the enum when a new collection is added, and update every schema at the same time.
- **link:** `{ label: string 1–40, target: oneOf [ { internal: reference, anchor?: string }, { url: string, format uri } ] }`
- **image:** `{ assetId: string, alt: string 5–160 ("Required for WCAG."), focalPoint?: { x: number 0–1, y: number 0–1 } }` with `"x-ui": { "widget": "image" }`

## x-ui widgets

- `"textarea"` with `"rows"`
- `"markdown"` with `"toolbar"`
- `"image"`
- `"referenceList"` with `"collection"` and `"sortable"`

## Content rules

- Put a `default` on fixed labels (eyebrows, button text).
- Give fields a short `description` when an editor needs a hint.
- Exactly one H1 per page. That field is required with `minLength: 1`, and its description contains "The page's only H1."
- One entry in `examples` with the real page content, in the same zone shape. Unknown content goes in `[brackets]`. The same example is copied to `content/` as seed data.
