// RS-362: the loot filter is a menu. From the bag's "loot filter" button you pick the tiers (by the level a piece needs, so
// metal, hide, robes and bows line up) and the bonuses of the loot to salvage, and whether a piece with those bonuses is
// kept or salvaged. Salvaging pays the sell price. With it on, a matching drop is salvaged as it drops; "salvage now" and J
// sweep the bag. Sets, Uniques, relics, locked pieces, potions and upgrades (if you ask) are never touched. The junk tag,
// the Junk tab and "sell all junk" are gone. RS-364: the stats are the bonuses gear carries (melee attack, strength,
// defence, ranged, magic, spell damage, prayer) - a bow counts as ranged, not melee - and the quality row is gone
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false; try{ v3Pref = false; }catch(e){}
    const out = {}, p = G.player;
    out.def = JSON.stringify(lootfP());
    // the menu opens from the bag
    G.inv = []; setUi('inventory'); const btn = document.getElementById('lootFilterSel'); out.btn = btn ? btn.textContent.trim() : null; btn.click();
    out.ui = G.ui; const ov = document.getElementById('overlay'); out.title = (ov.querySelector('.panel-title')||{}).textContent; out.chips = ov.querySelectorAll('.lf-chip').length;
    out.junkWord = /junk/i.test(ov.textContent); out.quality = /QUALITY/.test(ov.textContent); out.bonusChips = [...ov.querySelectorAll('.lf-chip')].map(b=>b.textContent.trim()).filter(t=>LOOTF_STATS.some(s=>s[1]===t));
    out.oldStats = /dexterity|wisdom|constitution|intelligence/.test(ov.textContent);
    // a bronze helm (tier 1, defence), a rune body (tier 5, defence), a steel sword (tier 2, melee), an oak bow (tier 2, ranged),
    // a plain staff (tier 1, magic and a little melee), a locked bronze helm, a set, a potion
    const bronze = rsMakeArmour('metal', 0, 'head'), rune = rsMakeArmour('metal', 5, 'chest'), sword = rsMakeWeapon(2, 2), bow = rsMakeBow(1, false), staff = rsMakeStaff(0), locked = rsMakeArmour('metal', 0, 'head');
    locked.locked = 1; const set = mkArmourSet([rsMakeArmour('metal', 0, 'head'), rsMakeArmour('metal', 0, 'chest')]), pot = genPotion(3);
    const all = [bronze, rune, sword, bow, staff, locked, set, pot], m = ()=>all.map(it=>lootfMatch(it) ? 1 : 0).join('');
    out.tier = [bronze, rune, sword, bow, staff].map(lootfTier);
    const F = lootfP(); const keepArrow = lootArrow; lootArrow = ()=>'';
    Object.assign(F, { tiers:[0], stats:[], statMode:'keep', safeUp:true }); out.t1 = m();
    Object.assign(F, { tiers:[0,1,2,3,4,5,6] }); out.allTiers = m();
    Object.assign(F, { stats:['rngAcc','magAcc'], statMode:'keep' }); out.keepRM = m();
    Object.assign(F, { stats:['acc'], statMode:'match' }); out.matchMelee = m();
    Object.assign(F, { stats:['ac'], statMode:'match' }); out.matchDef = m();
    Object.assign(F, { stats:[] }); lootArrow = ()=>'up'; out.up = lootfMatch(bronze); lootArrow = ()=>'';
    // a drop with the filter on is salvaged and paid; with it off it is kept
    F.on = true; const g0 = p.gold; G.inv = []; addToInventory(rsMakeArmour('metal', 0, 'feet')); out.dropTaken = G.inv.length===0 && p.gold > g0;
    F.on = false; addToInventory(rsMakeArmour('metal', 0, 'feet')); out.dropKept = G.inv.length===1;
    // the bag sweep from the menu
    G.inv = all.slice(); Object.assign(F, { tiers:[0], stats:['magAcc'], statMode:'keep' }); setUi('lootfilter');
    out.sum = (document.querySelector('#overlay .lf-sum')||{}).textContent.replace(/\s+/g, ' ').trim();
    const g1 = p.gold; [...document.querySelectorAll('#overlay .lf-sum .btn')][0].click(); out.swept = G.inv.length===all.length-1 && !G.inv.includes(bronze) && G.inv.includes(staff) && p.gold > g1;
    // the chips change the settings
    setUi('lootfilter'); const t2 = [...document.querySelectorAll('#overlay .lf-chip')].find(b=>/^Tier 2/.test(b.textContent)); t2.click(); out.t2on = F.tiers.includes(1);
    const rc = [...document.querySelectorAll('#overlay .lf-chip')].find(b=>b.textContent.trim()==='ranged'); rc.click(); out.rangedOn = F.stats.includes('rngAcc');
    const on = document.querySelector('#overlay .lf-on'); on.click(); out.onAfter = F.on; lootfSet('on', false);
    // the bag: no junk tab, tag or button; a Salvage tab
    setUi('inventory'); out.tabs = [...document.querySelectorAll('#overlay .cs-bagtab')].map(e=>e.textContent.replace(/\s*\d+$/, '').trim()).join();
    out.bagJunk = /junk/i.test(document.getElementById('overlay').textContent) || !!document.querySelector('#overlay .sp-cell.junk, #overlay i.jk');
    setUi('lootfilter'); backOut(); out.esc = G.ui;
    lootArrow = keepArrow; setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(/"on":false/.test(r.def), 'the filter starts off');
  A(/loot filter/.test(r.btn||'') && r.ui==='lootfilter' && /LOOT FILTER/.test(r.title||'') && !r.junkWord, 'the bag\'s button opens the menu');
  A(!r.quality && !r.oldStats && r.bonusChips.join()==='melee attack,strength,defence,ranged,magic,spell damage,prayer', 'the bonuses gear carries, no quality row and no old stats: '+r.bonusChips);
  A(r.tier.join()==='0,4,1,1,0', 'tiers by the level a piece needs: '+r.tier);
  A(r.t1==='10001000', 'tier 1: the bronze helm and the staff - never a locked piece, a set or a potion');
  A(r.allTiers==='11111000', 'every tier: all but the protected');
  A(r.keepRM==='11100000', 'keeping ranged and magic: the bow and staff stay, melee and plate go');
  A(r.matchMelee==='00101000', 'salvaging melee attack: the sword and the staff, not the bow');
  A(r.matchDef==='11000000', 'salvaging defence: the helm and the body');
  A(r.up===false, 'an upgrade is never salvaged');
  A(r.dropTaken && r.dropKept, 'a matching drop is salvaged when the filter is on, kept when it is off');
  A(/1 piece matches/.test(r.sum) && r.swept, 'the menu shows what matches in the bag and salvages it');
  A(r.t2on && r.rangedOn && r.onAfter===true, 'the chips change the settings');
  A(r.tabs==='All,Gear,Food,Scrolls,Resources,Salvage' && !r.bagJunk, 'no junk tag, tab or button in the bag; a Salvage tab');
  A(r.esc==='inventory', 'Escape goes back to the bag');
};
