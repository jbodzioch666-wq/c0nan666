// RS-458: a cloak is cloth - pinned at the neck and shoulders, it hangs still when you stand, trails out behind as you walk (its points
// stay where they were in the world as the body moves on), settles back when you stop, and never passes through the back or the striding legs
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const T = THREE; G.gear.cape = rsMakeCape(30); rsSync && rsSync(); const e = m3dInstance({}, rsPlayerLook()), c = e.rig.cape, ud = c.userData;
    const step = (n, speed, moving)=>{ let t = 0; for (let i=0;i<n;i++){ t += 1/60; e.holder.position.z += speed/60; m3dPoseHumanoid(e.rig, 5 + i/60, moving, 0, 0, 0, e); e.holder.updateMatrixWorld(true); m3dCapeCloth(c, e.rig, 1/60); } };
    const pos = ()=>Float32Array.from(c.geometry.attributes.position.array), N = ud.grid[0] + 1, rows = ud.grid[1] + 1, hemAt = (A, k)=>{ let s = 0; for (let i=0;i<N;i++) s += A[((rows - 1)*N + i)*3 + k]; return s/N; };
    const topMove = (A, B)=>{ let m = 0; for (let i=0;i<N*2;i++) m = Math.max(m, Math.hypot(A[i*3] - B[i*3], A[i*3+1] - B[i*3+1], A[i*3+2] - B[i*3+2])); return m; };
    // and how much of it is inside the body: the torso's chest mesh, by ray parity
    const inside = ()=>{ e.holder.updateMatrixWorld(true); const ch = e.rig.chestMesh, side = ch.material.side; ch.material.side = T.DoubleSide; const ps = c.geometry.attributes.position, ray = new T.Raycaster(), v = new T.Vector3(); let n = 0;
      for (let i=0;i<ps.count;i++){ v.fromBufferAttribute(ps, i); c.localToWorld(v); ray.set(v, new T.Vector3(0.3, 1, 0.2).normalize()); if (ray.intersectObject(ch, false).length % 2) n++; }
      ch.material.side = side; return n/ps.count; };
    m3dPoseHumanoid(e.rig, 5, 0, 0, 0, 0, e); const rest = pos(), in0 = inside(); step(90, 0, 0); const still = pos(), in1 = inside();
    const hz0 = hemAt(rest, 2), hy0 = hemAt(rest, 1), sag = Math.abs(hemAt(still, 2) - hz0) + Math.abs(hemAt(still, 1) - hy0);
    step(120, 2.2, 1); const walk = pos(), trail = hz0 - hemAt(walk, 2), lift = hemAt(walk, 1) - hy0;
    let worst = 0; for (let i=0;i<40;i++){ step(3, 2.2, 1); worst = Math.max(worst, inside()); }
    step(240, 0, 0); const back = pos(), settle = Math.abs(hemAt(back, 2) - hz0);
    e.holder.position.x += 40; step(1, 0, 0); const jumped = Math.abs(hemAt(pos(), 2) - hz0);   /* (moved far at once: it starts again hanging, not flung) */
    return { sim:!!ud.P, sag:+sag.toFixed(4), trail:+trail.toFixed(3), lift:+lift.toFixed(3), top:+topMove(rest, walk).toFixed(4), worst:+worst.toFixed(3), settle:+settle.toFixed(4), jumped:+jumped.toFixed(4), in0, in1 }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.sim, 'the cloak is simulated as cloth');
  A(r.sag < 0.03, 'standing, it hangs as it was cut');
  A(r.trail > 0.06 && r.lift > 0.01, 'walking, its hem trails out behind and rises');
  A(r.top < 0.002, 'its top stays pinned on the neck and shoulders');
  A(r.in0 <= 0.01 && r.in1 <= 0.01 && r.worst <= 0.01, 'striding, none of it passes into the body');
  A(r.settle < 0.03, 'stopped, it settles back');
  A(r.jumped < 0.03, 'moved far at once, it starts again hanging');
};
