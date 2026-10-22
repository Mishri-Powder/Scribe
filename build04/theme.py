"""v0.4 theme: every color is oklch(); textures keyed to hue."""

# ---- base palette (all oklch) ----
P = {
 # light book tokens
 'book-primary':   'oklch(34.7% 0.073 256.7)',
 'book-accent':    'oklch(51.8% 0.156 29.2)',
 'book-ink':       'oklch(25.2% 0.006 256)',
 'book-ink-soft':  'oklch(45.0% 0.006 256)',
 'book-rule':      'oklch(87.3% 0.013 91.5)',
 'paper':          'oklch(99.3% 0.004 95)',
 'panel':          'oklch(100% 0 0)',
 'table-header':   'oklch(34.7% 0.073 256.7)',
 'table-alt':      'oklch(96.0% 0.008 253.9)',
 'example-bg':     'oklch(95.8% 0.012 91.5)',
 'quiz-bg':        'oklch(97.3% 0.011 89.7)',
 'callout-bg':     'oklch(97.2% 0.023 75.9)',
 # app chrome light
 'app-bg':         'oklch(99.1% 0.005 95)',
 'app-panel':      'oklch(100% 0 0)',
 'app-sidebar':    'oklch(96.4% 0.008 95)',
 'app-text':       'oklch(26.0% 0.008 256)',
 'app-muted':      'oklch(52.0% 0.012 256)',
 'app-accent':     'oklch(46.0% 0.13 256)',
 'app-accent-soft':'oklch(93.5% 0.028 250)',
 'app-border':     'oklch(88.0% 0.010 95)',
 # dark equivalents
 'd-app-bg':       'oklch(20.3% 0.012 250)',
 'd-app-panel':    'oklch(24.5% 0.015 250)',
 'd-app-sidebar':  'oklch(22.0% 0.012 250)',
 'd-app-text':     'oklch(90.9% 0.011 243.7)',
 'd-app-muted':    'oklch(67.0% 0.023 246)',
 'd-app-accent':   'oklch(70.5% 0.14 250)',
 'd-app-accent-soft':'oklch(34.2% 0.071 251.8)',
 'd-app-border':   'oklch(32.0% 0.017 244.7)',
 'd-book-primary': 'oklch(78.0% 0.06 250)',
 'd-book-accent':  'oklch(75.0% 0.14 35)',
 'd-table-header': 'oklch(38.0% 0.06 255)',
 'd-table-alt':    'oklch(26.5% 0.013 250)',
 'd-example-bg':   'oklch(28.0% 0.015 95)',
 'd-quiz-bg':      'oklch(27.0% 0.014 90)',
 'd-callout-bg':   'oklch(30.0% 0.03 75)',
}

HL = {  # highlight inks: paper tint + texture pattern + solid stripe
 'yellow': {'hue':91,  'ink':'oklch(55% 0.13 95)',  'soft':'oklch(93% 0.07 95)',  'dark':'oklch(42% 0.09 95)',  'dsoft':'oklch(30% 0.05 95)'},
 'green':  {'hue':152, 'ink':'oklch(50% 0.13 152)', 'soft':'oklch(93% 0.06 152)', 'dark':'oklch(40% 0.09 152)', 'dsoft':'oklch(29% 0.05 152)'},
 'blue':   {'hue':250, 'ink':'oklch(52% 0.13 255)', 'soft':'oklch(93% 0.055 255)','dark':'oklch(40% 0.09 255)', 'dsoft':'oklch(29% 0.05 255)'},
 'pink':   {'hue':10,  'ink':'oklch(55% 0.16 10)',  'soft':'oklch(93% 0.05 10)',  'dark':'oklch(42% 0.10 10)',  'dsoft':'oklch(30% 0.05 10)'},
}

KG = {  # node types: hue + shape + texture
 'role':      {'hue':315,'shape':'circle'},
 'rule':      {'hue':27, 'shape':'hex'},
 'concept':   {'hue':250,'shape':'circle'},
 'section':   {'hue':175,'shape':'rect'},
 'objective': {'hue':55, 'shape':'rect'},
 'billing':   {'hue':91, 'shape':'diamond'},
 'setting':   {'hue':152,'shape':'hex'},
 'encounter': {'hue':220,'shape':'diamond'},
 'condition': {'hue':355,'shape':'circle'},
 'chapter':   {'hue':256,'shape':'ring'},
}

def tex_pattern(pid, kind, ink, alpha_ink=None):
    """SVG <pattern> for node textures — dots/stripes/cross/grid/rings."""
    a = alpha_ink or ink
    tile = {'dots':'<circle cx="3" cy="3" r="1.15" fill="{a}"/>',
            'stripes':'<path d="M-2,6 l8,-8 M0,10 l10,-10 M6,12 l6,-6" stroke="{a}" stroke-width="1.6"/>',
            'cross':'<path d="M0,0 l6,6 M6,0 l-6,6" stroke="{a}" stroke-width="1.1"/>',
            'grid':'<path d="M0,3 h6 M3,0 v6" stroke="{a}" stroke-width="1"/>',
            'rings':'<circle cx="3" cy="3" r="2.2" fill="none" stroke="{a}" stroke-width="0.9"/>'}[kind]
    return ('<pattern id="%s" width="6" height="6" patternUnits="userSpaceOnUse">'
            '<rect width="6" height="6" fill="%s"/>%s</pattern>') % (pid, ink, a.join(tile.split('{a}')))

