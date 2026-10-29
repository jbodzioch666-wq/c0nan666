// RS-726: the Tannery's tanning rack and leatherworking bench get the work screen: the hide on the rack scraped and turning to leather
// in the leather's colour, the stitching pony with the needle running along a seam in the armour's colour. Tan two leathers (they cost
// gold), stitch leather boots, dragonhide says it needs the hide; the leathers' note points at the bench.
// Shots: shots/rs726_tan.png (mid-tan), rs726_rack.png, rs726_stitch.png (mid-stitch), rs726_bench.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    skGainXP('crafting', 60000); skAdd('cowhide', 4); p.gold = 100;
    if (!buildingByKey('tannery')) return { none:true };
    enterInterior('tannery'); G.bench = 'tanning'; WB.sel = {}; setUi('bench');
    const ov = document.getElementById('overlay'), R = wbRecipes('tanning'), lr = R.find(x=>x.nm==='Leather');
    wbPick(lr.id); const note = ov.querySelector('.anv-right').textContent; wbMake(2);
    return { L:skLvl('crafting'), title:ov.querySelector('.panel-title').textContent, cards:ov.querySelectorAll('[data-wb-r]').length, rack:!!ov.querySelector('.wb-stage .wb-scrape'), note:/leatherworking bench/.test(note), gold:/gold/.test(note) };
  });
  if (r0.none){ console.log('no tannery - skipped'); return; }
  await page.waitForTimeout(800); await page.screenshot({ path:SHOTS + '/rs726_tan.png' }); await page.waitForTimeout(2400);
  const r1 = await ev(()=>({ q:CQ.list.length, leather:skHave('leather'), hide:skHave('cowhide'), gold:G.player.gold }));
  const r2 = await ev(()=>{ const g = wbRecipes('tanning').find(x=>/Green dragon/.test(x.nm)); wbPick(g.id); wbMake(1); return { q:CQ.list.length, msg:WB.msg }; });
  await page.waitForTimeout(300); await page.screenshot({ path:SHOTS + '/rs726_rack.png' });
  const r3 = await ev(()=>{ setUi('playing'); G.bench = 'leather'; setUi('bench'); const ov = document.getElementById('overlay'), R = wbRecipes('leather');
    const bt = R.find(x=>x.row==='Leather armour' && x.nm==='Boots'); wbPick(bt.id); const n0 = G.inv.length; wbMake(1);
    return { title:ov.querySelector('.panel-title').textContent, pony:!!ov.querySelector('.wb-stage .wb-needle'), rows:[...new Set(R.map(x=>x.row))], n0 }; });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs726_stitch.png' }); await page.waitForTimeout(1200);
  const r4 = await ev(()=>{ const it = G.inv[G.inv.length - 1]; const bd = wbRecipes('leather').find(x=>x.row==="Blue D'hide armour" && x.nm==='Body'); wbPick(bd.id); return { made:it && it.nm, n:G.inv.length, leather:skHave('leather') }; });
  await page.waitForTimeout(300); await page.screenshot({ path:SHOTS + '/rs726_bench.png' });
  console.log(JSON.stringify({ r0, r1, r2, r3, r4 }));
  A(r0.title==='TANNING RACK' && r0.rack && r0.cards >= 6 && r0.note, 'the tanning rack screen: ' + JSON.stringify(r0));
  A(r1.q===0 && r1.leather===2 && r1.hide >= 2 && r1.gold <= 100, 'two leathers tanned: ' + JSON.stringify(r1));
  A(r2.q===0 && /dragonhide/i.test(r2.msg), 'green dragon leather says it needs the hide: ' + r2.msg);
  A(r3.title==='LEATHERWORKING BENCH' && r3.pony && r3.rows.includes('Leather armour') && !r3.rows.some(r=>/robes/.test(r)), 'the leatherworking bench: ' + JSON.stringify(r3));
  A(/Boots/.test(r4.made) && r4.n===r3.n0 + 1 && r4.leather < 2, 'leather boots stitched: ' + JSON.stringify(r4));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
