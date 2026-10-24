// RS-268: serpents rebuilt in high detail - each body one smooth tube bent along a moving spine (a snake coiled and reared,
// a worm heaving out of the ground with a ringed maw of teeth, a finned eel, a leech, the many-legged remorhaz); the spine
// moves as it attacks, and two figures of the same kind bend their own bodies
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    for (const nm of ['giant constrictor snake','asp','apep','poison wyrm','purple worm','sandworm','giant eel','giant leech','remorhaz']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig, tb = rig.tube;
      e.anim(rig, 0.7, 0, 0, 0, 0, e); const p0 = tb.geometry.attributes.position.array.slice(), h0 = rig.head.position.clone();
      e.anim(rig, 0.7, 0, 0, 1, 0, e); const p1 = tb.geometry.attributes.position.array; let moved = 0; for (let i=0;i<p0.length;i++) moved = Math.max(moved, Math.abs(p0[i] - p1[i]));
      const e2 = m3dInstance({ nm }, m3dPortrait({ nm })); e2.anim(e2.rig, 3.1, 1, 0, 0, 0, e2);
      e.holder.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(e.holder);
      let verts = 0; e.holder.traverse(x=>{ if (x.isMesh) verts += x.geometry.attributes.position.count; });
      out[nm] = { serpent:!!rig.serpent, rings:tb.geometry.userData.nR, verts, moved:+moved.toFixed(3), headMoved:+h0.distanceTo(rig.head.position).toFixed(3), own:e2.rig.tube.geometry!==tb.geometry, minY:+box.min.y.toFixed(3), hood:!!rig.hood };
    }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const [nm, d] of Object.entries(r)){
    A(d.serpent && d.rings >= 48 && d.verts > 2400, nm+': one smooth high-detail body');
    A(d.moved > 0.01 && (d.headMoved > 0.005 || nm.includes('worm') || nm.includes('leech')), nm+': the body moves as it strikes');
    A(d.own, nm+': each figure bends its own body'); }
  A(r['poison wyrm'].hood && !r.asp.hood, 'the poison wyrm spreads a hood');
  A(r['giant eel'].minY > 0.05, 'the eel swims above the floor');
  console.log('serpent ok', JSON.stringify(r));
};