NODE_TEX = {'circle':'dots','hex':'stripes','rect':'grid','diamond':'cross','ring':'rings'}

def node_fill(t):
    return 'url(#tex-%s)' % t

def build_css():
    c = P; H = HL
    css = []
    css.append("""
/* ===== v0.4 design tokens — all colors oklch() ===== */
:root{
  --primary:%(book-primary)s; --accent:%(book-accent)s; --bg:%(paper)s; --rule:%(book-rule)s;
  --table-header:%(table-header)s; --table-alt:%(table-alt)s; --example-bg:%(example-bg)s;
  --quiz-bg:%(quiz-bg)s; --callout-bg:%(callout-bg)s; --ink:%(book-ink)s; --ink-soft:%(book-ink-soft)s;
  --app-bg:%(app-bg)s; --app-panel:%(app-panel)s; --app-sidebar:%(app-sidebar)s; --app-text:%(app-text)s;
  --app-muted:%(app-muted)s; --app-accent:%(app-accent)s; --app-accent-soft:%(app-accent-soft)s;
  --app-border:%(app-border)s; --topbar-h:56px; --shadow:0 8px 28px oklch(0%% 0 0/.14);
  --hl-yellow-ink:%(yellow.ink)s; --hl-yellow-soft:%(yellow.soft)s;
  --hl-green-ink:%(green.ink)s;   --hl-green-soft:%(green.soft)s;
  --hl-blue-ink:%(blue.ink)s;     --hl-blue-soft:%(blue.soft)s;
  --hl-pink-ink:%(pink.ink)s;     --hl-pink-soft:%(pink.soft)s;
  --ok:%(ok)s; --ok-soft:%(ok-soft)s; --warn:%(warn)s; --warn-soft:%(warn-soft)s;
  --font-scale:1; --line-gap:1.75; --track:0em;
}
"""[1:] % {'book-primary':c['book-primary'],'book-accent':c['book-accent'],'paper':c['paper'],
 'book-rule':c['book-rule'],'table-header':c['table-header'],'table-alt':c['table-alt'],'example-bg':c['example-bg'],
 'quiz-bg':c['quiz-bg'],'callout-bg':c['callout-bg'],'book-ink':c['book-ink'],'book-ink-soft':c['book-ink-soft'],
 'app-bg':c['app-bg'],'app-panel':c['app-panel'],'app-sidebar':c['app-sidebar'],'app-text':c['app-text'],
 'app-muted':c['app-muted'],'app-accent':c['app-accent'],'app-accent-soft':c['app-accent-soft'],'app-border':c['app-border'],
 'yellow.ink':H['yellow']['ink'],'yellow.soft':H['yellow']['soft'],'green.ink':H['green']['ink'],'green.soft':H['green']['soft'],
 'blue.ink':H['blue']['ink'],'blue.soft':H['blue']['soft'],'pink.ink':H['pink']['ink'],'pink.soft':H['pink']['soft'],
 'ok':'oklch(55% 0.14 152)','ok-soft':'oklch(95% 0.045 152)','warn':'oklch(62% 0.14 85)','warn-soft':'oklch(95% 0.05 95)'})

    css.append('[data-theme="dark"]{--primary:%s;--accent:%s;--bg:%s;--rule:%s;--table-header:%s;--table-alt:%s;'
      '--example-bg:%s;--quiz-bg:%s;--callout-bg:%s;--ink:%s;--ink-soft:%s;'
      '--app-bg:%s;--app-panel:%s;--app-sidebar:%s;--app-text:%s;--app-muted:%s;--app-accent:%s;--app-accent-soft:%s;--app-border:%s;'
      '--shadow:0 8px 28px oklch(0%% 0 0/.55);'
      '--hl-yellow-ink:%s;--hl-yellow-soft:%s;--hl-green-ink:%s;--hl-green-soft:%s;--hl-blue-ink:%s;--hl-blue-soft:%s;--hl-pink-ink:%s;--hl-pink-soft:%s;'
      '--ok:%s;--ok-soft:%s;--warn:%s;--warn-soft:%s}' % (
      c['d-book-primary'],c['d-book-accent'],c['d-app-bg'],c['d-app-border'],c['d-table-header'],c['d-table-alt'],
      c['d-example-bg'],c['d-quiz-bg'],c['d-callout-bg'],'oklch(90.9% 0.011 243.7)','oklch(74% 0.015 246)',
      c['d-app-bg'],c['d-app-panel'],c['d-app-sidebar'],c['d-app-text'],c['d-app-muted'],c['d-app-accent'],c['d-app-accent-soft'],c['d-app-border'],
      H['yellow']['dark'],H['yellow']['dsoft'],H['green']['dark'],H['green']['dsoft'],H['blue']['dark'],H['blue']['dsoft'],H['pink']['dark'],H['pink']['dsoft'],
      'oklch(72% 0.13 152)','oklch(30% 0.06 152)','oklch(80% 0.13 91)','oklch(30% 0.06 91)'))
    return '\n'.join(css)
