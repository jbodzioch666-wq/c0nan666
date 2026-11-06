// RS-206: the left hand is a mirrored right hand, and handles (swords, axes, staves, bows, tools) sit inside the curled fingers
module.exports = async page=>{
  await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); });   // (the parts as built, not merged into skinned meshes - this test looks at them one by one)
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    const handMesh = arm=>arm.hand.children.find(o=>o.isMesh);
    for (const nm of ['hobgoblin','orc warrior','orc shaman','goblin archer','kobold chieftain']){
      const e = m3dInstance({ nm }, monsterPortraitFor(nm)), [R, L] = e.rig.arms;
      A(handMesh(R).scale.x===1 && handMesh(L).scale.x===-1, nm+': the left hand is mirrored');
      const w = e.rig.weapon, H = e.rig.wk==='bow' && w.parent && w.parent.parent===L.hand ? L.hand : R.hand, holder = w.parent===H ? w : w.parent, g = m3dGrip(e.rig.b || 1);   /* (a bow is held in the left hand) */
      out[nm] = [e.rig.wk, holder.position.toArray().map(v=>+v.toFixed(3))];
      A(holder.parent===H && Math.abs(holder.position.x) > 0.015 && (holder===w && e.rig.wk!=='bow' && e.rig.wk!=='staff' ? holder.position.z > 0.02 : Math.abs(holder.position.z) < 1e-6) && Math.abs(holder.position.y - (e.rig.wk==='staff' ? -0.024 : -0.04)) < 1e-6, nm+': the handle sits in the fist (RS-585: a staff a little up into the palm) (RS-296: a hilted weapon slid up so the fist closes under the guard) '+JSON.stringify(out[nm]));
    }
    return out; });
  console.log(JSON.stringify(r));
};
