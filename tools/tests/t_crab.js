// RS-258/259: the crab rebuilt after the Sally Lightfoot - a broad glossy shell in orange-gold, red and sky blue, eyes on stalks,
// two small matching red claws, and four
// pairs of jointed legs out to the sides on the ground; it animates; the scorpion and spider still build
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const e = m3dInstance({ nm:'giant crab' }, m3dPortrait({ nm:'giant crab' })), rig = e.rig; e.anim(rig, 0.7, 1, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(e.holder), sz = box.getSize(new THREE.Vector3());
    const cl = rig.claws.map(C=>new THREE.Box3().setFromObject(C.g).getSize(new THREE.Vector3()).length());
    const out = { legs:rig.legs.length, claws:rig.claws.length, wide:sz.x > sz.z, minY:+(box.min.y/(box.max.y-box.min.y)).toFixed(3), evenClaws:Math.abs(cl[0] - cl[1]) < cl[1]*0.05, colours:(()=>{ const c = new Set(); e.holder.traverse(x=>{ if (x.isMesh && x.material && x.material.color) c.add(x.material.color.getHexString()); }); return c.size; })() };
    for (const nm of ['giant scorpion', 'giant spider']){ try{ const m = m3dInstance({ nm }, m3dPortrait({ nm })); out[nm] = !!(m && m.rig && m.rig.legs.length===8); }catch(err){ out[nm] = 'ERR '+err.message; } }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.legs===8 && r.claws===2 && r.evenClaws, 'eight legs and two matching claws');
  A(r.colours >= 5, 'a colourful crab - gold, red, sky blue, pale blue, lavender: '+r.colours);
  A(r.wide, 'wider than it is long');
  A(Math.abs(r.minY) < 0.08, 'its legs stand on the ground');
  A(r['giant scorpion']===true && r['giant spider']===true, 'the scorpion and spider still build');
  console.log('crab ok', JSON.stringify(r));
};
