// combat: fights at a sample of levels, driving the game's own attack code. Prints xp an hour, gold an hour (coins and the
// sale value of drops), food eaten and deaths, then the hours it takes to max melee from those rates.
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    saveCurrentGame = ()=>{}; renderGame = ()=>{}; renderOverlay = ()=>{}; logMsg = ()=>{}; sfx = ()=>{}; notify = ()=>{};
    const p = G.player, out = [];
    G.gameMode = 2; generateArena(); G.mon = [];
    p.rsStyle = 3;   // controlled: melee xp shared across attack, strength and defence
    const LEVELS = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    for (const L of LEVELS){
      for (const k of ['attack','strength','defence']) p.skills[k] = SK_XP[L]; p.skills.hitpoints = SK_XP[Math.max(10, L)]; p.prayers = []; rsSync();
      let t = 0; for (let i=0;i<=5;i++) if (RS_METALS[i][1] <= L) t = i;
      G.gear.weapon = rsMakeWeapon(t, 3); for (const sl of ['head','chest','legs','arms','feet','offhand']) G.gear[sl] = rsMakeArmour('metal', t, sl);
      for (const sl of ['cape','necklace','ring1','ring2','trinket']) G.gear[sl] = newItem();
      const fish = SK_FISH.filter(f=>f.lvl <= L && !f.hard).pop() || SK_FISH[0]; p.bag = {}; skAdd('c_'+fish.id, 1e6);
      const tier = p.level, entry = MONSTER_LEVELS[tier-1];
      p.hp = effMaxHp(); G.inv = []; p.gold = 0; G.gameOver = 0;
      const xp0 = {}; for (const k of ['attack','strength','defence','hitpoints']) xp0[k] = p.skills[k];
      let beats = 0, kills = 0, deaths = 0, drops = 0, dropN = 0; const food0 = skHave('c_'+fish.id);
      const FIGHTS = 120;
      while (kills < FIGHTS && beats < 60000){
        const m = newMonster(); m.alive = 1; m.x = p.x; m.y = p.y-1; m.hp = m.maxHp = rollDice(entry.hd, 8) + entry.hd; m.ac = entry.ac; m.atkBonus = entry.atk;
        m.dmg1 = entry.dmg1; m.dmg2 = entry.dmg2; m.xp = entry.xp; m.sym = entry.sym; m.nm = entry.nm; m.baseNm = entry.nm; m.undead = entry.undead; m.mlevel = entry.lvl;
        m.abilities = entry.abilities.slice(); m.art = entry.art; monEntryExtras(m, entry); G.mon = [m]; G.lastFoe = { hp:m.hp };
        for (let b=0;b<400;b++){
          beats++;
          if (p.hp < effMaxHp()*0.5 && skFoods().length){ eatFood(); }
          else { let dead = false; try{ dead = singlePlayerAttack(0); }catch(e){ console.error(e); } if (dead || !m.alive || m.hp <= 0){ kills++; break; } monsterAttacks(0); }
          if (G.gameOver || p.hp <= 0){ deaths++; G.gameOver = 0; p.hp = effMaxHp(); break; }
          if (!m.alive || m.hp <= 0){ kills++; break; }
        }
      }
      for (const it of G.inv){ drops += sellPrice(it); dropN++; } G.inv = [];
      const hours = beats*ISO_SWING_MS/3600000;
      const xp = {}; let melee = 0; for (const k of ['attack','strength','defence','hitpoints']){ xp[k] = p.skills[k] - xp0[k]; if (k!=='hitpoints') melee += xp[k]; }
      out.push({ L, cb:p.combatLevel, tier, foe:entry.nm, gear:RS_METALS[t][0], food:fish.nm, kills, deaths, hours:+hours.toFixed(3), kph:Math.round(kills/hours), meleeXpH:Math.round(melee/hours), hpXpH:Math.round(xp.hitpoints/hours),
        coinsH:Math.round(p.gold/hours), dropsH:Math.round(drops/hours), dropsPerKill:+(dropN/kills).toFixed(2), foodH:Math.round((food0 - skHave('c_'+fish.id))/hours), deathsH:+(deaths/hours).toFixed(1) });
      console.log('SIM '+JSON.stringify(out[out.length-1]));
    }
    // hours to 99 in all three melee skills, training at the rate measured for the nearest sample level
    let hours = 0, gold = 0, food = 0; const rateAt = L=>{ let best = out[0]; for (const o of out) if (Math.abs(o.L-L) < Math.abs(best.L-L)) best = o; return best; };
    for (let L=1;L<99;L++){ const need = 3*(SK_XP[L+1]-SK_XP[L]), o = rateAt(L), h = need/o.meleeXpH; hours += h; gold += h*(o.coinsH + o.dropsH); food += h*o.foodH; }
    return { out, toMax:{ hours:+hours.toFixed(1), gold:Math.round(gold), food:Math.round(food) } };
  });
  console.log('to max melee: '+JSON.stringify(r.toMax));
};
