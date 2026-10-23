# -*- coding: utf-8 -*-
"""v0.4 book styles: paper texture, dark-mode everything, textured highlights."""

CSS = """
*{box-sizing:border-box}
html{scroll-behavior:smooth; scroll-padding-top:calc(var(--topbar-h) + 16px)}
body{margin:0;background:var(--app-bg);color:var(--app-text);
 font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
 font-size:calc(15px * var(--font-scale));line-height:1.5;-webkit-font-smoothing:antialiased}
/* fine grain texture on every surface — light and dark */
body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.5;
 background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.42 0 0 0 0 0.35 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E")}
[data-theme="dark"] body::before{opacity:.9;
 background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.75 0 0 0 0 0.8 0 0 0 0 0.9 0 0 0 0.045 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E")}
button{font-family:inherit;font-size:inherit;color:inherit}
input,select{font-family:inherit;font-size:inherit}
::selection{background:var(--hl-blue-soft);color:var(--ink)}

/* ---------- top bar ---------- */
.topbar{position:sticky;top:0;z-index:100;height:var(--topbar-h);display:flex;align-items:center;gap:10px;
 padding:0 14px;background:var(--app-panel);border-bottom:1px solid var(--app-border);box-shadow:0 1px 0 oklch(0% 0 0/.03)}
.icon-btn{width:36px;height:36px;border-radius:9px;border:1px solid transparent;background:transparent;
 display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex:none}
.icon-btn:hover{background:var(--app-accent-soft);border-color:var(--app-border)}
.icon-btn svg{width:20px;height:20px;display:block;stroke:currentColor}
.search-wrap{flex:1;max-width:560px;margin:0 auto;position:relative}
.search-wrap svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);width:17px;height:17px;stroke:var(--app-muted);pointer-events:none}
#search-input{width:100%;padding:9px 66px 9px 36px;border-radius:10px;border:1px solid var(--app-border);
 background:var(--app-bg);color:var(--app-text);outline:none}
#search-input:focus{border-color:var(--app-accent);box-shadow:0 0 0 3px oklch(46% 0.13 256/.18)}
#search-shortcut{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;color:var(--app-muted);
 border:1px solid var(--app-border);border-radius:5px;padding:1px 6px;background:var(--app-panel);pointer-events:none}
.results-pop{position:absolute;top:calc(100% + 8px);left:0;right:0;max-height:min(60vh,480px);overflow-y:auto;
 background:var(--app-panel);border:1px solid var(--app-border);border-radius:12px;box-shadow:var(--shadow);display:none;z-index:200;padding:6px}
.results-pop.open{display:block}
.result-item{padding:9px 12px;border-radius:8px;cursor:pointer;border-left:3px solid transparent}
.result-item.sel{background:var(--app-accent-soft);border-left-color:var(--app-accent)}
.result-title{font-weight:600}.result-context{font-size:12px;color:var(--app-muted);margin-top:2px}
mark{background:var(--warn-soft);color:inherit;padding:0 1px;border-radius:3px}
.progress-bar{position:absolute;left:0;bottom:-1px;height:3px;width:0;background:linear-gradient(90deg,var(--app-accent),var(--accent));transition:width .15s}

/* ---------- sidebar / TOC ---------- */
.sidebar{position:fixed;top:var(--topbar-h);left:0;bottom:0;width:280px;z-index:90;
 background:var(--app-sidebar);border-right:1px solid var(--app-border);overflow-y:auto;
 transform:translateX(-100%);transition:transform .2s ease}
.sidebar.open{transform:translateX(0)}
.toc-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--app-border)}
.toc-title{font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:.08em;color:var(--app-muted)}
.toc-close{background:none;border:none;font-size:20px;line-height:1;cursor:pointer;color:var(--app-muted);padding:2px 8px;border-radius:6px}
.toc-close:hover{background:var(--app-accent-soft)}
.toc-list,.toc-sublist{list-style:none;margin:0;padding:6px}
.toc-sublist{padding:0 6px 6px 10px}
.toc-link{display:block;padding:8px 10px;border-radius:8px;text-decoration:none;color:var(--app-text);font-size:14px;cursor:pointer;border-left:3px solid transparent}
.toc-link:hover{background:var(--app-accent-soft)}
.toc-link.active{background:var(--app-accent-soft);border-left-color:var(--app-accent);font-weight:600}
.toc-chapter-label{display:flex;align-items:center;gap:8px}
.toc-num{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:20px;border-radius:6px;
 background:var(--app-accent-soft);color:var(--app-accent);font-size:11px;font-weight:700;padding:0 5px}
.toc-section-link{font-size:13px;color:var(--app-muted);padding:6px 10px 6px 14px}
.toc-section-link:hover{color:var(--app-text)}
.overlay{position:fixed;inset:var(--topbar-h) 0 0 0;background:oklch(0% 0 0/.35);z-index:85;opacity:0;visibility:hidden;transition:opacity .2s}
.overlay.visible{opacity:1;visibility:visible}

/* ---------- views ---------- */
.view{display:none;position:relative;z-index:1}
.view.active{display:block}
#book-view.active{display:flex}
.book-container{flex:1;min-width:0;display:flex;justify-content:center;padding:26px 18px 90px}
.paper{max-width:860px;width:100%;background:var(--bg);color:var(--ink);border:1px solid var(--rule);border-radius:14px;
 box-shadow:0 10px 34px oklch(0% 0 0/.10);padding:clamp(22px,4.5vw,52px);position:relative}
[data-theme="dark"] .paper{box-shadow:0 10px 34px oklch(0% 0 0/.5);border-color:var(--rule)}

/* ---------- book typography ---------- */
.paper h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(1.9rem,4vw,2.5rem);line-height:1.15;
 letter-spacing:-.01em;margin:.2em 0 .8em;text-align:center;color:var(--primary)}
.paper h2{font-family:Georgia,serif;font-size:calc(1.45rem * var(--font-scale));margin:2.2em 0 .7em;padding-bottom:.25em;
 border-bottom:2px solid var(--primary);color:var(--primary)}
.paper h3{font-family:Georgia,serif;font-size:calc(1.12rem * var(--font-scale));margin:1.7em 0 .5em;color:var(--primary)}
.paper p{margin:.7em 0;line-height:var(--line-gap);letter-spacing:var(--track)}
.paper ul,.paper ol{margin:.7em 0;padding-left:1.6em;line-height:var(--line-gap)}
.paper li{margin:.3em 0}
.paper a{color:var(--app-accent)}
.paper b,.paper strong{color:var(--primary)}
hr{border:none;border-top:1px solid var(--rule);margin:2em 0}
.chapter{margin-bottom:3.2rem}
.page-break{page-break-before:always}

/* ---------- tables ---------- */
table{border-collapse:collapse;width:100%;margin:1.2em 0;font-size:calc(.95em * var(--font-scale))}
th{background:var(--table-header);color:oklch(98% 0.005 95);padding:9px 12px;text-align:left;font-weight:600}
td{padding:8px 12px;border-bottom:1px solid var(--rule);vertical-align:top;color:var(--ink);background:var(--bg)}
tr:nth-child(even) td{background:var(--table-alt)}
[data-theme="dark"] td,[data-theme="dark"] tr:nth-child(even) td{color:var(--ink)}
.table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--rule);border-radius:10px;padding:2px 6px;background:var(--bg)}
.table-scroll table{border:0;margin:.4em 0}
@media(max-width:760px){ th,td{padding:6px 8px;font-size:.88em} }

/* ---------- examples / callouts ---------- */
.example-block{background:var(--example-bg);border-left:4px solid var(--accent);border-radius:0 10px 10px 0;
 padding:14px 18px;margin:1.2em 0;position:relative}
.example-block::after{content:"";position:absolute;inset:0;border-radius:0 10px 10px 0;pointer-events:none;
 background-image:repeating-linear-gradient(135deg,oklch(51.8% 0.156 29.2/.05) 0 6px,transparent 6px 12px)}
.example-block p{margin:.35em 0}
.example-block ol,.example-block ul{margin:.35em 0}
.example-label{display:inline-block;background:var(--accent);color:oklch(99% 0.004 95);font-size:11px;font-weight:700;
 letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;border-radius:6px;margin-bottom:8px}
.callout{background:var(--callout-bg);border-left:4px solid var(--warn);border-radius:0 10px 10px 0;padding:12px 16px;margin:1.1em 0}
.callout b{color:var(--warn)}

/* ---------- figures ---------- */
.figure{margin:1.4em 0;text-align:center}
.figure img{max-width:100%;height:auto;border-radius:8px;border:1px solid var(--rule);background:var(--panel)}
.img-placeholder{border:2px dashed var(--rule);background:repeating-linear-gradient(45deg,var(--example-bg) 0 12px,var(--bg) 12px 24px);
 min-height:150px;display:flex;align-items:center;justify-content:center;color:var(--ink-soft);border-radius:8px;padding:14px;font-size:.9em}
.caption{font-size:.85em;color:var(--ink-soft);margin-top:8px;font-style:italic}

/* ---------- quiz blocks in book ---------- */
.quiz{background:var(--quiz-bg);border:1px solid var(--rule);border-radius:12px;padding:18px 22px;margin:2em 0;position:relative}
.quiz::before{content:"";position:absolute;inset:0;border-radius:12px;pointer-events:none;
 background-image:radial-gradient(oklch(52% 0.012 256/.10) 1px,transparent 1.4px);background-size:14px 14px}
.quiz h4{margin:.2em 0 1em;font-family:Georgia,serif;font-size:1.15em;color:var(--primary)}
.quiz ol{padding-left:1.3em}
.quiz > ol > li{margin-bottom:1.15em;line-height:1.55}
.quiz .options{list-style:upper-alpha;margin:.4em 0 0;padding-left:1.5em}
.quiz .options li{margin:.15em 0}

/* ---------- interactive MCQ mode ---------- */
.mcq-opt{display:flex;align-items:flex-start;gap:10px;width:100%;text-align:left;background:var(--bg);
 border:1px solid var(--rule);border-radius:9px;padding:9px 12px;margin:6px 0;cursor:pointer;transition:transform .08s;position:relative;z-index:1}
.mcq-opt:hover:not(:disabled){border-color:var(--app-accent);transform:translateX(3px)}
.mcq-opt .mcq-key{font-weight:700;color:var(--app-muted);flex:none}
.mcq-opt.correct{border-color:var(--ok);background:var(--ok-soft)}
.mcq-opt.correct .mcq-key{color:var(--ok)}
.mcq-opt.wrong{border-color:var(--warn);background:var(--warn-soft)}
.mcq-opt.dim{opacity:.55}
.mcq-opt:disabled{cursor:default}
.mcq-explain{display:none;margin:8px 0 2px;padding:10px 12px;border-radius:8px;background:var(--example-bg);
 border-left:3px solid var(--app-accent);font-size:.92em;position:relative;z-index:1}
.mcq-explain.show{display:block}
.mcq-links{margin-top:7px;display:flex;flex-wrap:wrap;gap:6px}
.mcq-link{font-size:12px;padding:4px 10px;border-radius:999px;border:1px solid var(--app-border);background:var(--app-panel);
 color:var(--app-accent);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:5px}
.mcq-link:hover{background:var(--app-accent-soft)}
.mcq-foot{display:flex;align-items:center;gap:14px;margin-top:14px;flex-wrap:wrap;position:relative;z-index:1}
.mcq-score{font-weight:700;color:var(--app-muted);font-size:13px}
.mcq-reset{font-size:13px;padding:5px 12px;border-radius:8px;border:1px solid var(--app-border);background:var(--app-panel);cursor:pointer}
.mcq-reset:hover{background:var(--app-accent-soft)}

/* ---------- highlights: texture + tint + stripe ---------- */
.hl-yellow,.hl-green,.hl-blue,.hl-pink{padding:.06em .3em;border-radius:.32em;box-decoration-break:clone;-webkit-box-decoration-break:clone;cursor:pointer}
.hl-yellow{background-color:var(--hl-yellow-soft);color:var(--hl-yellow-ink);
 background-image:repeating-linear-gradient(45deg,oklch(55% 0.13 95/.16) 0 2px,transparent 2px 6px);
 border-bottom:2px solid var(--hl-yellow-ink)}
.hl-green{background-color:var(--hl-green-soft);color:var(--hl-green-ink);
 background-image:radial-gradient(oklch(50% 0.13 152/.28) 1px,transparent 1.6px);background-size:7px 7px;
 border-bottom:2px dotted var(--hl-green-ink)}
.hl-blue{background-color:var(--hl-blue-soft);color:var(--hl-blue-ink);
 background-image:linear-gradient(oklch(52% 0.13 255/.14) 1px,transparent 1px),linear-gradient(90deg,oklch(52% 0.13 255/.14) 1px,transparent 1px);
 background-size:7px 7px;border-bottom:2px solid var(--hl-blue-ink)}
.hl-pink{background-color:var(--hl-pink-soft);color:var(--hl-pink-ink);
 background-image:repeating-linear-gradient(-45deg,oklch(55% 0.16 10/.15) 0 3px,transparent 3px 8px);
 border-bottom:2px dashed var(--hl-pink-ink)}
[data-theme="dark"] .hl-yellow{background-image:repeating-linear-gradient(45deg,oklch(82% 0.11 95/.13) 0 2px,transparent 2px 6px)}
[data-theme="dark"] .hl-green{background-image:radial-gradient(oklch(80% 0.11 152/.22) 1px,transparent 1.6px)}
[data-theme="dark"] .hl-blue{background-image:linear-gradient(oklch(80% 0.1 255/.12) 1px,transparent 1px),linear-gradient(90deg,oklch(80% 0.1 255/.12) 1px,transparent 1px)}
[data-theme="dark"] .hl-pink{background-image:repeating-linear-gradient(-45deg,oklch(80% 0.12 10/.13) 0 3px,transparent 3px 8px)}
.hl-current{outline:2px solid currentColor;outline-offset:1px}

/* ---------- popup menu (roomy, textured swatches) ---------- */
.popup-menu{position:absolute;z-index:1000;background:var(--app-panel);border:1px solid var(--app-border);
 border-radius:14px;box-shadow:var(--shadow);padding:10px;display:none;min-width:236px}
.popup-menu.open{display:block}
.pm-row{display:flex;gap:8px;padding:4px 2px;flex-wrap:nowrap}
.pm-swatch{flex:1;min-width:44px;height:40px;border-radius:9px;border:1px solid var(--app-border);cursor:pointer;position:relative;padding:0}
.pm-swatch:hover{transform:scale(1.06)}
.pm-swatch[data-color="yellow"]{background-color:var(--hl-yellow-soft);background-image:repeating-linear-gradient(45deg,oklch(55% 0.13 95/.35) 0 2px,transparent 2px 6px)}
.pm-swatch[data-color="green"]{background-color:var(--hl-green-soft);background-image:radial-gradient(oklch(50% 0.13 152/.45) 1.2px,transparent 1.8px);background-size:7px 7px}
.pm-swatch[data-color="blue"]{background-color:var(--hl-blue-soft);background-image:linear-gradient(oklch(52% 0.13 255/.3) 1px,transparent 1px),linear-gradient(90deg,oklch(52% 0.13 255/.3) 1px,transparent 1px);background-size:7px 7px}
.pm-swatch[data-color="pink"]{background-color:var(--hl-pink-soft);background-image:repeating-linear-gradient(-45deg,oklch(55% 0.16 10/.35) 0 3px,transparent 3px 8px)}
.pm-swatch .pm-name{position:absolute;bottom:2px;left:0;right:0;font-size:9px;font-weight:700;color:var(--ink-soft);text-align:center}
.pm-note{display:flex;align-items:center;gap:7px;width:100%;text-align:left;background:var(--example-bg);border:1px solid var(--rule);
 border-radius:9px;padding:8px 10px;margin-top:6px;cursor:pointer;font-size:13px}
.pm-note:hover{border-color:var(--app-accent)}
.pm-note i{width:10px;height:10px;border-radius:3px;background:var(--warn);flex:none;transform:rotate(45deg)}
.pm-danger{width:100%;margin-top:6px;padding:8px;border-radius:9px;border:1px solid var(--rule);background:var(--bg);cursor:pointer;font-size:13px;color:var(--accent)}
.pm-danger:hover{background:var(--warn-soft);border-color:var(--warn)}
.pm-divider{height:1px;background:var(--app-border);margin:8px 0}
.pm-count{font-size:11px;color:var(--app-muted);padding:2px 4px}

/* ---------- notes panel ---------- */
.notes-panel{position:fixed;top:var(--topbar-h);right:0;bottom:0;width:min(380px,92vw);z-index:95;background:var(--app-panel);
 border-left:1px solid var(--app-border);box-shadow:var(--shadow);transform:translateX(100%);transition:transform .2s ease;
 overflow-y:auto;padding:16px}
.notes-panel.open{transform:translateX(0)}
.np-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.np-title{font-weight:700;font-size:15px}
.note-card{border:1px solid var(--rule);border-radius:10px;padding:10px 12px;margin-bottom:10px;background:var(--bg)}
.note-quote{font-size:13px;font-style:italic;color:var(--ink-soft);border-left:3px solid var(--warn);padding-left:8px;margin-bottom:6px;
 display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.note-meta{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--app-muted)}
.note-jump{margin-left:auto;font-size:12px;padding:3px 9px;border-radius:7px;border:1px solid var(--app-border);background:var(--app-panel);cursor:pointer;color:var(--app-accent)}
.note-jump:hover{background:var(--app-accent-soft)}
.note-del{border:none;background:none;color:var(--app-muted);cursor:pointer;font-size:14px;padding:2px 6px;border-radius:6px}
.note-del:hover{color:var(--accent);background:var(--warn-soft)}
.np-empty{color:var(--app-muted);font-size:13px;text-align:center;padding:30px 10px}

/* ---------- graph view ---------- */
.graph-toolbar{display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--app-panel);border-bottom:1px solid var(--app-border);flex-wrap:wrap}
.graph-search{position:relative;flex:1;max-width:420px}
.graph-search input{width:100%;padding:9px 34px 9px 34px;border-radius:10px;border:1px solid var(--app-border);background:var(--app-bg);color:var(--app-text);outline:none}
.graph-search input:focus{border-color:var(--app-accent);box-shadow:0 0 0 3px oklch(46% 0.13 256/.18)}
.graph-search .gs-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:16px;height:16px;stroke:var(--app-muted)}
.graph-search .gs-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;color:var(--app-muted);cursor:pointer;font-size:16px;display:none}
.gs-count{font-size:12px;color:var(--app-muted);white-space:nowrap}
.graph-typefilters{display:flex;gap:6px;flex-wrap:wrap}
.tf-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:5px 10px;border-radius:999px;border:1px solid var(--app-border);
 background:var(--app-panel);cursor:pointer;user-select:none;color:var(--app-text)}
.tf-chip .tf-dot{width:11px;height:11px;flex:none;border:1px solid oklch(0% 0 0/.25)}
.tf-chip.off{opacity:.4;filter:saturate(.2)}
.graph-canvas-wrap{position:relative;height:calc(100vh - var(--topbar-h) - 132px);min-height:420px;background:var(--app-bg);overflow:hidden}
.graph-svg{width:100%;height:100%;display:block;cursor:grab}
.graph-svg.grabbing{cursor:grabbing}
.node-shape{stroke-width:1.6;cursor:pointer}
.node-label{font-size:10.5px;fill:var(--app-text);pointer-events:none;text-anchor:middle;paint-order:stroke;
 stroke:var(--app-bg);stroke-width:3px;stroke-linejoin:round}
.node.hidden{display:none}
.link.dimmed{opacity:.08}.node.dimmed{opacity:.15}
.node.match .node-shape{stroke-width:3}
.graph-controls{position:absolute;right:14px;bottom:14px;display:flex;flex-direction:column;gap:6px}
.graph-controls button{width:38px;height:38px;border-radius:9px;border:1px solid var(--app-border);background:var(--app-panel);cursor:pointer;font-size:17px;color:var(--app-text)}
.graph-controls button:hover{background:var(--app-accent-soft)}
.node-info{position:absolute;left:14px;bottom:14px;max-width:min(420px,80%);background:var(--app-panel);border:1px solid var(--app-border);
 border-radius:12px;box-shadow:var(--shadow);padding:14px 16px;display:none;z-index:5}
.node-info.open{display:block}
.ni-title{font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ni-badge{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:999px;border:1px solid var(--app-border)}
.ni-desc{font-size:13px;color:var(--app-muted);margin:8px 0;line-height:1.5}
.ni-links{font-size:12.5px;margin-bottom:10px;color:var(--app-text)}
.ni-btns{display:flex;gap:8px;flex-wrap:wrap}
.ni-btn{font-size:13px;padding:7px 13px;border-radius:9px;border:1px solid var(--app-border);background:var(--app-bg);cursor:pointer;color:var(--app-text)}
.ni-btn.primary{background:var(--app-accent);color:oklch(99% 0.004 95);border-color:var(--app-accent)}
.ni-btn:hover{filter:brightness(1.06)}
.ni-close{position:absolute;top:8px;right:10px;border:none;background:none;font-size:18px;cursor:pointer;color:var(--app-muted)}

/* ---------- other panels ---------- */
.panel-view{max-width:1060px;margin:0 auto;padding:26px 18px 80px}
.pv-title{font-family:Georgia,serif;font-size:1.7rem;color:var(--primary);margin:0 0 6px}
.pv-sub{color:var(--app-muted);margin:0 0 22px;font-size:14px}
.flash-wrap{max-width:640px;margin:0 auto}
.flash-card{background:var(--app-panel);border:1px solid var(--app-border);border-radius:16px;box-shadow:var(--shadow);
 min-height:260px;display:flex;align-items:center;justify-content:center;padding:30px;cursor:pointer;position:relative;text-align:center}
.flash-card .fc-face{font-size:1.25rem;line-height:1.5;color:var(--app-text)}
.flash-card .fc-back{font-size:1.05rem;color:var(--ink);background:var(--example-bg);border-radius:10px;padding:16px 18px;text-align:left}
.fc-tag{position:absolute;top:12px;left:14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--app-accent)}
.fc-hint{position:absolute;bottom:10px;right:16px;font-size:11px;color:var(--app-muted)}
.flash-nav{display:flex;justify-content:center;gap:10px;margin-top:16px;align-items:center}
.flash-nav button{padding:8px 16px;border-radius:9px;border:1px solid var(--app-border);background:var(--app-panel);cursor:pointer;color:var(--app-text)}
.flash-nav button:hover{background:var(--app-accent-soft)}
.flash-progress{font-size:13px;color:var(--app-muted);min-width:70px;text-align:center}
.gloss-search{width:100%;max-width:420px;padding:9px 14px;border-radius:10px;border:1px solid var(--app-border);background:var(--app-panel);color:var(--app-text);outline:none;margin-bottom:18px}
.gloss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.gloss-card{background:var(--app-panel);border:1px solid var(--app-border);border-radius:12px;padding:14px 16px}
.gloss-term{font-weight:700;color:var(--primary);margin-bottom:4px}
.gloss-def{font-size:13.5px;color:var(--app-muted);line-height:1.55}
.mcq-nav{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px}
.mcq-chip{padding:7px 14px;border-radius:999px;border:1px solid var(--app-border);background:var(--app-panel);cursor:pointer;font-size:13px;color:var(--app-text)}
.mcq-chip.active{background:var(--app-accent);color:oklch(99% 0.004 95);border-color:var(--app-accent)}
.mcq-chip .chip-score{opacity:.75;font-size:11px;margin-left:5px}
.mcq-book{background:var(--app-panel);border:1px solid var(--app-border);border-radius:16px;padding:22px clamp(14px,3vw,28px)}
.settings-group{background:var(--app-panel);border:1px solid var(--app-border);border-radius:14px;padding:18px 20px;margin-bottom:16px;max-width:640px}
.sg-title{font-weight:700;margin:0 0 14px;color:var(--primary)}
.sg-row{display:flex;align-items:center;gap:14px;margin:10px 0;flex-wrap:wrap}
.sg-row label{min-width:150px;font-size:14px}
.sg-row output{font-size:13px;color:var(--app-muted);min-width:56px}
input[type=range]{flex:1;accent-color:var(--app-accent)}
select{padding:7px 10px;border-radius:8px;border:1px solid var(--app-border);background:var(--app-bg);color:var(--app-text)}
.danger-btn{padding:8px 14px;border-radius:9px;border:1px solid var(--accent);background:transparent;color:var(--accent);cursor:pointer}
.danger-btn:hover{background:var(--warn-soft)}
kbd{border:1px solid var(--app-border);border-bottom-width:2px;border-radius:5px;padding:1px 6px;font-size:12px;background:var(--app-bg)}
.shortcuts-table td{border-bottom:1px solid var(--rule);padding:6px 10px;background:transparent}
.shortcuts-table tr:nth-child(even) td{background:var(--table-alt)}

/* ---------- top view tabs (dedicated buttons for every section) ---------- */
.view-tabs{display:flex;align-items:center;gap:4px;margin-left:auto;overflow-x:auto;scrollbar-width:none}
.view-tabs::-webkit-scrollbar{display:none}
.vt-btn{white-space:nowrap;padding:6px 10px;border-radius:9px;border:1px solid transparent;background:transparent;
 color:var(--app-muted);font-size:12.5px;font-weight:600;cursor:pointer;transition:background .15s,color .15s}
.vt-btn:hover{background:var(--app-hover,rgba(127,127,127,.12));color:var(--app-text)}
.vt-btn.active{background:var(--app-accent);color:oklch(99% 0 0)}
@media(max-width:900px){.view-tabs .vt-btn{padding:6px 7px;font-size:11.5px}}

/* ---------- scratchpad ---------- */
.sp-wrap{display:flex;flex-direction:column;gap:10px}
#scratchpad-area{width:100%;min-height:340px;resize:vertical;padding:16px;border-radius:12px;
 border:1px solid var(--app-border);background:var(--app-bg);color:var(--app-text);
 font:inherit;font-size:1em;line-height:1.7;outline:none}
#scratchpad-area:focus{border-color:var(--app-accent)}
.sp-meta{display:flex;align-items:center;justify-content:space-between}
#scratchpad-status{font-size:13px;color:var(--app-muted)}

/* ---------- in-book interactive quizzes ---------- */
.quiz ol > li{cursor:pointer;border-radius:8px;padding:2px 6px;transition:background .15s}
.quiz ol.options > li{cursor:pointer;border:1px solid transparent;border-radius:8px;padding:3px 10px;transition:background .15s,border-color .15s,opacity .15s}
.quiz ol.options > li:hover{background:var(--app-hover,rgba(127,127,127,.12))}
.quiz ol.options > li.q-opt-correct{background:oklch(92% .06 150);border-color:oklch(60% .12 150);color:oklch(35% .1 150)}
.quiz ol.options > li.q-opt-wrong{background:oklch(92% .06 25);border-color:oklch(60% .15 25);color:oklch(40% .15 25)}
.quiz ol.options > li.q-opt-dim{opacity:.45}
[data-theme=dark] .quiz ol.options > li.q-opt-correct{background:oklch(30% .07 150);color:oklch(85% .1 150)}
[data-theme=dark] .quiz ol.options > li.q-opt-wrong{background:oklch(30% .08 25);color:oklch(85% .1 25)}
.q-explain{display:none;margin:.6em 0 .2em;padding:10px 14px;border-left:3px solid var(--app-accent);
 background:var(--app-bg);border-radius:0 10px 10px 0;font-size:.95em;line-height:1.5}
.q-explain.show{display:block}
.q-explain b{color:var(--primary)}
.q-links{display:inline-flex;gap:10px;flex-wrap:wrap;margin-left:8px}
.q-links a,.mcq-link{color:var(--app-accent);text-decoration:none;font-weight:600;font-size:.92em}
.q-links a:hover,.mcq-link:hover{text-decoration:underline}
.quiz-score{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px;padding:10px 14px;
 border-radius:10px;background:var(--app-bg);border:1px solid var(--rule);font-size:.95em;color:var(--app-muted)}
.quiz-score em{font-style:normal;color:var(--warn,var(--accent))}
.quiz-reset{margin-left:auto;padding:6px 12px;border-radius:8px;border:1px solid var(--app-border);
 background:transparent;color:var(--app-text);font-size:12.5px;font-weight:600;cursor:pointer}
.quiz-reset:hover{border-color:var(--app-accent);color:var(--app-accent)}

@media print{
 .topbar,.sidebar,.overlay,.notes-panel,.popup-menu,.view-tabs{display:none!important}
 #book-view.active{display:block}
 .book-container{padding:0}.paper{border:0;box-shadow:none;max-width:100%}
 body::before{display:none}
}
@media(max-width:640px){
 .search-wrap{margin:0 4px}#search-shortcut{display:none}
 .graph-canvas-wrap{height:calc(100vh - var(--topbar-h) - 190px)}
}
"""
