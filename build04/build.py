#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build scribe0.4.html from Scribe0.1.html + v0.4 modules."""
import re, json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import data as DATA, mcqs as MCQS, css_tokens, css_book

SRC = '/workspace/Scribe0.1.html'
OUT = '/workspace/scribe0.4.html'
HERE = os.path.dirname(os.path.abspath(__file__))

src = open(SRC, encoding='utf-8').read()

# ---- book content extraction ----
# Take everything from the title page down to the colophon rule at the end of ch8,
# then wrap in a .container div so the original stylesheet rules still apply.
m1 = re.search(r'<div class="container">', src)
assert m1, 'container div not found in source'
body = src[m1.end():]
end_tag = '</div><!-- /.container -->'
i_end = body.find(end_tag)
assert i_end != -1, 'container close marker not found'
body = body[:i_end]
# trim trailing colophon: last <hr class="sep"> + following copyright paragraph
cut = body.rfind('<hr class="sep">')
if cut != -1:
    body = body[:cut]
book = '<div class="container">\n' + body.rstrip() + '\n</div>'

# ---- normalize structure for app.js: wrap each chapter in <div class="chapter" id="chX"> ----
# (source uses flat <h2 class="chapter" id="chX"> siblings; app.js expects chapter wrapper divs)
chapter_ids = ['ch1','ch2','ch3','ch4','ch5','ch6a','ch6b','ch7','ch8']
anchors=[]
for cid in chapter_ids:
    m=re.search(r'<h2 class="chapter"[^>]*\bid="%s"'%cid, book)
    assert m, 'missing chapter anchor '+cid
    anchors.append((cid,m.start()))
parts=[]
prev_end=0
for k,(cid,pos) in enumerate(anchors):
    parts.append(book[prev_end:pos])                     # preamble or previous chapter tail
    nxt = anchors[k+1][1] if k+1<len(anchors) else len(book)
    parts.append('<div class="chapter" id="%s">%s</div>'%(cid, book[pos:nxt]))
    prev_end=nxt
parts.append(book[prev_end:])
book=''.join(parts)
print('book fragment chars:', len(book))
labels = {}
sections = []      # (ch, secId, title)
figures = []       # (ch, caption)
quiz_q = {}        # ch -> [{q, opts}]

def strip_tags(h): return re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',h)).strip()

# split by chapter h2s: <h2 class="chapter" id="chX">
spans=[]
for cid in chapter_ids:
    m=re.search(r'<h2 class="chapter"[^>]*\bid="%s"'%cid, book)
    spans.append((cid, m.start() if m else None))
missing=[c for c,p in spans if p is None]
if missing: sys.exit('chapter anchors missing: '+','.join(missing))
spans=[(c,p) for c,p in spans if p is not None]
for k,(cid,pos) in enumerate(spans):
    end = spans[k+1][1] if k+1<len(spans) else len(book)
    frag = book[pos:end]
    mh2=re.search(r'<h2[^>]*>(.*?)</h2>',frag,re.S)
    labels[cid]=strip_tags(mh2.group(1)) if mh2 else cid
    for m in re.finditer(r'<h3 id="(ch[0-9ab]+-[a-z0-9-]*)">(.*?)</h3>',frag,re.S):
        sid=m.group(1)
        # must belong to this chapter prefix
        if not sid.startswith(cid): continue
        sections.append((cid,sid,strip_tags(m.group(2))))
    for m in re.finditer(r'<figcaption>(.*?)</figcaption>',frag,re.S):
        cap=strip_tags(m.group(1))
        if cap and 'placeholder' not in cap.lower(): figures.append((cid,cap[:60]))
    # quiz questions
    mq=re.search(r'id="%s-quiz"[^>]*>(.*?)(?:<div class="quiz"|<hr|$)'%cid,frag,re.S)
    qs=[]
    if mq:
        qz=mq.group(1)
        for li in re.finditer(r'<li>(.*?)(?:<ol class="options">(.*?)</ol>)?\s*</li>',qz,re.S):
            stem=strip_tags(li.group(1))
            opts=[strip_tags(o) for o in re.findall(r'<li>(.*?)</li>',li.group(2) or '',re.S)]
            if stem and opts: qs.append({'q':stem,'opts':opts})
    quiz_q[cid]=qs

print('chapters found:',list(labels))
print('sections:',len(sections),'figures:',len(figures))
for cid in chapter_ids: print(' ',cid,len(quiz_q[cid]),'quiz q')

