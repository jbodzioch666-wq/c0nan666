// loot (RS-704): what the affix system is worth. At a sample of levels it rolls drops and reports the rarity shares, the bonuses a
// magic and a rare piece carry and the tier spread; then it fights that level's monsters in the best plain gear, in the same gear
// with a middling magic piece in every slot, with a middling rare in every slot, and with the best rare of thirty in every slot,
// and measures kills an hour and damage taken a kill - the spread a drop can make. At 99, Ancestral rares too (RS-709)
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    saveCurrentGame = ()=>{}; renderGame = ()=>{}; renderOverlay = ()=>{}; logMsg = ()=>{}; sfx = ()=>{}; notify = ()=>{};
    const p = G.player, out = [];
    G.gameMode = 2; generateArena(); G.mon = [];
    p.rsStyle = 3;
    const SLOTS = ['head','chest','legs','arms','feet','offhand'];
    for (const L of [10, 30, 50, 70, 90, 110, 126]){ const c = [0,0,0,0,0], tiers = {}; let nm = 0, nr = 0, am = 0, ar = 0, na = 0, ng = 0;
      for (let i=0;i<1500;i++){ const it = genItem(L, lootKind(), 3); c[it.quality||0]++; if (it.quality===1){ nm++; am += it.aff.length; } if (it.quality===2){ nr++; ar += it.aff.length; } if (it.quality===1 || it.quality===2) for (const a of it.aff) if (a.t) tiers['T'+a.t] = (tiers['T'+a.t]||0) + 1; if (it.anc){ na++; ng += it.aff.filter(a=>a.g).length; } }
      const o = { kind:'drops', L, plain:+(c[0]/15).toFixed(1), magic:+(c[1]/15).toFixed(1), rare:+(c[2]/15).toFixed(1), set:+(c[3]/15).toFixed(2), affMagic:+(am/Math.max(1,nm)).toFixed(2), affRare:+(ar/Math.max(1,nr)).toFixed(2), ancestral:+(na/15).toFixed(2), greaterPerAnc:+(ng/Math.max(1,na)).toFixed(2), tiers }; out.push(o); console.log('SIM '+JSON.stringify(o)); }
    const fight = (L, gear, FIGHTS)=>{
      for (const k of ['attack','strength','defence']) p.skills[k] = SK_XP[L]; for (const k of ['ranged','magic','necromancy','prayer']) p.skills[k] = SK_XP[1]; p.skills.hitpoints = SK_XP[Math.max(10, L)]; p.prayers = []; rsSync();
      for (const k in gear) G.gear[k] = gear[k]; for (const sl of ['cape','necklace','ring1','ring2','trinket']) G.gear[sl] = newItem();
      const fish = SK_FISH.filter(f=>f.lvl <= L && !f.hard).pop() || SK_FISH[0]; p.bag = {}; skAdd('c_'+fish.id, 1e6);
      const entry = pickMonsterEntry(p.combatLevel, 0);
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
      return { L, cb:p.combatLevel, foe:entry.nm, kph:Math.round(kills/hours), hit:+(hits/Math.max(1,swings)).toFixed(2), dmgPerSwing:+(dealt/Math.max(1,swings)).toFixed(1), takenPerKill:+(taken/Math.max(1,kills)).toFixed(1), foodH:Math.round((food0 - skHave('c_'+fish.id))/hours), deathsH:+(deaths/hours).toFixed(1), ac:Math.round(playerAC()), maxHp:effMaxHp() };
    };
    const median = arr=>{ const s = arr.slice().sort((a, b)=>a.s - b.s); return s[Math.floor(s.length/2)].it; }, best = arr=>arr.reduce((t, x)=>x.s > t.s ? x : t).it;
    for (const L of [20, 40, 60, 80, 99]){
      const top = RS_METALS.reduce((t, m, i)=>m[1] <= L ? i : t, 0), make = sl=>sl==='weapon' ? rsMakeWeapon(top, 3) : rsMakeArmour('metal', top, sl);
      const plain = {}; for (const sl of ['weapon'].concat(SLOTS)) plain[sl] = make(sl);
      const dress = (q, pickF, anc)=>{ const g = {}; for (const sl of ['weapon'].concat(SLOTS)){ const rolls = []; for (let i=0;i<30;i++){ const it = make(sl); if (anc) it.anc = 1; afDress(it, L, q); rolls.push({ it, s:itemScoreFor(it, 'melee') + (sl==='weapon' ? itemScore(it) : 0) }); } g[sl] = pickF(rolls); } return g; };
      const rows = [['plain', plain], ['magic (middling)', dress(1, median)], ['rare (middling)', dress(2, median)], ['rare (best of 30)', dress(2, best)]].concat(L >= 90 ? [['ancestral rare (middling)', dress(2, median, 1)], ['ancestral rare (best of 30)', dress(2, best, 1)]] : []);   /* (RS-709) */
      for (const [kind, g] of rows){ const o = fight(L, g, 80); o.kind = kind; o.gear = Object.values(g).map(it=>it.nm + (it.aff.length ? ' [' + it.aff.map((a, j)=>modAbbr(it, j)).join(', ') + ']' : '')).slice(0, 2).join('; '); out.push(o); console.log('SIM '+JSON.stringify(o)); }
    }
    return out;
  });
};
