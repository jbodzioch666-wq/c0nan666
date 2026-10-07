// RS-190: the old spell scrolls are gone - no shop or monster hands them out, and any left in an old save (pack, bank, quick
// bar) are cashed in for gold on load; the Scroll of Reforging stays
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    o3Pref = false; v3Pref = false;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const out = {}, old = nm=>{ const it = newItem(); Object.assign(it, { used:1, consumable:1, kind:'scroll', nm, price:90, scrollSpell:{ name:nm, kind:'dmg', d1:4, d2:6, range:8 } }); return it; };
    out.gone = typeof SCROLLS==='undefined' && typeof genScroll==='undefined' && typeof genWand==='undefined';
    // shops never stock one
    let seen = 0; for (let i=0;i<200;i++){ generateAlchemistStock(); generateMerchantStock(); for (const it of (G.alchemistStock||[]).concat(G.merchantStock||[])) if (it && it.scrollSpell) seen++; }
    out.shop = seen;
    // an old save: two in the pack, one in the bank, one on the quick bar
    G.inv.push(old('Scroll of Fireball'), old('Scroll of Haste')); bankP().stash.push(old('Scroll of Magic Missile')); G.inv.push(mkReforgeScroll());
    qbSlots()[3] = { t:'item', nm:'Scroll of Fireball', kind:'scroll' };
    const g0 = G.player.gold; saveCurrentGame(); loadGame(G.saveId);
    out.after = { inv:G.inv.filter(i=>i.scrollSpell).length, bank:bankP().stash.filter(i=>i.scrollSpell).length, qb:qbSlots()[3], gold:G.player.gold - g0, reforge:G.inv.some(i=>i.reforge) };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.gone, 'the spell scroll table and its makers are gone');
  A(r.shop===0, 'no shop stocks a spell scroll');
  A(r.after.inv===0 && r.after.bank===0 && r.after.qb===null && r.after.gold===135, 'old scrolls in the pack, bank and quick bar are cashed in on load');
  A(r.after.reforge, 'the Scroll of Reforging stays');
};
