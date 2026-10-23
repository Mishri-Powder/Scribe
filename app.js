// Scribe Academy v0.4 — application logic (from scratch)
(function(){
'use strict';
// Safety net: if the data script failed to parse/execute, show a clear message instead of a dead UI
if(!window.__APP_DATA__){
  document.addEventListener('DOMContentLoaded',function(){
    var m=document.querySelector('#book-content')||document.body;
    m.insertAdjacentHTML('afterbegin','<div style="padding:20px;margin:20px;border:2px solid #c00;border-radius:10px;background:#fee;color:#900;font-weight:600">App data failed to load. Please hard-refresh the page (Ctrl+Shift+R / Cmd+Shift+R). If this persists, the deployed file may be an old build.</div>');
  });
}
const DATA = window.__APP_DATA__ || {kg:{kg:{nodes:[],links:[]}},glossary:[],flashcards:[],mcqs:{}};   // {kg, glossary, flashcards, mcqs}
const KG = DATA.kg.kg || DATA.kg; // data.py wraps as {"kg": {nodes, links}}
const MCQS = DATA.mcqs;                      // chId -> [{q, opts:[...], a:[idx], why, links:[secIds]}]
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- node type registry: hue + shape + texture (never color alone) ---------- */
const TYPES = {
  chapter:   {hue:256, label:'Chapter',  shape:'ring'},
  topic:     {hue:210, label:'Topic',    shape:'circle'},
  concept:   {hue:250, label:'Concept',  shape:'circle'},
  rule:      {hue:27,  label:'Rule',     shape:'hex'},
  role:      {hue:315, label:'Role',     shape:'circle'},
  objective: {hue:55,  label:'Objective',shape:'rect'},
  section:   {hue:175, label:'Section',  shape:'rect'},
  figure:    {hue:200, label:'Figure',   shape:'diamond'},
  billing:   {hue:91,  label:'Billing',  shape:'diamond'},
  setting:   {hue:152, label:'Setting',  shape:'hex'},
  encounter: {hue:220, label:'Encounter',shape:'diamond'},
  condition: {hue:355, label:'Condition',shape:'circle'},
};
const TEX_OF_SHAPE = {circle:'dots', hex:'stripes', rect:'grid', diamond:'cross', ring:'rings'};
const nodeColor = t => { const h=(TYPES[t]||TYPES.concept).hue;
  return {fill:`var(--tc-${t})`, stroke:`var(--ts-${t})`}; };
// inject per-type oklch vars for light + dark
(function(){
  let css=':root{'; let dk='[data-theme="dark"]{';
  for(const [t,cfg] of Object.entries(TYPES)){
    css+=`--tc-${t}:oklch(87% 0.07 ${cfg.hue});--ts-${t}:oklch(48% 0.14 ${cfg.hue});`;
    dk +=`--tc-${t}:oklch(34% 0.08 ${cfg.hue});--ts-${t}:oklch(75% 0.13 ${cfg.hue});`;
  }
  const st=document.createElement('style'); st.textContent=css+'}'+dk+'}'; document.head.appendChild(st);
})();

/* ---------- storage ---------- */
const store = {
  get(k,d){ try{const v=localStorage.getItem('scribe04_'+k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{localStorage.setItem('scribe04_'+k,JSON.stringify(v));}catch(e){} },
  keys(){ const out=[]; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); if(k&&k.startsWith('scribe04_'))out.push(k.slice(9));} return out; }
};
let highlights = store.get('highlights',{});   // hash -> {color,text,section,note?}
let mcqState   = store.get('mcq',{});          // "ch:i" -> picked index
let lastChapter= store.get('lastChapter','ch1');

/* ============================ BOOK ============================ */
const bookContent=$('#book-content'), tocList=$('#toc-list');
const chapters=Array.from(bookContent.querySelectorAll('.chapter'));
const CH_LABEL={}; chapters.forEach(ch=>{CH_LABEL[ch.id]=(ch.querySelector('h2')?.textContent||'').trim();});

function hashText(t){let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))>>>0;return 'h'+h.toString(36);}
function sectionOf(el){const h3=prevH3(el);return h3?(h3.id||(h3.id='sec-'+hashText(h3.textContent.slice(0,40)))):'top';}
function prevH3(el){ let n=el; while(n){ if(n.nodeType===1){ if(n.tagName==='H3'&&n.id)return n;
  const p=n.previousElementSibling; if(p){const q=p.querySelector? p : p; if(p.tagName==='H3'&&p.id)return p;
    const inner=p.querySelectorAll?('h3[id]'):null; if(inner&&inner.length)return inner[inner.length-1];} }
  n=n.parentElement; } return null; }
function sectionOfSafe(el){ try{return sectionOf(el);}catch(e){return 'top';} }

/* build TOC from the book itself (chapters + h3 sections) */
const sbHover=$('#sidebar'); let sbPinned=store.get('sbPinned',true);
function buildTOC(){
  tocList.innerHTML='';
  const nav=[['graph-view','🗺 Knowledge Map'],['flashcards-view','🃏 Flashcards'],['mcq-view','✅ MCQ Practice'],
             ['glossary-view','📖 Glossary'],['settings-view','⚙ Settings']];
  chapters.forEach((ch,i)=>{
    const title=(ch.querySelector('h2')?.textContent||ch.id).trim();
    const li=document.createElement('li');
    const num=/^(\d+[AB]?)/.exec(title);
    li.innerHTML=`<a class="toc-link" data-ch="${ch.id}"><span class="toc-chapter-label">`+
      `<span class="toc-num">${esc(num?num[1]:String(i+1))}</span><span>${esc(title.replace(/^\d+[AB]?\.?\s*/,''))}</span></a>`;
    const sub=document.createElement('ul'); sub.className='toc-sublist';
    ch.querySelectorAll('h3[id]').forEach(h3=>{
      const sli=document.createElement('li');
      sli.innerHTML=`<a class="toc-link toc-section-link" data-jump="${h3.id}">${esc(h3.textContent)}</a>`;
      sub.appendChild(sli);
    });
    li.appendChild(sub); tocList.appendChild(li);
  });
  const navLi=document.createElement('li'); navLi.innerHTML='<div class="pm-divider"></div>';
  tocList.appendChild(navLi);
  nav.forEach(([v,l])=>{ const li=document.createElement('li');
    li.innerHTML=`<a class="toc-link" data-viewbtn="${v}">${l}</a>`; tocList.appendChild(li); });
}

