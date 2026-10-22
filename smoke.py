#!/usr/bin/env python3
"""Smoke test for the GitHub Pages build (site/index.html) — run with `python smoke.py`."""
import sys, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent
URL = (ROOT / 'site' / 'index.html').as_uri()

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1400, 'height': 900})
    pg.on('pageerror', lambda e: errors.append('PAGEERROR: %s' % e))
    pg.on('console', lambda m: errors.append('CONSOLE: %s' % m.text) if m.type == 'error' else None)
    pg.on('requestfailed', lambda r: errors.append('REQFAIL: %s' % r.url) if not r.url.startswith('data:') else None)

    pg.goto(URL)
    pg.wait_for_timeout(1500)

    # 1 app data injected & views exist
    assert pg.evaluate("typeof window.__APP_DATA__ === 'object'"), '__APP_DATA__ missing'
    print('views:', pg.evaluate("[...document.querySelectorAll('[id$=\"-view\"]')].map(e=>e.id)"))

    # 2 TOC generated from book
    toc = pg.locator('#toc-list a').count()
    print('TOC links:', toc); assert toc > 50, 'TOC missing'

    # 3 search
    pg.fill('#search-input', 'stroke'); pg.wait_for_timeout(400)
    res = pg.locator('#search-results .sr-item, #search-results > *').count()
    print('Search results for "stroke":', res); assert res > 0, 'search broken'
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)

    # 4 concept graph renders nodes + links (open via sidebar TOC button like a real user)
    pg.locator('#toc-list a[data-viewbtn="graph"]').first.click(); pg.wait_for_timeout(1500)
    nodes = pg.locator('#graph-nodes g.node').count()
    links = pg.locator('#graph-links line').count()
    print('Graph nodes:', nodes, 'links:', links); assert nodes > 100 and links > 100
    pg.fill('#graph-search', 'trauma'); pg.wait_for_timeout(400)
    print('Graph match count text:', pg.inner_text('#graph-match-count'))
    pg.click('#graph-reset'); pg.wait_for_timeout(300)

    # 5 node info panel
    first = pg.locator('#graph-nodes g.node').nth(3)
    first.click(force=True); pg.wait_for_timeout(400)
    visible = pg.evaluate("getComputedStyle(document.getElementById('node-info')).display")
    print('Node info panel display:', visible)

    # 6 flashcards flip + advance
    pg.evaluate("location.hash='flashcards';showView('flashcards')"); pg.wait_for_timeout(600)
    front = pg.inner_text('#fc-front'); print('First card:', front[:60])
    pg.click('#flash-card'); pg.wait_for_timeout(500)
    pg.click('#next-card'); pg.wait_for_timeout(300)
    print('Card after next:', pg.inner_text('#fc-front')[:60])

    # 7 MCQ quiz interactive in book view
    pg.evaluate("location.hash=''"); pg.wait_for_timeout(600)
    q = pg.locator('.quiz[data-ch] ol > li').first
    pg.evaluate("document.querySelector('.quiz[data-ch]').scrollIntoView()"); pg.wait_for_timeout(300)
    opt = pg.locator('.quiz[data-ch] ol > li:first-child .options li').first
    opt.click(force=True); pg.wait_for_timeout(400)
    graded = pg.locator('.quiz[data-ch] ol > li:first-child .options li.correct, .quiz[data-ch] ol > li:first-child .options li.wrong, .quiz [class*="result"], .quiz .feedback').count()
    print('Quiz feedback elements after answering:', graded)

    # 8 glossary view
    pg.evaluate("location.hash='glossary';showView('glossary')"); pg.wait_for_timeout(600)
    gl = pg.locator('#glossary-list > *').count(); print('Glossary entries:', gl); assert gl > 10
    pg.fill('#glossary-search', 'hypo'); pg.wait_for_timeout(400)
    print('Glossary filtered:', pg.locator('#glossary-list > *').count())

    # 9 settings persistence across reload (theme + typography)
    pg.evaluate("location.hash='settings';showView('settings')"); pg.wait_for_timeout(500)
    before = pg.get_attribute('html', 'data-theme')
    pg.select_option('#theme-select', 'dark'); pg.wait_for_timeout(300)
    pg.reload(); pg.wait_for_timeout(1200)
    after = pg.get_attribute('html', 'data-theme')
    print('Theme before/after reload:', before, '->', after); assert after == 'dark', 'theme not persisted'
    pg.select_option('#theme-select', before or 'light'); pg.wait_for_timeout(200)

    # 10 images load (relative paths resolve on disk)
    broken = pg.evaluate("[...document.images].filter(i=>i.complete && i.naturalWidth===0).length")
    total = pg.evaluate("document.images.length")
    print('Images total/broken:', total, '/', broken); assert broken == 0, 'broken image refs'

    pg.screenshot(path=str(ROOT / 'build' / 'shot_v04_light.png'))
    b.close()

print('ERRORS:', errors if errors else 'none')
assert not errors, 'JS/resource errors present'
print('SMOKE TEST PASSED')
