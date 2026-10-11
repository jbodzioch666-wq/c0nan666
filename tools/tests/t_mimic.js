// RS-326: the mimic has its own model - a banded chest with a toothy hinged lid, eyes in the gap, a lolling tongue
// and six jointed legs that stand on the ground; the lid gapes as it winds up and snaps shut on the strike
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const pt = m3dPortrait({ nm:'mimic' }), e = m3dInstance({ nm:'mimic' }, pt), rig = e.rig;
    e.anim(rig, 0.7, 0, 0, 0, 0, e); const rest = rig.lid.rotation.x;
    e.anim(rig, 0.7, 0, 1, 0, 0, e); const wound = rig.lid.rotation.x;
    e.anim(rig, 0.7, 0, 0, 1, 0, e); const shut = rig.lid.rotation.x;
    e.anim(rig, 0.7, 1, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(e.holder);
    return { own:pt && pt.paint===mpMimic, legs:rig.legs.length, eyes:rig.eyes.length, tongue:!!rig.tongue, rest, wound, shut,
      minY:+(box.min.y/(box.max.y-box.min.y)).toFixed(3) };
  });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.own, 'the mimic uses its own painter and model');
  A(r.legs===6 && r.eyes===2 && r.tongue, 'six legs, two eyes and a tongue');
  A(r.wound < r.rest - 0.5, 'the lid gapes as it winds up');
  A(r.shut > r.rest, 'the lid snaps shut on the strike');
  A(Math.abs(r.minY) < 0.08, 'it stands on its feet');
  console.log('mimic ok', JSON.stringify(r));
};
