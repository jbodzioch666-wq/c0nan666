// RS-468: a wood elf, stooped as it is, looks ahead like anyone else - its head had been tipped some 23 degrees up toward the sky
module.exports = async page=>{
  const r = await page.evaluate(()=>{ const T = THREE, out = {};
    for (const [k, look] of [['human', null], ['elf', woodElfLook]]){
      const pt = m3dPortrait({ nm:'knight' }), o = Object.assign({}, pt.o, { helm:null, shield:null, cape:null }, look ? look(Object.assign({}, pt.o, { helm:null })) : {});
      const e = m3dInstance({}, Object.assign({}, pt, { o })); out[k] = {};
      for (const [ph, mv] of [['stand', 0], ['walk', 1]]){ m3dPoseHumanoid(e.rig, 1.3, mv, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
        const f = new T.Vector3(0, 0, 1).applyQuaternion(e.rig.head.getWorldQuaternion(new T.Quaternion())); out[k][ph] = +(Math.asin(f.y)*180/Math.PI).toFixed(1); }
      out[k].stoop = !!e.rig.stoop; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.elf.stoop, 'the wood elf still stoops');
  for (const ph of ['stand', 'walk']) A(Math.abs(r.elf[ph] - r.human[ph]) < 5 && r.elf[ph] < 6, 'its face looks ahead, '+ph);
};
