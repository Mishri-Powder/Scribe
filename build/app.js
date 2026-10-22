/* ================= Scribe v0.3 App ================= */
(function(){
"use strict";
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const LS = {
  get(k,d){ try{ const v=localStorage.getItem('scribe.'+k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem('scribe.'+k, JSON.stringify(v)); }catch(e){} }
};
function toast(msg){ const t=$('#scribe-toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),2200); }
const DATA = JSON.parse($('#scribe-data').textContent);

/* ---------- Theme & font size ---------- */
function applyTheme(th){ document.documentElement.setAttribute('data-theme',th); LS.set('theme',th); const b=$('#btn-theme'); if(b) b.textContent = th==='dark'?'☀️ Light':'🌙 Dark'; }
applyTheme(LS.get('theme','light'));
$('#btn-theme').onclick = ()=> applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');
const FONTS=[15,16.5,18,19.5,21];
function applyFont(i){ i=Math.max(0,Math.min(FONTS.length-1,i)); LS.set('fontIdx',i); const main=$('#scribe-main'); if(main) main.style.fontSize=FONTS[i]+'px'; }
applyFont(LS.get('fontIdx',1));
$('#btn-font-inc').onclick=()=>applyFont((LS.get('fontIdx',1))+1);
$('#btn-font-dec').onclick=()=>applyFont((LS.get('fontIdx',1))-1);

/* ---------- Sidebar toggle ---------- */
const isMobile=()=>matchMedia('(max-width:900px)').matches;
$('#btn-sidebar').onclick=()=>{
  if(isMobile()){ document.body.classList.toggle('sb-open-m'); }
  else { document.body.classList.toggle('sb-hidden'); LS.set('sbHidden',document.body.classList.contains('sb-hidden')); }
};
if(LS.get('sbHidden',false) && !isMobile()) document.body.classList.add('sb-hidden');
$('#btn-notes').onclick=()=>{ renderNotes(); $('#dlg-notes').showModal(); };

/* ---------- TOC (generated from headings) ---------- */
const chapters = []; // {id,label,el}
function buildTOC(){
  const toc = $('#toc'); toc.innerHTML='';
  const heads = $$('#scribe-main h2[id], #scribe-main h3[id]');
  heads.forEach(h=>{
    const a=document.createElement('a');
    a.href='#'+h.id; a.textContent=h.textContent.trim();
    a.className = h.tagName==='H2' ? 'lvl2':'lvl3';
    a.dataset.target=h.id;
    toc.appendChild(a);
    if(h.tagName==='H2') chapters.push({id:h.id,label:h.textContent.trim(),el:h});
  });
  toc.addEventListener('click',()=>{ if(isMobile()) document.body.classList.remove('sb-open-m'); });
}

/* ---------- Reading progress + active heading ---------- */
function setupScroll(){
  const bar=$('#reading-progress');
  let ticking=false;
  function upd(){
    const doc=document.documentElement;
    const max=doc.scrollHeight-doc.clientHeight;
    bar.style.width=(max>0?(doc.scrollTop/max*100):0)+'%';
    ticking=false;
  }
  addEventListener('scroll',()=>{ if(!ticking){requestAnimationFrame(upd);ticking=true;} },{passive:true});
  upd();
  const links=$$('#toc a');
  const map={}; links.forEach(l=>map[l.dataset.target]=l);
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        const a=map[en.target.id]; if(a){ a.classList.add('active'); a.scrollIntoView({block:'nearest'}); }
      }
    });
  },{rootMargin:'-15% 0px -75% 0px'});
  $$('#scribe-main h2[id], #scribe-main h3[id]').forEach(h=>io.observe(h));
}

/* ---------- Chapter pager ---------- */
function buildPager(){
  const p=$('#chapter-pager'); if(!chapters.length) return;
  const cur = currentChapter();
  const i = chapters.findIndex(c=>c.id===cur);
  p.innerHTML='';
  if(i>0){ const a=document.createElement('a'); a.href='#'+chapters[i-1].id; a.textContent='← '+chapters[i-1].label; p.appendChild(a);} else p.appendChild(document.createElement('span'));
  if(i>=0&&i<chapters.length-1){ const a=document.createElement('a'); a.href='#'+chapters[i+1].id; a.textContent=chapters[i+1].label+' →'; p.appendChild(a);} else p.appendChild(document.createElement('span'));
}
function currentChapter(){
  const y=scrollY+120; let cur=chapters[0]?chapters[0].id:null;
  for(const c of chapters){ if(c.el.offsetTop<=y) cur=c.id; else break; }
  return cur;
}
addEventListener('hashchange',buildPager);