/* wrap stored highlights on load (text-match placement, tolerant) */
function restoreHighlights(){
  const bySec={};
  for(const [h,o] of Object.entries(highlights)){(bySec[o.section]=bySec[o.section]||[]).push([h,o]);}
  $$('#book-content h3[id]').forEach(h3=>{
    const sec=h3.id; let el=h3.nextElementSibling; const stop=t=>t&&(t.tagName==='H3'||t.tagName==='H2');
    const scope=[]; while(el&&!stop(el)){scope.push(el);el=el.nextElementSibling;}
    (bySec[sec]||[]).forEach(([hash,o])=>{ wrapIn(scope,o.text,hash,o.color); });
  });
  // global fallback scan for anything not found in its section
  for(const [hash,o] of Object.entries(highlights)){
    if(o.removed||document.querySelector(`#book-content .hl[data-h="${hash}"]`))continue;
    if(!wrapIn([bookContent],o.text,hash,o.color)){ /* stale text; keep in notes list */ }
  }
  // re-apply current colors so stored recolors survive reload
  for(const [hash,o] of Object.entries(highlights)){
    const el=document.querySelector(`#book-content .hl[data-h="${hash}"]`);
    if(el&&o.color)el.className='hl hl-'+o.color;
  }
  linkHlToKg();   // bidirectional: every highlight knows its graph node(s)
}
function wrapIn(scopeEls,text,hash,color){
  const needle=text.trim(); if(!needle)return false;
  const walker=document.createTreeWalker(scopeEls.length?scopeEls[0].parentElement||scopeEls[0]:bookContent,NodeFilter.SHOW_TEXT,{
    acceptNode(n){ if(!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
      const p=n.parentElement; if(!p||p.closest('.quiz,.results-pop,script,style'))return NodeFilter.FILTER_REJECT;
      if(p.classList.contains('hl'))return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; }});
  let n; while((n=walker.nextNode())){
    const idx=n.nodeValue.indexOf(needle);
    if(idx>=0){
      const range=document.createRange(); range.setStart(n,idx); range.setEnd(n,idx+needle.length);
      const span=document.createElement('span'); span.className='hl hl-'+color; span.dataset.h=hash;
      try{range.surroundContents(span);}catch(e){return false;}
      return true;
    }
  }
  return false;
}

/* selection popup */
const popup=$('#popup-menu'); let pendingSel=null;
let suppressPopup=false;   // set when interacting with popups themselves
document.addEventListener('mouseup',e=>{
  const tgt=e.target&&e.target.nodeType===1?e.target:null; // e.target may be a text node
  if(tgt&&(tgt.closest('.popup-menu')||tgt.closest('.note-editor')||tgt.closest('.graph-peek')))return;
  setTimeout(()=>{
    if(suppressPopup){suppressPopup=false;return;}
    const sel=window.getSelection();
    const text=sel? sel.toString().trim():'';
    if(text && text.length<=400 && bookContent.contains(sel&&sel.anchorNode)){
      pendingSel={text, rect:sel.getRangeAt(0).getBoundingClientRect()}; showPopup(pendingSel.rect);
    } else if(!(tgt&&tgt.closest('#popup-menu')) && !(tgt&&tgt.closest('.hl'))){ hidePopup(); }
  },10);
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){hidePopup();closePeek();} });
function showPopup(rect){
  popup.classList.add('open');
  const pw=popup.offsetWidth||250, ph=popup.offsetHeight||190;
  let x=rect.left+rect.width/2-pw/2, y=rect.bottom+8;
  x=Math.max(8,Math.min(x,innerWidth-pw-8)); if(y+ph>innerHeight-8)y=Math.max(70,rect.top-ph-8);
  popup.style.left=x+scrollX+'px'; popup.style.top=y+scrollY+'px';
  $('#pm-count').textContent=Object.keys(highlights).length+' saved';
}
function hidePopup(){popup.classList.remove('open');$$('.hl-current').forEach(x=>x.classList.remove('hl-current'));}
$$('.pm-swatch').forEach(b=>b.addEventListener('click',()=>{
  if(!pendingSel)return; const color=b.dataset.color; const hash=hashText(pendingSel.text);
  // wrap the live selection so the highlight appears immediately (and section is exact)
  const sel=window.getSelection();
  let el=document.querySelector(`.hl[data-h="${hash}"]`);
  if(!el && sel.rangeCount && bookContent.contains(sel.anchorNode)){
    const range=sel.getRangeAt(0);
    if(range.toString().trim()===pendingSel.text){
      el=document.createElement('span'); el.className='hl hl-'+color; el.dataset.h=hash;
      try{range.surroundContents(el);}catch(err){el=null;}
    }
  }
  if(el&&!el.isConnected)el=null;
  if(el){el.className='hl hl-'+color;el.dataset.kg=el.dataset.kg||'';}
  highlights[hash]={color,text:pendingSel.text,section:sectionOfSafe(el||bookContent),...(highlights[hash]?.note?{note:highlights[hash].note}:{})};
  store.set('highlights',highlights); updateNotesBadge(); renderNotes(); hidePopup(); window.getSelection().removeAllRanges();
  toast('Highlighted ✓');
}));
/* ---- note editor popup (replaces prompt()) ---- */
const noteEditor=$('#note-editor'),neArea=$('#ne-area'); let editingHash=null;
function openNoteEditor(hash,text,existing){
  editingHash=hash; $('#ne-quote').textContent='“'+text.slice(0,220)+'”';
  neArea.value=existing||''; noteEditor.classList.add('open');
  setTimeout(()=>{neArea.focus();neArea.setSelectionRange(neArea.value.length,neArea.value.length);},30);
}
function closeNoteEditor(){noteEditor.classList.remove('open');editingHash=null;}
$('#pm-add-note').addEventListener('click',()=>{
  if(!pendingSel)return; const hash=hashText(pendingSel.text);
  openNoteEditor(hash,pendingSel.text,highlights[hash]?.note||'');
  hidePopup();
});
$('#ne-cancel').onclick=closeNoteEditor;
$('#ne-save').onclick=()=>{ saveNoteFromEditor(); };
neArea.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();saveNoteFromEditor();}
  if(e.key==='Escape'){e.stopPropagation();closeNoteEditor();}
});
function saveNoteFromEditor(){
  if(!editingHash)return; const note=neArea.value.trim();
  const src=pendingSel||highlights[editingHash]||{};
  const el=document.querySelector(`.hl[data-h="${editingHash}"]`);
  if(el){ // make sure it exists in the DOM (create wrapper from stored text if needed)
    el.insertAdjacentElement; // no-op guard
  }
  if(!el && src.text){ wrapIn([bookContent],src.text,editingHash,highlights[editingHash]?.color||'yellow'); }
  const target=document.querySelector(`.hl[data-h="${editingHash}"]`)||bookContent;
  const prev=highlights[editingHash]||{text:src.text||'',color:'yellow'};
  highlights[editingHash]={...prev,color:prev.color||'yellow',text:prev.text||src.text||'',
    section:prev.section||sectionOfSafe(target),note:note};
  if(!note)delete highlights[editingHash].note;
  store.set('highlights',highlights); renderNotes(); updateNotesBadge();
  closeNoteEditor(); toast(note?'Note saved ✓':'Note removed');
}
$('#pm-remove-highlight').addEventListener('click',()=>{
  if(!pendingSel)return; const hash=hashText(pendingSel.text);
  removeHighlightDom(hash); delete highlights[hash];
  store.set('highlights',highlights); updateNotesBadge(); renderNotes(); hidePopup();
});
function removeHighlightDom(hash){
  const el=document.querySelector(`#book-content .hl[data-h="${hash}"]`);
  if(el){const p=el.parentNode;p.replaceChild(document.createTextNode(el.textContent),el);p.normalize();}
}
/* click existing highlight → recolor/remove/edit-note menu */
bookContent.addEventListener('click',e=>{
  const hl=e.target.closest('.hl'); if(!hl)return;
  const hash=hl.dataset.h; const r=hl.getBoundingClientRect();
  pendingSel={text:hl.textContent,rect:r};
  popup.classList.add('open');
  const pw=popup.offsetWidth,ph=popup.offsetHeight;
  popup.style.left=Math.max(8,Math.min(r.left+r.width/2-pw/2,innerWidth-pw-8))+scrollX+'px';
  popup.style.top=(r.bottom+8+ph>innerHeight?Math.max(70,r.top-ph-8):r.bottom+8)+scrollY+'px';
  $$('.hl-current').forEach(x=>x.classList.remove('hl-current')); hl.classList.add('hl-current');
  $('#pm-count').textContent=highlights[hash]?.note?('note: '+highlights[hash].note.slice(0,40)+'…'):'saved';
});
/* hover over a highlighted passage → floating mini-note card (Obsidian-style) */
let hlHoverCard=null,hlHoverTimer=null;
bookContent.addEventListener('mouseover',e=>{
  const hl=e.target.closest('.hl'); if(!hl)return;
  const hash=hl.dataset.h; const o=highlights[hash]; if(!o||!o.note)return;
  clearTimeout(hlHoverTimer);
  hlHoverTimer=setTimeout(()=>{
    if(hlHoverCard)hlHoverCard.remove();
    hlHoverCard=document.createElement('div'); hlHoverCard.className='graph-peek open';
    hlHoverCard.innerHTML=`<div style="font-size:11px;font-weight:700;color:var(--app-muted);margin-bottom:4px">📝 Note</div>`+
      `<div style="white-space:pre-wrap;line-height:1.5">${esc(o.note)}</div>`;
    document.body.appendChild(hlHoverCard);
    positionPeek(hlHoverCard,hl.getBoundingClientRect());
  },450);
});
bookContent.addEventListener('mouseout',e=>{
  if(!e.relatedTarget||!(e.relatedTarget.closest&&e.relatedTarget.closest('.hl'))){
    clearTimeout(hlHoverTimer);
    setTimeout(()=>{if(hlHoverCard&&!hlHoverCard.matches(':hover')){hlHoverCard.remove();hlHoverCard=null;}},250);
  }
});

