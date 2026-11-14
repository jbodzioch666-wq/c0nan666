// RS-257: the spider rebuilt - a head-and-chest and a big raised abdomen, eight arched legs planted on the ground, it animates;
// the frost spider keeps its ice, and the scorpion and crab built by the same maker still build
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    for (const nm of ['giant spider', 'frost spider', 'cave spider']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig; e.anim(rig, 1.1, 1, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(e.holder), ab = new THREE.Vector3(), bd = new THREE.Vector3(); rig.ab.getWorldPosition(ab); rig.body.getWorldPosition(bd);
      out[nm] = { legs:rig.legs.length, minY:+(box.min.y/(box.max.y-box.min.y)).toFixed(3), abRaised:ab.y > bd.y, abBehind:ab.z < bd.z };
    }
    for (const nm of ['giant scorpion', 'giant crab']){ try{ const e = m3dInstance({ nm }, m3dPortrait({ nm })); out[nm] = !!(e && e.rig && e.rig.claws && e.rig.claws.length===2); }catch(err){ out[nm] = 'ERR '+err.message; } }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const nm of ['giant spider', 'frost spider', 'cave spider']){ const s = r[nm];
    A(s.legs===8 && s.abRaised && s.abBehind, nm+': eight legs, the abdomen raised behind');
    A(Math.abs(s.minY) < 0.08, nm+': its feet are on the ground'); }
  A(r['giant scorpion']===true && r['giant crab']===true, 'the scorpion and crab still build with their pincers');
  console.log('spider ok', JSON.stringify(r));
};