/* ---------- Search (inverted index built in idle time) ---------- */
const searchIndex = new Map(); // token -> Set(sectionId)
const sectionsMeta = new Map(); // id -> {title, crumb, el}
function buildSearchIndex(){
  const root=$('#scribe-main');
  const blocks = Array.from(root.querySelectorAll('h2[id], h3[id]'));
  const all = Array.from(root.querySelectorAll('*'));
  blocks.forEach((h,idx)=>{
    const next = blocks[idx+1];
    let text='';
    const start = all.indexOf(h);
    for(let i=start;i<all.length;i++){
      const e=all[i];
      if(next && (e===next || e.contains(next))) break;
      if(/^(P|LI|TD|TH|DD|DT|CAPTION|BLOCKQUOTE)$/.test(e.tagName)){
        if(e.querySelector('p,li,td')) continue;
        text += ' ' + e.textContent;
      }
    }
    const secId=h.id;
    let crumb=h.textContent.trim();
    let ch=null; for(const c of chapters){ if(c.el.offsetTop<=h.offsetTop) ch=c; }
    if(ch && ch.id!==secId) crumb = ch.label + ' › ' + crumb;
    sectionsMeta.set(secId,{title:h.textContent,crumb,el:h});
    const toks = text.toLowerCase().replace(/[^\w\s/-]/g,' ').split(/\s+/).filter(w=>w.length>2);
    new Set(toks).forEach(t=>{ if(!searchIndex.has(t)) searchIndex.set(t,new Set()); searchIndex.get(t).add(secId); });
  });
}
let searchDebounce;
$('#search-input').addEventListener('input',e=>{
  clearTimeout(searchDebounce);
  searchDebounce=setTimeout(()=>doSearch(e.target.value.trim()),160);
});
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function doSearch(q){
  const box=$('#search-results');
  if(q.length<2){ box.classList.remove('open'); box.innerHTML=''; return; }
  const terms=q.toLowerCase().split(/\s+/);
  let sets=null;
  for(const t of terms){
    const cand=new Set();
    searchIndex.forEach((ids,tok)=>{ if(tok.startsWith(t)) ids.forEach(i=>cand.add(i)); });
    sets = sets ? new Set([...sets].filter(x=>cand.has(x))) : cand;
    if(!sets.size) break;
  }
  const results=[...(sets||[])].slice(0,12);
  box.innerHTML = results.length? '' : '<div class="sr-item"><div class="sr-snip">No matches.</div></div>';
  results.forEach(id=>{
    const meta=sectionsMeta.get(id); if(!meta) return;
    const div=document.createElement('div'); div.className='sr-item';
    let snip='';
    const re=new RegExp('('+terms.map(escRe).join('|')+')[\\w/-]*','i');
    let txt='';
    let n=meta.el.nextElementSibling;
    while(n && !/^H[1-3]$/.test(n.tagName)){ txt+=' '+n.textContent; if(txt.length>400)break; n=n.nextElementSibling; }
    const m=txt.match(re);
    if(m){ const s=Math.max(0,m.index-60); snip=(s>0?'…':'')+txt.slice(s,s+180)+'…'; }
    else snip=txt.slice(0,150)+'…';
    snip=snip.replace(new RegExp('('+terms.map(escRe).join('|')+')[\\w/-]*','gi'),'<mark>$&</mark>');
    div.innerHTML='<div class="sr-crumb"></div><div class="sr-snip">'+snip+'</div>';
    div.querySelector('.sr-crumb').textContent=meta.crumb;
    div.onclick=()=>{ location.hash='#'+id; box.classList.remove('open'); };
    box.appendChild(div);
  });
  box.classList.add('open');
}
document.addEventListener('click',e=>{ if(!e.target.closest('#scribe-search-wrap')) $('#search-results').classList.remove('open'); });

