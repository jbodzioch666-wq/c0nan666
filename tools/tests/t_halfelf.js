// RS-254: the half-elf as a Strider-like ranger - an elf-touched face, and out of armour a leather jerkin over linen sleeves,
// dark trousers in the chosen colour, and a green travelling cloak with the hood down; armour takes over; townsfolk match
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Half-Elf')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet','cape']) G.gear[sl] = newItem();
    const pt = rsPlayerLook(), o = pt.o; m3dInstance({}, pt);
    out.bare = { slim:o.headSlim, cheek:o.cheekbones, ears:o.earLen, outfit:o.outfit, sleeve:o.sleeve, legs:o.legWear, legCol:o.legCol, cape:o.cape, hood:o.hoodDown, beard:o.beardStyle };
    G.gear.chest = rsMakeArmour('metal', 1, 'chest'); G.gear.legs = rsMakeArmour('metal', 1, 'legs'); { const a = rsPlayerLook().o; out.armoured = { outfit:a.outfit, legs:a.legWear, hood:!!a.hoodDown }; }
    G.villageRace = 'halfelf'; const f = v3RaceDress(v3VillagerLook(1), 1); out.folk = { outfit:f.o.outfit, hood:!!f.o.hoodDown, slim:!!f.o.headSlim };
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.bare.slim && r.bare.cheek && r.bare.ears > 0.02 && r.bare.beard===1, 'an elf-touched face with stubble');
  A(r.bare.outfit==='leather' && r.bare.sleeve && r.bare.legs==='trews' && r.bare.legCol && r.bare.cape && r.bare.hood, 'a jerkin over linen sleeves, trousers in the chosen colour, a cloak with the hood down');
  A(r.armoured.outfit==='plate' && r.armoured.legs==='plate' && !r.armoured.hood, 'armour takes over');
  A(r.folk.outfit==='leather' && r.folk.hood && r.folk.slim, 'the half-elven townsfolk match');
  console.log('halfelf ok');
};