/* notes panel — grouped by chapter, live editing */
const notesPanel=$('#notes-panel');
function updateNotesBadge(){const n=Object.keys(highlights).length;const b=$('#notes-count');b.style.display=n?'':'none';b.textContent=n;}
function chOfSection(sec){
  if(!sec||sec==='top')return 'top';
  const m=/^(ch\d+[ab]?)/.exec(sec); if(m&&CH_LABEL[m[1]])return m[1];
  // section ids look like ch3-golden; also handle h3 ids that lost the prefix via fallback scan
  const el=document.getElementById(sec);
  if(el){const ch=el.closest('.chapter');if(ch)return ch.id;}
  return m?m[1]:'top';
}
function renderNotes(){
  const list=$('#notes-list'); list.innerHTML='';
  const items=Object.entries(highlights);
  if(!items.length){list.innerHTML='<div class="np-empty">Select any text in the book to highlight it — four textures mean four kinds of meaning:<br>hatch = key fact · dots = definition · grid = procedure · stripes = watch out.<br><br>Hover a highlighted passage to read its note; click it to recolor or edit.</div>';return;}
  const groups={};
  items.forEach(([hash,o])=>{const cid=chOfSection(o.section);(groups[cid]=groups[cid]||[]).push([hash,o]);});
  const order=chapters.map(c=>c.id).filter(id=>groups[id]);
  if(groups.top)order.push('top');
  order.forEach(cid=>{
    const head=document.createElement('div');head.className='note-group-head';
    head.textContent=cid==='top'?'Uncategorized':(CH_LABEL[cid]||cid);
    list.appendChild(head);
    groups[cid].sort((a,b)=>(a[1].section||'').localeCompare(b[1].section||'')).forEach(([hash,o])=>{
      const card=document.createElement('div');card.className='note-card';
      card.innerHTML=`<div class="note-quote" title="${esc(o.text)}">${esc(o.text.slice(0,160))}</div>`+
        `<textarea class="note-edit" rows="2" placeholder="Add a note…">${esc(o.note||'')}</textarea>`+
        `<div class="note-meta"><span class="tf-dot" style="background:var(--hl-${o.color}-soft);border:1px solid var(--hl-${o.color}-ink)"></span>`+
        `<span>${esc(document.getElementById(o.section)?.textContent?.slice(0,40)||'')}</span>`+
        `<button class="note-jump">Go</button><button class="note-del" title="Delete">✕</button></div>`;
      const ta=card.querySelector('.note-edit');let tTimer=null;
      ta.addEventListener('input',()=>{clearTimeout(tTimer);tTimer=setTimeout(()=>{
        if(!highlights[hash])return;
        const v=ta.value.trim();
        if(v)highlights[hash].note=v;else delete highlights[hash].note;
        store.set('highlights',highlights);},350);});
      card.querySelector('.note-jump').onclick=()=>{
        showView('book');
        const el=document.querySelector(`.hl[data-h="${hash}"]`);
        if(el){el.scrollIntoView({behavior:'smooth',block:'center'});flashEl(el);}
        else{const t=$('#book-content').querySelector(`#${CSS.escape(o.section)}`);if(t)t.scrollIntoView({behavior:'smooth'});}
      };
      card.querySelector('.note-del').onclick=()=>{
        removeHighlightDom(hash); delete highlights[hash];store.set('highlights',highlights);renderNotes();updateNotesBadge();};
      list.appendChild(card);
    });
  });
}
$('#notes-panel-toggle').onclick=()=>{renderNotes();notesPanel.classList.toggle('open');};
$('#notes-close').onclick=()=>notesPanel.classList.remove('open');

/* reading progress + scroll spy */
const progressBar=$('.progress-bar');
addEventListener('scroll',()=>{
  const h=document.documentElement; const max=h.scrollHeight-h.clientHeight;
  if(progressBar)progressBar.style.width=(max>0?100*h.scrollTop/max:0)+'%';
},{passive:true});

/* ============================ VIEWS / NAV ============================ */
const sidebar=$('#sidebar'),overlay=$('#overlay');
function showView(v){
  $$('.view').forEach(s=>s.classList.toggle('active',s.id===v+'-view'));
  $$('.toc-link').forEach(a=>a.classList.toggle('active',(a.dataset.viewbtn||a.dataset.ch)===(v==='book'?lastChapter:v)));
  closeSidebar();
  if(v==='graph'&&!Graph.built)Graph.build();
  if(v==='graph')setTimeout(()=>Graph.fit(),30);
  if(v==='mcq')MCQ.renderNav();
  $$('#view-tabs .vt-btn').forEach(b=>b.classList.toggle('active',b.dataset.viewbtn===v));
  location.hash=v==='book'?'':v;
}
function openChapter(id,sec){
  showView('book'); lastChapter=id;store.set('lastChapter',id);
  const target=sec?document.getElementById(sec):document.getElementById(id);
  if(target)setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'start'}),40);
  $$('.toc-link').forEach(a=>a.classList.toggle('active',a.dataset.ch===id&&!sec));
}
function flashEl(el){ if(!el)return; el.classList.remove('kg-flash'); void el.offsetWidth; el.classList.add('kg-flash');
  setTimeout(()=>el.classList.remove('kg-flash'),5000); }
function toast(msg){ const t=$('#toast'); if(!t)return; t.textContent=msg; t.classList.add('show');
  clearTimeout(toast._h); toast._h=setTimeout(()=>t.classList.remove('show'),1800); }
function closeSidebar(){sidebar.classList.remove('open');overlay.classList.remove('visible');}
$('#menu-toggle').onclick=()=>{const o=!sidebar.classList.contains('open');sidebar.classList.toggle('open',o);overlay.classList.toggle('visible',o);};
$('#toc-close').onclick=closeSidebar; overlay.onclick=closeSidebar;
/* hover-to-open sidebar (desktop only); pin toggle keeps it open like Obsidian's slide-out panels */
if(matchMedia('(hover:hover) and (min-width:900px)').matches&&sbPinned){
  let sbTimer=null;
  const menuBtn=$('#menu-toggle');
  const keepOpen=()=>{clearTimeout(sbTimer);sidebar.classList.add('open');overlay.classList.remove('visible');};
  const scheduleClose=()=>{clearTimeout(sbTimer);sbTimer=setTimeout(()=>{if(!sidebar.contains(document.activeElement))closeSidebar();},420);};
  [menuBtn,sidebar].forEach(el=>{el.addEventListener('mouseenter',keepOpen);el.addEventListener('mouseleave',scheduleClose);});
  document.addEventListener('mousemove',e=>{ if(e.clientX<=14)keepOpen(); });
}
$('#view-tabs').addEventListener('click',e=>{const b=e.target.closest('.vt-btn');if(!b)return;e.preventDefault();showView(b.dataset.viewbtn);});
tocList.addEventListener('click',e=>{
  const a=e.target.closest('a'); if(!a)return; e.preventDefault();
  if(a.dataset.ch)openChapter(a.dataset.ch);
  else if(a.dataset.jump){const id=a.dataset.jump;const cid=id.split('-')[0].replace(/fig\d+$/,'');openChapter(cid.startsWith('ch')?cid:lastChapter,id);}
  else if(a.dataset.viewbtn)showView(a.dataset.viewbtn.replace('-view',''));
});

/* ============================ SEARCH (book) ============================ */
const searchInput=$('#search-input'),searchResults=$('#search-results');
let selIdx=-1,lastResults=[];
function collectIndex(){
  const idx=[];
  chapters.forEach(ch=>{
    const chTitle=(ch.querySelector('h2')?.textContent||'').trim();
    let cur={title:chTitle,id:ch.id,ch:ch.id,body:ch};
    ch.querySelectorAll('h2,h3,p,li,td,caption,.caption').forEach(el=>{
      if(el.closest('.quiz')&&el.tagName!=='H4')return;
      if(el.tagName==='H3'&&el.id){cur={title:el.textContent.trim(),id:el.id,ch:ch.id,body:el};return;}
      const t=(el.textContent||'').trim(); if(t.length<3)return;
      idx.push({title:(el.tagName==='H3'?t:cur.title),ctx:t.slice(0,180),anchor:cur.id,ch:ch.id,el});
    });
  });
  return idx;
}
let INDEX=null;
function doSearch(q){
  if(!INDEX)INDEX=collectIndex();
  const ql=q.toLowerCase();
  const seen=new Set();
  return INDEX.filter(r=>{const k=r.ctx.slice(0,60);if(seen.has(k))return false;seen.add(k);return r.ctx.toLowerCase().includes(ql)||r.title.toLowerCase().includes(ql);}).slice(0,12);
}
function renderResults(q){
  if(!q){searchResults.classList.remove('open');clearMarks();return;}
  lastResults=doSearch(q);selIdx=-1;
  searchResults.innerHTML=lastResults.map((r,i)=>
    `<div class="result-item" data-i="${i}"><div class="result-title">${hlMark(r.title,q)}</div><div class="result-context">${hlMark(r.ctx,q)}</div></div>`).join('')
    ||'<div class="result-item">No matches</div>';
  searchResults.classList.add('open');
}
function hlMark(t,q){const i=t.toLowerCase().indexOf(q.toLowerCase());if(i<0)return esc(t);
  return esc(t.slice(Math.max(0,i-30),i))+'<mark>'+esc(t.slice(i,i+q.length))+'</mark>'+esc(t.slice(i+q.length,i+q.length+80));}
