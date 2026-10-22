# AI Implementation Guide — Scribe v0.4+ (Portable Across Books)

Purpose: give a future AI everything it needs to take **any raw HTML book export** and
rebuild the Scribe reader (v0.4 feature set) from scratch, without repeating the mistakes
of builds 0.1–0.3. Read this whole file before touching code.

---

## 1. What Scribe Is

A single self-contained `.html` file: book text + reading UI + study layer. No server, no
dependencies, works offline, opens with a double-click. All state persists in
`localStorage`. Architecture is **modular Python build → one HTML artifact**:

```
build04/
  build.py      # orchestrator: normalizes source book, injects shell/CSS/JS/data, validates
  shell.html    # DOM skeleton (tabs, panels, popups, SVG defs)
  theme.py      # design tokens as CSS custom properties (OKLCH only)
  css_tokens.py # token layer emitted into <style>
  css_book.py   # book typography + UI styles
  data.py       # graph nodes/edges, chapter metadata, per-chapter topic anchors
  mcqs.py       # interactive question bank + rendering logic spec
  app.js        # runtime: tabs, highlights, node graph, search, MCQ engine, persistence
```

Rule: never hand-edit the generated `scribeX.Y.html`. Edit modules, re-run
`python build.py`, let the validator catch regressions.

---

## 2. Non-Negotiable Design Rules (learned from 0.3 notes)

1. **Full dark mode.** Every surface must consume a token (`--bg`, `--surface`,
   `--surface-2`, `--text`, `--text-dim`, `--line`, `--accent`). Audit step in build.py
   greps for hardcoded beige/hex leftovers. "Some things stayed beige" happened because
   components were styled ad-hoc; forbid literal colors in component CSS entirely.
2. **Color outside OKLCH is banned.** No hex, no rgb(), no hsl() anywhere — including
   inside SVG gradients/patterns (this exact bug broke the 0.4 build: a stray hex lived
   in an `<svg><defs>` gradient). Validator regex must scan the *whole* final HTML,
   not just `<style>` blocks. Define palette once in `theme.py`, reference via
   `var(--token)`; for SVG fills use CSS classes or inline `oklch()` values.
3. **Texture + color, never color alone.** Every semantic category (node type, highlight
   kind, MCQ state) gets both an OKLCH hue AND a distinct SVG pattern
   (`<pattern id="tex-topic">` dots, diagonal hatch, cross-hatch, rings, grain). This is
   an accessibility requirement (color-blind users) and a taste requirement.
4. **Popups/menus must never be squished.** Fixed min-width (≥260px), clamp position to
   viewport with JS on open, allow wrap, generous padding. The 0.3 highlight popup was
   clipped by absolute positioning inside a constrained parent — render popups into a
   top-level portal element instead.