/* ---------- Highlights & notes (localStorage) ---------- */
function getHL(){ return LS.get('highlights',[]); }
function setHL(a){ LS.set('highlights',a); }
function sectionOf(node){
  let el=node.nodeType===3?node.parentNode:node;
  let best=null;
  $$('#scribe-main h2[id], #scribe-main h3[id]').forEach(h=>{ if(h.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING) best=h; });
  return best?best.id:(chapters[0]&&chapters[0].id)||'top';
}
function restoreHighlights(){
  getHL().forEach(hl=>{
    const anchor=document.getElementById(hl.sec); if(!anchor) return;
    const scope=anchor.parentNode||document;
    const walker=document.createTreeWalker(scope, NodeFilter.SHOW_TEXT,{acceptNode(n){
      if(!n.parentElement) return NodeFilter.FILTER_REJECT;
      if(n.parentElement.closest('mark.scribe-hl')) return NodeFilter.FILTER_REJECT;
      if(['SCRIPT','STYLE','DIALOG'].includes(n.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
      if(anchor.compareDocumentPosition(n.parentElement)&Node.DOCUMENT_POSITION_PRECEDING) return NodeFilter.FILTER_SKIP;
      return n.nodeValue.includes(hl.text)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;
    }});
    const first=walker.nextNode();
    if(first){
      const idx=first.nodeValue.indexOf(hl.text);
      const range=document.createRange();
      range.setStart(first,idx); range.setEnd(first,idx+hl.text.length);
      const mk=document.createElement('mark'); mk.className='scribe-hl'; mk.dataset.hlid=hl.id; mk.dataset.color=hl.color;
      try{ range.surroundContents(mk);}catch(e){}
    }
  });
}
const hlBar=$('#hl-toolbar');
let pendingRange=null;
document.addEventListener('mouseup',e=>{
  if(e.target.closest('#hl-toolbar')) return;
  setTimeout(()=>{
    const sel=getSelection();
    if(!sel || sel.isCollapsed || sel.toString().trim().length<3){ return; }
    let range; try{ range=sel.getRangeAt(0);}catch(err){ return; }
    if(!$('#scribe-main').contains(range.commonAncestorContainer)) return;
    pendingRange=range.cloneRange();
    const rect=range.getBoundingClientRect();
    hlBar.style.left=Math.max(8,rect.left+scrollX+rect.width/2-110)+'px';
    hlBar.style.top=Math.max(60,rect.top+scrollY-48)+'px';
    hlBar.classList.add('show');
  },10);
});
hlBar.addEventListener('mousedown',e=>e.preventDefault());
hlBar.querySelectorAll('[data-color]').forEach(btn=>{
  btn.onclick=()=>{
    if(!pendingRange) return;
    const color=btn.dataset.color;
    const text=pendingRange.toString().trim().slice(0,400);
    const sec=sectionOf(pendingRange.startContainer);
    const id='h'+Date.now()+Math.floor(Math.random()*999);
    const mk=document.createElement('mark'); mk.className='scribe-hl'; mk.dataset.hlid=id; mk.dataset.color=color;
    let ok=false;
    try{ pendingRange.surroundContents(mk); ok=true; }catch(e){ toast('Keep the selection inside one paragraph'); }
    if(ok){
      const arr=getHL(); arr.push({id,text,color,sec,ts:Date.now(),note:''}); setHL(arr);
      toast('Highlighted ✓ — click it later to add a note');
    }
    hlBar.classList.remove('show'); getSelection().removeAllRanges(); pendingRange=null;
  };
});
document.addEventListener('click',e=>{
  const mk=e.target.closest('mark.scribe-hl'); if(!mk) return;
  const arr=getHL(); const rec=arr.find(h=>h.id===mk.dataset.hlid); if(!rec) return;
  const note=prompt('Note on this highlight:\n\n"'+rec.text.slice(0,90)+'"',rec.note||'');
  if(note===null) return;
  rec.note=note.trim(); setHL(arr); toast(rec.note?'Note saved':'Note cleared'); renderNotes();
});

/* ---------- Notes dialog ---------- */
function renderNotes(){
  const list=$('#notes-list'); const arr=getHL().slice().sort((a,b)=>b.ts-a.ts);
  list.innerHTML = arr.length? '' : '<p style="color:var(--app-muted)">No highlights yet. Select any text in the book and pick a color.</p>';
  arr.forEach(hl=>{
    const meta=sectionsMeta.get(hl.sec);
    const div=document.createElement('div'); div.className='note-item';
    div.innerHTML='<div class="n-quote"></div><div class="n-note"></div>'+
      '<div class="n-meta"><span class="n-where"></span><span><a class="goto">Go to</a> <button class="del">Delete</button></span></div>';
    div.querySelector('.n-quote').textContent=hl.text;
    div.querySelector('.n-note').textContent=hl.note?('📝 '+hl.note):'';
    div.querySelector('.n-where').textContent=(meta?meta.crumb:'')+' · '+new Date(hl.ts).toLocaleDateString();
    div.querySelector('.goto').onclick=()=>{ location.hash='#'+hl.sec; $('#dlg-notes').close();
      setTimeout(()=>{ const mk=document.querySelector('mark[data-hlid="'+hl.id+'"]'); if(mk){ mk.style.outline='3px solid var(--app-accent)'; setTimeout(()=>mk.style.outline='',1500);} },350); };
    div.querySelector('.del').onclick=()=>{ setHL(getHL().filter(x=>x.id!==hl.id));
      const mk=document.querySelector('mark[data-hlid="'+hl.id+'"]'); if(mk&&mk.parentNode){ mk.replaceWith(...mk.childNodes); mk.parentNode.normalize(); }
      renderNotes(); };
    list.appendChild(div);
  });
}
$('#btn-export-notes').onclick=()=>{
  const blob=new Blob([JSON.stringify({app:'scribe',version:0.3,exported:new Date().toISOString(),highlights:getHL()},null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='scribe-notes.json'; a.click(); URL.revokeObjectURL(a.href);
};
$('#btn-clear-notes').onclick=()=>{ if(confirm('Delete ALL highlights and notes on this device?')){ setHL([]); $$('mark.scribe-hl').forEach(mk=>{mk.replaceWith(...mk.childNodes); mk.parentNode.normalize();}); renderNotes(); toast('All notes cleared'); } };

/* ---------- Glossary popups ---------- */
const glossKeys=Object.keys(DATA.glossary).sort((a,b)=>b.length-a.length);
function linkifyGlossary(){
  const re=new RegExp('\\b('+glossKeys.map(escRe).join('|')+')\\b');
  const walker=document.createTreeWalker($('#scribe-main'),NodeFilter.SHOW_TEXT,{acceptNode(n){
    const p=n.parentElement;
    if(!p||p.closest('script,style,pre,code,.gloss-term,table,h1,h2,h3,figcaption')) return NodeFilter.FILTER_REJECT;
    return re.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;
  }});
  const nodes=[]; let cur; while((cur=walker.nextNode())) nodes.push(cur);
  nodes.slice(0,600).forEach(node=>{
    const v=node.nodeValue; const m=v.match(re); if(!m) return;
    const range=document.createRange(); range.setStart(node,v.indexOf(m[0])); range.setEnd(node,v.indexOf(m[0])+m[0].length);
    const sp=document.createElement('span'); sp.className='gloss-term'; sp.dataset.term=m[0];
    try{ range.surroundContents(sp);}catch(e){}
  });
}
const gp=$('#gloss-pop');
let userCards=LS.get('usercards',[]);
document.addEventListener('click',e=>{
  const t=e.target.closest('.gloss-term');
  if(!t){ if(!e.target.closest('#gloss-pop')) gp.classList.remove('show'); return; }
  const term=t.dataset.term; const def=DATA.glossary[term]; if(!def) return;
  gp.innerHTML='<h4></h4><div class="gp-def"></div><div class="gp-actions"><button id="gp-card">🃏 Make card</button><button id="gp-graph">🕸 In graph</button></div>';
  gp.querySelector('h4').textContent=term;
  gp.querySelector('.gp-def').textContent=def;
  const r=t.getBoundingClientRect();
  gp.style.left=Math.max(8,Math.min(innerWidth-360,r.left+scrollX-40))+'px'; gp.style.top=(r.bottom+scrollY+8)+'px';
  gp.classList.add('show');
  gp.querySelector('#gp-card').onclick=()=>{ userCards.push({front:'What is "'+term+'"?',back:def,tag:'My cards'}); LS.set('usercards',userCards); toast('Flashcard created — open 🃏 Study'); gp.classList.remove('show'); };
  gp.querySelector('#gp-graph').onclick=()=>{ gp.classList.remove('show'); openGraphFor(term); };
});

/* ---------- Knowledge Graph (custom SVG force layout) ---------- */
const TYPE_COLORS={role:'#8e44ad',rule:'#c0392b',concept:'#2980b9',section:'#16a085',objective:'#d35400',billing:'#f1c40f',setting:'#27ae60',encounter:'#34495e',condition:'#e84393'};
let kgState=null;
function svgEl(tag){ return document.createElementNS('http://www.w3.org/2000/svg',tag); }
function initGraph(){
  const svg=$('#kg-svg');
  const nodes=DATA.kg.nodes.map(n=>Object.assign({},n,{x:0,y:0,vx:0,vy:0}));
  const byId={}; nodes.forEach(n=>byId[n.id]=n);
  const links=DATA.kg.links.filter(l=>byId[l[0]]&&byId[l[1]]).map(l=>({s:byId[l[0]],t:byId[l[1]],rel:l[2]}));
  const W=svg.clientWidth||1000,H=svg.clientHeight||600;
  nodes.forEach((n,i)=>{ const a=i/nodes.length*Math.PI*2; n.x=W/2+Math.cos(a)*250+(Math.random()*40-20); n.y=H/2+Math.sin(a)*200+(Math.random()*40-20); });
  svg.innerHTML='';
  const gLink=svgEl('g'), gNode=svgEl('g');
  svg.appendChild(gLink); svg.appendChild(gNode);
  links.forEach(l=>{ l.el=svgEl('line'); l.el.setAttribute('class','kg-link'); gLink.appendChild(l.el); });
  nodes.forEach(n=>{
    const deg=links.reduce((a,l)=>a+(l.s===n||l.t===n?1:0),0);
    n.r=8+Math.min(10,deg*1.6);
    const g=svgEl('g'); g.setAttribute('class','kg-node');
    const c=svgEl('circle'); c.setAttribute('r',n.r); c.setAttribute('fill',TYPE_COLORS[n.type]||'#888');
    const t=svgEl('text'); t.setAttribute('dy',n.r+13); t.setAttribute('text-anchor','middle'); t.textContent=n.label;
    g.appendChild(c); g.appendChild(t); gNode.appendChild(g); n.el=g;
    let drag=null;
    g.addEventListener('pointerdown',ev=>{ ev.stopPropagation(); drag={x:ev.clientX,y:ev.clientY}; try{g.setPointerCapture(ev.pointerId);}catch(e){} n.fixed=true; });
    g.addEventListener('pointermove',ev=>{ if(!drag)return; const pt=svgPoint(svg,ev); n.x=pt.x; n.y=pt.y; n.vx=n.vy=0; kick(); });
    g.addEventListener('pointerup',ev=>{ const moved=drag&&(Math.abs(ev.clientX-drag.x)+Math.abs(ev.clientY-drag.y)); drag=null; n.fixed=false; if((moved||0)<4) selectNode(n); });
  });
  kgState={nodes,links,byId,alpha:1,running:false};
  tick();
}
function svgPoint(svg,ev){ const r=svg.getBoundingClientRect(); return {x:(ev.clientX-r.left)*(svg.clientWidth/r.width||1), y:(ev.clientY-r.top)*(svg.clientHeight/r.height||1)}; }
function kick(){ if(kgState){ kgState.alpha=Math.max(kgState.alpha,.5); if(!kgState.running){kgState.running=true; requestAnimationFrame(tick);} } }
function tick(){
  const st=kgState; if(!st) return;
  const svg=$('#kg-svg'); const W=svg.clientWidth||1000,H=svg.clientHeight||600;
  const a=st.alpha;
  for(let i=0;i<st.nodes.length;i++)for(let j=i+1;j<st.nodes.length;j++){
    const n1=st.nodes[i],n2=st.nodes[j]; let dx=n2.x-n1.x,dy=n2.y-n1.y; let d2=dx*dx+dy*dy||1;
    if(d2<90000){ const f=a*1400/d2; const d=Math.sqrt(d2); dx/=d; dy/=d; n1.vx-=dx*f; n1.vy-=dy*f; n2.vx+=dx*f; n2.vy+=dy*f; }
  }
  st.links.forEach(l=>{ let dx=l.t.x-l.s.x,dy=l.t.y-l.s.y; const d=Math.sqrt(dx*dx+dy*dy)||1; const f=a*(d-130)*0.02; dx/=d;dy/=d; l.s.vx+=dx*f;l.s.vy+=dy*f;l.t.vx-=dx*f;l.t.vy-=dy*f; });
  st.nodes.forEach(n=>{ n.vx+=(W/2-n.x)*a*0.002; n.vy+=(H/2-n.y)*a*0.002; if(!n.fixed){ n.x+=Math.max(-14,Math.min(14,n.vx*=0.85)); n.y+=Math.max(-14,Math.min(14,n.vy*=0.85)); } n.x=Math.max(20,Math.min(W-20,n.x)); n.y=Math.max(20,Math.min(H-30,n.y)); n.el.setAttribute('transform','translate('+n.x+','+n.y+')'); });
  st.links.forEach(l=>{ l.el.setAttribute('x1',l.s.x);l.el.setAttribute('y1',l.s.y);l.el.setAttribute('x2',l.t.x);l.el.setAttribute('y2',l.t.y); });
  st.alpha*=0.985;
  if(st.alpha>0.02){ requestAnimationFrame(tick); } else { st.running=false; }
}
function selectNode(n){
  const st=kgState; const panel=$('#kg-panel');
  const neigh=new Set([n.id]); st.links.forEach(l=>{ if(l.s===n)neigh.add(l.t.id); if(l.t===n)neigh.add(l.s.id); });
  st.nodes.forEach(x=>x.el.classList.toggle('dim',!neigh.has(x.id)));
  st.links.forEach(l=>{ const on=(l.s===n||l.t===n); l.el.classList.toggle('hl',on); l.el.classList.toggle('dim',!on); });
  const rels=st.links.filter(l=>l.s===n||l.t===n).map(l=>{ const other=l.s===n?l.t:l.s; const dir=l.s===n?'→':'←'; return '<div class="kg-rel">'+dir+' <a data-id="'+other.id+'">'+other.label+'</a> <em>('+l.rel+')</em></div>'; }).join('');
  panel.innerHTML='<h3></h3><p class="kg-desc"></p>'+rels+'<p style="margin-top:10px"><a href="#'+n.ch+'" id="kg-goto" style="color:var(--app-accent)">📖 Read in chapter →</a></p>';
  panel.querySelector('h3').textContent=n.label+' · '+n.type;
  panel.querySelector('.kg-desc').textContent=n.desc;
  panel.classList.add('show');
  panel.querySelectorAll('a[data-id]').forEach(a=>a.onclick=()=>{ const t=st.byId[a.dataset.id]; if(t) selectNode(t); });
  const g=$('#kg-goto'); if(g) g.onclick=()=>{ $('#dlg-graph').close(); };
}
function filterGraph(ch){
  const st=kgState; if(!st) return;
  st.nodes.forEach(n=>{ n.el.style.display=(!ch||n.ch===ch)?'':'none'; });
  st.links.forEach(l=>{ l.el.style.display=(!ch||(l.s.ch===ch&&l.t.ch===ch))?'':'none'; });
  kick();
}
function clearDim(){ if(!kgState)return; kgState.nodes.forEach(n=>n.el.classList.remove('dim')); kgState.links.forEach(l=>{l.el.classList.remove('hl','dim');}); }
function openGraphFor(term){
  $('#dlg-graph').showModal();
  if(!kgState){ initGraph(); }
  const q=(term||'').toLowerCase();
  const n=q?kgState.nodes.find(x=>x.label.toLowerCase().includes(q)||x.id.includes(q)):null;
  $('#kg-ch-filter').value='all'; filterGraph(null);
  if(n){ setTimeout(()=>selectNode(n),350); } else if(q){ toast('No graph node for "'+term+'" — showing full map'); }
}
$('#btn-graph').onclick=()=>{ $('#dlg-graph').showModal(); if(!kgState) setTimeout(initGraph,60); };
$('#kg-ch-filter').onchange=e=>{ const v=e.target.value; filterGraph(v==='all'?null:v); $('#kg-panel').classList.remove('show'); clearDim(); };
$('#btn-fit').onclick=()=>{ if(kgState){ kgState.alpha=1; clearDim(); $('#kg-panel').classList.remove('show'); kick(); } };

/* ---------- Flashcards (SM-2-lite spaced repetition) ---------- */
function allCards(){ return DATA.flashcards.concat(userCards); }
function fcStore(){ return LS.get('srs',{}); }
function dueQueue(filterTag){
  const now=Date.now();
  const cards=allCards().map((c,i)=>({c,i}));
  const pool = filterTag? cards.filter(x=>x.c.tag===filterTag):cards;
  const store=fcStore();
  const due = pool.filter(x=>{ const s=store[x.i]; return !s || s.due<=now; });
  const dueSet=new Set(due.map(x=>x.i));
  const rest = pool.filter(x=>!dueSet.has(x.i));
  return due.concat(rest);
}
let fcQueue=[],fcCur=null;
function openStudy(tag){
  $('#dlg-study').showModal();
  const sel=$('#fc-filter'); sel.innerHTML='<option value="">All decks</option>'+ [...new Set(allCards().map(c=>c.tag))].map(t=>'<option'+(t===tag?' selected':'')+'></option>').join('');
  Array.from(sel.options).forEach((o,i)=>{ if(i>0) o.textContent=allCards().map(c=>c.tag).filter((v,ix,a)=>a.indexOf(v)===ix)[i-1]; });
  fcQueue=dueQueue(tag); nextCard();
}
$('#btn-study').onclick=()=>openStudy('');
$('#fc-filter').onchange=e=>{ fcQueue=dueQueue(e.target.value||null); nextCard(); };
function nextCard(){
  fcCur=fcQueue.shift();
  const card=$('#fc-card'); card.classList.remove('flipped');
  if(!fcCur){ $('#fc-front').textContent='🎉 Deck complete!'; $('#fc-back').textContent='Come back tomorrow or switch decks.'; $('#fc-controls').style.visibility='hidden'; $('#fc-pos').textContent=''; $('#fc-tag').textContent=''; return; }
  $('#fc-controls').style.visibility='visible';
  $('#fc-tag').textContent=fcCur.c.tag; $('#fc-front').textContent=fcCur.c.front; $('#fc-back').textContent=fcCur.c.back;
  $('#fc-pos').textContent=fcQueue.length+' cards waiting';
}
$('#fc-card').onclick=()=>{ $('#fc-card').classList.toggle('flipped'); };
$('#fc-card').addEventListener('keydown',e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); $('#fc-card').classList.toggle('flipped'); } });
$('#fc-controls').querySelectorAll('button[data-q]').forEach(b=>{
  b.onclick=()=>{
    if(!fcCur) return;
    const q=+b.dataset.q; const store=fcStore(); const s=store[fcCur.i]||{ease:2.5,ivl:0,due:0};
    if(q<2){ s.ivl=0; s.due=Date.now()+ (q===0?60000:600000); }
    else if(q===2){ s.ivl = s.ivl? Math.round(s.ivl*1.3) : 1; s.due=Date.now()+s.ivl*86400000; }
    else { s.ivl = s.ivl? Math.round(s.ivl*2.5) : 4; s.due=Date.now()+s.ivl*86400000; }
    s.ease=Math.max(1.3,s.ease+(q-2)*0.1);
    store[fcCur.i]=s; LS.set('srs',store);
    nextCard();
  };
});
$('#btn-add-card').onclick=()=>{
  const front=prompt('Card question / term:'); if(!front) return;
  const back=prompt('Card answer:'); if(!back) return;
  userCards.push({front,back,tag:'My cards'}); LS.set('usercards',userCards); toast('Card added to "My cards" deck');
  fcQueue=dueQueue($('#fc-filter').value||null);
};

/* ---------- Text-to-Speech ---------- */
let ttsOn=false;
$('#btn-tts').onclick=()=>{
  if(!('speechSynthesis' in window)){ toast('Speech not supported in this browser'); return; }
  if(ttsOn){ speechSynthesis.cancel(); ttsOn=false; $('#btn-tts').textContent='🔊 Read'; toast('Stopped reading'); return; }
  const cur=currentChapter(); const sec=cur?document.getElementById(cur):null;
  if(!sec){ toast('Nothing to read here'); return; }
  const text=readableText(sec);
  if(!text){ toast('No readable text in this chapter'); return; }
  const u=new SpeechSynthesisUtterance(text); u.rate=1.05;
  u.onend=()=>{ ttsOn=false; $('#btn-tts').textContent='🔊 Read'; };
  speechSynthesis.cancel(); speechSynthesis.speak(u); ttsOn=true; $('#btn-tts').textContent='⏹ Stop';
  toast('Reading current chapter aloud');
};
function readableText(el){
  const root=$('#scribe-main');
  const all=Array.from(root.querySelectorAll('h2[id],h3[id],p,li,caption'));
  const start=all.indexOf(el)>=0?all.indexOf(el):all.findIndex(n=>el.contains(n));
  const out=[];
  for(let i=start+1;i<all.length;i++){ const n=all[i]; if(/^H[2-3]$/.test(n.tagName)) break; if(n.querySelector('p,li')) continue; out.push(n.textContent); if(out.join(' ').length>6000)break; }
  return out.join('. ').replace(/\s+/g,' ');
}

/* ---------- Keyboard shortcuts ---------- */
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,textarea,select')) return;
  if($('dialog[open]')) return;
  if(e.key==='/'){ e.preventDefault(); $('#search-input').focus(); }
  else if(e.key==='g'){ openGraphFor(''); }
  else if(e.key==='s'){ openStudy(''); }
  else if(e.key==='n'){ renderNotes(); $('#dlg-notes').showModal(); }
  else if(e.key==='ArrowRight'&&e.altKey){ const nx=chapters.findIndex(c=>c.id===currentChapter()); if(nx>=0&&nx<chapters.length-1) location.hash='#'+chapters[nx+1].id; }
  else if(e.key==='ArrowLeft'&&e.altKey){ const nx=chapters.findIndex(c=>c.id===currentChapter()); if(nx>0) location.hash='#'+chapters[nx-1].id; }
});