# ---- validate MCQ keys against extracted options ----
errors=[]
for cid,key in MCQS.MCQS.items():
    qs=quiz_q.get(cid)
    if not qs: errors.append('no quiz extracted for '+cid); continue
    if len(qs)!=len(key): errors.append('count mismatch %s: extracted %d vs keys %d'%(cid,len(qs),len(key)))
    for i,(q,k) in enumerate(zip(qs,key)):
        for a in k['a']:
            if not (0<=a<len(q['opts'])): errors.append('bad answer idx %s q%d'%(cid,i))
sec_ids={s for _,s,_ in sections}
for cid,keys in MCQS.MCQS.items():
    for i,k in enumerate(keys):
        for l in k['links']:
            if l not in sec_ids: errors.append('mcq link missing section %s q%d -> %s'%(cid,i,l))
if errors:
    print('\n'.join(errors)); sys.exit('VALIDATION FAILED')
print('MCQ keys + study links validated ✓')

# ---- merge into book html ----
merged={}
for cid,qs in quiz_q.items():
    if not qs: continue                      # ch8 has no end-of-chapter quiz in the source
    merged[cid]=[dict(q,**k) for q,k in zip(qs,MCQS.MCQS[cid])]

for cid,qs in merged.items():
    pat=re.compile(r'(<div class="quiz" id="%s-quiz">\s*<h3>)(.*?)(</h3>)(.*?)(</ol>\s*</div>)'%cid,re.S)
    m=pat.search(book)
    if not m: print('WARN no quiz div',cid); continue
    lis=[]
    for i,q in enumerate(qs):
        lis.append('<li>%s<ol class="options">%s</ol></li>'%(
            q['q'],''.join('<li>%s</li>'%o for o in q['opts'])))
    new_ol='\n  <ol>%s</ol>\n'%''.join(lis)
    title='End of Chapter Quiz — Chapter %s'%cid.replace('ch','').replace('a','A').replace('b','B')
    book=book[:m.start()]+m.group(1)+title+m.group(3)+new_ol+book[m.end():]

# interactive flag on quiz containers
book=re.sub(r'<div class="quiz" id="(ch[0-9ab]+)-quiz">', r'<div class="quiz" data-ch="\1" id="\1-quiz">', book)

# ---- graph data ----
kg=DATA.build({'labels':labels,'sections':sections,'figures':figures})
app_data={'kg':kg,'glossary':kg['glossary'],'flashcards':kg['flashcards'],
          'mcqs':{cid:[{'q':q['q'],'opts':q['opts'],'a':q['a'],'why':q['why'],'links':q['links']} for q in qs]
                 for cid,qs in merged.items()}}
print('graph nodes:',len(kg['kg']['nodes']),'links:',len(kg['kg']['links']))

# ---- assemble ----
shell=open(os.path.join(HERE,'shell.html'),encoding='utf-8').read()
appjs=open(os.path.join(HERE,'app.js'),encoding='utf-8').read()
css=css_tokens.CSS+'\n'+css_book.CSS

# strip any source <style>/<script> blocks that survived extraction (keep markup only)
for tag in ('style','script'):
    book=re.sub(r'<%s\b.*?</%s>'%(tag,tag), '', book, flags=re.S|re.I)
book=book.replace('</body>','').replace('</html>','').strip()

# inject book content into shell
assert '<div class="paper" id="book-content"></div>' in shell, 'injection anchor missing'
shell=shell.replace('<div class="paper" id="book-content"></div>',
                    '<div class="paper" id="book-content">\n%s\n</div>'%book)
html=(shell.replace('__CSS__',css)
          .replace('__DATA_JSON__',json.dumps(app_data,ensure_ascii=False))
          .replace('__JS__',appjs))
open(OUT,'w',encoding='utf-8').write(html)
print('wrote',OUT,len(html),'bytes')

# ---- checks ----
assert '__APP_DATA__' not in html, 'data JSON injection failed'
assert '__CSS__' not in html and '__JS__' not in html, 'shell placeholders left'
assert html.count('<h2 class="chapter"')==9, 'expected 9 chapter h2s'
assert html.count('class="quiz" data-ch=')==len(merged), 'quiz containers not all flagged'
for cid in MCQS.MCQS:
    assert 'id="%s"'%cid in html, 'missing chapter id '+cid
src_css_left = bool(re.search(r'--quiz-bg:\s*#', html))
print('source stylesheet leaked:', src_css_left)
assert not src_css_left, 'old beige hex styles still present'
hexes=re.findall(r'#[0-9a-fA-F]{3,8}\b(?![0-9a-fA-F])', re.sub(r"data:image/svg\+xml,[^'"]*",'',html))
print('raw hex tokens remaining (excl. svg-data-uris):', len(hexes), set(hexes) if hexes else '')
print('ALL CHECKS PASSED')