5. **Search everywhere it matters.** Reader full-text search, node-graph live search
   (non-matching nodes dim, don't vanish), MCQ filter by chapter/topic.

---

## 3. Feature Spec (the finally-selected set)

### 3.1 Tabs / Shell
- Top tab bar: **Read · Graph · MCQs · Notes**. One panel visible at a time, hash-routed
  (`#graph`) so deep links work.

### 3.2 Highlights
- Selection popup with actions: highlight (kind = key/quote/question/link), copy, note.
- Kinds are textured swatches, persisted as `{id, chapterId, text, prefix/suffix anchor,
  kind, note}`. Restore by fuzzy text-anchor matching (see §5 case studies).

### 3.3 Node Graph
- Node types beyond topics: **topic, concept, resource, task, highlight** (highlights
  auto-become nodes). Distinct shape per type (circle/rounded-square/diamond/hexagon/star)
  × texture × hue.
- Live search box dims non-matches; click node → jump to anchored passage/chapter.
- Force-directed layout computed once, positions cached in localStorage; drag to pin.

### 3.4 Interactive MCQs
- Own tab **and** end-of-chapter block. Per question: options as buttons, instant
  right/wrong feedback (textured ✓/✗, not just green/red), explanation reveal, running
  score, reset-chapter, and a **"Study this →"** link that deep-links to the exact
  passage in the reader (`#read/<chapter>?h=<anchorId>`) plus related graph node.
- Question schema:
  `{id, chapter, question, options[], answer, explanation, topicAnchor, difficulty}`.

---

## 4. Porting To A New Book — Procedure

1. Drop the raw book export at `book_src/<title>.html`. Identify its structure
   (headings used per chapter, ids present or absent).
2. In `build.py`, set the chapter-heading selector regex to match the new source
   (do NOT assume `<h2 class="chapter">`; see §5.1 — this assumption caused a crash).
3. Regenerate `data.py`: extract headings → topics; write/curate concepts, resources,
   tasks; keep edge list human-readable.
4. Author `mcqs.py` per chapter (aim ≥6 questions/chapter), each pointing at a real
   `topicAnchor` that exists in the normalized DOM.
5. Run build; fix until all assertions pass; then run the manual checklist (§7).

## 5. Case Choices & Lessons (decision log — reuse these judgments)

### 5.1 Anchor/structure assumptions crashed the build
- **Situation:** build.py assumed the source used flat `<h2 class="chapter" id="chX">`
  siblings and split chapters by searching for those exact strings; a different source
  layout made the regex return `None` → crash mid-build.
- **Choice made:** normalize first — wrap each chapter into `<div class="chapter"
  id="chX">` during build, assert expected chapter count (`assert html.count(...)==9`),
  fail loudly rather than emit broken HTML.
- **Lesson for future books:** always probe the source structure programmatically
  (count candidate headings, print samples) before hardcoding selectors; make the
  selector a single named constant; keep structural asserts in the validator.

### 5.2 Stray hex inside SVG gradient failed validation late
- **Situation:** final-file check flagged a non-OKLCH color; it hid in an SVG
  `<linearGradient>` stop-color, outside any `<style>` block.
- **Choice made:** extended the hex/rgb scanner to the entire HTML string; converted
  SVG stops to `oklch()` literals sourced from the same token table.
- **Lesson:** validators must scan the artifact globally; SVG is a common escape hatch
  for rule violators (colors, px magic numbers).

### 5.3 Regex title extraction over-match
- **Situation:** an earlier fix needed because a greedy title regex grabbed markup past
  `</title>`. Use non-greedy + anchored patterns, and validate extracted values.

### 5.4 Popup clipping → portal pattern
- **Situation:** 0.3 highlight popup inherited width/overflow from the selection's
  container and got squished near edges.
- **Choice made:** render all transient menus into a body-level `#portal` div, position
  with `getBoundingClientRect` + viewport clamping, enforce `min-width`. Chose this over
  CSS-only fixes because containers vary.

### 5.5 Dim-not-remove for graph search
- **Choice made:** filtering by opacity keeps spatial context stable (no re-layout
  jitter). Considered hiding nodes; rejected — users lose their place.

### 5.6 Textures as SVG `<pattern>` overlays, not background images
- Base64 PNGs bloat the single-file artifact and don't recolor with themes; inline
  patterns reference tokens and stay crisp at any zoom.

### 5.7 MCQ feedback semantics
- Right/wrong conveyed by icon + pattern + motion, color secondary. Study links chosen
  to target passage anchors (not just chapters) because "go read chapter 4" is useless
  feedback.

### 5.8 Persistence keys versioned
- Storage keys carry a schema version (`scribe.highlights.v1`); bump on breaking shape
  changes and migrate-or-discard explicitly. 0.3→0.4 reshaped highlight records.

### 5.9 Divergent-suggestion triage
- From divergent1–3.txt + suggested technologies.txt we kept: keyboard-first nav,
  spaced-repetition hook points, print stylesheet. We rejected (with reasons): external
  JS libraries (violates zero-dependency single file), web fonts (offline fragility),
  canvas graph (SVG is searchable/a11y-friendly and enough for ≤~300 nodes).

## 6. Build Validation Checklist (automated in build.py)
- [ ] Chapter wrapper count == expected N
- [ ] Zero hex/rgb/hsl anywhere in final HTML
- [ ] Every MCQ `topicAnchor` resolves to an existing element id/anchor
- [ ] Every graph node has shape + texture + oklch hue defined
- [ ] `app.js` parses (`node --check` or equivalent)
- [ ] File size sanity (< ~1.5 MB)

## 7. Manual QA (open the built file)
Select text near left/right/bottom edges → popup fully visible. Toggle every tab; no
beige surfaces (screenshot diff against tokens). Search graph; nodes dim. Answer MCQs;
feedback textures appear; "Study this" lands on the right paragraph. Reload page;
highlights/scores/graph positions restored.

## 8. Known Shortcomings / Open Work
- Fuzzy anchor restore can mismatch on repeated sentences (add occurrence index).
- Force layout O(n²) fine under ~300 nodes; revisit for very large books.
- MCQ explanations are static text; consider linking multiple anchors per question.
- Print/PDF path untested after 0.4 restyle.
