// RS-251: the halfling after the cartoon hobbits - a round belly, curls, a round rosy face with a button nose, big hairy
// bare feet, and out of armour a buttoned waistcoat over white shirt sleeves, with knee breeches and bare shins
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Halfling')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet']) G.gear[sl] = newItem();
    const o = rsPlayerLook().o; m3dInstance({}, rsPlayerLook());
    out.bare = { vest:o.waistcoat, sleeve:o.sleeve, legs:o.legWear, belly:o.potBelly, rosy:o.rosy, nose:o.buttonNose, feet:o.feet, big:o.bigFeet, hair:o.hairStyle };
    G.gear.chest = rsMakeArmour('metal', 1, 'chest'); G.gear.legs = rsMakeArmour('metal', 1, 'legs'); G.gear.feet = rsMakeArmour('metal', 1, 'feet');
    { const a = rsPlayerLook().o; out.armoured = { vest:!!a.waistcoat, legs:a.legWear, feet:a.feet||null }; }
    G.villageRace = 'halfling'; const f = v3RaceDress(v3VillagerLook(3), 3); out.folk = { vest:!!f.o.waistcoat, legs:f.o.legWear, feet:f.o.feet, belly:!!f.o.potBelly };
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.bare.vest && r.bare.sleeve && r.bare.legs==='breeches' && r.bare.belly && r.bare.rosy && r.bare.nose && r.bare.feet==='bare' && r.bare.big && r.bare.hair==='curly', 'the hobbit look out of armour');
  A(!r.armoured.vest && r.armoured.legs==='plate' && r.armoured.feet!=='bare', 'in armour the waistcoat, breeches and bare feet give way');
  A(r.folk.vest && r.folk.legs==='breeches' && r.folk.feet==='bare' && r.folk.belly, 'the halfling townsfolk match');
  console.log('halfling ok');
};
