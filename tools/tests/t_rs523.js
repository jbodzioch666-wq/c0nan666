// RS-523: a wizard with a shield holds the staff in one hand and the shield up on the other arm - the left hand used to reach across
// for the staff as if two-handed, which left the shield held at the chest like a book. A staff alone is still held in both hands
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}; G.gear.weapon = rsMakeStaff(1);
    const pose = ()=>{ const e = m3dInstance({}, rsPlayerLook()), rg = e.rig; m3dPoseHumanoid(rg, 1, 0, 0, 0, 0, e); return { twoHand:!!rg.twoHand, shield:!!rg.shield, el:+rg.arms[1].el.rotation.x.toFixed(2), shz:+rg.arms[1].sh.rotation.z.toFixed(2) }; };
    G.gear.offhand = rsMakeArmour('metal', 2, 'offhand'); out.shield = pose();
    G.gear.offhand = newItem(); out.alone = pose();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.shield.shield && !r.shield.twoHand, 'with a shield the staff is held in one hand');
  A(r.shield.el < -1.8 && r.shield.shz < 0, 'and the shield arm is up before the chest, like any shield');
  A(r.alone.twoHand, 'a staff alone is still held in both hands');
};
