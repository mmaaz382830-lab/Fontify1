import re, sys

# Map each dark shade -> light-mode shade, per utility type.
MAPS = {
    'bg':      {'950':'white','900':'100','800':'200','700':'300','600':'400'},
    'text':    {'50':'900','100':'900','200':'800','300':'700','400':'500','600':'400'},
    'border':  {'950':'200','900':'200','800':'200','700':'300'},
    'ring':    {'800':'200','700':'300','600':'400'},
    'from':    {'950':'white','900':'100','800':'200'},
    'to':      {'950':'white','900':'100'},
    'via':     {'900':'100'},
    'accent':  {'100':'900'},
}

# type alternation longest-first; note placeholder:text handled via prefix capture
TYPES = '|'.join(['bg','text','border','ring','from','to','via','accent'])
PAT = re.compile(r'((?:[a-z][a-z0-9.\[\]-]*:)*)(' + TYPES + r')-neutral-(\d{2,3})(/\d{1,3})?')

def repl(m):
    prefix, typ, shade, suffix = m.group(1), m.group(2), m.group(3), m.group(4) or ''
    table = MAPS.get(typ, {})
    if shade not in table:
        return m.group(0)  # leave untouched
    light = table[shade]
    if light == 'white':
        light_cls = f'{prefix}{typ}-white{suffix}'
    else:
        light_cls = f'{prefix}{typ}-neutral-{light}{suffix}'
    dark_cls = f'dark:{prefix}{typ}-neutral-{shade}{suffix}'
    return f'{light_cls} {dark_cls}'

for path in sys.argv[1:]:
    s = open(path).read()
    out = PAT.sub(repl, s)
    open(path, 'w').write(out)
    print('themed', path)
