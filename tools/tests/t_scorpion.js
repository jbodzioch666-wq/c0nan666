// RS-256: the scorpion rebuilt - a back of plates, eight arched legs planted on the ground, two pincers, and a five-segment tail
// curling up over the back to a sting; it still animates, and the spider and crab built by the same maker are unchanged
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    for (const nm of ['giant scorpion', 'giant desert scorpion']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig;
      e.anim(rig, 1.3, 1, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(e.holder), tip = new THREE.Vector3(); rig.tail[rig.tail.length-1].getWorldPosition(tip);
      const body = new THREE.Vector3(); rig.body.getWorldPosition(body);
      out[nm] = { legs:rig.legs.length, claws:rig.claws.length, tail:rig.tail.length, minY:+(box.min.y/(box.max.y-box.min.y)).toFixed(3), tailAbove:tip.y > body.y };
    }
    for (const nm of ['giant spider', 'giant crab']){ try{ const e = m3dInstance({ nm }, m3dPortrait({ nm })); out[nm] = !!e && !!e.rig; }catch(err){ out[nm] = 'ERR '+err.message; } }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const nm of ['giant scorpion', 'giant desert scorpion']){ const s = r[nm];
    A(s.legs===8 && s.claws===2 && s.tail===6 && s.tailAbove, nm+': eight legs, two pincers, a tail of five segments and a sting, held up over the back');
    A(Math.abs(s.minY) < 0.08, nm+': its feet are on the ground'); }
  A(r['giant spider']===true && r['giant crab']===true, 'the spider and crab still build');
  console.log('scorpion ok', JSON.stringify(r));
};
