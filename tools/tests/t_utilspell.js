// RS-191: the utility spells (crowd control, Lunar self-spells, thralls, alchemy) sit apart from the combat spells, with their
// own pick and their own autocast: auto-utility opens a fight with the chosen spell when it's worth it, then you fight as usual
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    o3Pref = false; v3Pref = false;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const p = G.player, out = {};
    skGainXP('magic', 5e6); for (const rn of ['air','water','earth','mind','nature','chaos','fire']) skAdd('r_'+rn, 500);
    out.counts = { std:rsBookSpells().filter(rsSpellUtil).length, cmb:rsBookSpells().filter(sp=>!rsSpellUtil(sp)).length };
    // the spellbook shows two sections, with the second toggle
    setUi('rsmagic'); const html = document.body.innerHTML; out.book = /COMBAT SPELLS/.test(html) && /UTILITY SPELLS/.test(html) && /auto-utility/.test(html);
    setUi('playing');
    // picking a utility spell doesn't change R's spell
    p.rsSpell = 'windstrike'; rsSelectSpell('confuse'); out.pick = { r:p.rsSpell, u:p.rsUtil };
    // the side panel: two grids
    SP.open = true; SP.tab = 'spells'; hudLayout(); out.panel = document.querySelectorAll('#sidePanel .sp-spg').length;
    // into a fight: auto-utility confuses the foe first, then melee
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const m = Object.assign(newMonster(), famEntry('goblin', 0)); m.alive = 1; m.hp = m.maxHp = 400; m.x = p.x + 1; m.y = p.y; G.mon.forEach(o=>o.alive = 0); G.mon.push(m); const mi = G.mon.length - 1;
    p.rsUtilAuto = true; p.rsAutocast = false; const w0 = skHave('r_water');
    fight(mi); out.first = { confused:m.debuffAtkTurns > 0, spent:skHave('r_water') < w0, hp:m.hp };
    const hp1 = m.hp, w1 = skHave('r_water'); fight(mi); out.second = { noRecast:skHave('r_water')===w1 };
    // off: no utility cast
    m.debuffAtkTurns = 0; p.rsUtilAuto = false; const w2 = skHave('r_water'); fight(mi); out.off = skHave('r_water')===w2 && !(m.debuffAtkTurns > 0);
    // an old save that had a crowd-control spell as R's: it moves over
    p.rsSpell = 'curse'; p.rsUtil = null; rsMigrateAll(); out.migrate = { r:p.rsSpell, u:p.rsUtil };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.counts.std >= 9 && r.counts.cmb >= 20, 'the standard book splits into combat and utility spells');
  A(r.book && r.panel===2, 'the spellbook and the side panel show the two groups, with an auto-utility toggle');
  A(r.pick.r==='windstrike' && r.pick.u==='confuse', 'picking a utility spell leaves R on its combat spell');
  A(r.first.confused && r.first.spent && r.second.noRecast, 'auto-utility opens with Confuse, then fights on without recasting it');
  A(r.off, 'with auto-utility off, nothing is cast');
  A(!r.migrate.r && r.migrate.u==='curse', 'an old crowd-control pick moves to the utility slot');
};
