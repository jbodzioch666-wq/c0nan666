// (probe, not in ALL) a raised minion's rise, frame by frame: its age, height and lean as drawn
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); for (const m of G.mon) m.alive = 0;
    for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r));
    { const def = NECRO_MINIONS[0], m = { k:def.k, nm:'your ' + def.nm, x:G.player.x, y:G.player.y }; for (let i=0;i<900 && !M3D.inst.get(necroProxy(m));i++){ sk3Update(necroProxy(m), necroProxy(m)._pos, 0, 0); await new Promise(r=>requestAnimationFrame(r)); } const e = M3D.inst.get(necroProxy(m)); if (e && e.holder.parent) e.holder.parent.remove(e.holder); }
    const o0 = window.necroRise; window.__nr = []; window.necroRise = (m, px, H)=>{ o0(m, px, H); const e = M3D.inst.get(px); window.__nr.push([H, e ? +e.holder.position.y.toFixed(2) : 'x']); };
    skAdd(RS_BONES[0][0], 3); necroRaise('skeleton'); const m = necroMinions().slice(-1)[0]; const out = [];
    const orig = necroRise; window.necroRiseCalls = 0;
    for (let i=0;i<40;i++){ await new Promise(r=>requestAnimationFrame(r)); const e = M3D.inst.get(necroProxy(m)); out.push([((Date.now() - m.raisedAt)/1000).toFixed(2), e ? +e.holder.position.y.toFixed(2) : 'x', e ? +e.holder.rotation.x.toFixed(2) : 'x', e && e._rising, 0, m.x + ',' + m.y]); }
    return { out:out.slice(0, 12), nr:window.__nr.slice(0, 12) }; });
  console.log(JSON.stringify(r));
};
