// RS-294: the monster heads that were still boxes and balls are sculpted - golems, fish-men, mind flayers, the umber hulk (whose mandibles
// open and snap), jackal- and hyena-headed gnolls (with a hinged jaw), bugbears, yetis, and kobolds and lizardfolk on the dragonborn's sculpt;
// a dragonborn's helmets sit on his skull (raised, set back, a size larger), his cowl opens wide for the snout, and his crest stays under a helmet
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const verts = h=>{ let n = 0, boxes = 0; h.traverse(x=>{ if (x.isMesh){ n += x.geometry.attributes.position.count; if (x.geometry.type==='BoxGeometry' && x.geometry.parameters.width > 0.05) boxes++; } }); return { n, boxes }; };
    for (const nm of ['iron golem','ice golem','sahuagin raider','dagannoth','aberrant thrall','umber hulk','gnoll','anubis warden','bugbear','yeti','kobold','lizardfolk']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), h = e.rig.head; out[nm] = verts(h);
      if (nm==='umber hulk'){ m3dPoseHumanoid(e.rig, 0.7, 0, 0, 0, 0, e); const a = e.rig.mandibles.map(m=>m.rotation.y); m3dPoseHumanoid(e.rig, 0.7, 0, 1, 0, 0, e); out.mand = { n:e.rig.mandibles.length, open:+(Math.abs(e.rig.mandibles[0].rotation.y) - Math.abs(a[0])).toFixed(2) }; }
      if (nm==='gnoll'){ m3dPoseHumanoid(e.rig, 0.7, 0, 0, 0, 0, e); const j = h.getObjectByName('drakeJaw'), a = j.rotation.x; m3dPoseHumanoid(e.rig, 0.7, 0, 0, 1, 0, e); out.gnollJaw = +(j.rotation.x - a).toFixed(2); } }
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Dragonborn')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet','cape','offhand','weapon']) G.gear[sl] = newItem();
    const fit = (fam, tier)=>{ G.gear.head = rsMakeArmour(fam, tier, 'head'); const e = m3dInstance({}, rsPlayerLook()), h = e.rig.head; e.holder.updateMatrixWorld(true);
      const helm = []; h.traverse(x=>{ if (x.isMesh && [...M3D.sculpt.entries()].some(([k, g])=>g===x.geometry && k.startsWith('helm|'))) helm.push(x); });
      const sk = h.getObjectByName('drakeSkull'), bh = new THREE.Box3().setFromObject(helm[0]), bs = new THREE.Box3().setFromObject(sk);
      let hornsOut = 0; h.traverse(x=>{ if (x.isMesh && x.material.userData.hex==='#d8ccb0' && x.geometry.type==='ConeGeometry') hornsOut++; });
      return { helms:helm.length, kind:[...M3D.sculpt.entries()].find(([k, g])=>g===helm[0].geometry)[0], crownCovered:bh.max.y > bs.max.y, raised:helm[0].parent!==h, hornsOut }; };
    out.kettle = fit('metal', 1); out.skull = fit('metal', 3); out.cowl = fit('hide', 2);
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const nm of ['iron golem','ice golem','sahuagin raider','dagannoth','aberrant thrall','umber hulk','gnoll','anubis warden','bugbear','yeti','kobold','lizardfolk']) A(r[nm].n > 8000 && r[nm].boxes===0, nm+': a sculpted head, not boxes');
  A(r.mand.n===2 && r.mand.open > 0.3, "the umber hulk's mandibles open as it winds up");
  A(r.gnollJaw > 0.3, "a gnoll's jaw drops as it bites");
  A(r.kettle.helms===1 && r.kettle.raised && r.kettle.crownCovered && r.skull.crownCovered, "a dragonborn's helmet sits over his crown");
  A(r.cowl.kind==='helm|hoodw', "a dragonborn's cowl opens wide for his snout");
  A(r.skull.hornsOut===0, "a dragonborn's crest stays under his helmet");
  console.log('mhead ok', JSON.stringify(r));
};
