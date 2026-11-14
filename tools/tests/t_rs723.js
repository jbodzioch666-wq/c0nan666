// RS-723: the furnace screen. Every bar down the left (ore -> bar, the level it needs, how many you can make), the furnace in the
// middle - the crucible tips and pours into the mould for each bar the queue smelts - and on the right what the bar takes and what it
// forges into. A tap picks a bar, a drag onto the furnace smelts one, a bar you can't make says why.
// Shots: shots/rs723_furnace.png (idle), rs723_pour.png (mid-pour), rs723_narrow.png (a phone-width window)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    skGainXP('smithing', 30000); skAdd('copper', 20); skAdd('iron', 12); skAdd('coal', 6); skAdd('silver', 1);
    enterInterior('smith'); G.bench = 'furnace'; FUR.sel = null; setUi('bench');
    const ov = document.getElementById('overlay');
    return { L:skLvl('smithing'), cards:ov.querySelectorAll('[data-fur-bar]').length, locked:ov.querySelectorAll('.fur-bar.locked').length, sel:FUR.sel, title:ov.querySelector('.panel-title').textContent, wide:ov.classList.contains('ovwide'), ores:ov.querySelectorAll('.fur-ore').length };
  });
  await page.waitForTimeout(600); await page.screenshot({ path:SHOTS + '/rs723_furnace.png' });
  /* a tap on the bronze card picks it */
  const cardXY = id=>ev(id=>{ const r = document.querySelector(`[data-fur-bar="${id}"]`).getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; }, id);
  let xy = await cardXY('bronze'); await page.mouse.click(xy[0], xy[1]); await page.waitForTimeout(150);
  const r1 = await ev(()=>({ sel:FUR.sel, right:document.querySelector('.anv-right').textContent.slice(0, 60) }));
  /* smelt 5 through the queue: the stage pours */
  await ev(()=>furSmelt(5)); await page.waitForTimeout(2000);
  const r2 = await ev(()=>({ pour:!!document.querySelector('.fur-stage.pour'), q:CQ.list.length, bronze:skHave('bronze') }));
  await page.screenshot({ path:SHOTS + '/rs723_pour.png' });
  await page.waitForTimeout(6500);
  const r3 = await ev(()=>({ q:CQ.list.length, bronze:skHave('bronze'), copper:skHave('copper'), pour:!!document.querySelector('.fur-stage.pour') }));
  /* drag the steel card onto the furnace: one steel bar */
  xy = await cardXY('steelb'); const st = await ev(()=>{ const r = document.querySelector('.fur-stage').getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; });
  await page.mouse.move(xy[0], xy[1]); await page.mouse.down(); for (let i=1;i<=8;i++){ await page.mouse.move(xy[0] + (st[0]-xy[0])*i/8, xy[1] + (st[1]-xy[1])*i/8); await page.waitForTimeout(20); }
  const hov = await ev(()=>({ on:!!document.querySelector('.fur-stage.dropon'), ghost:!!document.querySelector('.fur-ghost') }));
  await page.mouse.up(); await page.waitForTimeout(1900);
  const r4 = await ev(()=>({ sel:FUR.sel, steel:skHave('steelb'), coal:skHave('coal'), ghost:!!document.querySelector('.fur-ghost') }));
  /* a bar too high to smelt says why, and nothing is queued */
  const r5 = await ev(()=>{ furPick('runeb'); furSmelt(1); return { q:CQ.list.length, msg:FUR.msg, shown:!!document.querySelector('.fur-msg') }; });
  /* silver with one ore: not enough, says so */
  const r6 = await ev(()=>{ furPick('silverb'); furSmelt(1); return { q:CQ.list.length, msg:FUR.msg }; });
  await page.setViewportSize({ width:420, height:860 }); await ev(()=>{ furPick('ironb'); }); await page.waitForTimeout(500); await page.screenshot({ path:SHOTS + '/rs723_narrow.png' });
  const r7 = await ev(()=>{ handleKeydown({ key:'Escape', code:'Escape', target:document.body, preventDefault(){}, repeat:false }); return G.ui; });
  console.log(JSON.stringify({ r0, r1, r2, r3, hov, r4, r5, r6, r7 }));
  A(r0.title==='THE FURNACE' && r0.cards===8 && r0.ores===8 && r0.wide, 'the furnace screen: seven bars, the ores, wide: ' + JSON.stringify(r0));
  A(r0.locked===SK_BAR_LOCKED(r0.L), 'bars over your level are locked: ' + r0.locked);
  A(r0.sel==='steelb', 'it starts on the best bar you can make: ' + r0.sel);
  A(r1.sel==='bronze' && /Bronze Bar/.test(r1.right), 'a tap picks a bar: ' + JSON.stringify(r1));
  A(r2.pour && r2.q===1 && r2.bronze >= 1, 'the queue pours bars: ' + JSON.stringify(r2));
  A(r3.q===0 && r3.bronze===5 && r3.copper===10 && !r3.pour, 'five bronze bars from ten copper: ' + JSON.stringify(r3));
  A(hov.on && hov.ghost, 'dragging a bar over the furnace lights it');
  A(r4.sel==='steelb' && r4.steel===1 && !r4.ghost, 'dropping steel on the furnace smelts one: ' + JSON.stringify(r4));
  A(r5.q===0 && /Smithing 80/.test(r5.msg) && r5.shown, 'rune says it needs Smithing 80: ' + JSON.stringify(r5));
  A(r6.q===0 && /silver/.test(r6.msg), 'silver with one ore says it takes two: ' + JSON.stringify(r6));
  A(r7==='playing', 'Escape steps away');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
function SK_BAR_LOCKED(L){ return [1, 15, 25, 30, 40, 45, 60, 80].filter(l=>l > L).length; }
