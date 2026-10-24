// RS-611: a raised minion crawls up out of the ground - sunk below the floor and hunched forward at first, the earth thrown up round it,
// then standing at full height on the floor with its ring under it. Shots: shots/rs611-rise.png, shots/rs611-up.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r0 = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); for (const m of G.mon) m.alive = 0;
    for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r));
    /* its figure made first (as when one's been raised before), so the rise itself is what's watched */
    { const def = NECRO_MINIONS[0], m = { k:def.k, nm:'your ' + def.nm, x:G.player.x, y:G.player.y }; for (let i=0;i<900 && !M3D.inst.get(necroProxy(m));i++){ sk3Update(necroProxy(m), necroProxy(m)._pos, 0, 0); await new Promise(r=>requestAnimationFrame(r)); } const e = M3D.inst.get(necroProxy(m)); if (e && e.holder.parent) e.holder.parent.remove(e.holder); }
    skAdd(RS_BONES[0][0], 3); const n0 = FP.parts.length; necroRaise('skeleton'); const m = necroMinions().slice(-1)[0];
    for (let i=0;i<12;i++) await new Promise(r=>requestAnimationFrame(r));
    const e = M3D.inst.get(necroProxy(m)); return { raised:!!m, at:!!(m && m.raisedAt), fig:!!e, y:e ? +e.holder.position.y.toFixed(2) : null, lean:e ? +e.holder.rotation.x.toFixed(2) : null, ring:e && e._ring ? e._ring.visible : null, parts:FP.parts.length - n0 }; });
  await page.waitForTimeout(250); await page.screenshot({ path: SHOTS + '/rs611-rise.png' });
  await page.waitForTimeout(2000); await page.screenshot({ path: SHOTS + '/rs611-up.png' });
  const r1 = await page.evaluate(()=>{ const m = necroMinions().slice(-1)[0], e = M3D.inst.get(necroProxy(m)); return { y:+e.holder.position.y.toFixed(3), lean:+e.holder.rotation.x.toFixed(3), heave:+e.holder.rotation.z.toFixed(3), ring:e._ring ? +e._ring.position.y.toFixed(3) : null, ringOn:e._ring ? e._ring.visible : null }; });
  const out = { r0, r1 }; console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(r0.raised && r0.at && r0.fig, 'raised, with the moment it was');
  A(r0.y < -0.3 && r0.lean > 0.2, 'at first sunk below the floor and hunched forward');
  A(r0.ring===false, 'its ring hidden while it climbs out (it would tip with it)');
  A(r0.parts > 0, 'the earth thrown up round it');
  A(Math.abs(r1.y) < 0.01 && Math.abs(r1.lean) < 1e-3 && Math.abs(r1.heave) < 1e-3 && Math.abs(r1.ring - 0.025) < 1e-3 && r1.ringOn, 'then standing on the floor, ringed');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
