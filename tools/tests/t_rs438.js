// RS-438: a dead boar lies on its side, its legs out, its mouth shut and its head in line with its neck - it gaped a red trough, its head
// wrung round and its jaw slab hanging clear of its snout; and its jaw meets its snout alive too
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 99999; for (const m of G.mon) m.alive = 0; G.mon = []; tickMonsters = ()=>{};
    { let best = null, bn = -1; for (let x=4;x<COLS-4;x++) for (let y=4;y<ROWS-4;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } } p.x = best[0]; p.y = best[1]; }
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); } }, T = THREE, out = [];
    for (const kind of ['melee','magic','ranged','melee']){
      const m = newMonster(); Object.assign(m, { alive:1, x:p.x+1, y:p.y+1, hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'p', nm:'giant boar', col:'#8f8', art:null, abilities:[] }); G.mon = [m];
      await fr(25); const e = M3D.inst.get(m), r = e.rig; const jy = r.jaw.position.y;
      m.alive = 0; m3dKill(m, { dmg:20, maxHp:20, kind }); FP.dt = 1/60; let maxHead = 0, a0 = null;
      for (let f=0; f<220; f++){ FP.t += 1/60; m3dSweep(); const C = e.chain; if (C && C.t > 0.2){ const a = new T.Vector3().subVectors(C.p[4].x, C.p[24].x).normalize(), b = new T.Vector3().subVectors(C.p[5].x, C.p[4].x).normalize(); const ang = Math.acos(Math.max(-1, Math.min(1, a.dot(b))))*57.3; if (a0===null) a0 = ang; maxHead = Math.max(maxHead, Math.abs(ang - a0)); } else if (C && a0===null){ const a = new T.Vector3().subVectors(C.p[4].x, C.p[24].x).normalize(), b = new T.Vector3().subVectors(C.p[5].x, C.p[4].x).normalize(); a0 = Math.acos(Math.max(-1, Math.min(1, a.dot(b))))*57.3; } }
      e.holder.updateMatrixWorld(true); const jw = new T.Vector3(0,0,1).transformDirection(r.jaw.matrixWorld), hd = new T.Vector3(0,0,1).transformDirection(r.head.matrixWorld);
      out.push({ chain:!!e.chain, up:e.chain ? +e.chain.upY.toFixed(2) : null, jaw:+(Math.acos(Math.max(-1, Math.min(1, jw.dot(hd))))*57.3).toFixed(1), head:+maxHead.toFixed(0), jy:+jy.toFixed(4), jw:+r.jaw.scale.x.toFixed(2) });
      if (e.holder.parent){ e.holder.parent.remove(e.holder); M3D.live.delete(e); } }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.every(x=>x.chain && x.up < 0.7), 'a dead boar goes down onto its side');
  A(r.every(x=>x.jaw < 3), 'its mouth stays shut');
  A(r.every(x=>x.head < 30), 'its head turns little from how it held it');
  A(r.every(x=>x.jy > -0.022 && x.jw > 1.3), 'its jaw meets its snout, as wide as its mouth');
};
