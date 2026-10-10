// RS-253: the tiefling after Bakshi's dark cloaked figures - a narrow angular face, pointed chin and ears, eyes that glow in
// their own colour, and out of armour a long dark gold-trimmed coat under a high-collared mantle; townsfolk match
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Tiefling')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet','cape']) G.gear[sl] = newItem();
    const pt = rsPlayerLook(), o = pt.o; m3dInstance({}, pt);
    out.bare = { horns:o.horns, tail:o.tail, slim:o.headSlim, chin:o.sharpChin, ears:o.earLen, eyes:o.eyes, outfit:o.outfit, trim:o.robeTrim, cape:o.cape, collar:o.highCollar };
    G.player.look = Object.assign({}, lookOf(G.player), { eyes:7 }); out.violet = rsPlayerLook().o.eyes;
    G.gear.chest = rsMakeArmour('metal', 1, 'chest'); { const a = rsPlayerLook().o; out.armoured = { outfit:a.outfit, collar:!!a.highCollar }; }
    G.villageRace = 'tiefling'; const f = v3RaceDress(v3VillagerLook(1), 1); out.folk = { eyes:!!f.o.eyes, chin:!!f.o.sharpChin, outfit:f.o.outfit };
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.bare.horns && r.bare.tail==='spade' && r.bare.slim && r.bare.chin && r.bare.ears > 0.04, 'the tiefling face, horns and tail');
  A(/^\d+,\d+,\d+$/.test(r.bare.eyes||'') && r.violet!==r.bare.eyes, 'eyes glow in the colour you pick: '+r.bare.eyes+' / '+r.violet);
  A(r.bare.outfit==='robe' && r.bare.trim && r.bare.cape && r.bare.collar, 'a long dark coat under a high-collared mantle');
  A(r.armoured.outfit==='plate' && !r.armoured.collar, 'armour takes over');
  A(r.folk.eyes && r.folk.chin && r.folk.outfit==='robe', 'the tiefling townsfolk match');
  console.log('tiefling ok');
};
