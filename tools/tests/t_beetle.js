// RS-278: the giant scarab, tomb scarab, scarab swarm and rust monster rebuilt as high-detail beetles (a domed shell split
// down the back that lifts open over membrane wings, mandibles, feelers, six legs; the rust monster's propeller tail), and
// the hyena pack and the town dogs moved onto the sculpted wolf (spots and a mane; shorter legs)
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    for (const nm of ['giant scarab','tomb scarab','rust monster']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig; e.anim(rig, 0.7, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(e.holder), shut = rig.ely ? rig.ely[0].g.rotation.z : null;
      e.anim(rig, 0.7, 0, 1, 0, 0, e); const open = rig.ely ? Math.abs(rig.ely[0].g.rotation.z) : 0, wing = rig.ely ? rig.ely[0].wing.visible : false;
      let verts = 0; e.holder.traverse(x=>{ if (x.isMesh) verts += x.geometry.attributes.position.count; });
      out[nm] = { beetle:!!rig.beetle, legs:rig.legs.length, ely:(rig.ely||[]).length, mand:(rig.mand||[]).length, ant:(rig.ant||[]).length, prop:!!rig.prop, verts, shut, open:+open.toFixed(2), wing,
        minY:+(box.min.y/(box.max.y - box.min.y)).toFixed(3) };
    }
    const sw = m3dInstance({ nm:'scarab swarm' }, m3dPortrait({ nm:'scarab swarm' })); out.swarm = sw.rig.subs.length && sw.rig.subs.every(s=>s.meta.rig.beetle);
    const hy = m3dInstance({ nm:'giant hyena pack' }, m3dPortrait({ nm:'giant hyena pack' })); out.hyena = hy.rig.subs.length && hy.rig.subs.every(s=>s.meta.rig.wolf && s.meta.rig.tilt < 0);
    const h = pt=>{ const e = m3dInstance({}, pt); e.holder.updateMatrixWorld(true); const b = new THREE.Box3(); e.rig.legs.forEach(L=>b.expandByObject(L.hip)); const all = new THREE.Box3().setFromObject(e.holder); return { wolf:!!e.rig.wolf, legH:(b.max.y - b.min.y)/(all.max.z - all.min.z) }; };
    out.dog = h(MP(mpBeast, { head:'canine', fur:'#8a6a42', tail:'stub', legs:'short', len:0.75 }, 1)); out.wolf = h(MP(mpBeast, { head:'canine', fur:'#8a6a42' }, 1));
    const c = document.createElement('canvas'); c.width = c.height = 100; const x = c.getContext('2d'); x.translate(50, 50); mpArachnid(x, { kind:'beetle', chitin:'#2a6a7a' });
    out.portrait = x.getImageData(0, 0, 100, 100).data.some((v, i)=>i%4===3 && v > 0);
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const nm of ['giant scarab','tomb scarab','rust monster']){ const d = r[nm];
    A(d.beetle && d.legs===6 && d.ely===2 && d.mand===2 && d.ant===2 && d.verts > 30000, nm+': the high-detail beetle');
    A(Math.abs(d.minY) < 0.03, nm+': on its feet');
    A(Math.abs(d.shut) < 0.05 && d.open > 0.4 && d.wing, nm+': its shell opens over its wings as it winds up'); }
  A(r['rust monster'].prop && !r['giant scarab'].prop, "the rust monster's propeller tail");
  A(r.swarm, 'the scarab swarm is made of beetles');
  A(r.hyena, 'the hyena pack is sculpted hyenas with a sloping back');
  A(r.dog.wolf && r.wolf.wolf && r.dog.legH < r.wolf.legH*0.9, 'town dogs use the wolf with shorter legs');
  A(r.portrait, 'the beetle portrait paints');
  console.log('beetle ok', JSON.stringify(r));
};
