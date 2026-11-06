// RS-463: tooltips tell the truth - runes come from the temple, the altars and monsters (the alchemist stopped selling them in RS-369),
// levels are combat levels not the old tiers, and no tooltip reads "undefined"; the skill guides, spell hints and help match the game
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = { bad:[] }, flag = (where, s)=>{ if (/undefined|NaN|alchemist sells|sold by the alchemist|\bof level \d+\b/i.test(s)) out.bad.push(where + ': ' + s.slice(0, 120)); };
    for (const [, ids] of resCatsRaw()) for (const id of ids){ for (const s of resSources(id)) flag('src ' + id, s); for (const s of resUses(id)) flag('use ' + id, s); }
    const src = id=>resSources(id).join(' | ');
    out.nature = src('r_nature'); out.air = src('r_air'); out.chaos = src('r_chaos'); out.mist = src('r_mist'); out.dhide = src('dhide_b'); out.oak = src('oak'); out.goldUses = resUses('goldb').join(' | ');
    out.antipoison = itemDesc(mkAntipoison()); out.scroll = examineItem(Object.assign(newItem(), { used:1, kind:'scroll', desc:'a scroll of reforging' }));
    for (const k of ['slayer', 'necromancy', 'magic', 'fishing', 'mining']) for (const row of skGuideRows(k)) flag('guide ' + k, row.t);
    const g = k=>skGuideRows(k).map(x=>x.l + ':' + x.t);
    out.tuna = g('fishing').find(t=>/Tuna/.test(t)); out.runite = g('mining').find(t=>/^[0-9]+:Runite/.test(t)); out.slayerXp = g('slayer').find(t=>/xp/.test(t)); out.minions = g('necromancy').filter(t=>/minions raised/.test(t)); out.cureMe = g('magic').find(t=>/Cure Me/.test(t));
    out.rCast = /R casts/.test(document.documentElement.innerHTML);
    return out; });
  console.log(JSON.stringify(r, null, 1));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m); };
  A(!r.bad.length, 'no tooltip reads undefined, sends you to the alchemist for runes, or gives an old-tier level: ' + r.bad.join(' ; '));
  A(/temple/.test(r.air) && !/temple/.test(r.nature) && /combat level \d+/.test(r.nature), 'basic runes at the temple; nature runes from monsters of a combat level');
  A(/chaos altar/.test(r.chaos) && /air altar|water altar/.test(r.mist), 'altars bind runes, combination runes too');
  A(/combat level 48-73/.test(r.dhide), 'dragonhide by combat level');
  A(/ancient oak/.test(r.oak) && !/anvil/.test(r.goldUses), 'oak names the ancient oak; gold is not forged at an anvil');
  A(!/undefined/.test(r.antipoison) && !/single spell/.test(r.scroll), 'an antipoison and a scroll describe themselves');
  A(/open sea/.test(r.tuna) && r.runite && !/hill rocks/.test(r.runite) && /three times/.test(r.slayerXp) && r.minions.length===3 && /Defence 40/.test(r.cureMe), 'the skill guides are right');
};
