// the RS-100 balance changes: monsters bite harder, the lair boss has fixed strength, the world-boss giant
// fights above you, high-tier coins are trimmed, and the smith reinforces gear as a gold sink
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const p = G.player; p.race = RACES[1][0]; p.songT = null;   // (RS-222/223: no race or song xp bonus in the way)
    // monsters: +25% accuracy and damage over their table entry
    const e = MONSTER_LEVELS[13], m = newMonster(); m.atkBonus = e.atk; m.dmg2 = e.dmg2; monEntryExtras(m, e);
    out.troll = [m.atkBonus, m.dmg2]; A(m.atkBonus===Math.round(e.atk*1.25) + monAccBonus(14) && monAccBonus(14)===6 && monAccBonus(20)===6 && m.dmg2===Math.round(e.dmg2*1.25), 'monsters bite harder'); A(Math.abs(monBite(20)-1.15) < 1e-9 && monBite(14)===1.25, 'the bite eases off a little at the top (RS-240)');
    // coins: half of the old roll up to tier 3, falling to a quarter of that from tier 12 (RS-194)
    A(coinTrim({ mlevel:1 })===0.5 && coinTrim({ mlevel:3 })===0.5 && Math.abs(coinTrim({ mlevel:12 }) - 0.125) < 1e-9 && Math.abs(coinTrim({ mlevel:20 }) - 0.125) < 1e-9, 'coin trim');   /* (RS-194: half the coins, a quarter of that from tier 12) */
    // the lair boss: the same strength whatever your level
    const lb = L=>{ for (const k of ['attack','strength','defence']) skP().skills[k] = SK_XP[L]; skP().skills.hitpoints = SK_XP[Math.max(10,L)]; rsSync();
      generateArena(); G.gameMode = 2; G.mon = []; G.siteKind = 'lair'; G.dungeonMaxDepth = 10; G.genStart = { x:5, y:5 }; G.dungeonModifier = null; spawnBoss(); const b = G.mon[0]; G.mon = []; return [b.maxHp, b.ac, b.atkBonus, b.dmg2]; };
    const b40 = lb(40), b99 = lb(99); out.lairBoss = [b40, b99];
    A(JSON.stringify(b40)===JSON.stringify(b99) && b99[0]===LAIR_BOSS.hp, 'the lair boss no longer grows with you');
    // the smith: reinforce a worn rune scimitar, +1 then +2, each step pricier
    for (const k of ['attack','strength','defence']) skP().skills[k] = SK_XP[60]; rsSync();
    G.gear.weapon = rsMakeWeapon(5, 3); const acc0 = G.gear.weapon.acc, c1 = reinfCost(G.gear.weapon);
    p.gold = 1e6; smithReinforce('weapon'); A(G.gear.weapon.reinf===1 && G.gear.weapon.acc > acc0 && p.gold===1e6 - c1 && /\+1$/.test(G.gear.weapon.nm), 'reinforced +1');
    const c2 = reinfCost(G.gear.weapon); A(c2 > c1*2, 'the next step costs more'); smithReinforce('weapon'); A(G.gear.weapon.reinf===2 && /\+2$/.test(G.gear.weapon.nm) && !/\+1 \+2/.test(G.gear.weapon.nm), 'reinforced +2');
    out.costs = [c1, c2, reinfCost(G.gear.weapon)];
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('blacksmith'); A(document.getElementById('overlay').innerHTML.includes('REINFORCE YOUR GEAR'), 'the smith offers it');
    setUi('playing');
    // RS-101: the pace, the sickle, scarce top resources, and the Peddler buying raw goods
    A(XP_RATE===0.3, 'xp at a tenth of RuneScape pace'); const a0 = skP().skills.attack; skGainXP('attack', 100); A(skP().skills.attack - a0===30, 'xp scaled');
    A(SK_TOOLS.some(t=>t.id==='sickle' && t.skill==='foraging'), 'a sickle for foraging');
    A(SK_FISH.find(f=>f.id==='shark').hard > 0 && SK_ORE.find(o=>o.id==='runite').hard > 0 && SK_LOG.find(l=>l.id==='magic').hard > 0, 'the best resources are hard to take');
    A(SMITH_BUYS.runeb===320 && SK_TIER.find(t=>t[0]==='Infernal')[2]===60000, 'prices');
    skAdd('yew', 10); skAdd('c_lobster', 5); setUi('shop'); const ov = document.getElementById('overlay').innerHTML; A(ov.includes('THE PEDDLER BUYS RAW GOODS'), 'the Peddler buys raw goods');
    const g0 = p.gold; shopSellRes('yew', 1); A(skHave('yew')===0 && p.gold > g0, 'sold the logs'); out.yewGold = p.gold - g0;
    const g1 = p.gold; shopSellRes('c_lobster'); shopSellRes('c_lobster'); out.lobster = p.gold - g1; setUi('playing');
    // RS-120: gathering keeps its pace - one take every couple of seconds, not one every frame
    { G.gameMode = 0; G.interior = null; setUi('playing'); const o = { k:'foraging', label:'Pick herbs' };
      G.gather = { o, mode:0, pos:G.owPos.x+','+G.owPos.y, next:0, n:0 }; let t = 1e6, takes = 0; const n0 = () => G.gather ? G.gather.n : -1;
      for (let i=0;i<600 && G.gather;i++){ t += 16.7; const before = G.gather.n; skGatherTick(t); if (G.gather && G.gather.n > before) takes++; }   // ten seconds of frames
      G.gather = null; out.takes10s = takes; A(takes >= 2 && takes <= 5, 'gathering takes in ten seconds: '+takes); }
    return out;
  });
  console.log(JSON.stringify(r));
};
