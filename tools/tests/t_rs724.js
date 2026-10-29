// RS-724: the spinning wheel and the loom get work screens like the furnace's: the bench's recipes down the left in their rows, the bench
// at work in the middle (the wheel turns and the bobbin fills; the heddle lifts, the shuttle runs and the cloth grows), what it takes and
// makes on the right. A tap picks, a drag onto the bench makes one, a recipe you can't make says why (level, a recipe book, materials).
// Shots: shots/rs724_wheel.png, rs724_spin.png (mid-spin), rs724_loom.png, rs724_weave.png (mid-weave), rs724_narrow.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    skGainXP('crafting', 5e6); skAdd('flax', 12); skAdd('bark', 3);
    enterInterior('tailor'); G.bench = 'spinning'; WB.sel = {}; setUi('bench');
    const ov = document.getElementById('overlay');
    return { L:skLvl('crafting'), cards:ov.querySelectorAll('[data-wb-r]').length, title:ov.querySelector('.panel-title').textContent, wide:ov.classList.contains('ovwide'), sel:wbSel('spinning').nm, stage:!!ov.querySelector('.wb-stage .wb-wheel') };
  });
  await page.waitForTimeout(500); await page.screenshot({ path:SHOTS + '/rs724_wheel.png' });
  const cardXY = nm=>ev(nm=>{ const r = crRecipes().find(x=>x.nm===nm && wbRecipes(G.bench).includes(x)), b = document.querySelector(`[data-wb-r="${r.id}"]`).getBoundingClientRect(); return [b.left + b.width/2, b.top + b.height/2]; }, nm);
  /* tap Linen cloth, spin 4 */
  let xy = await cardXY('Linen cloth'); await page.mouse.click(xy[0], xy[1]); await page.waitForTimeout(150);
  const r1 = await ev(()=>{ const s = wbSel('spinning').nm; wbMake(4); return s; });
  await page.waitForTimeout(1900); const r2 = await ev(()=>({ pour:!!document.querySelector('.wb-stage.pour'), linen:skHave('linen') }));
  await page.screenshot({ path:SHOTS + '/rs724_spin.png' }); await page.waitForTimeout(4500);
  const r3 = await ev(()=>({ q:CQ.list.length, linen:skHave('linen'), flax:skHave('flax') }));
  /* drag the bowstring onto the wheel: one bowstring */
  xy = await cardXY('Bowstring'); const st = await ev(()=>{ const r = document.querySelector('.wb-stage').getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; });
  await page.mouse.move(xy[0], xy[1]); await page.mouse.down(); for (let i=1;i<=8;i++){ await page.mouse.move(xy[0] + (st[0]-xy[0])*i/8, xy[1] + (st[1]-xy[1])*i/8); await page.waitForTimeout(20); }
  const hov = await ev(()=>!!document.querySelector('.wb-stage.dropon')); await page.mouse.up(); await page.waitForTimeout(1900);
  const r4 = await ev(()=>({ bow:skHave('bowstring'), ghost:!!document.querySelector('.fur-ghost') }));
  /* the loom: robes only, a hat from the linen, Splitbark with bark; Ahrim's says it needs a book */
  const r5 = await ev(async ()=>{ setUi('playing'); G.bench = 'loom'; setUi('bench'); const ov = document.getElementById('overlay'), R = wbRecipes('loom');
    const hat = R.find(x=>x.row==='Wizard robes' && x.nm==='Hat'); wbPick(hat.id); const n0 = G.inv.length; wbMake(1);
    return { rows:[...new Set(R.map(x=>x.row))], weave:!!ov.querySelector('.wb-stage .wb-shuttle'), n0, right:ov.querySelector('.anv-right').textContent.replace(/\s+/g, ' ').slice(0, 200) }; });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs724_weave.png' }); await page.waitForTimeout(1200);
  const r6 = await ev(()=>{ const made = G.inv[G.inv.length - 1];
    const ah = wbRecipes('loom').find(x=>x.row==="Ahrim's robes"); wbPick(ah.id); wbMake(1); const ahMsg = WB.msg, q = CQ.list.length;
    const sb = wbRecipes('loom').find(x=>x.row==='Splitbark robes' && x.nm==='Boots'); wbPick(sb.id); return { made:made && made.nm, crafted:!!(made && made.crafted), ahMsg, q, inv:G.inv.length }; });
  await page.waitForTimeout(400); await page.screenshot({ path:SHOTS + '/rs724_loom.png' });
  await page.setViewportSize({ width:420, height:860 }); await ev(()=>renderOverlay()); await page.waitForTimeout(400); await page.screenshot({ path:SHOTS + '/rs724_narrow.png' });
  const r7 = await ev(()=>{ handleKeydown({ key:'Escape', code:'Escape', target:document.body, preventDefault(){}, repeat:false }); return G.ui; });
  console.log(JSON.stringify({ r0, r1, r2, r3, hov, r4, r5, r6, r7 }));
  A(r0.title==='SPINNING WHEEL' && r0.cards===2 && r0.wide && r0.stage, 'the spinning wheel: two recipes, the wheel, wide: ' + JSON.stringify(r0));
  A(r1==='Linen cloth' && r2.pour && r2.linen >= 1, 'a tap picks linen and the wheel spins it: ' + JSON.stringify(r2));
  A(r3.q===0 && r3.linen===4 && r3.flax >= 8, 'four linen from up to four flax (Crafting 99 may keep some): ' + JSON.stringify(r3));
  A(hov && r4.bow===1 && !r4.ghost, 'dragging the bowstring onto the wheel makes one: ' + JSON.stringify(r4));
  A(r5.rows.every(r=>/robes$/.test(r)) && r5.weave && /Hat/.test(r5.right) && /IT TAKES/.test(r5.right), 'the loom weaves robes: ' + JSON.stringify(r5));
  A(r6.made && /Hat/.test(r6.made) && r6.crafted, 'a hat woven at the loom: ' + r6.made);
  A(r6.q===0 && /recipe book/.test(r6.ahMsg), "Ahrim's says it needs its recipe book: " + r6.ahMsg);
  A(r7==='playing', 'Escape steps away');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
