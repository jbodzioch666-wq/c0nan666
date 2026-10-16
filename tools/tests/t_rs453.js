// RS-453: the up/down arrows judge gear on its own stats, not the bonuses rolled or grown on it - a better forged weapon is an upgrade over an
// old one with grown bonuses - and a piece's bonuses stand apart in a box, with a weapon's kills and how far it has awakened
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const old = rsMakeWeapon(2, 5); afAdd(old, 'edmg', 17, 0, 0); afAdd(old, 'str', 1, 0, 0); afAdd(old, 'pois', 1, 10, 0); old.kills = 312; old.sentientTier = 3;
    const better = rsMakeWeapon(4, 5);
    G.gear.weapon = old; rsSync && rsSync();
    const v = gearVerdict(better, old), back = gearVerdict(old, better);
    const html = itemModListHtml(old), plain = itemModListHtml(better);
    const F = lootfP(); Object.assign(F, { on:true, tiers:[0,1,2,3,4,5,6], stats:[], statMode:'keep', safeUp:true }); const kept = lootfWhy(better, F);
    const helm = rsMakeArmour('metal', 3, 'head'), helmOld = rsMakeArmour('metal', 2, 'head'); afAdd(helmOld, 'life', 40, 0, 0);
    return { v, back, box:/class="affbox"/.test(html), kills:/312 kills/.test(html) && /awakened 3\/3/.test(html), plainBox:/affbox/.test(plain), kept, helm:gearVerdict(helm, helmOld) }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.v==='up' && r.back==='down', 'a higher-tier weapon is an upgrade over an old one with grown bonuses');
  A(r.helm==='up', 'and armour likewise');
  A(r.box && r.kills, 'the bonuses in a box of their own, with the kills and how far it has awakened');
  A(!r.plainBox, 'no box on a plain piece');
  A(r.kept==='upgrade', 'and the loot filter keeps the better piece as an upgrade, never salvaging it');
};
