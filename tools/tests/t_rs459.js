// RS-459: a cloak stays calm when the body is turned on the spot in one frame, lunges or runs fast (it used to be whipped round and bounce
// wildly, through the body), and it drapes over a dragonborn's or a tiefling's tail instead of the tail poking through it
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const T = THREE, out = {}; G.gear.cape = rsMakeCape(30); rsSync && rsSync();
    const make = tail=>{ const L = rsPlayerLook(); if (tail) L.o = Object.assign({}, L.o, { tail, tailCol:'#7a5a2a' }); return m3dInstance({}, L); };
    const step = (e, n, f)=>{ for (let i=0;i<n;i++){ if (f) f(i); m3dPoseHumanoid(e.rig, 5 + i/60, 1, 0, 0, 0, e); e.holder.updateMatrixWorld(true); m3dCapeCloth(e.rig.cape, e.rig, 1/60); } };
    const inBody = e=>{ e.holder.updateMatrixWorld(true); const c = e.rig.cape, ch = e.rig.chestMesh, side = ch.material.side; ch.material.side = T.DoubleSide; const ps = c.geometry.attributes.position, ray = new T.Raycaster(), v = new T.Vector3(); let n = 0;
      for (let i=0;i<ps.count;i++){ v.fromBufferAttribute(ps, i); c.localToWorld(v); ray.set(v, new T.Vector3(0.3, 1, 0.2).normalize()); if (ray.intersectObject(ch, false).length % 2) n++; } ch.material.side = side; return n/ps.count; };
    // turned on the spot, back and forth, a quarter turn a frame; lunging; and running at 8 a second: the fastest any point moves a frame
    const e = make(null), c = e.rig.cape; m3dPoseHumanoid(e.rig, 5, 0, 0, 0, 0, e); step(e, 60);
    let fast = 0, worst = 0, prev = Float32Array.from(c.geometry.attributes.position.array);
    const watch = ()=>{ const a = c.geometry.attributes.position.array; for (let i=0;i<a.length;i+=3) fast = Math.max(fast, Math.hypot(a[i] - prev[i], a[i+1] - prev[i+1], a[i+2] - prev[i+2])); prev = Float32Array.from(a); worst = Math.max(worst, inBody(e)); };
    const ph = {}, phase = (k, n, f)=>{ fast = 0; worst = 0; step(e, n, i=>{ f(i); watch(); }); ph[k] = [+fast.toFixed(3), +worst.toFixed(3)]; };
    phase('turn', 40, i=>{ e.holder.rotation.y += (i%20 < 10 ? 1 : -1)*Math.PI/2; }); const F1 = ph.turn;
    phase('lunge', 40, i=>{ e.holder.position.z += (i%6 < 3 ? 0.06 : -0.06); });
    phase('run', 60, ()=>{ e.holder.position.z += 8/60; }); out.ph = ph; fast = Math.max(...Object.values(ph).map(v=>v[0])); worst = Math.max(...Object.values(ph).map(v=>v[1]));
    out.fast = +fast.toFixed(4); out.worst = +worst.toFixed(3);
    // a tail under it: how much of the cloak is inside the tail, standing and walking
    for (const tail of ['dragon', 'spade']){ const e2 = make(tail), c2 = e2.rig.cape, tl = e2.rig.tail; m3dPoseHumanoid(e2.rig, 5, 0, 0, 0, 0, e2);
      const inTail = ()=>{ e2.holder.updateMatrixWorld(true); const ps = c2.geometry.attributes.position, v = new T.Vector3(), a = new T.Vector3(), b = new T.Vector3(), s = new T.Vector3(); let n = 0;
        for (let i=0;i<ps.count;i++){ v.fromBufferAttribute(ps, i); c2.localToWorld(v); tl.worldToLocal(v);
          for (const [a0, a1, rad] of tl.userData.caps){ s.subVectors(a1, a0); const t = Math.max(0, Math.min(1, b.subVectors(v, a0).dot(s)/s.lengthSq())); if (a.copy(a0).addScaledVector(s, t).distanceTo(v) < rad*0.9){ n++; break; } } }
        return n/ps.count; };
      const before = inTail(); step(e2, 120); const still = inTail(); let walk = 0; step(e2, 90, i=>{ e2.holder.position.z += 2/60; if (i%10===0) walk = Math.max(walk, inTail()); });
      out[tail] = { caps:tl.userData.caps.length, before:+before.toFixed(3), still:+still.toFixed(3), walk:+walk.toFixed(3) }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.fast < 0.11, 'snap turns, lunges and a fast run never fling the cloth: '+r.fast);
  A(r.worst <= 0.01, 'and none of it passes into the body: '+r.worst);
  for (const k of ['dragon', 'spade']){ A(r[k].caps > 0, 'the '+k+' tail has a shape for the cloak to rest on'); A(r[k].still <= 0.01 && r[k].walk <= 0.01, 'the cloak drapes over the '+k+' tail'); }
};
