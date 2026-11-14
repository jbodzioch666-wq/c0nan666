// RS-751: a cape lies flat under what's slung on your back. Put away, a two-handed sword, a staff, a bow and a shield are tilted and
// moved out to lie on the cape (m3dCapeGearFit), and the cloth is held between them and your back (m3dCapeGearCeil, the cloth's gc/gu):
// no point of the cape ends up outside the gear - standing or walking, with the figure skinned as in the game. Your own figure in a
// dungeon carries it too
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = { sets:[] }, SET = [['2h', ()=>{ G.gear.weapon = rsMakeWeapon(3, 9); }], ['staff+shield', ()=>{ G.gear.weapon = rsMakeStaff(2); G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); }],
      ['sword+shield', ()=>{ G.gear.weapon = rsMakeWeapon(3, 5); G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); }], ['bow', ()=>{ G.gear.ranged = rsMakeBow(3, false); G.player.rsLastType = 'ranged'; }]];
    const dress = eq=>{ for (const k of ['weapon','offhand','ranged','cape']) G.gear[k] = newItem(); G.player.rsLastType = 'melee'; eq(); G.gear.cape = rsMakeCape(60, 'Zamorak Cape'); rsSync && rsSync(); };
    for (const [nm, eq] of SET) for (const walk of [0, 1]){ dress(eq);
      const e = m3dInstance({}, rsPlayerLook()), rg = e.rig; for (let i=0;i<30;i++) rsSheath(e, false, 0.1, i*0.1, 0); m3dPoseHumanoid(rg, 0, 0, 0, 0, 0, e);
      for (let i=0;i<150;i++){ if (walk){ e.holder.position.z += 1.6/60; m3dPoseHumanoid(rg, i/60*1.6, 1, 0, 0, 0, e); } e.holder.updateMatrixWorld(true); m3dCapeCloth(rg.cape, rg, 1/60); }
      const gear = []; for (const it of rg.shd.items) if (it.holder===rg.torso) for (const top of [it.o, it.sc]) if (top) top.traverse(o=>{ if (o.isMesh && o.visible){ o.material = o.material.clone(); o.material.side = T.DoubleSide; gear.push(o); } });
      const ps = rg.cape.geometry.attributes.position, fw = new T.Vector3(0, 0, 1).transformDirection(rg.torso.matrixWorld), ray = new T.Raycaster(), v = new T.Vector3(); ray.far = 0.2; let over = 0;
      const U = rg.cape.userData, W = U.grid[0] + 1, bad = []; for (let i=0;i<ps.count;i++){ v.fromBufferAttribute(ps, i); const ly = v.y, lz = v.z; rg.cape.localToWorld(v); ray.set(v, fw); const hit = ray.intersectObjects(gear, false); if (hit.length){ over++; const jr = Math.max(0, Math.min(U.grid[1], Math.round(-ly/U.h*U.grid[1]))); if (bad.length < 8) bad.push([i % W, Math.floor(i/W), jr, +lz.toFixed(3), +U.gc[jr*W + i%W].toFixed(3), +U.gu[jr*W + i%W].toFixed(3), +hit[0].distance.toFixed(3)]); } }
      out.sets.push({ nm, walk, gear:gear.length, fit:rg.shd.items.filter(it=>it.holder===rg.torso).every(it=>it.fit===rg.cape), gc:!!rg.cape.userData.gc, over, bad }); }
    /* no cape: nothing moved, nothing held */
    { dress(SET[0][1]); G.gear.cape = newItem(); rsSync && rsSync(); const e = m3dInstance({}, rsPlayerLook()); for (let i=0;i<30;i++) rsSheath(e, false, 0.1, i*0.1, 0); const it = e.rig.shd.items[0]; out.bare = { cape:!!e.rig.cape, fit:!!(it && it.fit), pos0:!!(it && it.pos0) }; }
    /* in a dungeon, your own figure, sheathed with a cape on */
    dress(SET[0][1]); const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    G.mon.forEach(m=>{ m.alive = false; }); for (let i=0;i<120;i++) await new Promise(r=>requestAnimationFrame(r));
    const he = m3dClothHero(), hr = he && he.rig; out.hero = { rig:!!hr, sheathed:!!(hr && hr.sheathed), cape:!!(hr && hr.cape), gc:!!(hr && hr.cape && hr.cape.userData.gc), fit:!!(hr && hr.shd && hr.shd.items.some(it=>it.fit)) };
    if (hr && hr.shd){ hr.shd.items.forEach(it=>{ it.fit = null; }); const t0 = performance.now(); m3dCapeGearFit(hr); const t1 = performance.now(); m3dCapeGearCeil(hr); out.hero.ms = [+(t1 - t0).toFixed(1), +(performance.now() - t1).toFixed(1)]; }
    return out; });
  await page.screenshot({ path:SHOTS + '/rs751_hero.png' });
  console.log(JSON.stringify(r));
  for (const o of r.sets) A(o.gear > 0 && o.fit && o.gc && o.over===0, 'the cape lies under the gear: ' + JSON.stringify(o));
  A(!r.bare.cape && !r.bare.fit && !r.bare.pos0, 'without a cape the gear is slung as before: ' + JSON.stringify(r.bare));
  A(r.hero.rig && r.hero.sheathed && r.hero.cape && r.hero.gc && r.hero.fit, 'your own figure: ' + JSON.stringify(r.hero));
  A(r.hero.ms[0] + r.hero.ms[1] < 40, 'quick to work out: ' + JSON.stringify(r.hero.ms));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
