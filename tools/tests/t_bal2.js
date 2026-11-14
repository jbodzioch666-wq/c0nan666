// the RS-194 balance pass, tuned with tools/sim: melee maxes in about 45 hours, gold is scarce enough to matter, the smith's
// prices fall as you flood him, woodcutting and foraging keep pace with fishing and mining, and prayer, slayer, runecrafting,
// alchemy and smithing no longer lag the other skills by a factor of four
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    const p = G.player; p.race = RACES[1][0]; p.songT = null;   // (RS-222/223: no race or song xp bonus in the way)
    A(RS_XP_PER_DMG===5, 'five combat xp a point of damage');
    A(coinTrim({ mlevel:2 })===0.5 && Math.abs(coinTrim({ mlevel:7 }) - 0.5*(1 - 0.75*4/9)) < 1e-9 && Math.abs(coinTrim({ mlevel:18 }) - 0.125) < 1e-9, 'coins trimmed by tier');
    A(GATHER_XP.woodcutting===1.2 && GATHER_XP.foraging===3.8 && GATHER_XP.fishing===2.4 && GATHER_XP.mining===2.0, 'gathering xp weights');
    A(RC_ALTARS.air.xp===45 && RC_ALTARS.death.xp===90 && RC_ALTARS.blood.xp===96, 'runecrafting xp tripled');
    A(RS_BONES[0][2]===30 && RS_BONES[1][2]===100 && RS_BONES[2][2]===400, 'bones');
    A(SK_HERB.find(h=>h.id==='starlily').axp===300 && SK_HERB.find(h=>h.id==='silverleaf').axp===45, 'alchemy xp');
    const rb = SK_BAR.find(b=>b.id==='runeb'), sb = SK_BAR.find(b=>b.id==='steelb'); A(rb.coal===4 && rb.xp===120 && sb.coal===1 && sb.xp===40, 'half the coal, more xp a bar');
    A(/\(m\.maxHp\|\|1\)\*3/.test(tkOnKill.toString()), 'slayer xp tripled');
    // forging pays three times the bar's xp per bar
    for (const [k] of SK_DEFS) p.skills[k] = SK_XP[85]; rsSync(); p.bag = {}; skAdd('runeb', 5); G.inv = [];
    const x0 = p.skills.smithing; skForge('runeb', 'chest'); out.forgeXp = p.skills.smithing - x0; A(out.forgeXp===Math.round(120*5*3*XP_RATE), 'forge xp: '+out.forgeXp);
    // smelting a rune bar takes one runite and four coal
    skAdd('runite', 1); skAdd('coal', 4); skSmelt('runeb'); A(skHave('runeb')===1 && skHave('coal')===0, 'one runite and four coal a bar');
    // the smith's price falls as you flood him, and recovers
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); p.turnCount = (p.turnCount||0) + 1000;
    p.bag = {}; skAdd('adamant', 40); const first = smithPrice('adamant'); A(first===SMITH_BUYS.adamant && first===50, 'the full price first: '+first);
    const g0 = p.gold, allText = smithAllTotal('adamant'); smithSell('adamant', 1); out.sold40 = p.gold - g0; A(out.sold40===allText, 'sell-all total matches what it says: '+out.sold40+' vs '+allText);
    A(out.sold40 < 40*first && out.sold40 > 40*first*0.35, 'forty ore fetch less than forty times the first price: '+out.sold40);
    skAdd('adamant', 1); const flooded = smithPrice('adamant'); A(flooded < first, 'flooded: '+flooded);
    p.turnCount += ECO_RECOVER*60; A(smithPrice('adamant')===first, 'recovered');
    G.gameMode = 0; A(smithPrice('adamant')===first, 'full price outside town');
    // the Peddler pays less for logs and herbs
    skAdd('yew', 1); skAdd('starlily', 1); A(shopResPrice('yew')===Math.round(175*0.2) && shopResPrice('starlily')===Math.round(70*0.5), 'raw goods prices');
    return out;
  });
  console.log(JSON.stringify(r));
};
