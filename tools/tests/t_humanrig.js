// RS-376: the two-legged figure rebuilt toward the skeleton's standard. Its chest bends and turns at a waist above the belt while
// the pelvis stays with the legs (the torso is two sculpts); it has ankles; it walks with a pelvis that sways, dips and twists, a
// waist that turns against it, knees that fold and straighten, arms that swing, and feet that lie flat through the stance, push
// off and lift. Killed, it falls as a chain of eighteen joints: every bone keeps its length, knees fold forward and elbows back,
// nothing goes through the floor or into a wall, and it ends up down and still
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 9999; for (const m of G.mon) m.alive = 0; G.mon = [];
    { let best = null, bn = -1; for (let x=5;x<COLS-5;x++) for (let y=5;y<ROWS-5;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } }
      p.x = best[0]; p.y = best[1]; }
    for (let i=-4;i<=4;i++) for (let j=-4;j<=4;j++){ G.map[p.x+i][p.y+j] = T_FLOOR; G.dungeonDeco[p.x+i][p.y+j] = ''; } FPD.mapRef = null;
    const m = newMonster(); Object.assign(m, { alive:1, x:p.x+2, y:p.y, hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin warrior', col:'#8f8', art:null, abilities:[] }); G.mon.push(m);
    for (let i=0;i<60 && !M3D.inst.get(m);i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const e = M3D.inst.get(m), rg = e.rig, out = {}, T = THREE, TAU = Math.PI*2;
    out.rig = { waist:+rg.torso.position.y.toFixed(3), inner:!!(rg.torsoIn && rg.torsoIn.parent===rg.torso), pelvis:!!(rg.pelvisMesh && rg.pelvisMesh.parent===rg.hips), chest:!!(rg.chestMesh && rg.chestMesh.parent===rg.torsoIn), ankles:rg.legs.every(L=>!!L.ankle) };
    // the walk, sampled over a stride (the stride phase is set by hand, so the samples are the cycle, not the clock)
    const pose = (ph, mv)=>{ e.wph = ph; e._lt = performance.now()/1000; m3dPoseHumanoid(rg, 1 + ph*0.1, mv, 0, 0, 0, e); };
    const L0 = rg.legs[0], foot = ()=>L0.hip.rotation.x + L0.knee.rotation.x + L0.ankle.rotation.x + rg.hips.rotation.x, samples = [];
    for (let i=0;i<24;i++){ pose(i/24*TAU, 1); samples.push({ hx:rg.hips.position.x, hy:rg.hips.position.y, hr:rg.hips.rotation.y, tr:rg.torso.rotation.y, hip:L0.hip.rotation.x, knee:L0.knee.rotation.x, ank:L0.ankle.rotation.x, arm:rg.arms[0].sh.rotation.x }); }
    const rng = k=>Math.max(...samples.map(q=>q[k])) - Math.min(...samples.map(q=>q[k]));
    out.walk = { sway:+rng('hx').toFixed(3), bob:+rng('hy').toFixed(3), twist:+rng('hr').toFixed(2), counter:samples.every(q=>Math.abs(q.hr) < 0.01 || Math.sign(q.tr)===-Math.sign(q.hr)), hip:+rng('hip').toFixed(2), knee:+rng('knee').toFixed(2), ankle:+rng('ank').toFixed(2), arm:+rng('arm').toFixed(2) };
    pose(2.9, 1); out.flatMid = +foot().toFixed(3); pose(0, 0); out.flatStand = +foot().toFixed(3);
    pose(4.55, 1); out.pushOff = +L0.ankle.rotation.x.toFixed(2); pose(5.9, 1); out.swingLift = +L0.ankle.rotation.x.toFixed(2);
    // the chain
    m.alive = 0; m3dKill(m, { dmg:30, maxHp:20, kind:'melee', crit:true }); out.chain = !!e.chain && !e.rd; out.n = e.chain ? e.chain.p.length : 0;
    if (!e.chain) return out;
    const C = e.chain; FP.dt = 1/60; let low = 9, maxErr = 0, inWall = 0, kneeBad = 0, elbowBad = 0;
    const tile = q=>{ const a = C.rot, wx = C.hx + q.x*Math.cos(a) + q.z*Math.sin(a), wz = C.hz + (-q.x*Math.sin(a) + q.z*Math.cos(a)); return G.map[Math.floor(wx)] ? G.map[Math.floor(wx)][Math.floor(wz)] : undefined; };
    for (let f=0;f<240;f++){ m3dSweep(); if (!e.holder.parent) break; e.holder.updateMatrixWorld(true); const b = new T.Box3().setFromObject(e.holder); low = Math.min(low, b.min.y - e.holder.position.y);
      for (const c of C.c){ if (c.lo!==c.hi) continue; const d = C.p[c.i].x.distanceTo(C.p[c.j].x); maxErr = Math.max(maxErr, Math.abs(d - c.lo)/c.lo); }
      for (const q of C.p){ const t = tile(q.x); if (t===undefined || t===T_WALL) inWall++; }
      if (f > 60){ const X = new T.Vector3().subVectors(C.p[7].x, C.p[4].x).normalize(), Y = new T.Vector3().subVectors(C.p[2].x, C.p[1].x).normalize(), F = new T.Vector3().crossVectors(X, Y).normalize();
        const side = (a, j, b)=>new T.Vector3().copy(C.p[j].x).sub(new T.Vector3().addVectors(C.p[a].x, C.p[b].x).multiplyScalar(0.5)).dot(F);
        if (side(10, 11, 12) < -0.01 || side(14, 15, 16) < -0.01) kneeBad++; if (side(4, 5, 6) > 0.01 || side(7, 8, 9) > 0.01) elbowBad++; } }
    out.low = +low.toFixed(3); out.err = +maxErr.toFixed(3); out.inWall = inWall; out.kneeBad = kneeBad; out.elbowBad = elbowBad;
    out.upY = +C.upY.toFixed(2); out.rest = C.rest > 0.3; out.pelvisY = +C.p[0].x.y.toFixed(2); out.headY = +C.p[3].x.y.toFixed(2); out.lift = +C.lift.toFixed(3);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.rig.waist===0.07 && r.rig.inner && r.rig.pelvis && r.rig.chest && r.rig.ankles, 'the rig: a waist pivot, the pelvis with the legs, the chest above the waist, ankles');
  A(r.walk.sway > 0.015 && r.walk.bob > 0.012 && r.walk.twist > 0.15 && r.walk.counter && r.walk.hip > 0.9 && r.walk.knee > 0.8 && r.walk.ankle > 0.5 && r.walk.arm > 0.5, 'the walk: the pelvis sways, bobs and twists against the waist; the legs, feet and arms swing');
  A(Math.abs(r.flatMid) < 0.03 && Math.abs(r.flatStand) < 0.03 && r.pushOff > 0.3 && r.swingLift < -0.1, 'the foot lies flat through the stance and standing, pushes off from the toes and lifts in the swing');
  A(r.chain && r.n===18, 'it dies as a chain of eighteen joints');
  A(r.low >= -0.03 && r.inWall===0 && r.err < 0.05, 'nothing goes through the floor or a wall, and every bone keeps its length');
  A(r.kneeBad===0 && r.elbowBad===0, 'knees fold forward, elbows back');
  A(r.upY < 0.6 && r.rest && r.pelvisY < 0.3, 'it ends up down and still');
};
