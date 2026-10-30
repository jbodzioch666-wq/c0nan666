// RS-718: food cooking on the Cooks' Guild range. Cooking there shows the corner card (not the full menu) and the hearth's skillet on
// the range's hotplate, in place of its idle pan: the food in it, raw at first and done by the end of each step, steam rising.
// Shots: shots/rs718_cook.png (early in a step), rs718_cook2.png (later)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; const city = townList().find(t=>townInfo(t.x, t.y).tier===2); if (!city) return { noCity:true };
    G.owPos = { x:city.x, y:city.y }; enterVillage(); setUi('playing'); enterInterior('guild'); p.x = 6; p.y = 8; p.facing = 3; V3.dist = 6.5;
    for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const rig = (V3.hearthCook||[]).find(h=>h.idle);
    return { rig:!!rig, idle0:rig ? rig.idle.every(m=>m.visible) : null, shown0:rig ? rig.g.visible : null }; });
  if (r0.noCity){ console.log('no city in this world - skipped'); return; }
  const fish = await ev(()=>{ skP().skills.cooking = SK_XP[60]; const f = SK_FISH.find(x=>x.cook <= 40 && !x.hard && x.id) || SK_FISH[0]; skAdd(f.id, 10); useBench('grange'); cqAdd('cook', f.id, '', 10); return f.id; });
  await page.waitForTimeout(500);
  const r1 = await ev(()=>{ const rig = V3.hearthCook.find(h=>h.idle), ov = document.getElementById('overlay');
    return { ui:G.ui, at:G.cookAt, card:ov.classList.contains('ovcook'), shown:rig.g.visible, fish:!!(rig.foods.fish && rig.foods.fish.visible), idle:rig.idle.some(m=>m.visible), title:/COOKS' GUILD RANGE/.test(ov.textContent) }; });
  await page.screenshot({ path:SHOTS + '/rs718_cook.png' });
  const c0 = await ev(()=>{ const m = V3.hearthCook.find(h=>h.idle).foods.fish.userData.meshes[0]; return m.userData.fr; });
  await page.waitForTimeout(1400); await page.screenshot({ path:SHOTS + '/rs718_cook2.png' });
  const c1 = await ev(()=>{ const m = V3.hearthCook.find(h=>h.idle).foods.fish.userData.meshes[0]; return m.userData.fr; });
  const r2 = await ev(f=>{ const n = skHave(f); setUi('playing'); for (let i=0;i<3;i++) renderGame(); const rig = V3.hearthCook.find(h=>h.idle); return { left:n, hid:!rig.g.visible, idle:rig.idle.every(m=>m.visible) }; }, fish);
  console.log(JSON.stringify({ r0, r1, c0, c1, r2 }));
  A(r0.rig && r0.idle0 && !r0.shown0, 'the range has a cooking rig, hidden, its own pan showing');
  A(r1.ui==='cook' && r1.at==='guild' && r1.card && r1.title, 'cooking at the range: the corner card');
  A(r1.shown && r1.fish && !r1.idle, 'the fish in the skillet on the hotplate, the idle pan gone');
  A(c0 !== undefined && c1 !== undefined && c1 !== c0, 'it cooks: its colour moves from raw toward done');
  A(r2.left < 10 && r2.hid && r2.idle, 'some cooked; leaving puts the idle pan back');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
