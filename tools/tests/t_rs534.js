// RS-534: an empty off hand at rest is open - palm, fingers a little curled, the thumb alongside - instead of a fist round nothing; it
// still closes on a shield, tome, blade, bow or a two-handed grip; and shod feet wear a made boot (toe box, a sole standing out,
// heel block, folded cuff and seams), bare feet keeping their own shape
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const handOf = ()=>{ const pt = rsPlayerLook(), root = m3dBuilders().get(pt.paint)(pt.o), rig = M3D.meta.get(root).rig, g = rig.arms[1].hand.children[0].geometry; return { open:pt.o.openHand, geo:g===m3dLimbGeo('handOpen', Math.round((pt.o.bulk||1)*TH(pt.o)*10)/10) || g===m3dLimbGeo('handOpen', pt.o.bulk||1), right:rig.arms[0].hand.children[0].geometry }; };
    const TH = o=>(o.limbThin||1);
    G.gear.weapon = rsMakeWeapon(1, 1); G.gear.offhand = newItem(); let pt = rsPlayerLook(); out.empty = pt.o.openHand;
    G.gear.offhand = rsMakeArmour('metal', 1, 'offhand'); out.shield = rsPlayerLook().o.openHand;
    G.gear.offhand = rsMakeArmour('cloth', 1, 'offhand'); out.tome = rsPlayerLook().o.openHand;
    G.gear.offhand = newItem(); G.gear.weapon = rsMakeStaff(1); { const sp = rsPlayerLook(), sr = M3D.meta.get(m3dBuilders().get(sp.paint)(sp.o)).rig; out.staff = sp.o.openHand===!sr.grip2; out.staffGrip = !!sr.grip2; }
    /* the sculpts: the open hand reaches further (fingers out), the boot has its sole and cuff */
    const W = g=>{ g.computeBoundingBox(); return g.boundingBox; }, fist = W(m3dLimbGeo('hand', 1)), open = W(m3dLimbGeo('handOpen', 1)), boot = W(m3dLimbGeo('boot', 1)), boot2 = W(m3dLimbGeo('boot2', 1));
    out.reach = [+fist.min.y.toFixed(3), +open.min.y.toFixed(3)]; out.boot = [+(boot.max.x - boot.min.x).toFixed(4), +(boot2.max.x - boot2.min.x).toFixed(4), +boot2.max.z.toFixed(3)];
    /* on the figure */
    G.gear.weapon = rsMakeWeapon(1, 1); G.gear.offhand = newItem(); pt = rsPlayerLook(); const root = m3dBuilders().get(pt.paint)(pt.o), rig = M3D.meta.get(root).rig;
    const lg = rig.arms[1].hand.children[0].geometry, rg = rig.arms[0].hand.children[0].geometry; lg.computeBoundingBox(); rg.computeBoundingBox(); out.figure = [+lg.boundingBox.min.y.toFixed(3), +rg.boundingBox.min.y.toFixed(3)];
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.empty===true, 'an empty off hand is open'); A(r.staff===true, 'with a staff, open unless both hands grip it');
  A(r.shield===false && r.tome===false, 'it closes on a shield or a tome');
  A(r.reach[1] < r.reach[0] - 0.012, 'the open hand\'s fingers reach out past a fist');
  A(r.figure[0] < r.figure[1] - 0.012, 'on the figure the empty left hand is open, the weapon hand a fist');
  A(r.boot[1] > r.boot[0] && r.boot[2] > 0.085, 'the boot has a sole standing out and a toe box');
};