function clearMarks(){$$('#book-content mark.sr').forEach(m=>m.replaceWith(m.textContent));}
function gotoResult(i){
  const r=lastResults[i];if(!r)return;
  showView('book');searchResults.classList.remove('open');
  const anchor=document.getElementById(r.anchor)||document.getElementById(r.ch);
  if(anchor)anchor.scrollIntoView({behavior:'smooth',block:'start'});
  if(r.el&&r.el.tagName!=='H3'){setTimeout(()=>{r.el.querySelectorAll?0:0;
    const m=document.createRange();try{r.el.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){}},60);}
}
searchInput.addEventListener('input',()=>renderResults(searchInput.value.trim()));
searchInput.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();
    selIdx=Math.max(0,Math.min(lastResults.length-1,selIdx+(e.key==='ArrowDown'?1:-1)));
    $$('.result-item').forEach((el,i)=>el.classList.toggle('sel',i===selIdx));}
  else if(e.key==='Enter'){gotoResult(selIdx<0?0:selIdx);}
  else if(e.key==='Escape'){searchInput.blur();searchResults.classList.remove('open');}
});
searchResults.addEventListener('click',e=>{const it=e.target.closest('.result-item');if(it)gotoResult(+it.dataset.i);});
document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))searchResults.classList.remove('open');});

