// RS-719: a lobster is boiled in a pot, not fried in the skillet. At the Cooks' Guild range it goes into the range's stewpot (the pot's
// water bubbling, steam off it), its own pan staying on the hotplate; at a hearth or a campfire an iron pot of water stands on the grill
// for it. It still turns from blue-black to scarlet as it cooks. Shots: shots/rs719_boil.png (early), rs719_boil2.png (later), rs719_hearth.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; const city = townList().find(t=>townInfo(t.x, t.y).tier===2); if (!city) return { noCity:true };
    G.owPos = { x:city.x, y:city.y }; enterVillage(); setUi('playing'); enterInterior('guild'); p.x = 6; p.y = 8; p.facing = 3; V3.dist = 5;
    for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    return { rig:!!(V3.hearthCook||[]).find(h=>h.idle) }; });
  if (r0.noCity){ console.log('no city in this world - skipped'); return; }
  await ev(()=>{ skP().skills.cooking = SK_XP[60]; skAdd('lobster', 10); useBench('grange'); cqAdd('cook', 'lobster', '', 10); });
  await page.waitForTimeout(500);
  const look = ()=>ev(()=>{ const rig = V3.hearthCook.find(h=>h.idle), f = rig.foods.lobster, W = o=>o.getWorldPosition(new THREE.Vector3());
    const lp = W(f), pp = W(rig.pot);
    return { ui:G.ui, at:G.cookAt, shown:rig.g.visible, lob:f.visible, pot:rig.pot.visible, skillet:rig.sk.visible, idle:rig.idle.every(m=>m.visible),
      off:Math.hypot(lp.x - pp.x, lp.z - pp.z), dy:lp.y - pp.y, bub:rig.bubbles.filter(b=>b.visible).length, fr:f.userData.meshes[0].userData.fr }; });
  const r1 = await look(); await page.screenshot({ path:SHOTS + '/rs719_boil.png' });
  await page.waitForTimeout(1400); const r2 = await look(); await page.screenshot({ path:SHOTS + '/rs719_boil2.png' });
  /* a hearth's or a campfire's grill: an iron pot on it, the lobster in that */
  const r3 = await ev(()=>{ const rig = cookRigMake(THREE, { legH:0.16 }); cookRigSync(rig, true, 1); const f = rig.foods.lobster;
    return { lob:f.visible, pot:rig.pot.visible, potMeshes:rig.pot.children.length, off:Math.hypot(f.position.x - rig.pot.position.x, f.position.z - rig.pot.position.z), y:f.position.y, potTop:rig.pot.position.y + rig.potY }; });
  /* a fish still goes in the skillet */
  const r4 = await ev(()=>{ cqStop(); setUi('playing'); skAdd('shrimp', 5); useBench('grange'); cqAdd('cook', 'shrimp', '', 5); for (let i=0;i<3;i++) renderGame();
    const rig = V3.hearthCook.find(h=>h.idle); return { fish:rig.foods.fish.visible, pot:rig.pot.visible, skillet:rig.sk.visible, idle:rig.idle.some(m=>m.visible) }; });
  /* the tavern hearth: the pot on its grill */
  const r5 = await ev(async ()=>{ cqStop(); setUi('playing'); exitInterior(); enterInterior('tavern'); setUi('playing'); skAdd('lobster', 10); let hx = -1, hy = -1;
    for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (benchAt(x, y)==='hearth'){ hx = x; hy = y; }
    if (hx < 0) return { none:true }; G.player.x = hx + 1; G.player.y = hy + 1; V3.dist = 4.5; for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    G.cookAt = 'hearth'; setUi('cook'); cqAdd('cook', 'lobster', '', 10); for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const h = (V3.hearthCook||[]).find(h=>h.g.visible); return { rig:!!h, pot:!!(h && h.pot.visible), lob:!!(h && h.foods.lobster.visible) }; });
  await page.waitForTimeout(900); await page.screenshot({ path:SHOTS + '/rs719_hearth.png' });
  console.log(JSON.stringify({ r0, r1, r2, r3, r4, r5 }));
  A(r1.ui==='cook' && r1.at==='guild' && r1.shown && r1.lob && r1.pot, 'cooking a lobster at the range: it is in the pot');
  A(r1.off < 0.03 && r1.dy < 0.03, 'in the stewpot, under the water line: ' + r1.off.toFixed(3) + ' ' + r1.dy.toFixed(3));
  A(!r1.skillet && r1.idle, 'the skillet stays away, the range keeps its own pan');
  A(r1.bub > 0 || r2.bub > 0, 'the water bubbles');
  A(r1.fr !== undefined && r2.fr !== undefined && r2.fr !== r1.fr, 'it cooks: its colour moves from raw toward done');
  A(r3.lob && r3.pot && r3.potMeshes > 3 && r3.off < 0.01 && r3.y < r3.potTop, 'over a fire: an iron pot on the grill, the lobster in it: ' + JSON.stringify(r3));
  A(r4.fish && !r4.pot && r4.skillet && !r4.idle, 'a fish still fries in the skillet: ' + JSON.stringify(r4));
  A(r5.none || (r5.rig && r5.pot && r5.lob), 'at the tavern hearth, the lobster in a pot on its grill: ' + JSON.stringify(r5));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
