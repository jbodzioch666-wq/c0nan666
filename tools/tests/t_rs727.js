// RS-727: the Fletcher's fletching bench and staff-carver's lathe get the work screen: a bow stave in the vice shaved by a knife and
// strung at the end (or an arrow fletched, its feathers growing), and a pole lathe turning a staff blank with the chisel running along
// it, the orbs it binds beside. Fletch arrows into the quiver, carve a shortbow, turn a plain staff; enchanting arrows folds below.
// Shots: shots/rs727_arrows.png (mid-fletch), rs727_bow.png (mid-carve), rs727_lathe.png (mid-turn), rs727_orbs.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    skGainXP('fletching', 60000); skGainXP('crafting', 60000); skAdd('logs', 10); skAdd('bronze', 3); skAdd('bowstring', 2); skAdd('orb_fire', 1);
    enterInterior('fletcher'); G.bench = 'fletching'; WB.sel = {}; setUi('bench');
    const ov = document.getElementById('overlay'), R = wbRecipes('fletching'), ar = R.find(x=>x.row==='Arrows' && x.arrowT===0);
    wbPick(ar.id); const right = ov.querySelector('.anv-right').textContent, q0 = arrowCount(0); wbMake(1);
    return { title:ov.querySelector('.panel-title').textContent, sub:ov.querySelector('.sub').textContent, arrow:!!ov.querySelector('.wb-fea'), quiver:/quiver/.test(right), q0, extra:/ENCHANT/.test(ov.textContent),
      chips:ov.querySelectorAll('.wb-mat').length, rows:[...new Set(R.map(x=>x.row))] };
  });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs727_arrows.png' }); await page.waitForTimeout(1200);
  const r1 = await ev(()=>{ const q = arrowCount(0), sb = wbRecipes('fletching').find(x=>x.row==='Plain bows' && x.nm==='Shortbow'); wbPick(sb.id); wbMake(1); return { q, bow:!!document.querySelector('.wb-bstr'), n0:G.inv.length }; });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs727_bow.png' }); await page.waitForTimeout(1200);
  const r2 = await ev(()=>{ const it = G.inv[G.inv.length - 1]; return { made:it && it.nm, n:G.inv.length, string:skHave('bowstring') }; });
  const r3 = await ev(()=>{ setUi('playing'); G.bench = 'staves'; setUi('bench'); const ov = document.getElementById('overlay'), R = wbRecipes('staves');
    const st = R.find(x=>/^Staves/.test(x.row) && x.nm==='Plain'); wbPick(st.id); wbMake(1);
    return { title:ov.querySelector('.panel-title').textContent, lathe:!!ov.querySelector('.wb-turn'), rows:[...new Set(R.map(x=>x.row))].length, n0:G.inv.length }; });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs727_lathe.png' }); await page.waitForTimeout(1200);
  const r4 = await ev(()=>{ const it = G.inv[G.inv.length - 1]; const fs = wbRecipes('staves').find(x=>/^Staves/.test(x.row) && x.nm==='Fire'); wbPick(fs.id);
    return { made:it && it.nm, n:G.inv.length, orbs:document.querySelectorAll('.wb-stage circle').length }; });
  await page.waitForTimeout(300); await page.screenshot({ path:SHOTS + '/rs727_orbs.png' });
  console.log(JSON.stringify({ r0, r1, r2, r3, r4 }));
  A(r0.title==='FLETCHING BENCH' && /Fletching/.test(r0.sub) && r0.arrow && r0.quiver && r0.extra, 'the fletching bench screen: ' + JSON.stringify(r0));
  A(r0.chips < 12, 'only the materials you hold or need: ' + r0.chips);
  A(r1.q >= r0.q0 + 15, 'fifteen arrows into the quiver: ' + r0.q0 + ' -> ' + r1.q);
  A(r1.bow && /Shortbow/.test(r2.made) && r2.n===r1.n0 + 1 && r2.string===1, 'a shortbow carved and strung: ' + JSON.stringify(r2));
  A(r3.title==="STAFF-CARVER'S LATHE" && r3.lathe && r3.rows >= 6, 'the lathe screen: ' + JSON.stringify(r3));
  A(/Staff/.test(r4.made) && r4.n===r3.n0 + 1, 'a staff turned: ' + JSON.stringify(r4));
  A(r4.orbs >= 2, 'the fire staff shows its orb beside the lathe');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
