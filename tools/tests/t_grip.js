// RS-206: the left hand is a mirrored right hand, and handles (swords, axes, staves, bows, tools) sit inside the curled fingers
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    const handMesh = arm=>arm.hand.children.find(o=>o.isMesh);
    for (const nm of ['hobgoblin','orc warrior','orc shaman','goblin archer','kobold chieftain']){
      const e = m3dInstance({ nm }, monsterPortraitFor(nm)), [R, L] = e.rig.arms;
      A(handMesh(R).scale.x===1 && handMesh(L).scale.x===-1, nm+': the left hand is mirrored');
      const w = e.rig.weapon, holder = w.parent===R.hand ? w : w.parent, g = m3dGrip(e.rig.b || 1);
      out[nm] = [e.rig.wk, holder.position.toArray().map(v=>+v.toFixed(3))];
      A(holder.parent===R.hand && Math.abs(holder.position.x) > 0.015 && Math.abs(holder.position.z) < 1e-6 && Math.abs(holder.position.y + 0.04) < 1e-6, nm+': the handle sits in the fist '+JSON.stringify(out[nm]));
    }
    return out; });
  console.log(JSON.stringify(r));
};
