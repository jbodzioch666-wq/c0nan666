// RS-371: every kind of creature dies its own way. Four-legged beasts roll onto their side, legs kicking then limp; folk on two
// legs are knocked back off their feet, arms and legs flopping, the weapon and shield flying from their hands to land on their
// own; skeletons fall apart into a heap of bones; oozes slump into a puddle; ghosts rise and thin away to nothing. Nothing goes
// through the floor. And the harder the killing blow, the harder the throw
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 9999; for (const m of G.mon) m.alive = 0; G.mon = [];
    { let best = null, bn = -1; for (let x=5;x<COLS-5;x++) for (let y=5;y<ROWS-5;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } }
      p.x = best[0]; p.y = best[1]; }
    for (let i=-4;i<=4;i++) for (let j=-4;j<=4;j++){ G.map[p.x+i][p.y+j] = T_FLOOR; G.dungeonDeco[p.x+i][p.y+j] = ''; }   /* (an open room) */
    FPD.mapRef = null; for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); }
    const names = ['wolf','goblin warrior','skeleton warrior','gray ooze','ghost','wolf','wolf'], at = [[2,0],[-2,0],[0,2],[0,-2],[2,2],[-2,-2],[2,-2]];
    names.forEach((nm, i)=>{ const m = newMonster(); Object.assign(m, { alive:1, x:p.x+at[i][0], y:p.y+at[i][1], hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'s', nm, col:'#8f8', art:null, abilities:[] }); if (nm==='ghost' || /skelet/.test(nm)) m.undead = true; G.mon.push(m); });
    for (let i=0;i<300 && !(i > 10 && G.mon.every(m=>M3D.inst.get(m)));i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }   /* (the skeleton's bones are sculpted in the background) */
    const es = G.mon.map(m=>M3D.inst.get(m)), out = { have:es.map(e=>!!e) }, T = THREE;
    const hits = [null, null, null, null, null, { dmg:2, maxHp:20, kind:'melee' }, { dmg:60, maxHp:20, kind:'melee', crit:true }];
    G.mon.forEach((m, i)=>{ m.alive = 0; m3dKill(m, hits[i]); });
    out.kind = es.map(e=>e && e.dkind);
    const low = es.map(()=>9), lowOf = o=>{ o.updateMatrixWorld(true); const b = new T.Box3().setFromObject(o); return b.isEmpty() ? 9 : b.min.y; };
    const s0 = es.map(e=>e && e.s0 ? e.s0.y : 1), c0 = es.map(e=>e && e.rd ? e.rd.c0.clone() : null);
    FP.dt = 1/60; let travel = null;
    for (let f=0;f<240;f++){ m3dSweep(); es.forEach((e,i)=>{ if (!e || !e.holder.parent || i===4) return; low[i] = Math.min(low[i], lowOf(e.holder)); });
      if (f===50) travel = [5, 6].map(i=>es[i] && es[i].rd ? Math.hypot(es[i].rd.x.x - c0[i].x, es[i].rd.x.z - c0[i].z) : null); }
    out.minLow = low.map(v=>+v.toFixed(3)); out.travel = travel && travel.map(v=>v===null ? null : +v.toFixed(3));
    const wolf = es[0], man = es[1], bones = es[2], ooze = es[3], ghost = es[4];
    out.wolfUp = wolf && wolf.rd ? +new T.Vector3(0,1,0).applyQuaternion(wolf.rd.q).y.toFixed(2) : null; out.wolfRest = !!(wolf && wolf.rd && wolf.rd.rest > 0.3);
    out.manUp = man && man.chain ? +man.chain.upY.toFixed(2) : man && man.rd ? +new T.Vector3(0,1,0).applyQuaternion(man.rd.q).y.toFixed(2) : null; out.drops = man && man.drops ? man.drops.length : 0;   /* (RS-376: a chain of joints) */
    out.dropsDown = man && man.drops ? man.drops.every(R=>R.rest > 0.2 && R.x.y < 0.5) : false; out.dropsAway = man && man.drops ? man.drops.map(R=>+Math.hypot(R.x.x - R.c0.x, R.x.z - R.c0.z).toFixed(2)) : [];
    out.limp = man && man.chain ? man.chain.p.length : man && man.rd ? man.rd.limp.length : 0;
    out.bones = bones && bones.parts ? bones.parts.length : 0; out.bonesDown = bones && bones.parts ? bones.parts.filter(R=>R.x.y < 0.35).length : 0;
    out.ooze = ooze ? +(ooze.root.scale.y/s0[3]).toFixed(2) : null;
    out.ghostGone = ghost ? !ghost.holder.parent : null;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.have.every(x=>x), 'all seven have 3D models');
  A(r.kind.join()==='quad,man,bones,ooze,ghost,quad,quad', 'each dies its own way: '+r.kind);
  A(r.minLow.every((v, i)=>i===4 || v >= -0.03), 'nothing goes through the floor: '+r.minLow);
  A(r.wolfRest && r.wolfUp < 0.6, 'the wolf rolls onto its side and settles');
  A(r.manUp < 0.6 && r.limp >= 8, 'the goblin is knocked off its feet, a chain of joints (RS-376)');
  A(r.drops >= 1 && r.dropsDown && r.dropsAway.every(d=>d > 0.05), 'its weapon flies from its hand and lands');
  A(r.bones >= 8 && r.bonesDown >= r.bones - 1, 'the skeleton falls apart into bones on the floor');
  A(r.ooze < 0.3, 'the ooze slumps into a puddle');
  A(r.ghostGone, 'the ghost dissolves and is gone');
  A(r.travel && r.travel[1] > r.travel[0]*1.3, 'a crushing blow throws harder than a light one: '+r.travel);
};
