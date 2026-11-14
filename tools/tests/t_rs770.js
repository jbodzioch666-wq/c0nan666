// RS-770: the loot filter takes a Fire Cape - it was made quality 3 (a set piece's rarity since RS-704) and so always protected.
// A cape goes by the level it's found from in the filter's tiers (a Fire Cape the top tier, not with bronze); an old one is mended on load
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); setUi('playing'); saveCurrentGame = ()=>{};
    const c = rsMakeCape(113, 'Fire Cape'), F = lootfP(), top = LOOTF_TIERS.length - 1; Object.assign(F, { on:true, tiers:[top], rar:[0], stats:[], safeUp:false, keepT:0 });
    const out = { q:c.quality, tier:lootfTier(c), top, why:lootfWhy(c, F), red:lootfTier(rsMakeCape(3, 'Red Cape')) };
    F.tiers = [0]; out.whyLow = lootfWhy(c, F); F.tiers = [top];
    const g0 = G.player.gold; out.took = lootFilterTake(c); out.gold = G.player.gold - g0;
    const old = rsMakeCape(113, 'Fire Cape'); old.quality = 3; delete old.rsLootV; G.inv.push(old); afMigrate(old); out.oldQ = old.quality; out.oldWhy = lootfWhy(old, F);
    giveSkillCape('attack'); const sk = G.inv.find(i=>i.skillCape); out.skill = sk ? lootfWhy(sk, F) : 'none';
    return out; });
  console.log(JSON.stringify(r));
  A(r.q===0, 'a Fire Cape is plain, not a set piece: ' + r.q);
  A(r.tier===r.top && r.red===0, 'filed by the level it\'s found from: the top tier (a red cape the first): ' + r.tier + ' ' + r.red);
  A(r.why==='match' && r.whyLow==='tier', 'the filter takes it with the top tier picked, not with the first: ' + r.why + ' ' + r.whyLow);
  A(r.took > 0 && r.gold===r.took, 'salvaged for its price: ' + r.took);
  A(r.oldQ===0 && r.oldWhy==='match', 'an old Fire Cape mended: ' + r.oldQ + ' ' + r.oldWhy);
  A(r.skill==='protected', 'a skill cape still kept: ' + r.skill);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
