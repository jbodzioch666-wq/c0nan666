// RS-252: the gnome - a tall felt hat with goggles on the brim, bushy brows, rosy cheeks, a round belly on short legs, and out
// of armour a leather tinker's apron; a helm takes the hat's place; the gnomish townsfolk match
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Gnome')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet']) G.gear[sl] = newItem();
    const o = rsPlayerLook().o, e = m3dInstance({}, rsPlayerLook()); let cone = 0; e.rig.head.traverse(x=>{ if (x.isMesh && x.geometry && x.geometry.type==='CylinderGeometry' && x.geometry.parameters.height > 0.25) cone++; });
    out.bare = { hat:o.gnomeHat, goggles:o.goggles, brows:o.bushyBrows, rosy:o.rosy, belly:o.potBelly, apron:o.apron, legs:o.legLen, nose:o.nose, cone };
    G.gear.head = rsMakeArmour('metal', 1, 'head'); G.gear.chest = rsMakeArmour('metal', 1, 'chest');
    { const a = rsPlayerLook().o; out.armoured = { hat:!!a.gnomeHat, apron:!!a.apron, helm:a.helm }; }
    G.villageRace = 'gnome'; const f = v3RaceDress(v3VillagerLook(1), 1); out.folk = { hat:!!f.o.gnomeHat, apron:!!f.o.apron, brows:!!f.o.bushyBrows };
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.bare.hat && r.bare.goggles && r.bare.brows && r.bare.rosy && r.bare.belly && r.bare.apron && r.bare.legs < 1 && r.bare.nose >= 1 && r.bare.cone===1, 'the gnome look, with one smooth tall hat');
  A(!r.armoured.hat && !r.armoured.apron && r.armoured.helm, 'a helm takes the hat\'s place, armour the apron\'s');
  A(r.folk.hat && r.folk.apron && r.folk.brows, 'the gnomish townsfolk match');
  console.log('gnome ok');
};
