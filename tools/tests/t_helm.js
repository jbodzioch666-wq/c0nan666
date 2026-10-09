// RS-281: helmets sculpted as the real things - a kettle hat with a brim, a great helm with visor slits and breathing holes
// that clears the nose, a spangenhelm skull cap with a nasal bar and cheek plates (plain, horned, winged or crested), a
// drooping wizard's hat, a hood draped to the shoulders; the hooded head type wears the same hood
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const prof = (g, fn)=>{ const p = g.attributes.position; let n = 0; for (let i=0;i<p.count;i++) if (fn(p.getX(i), p.getY(i), p.getZ(i))) n++; return { verts:p.count, n }; };
    out.kettle = prof(m3dHelmGeo('kettle'), (x, y, z)=>Math.hypot(x, z + 0.009) > 0.12);                           // the brim reaches out
    { const m = new THREE.Mesh(m3dHelmGeo('great'), new THREE.MeshBasicMaterial({ side:THREE.DoubleSide })), rc = new THREE.Raycaster();   // rays out through the visor slits pass; just above them they hit the wall
      const hits = (x, y)=>{ rc.set(new THREE.Vector3(x, y, 0.0), new THREE.Vector3(0, 0, 1)); return rc.intersectObject(m).length; };
      out.great = { slit:hits(0.03, 0.0855) + hits(-0.03, 0.0855), above:hits(0.03, 0.1) + hits(-0.03, 0.1), hole:hits(0.024, 0.06) }; }
    out.greatFront = prof(m3dHelmGeo('great'), (x, y, z)=>z > 0.098);
    out.skull = prof(m3dHelmGeo('skull'), (x, y, z)=>z > 0.07 && y < 0.06 && Math.abs(x) < 0.01);               // the nasal bar comes down over the nose
    out.wizard = prof(m3dHelmGeo('wizard'), (x, y, z)=>y > 0.27 && z < -0.09);                                   // the tip droops back
    out.hood = prof(m3dHelmGeo('hood'), (x, y, z)=>y < -0.02);                                                   // draped to the shoulders
    const wears = o=>{ const e = m3dInstance({}, HUM(o)); let sculpt = 0, horns = 0; e.rig.head.traverse(x=>{ if (x.isMesh && [...M3D.sculpt.entries()].some(([k, g])=>g===x.geometry && k.startsWith('helm|'))) sculpt++; if (x.isMesh && x.geometry.type==='BufferGeometry' && x.material.userData.kind==='horn') horns++; }); return { sculpt, horns }; };
    out.kw = wears({ helm:'kettle' }); out.gw = wears({ helm:'great' }); out.hw = wears({ helm:'horned' }); out.ww = wears({ helm:'wizard' }); out.cw = wears({ helm:'cowl' }); out.hd = wears({ head:'hood' }); out.none = wears({});
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const k of ['kettle','greatFront','skull','wizard','hood']) A(r[k].verts > 6000, k+' is sculpted finely');
  A(r.kettle.n > 200, 'the kettle hat has a wide brim');
  A(r.great.slit===0 && r.great.above >= 2 && r.great.hole===0 && r.greatFront.n > 300, 'the great helm is open at the visor slits and deep enough to clear the nose');
  A(r.skull.n > 30, 'the skull cap has a nasal bar');
  A(r.wizard.n > 50, "the wizard's hat droops back");
  A(r.hood.n > 300, 'the hood drapes to the shoulders');
  A(r.kw.sculpt===1 && r.gw.sculpt===1 && r.hw.sculpt===1 && r.ww.sculpt===1 && r.cw.sculpt===1 && r.hd.sculpt===1 && r.none.sculpt===0, 'each helm, the cowl and the hooded head wear a sculpt');
  A(r.hw.horns===2, 'the horned helm has two curved horns');
  console.log('helm ok', JSON.stringify(r));
};
