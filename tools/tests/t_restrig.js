// RS-378: the rest of the bestiary dies as the beasts do. A dragon, a hydra or a crocodile falls as a chain of joints - one rigid body
// frame, every neck a chain to its muzzle, the tail a chain to its tip, each leg its bones to the toe - its wings folding as it goes,
// and ends on its side and still; a serpent dies as a rope of its own spine's points, its head end flung by the blow, and settles
// in a wavy line on the floor; a bird tumbles out of the air, wings sprawling, and lies. Every bone keeps its length; nothing goes
// through the floor or into a wall
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 9999; for (const m of G.mon) m.alive = 0; G.mon = [];
    { let best = null, bn = -1; for (let x=6;x<COLS-6;x++) for (let y=6;y<ROWS-6;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-4;i<=4;i++) for (let j=-4;j<=4;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } }
      p.x = best[0]; p.y = best[1]; }
    for (let i=-5;i<=5;i++) for (let j=-5;j<=5;j++){ G.map[p.x+i][p.y+j] = T_FLOOR; G.dungeonDeco[p.x+i][p.y+j] = ''; } FPD.mapRef = null;
    const names = ['black dragon wyrmling', 'hydra', 'giant constrictor snake', 'giant vulture', 'giant crocodile'], at = [[3, 0], [-3, 0], [0, 3], [0, -3], [3, 3]];
    names.forEach((nm, i)=>{ const m = newMonster(); Object.assign(m, { alive:1, x:p.x+at[i][0], y:p.y+at[i][1], hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'D', nm, col:'#8f8', art:null, abilities:[] }); G.mon.push(m); });
    for (let i=0;i<300 && !(i > 10 && G.mon.every(m=>M3D.inst.get(m)));i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const T = THREE, out = {}, es = G.mon.map(m=>M3D.inst.get(m));
    G.mon.forEach((m, i)=>{ m.alive = 0; m3dKill(m, { dmg:30, maxHp:20, kind:'melee', crit:true }); });
    const o = {}; es.forEach((e, i)=>{ o[names[i]] = { kind:e && e.dkind, chain:!!(e && e.chain), rd:!!(e && e.rd), n:e && e.chain ? e.chain.p.length : 0, low:9, err:0, inWall:0 }; });
    FP.dt = 1/60;
    const tile = (C, q)=>{ const a = C.rot, wx = C.hx + q.x*Math.cos(a) + q.z*Math.sin(a), wz = C.hz + (-q.x*Math.sin(a) + q.z*Math.cos(a)); return G.map[Math.floor(wx)] ? G.map[Math.floor(wx)][Math.floor(wz)] : undefined; };
    for (let f=0;f<300;f++){ m3dSweep(); es.forEach((e, i)=>{ const q = o[names[i]]; if (!e || !e.holder.parent) return; e.holder.updateMatrixWorld(true); const b = new T.Box3().setFromObject(e.holder); q.low = Math.min(q.low, +(b.min.y - e.holder.position.y).toFixed(3)); q.top = +(b.max.y - e.holder.position.y).toFixed(3);
      const C = e.chain; if (!C) return; for (const c of C.c){ if (c.lo!==c.hi) continue; const d = C.p[c.i].x.distanceTo(C.p[c.j].x); q.err = Math.max(q.err, +(Math.abs(d - c.lo)/c.lo).toFixed(3)); }
      for (const pt of C.p){ const t = tile(C, pt.x); if (t===undefined || t===T_WALL) q.inWall++; } }); }
    es.forEach((e, i)=>{ const q = o[names[i]]; if (!e) return; if (e.chain){ q.upY = +e.chain.upY.toFixed(2); q.rest = e.chain.rest > 0.3; q.thrown = +Math.hypot(e.chain.p[0].x.x - e.chain.x0.x, e.chain.p[0].x.z - e.chain.x0.z).toFixed(2); q.headY = e.rig.head ? +(e.rig.head.getWorldPosition(new T.Vector3()).y - e.holder.position.y).toFixed(2) : null;
        if (e.rig.wings) q.wing = +(e.rig.wings[0].w.rotation.z*e.rig.wings[0].s).toFixed(2); }   /* (folded is down on its own side) */
      else if (e.rd){ q.upY = +new T.Vector3(0, 1, 0).applyQuaternion(e.rd.q).y.toFixed(2); q.rest = e.rd.rest > 0.3; q.limp = e.rd.limp.length; } });
    return o; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const nm of ['black dragon wyrmling', 'hydra', 'giant crocodile']){ const o = r[nm]; A(o && o.chain && o.n > 20, nm+': dies as a chain of joints ('+(o && o.n)+')');
    A(o.err < 0.05 && o.low >= -0.03 && o.inWall===0, nm+': every bone keeps its length, nothing through the floor or a wall');
    A(o.upY < 0.6 && o.rest && o.thrown > 0.03, nm+': thrown by the blow, it ends on its side and still'); }
  A(r['black dragon wyrmling'].kind==='dragon' && r['black dragon wyrmling'].wing < 0, 'a dragon folds its wings as it falls');
  A(r['hydra'].n > 50, 'a hydra: five necks of joints');
  { const o = r['giant constrictor snake']; A(o.kind==='serpent' && o.chain && o.n >= 20, 'a serpent dies as a rope of its spine');
    A(o.err < 0.05 && o.low >= -0.03 && o.inWall===0 && o.rest && o.thrown > 0.03, 'the rope keeps its bones, lies on the floor, inside the walls, flung by the blow, and settles'); }
  { const o = r['giant vulture']; A(o.kind==='bird' && o.rd && o.limp >= 6, 'a bird tumbles as a ragdoll with limp wings, neck and legs');
    A(o.upY < 0.6 && o.rest && o.low >= -0.03, 'it ends down and still'); }
};
