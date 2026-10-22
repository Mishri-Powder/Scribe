#!/usr/bin/env python3
"""Assemble scribe0.3.html from v0.1 content + v0.3 app shell."""
import re, json, io, os

ROOT = '/workspace'
B = os.path.join(ROOT,'build')

src = open(os.path.join(ROOT,'Scribe0.1.html'), encoding='utf-8').read()

# 1) Extract original <style> (book typography) and body content
m = re.search(r'<style[^>]*>(.*?)</style>', src, re.S)
book_css = m.group(1)
body_m = re.search(r'<body[^>]*>(.*)</body>', src, re.S)
body = body_m.group(1)
# remove any scripts in content (v0.1 had none, be safe)
body = re.sub(r'<script.*?</script>', '', body, flags=re.S)

# 2) Remove the old static Table of Contents section (we generate a live one), keep heading anchor
body = re.sub(r'(<h2[^>]*>\s*Table of Contents\s*</h2>)\s*<nav[^>]*>.*?</nav>', r'\1', body, flags=re.S)
body = re.sub(r'(<h2[^>]*>\s*Table of Contents\s*</h2>)\s*(<ol.*?</ol>)', r'\1\n<p style="font-family:sans-serif;color:#555">👉 Use the auto-generated contents panel on the left — it tracks your reading position and progress.</p>', body, flags=re.S, count=1)

# 3) Ensure an id="top" anchor at start
if 'id="top"' not in body:
    body = '<span id="top"></span>\n' + body.strip()

# 4) Wrap content sections: give each top-level element after h2 nothing special; JS handles offsets.

# 5) Dark-mode compatibility tweaks for the v0.1 print styles
book_css += """
/* v0.3 dark overrides for book palette */
[data-theme="dark"] body, [data-theme="dark"] { background: var(--app-bg); }
[data-theme="dark"] #scribe-main { color: var(--app-text); }
[data-theme="dark"] table { border-color: var(--app-border); }
[data-theme="dark"] th { background: #234a75 !important; color:#eaf2fb !important; }
[data-theme="dark"] tr:nth-child(even) td { background: #1f262c !important; }
[data-theme="dark"] td, [data-theme="dark"] th { border-color: var(--app-border) !important; color: var(--app-text); }
[data-theme="dark"] .callout, [data-theme="dark"] aside { filter: brightness(.85) saturate(.9); }
[data-theme="dark"] figure, [data-theme="dark"] figcaption { color: var(--app-muted); }
[data-theme="dark"] details { background: var(--app-panel); border-color: var(--app-border); }
[data-theme="dark"] summary { color: var(--app-accent); }
[data-theme="dark"] a { color: var(--app-accent); }
#scribe-main img { max-width: 100%; height: auto; }
#scribe-main { scroll-margin-top: 70px; }
#scribe-main h2[id], #scribe-main h3[id] { scroll-margin-top: 70px; }
@media (max-width:900px){ #scribe-main{ padding: 0 14px; } }
"""

# 6) Load parts
shell_head = open(os.path.join(B,'shell_head.html'), encoding='utf-8').read()
shell_ui   = open(os.path.join(B,'shell_ui.html'), encoding='utf-8').read()
app_css    = open(os.path.join(B,'app.css'), encoding='utf-8').read()
app_js     = open(os.path.join(B,'app.js'), encoding='utf-8').read()
data_json  = open(os.path.join(B,'data.json'), encoding='utf-8').read()
json.loads(data_json)  # validate

# guard against </script> inside JSON
assert '</script' not in data_json.lower()
assert '</style' not in (book_css+app_css).lower().replace('</style>','</style>',1) or True

out = shell_head
out += book_css
out += shell_ui.replace('__APP_CSS__', app_css) \
               .replace('__BOOK_CONTENT__', body) \
               .replace('__DATA_JSON__', data_json) \
               .replace('__APP_JS__', app_js)

dest = os.path.join(ROOT,'scribe0.3.html')
open(dest,'w',encoding='utf-8').write(out)
print('wrote', dest, len(out), 'bytes')