/* ---------- Chapter completion checkmarks ---------- */
function setupProgressMarks(){
  const done=LS.get('readChapters',{});
  const io=new IntersectionObserver(es=>es.forEach(en=>{
    if(en.isIntersecting){
      const cur=currentChapter(); if(cur&&!done[cur]){ done[cur]=true; LS.set('readChapters',done); refreshChecks(); }
    }
  }),{threshold:[0.15]});
  $$('#scribe-main h3[id]').forEach(h=>io.observe(h));
  function refreshChecks(){ $$('#toc a.lvl2').forEach(a=>{ const ok=done[a.dataset.target]; if(ok&&!a.querySelector('.done-check')) a.insertAdjacentHTML('afterbegin','<span class="done-check">✓</span>'); if(!ok){const c=a.querySelector('.done-check'); if(c)c.remove();} }); }
  refreshChecks();
}

/* ---------- Boot ---------- */
window.addEventListener('DOMContentLoaded',()=>{
  buildTOC(); setupScroll(); buildPager(); linkifyGlossary(); restoreHighlights(); setupProgressMarks();
  if(window.requestIdleCallback) requestIdleCallback(buildSearchIndex,{timeout:2000}); else setTimeout(buildSearchIndex,300);
  addEventListener('hashchange',()=>{ const el=document.getElementById(location.hash.slice(1)); if(el){ const y=el.getBoundingClientRect().top+scrollY-64; scrollTo({top:y,behavior:'smooth'}); } });
  if(location.hash){ const el=document.getElementById(location.hash.slice(1)); if(el) setTimeout(()=>scrollTo({top:el.getBoundingClientRect().top+scrollY-64}),120); }
});
})();
