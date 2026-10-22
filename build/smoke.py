from playwright.sync_api import sync_playwright
import sys

errors=[]
with sync_playwright() as p:
    try:
        b=p.chromium.launch()
    except Exception as e:
        print("no browser:",e); sys.exit(2)
    pg=b.new_page(viewport={'width':1400,'height':900})
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type=='error' else None)
    pg.goto('file:///workspace/scribe0.3.html')
    pg.wait_for_timeout(1500)

    # 1 TOC generated
    toc_links = pg.locator('#toc a').count()
    print('TOC links:', toc_links)
    assert toc_links > 50, 'TOC missing'

    # 2 search
    pg.fill('#search-input','stroke')
    pg.wait_for_timeout(400)
    res = pg.locator('#search-results .sr-item').count()
    print('Search results for "stroke":', res)
    assert res>0, 'search broken'
    pg.keyboard.press('Escape')

    # 3 graph dialog
    pg.click('#btn-graph')
    pg.wait_for_timeout(1200)
    nodes = pg.locator('.kg-node').count()
    print('Graph nodes rendered:', nodes)
    assert nodes==41
    pg.click('.kg-node:nth-of-type(5) circle')
    pg.wait_for_timeout(300)
    panel_visible = pg.locator('#kg-panel.show').count()
    print('KG info panel shown:', panel_visible)
    pg.select_option('#kg-ch-filter','ch7'); pg.wait_for_timeout(400)
    visible_nodes = pg.eval_on_selector_all('.kg-node','els=>els.filter(e=>e.style.display!=="none").length')
    print('Nodes after ch7 filter:', visible_nodes)
    pg.click('#dlg-graph .dlg-close')

    # 4 flashcards
    pg.click('#btn-study'); pg.wait_for_timeout(400)
    front = pg.inner_text('#fc-front')
    print('First card:', front[:60])
    pg.click('#fc-card'); pg.wait_for_timeout(600)
    pg.click('#fc-controls button.good'); pg.wait_for_timeout(300)
    pg.click('#dlg-study .dlg-close')

    # 5 highlight via selection
    pg.evaluate('''()=>{const el=[...document.querySelectorAll("#scribe-main p")].find(p=>p.textContent.includes("SOAP"));const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);}''')
    pg.mouse.up()
    pg.wait_for_timeout(300)
    pg.click('#hl-toolbar [data-color="green"]')
    pg.wait_for_timeout(300)
    marks = pg.locator('mark.scribe-hl').count()
    print('Highlight marks:', marks)
    assert marks>=1
    ls = pg.evaluate('localStorage.getItem("scribe.highlights")')
    print('Saved in localStorage:', bool(ls))

    # 6 notes dialog
    pg.click('#btn-notes'); pg.wait_for_timeout(300)
    notes = pg.locator('.note-item').count()
    print('Note items:', notes); assert notes>=1
    pg.click('#dlg-notes .dlg-close')

    # 7 glossary popup
    gt = pg.locator('.gloss-term').first
    gt.click(); pg.wait_for_timeout(200)
    print('Glossary popup:', pg.locator('#gloss-pop.show').count())

    # 8 theme toggle + persistence reload
    pg.click('#btn-theme'); pg.wait_for_timeout(200)
    dark = pg.get_attribute('html','data-theme'); print('Theme after toggle:', dark)
    pg.reload(); pg.wait_for_timeout(1200)
    dark2 = pg.get_attribute('html','data-theme'); print('Theme persisted:', dark2)
    marks2 = pg.locator('mark.scribe-hl').count(); print('Highlights restored after reload:', marks2)

    # 9 pager & progress
    prog = pg.evaluate('document.getElementById("reading-progress").style.width')
    print('Progress bar width:', prog)
    pg.screenshot(path='/workspace/build/shot_light.png')
    pg.click('#btn-sidebar'); pg.wait_for_timeout(400)
    pg.screenshot(path='/workspace/build/shot_nosb.png')
    b.close()

print('PAGE ERRORS:', errors if errors else 'none')
assert not errors, 'JS errors present'
print('SMOKE TEST PASSED')
