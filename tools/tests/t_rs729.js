// RS-729: the Glassblower & Potter's potter's wheel and kiln get the work screen: the wheel spins and the lump rises into a pot, bowl or
// dish between the potter's hands; the kiln glows, a gob of glass swells on the blowpipe, an orb charges on its stand, a torch or
// lantern lights. Throw clay pots, melt glass, blow a vial, light a torch, charge an orb asks for runes.
// Shots: shots/rs729_wheel.png (mid-throw), rs729_glass.png (mid-blow), rs729_orb.png, rs729_torch.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    skGainXP('crafting', 60000); skAdd('clay', 2); skAdd('sand', 2); skAdd('seaweed', 2); skAdd('logs', 1); skAdd('flax', 1); skAdd('orb', 1);
    enterInterior(buildingByKey('pottery') ? 'pottery' : 'tailor'); G.bench = 'wheel'; WB.sel = {}; setUi('bench');
    const ov = document.getElementById('overlay'), pot = wbRecipes('wheel').find(x=>x.nm==='Clay pot'); wbPick(pot.id); wbMake(9999);
    return { title:ov.querySelector('.panel-title').textContent, wheel:!!ov.querySelector('.wb-pot'), total:CQ.list[0] && CQ.list[0].total };
  });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs729_wheel.png' }); await page.waitForFunction(()=>!CQ.list.length, null, { timeout:15000 });
  const r1 = await ev(()=>({ q:CQ.list.length, pots:skHave('pot'), clay:skHave('clay') }));
  const r2 = await ev(()=>{ setUi('playing'); G.bench = 'kiln'; WB.sel = {}; setUi('bench'); const ov = document.getElementById('overlay'), R = wbRecipes('kiln');
    const mg = R.find(x=>x.nm==='Molten glass'); wbPick(mg.id); wbMake(2); return { title:ov.querySelector('.panel-title').textContent, gob:!!ov.querySelector('.wb-gob'), rows:[...new Set(R.map(x=>x.row))] }; });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs729_glass.png' }); await page.waitForFunction(()=>!CQ.list.length, null, { timeout:15000 });
  const r3 = await ev(async ()=>{ const out = { glass:skHave('glass') }; const v = wbRecipes('kiln').find(x=>x.nm==='Vial'); wbPick(v.id); wbMake(1); while (CQ.list.length) await new Promise(r=>setTimeout(r, 100)); out.vial = skHave('vial');
    const t = wbRecipes('kiln').find(x=>x.nm==='Torch'); wbPick(t.id); wbMake(1); out.flame = !!document.querySelector('.wb-flm'); return out; });
  await page.waitForTimeout(600); await page.screenshot({ path:SHOTS + '/rs729_torch.png' }); await page.waitForFunction(()=>!CQ.list.length, null, { timeout:15000 });
  const r4 = await ev(()=>{ const torch = skHave('torch'); const o = wbRecipes('kiln').find(x=>x.nm==='Charge fire orb'); wbPick(o.id); wbMake(1); return { torch, q:CQ.list.length, msg:WB.msg, orb:!!document.querySelector('.wb-orbg') }; });
  await page.waitForTimeout(300); await page.screenshot({ path:SHOTS + '/rs729_orb.png' });
  console.log(JSON.stringify({ r0, r1, r2, r3, r4 }));
  A(r0.title==="POTTER'S WHEEL" && r0.wheel && r0.total===2, "the potter's wheel, all counts two: " + JSON.stringify(r0));
  A(r1.q===0 && r1.pots >= 2 && r1.clay===0, 'the clay thrown into pots (Crafting may keep some clay for another): ' + JSON.stringify(r1));
  A(r2.title==='ORB KILN' && r2.gob && r2.rows.includes('Glass') && r2.rows.includes('Orbs') && r2.rows.includes('Lights'), 'the kiln: ' + JSON.stringify(r2));
  A(r3.glass >= 2 && r3.vial >= 1 && r3.flame, 'glass melted, a vial blown, a torch lit: ' + JSON.stringify(r3));
  A(r4.torch >= 1, 'a torch made');
  A(r4.q===0 && /fire rune/i.test(r4.msg) && r4.orb, 'charging a fire orb asks for fire runes: ' + JSON.stringify(r4));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
