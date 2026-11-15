// RS-435: the loot filter salvages a treasure trail's Gilded armour by its tier and bonuses like any other piece - it counted as a rare find
// and was always kept - while a real rare piece, a set piece or a locked one is still never touched
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const F = lootfP();
    Object.assign(F, { on:true, tiers:[0,1,2,3,4,5], stats:['acc','dmgB','ac','rngAcc','prayB','ammo'], statMode:'salvage', safeUp:false });
    const g = sqGilded(); const rare = rsMakeArmour('metal', 2, 'head'); rare.quality = 3; const locked = rsMakeArmour('metal', 2, 'head'); locked.locked = 1;
    return { gilded:lootfWhy(g, F), tier:lootfTier(g), rare:lootfWhy(rare, F), locked:lootfWhy(locked, F) }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.gilded==='match', 'a Gilded piece with a picked bonus, of a picked tier, is salvaged');
  A(r.rare==='protected' && r.locked==='protected', 'a real rare piece and a locked one are still kept');
};
