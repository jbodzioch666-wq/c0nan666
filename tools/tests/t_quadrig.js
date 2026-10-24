// RS-377: the four-legged beasts rebuilt toward the skeleton's standard. The forelegs and the neck hang from a chest that bends,
// twists and rolls about the middle of the back - the sculpted body bending with it, seamlessly - and every leg has a wrist or a
// hock. They trot: diagonal pairs swinging together, the body rising and settling twice a stride, the back flexing, the paws
// planted flat through the stance and tucked up through the swing. Killed, a beast falls as a chain of twenty-seven joints: every
// bone keeps its length, elbows fold back and stifles forward, nothing goes through the floor or a wall, and it ends on its side
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 9999; for (const m of G.mon) m.alive = 0; G.mon = [];
    { let best = null, bn = -1; for (let x=5;x<COLS-5;x++) for (let y=5;y<ROWS-5;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } }
      p.x = best[0]; p.y = best[1]; }
    for (let i=-4;i<=4;i++) for (let j=-4;j<=4;j++){ G.map[p.x+i][p.y+j] = T_FLOOR; G.dungeonDeco[p.x+i][p.y+j] = ''; } FPD.mapRef = null;
    const names = ['wolf', 'bear'], at = [[2, 0], [-2, 0]];
    names.forEach((nm, i)=>{ const m = newMonster(); Object.assign(m, { alive:1, x:p.x+at[i][0], y:p.y+at[i][1], hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'w', nm, col:'#8f8', art:null, abilities:[] }); G.mon.push(m); });
    for (let i=0;i<200 && !(i > 10 && G.mon.every(m=>M3D.inst.get(m)));i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const T = THREE, TAU = Math.PI*2, out = {};
    for (const m of G.mon){ const e = M3D.inst.get(m), rg = e.rig, o = {}; out[m.nm] = o; if (!e) continue;
      const fore = rg.legs.filter(L=>L.fz > 0), hind = rg.legs.filter(L=>L.fz < 0);
      o.rig = { chest:!!rg.chest && rg.chest.parent===rg.body, foreOnChest:fore.every(L=>L.hip.parent===rg.chest), hindOnBody:hind.every(L=>L.hip.parent===rg.body), neckOnChest:rg.neck.parent===rg.chest,
        ankles:rg.legs.every(L=>!!L.ank), bend:!!(rg.bodyMesh && rg.bodyMesh.material.userData.bendA), bendOwn:rg.bodyMesh.material!==M3D.meta.get(m3dTemplate(e.pt)).rig.bodyMesh.material };
      // the trot, sampled over a stride (the phase set by hand)
      const pose = (ph, mv)=>{ e.wph = ph; e._lt = performance.now()/1000; e.anim(rg, 1 + ph*0.1, mv, 0, 0, 0, e); e.holder.updateMatrixWorld(true); };
      const pawDir = L=>{ const q = L.paw.getWorldQuaternion(new T.Quaternion()); return new T.Vector3(0, 0, 1).applyQuaternion(q).y; }, pawY = L=>L.paw.getWorldPosition(new T.Vector3()).y - e.holder.position.y;
      const samples = []; for (let i=0;i<32;i++){ pose(i/32*TAU, 1); samples.push({ y:rg.body.position.y, fx:rg.chest.rotation.x, fy:rg.chest.rotation.y, uA:rg.legs[0].up.rotation.x, kA:rg.legs[0].knee.rotation.x }); }
      const rng = k=>Math.max(...samples.map(q=>q[k])) - Math.min(...samples.map(q=>q[k]));
      let peaks = 0; for (let i=0;i<32;i++){ const a = samples[(i+31)%32].y, b = samples[i].y, c = samples[(i+1)%32].y; if (b > a && b >= c) peaks++; }
      o.trot = { bob:+rng('y').toFixed(3), peaks, flex:+rng('fx').toFixed(3), twist:+rng('fy').toFixed(3), leg:+rng('uA').toFixed(2), knee:+rng('kA').toFixed(2) };
      pose(0, 1); const st = rg.legs.filter(L=>L.ph===0), sw = rg.legs.filter(L=>L.ph!==0);   // at phase 0 the legs with no offset stand mid-stance, the others swing
      o.stance = { flat:+Math.max(...st.map(L=>Math.abs(pawDir(L)))).toFixed(3), lift:+(Math.min(...sw.map(pawY)) - Math.max(...st.map(pawY))).toFixed(3), bendSync:rg.bodyMesh.material.userData.bendA.value.x===rg.chest.rotation.x && rg.bodyMesh.material.userData.bendA.value.y===rg.chest.rotation.y };
      pose(0, 0); const bots = rg.legs.map(L=>+(L.paw.getWorldPosition(new T.Vector3()).y - e.holder.position.y).toFixed(3));   /* (RS-379: the paw's joint, its mesh being skinned into the body) */ o.stand = { flat:+Math.max(...rg.legs.map(L=>Math.abs(pawDir(L)))).toFixed(3), low:+Math.max(...rg.legs.map(pawY)).toFixed(3), level:+Math.abs(rg.chest.rotation.x).toFixed(3), bots, down:Math.max(...bots) - Math.min(...bots) < 0.012 };
      // the chain
      m.alive = 0; m3dKill(m, { dmg:30, maxHp:20, kind:'melee', crit:true }); o.chain = !!e.chain && !e.rd; o.n = e.chain ? e.chain.p.length : 0;
      if (!e.chain) continue;
      const C = e.chain; FP.dt = 1/60; let low = 9, maxErr = 0, inWall = 0, elbowBad = 0, stifleBad = 0;
      const tile = q=>{ const a = C.rot, wx = C.hx + q.x*Math.cos(a) + q.z*Math.sin(a), wz = C.hz + (-q.x*Math.sin(a) + q.z*Math.cos(a)); return G.map[Math.floor(wx)] ? G.map[Math.floor(wx)][Math.floor(wz)] : undefined; };
      const __skinY = o=>{ o.updateMatrixWorld(true); const v = new THREE.Vector3(); let lo = Infinity; o.traverseVisible(m=>{ if (!m.isMesh || !m.geometry || !m.geometry.attributes.position || (m.material && m.material.visible===false)) return; const pa = m.geometry.attributes.position, st = Math.max(1, Math.floor(pa.count/300)); const at = i=>{ v.fromBufferAttribute(pa, i); if (m.isSkinnedMesh) m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); return v.y; }; let bi = 0, by = Infinity; for (let i=0;i<pa.count;i+=st){ const y = at(i); if (y < by){ by = y; bi = i; } } for (let i=Math.max(0, bi - st), n = Math.min(pa.count, bi + st); i<n; i++) by = Math.min(by, at(i)); lo = Math.min(lo, by); }); return lo; };   /* (RS-413: the skin itself - a skinned body's bounding box is its standing shape) */ for (let f=0;f<240;f++){ m3dSweep(); if (!e.holder.parent) break; e.holder.updateMatrixWorld(true); low = Math.min(low, __skinY(e.holder) - e.holder.position.y);
        for (const c of C.c){ if (c.lo!==c.hi) continue; const d = C.p[c.i].x.distanceTo(C.p[c.j].x); maxErr = Math.max(maxErr, Math.abs(d - c.lo)/c.lo); }
        for (const q of C.p){ const t = tile(q.x); if (t===undefined || t===T_WALL) inWall++; }
        if (f > 60){ const F = new T.Vector3().subVectors(C.p[1].x, C.p[0].x).normalize(), side = (a, j, b)=>new T.Vector3().copy(C.p[j].x).sub(new T.Vector3().addVectors(C.p[a].x, C.p[b].x).multiplyScalar(0.5)).dot(F);
          if (side(6, 7, 8) > 0.01 || side(10, 11, 12) > 0.01) elbowBad++; if (side(14, 15, 16) < -0.01 || side(18, 19, 20) < -0.01) stifleBad++; } }
      o.low = +low.toFixed(3); o.err = +maxErr.toFixed(3); o.inWall = inWall; o.elbowBad = elbowBad; o.stifleBad = stifleBad;
      o.upY = +C.upY.toFixed(2); o.rest = C.rest > 0.3; o.pelvisY = +C.p[0].x.y.toFixed(2); o.thrown = +Math.hypot(C.p[0].x.x - C.x0.x, C.p[0].x.z - C.x0.z).toFixed(2); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const nm of ['wolf', 'bear']){ const o = r[nm]; A(o && o.rig, nm+' is there');
    A(o.rig.chest && o.rig.foreOnChest && o.rig.hindOnBody && o.rig.neckOnChest && o.rig.ankles && o.rig.bend && o.rig.bendOwn, nm+': the rig - a chest carrying the forelegs and the neck, a bending body of its own, a wrist or a hock on every leg');
    A(o.trot.bob > 0.008 && o.trot.peaks===2 && o.trot.flex > 0.06 && o.trot.twist > 0.1 && o.trot.leg > 0.6 && o.trot.knee > 0.4, nm+': the trot - the body rises twice a stride, the back flexes and twists, the legs swing and fold');
    A(o.stance.flat < 0.12 && o.stance.lift > 0.015 && o.stance.bendSync, nm+': paws flat through the stance and lifted through the swing; the body bends with the chest');
    A(o.stand.flat < 0.1 && o.stand.low < 0.06 && o.stand.level < 0.001 && o.stand.down, nm+': standing square on flat paws, all four on the ground');
    A(o.chain && o.n===27, nm+': it dies as a chain of twenty-seven joints');
    A(o.low >= -0.03 && o.inWall===0 && o.err < 0.05, nm+': nothing goes through the floor or a wall, and every bone keeps its length');
    A(o.elbowBad===0 && o.stifleBad===0, nm+': elbows fold back, stifles forward');
    A(o.upY < 0.6 && o.upY > -0.6 && o.rest && o.thrown > 0.05, nm+': thrown by the blow, it ends on its side and still'); }
};
