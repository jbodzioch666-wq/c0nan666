// RS-360: the Black Spire is a landmark of its own - a black glass tower far from where you began, solid, on clear ground.
// Walking into it or tapping it is how you deal with it: sealed before the Waking Lich quests reach it, the quest's gate
// and knight's floor on the "go to" step, the six-floor climb after, and once the Wakener is dust an eight-floor tower of
// the dead you can climb whenever you like, where slayer kills count double
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, geo = owGeo(), lm = geo.landmarks.find(l=>l.id==='spire'); out.has = !!lm; if (!lm) return out;
    const sp = G.ow.spawnPos; out.far = Math.hypot(lm.x - sp.x, lm.y - sp.y); out.others = geo.landmarks.filter(l=>l.id!=='spire').map(l=>Math.hypot(l.x - lm.x, l.y - lm.y));
    out.wild = wgWildGen(lm.x, lm.y); out.tile = G.ow.map[lm.x][lm.y]; out.site = OW_SITE_TILES.includes(out.tile); out.foot = !!owLandmarkFoot(lm.x, lm.y); out.spireAt = sqSpire();
    // the model: tall, black, with its violet flame
    const o = o3LandmarkModel(lm); let meshes = 0, top = 0; o.g.traverse(q=>{ if (q.isMesh){ meshes++; top = Math.max(top, q.position.y); } }); out.meshes = meshes; out.top = top; out.hbH = o.hb.geometry.boundingBox ? 0 : (o.hb.geometry.computeBoundingBox(), o.hb.geometry.boundingBox.max.y);
    // sealed before the quest
    G.gameMode = 0; G.owPos = { x:lm.x+1, y:lm.y }; G.ui = 'playing'; tryMoveOverworld(-1, 0); out.stayed = G.owPos.x===lm.x+1; out.sealed = G.ui==='wevent' && /sealed/.test(G.wevDlg.text); setUi('playing');
    // the quest's "go to" step: the gate, the knight's floor, the climb
    sqP().lich8 = { step:1, state:'active', flags:{}, log:[], loc:{}, n:0, started:0, home:curTownKey() || (G.owPos.x+','+G.owPos.y) }; sqResolve('lich8', SQ.lich8.steps[1]);
    out.locIsSpire = sqP().lich8.loc[1].x===lm.x && sqP().lich8.loc[1].y===lm.y;
    tryMoveOverworld(-1, 0); out.gate = G.ui==='wevent' && /knight/.test(G.wevDlg.text); G.wevDlg.opts[0][1](); out.puzzle = G.ui==='sqpuzzle' && G.sqPz && G.sqPz.kind==='knight';
    if (G.sqPz){ const z = G.sqPz, prev = new Map([[0, null]]), q = [0]; while (q.length){ const c = q.shift(); if (c===z.goal) break; for (const n of sqKnightMoves(c)) if (!prev.has(n) && !z.crack.includes(n)){ prev.set(n, c); q.push(n); } }
      const path = []; let c = z.goal; while (c!==0){ path.unshift(c); c = prev.get(c); } for (const k of path) if (G.sqPz) sqPzKnight(k); }
    out.inSpire = G.gameMode===1 && G.siteKind==='necro' && G.spireRun===1 && G.dungeonMaxDepth===6 && G.dungeonSlot===MAX_SITE_SLOT+1 && G.dungeonEntrance.x===lm.x && G.dungeonEntrance.y===lm.y;
    loadLevel(G.dungeonMaxDepth, false); out.wakener = !!(G.isBossFloor && G.mon[G.bossIdx] && G.mon[G.bossIdx].sqBoss==='wakener');
    // a tapped Spire from next to it, mid-quest, offers the climb again
    G.gameMode = 0; G.mon = []; G.isBossFloor = 0; setUi('playing'); G.owPos = { x:lm.x+1, y:lm.y+1 }; out.near = !!sqSpireNear(); sqSpireApproach(); out.again = G.ui==='wevent' && /Wakener waits/.test(G.wevDlg.text); setUi('playing');
    // once the quest is done: the freed Spire, eight floors, slayer kills twice
    sqP().lich8 = { step:5, state:'done', flags:{}, log:[], loc:{}, n:0 }; tryMoveOverworld(-1, 0); out.freeDlg = G.ui==='wevent' && /silent/.test(G.wevDlg.text); G.wevDlg.opts[0][1]();
    out.freeRun = G.gameMode===1 && G.spireRun===1 && G.dungeonMaxDepth===8;
    const tp = tkP(); tp.slay.task = { kind:'fam', fam:Object.keys(MON_FAMILIES)[0], need:20, have:0 }; const fam = tp.slay.task.fam; const m = G.mon.find(q=>q.alive) || { nm:'x', maxHp:5 }; tkMatch = ()=>true; tkOnKill(m); out.double = tp.slay.task.have===2; tp.slay.task = null;
    G.gameMode = 0; G.mon = []; setUi('playing'); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.has && r.far > 25 && !r.wild && r.others.every(d=>d >= 10) && !r.site && r.foot, 'the Spire stands far off, clear of sites and the other landmarks, solid');
  A(r.spireAt.x===r.spireAt.x && r.meshes >= 15 && r.top > 16 && r.hbH >= 18, 'a tall black tower with its flame and a hit box to tap');
  A(r.stayed && r.sealed, 'before the quest, its gate is sealed');
  A(r.locIsSpire && r.gate && r.puzzle && r.inSpire && r.wakener, 'on the quest: the gate, the knight\'s floor, six floors, the Wakener');
  A(r.near && r.again, 'tapped from beside it mid-quest, it offers the climb again');
  A(r.freeDlg && r.freeRun && r.double, 'after the quest: eight floors of the dead, slayer kills counting double');
};