/* ============================ KNOWLEDGE GRAPH ============================ */
const Graph={built:false,nodes:[],links:[],svg:null,zoom:1,pan:{x:0,y:0},hidden:new Set(store.get('graphHidden',[])),selected:null,focusMode:false};
/* ---- book ↔ graph bidirectional linking ---- */
// concept nodes that anchor onto a specific book element (id like "ch3-hpi" -> section h3 id)
const CONCEPTS_BY_ANCHOR={},CONCEPTS_BY_CHAPTER={};
KG.nodes.forEach(n=>{
  if(n.type==='chapter')return;
  const m=/^(ch\d+[ab]?)-/.exec(n.id);
  if(m){(CONCEPTS_BY_ANCHOR[n.id]=CONCEPTS_BY_ANCHOR[n.id]||[]).push(n);}      // node id == section element id
  (CONCEPTS_BY_CHAPTER[n.ch]=CONCEPTS_BY_CHAPTER[n.ch]||[]).push(n);
});
// for every book element with an id, find related concept nodes (exact anchor first, chapter fallback)
function kgNodesForId(id,chId){
  if(CONCEPTS_BY_ANCHOR[id])return CONCEPTS_BY_ANCHOR[id];
  const list=(chId&&CONCEPTS_BY_CHAPTER[chId])||[];
  return list.filter(n=>n.type!=='section'&&n.type!=='figure').slice(0,4);
}
function hlKgIds(hlEl){
  if(!hlEl)return [];
  if(hlEl.dataset.kg!==undefined)return hlEl.dataset.kg.split(',').filter(Boolean);
  const ch=hlEl.closest('.chapter'); const chId=ch?ch.id:lastChapter;
  let secId=null;
  try{secId=sectionOf(hlEl);}catch(e){}
  const found=kgNodesForId(secId,chId);
  const ids=found.map(n=>n.id); hlEl.dataset.kg=ids.join(',');
  return ids;
}
function linkHlToKg(){ $$('#book-content .hl').forEach(el=>hlKgIds(el)); }
/* attach hover markers to section headings & figures so the map is reachable from the text */
function decorateBookWithKg(){
  $$('#book-content h3[id]').forEach(h3=>{
    const rel=kgNodesForId(h3.id,(h3.id.match(/^ch\d+[ab]?/)||[''])[0]);
    if(!rel.length)return;
    const mk=document.createElement('span');
    mk.className='kg-mark'; mk.dataset.kg=rel[0].id;
    mk.title='On the knowledge map: '+rel.map(n=>n.label).join(', ');
    h3.appendChild(mk);
  });
}
function shapeSVG(shape,x,y,r,fill,stroke,texId){
  let el='';
  if(shape==='circle')el=`<circle r="${r}" cx="0" cy="0"/>`;
  else if(shape==='rect')el=`<rect x="${-r*1.25}" y="${-r*0.8}" width="${r*2.5}" height="${r*1.6}" rx="4"/>`;
  else if(shape==='diamond')el=`<polygon points="0,${-r*1.15} ${r*1.15},0 0,${r*1.15} ${-r*1.15},0"/>`;
  else if(shape==='hex'){const pts=[];for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;pts.push(`${(r*1.1*Math.cos(a)).toFixed(1)},${(r*1.1*Math.sin(a)).toFixed(1)}`);}el=`<polygon points="${pts.join(' ')}"/>`;}
  else if(shape==='ring')el=`<circle r="${r}" cx="0" cy="0"/><circle r="${r*0.55}" cx="0" cy="0"/>`;
  return `<g transform="translate(${x},${y})" class="node-shape" fill="${fill}" stroke="${stroke}">${el}</g>`;
}
Graph.build=function(){
  Graph.built=true;
  const wrap=$('#graph-canvas-wrap'),svg=$('#graph-svg');Graph.svg=svg;
  const W=wrap.clientWidth||900,H=wrap.clientHeight||600;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  // defs: one texture pattern per node type
  const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
  let dtex='';
  for(const [t,cfg] of Object.entries(TYPES)){
    const kind=TEX_OF_SHAPE[cfg.shape];const ink=`oklch(48% 0.14 ${cfg.hue})`;const a=`oklch(30% 0.12 ${cfg.hue})`;
    let tile='';
    if(kind==='dots')tile=`<circle cx="3" cy="3" r="1.1" fill="${a}"/>`;
    else if(kind==='stripes')tile=`<path d="M-2,6 l8,-8 M0,10 l10,-10 M6,12 l6,-6" stroke="${a}" stroke-width="1.5"/>`;
    else if(kind==='grid')tile=`<path d="M0,3 h6 M3,0 v6" stroke="${a}" stroke-width="0.9"/>`;
    else if(kind==='cross')tile=`<path d="M0,0 l6,6 M6,0 l-6,6" stroke="${a}" stroke-width="1"/>`;
    else tile=`<circle cx="3" cy="3" r="2.1" fill="none" stroke="${a}" stroke-width="0.8"/>`;
    dtex+=`<pattern id="tex-${t}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${ink}"/>${tile}</pattern>`;
  }
  defs.innerHTML=dtex;svg.insertBefore(defs,svg.firstChild);
  // layout: chapters on a ring, satellites around their chapter
  const nodes=KG.nodes,links=KG.links;
  const chIds=nodes.filter(n=>n.type==='chapter').map(n=>n.id);
  const pos={};
  const R=Math.min(W,H)*0.36,cx=W/2,cy=H/2;
  chIds.forEach((id,i)=>{const a=2*Math.PI*i/chIds.length-Math.PI/2;pos[id]={x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)};});
  const sat={};nodes.forEach(n=>{if(n.type!=='chapter'){(sat[n.ch]=sat[n.ch]||[]).push(n.id);}});
  for(const [ch,list] of Object.entries(sat)){
    const p=pos[ch]||{x:cx,y:cy};const base=Math.atan2(p.y-cy,p.x-cx);
    const spread=Math.min(2.4,0.5+list.length*0.16);const rad=R*0.34+Math.min(list.length,14)*4;
    list.forEach((id,j)=>{const t=list.length===1?0:(j/(list.length-1))*2-1;
      const a=base+t*spread;pos[id]={x:p.x+rad*Math.cos(a)+(Math.random()-0.5)*14,y:p.y+rad*Math.sin(a)+(Math.random()-0.5)*14};});
  }
  // relax a little
  const arr=nodes.map(n=>({...n,...(pos[n.id]||{x:cx,y:cy})}));
  const byId={};arr.forEach(n=>byId[n.id]=n);
  for(let it=0;it<60;it++){
    for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){
      const a=arr[i],b=arr[j];let dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;
      if(d2<1){dx=Math.random();dy=Math.random();d2=1;}
      const minD=(a.type==='chapter'?110:46);
      if(d2<minD*minD){const d=Math.sqrt(d2),f=(minD-d)/d*0.18;a.x+=dx*f;a.y+=dy*f;b.x-=dx*f;b.y-=dy*f;}
    }
    links.forEach(([s,t])=>{const A=byId[s],B=byId[t];if(!A||!B)return;
      const dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy)||1;const ideal=A.type==='chapter'?150:96;const f=(d-ideal)/d*0.02;
      A.x+=dx*f;A.y+=dy*f;B.x-=dx*f;B.y-=dy*f;});
  }
  Graph.nodes=arr;Graph.byId=byId;
  // render
  const lg=$('#graph-links'),ng=$('#graph-nodes');
  lg.innerHTML=links.map(([s,t,r],i)=>{const A=byId[s],B=byId[t];if(!A||!B)return '';
    return `<line class="link" data-s="${s}" data-t="${t}" x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${B.x.toFixed(1)}" y2="${B.y.toFixed(1)}" stroke="var(--app-border)" stroke-width="1.2"/>`;}).join('');
  ng.innerHTML=arr.map(n=>{
    const cfg=TYPES[n.type]||TYPES.concept;const r=n.type==='chapter'?20:(n.type==='figure'?9:13);
    return `<g class="node" data-id="${n.id}" transform="translate(${n.x.toFixed(1)},${n.y.toFixed(1)})">`+
      shapeSVG(cfg.shape,0,0,r,`url(#tex-${n.type})`.replace(`tex-${n.type}`,`tex-${n.type}`),'var(--ts-'+n.type+')','')
      .replace('class="node-shape"',`class="node-shape" data-r="${r}"`)+
      `<text class="node-label" y="${r+13}">${esc(n.label.length>26?n.label.slice(0,24)+'…':n.label)}</text></g>`;
  }).join('');
  // type filter chips
  const tf=$('#graph-typefilters');
  tf.innerHTML=Object.entries(TYPES).filter(([t])=>arr.some(n=>n.type===t)).map(([t,cfg])=>
    `<span class="tf-chip${Graph.hidden.has(t)?' off':''}" data-type="${t}"><span class="tf-dot" style="background:oklch(70% 0.12 ${cfg.hue})"></span>${cfg.label}</span>`).join('');
  tf.querySelectorAll('.tf-chip').forEach(c=>c.onclick=()=>{const t=c.dataset.type;
    if(Graph.hidden.has(t))Graph.hidden.delete(t);else Graph.hidden.add(t);
    c.classList.toggle('off');store.set('graphHidden',[...Graph.hidden]);applyFilters();});
  bindGraphCanvas();applyGraphSearchUI();Graph.builtFlag=true;
};
function applyFilters(){
  const q=($('#graph-search').value||'').toLowerCase();
  $$('#graph-nodes .node').forEach(g=>{
    const n=Graph.byId[g.dataset.id];const hid=Graph.hidden.has(n.type);
    g.classList.toggle('hidden',hid);
    if(!hid&&q){const m=(n.label+' '+n.desc).toLowerCase().includes(q);g.classList.toggle('dimmed',!m);g.classList.toggle('match',m);}
    else{g.classList.remove('dimmed','match');}
  });
  $$('#graph-links .link').forEach(l=>{
    const s=Graph.byId[l.dataset.s],t=Graph.byId[l.dataset.t];
    l.classList.toggle('dimmed',Graph.hidden.has(s.type)||Graph.hidden.has(t.type)||(q&&!( (s.label+' '+s.desc).toLowerCase().includes(q)||(t.label+' '+t.desc).toLowerCase().includes(q))));
  });
  const cnt=$('#graph-match-count');
  if(q){const m=Graph.nodes.filter(n=>!Graph.hidden.has(n.type)&&(n.label+' '+n.desc).toLowerCase().includes(q)).length;cnt.textContent=m+' match'+(m===1?'':'es');}
  else cnt.textContent='';
}
Graph.focus=function(id){
  const nb=new Set([id]);
  KG.links.forEach(([a,b])=>{if(a===id)nb.add(b);if(b===id)nb.add(a);});
  $$('#graph-nodes .node').forEach(g=>g.classList.toggle('dimmed',!nb.has(g.dataset.id)));
  $$('#graph-links .link').forEach(l=>l.classList.toggle('dimmed',!(l.dataset.s===id||l.dataset.t===id)));
};
/* where a node lives in the book */
function nodeTarget(n){
  if(!n)return null;
  if(n.type==='chapter')return {ch:n.id,sec:null};
  if(n.type==='section')return {ch:n.ch,sec:n.id};
  if(n.type==='figure'){ // figure nodes are named <ch>-figN — jump to the chapter
    return {ch:n.ch,sec:null};
  }
  // concept nodes: anchor id (chX-...) is a real section when it exists
  const el=document.getElementById(n.id);
  if(el&&el.closest('.chapter'))return {ch:(el.closest('.chapter')||{}).id||n.ch,sec:n.id};
  return {ch:n.ch,sec:null};
}
function gotoNode(n){
  const t=nodeTarget(n); if(!t)return;
  closePeek(); $('#node-info').classList.remove('open');
  showView('book'); lastChapter=t.ch; store.set('lastChapter',t.ch);
  const target=(t.sec&&document.getElementById(t.sec))||document.getElementById(t.ch);
  if(target)setTimeout(()=>{target.scrollIntoView({behavior:'smooth',block:'start'});flashEl(target.querySelector?.('h2,h3')||target);},40);
  toast('📖 '+(n.label||''));
}
function nodeInfo(n){
  $('#node-info').classList.add('open');
  $('#ni-label').textContent=n.label;
  const cfg=TYPES[n.type]||TYPES.concept;
  const badge=$('#ni-type');badge.textContent=cfg.label;badge.style.borderColor=`oklch(60% 0.13 ${cfg.hue})`;badge.style.color=`oklch(60% 0.13 ${cfg.hue})`;
  $('#ni-desc').textContent=n.desc||'';
  const rel=KG.links.filter(([a,b])=>a===n.id||b===n.id).slice(0,6)
    .map(([a,b,r])=>{const other=a===n.id?b:a;return `${r} → ${(Graph.byId[other]||{label:other}).label}`;});
  $('#ni-links').innerHTML=rel.length?('<b>Links:</b> '+rel.map(esc).join(' · ')):'';
  Graph.selected=n;
  $('#ni-open-book').dataset.goto=n.id;
}
/* ---- hover peek card (Obsidian-style site preview of the map) ---- */
const peek=$('#graph-peek'); let peekTimer=null,peekPinned=false;
function positionPeek(el,rect){
  const w=el.offsetWidth||320,h=el.offsetHeight||180;
  let x=rect.left+rect.width/2-w/2,y=rect.bottom+10;
  x=Math.max(10,Math.min(x,innerWidth-w-10));
  if(y+h>innerHeight-10)y=Math.max(60,rect.top-h-10);
  el.style.left=x+'px'; el.style.top=y+'px';
}
function openPeek(nodeId,anchorRect,pin){
  const n=(Graph.byId&&Graph.byId[nodeId])||KG.nodes.find(x=>x.id===nodeId); if(!n)return;
  clearTimeout(peekTimer);
  $('#gp-title').textContent=n.label;
  const cfg=TYPES[n.type]||TYPES.concept;
  const b=$('#gp-type');b.textContent=cfg.label;b.style.borderColor=`oklch(60% 0.13 ${cfg.hue})`;b.style.color=`oklch(60% 0.13 ${cfg.hue})`;
  $('#gp-desc').textContent=n.desc||'';
  const rel=KG.links.filter(([a,b2])=>a===n.id||b2===n.id).slice(0,7)
    .map(([a,b2,r])=>{const other=a===n.id?b2:a;const o=(Graph.byId&&Graph.byId[other])||KG.nodes.find(x=>x.id===other)||{label:other,id:other};
      return `<span class="gp-chip" data-node="${o.id}" title="${esc(r)}">${esc(o.label||other)}</span>`;});
  $('#gp-rel').innerHTML=rel.join('')||'<span style="color:var(--app-muted);font-size:11.5px">no links</span>';
  peek.classList.add('open'); positionPeek(peek,anchorRect);
  if(pin!==undefined)peekPinned=pin;
}
function closePeek(){ if(peekPinned){peekPinned=false;} peek.classList.remove('open'); }
peek.addEventListener('mouseleave',()=>{clearTimeout(peekTimer);peekTimer=setTimeout(()=>{peekPinned=false;peek.classList.remove('open');},300);});
peek.addEventListener('mouseenter',()=>clearTimeout(peekTimer));
$('#gp-close').onclick=()=>{peekPinned=false;peek.classList.remove('open');};
$('#gp-full').onclick=e=>{e.preventDefault();const lbl=$('#gp-title').textContent;
  const n=KG.nodes.find(x=>x.label===lbl)||Graph.selected; peek.classList.remove('open');
  showView('graph'); if(n)setTimeout(()=>{nodeInfo(n);Graph.focus(n.id);},80);};
