// gear: what each tier of metal is worth at each level. At a sample of melee levels it fights that level's monsters in every
// tier you may wear there (scimitar + full armour), and measures kills an hour, food eaten an hour and deaths; at a few
// levels it also splits the weapon from the armour (best weapon in the worst armour, and the other way round).
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    saveCurrentGame = ()=>{}; renderGame = ()=>{}; renderOverlay = ()=>{}; logMsg = ()=>{}; sfx = ()=>{}; notify = ()=>{};
    const p = G.player, out = [];
    G.gameMode = 2; generateArena(); G.mon = [];
    p.rsStyle = 3;
    const fight = (L, wt, at, FIGHTS, fam)=>{ fam = fam || 'metal';
      for (const k of ['attack','strength','defence']) p.skills[k] = SK_XP[L]; for (const k of ['ranged','magic','necromancy','prayer']) p.skills[k] = SK_XP[1]; p.skills.hitpoints = SK_XP[Math.max(10, L)]; p.prayers = []; rsSync();
      G.gear.weapon = rsMakeWeapon(wt, 3); for (const sl of ['head','chest','legs','arms','feet','offhand']) G.gear[sl] = RS_ARMOUR[fam].names[sl] ? rsMakeArmour(fam, at, sl) : newItem();
      for (const sl of ['cape','necklace','ring1','ring2','trinket']) G.gear[sl] = newItem();
      const fish = SK_FISH.filter(f=>f.lvl <= L && !f.hard).pop() || SK_FISH[0]; p.bag = {}; skAdd('c_'+fish.id, 1e6);
      const entry = pickMonsterEntry(p.combatLevel, 0), tier = entry.lvl;
      p.hp = effMaxHp(); G.inv = []; p.gold = 0; G.gameOver = 0;
      let beats = 0, kills = 0, deaths = 0, dealt = 0, taken = 0, swings = 0, hits = 0; const food0 = skHave('c_'+fish.id);
      while (kills < FIGHTS && beats < 60000){
        const m = newMonster(); m.alive = 1; m.x = p.x; m.y = p.y-1; m.hp = m.maxHp = rollDice(entry.hd, 8) + entry.hd; m.ac = entry.ac; m.atkBonus = entry.atk;
        m.dmg1 = entry.dmg1; m.dmg2 = entry.dmg2; m.xp = entry.xp; m.sym = entry.sym; m.nm = entry.nm; m.baseNm = entry.nm; m.undead = entry.undead; m.mlevel = entry.lvl;
        m.abilities = entry.abilities.slice(); m.art = entry.art; monEntryExtras(m, entry); G.mon = [m]; G.lastFoe = { hp:m.hp };
        for (let b=0;b<400;b++){
          beats++;
          if (p.hp < effMaxHp()*0.5 && skFoods().length){ eatFood(); }
          else { const mh = m.hp; let dead = false; try{ dead = singlePlayerAttack(0); }catch(e){} swings++; if (m.hp < mh || dead){ hits++; dealt += Math.max(0, mh - Math.max(0, m.hp)); }
            if (dead || !m.alive || m.hp <= 0){ kills++; break; } const ph = p.hp; monsterAttacks(0); taken += Math.max(0, ph - p.hp); }
          if (G.gameOver || p.hp <= 0){ deaths++; G.gameOver = 0; p.hp = effMaxHp(); break; }
          if (!m.alive || m.hp <= 0){ kills++; break; }
        }
      }
      const hours = beats*ISO_SWING_MS/3600000;
      return { L, cb:p.combatLevel, foe:entry.nm, foeLvl:entry.cb, weapon:RS_METALS[wt][0], armour:RS_ARMOUR[fam].tiers[at][0], kph:Math.round(kills/hours), hit:+(hits/Math.max(1,swings)).toFixed(2),
        dmgPerSwing:+(dealt/Math.max(1,swings)).toFixed(1), takenPerKill:+(taken/Math.max(1,kills)).toFixed(1), foodH:Math.round((food0 - skHave('c_'+fish.id))/hours), deathsH:+(deaths/hours).toFixed(1), ac:Math.round(playerAC()), maxHp:effMaxHp() };
    };
    const LEVELS = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    for (const L of LEVELS){
      const top = RS_METALS.reduce((t, m, i)=>m[1] <= L ? i : t, 0);
      for (let t=0; t<=top; t++){ const o = fight(L, t, t, 80); o.kind = t===top ? 'best' : 'tier'; out.push(o); console.log('SIM '+JSON.stringify(o)); }
      if ([20, 40, 60, 99].includes(L) && top > 0){
        const w = fight(L, top, 0, 80); w.kind = 'weapon only'; out.push(w); console.log('SIM '+JSON.stringify(w));
        const a = fight(L, 0, top, 80); a.kind = 'armour only'; out.push(a); console.log('SIM '+JSON.stringify(a));
      }
      // the same fighter in a ranger's dragonhide or a mage's robes, to see what the lighter armour costs in damage taken
      if ([40, 60, 99].includes(L)) for (const fam of ['hide', 'cloth']){ const tiers = RS_ARMOUR[fam].tiers, ft = tiers.reduce((t, x, i)=>x[1] <= L ? i : t, 0);
        const o = fight(L, top, ft, 80, fam); o.kind = fam+' armour'; out.push(o); console.log('SIM '+JSON.stringify(o)); }
    }
    return out;
  });
};
