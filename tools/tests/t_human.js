// RS-255: the human after the Men of Gondor and Rohan - a squarer jaw, long hair and a full beard by default, and out of armour
// a belted tunic with an embroidered hem and neck under a red cloak with a fur collar; armour takes over; townsfolk wear tunics too
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Human')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet','cape']) G.gear[sl] = newItem();
    const pt = rsPlayerLook(), o = pt.o; m3dInstance({}, pt);
    out.bare = { jaw:o.squareJaw, hair:o.hairStyle, beard:o.beardStyle, outfit:o.outfit, trim:o.tunicTrim, cape:o.cape, fur:o.furCollar };
    G.gear.chest = rsMakeArmour('metal', 1, 'chest'); { const a = rsPlayerLook().o; out.armoured = { trim:!!a.tunicTrim, fur:!!a.furCollar }; }
    G.villageRace = 'human'; const folk = [0,1,2,3,4,5].map(i=>v3RaceDress(v3VillagerLook(i), i).o); out.folk = { tunics:folk.filter(f=>f.tunicTrim).length, jaw:folk.every(f=>f.squareJaw) };
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.bare.jaw && r.bare.hair==='long' && r.bare.beard===3, 'a squarer jaw, long hair and a full beard');
  A(r.bare.outfit==='shirt' && r.bare.trim && r.bare.cape && r.bare.fur, 'a trimmed tunic under a fur-collared cloak');
  A(!r.armoured.trim && !r.armoured.fur, 'armour takes over');
  A(r.folk.tunics >= 1 && r.folk.jaw, 'human townsfolk wear tunics too: '+JSON.stringify(r.folk));
  console.log('human ok');
};
