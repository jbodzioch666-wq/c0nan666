// RS-536: beasts and dragons die lying on their side with their legs out of their bodies. The body balls are as big as the body
// really is (measured from its skin), so legs can't fold up into the belly; hips and chest each roll onto their side, the same way,
// across the spine whichever way the blow came (struck along its length, a bear was pitched onto its chest, rump in the air); the
// hips are kept square to the spine; a dragon's legs too are kept out of its body
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 9999; for (const m of G.mon) m.alive = 0; G.mon = [];
    { let best = null, bn = -1; for (let x=10;x<COLS-10;x++) for (let y=8;y<ROWS-8;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-4;i<=4;i++) for (let j=-4;j<=4;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } } p.x = best[0]; p.y = best[1]; }
    for (let i=-9;i<=9;i++) for (let j=-7;j<=7;j++){ if (G.map[p.x+i]){ G.map[p.x+i][p.y+j] = T_FLOOR; G.dungeonDeco[p.x+i][p.y+j] = ''; } } FPD.mapRef = null;
    const names = ['grizzly bear', 'owlbear', 'giant boar', 'giant elk', 'wolf', 'black dragon wyrmling'], out = { quads:[], dragons:[] };
    for (let run=0; run<3; run++){
      for (const m of G.mon) m.alive = 0; G.mon = [];
      names.forEach((nm, i)=>{ const m = newMonster(); Object.assign(m, { alive:1, x:p.x - 6 + i*2 + (run===1 ? 1 : 0), y:p.y + (run===2 ? -3 : 3), hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'D', nm, col:'#8f8', art:null, abilities:[] }); G.mon.push(m); });
      for (let i=0;i<300 && !(i > 10 && G.mon.every(m=>M3D.inst.get(m)));i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      const es = G.mon.map(m=>M3D.inst.get(m));
      G.mon.forEach(m=>{ m.alive = 0; m3dKill(m, { dmg:30, maxHp:20, kind:'melee', crit:true }); });
      FP.dt = 1/60; for (let f=0;f<480;f++) m3dSweep();
      es.forEach((e, i)=>{ if (!e || !e.chain) return; const P = e.chain.p, C = e.chain, up = (a, b)=>P[b].x.clone().sub(P[a].x).normalize();
        if (e.dkind==='quad'){ const sp = up(0, 1), uh = up(0, 2), uc = up(1, 3); let inside = 0;
          for (const [c, legs] of [[1, [6, 10]], [0, [14, 18]]]) for (const o of legs) for (const q of [o+2, o+3]){ const k = C.c.find(k2=>k2.i===c && k2.j===q && k2.hi > k2.lo*2); if (k && P[q].x.distanceTo(P[c].x) < (k.hi/3)*0.62) inside++; }   /* (an ankle or toe folded in well past where it stood) */
          out.quads.push({ nm:names[i], hips:+uh.y.toFixed(2), chest:+uc.y.toFixed(2), pitch:+uh.dot(sp).toFixed(2), inside }); }
        else if (e.dkind==='dragon'){ let inside = 0; const c = 0; P.forEach((q, k)=>{ if (k<3 || q.noFloor || q.fr===0) return; if (q.x.distanceTo(P[c].x) < P[c].r*0.7) inside++; }); out.dragons.push({ nm:names[i], inside, r:+P[0].r.toFixed(3) }); } }); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const side = r.quads.filter(q=>Math.abs(q.hips) <= 0.25 && Math.abs(q.chest) <= 0.25).length;
  A(r.quads.length >= 12 && side >= r.quads.length - 1, 'beasts lie on their side, hips and chest both: ' + side + '/' + r.quads.length);
  A(r.quads.filter(q=>q.pitch > 0.3).length===0, 'their hips are never pitched forward on the spine - no rump in the air');
  A(r.quads.every(q=>q.inside===0), 'no beast\'s legs inside its body');
  A(r.dragons.length >= 2 && r.dragons.every(d=>d.inside===0), 'no dragon\'s legs inside its body');
};