peek.addEventListener('click',e=>{const chip=e.target.closest('.gp-chip');if(chip){const nn=KG.nodes.find(x=>x.id===chip.dataset.node);if(nn)openPeek(nn.id,chip.getBoundingClientRect(),true);}});
/* book-side: hovering a concept marker opens the peek; clicking jumps straight into the map */
bookContent.addEventListener('mouseover',e=>{
  const mk=e.target.closest('.kg-mark'); if(!mk)return;
  clearTimeout(peekTimer);
  peekTimer=setTimeout(()=>openPeek(mk.dataset.kg,mk.getBoundingClientRect()),350);
});
bookContent.addEventListener('mouseout',e=>{
  if(e.target.closest&&e.target.closest('.kg-mark')){clearTimeout(peekTimer);peekTimer=setTimeout(closePeek,350);}
});
bookContent.addEventListener('click',e=>{
  const mk=e.target.closest('.kg-mark'); if(!mk)return;
  e.preventDefault(); e.stopPropagation(); suppressPopup=true;
  const nid=mk.dataset.kg;
  const n=(Graph.byId&&Graph.byId[nid])||KG.nodes.find(x=>x.id===nid);
  if(n){gotoNode(n);}
},true);
function bindGraphCanvas(){
  const svg=$('#graph-svg'),grp=$('#graph-transform-group');
  let drag=null;
  function setT(){grp.setAttribute('transform',`translate(${Graph.pan.x},${Graph.pan.y}) scale(${Graph.zoom})`);}
  Graph.setT=setT;
  /* smooth animated zoom toward a focal point (fixes clunky stepped zoom) */
  Graph.zoomTo=function(target,fxc,fyc){
    target=Math.max(0.3,Math.min(4,target));
    const z0=Graph.zoom,p0={...Graph.pan};
    const fx=fxc==null?svg.clientWidth/2:fxc, fy=fyc==null?svg.clientHeight/2:fyc;
    const wx=(fx-p0.x)/z0, wy=(fy-p0.y)/z0;              // world point under focus stays fixed
    const dur=160,t0=performance.now();
    (function step(now){
      const k=Math.min(1,(now-t0)/dur),ease=1-Math.pow(1-k,3);
      Graph.zoom=z0+(target-z0)*ease;
      Graph.pan={x:fx-wx*Graph.zoom,y:fy-wy*Graph.zoom};
      setT(); if(k<1)requestAnimationFrame(step);
    })(t0);
  };
  svg.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,px:Graph.pan.x,py:Graph.pan.y,moved:false};svg.classList.add('grabbing');});
  svg.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;Graph.pan.x=drag.px+dx;Graph.pan.y=drag.py+dy;setT();});
  addEventListener('pointerup',()=>{setTimeout(()=>{drag=null;},0);svg.classList.remove('grabbing');});
  svg.addEventListener('wheel',e=>{e.preventDefault();
    const r=svg.getBoundingClientRect();
    const factor=Math.exp(-e.deltaY*(e.deltaMode===1?0.02:0.0015));   // trackpad-smooth exponential zoom
    Graph.zoomTo(Graph.zoom*factor,e.clientX-r.left,e.clientY-r.top);},{passive:false});
  /* click a node → go there directly, no confirmation step */
  svg.addEventListener('click',e=>{
    const g=e.target.closest('.node'); if(!g)return;
    const n=Graph.byId[g.dataset.id]; if(!n)return;
    Graph.selected=n; nodeInfo(n); Graph.focus(n.id);
    if(drag&&drag.moved)return;
    gotoNode(n);                       // one click = navigate
  });
  $('#ni-close').onclick=()=>{$('#node-info').classList.remove('open');applyFilters();};
  $('#ni-open-book').onclick=e=>{gotoNode(Graph.byId[e.currentTarget.dataset.goto]);};
  $('#ni-focus').onclick=()=>Graph.focus(Graph.selected.id);
  $('#zoom-in').onclick=()=>Graph.zoomTo(Graph.zoom*1.35);
  $('#zoom-out').onclick=()=>Graph.zoomTo(Graph.zoom/1.35);
  $('#zoom-fit').onclick=()=>Graph.fit();
  $('#graph-reset').onclick=()=>{Graph.zoom=1;Graph.pan={x:0,y:0};setT();$('#graph-search').value='';$('#graph-search-clear').style.display='none';applyFilters();};
  Graph.fit=function(){const wrap=$('#graph-canvas-wrap');
    const xs=Graph.nodes.map(n=>n.x),ys=Graph.nodes.map(n=>n.y);
    const minX=Math.min(...xs)-60,maxX=Math.max(...xs)+60,minY=Math.min(...ys)-60,maxY=Math.max(...ys)+70;
    const sx=wrap.clientWidth/(maxX-minX),sy=wrap.clientHeight/(maxY-minY);
    Graph.zoom=Math.max(0.3,Math.min(2,Math.min(sx,sy)));
    Graph.pan={x:(wrap.clientWidth-(maxX+minX)*Graph.zoom)/2,y:(wrap.clientHeight-(maxY+minY)*Graph.zoom)/2};setT();};
}
function applyGraphSearchUI(){
  const inp=$('#graph-search');
  inp.addEventListener('input',()=>{$('#graph-search-clear').style.display=inp.value?'':'none';applyFilters();
    const q=inp.value.toLowerCase();const first=Graph.nodes.find(n=>!Graph.hidden.has(n.type)&&(n.label+' '+n.desc).toLowerCase().includes(q));
    if(first&&q){const wrap=$('#graph-canvas-wrap');
      Graph.zoom=Math.max(Graph.zoom,1);Graph.pan={x:wrap.clientWidth/2-first.x*Graph.zoom,y:wrap.clientHeight/2-first.y*Graph.zoom};Graph.setT();}});
  $('#graph-search-clear').onclick=()=>{inp.value='';$('#graph-search-clear').style.display='none';applyFilters();};
}

/* ============================ FLASHCARDS ============================ */
const FC={i:0,deck:DATA.flashcards.slice(),flipped:false};
function fcRender(){
  const c=FC.deck[FC.i];$('#fc-tag').textContent=c.tag||'';
  $('#fc-front').outerHTML=FC.flipped?`<div class="fc-back" id="fc-front">${esc(c.back)}</div>`:`<div class="fc-face" id="fc-front">${esc(c.front)}</div>`;
  $('#flash-progress').textContent=(FC.i+1)+' / '+FC.deck.length;
}
$('#flash-card').onclick=()=>{FC.flipped=!FC.flipped;fcRender();};
$('#next-card').onclick=()=>{FC.i=(FC.i+1)%FC.deck.length;FC.flipped=false;fcRender();};
$('#prev-card').onclick=()=>{FC.i=(FC.i-1+FC.deck.length)%FC.deck.length;FC.flipped=false;fcRender();};
$('#shuffle-cards').onclick=()=>{FC.deck.sort(()=>Math.random()-0.5);FC.i=0;FC.flipped=false;fcRender();};

