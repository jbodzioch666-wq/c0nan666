// RS-516: a robe's skirt is cloth near you - carried with momentum after the shape the legs give it, so it trails behind as you
// walk, flares on a turn and settles when you stop - while your legs stay inside it the whole way; folk further off keep the plain
// pose, and sitting keeps its folds
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.chest = rsMakeArmour('cloth', 3, 'chest'); G.gear.legs = rsMakeArmour('cloth', 3, 'legs');
    const T = THREE, e = m3dInstance({}, rsPlayerLook()), sc = new T.Scene(); sc.add(e.holder); const rg = e.rig, sk = rg.skirt; const hero0 = m3dClothHero; m3dClothHero = ()=>e;   /* (this figure is you, for the test) */
    const out = {}; let t = 0, worstOut = 0, ms = 0, calls = 0;
    const oc = m3dSkirtCloth; m3dSkirtCloth = function(){ const t0 = performance.now(); try{ return oc.apply(this, arguments); } finally { ms += performance.now() - t0; calls++; } };
    /* the legs inside the skirt: each leg vertex no further from the axis than the skirt reaches at its height and side */
    const clip = ()=>{ e.holder.updateMatrixWorld(true); const inv = sk.matrixWorld.clone().invert(), sp = sk.geometry.attributes.position, v = new T.Vector3(), pts = [];
      for (let i=0;i<sp.count;i++) pts.push([sp.getX(i), sp.getY(i), sp.getZ(i)]);
      let o2 = 0, tot = 0; rg.legs.forEach(L=>L.hip.traverse(o=>{ if (!o.isMesh) return; const gp = o.geometry.attributes.position; for (let i=0;i<gp.count;i+=3){ v.fromBufferAttribute(gp, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
        if (v.y > 0.2 || v.y < -0.23) continue; tot++; let reach = 0; const ang = Math.atan2(v.x, v.z); for (const q of pts){ if (Math.abs(q[1]-v.y) > 0.05) continue; let da = Math.abs(Math.atan2(q[0], q[2]) - ang); if (da > Math.PI) da = 2*Math.PI - da; if (da < 0.35) reach = Math.max(reach, Math.hypot(q[0], q[2])); }
        if (Math.hypot(v.x, v.z) > reach + 0.01) o2++; } })); return tot ? o2/tot : 0; };
    const hem = ()=>{ const u = sk.userData.phys, prm = sk.geometry.parameters, W = prm.radialSegments + 1, row = prm.heightSegments, A = sk.geometry.attributes.position.array; let b = 0, nb = 0; for (let c2=0;c2<W-1;c2++){ const i = row*W + c2; if (A[i*3+2] < -0.03){ nb++; b += u.O[i*3+2]; } } return b/nb; };
    const step = async (vz, n, turn, check)=>{ for (let i=0;i<n;i++){ t += 1/60; e.holder.position.z += vz/60; if (turn) e.holder.rotation.y += turn/60; m3dPoseHumanoid(rg, t, vz ? 1 : 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); if (check && i%5===0) worstOut = Math.max(worstOut, clip()); await new Promise(r2=>setTimeout(r2, 16)); } };
    await step(0, 30);
    await step(1.6, 60, 0, true); out.trail = +hem().toFixed(4);
    await step(0, 8, 6, true); out.turnFlare = +Math.max(...Array.from(sk.userData.phys.O).map(Math.abs)).toFixed(4);
    await step(0, 180); out.settled = sk.userData.phys.rest; out.restOff = +Math.max(...Array.from(sk.userData.phys.O).map(Math.abs)).toFixed(5);
    out.worstOut = +worstOut.toFixed(3); out.msPer = +(ms/Math.max(1, calls)).toFixed(3);
    /* far off: the plain pose */
    const e2 = m3dInstance({}, rsPlayerLook()); sc.add(e2.holder); e2.holder.position.set(40, 0, 40); e2.holder.updateMatrixWorld(true); for (let i=0;i<10;i++){ m3dPoseHumanoid(e2.rig, i/60, 1, 0, 0, 0, e2); e2.holder.updateMatrixWorld(true); }
    out.farCloth = !!(e2.rig.skirt.userData.phys && !e2.rig.skirt.userData.phys.fresh);
    m3dSkirtCloth = oc; m3dClothHero = hero0; return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.trail < -0.02, 'walking, the back of the hem trails behind its pose');
  A(r.turnFlare > 0.01, 'a turn flares it');
  A(r.settled && r.restOff < 0.003, 'standing, it settles back to hang as posed');
  A(r.worstOut < 0.02, 'the legs stay inside the robe the whole way');
  A(!r.farCloth, 'a figure far from you keeps the plain pose');
  A(r.msPer < 2, 'cheap: under 2ms a frame for the robe');
};
