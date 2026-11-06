// mobs (RS-748): monsters against the gear the loot system hands you. At a sample of levels it fights that level's monsters (built as
// the game builds them, monEntryExtras) in the best plain metal for the level, in "found" gear - for every slot, weapon and armour,
// cape, amulet, both rings and the trinket, the best of eight drops of that level (genItem), what a player has picked up by then -
// and in "farmed" gear, the best of thirty. Prints kills an hour, damage taken a kill as a share of your life, food an hour and deaths.
module.exports = async page=>{
  const K = process.env.MOB_K ? JSON.parse(process.env.MOB_K) : null;   /* (a trial of the monsters' loot scale: MOB_K='{"hp":0.6}') */
  const r = await page.evaluate(K=>{ if (K) Object.assign(MON_LOOT, K); const tiers = [30, 45, 52, 70, 92, 113].map(c=>c + ':' + tierOfCb(c).toFixed(1));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    saveCurrentGame = ()=>{}; renderGame = ()=>{}; renderOverlay = ()=>{}; logMsg = ()=>{}; sfx = ()=>{}; notify = ()=>{};
    const p = G.player, out = [];
    G.gameMode = 2; generateArena(); G.mon = [];
    p.rsStyle = 3;
    const ARM = ['head','chest','legs','arms','feet','offhand'], JEW = { cape:'cape', necklace:'necklace', ring1:'ring', ring2:'ring', trinket:'trinket' };
    const fight = (L, gear, FIGHTS)=>{
      for (const k of ['attack','strength','defence']) p.skills[k] = SK_XP[L]; for (const k of ['ranged','magic','necromancy','prayer']) p.skills[k] = SK_XP[1]; p.skills.hitpoints = SK_XP[Math.max(10, L)]; p.prayers = []; rsSync();
      for (const sl of ['weapon'].concat(ARM, Object.keys(JEW))) G.gear[sl] = gear[sl] || newItem();
      const fish = SK_FISH.filter(f=>f.lvl <= L && !f.hard).pop() || SK_FISH[0]; p.bag = {}; skAdd('c_'+fish.id, 1e6);
      const entry = pickMonsterEntry(p.combatLevel, 0);
      p.hp = effMaxHp(); G.inv = []; p.gold = 0; G.gameOver = 0;
      let beats = 0, kills = 0, deaths = 0, taken = 0, mhp = 0; const food0 = skHave('c_'+fish.id);
      while (kills < FIGHTS && beats < 60000){
        const m = newMonster(); m.alive = 1; m.x = p.x; m.y = p.y-1; m.hp = m.maxHp = rollDice(entry.hd, 8) + entry.hd; m.ac = entry.ac; m.atkBonus = entry.atk;
        m.dmg1 = entry.dmg1; m.dmg2 = entry.dmg2; m.xp = entry.xp; m.sym = entry.sym; m.nm = entry.nm; m.baseNm = entry.nm; m.undead = entry.undead; m.mlevel = entry.lvl;
        m.abilities = entry.abilities.slice(); m.art = entry.art; monEntryExtras(m, entry); G.mon = [m]; G.lastFoe = { hp:m.hp }; mhp += m.maxHp;
        for (let b=0;b<400;b++){
          beats++;
          if (p.hp < effMaxHp()*0.5 && skFoods().length){ eatFood(); }
          else { let dead = false; try{ dead = singlePlayerAttack(0); }catch(e){}
            if (dead || !m.alive || m.hp <= 0){ kills++; break; } const ph = p.hp; monsterAttacks(0); taken += Math.max(0, ph - p.hp); }
          if (G.gameOver || p.hp <= 0){ deaths++; G.gameOver = 0; p.hp = effMaxHp(); break; }
          if (!m.alive || m.hp <= 0){ kills++; break; }
        }
      }
      const hours = beats*ISO_SWING_MS/3600000, hp = effMaxHp();
      return { L, cb:p.combatLevel, foe:entry.nm, monHp:Math.round(mhp/Math.max(1, kills)), kph:Math.round(kills/hours), takenPct:+(100*taken/Math.max(1,kills)/hp).toFixed(1), foodH:Math.round((food0 - skHave('c_'+fish.id))/hours), deathsH:+(deaths/hours).toFixed(1), ac:Math.round(playerAC()), maxHp:hp };
    };
    const score = (it, sl)=>itemScoreFor(it, 'melee') + (sl==='weapon' ? itemScore(it) : 0);
    const found = (L, n)=>{ const g = {};
      for (const sl of ['weapon'].concat(ARM, Object.keys(JEW))){ const kind = JEW[sl] || sl; let best = null, bs = -1e9;
        for (let got=0, tries=0; got<n && tries<n*30; tries++){ const it = genItem(L, kind, 3); if (!it || !it.used) continue; if (sl==='weapon' && (it.range || it.rsStaff || it.slot!=='weapon')) continue;
          if (ARM.includes(sl) && it.rsFam && it.rsFam!=='metal') continue; got++; const s = score(it, sl); if (s > bs){ bs = s; best = it; } }
        g[sl] = best; } return g; };
    const tot = { plain:[], found:[], farmed:[] };
    for (const L of [10, 20, 30, 40, 60, 80, 99]){
      const top = RS_METALS.reduce((t, m, i)=>m[1] <= L ? i : t, 0), plain = { weapon:rsMakeWeapon(top, 3) }; for (const sl of ARM) plain[sl] = rsMakeArmour('metal', top, sl);
      for (const [kind, n] of [['plain', 0], ['found', 8], ['farmed', 30]]){   /* (found and farmed: six sets of gear, averaged - one set's luck swings it) */
        const rs = n ? [0, 1, 2, 3, 4, 5].map(()=>fight(L, found(L, n), 80)) : [fight(L, plain, 150)], o = Object.assign({}, rs[0], { kind });
        for (const k of ['kph', 'takenPct', 'foodH', 'deathsH', 'ac', 'maxHp']) o[k] = +(rs.reduce((t, x)=>t + x[k], 0)/rs.length).toFixed(k==='takenPct' || k==='deathsH' ? 1 : 0);
        tot[kind].push(o); out.push(o); console.log('SIM ' + JSON.stringify(o)); }
    }
    const sum = k=>({ kph:Math.round(tot[k].reduce((t, o)=>t + o.kph, 0)/tot[k].length), takenPct:+(tot[k].reduce((t, o)=>t + o.takenPct, 0)/tot[k].length).toFixed(1), foodH:Math.round(tot[k].reduce((t, o)=>t + o.foodH, 0)/tot[k].length), deaths:+tot[k].reduce((t, o)=>t + o.deathsH, 0).toFixed(1) });
    return { tiers, MON_LOOT, plain:sum('plain'), found:sum('found'), farmed:sum('farmed') };
  }, K);
  console.log('averages: ' + JSON.stringify(r));
};