/* ============================ MCQ PRACTICE ============================ */
const MCQ={ch:Object.keys(MCQS)[0]};
MCQ.renderNav=function(){
  const nav=$('#mcq-nav');nav.innerHTML='';
  Object.keys(MCQS).forEach(cid=>{
    const qs=MCQS[cid];const done=qs.reduce((n,_,i)=>n+(mcqState[cid+':'+i]!=null?1:0),0);
    const right=qs.reduce((n,_,i)=>{const p=mcqState[cid+':'+i];return n+(p!=null&&qs[i].a.includes(p)?1:0);},0);
    const b=document.createElement('button');b.className='mcq-chip'+(cid===MCQ.ch?' active':'');
    b.innerHTML=`${esc(CH_LABEL[cid]||cid)} <span class="chip-score">${done}/${qs.length}${done===qs.length?' · ✓'+right:''}</span>`;
    b.onclick=()=>{MCQ.ch=cid;MCQ.renderNav();MCQ.renderBook();};
    nav.appendChild(b);
  });
  MCQ.renderBook();
};
MCQ.renderBook=function(){
  const box=$('#mcq-book');box.innerHTML='';
  const cid=MCQ.ch,qs=MCQS[cid]||[];
  if(!qs.length){box.innerHTML='<p class="pv-sub">No practice questions for this chapter yet.</p>';return;}
  qs.forEach((q,i)=>{
    const picked=mcqState[cid+':'+i];
    const wrap=document.createElement('div');wrap.style.marginBottom='26px';
    let html=`<div style="font-weight:600;margin-bottom:8px">${i+1}. ${esc(q.q)}</div>`;
    q.opts.forEach((o,j)=>{
      let cls='mcq-opt';
      if(picked!=null){
        if(q.a.includes(j))cls+=' correct';
        else if(j===picked)cls+=' wrong';
        else cls+=' dim';
      }
      html+=`<button class="${cls}" data-q="${i}" data-o="${j}" ${picked!=null?'disabled':''}><span class="mcq-key">${'ABCD'[j]}.</span><span>${esc(o)}</span></button>`;
    });
    const showExp=picked!=null;
    const links=(q.links||[]).map(l=>{
      const el=document.getElementById(l);const title=el?el.textContent:l;
      return `<a class="mcq-link" data-goto="${l}" href="javascript:void 0">📚 Study: ${esc(title)}</a>`;}).join('');
    html+=`<div class="mcq-explain${showExp?' show':''}">${showExp?('<b>'+(q.a.includes(picked)?'Correct. ':'Not quite. ')+'</b>'+esc(q.why)+(links?`<div class="mcq-links">${links}</div>`:'')):''}</div>`;
    wrap.innerHTML=html;box.appendChild(wrap);
  });
  const foot=document.createElement('div');foot.className='mcq-foot';
  const total=qs.length,done=qs.reduce((n,_,i)=>n+(mcqState[cid+':'+i]!=null?1:0),0),
        right=qs.reduce((n,q,i)=>{const p=mcqState[cid+':'+i];return n+(p!=null&&q.a.includes(p)?1:0);},0);
  foot.innerHTML=`<span class="mcq-score">${right}/${total} correct · ${done}/${total} answered</span><button class="mcq-reset">Reset chapter</button>`;
  foot.querySelector('.mcq-reset').onclick=()=>{qs.forEach((_,i)=>delete mcqState[cid+':'+i]);store.set('mcq',mcqState);MCQ.renderNav();};
  box.appendChild(foot);
};
$('#mcq-book').addEventListener('click',e=>{
  const opt=e.target.closest('.mcq-opt');
  if(opt&&opt.disabled===false){const i=+opt.dataset.q,j=+opt.dataset.o;
    mcqState[MCQ.ch+':'+i]=j;store.set('mcq',mcqState);MCQ.renderNav();return;}
  const link=e.target.closest('.mcq-link');
  if(link){const id=link.dataset.goto;const el=document.getElementById(id);
    const cid=(id.match(/^ch\d+[ab]?/)||[''])[0];openChapter(cid||lastChapter,el?id:null);}
});

/* ============================ IN-BOOK QUIZZES (end of each chapter) ============================ */
(function initQuizzes(){
  $$('.quiz[data-ch]').forEach(box=>{
    const cid=box.dataset.ch,qs=MCQS[cid]||[];
    if(!qs.length)return;
    const lis=[...box.querySelectorAll(':scope > ol > li')];
    box.addEventListener('click',e=>{
      const opt=e.target.closest('li');if(!opt)return;
      const gopt=e.target.closest('.q-explain a.mcq-link');
      if(gopt){const id=gopt.dataset.goto;const el=document.getElementById(id);
        const cid2=(id.match(/^ch\d+[ab]?/)||[''])[0];openChapter(cid2||lastChapter,el?id:null);return;}
      const qLi=opt.parentElement.closest('li');if(!qLi)return;
      const qi=lis.indexOf(qLi);if(qi<0||qi>=qs.length)return;
      const oi=[...opt.parentElement.children].indexOf(opt);
      const key='book:'+cid+':'+qi;
      if(mcqState[key]!=null)return;                       // forgiving: answers lock once given
      mcqState[key]=oi;store.set('mcq',mcqState);
      const correct=qs[qi].a.includes(oi);
      opt.classList.add(correct?'q-opt-correct':'q-opt-wrong');
      if(!correct)qs[qi].a.forEach(ci=>{const c=qLi.querySelector('ol.options').children[ci];if(c)c.classList.add('q-opt-correct');});
      [...qLi.querySelectorAll('ol.options > li')].forEach(li=>{if(li!==opt&&!li.classList.contains('q-opt-correct'))li.classList.add('q-opt-dim');});
      let exp=qLi.querySelector('.q-explain');
      if(!exp){exp=document.createElement('div');exp.className='q-explain';qLi.appendChild(exp);}
      const links=(qs[qi].links||[]).map(l=>{const el=document.getElementById(l);
        return `<a class="mcq-link" data-goto="${l}" href="javascript:void 0">📚 Study: ${esc(el?el.textContent:l)}</a>`;}).join('');
      exp.innerHTML=`<b>${correct?'Correct ✓':'Not quite.'}</b> ${esc(qs[qi].why||'')}${links?`<span class="q-links">${links}</span>`:''}`;
      exp.classList.add('show');
      updateQuizScore(box,cid,qs);
    });
    restoreQuiz(box,cid,qs,lis);
    updateQuizScore(box,cid,qs);
  });
  function restoreQuiz(box,cid,qs,lis){
    qs.forEach((q,i)=>{const picked=mcqState['book:'+cid+':'+i];if(picked==null)return;
      const qLi=lis[i];if(!qLi)return;const opts=qLi.querySelector('ol.options');if(!opts)return;
      const chosen=opts.children[picked];
      if(chosen)chosen.classList.add(q.a.includes(picked)?'q-opt-correct':'q-opt-wrong');
      q.a.forEach(ci=>{const c=opts.children[ci];if(c)c.classList.add('q-opt-correct');});
      [...opts.children].forEach(li=>{if(!li.classList.contains('q-opt-correct')&&li!==chosen)li.classList.add('q-opt-dim');});
      let exp=qLi.querySelector('.q-explain');
      if(!exp){exp=document.createElement('div');exp.className='q-explain';qLi.appendChild(exp);}
      exp.innerHTML=`<b>${q.a.includes(picked)?'Correct ✓':'Not quite.'}</b> ${esc(q.why||'')}`;
      exp.classList.add('show');
    });
  }
  function updateQuizScore(box,cid,qs){
    let s=box.querySelector('.quiz-score');
    if(!s){s=document.createElement('div');s.className='quiz-score';box.appendChild(s);
      s.addEventListener('click',e=>{if(e.target.closest('.quiz-reset')){
        qs.forEach((_,i)=>delete mcqState['book:'+cid+':'+i]);store.set('mcq',mcqState);
        box.querySelectorAll('li').forEach(li=>li.classList.remove('q-opt-correct','q-opt-wrong','q-opt-dim'));
        box.querySelectorAll('.q-explain').forEach(x=>x.remove());updateQuizScore(box,cid,qs);}});}
    const done=qs.reduce((n,_,i)=>n+(mcqState['book:'+cid+':'+i]!=null?1:0),0);
    const right=qs.reduce((n,q,i)=>{const p=mcqState['book:'+cid+':'+i];return n+(p!=null&&q.a.includes(p)?1:0);},0);
    s.innerHTML=done?`<span>${right}/${qs.length} correct · ${done}/${qs.length} answered</span>`+
      (done===qs.length&&right<qs.length?' <em>Review the red ones above, then reset and try again.</em>':'')+
      `<button class="quiz-reset" type="button">Reset quiz</button>`:`<span>Tap an answer to check it instantly — progress saves automatically.</span><button class="quiz-reset" type="button">Reset quiz</button>`;
  }
})();

/* ============================ GLOSSARY ============================ */
function renderGlossary(filter){
  const list=$('#glossary-list');const f=(filter||'').toLowerCase();
  const entries=Object.entries(DATA.glossary).filter(([t,d])=>t.toLowerCase().includes(f)||d.toLowerCase().includes(f));
  list.innerHTML=entries.map(([t,d])=>`<div class="gloss-card"><div class="gloss-term">${esc(t)}</div><div class="gloss-def">${esc(d)}</div></div>`).join('')
   ||'<div class="np-empty">No matching terms.</div>';
}
$('#glossary-search').addEventListener('input',e=>renderGlossary(e.target.value));

/* ============================ THEME & SETTINGS ============================ */
function setTheme(t){document.documentElement.setAttribute('data-theme',t);store.set('theme',t);
  $('#theme-select').value=t;
  $('#theme-icon').innerHTML=t==='dark'?'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>'
    :'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>';}
$('#theme-toggle').onclick=()=>setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');
$('#theme-select').onchange=e=>setTheme(e.target.value);
function bindSlider(id,out,fmt,cb){const s=$(id),o=$(out);
  const upd=()=>{o.textContent=fmt(s.value);cb(s.value);store.set(id, s.value);};
  s.addEventListener('input',upd);const v=store.get(id,null);if(v!=null){s.value=v;}upd();}
