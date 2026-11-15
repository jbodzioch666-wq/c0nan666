// RS-270: oozes rebuilt in high detail - a jelly that heaves as one smooth surface with bones inside, a swarm of three ruffled
// jellyfish, a whirling water column with arms, a mound of rotting vegetation with vines and leaves, a flickering wisp; they move
// when they attack, and each figure moves its own surface
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {}, posOf = e=>{ const a = []; e.holder.traverse(x=>{ if (x.isMesh && x.geometry.userData.owner) a.push(x.geometry.attributes.position.array.slice()); }); return a; };
    for (const nm of ['gray ooze','ochre jelly','giant jellyfish swarm','water elemental lord','shambling mound','bog beast','will-o-wisp']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig;
      const armX = ()=>rig.arms && rig.arms[0] && rig.arms[0].sh ? rig.arms[0].sh.rotation.x : 0; e.anim(rig, 0.7, 0, 0, 0, 0, e); const p0 = posOf(e), a0 = armX(); e.anim(rig, 0.7, 0, 0, 1, 0, e); const p1 = posOf(e), a1 = armX();
      let moved = Math.abs(a1 - a0)*0.1; p0.forEach((a, i)=>{ for (let j=0;j<a.length;j+=5) moved = Math.max(moved, Math.abs(a[j] - p1[i][j])); });
      const e2 = m3dInstance({ nm }, m3dPortrait({ nm })); e2.anim(e2.rig, 2.0, 0, 0, 0, 0, e2);
      let shared = false; const g1 = new Set(); e.holder.traverse(x=>{ if (x.isMesh && x.geometry.userData.owner) g1.add(x.geometry); }); e2.holder.traverse(x=>{ if (x.isMesh && g1.has(x.geometry)) shared = true; });
      let verts = 0; e.holder.traverse(x=>{ if (x.isMesh) verts += x.geometry.attributes.position.count; });
      out[nm] = { ooze:!!rig.ooze, verts, moved:+moved.toFixed(3), shared, jellies:(rig.jellies||[]).length };
    }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const [nm, d] of Object.entries(r)){
    A(d.ooze && d.verts > 1500, nm+': the high-detail model');
    A(d.moved > 0.003 || nm==='will-o-wisp', nm+': it moves when it attacks');
    A(!d.shared, nm+': each figure moves its own surface'); }
  A(r['gray ooze'].verts > 3000 && r['giant jellyfish swarm'].jellies===3, 'a smooth jelly; a swarm of three jellyfish');
  console.log('ooze ok', JSON.stringify(r));
};
