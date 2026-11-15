// RS-725: the anvil's Forge from bars tab, remade like the furnace: your bars along the top pick the metal, its pieces down the left (and
// the small work), the anvil with the piece on it in the middle and the hammer going while the queue forges, Forge 1/5/10/all, the
// piece's numbers on the right; godswords and gear upgrades fold away below.
// Shots: shots/rs725_forge.png, rs725_hammer.png (mid-forge), rs725_narrow.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    skGainXP('smithing', 30000); skAdd('bronze', 12); skAdd('ironb', 4); skAdd('silverb', 2);
    enterInterior('smith'); G.bench = 'anvil'; ENCH.tab = 'forge'; ANF.bar = ANF.pc = null; setUi('bench');
    const ov = document.getElementById('overlay');
    return { L:skLvl('smithing'), bars:ov.querySelectorAll('.anf-bar').length, cards:ov.querySelectorAll('[data-anf-pc]').length, bar:ANF.bar, wide:ov.classList.contains('ovwide'),
      groups:[...ov.querySelectorAll('.anv-left .anv-gh')].map(e=>e.textContent), allBtn:/all/.test(ov.querySelector('.fur-acts').textContent), oldRows:ov.querySelectorAll('.anv-left .shoprow').length };
  });
  await page.waitForTimeout(500); await page.screenshot({ path:SHOTS + '/rs725_forge.png' });
  /* the bronze chip picks bronze; a tap on the dagger picks it; forge all */
  const r1 = await ev(async ()=>{ const chip = [...document.querySelectorAll('.anf-bar')].find(e=>/Bronze/.test(e.textContent)); chip.click(); await new Promise(r=>setTimeout(r, 50));
    return { bar:ANF.bar, cards:[...document.querySelectorAll('[data-anf-pc]')].map(e=>e.dataset.anfPc) }; });
  const xy = await ev(()=>{ const r = document.querySelector('[data-anf-pc="dagger"]').getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; });
  await page.mouse.click(xy[0], xy[1]); await page.waitForTimeout(150);
  const n0 = await ev(()=>{ const s = ANF.pc; anfForge(9999); return { pc:s, total:CQ.list[0] && CQ.list[0].total, inv:G.inv.length }; });
  await page.waitForTimeout(1900); const r2 = await ev(()=>({ pour:!!document.querySelector('.anf-stage.pour'), bronze:skHave('bronze') }));
  await page.screenshot({ path:SHOTS + '/rs725_hammer.png' });
  await ev(()=>cqStop()); const r3 = await ev(()=>({ q:CQ.list.length, bronze:skHave('bronze'), daggers:G.inv.filter(i=>/Bronze Dagger/.test(i.nm||'')).length }));
  /* a platebody (5 bars) with 4 iron bars: says why */
  const r4 = await ev(()=>{ anfPickBar('ironb'); anfPick('chest'); anfForge(1); return { q:CQ.list.length, msg:ANF.msg }; });
  /* nails: small work through the queue */
  const r5 = await ev(async ()=>{ anfPick('nails'); anfForge(1); await new Promise(r=>setTimeout(r, 1700)); return { nails:skHave('nails'), iron:skHave('ironb') }; });
  /* (RS-728) silver isn't on the anvil - it's cast at the jeweller's bench */
  const r6 = await ev(()=>[...document.querySelectorAll('.anf-bar')].map(e=>e.textContent).join('|'));
  /* the other tab still works */
  const r7 = await ev(()=>{ anvilTab('work'); const w = !!document.querySelector('.anv-pcs, .anv-help, .anv-stage'); anvilTab('forge'); return w; });
  await page.setViewportSize({ width:420, height:860 }); await ev(()=>{ anfPickBar('bronze'); }); await page.waitForTimeout(400); await page.screenshot({ path:SHOTS + '/rs725_narrow.png' });
  console.log(JSON.stringify({ r0, r1, n0, r2, r3, r4, r5, r6, r7 }));
  A(r0.bars===6 && r0.cards >= 10 && r0.wide && r0.allBtn && !r0.oldRows, 'the forge tab: six bars, the pieces as cards, all: ' + JSON.stringify(r0));
  A(r0.groups.includes('WEAPONS') && r0.groups.includes('ARMOUR') && r0.groups.includes('SMALL WORK'), 'weapons, armour and small work');
  A(r1.bar==='bronze' && r1.cards.includes('dagger') && !r1.cards.includes('ring'), 'the bronze chip picks bronze');
  A(n0.pc==='dagger' && n0.total===12, 'all daggers counts twelve: ' + JSON.stringify(n0));
  A(r2.pour && r2.bronze < 12, 'the hammer works while it forges: ' + JSON.stringify(r2));
  A(r3.q===0 && r3.daggers===12 - r3.bronze, 'a dagger for each bar used: ' + JSON.stringify(r3));
  A(r4.q===0 && /5 iron bars/.test(r4.msg), 'a platebody with four iron bars says why: ' + r4.msg);
  A(r5.nails===15 && r5.iron===3, 'nails from an iron bar: ' + JSON.stringify(r5));
  A(!/Silver/.test(r6), 'no silver on the anvil: ' + r6);
  A(r7, 'the Work a piece tab still opens');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