bindSlider('#font-scale-slider','#font-scale-value',v=>Math.round(v*100)+'%',v=>document.documentElement.style.setProperty('--font-scale',v));
bindSlider('#line-spacing-slider','#line-spacing-value',v=>Number(v).toFixed(2),v=>document.documentElement.style.setProperty('--line-gap',v));
bindSlider('#letter-spacing-slider','#letter-spacing-value',v=>Number(v).toFixed(3)+'em',v=>document.documentElement.style.setProperty('--track',v));
$('#clear-all-data').onclick=()=>{if(confirm('Delete all highlights, notes and quiz progress?')){
  store.keys().forEach(k=>{try{localStorage.removeItem('scribe04_'+k);}catch(e){}});location.reload();}};
(function storageStatus(){let ok=true;try{store.set('_t',1);store.get('_t');localStorage.removeItem('scribe04__t');}catch(e){ok=false;}
  $('#storage-status').textContent=ok?'Saved locally in this browser ('+Object.keys(highlights).length+' highlights).':'Storage unavailable — bookmarks won\'t persist.';})();

/* ============================ SCRATCHPAD (always-available hover box) ============================ */
(function scratchpad(){
  const area=$('#scratchpad-area'),status=$('#scratchpad-status');
  const dock=$('#sp-dock'),panel=$('#sp-hover');
  if(!area||!dock||!panel)return;
  try{area.value=localStorage.getItem('scribe04_scratchpad')||'';}catch(e){}
  function syncBadge(){
    const has=area.value.trim().length>0;
    document.body.classList.toggle('has-scratch',has);
    const c=$('#sp-dock-count');
    c.textContent=has?(area.value.length>999?'999+':area.value.length):'';
    c.classList.toggle('show',has);
  }
  syncBadge();
  let timer=null;
  area.addEventListener('input',()=>{
    status.textContent='Saving…'; clearTimeout(timer);
    timer=setTimeout(()=>{try{localStorage.setItem('scribe04_scratchpad',area.value);
        status.textContent='Saved ✓ '+new Date().toLocaleTimeString();}
      catch(e){status.textContent='Could not save';}syncBadge();},350);
  });
  // hover the dock → panel appears; leave both → it fades away. Click pins it open.
  let hideT=null;
  const show=()=>{clearTimeout(hideT);panel.classList.add('hoverself');};
  const hideSoon=()=>{clearTimeout(hideT);hideT=setTimeout(()=>{
    if(!panel.classList.contains('pinned')&&!panel.contains(document.activeElement))panel.classList.remove('hoverself');},350);};
  [dock,panel].forEach(el=>{el.addEventListener('mouseenter',show);el.addEventListener('mouseleave',hideSoon);});
  dock.addEventListener('click',()=>{const p=panel.classList.toggle('pinned');if(p){show();area.focus();}});
  panel.addEventListener('focusin',()=>panel.classList.add('hoverself'));
  // expand → focus window (larger modal-ish pad); collapse returns to hover mode
  $('#sp-expand').onclick=()=>{const f=panel.classList.toggle('focused');$('#sp-expand').textContent=f?'⤡':'⤢';if(f)area.focus();};
  $('#scratchpad-clear').onclick=()=>{if(area.value&&!confirm('Clear the scratchpad?'))return;
    area.value='';try{localStorage.removeItem('scribe04_scratchpad');}catch(e){}status.textContent='Cleared ✓';syncBadge();area.focus();};
  addEventListener('keydown',e=>{ if(e.key==='Escape'&&panel.classList.contains('focused')){panel.classList.remove('focused');$('#sp-expand').textContent='⤢';} });
})();

/* ============================ FOCUS READING MODE + STUDY TIMER ============================ */
(function focusAndTimer(){
  /* focus mode: dim everything but the paragraph under the cursor / current scroll center */
  const focusBtn=$('#focus-toggle');
  let focusOn=store.get('focusMode',false);
  function markActive(){
    if(!focusOn)return;
    const els=$$('#book-content .paper > *, #book-content .chapter > p, #book-content .chapter > ul, #book-content .chapter > h2, #book-content .chapter > h3');
    let best=null,bestD=1e9;const mid=innerHeight*0.42;
    for(const el of els){const r=el.getBoundingClientRect();if(r.bottom<60||r.top>innerHeight-60)continue;
      const d=Math.abs((r.top+r.bottom)/2-mid);if(d<bestD){bestD=d;best=el;}}
    $$('.fm-active').forEach(x=>x.classList.remove('fm-active'));
    if(best)best.classList.add('fm-active');
  }
  function applyFocus(){document.body.classList.toggle('focus-mode',focusOn);
    focusBtn.classList.toggle('active',focusOn);store.set('focusMode',focusOn);markActive();}
  focusBtn.onclick=()=>{focusOn=!focusOn;applyFocus();};
  addEventListener('scroll',markActive,{passive:true});

  /* study timer: page time (auto, while book view active) + manual session stopwatch */
  const playBtn=$('#timer-play'),readEl=$('#timer-read'),sesEl=$('#timer-session'),wrapEl=$('#study-timer');
  const PLAY='<path d="M8 5v14l11-7z"/>',PAUSE='<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>';
  const fmt=s=>{s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),ss=s%60;
    return (h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(ss).padStart(2,'0');};
  let readSecs=store.get('readSecs',0),lastReadTick=Date.now();
  let sesSecs=store.get('sesSecs',0),sesRunning=store.get('sesRunning',false),sesT0=Date.now();
  readEl.textContent=fmt(readSecs); sesEl.textContent=fmt(sesSecs);
  wrapEl.classList.toggle('running',sesRunning);
  playBtn.querySelector('svg').innerHTML=sesRunning?PAUSE:PLAY;
  playBtn.onclick=()=>{sesRunning=!sesRunning;
    if(sesRunning)sesT0=Date.now(); else sesSecs=Math.round(performance.now()/1000)*0+sesSecs+(Date.now()-sesT0)/1000;
    wrapEl.classList.toggle('running',sesRunning);playBtn.querySelector('svg').innerHTML=sesRunning?PAUSE:PLAY;
    store.set('sesRunning',sesRunning);store.set('sesSecs',Math.floor(sesSecs));
    toast(sesRunning?'Study session started ⏱':'Study session paused');};
  wrapEl.addEventListener('dblclick',()=>{readSecs=0;sesSecs=0;sesRunning=false;sesT0=Date.now();
    store.set('readSecs',0);store.set('sesSecs',0);store.set('sesRunning',false);
    wrapEl.classList.remove('running');playBtn.querySelector('svg').innerHTML=PLAY;
    readEl.textContent='00:00';sesEl.textContent='00:00';toast('Timer reset');});
  setInterval(()=>{
    const now=Date.now();
    if($('#book-view').classList.contains('active')){readSecs+=Math.min(5,(now-lastReadTick)/1000);}
    lastReadTick=now;
    readEl.textContent=fmt(readSecs);
    if(sesRunning)sesEl.textContent=fmt(sesSecs+(now-sesT0)/1000);
    store.set('readSecs',Math.floor(readSecs));
  },1000);
  document.addEventListener('visibilitychange',()=>{ if(!sesRunning){sesT0=Date.now();} lastReadTick=Date.now(); });
})();

/* ============================ KEYBOARD ============================ */
addEventListener('keydown',e=>{
  const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchInput.focus();searchInput.select();return;}
  if(typing)return;
  if(e.key==='['||e.key===']'){
    const ids=chapters.map(c=>c.id);let i=ids.indexOf(lastChapter);
    i=(e.key===']'?i+1:i-1+ids.length)%ids.length;openChapter(ids[i]);}
  if(e.key==='Escape'){hidePopup();closeSidebar();notesPanel.classList.remove('open');searchResults.classList.remove('open');$('#node-info').classList.remove('open');}
  if($('#flashcards-view').classList.contains('active')){
    if(e.key===' '){e.preventDefault();FC.flipped=!FC.flipped;fcRender();}
    if(e.key==='ArrowRight')$('#next-card').click();if(e.key==='ArrowLeft')$('#prev-card').click();}
});

/* ============================ INIT ============================ */
buildTOC();
restoreHighlights();
updateNotesBadge();
fcRender();
renderGlossary('');
setTheme(store.get('theme',matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
const initial=location.hash.replace('#','');
if(['graph','flashcards','mcq','glossary','scratchpad','settings'].includes(initial))showView(initial);
else openChapter(lastChapter);
addEventListener('hashchange',()=>{const v=location.hash.replace('#','');
  if(['graph','flashcards','mcq','glossary','scratchpad','settings'].includes(v))showView(v);});
})();
