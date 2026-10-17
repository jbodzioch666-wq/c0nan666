// RS-266: the dragons rebuilt in high detail - a sculpted scaled body, neck and tail, a horned head with a hinged, toothed jaw,
// clawed legs, and wings of bone with a scalloped membrane; wyverns stand on two legs, the dragon turtle wears a shell, the
// plesiosaurus has flippers, and the King Black Dragon has three heads
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    for (const nm of ['black dragon wyrmling','blue dragon','ancient dragon','wyvern','dragon turtle','plesiosaurus','king black dragon','forest wyrm','white dragon']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig;
      e.anim(rig, 0.7, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const box = new THREE.Box3(); e.holder.traverse(x=>{ if (x.isMesh) box.expandByObject(x); }); const jaw0 = rig.jaw.rotation.x;
      let verts = 0, mem = 0, teeth = 0; e.holder.traverse(x=>{ if (!x.isMesh) return; verts += x.geometry.attributes.position.count; if (x.material.userData.kind==='membrane') mem++; if (x.geometry.type==='ConeGeometry') teeth++; });
      e.anim(rig, 0.7, 0, 0, 1, 0, e); const bites = rig.jaw.rotation.x > jaw0 + 0.4;
      e.anim(rig, 0.7, 1, 0, 0, 0, e);
      out[nm] = { dragon:!!rig.dragon, legs:rig.legs.length, flip:rig.legs.filter(L=>L.flip).length, heads:rig.necks.length, wings:(rig.wings||[]).length, mem, teeth, verts, bites, minY:+(box.min.y/(box.max.y - box.min.y)).toFixed(3) };
    }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const [nm, d] of Object.entries(r)){
    A(d.dragon && d.verts > 60000 && d.verts < (d.heads > 1 ? 200000 : 130000), nm+': the high-detail dragon ('+d.verts+' vertices)');
    A(d.teeth >= 28 && d.bites, nm+': a mouthful of teeth, and it bites');
    A(Math.abs(d.minY) < (d.flip ? 0.07 : 0.04), nm+': it stands on the ground (a swimmer paddles just above it)'); }
  for (const nm of ['blue dragon','ancient dragon','black dragon wyrmling','forest wyrm','white dragon']) A(r[nm].wings===2 && r[nm].mem===2, nm+': two membrane wings');
  A(r['blue dragon'].legs===4 && r.wyvern.legs===2 && r.wyvern.wings===2, 'a dragon on four legs, a wyvern on two');
  A(r['dragon turtle'].wings===0 && r.plesiosaurus.flip===4 && r.plesiosaurus.wings===0, 'a wingless turtle, a plesiosaurus with flippers');
  A(r['king black dragon'].heads===3 && r['blue dragon'].heads===1, 'the King Black Dragon has three heads');
  console.log('dragon ok', JSON.stringify(r));
};
