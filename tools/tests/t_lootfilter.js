// RS-362: the loot filter is a menu. From the bag's "loot filter" button you pick the tiers (by the level a piece needs, so
// metal, hide, robes and bows line up), the qualities and the stats of the loot to salvage, and whether a piece with those
// stats is kept or salvaged. Salvaging pays the sell price. With it on, a matching drop is salvaged as it drops; "salvage
// now" and J sweep the bag. Sets, Uniques, relics, locked pieces, potions and upgrades (if you ask) are never touched. The
// junk tag, the Junk tab and "sell all junk" are gone
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false; try{ v3Pref = false; }catch(e){}
    const out = {}, p = G.player;
    out.def = JSON.stringify(lootfP());
    // the menu opens from the bag
    G.inv = []; setUi('inventory'); const btn = document.getElementById('lootFilterSel'); out.btn = btn ? btn.textContent.trim() : null; btn.click();
    out.ui = G.ui; const ov = document.getElementById('overlay'); out.title = (ov.querySelector('.panel-title')||{}).textContent; out.chips = ov.querySelectorAll('.lf-chip').length;
    out.junkWord = /junk/i.test(ov.textContent);
    // pieces: a plain bronze helm (tier 1), a magic rune body with life (tier 5), a rare steel sword, a set, a potion, a locked iron helm
    const bronze = rsMakeArmour('metal', 0, 'head'), rune = rsMakeArmour('metal', 5, 'chest'), steel = rsMakeWeapon(2, 2), locked = rsMakeArmour('metal', 1, 'head');
    rune.quality = 1; afAdd(rune, 'life', 20); steel.quality = 2; afAdd(steel, 'edmg', 30); locked.locked = 1;
    const set = mkArmourSet([rsMakeArmour('metal', 0, 'head'), rsMakeArmour('metal', 0, 'chest')]), pot = genPotion(3);
    out.tier = [bronze, rune, steel].map(lootfTier);
    const F = lootfP(); const keepArrow = lootArrow; lootArrow = ()=>'';
    // tier 1, normal only
    Object.assign(F, { tiers:[0], quals:[0], stats:[], statMode:'keep', safeUp:true });
    out.t1 = [bronze, rune, steel, locked, set, pot].map(it=>lootfMatch(it));
    // every tier, every quality, no stats: everything but the protected
    Object.assign(F, { tiers:[0,1,2,3,4,5,6], quals:[0,1,2] }); out.all = [bronze, rune, steel, locked, set, pot].map(it=>lootfMatch(it));
    // keep pieces with life: the rune body is kept
    Object.assign(F, { stats:['life'], statMode:'keep' }); out.keepLife = [bronze, rune, steel].map(it=>lootfMatch(it));
    // salvage only pieces with damage %: only the steel sword
    Object.assign(F, { stats:['edmg'], statMode:'match' }); out.matchDmg = [bronze, rune, steel].map(it=>lootfMatch(it));
    // never an upgrade
    Object.assign(F, { stats:[] }); lootArrow = ()=>'up'; out.up = lootfMatch(bronze); lootArrow = ()=>'';
    // a drop with the filter on is salvaged and paid; with it off it is kept
    F.on = true; const g0 = p.gold; G.inv = []; addToInventory(rsMakeArmour('metal', 0, 'feet')); out.dropTaken = G.inv.length===0 && p.gold > g0;
    F.on = false; addToInventory(rsMakeArmour('metal', 0, 'feet')); out.dropKept = G.inv.length===1;
    // the bag sweep: the menu's button and J
    G.inv = [bronze, rune, steel, locked, set, pot]; Object.assign(F, { tiers:[0], quals:[0] }); setUi('lootfilter');
    out.sum = (document.querySelector('#overlay .lf-sum')||{}).textContent.replace(/\s+/g, ' ').trim();
    const g1 = p.gold; [...document.querySelectorAll('#overlay .lf-sum .btn')][0].click(); out.swept = G.inv.length===5 && !G.inv.includes(bronze) && p.gold > g1;
    // toggling a chip in the menu changes the setting
    setUi('lootfilter'); const t2 = [...document.querySelectorAll('#overlay .lf-chip')].find(b=>/^Tier 2/.test(b.textContent)); t2.click(); out.t2on = F.tiers.includes(1);
    const on = document.querySelector('#overlay .lf-on'); on.click(); out.onAfter = F.on; lootfSet('on', false);
    // the bag: no junk tab, tag or button; a Salvage tab
    setUi('inventory'); const tabs = [...document.querySelectorAll('#overlay .cs-bagtab')].map(e=>e.textContent.replace(/\s*\d+$/, '').trim()); out.tabs = tabs.join();
    out.bagJunk = /junk/i.test(document.getElementById('overlay').textContent) || !!document.querySelector('#overlay .sp-cell.junk, #overlay i.jk');
    // Escape from the menu goes back to the bag
    setUi('lootfilter'); backOut(); out.esc = G.ui;
    lootArrow = keepArrow; setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(/"on":false/.test(r.def), 'the filter starts off');
  A(/loot filter/.test(r.btn||'') && r.ui==='lootfilter' && /LOOT FILTER/.test(r.title||'') && r.chips > 30 && !r.junkWord, 'the bag\'s button opens the menu of tiers, qualities and stats');
  A(r.tier.join()==='0,4,1', 'tiers by the level a piece needs: bronze 1, rune 5, steel 2');
  A(r.t1.join()==='true,false,false,false,false,false', 'tier 1 normal: only the bronze helm - never a locked piece, a set or a potion');
  A(r.all.join()==='true,true,true,false,false,false', 'everything picked: all but the protected');
  A(r.keepLife.join()==='true,false,true', 'keeping pieces with life keeps the rune body');
  A(r.matchDmg.join()==='false,false,true', 'salvaging pieces with damage % takes only the sword');
  A(r.up===false, 'an upgrade is never salvaged');
  A(r.dropTaken && r.dropKept, 'a matching drop is salvaged when the filter is on, kept when it is off');
  A(/1 piece matches/.test(r.sum) && r.swept, 'the menu shows what matches in the bag and salvages it');
  A(r.t2on && r.onAfter===true, 'the chips change the settings');
  A(r.tabs==='All,Gear,Food,Scrolls,Resources,Salvage' && !r.bagJunk, 'no junk tag, tab or button in the bag; a Salvage tab');
  A(r.esc==='inventory', 'Escape goes back to the bag');
};
