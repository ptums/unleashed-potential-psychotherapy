"""Validate page schemas against JSON Schema 2020-12 and the CMS export rules."""
import json, sys, re, jsonschema

ALLOWED = {'$schema', 'type', 'enum', 'const', 'required', 'properties', 'additionalProperties',
           'unevaluatedProperties', '$ref', '$defs', 'allOf', 'oneOf', 'anyOf', 'items', 'prefixItems',
           'minItems', 'maxItems', 'minLength', 'maxLength', 'minimum', 'maximum', 'pattern', 'format',
           'default', 'title', 'description', 'readOnly', 'contentMediaType', 'examples', 'x-cms', 'x-ui'}
FORMATS = {'uri', 'email', 'date-time', 'date', 'uuid'}
TYPES = {'string', 'number', 'integer', 'boolean', 'array', 'object', 'null'}
WIDGETS = {'textarea', 'markdown', 'image', 'referenceList'}
CMS_OWNED = {'id', 'status', 'internalTitle', 'slug', 'createdAt', 'updatedAt', 'publishedAt'}
ok = True
for path in sys.argv[1:]:
    s = json.load(open(path))
    probs = []
    jsonschema.Draft202012Validator.check_schema(s)
    v = jsonschema.Draft202012Validator(s, format_checker=jsonschema.FormatChecker())
    for e in v.iter_errors(s['examples'][0]):
        probs.append(('example', list(e.path), e.message[:160]))

    def walk(n, p):
        if not isinstance(n, dict):
            return
        for k in n:
            if k not in ALLOWED:
                probs.append((p, 'keyword', k))
        t = n.get('type')
        ts = t if isinstance(t, list) else [t] if t else []
        for x in ts:
            if x not in TYPES: probs.append((p, 'type', x))
        if isinstance(t, list) and 'null' not in t: probs.append((p, 'type list without null'))
        if 'object' in ts and n.get('additionalProperties') is not False:
            probs.append((p, 'object without additionalProperties false'))
        if 'additionalProperties' in n and n['additionalProperties'] is not False:
            probs.append((p, 'additionalProperties as schema'))
        if 'format' in n and n['format'] not in FORMATS: probs.append((p, 'format', n['format']))
        if '$ref' in n and not re.fullmatch(r'#/\$defs/[A-Za-z0-9]+', n['$ref']): probs.append((p, 'ref', n['$ref']))
        if 'allOf' in n and 'object' not in ts: probs.append((p, 'allOf on non-object'))
        if 'x-ui' in n and n['x-ui'].get('widget') not in WIDGETS: probs.append((p, 'widget', n['x-ui']))
        for k in ('properties', '$defs'):
            for kk, vv in n.get(k, {}).items():
                walk(vv, f'{p}/{k}/{kk}')
        if isinstance(n.get('items'), dict): walk(n['items'], p + '/items')
        for k in ('oneOf', 'anyOf', 'allOf', 'prefixItems'):
            for i, vv in enumerate(n.get(k, [])): walk(vv, f'{p}/{k}/{i}')
    walk(s, '#')

    # recursion: a $def must not reach itself
    def refs(n, acc):
        if isinstance(n, dict):
            if '$ref' in n: acc.add(n['$ref'].split('/')[-1])
            for vv in n.values(): refs(vv, acc)
        elif isinstance(n, list):
            for vv in n: refs(vv, acc)
        return acc
    graph = {k: refs(vv, set()) for k, vv in s.get('$defs', {}).items()}
    def reach(a, seen):
        for b in graph.get(a, ()):
            if b == a or (b not in seen and (seen.add(b) or reach(b, seen))): return True
        return False
    for k in graph:
        if reach(k, set()): probs.append(('recursive ref', k))

    # zones
    props = s['properties']
    zones = s['x-cms']['zones']
    if zones != [('meta' if k == 'seo' else k) for k in props] or zones[-1] != 'meta':
        probs.append(('zones order', zones))
    if s['x-cms'].get('kind') not in ('singleton', 'collection'): probs.append(('kind',))
    if set(props) & CMS_OWNED: probs.append(('cms-owned fields', set(props) & CMS_OWNED))
    first = next(iter(props))
    h1s = 0
    for k, z in props.items():
        exp = 'meta' if k == 'seo' else k
        if z.get('x-cms') != {'zone': exp, 'order': 1}: probs.append((k, 'zone x-cms'))
        if z.get('type') != 'object': probs.append((k, 'zone not object'))
        has_hidden = 'hidden' in z['properties']
        if k not in (first, 'seo') and z['properties'].get('hidden') != {'type': 'boolean', 'default': False}:
            probs.append((k, 'missing hidden'))
        if k == first and has_hidden: probs.append((k, 'hero has hidden'))
        if set(z['properties']) & CMS_OWNED: probs.append((k, 'cms-owned field'))
        for fk, fv in z['properties'].items():
            if 'only H1' in fv.get('description', ''):
                h1s += 1
                if fk not in z.get('required', []) or fv.get('minLength') != 1: probs.append((k, fk, 'H1 not required/minLength 1'))
    if h1s != 1: probs.append(('H1 count', h1s))
    seo = props.get('seo', {})
    if set(seo.get('properties', {})) != {'title', 'description', 'ogImage', 'noindex'}: probs.append(('seo fields',))
    if seo['properties']['title'].get('maxLength') != 60 or seo['properties']['description'].get('maxLength') != 160 \
            or seo['properties']['noindex'].get('default') is not False: probs.append(('seo limits',))
    print(path.split('/')[-1], 'OK' if not probs else probs)
    ok = ok and not probs
sys.exit(0 if ok else 1)
