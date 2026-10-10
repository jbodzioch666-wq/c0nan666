// RS-240: the hidden 1-20 power tier is gone - monsters, floors, the land's bands and loot all run on combat level
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    saveCurrentGame = ()=>{}; renderGame = ()=>{}; renderOverlay = ()=>{}; logMsg = ()=>{}; sfx = ()=>{}; notify = ()=>{};
    const out = {}, p = G.player;
    out.cbs = MONSTER_LEVELS.map(e=>e.cb);
    // a monster at an in-between level takes the nearer archetype and is scaled to the exact level
    const e = pickMonsterEntry(50, 0); out.e = { nm:e.nm, lvl:e.lvl, cb:e.cb };
    const m = newMonster(); m.hp = m.maxHp = 40; m.dmg2 = 6; m.xp = 100; m.atkBonus = 6; monEntryExtras(m, e); out.m = { cb:m.cb, hp:m.maxHp, shown:monCombatLevel(m) };
    const lo = newMonster(); lo.hp = lo.maxHp = 40; lo.dmg2 = 6; lo.xp = 100; lo.atkBonus = 6; monEntryExtras(lo, pickMonsterEntry(40, 0)); out.lo = { nm:lo.nm, cb:lo.cb, hp:lo.maxHp };
    // floors and bosses in combat levels
    out.floor = [floorCb(1), floorCb(5), floorCb(10)];
    // loot: a tier drops from the level it needs
    for (const k of ['skills']){} for (const k of ['attack','strength','defence']) p.skills[k] = SK_XP[40]; p.skills.hitpoints = SK_XP[40]; rsSync();
    G.gameMode = 2; out.cb = p.combatLevel; out.loot = lootLevel();
    const at = d=>{ const seen = new Set(); for (let i=0;i<400;i++) seen.add(RS_METALS[rsPickTier(RS_METALS, d)][0]); return [...seen].sort(); };
    out.at39 = at(39); out.at40 = at(40); out.at126 = at(126);
    const jew = new Set(); for (let i=0;i<200;i++){ const it = newItem(); rsFillBase(it, 10, 'necklace'); jew.add(it.nm); } out.jew10 = [...jew].sort();
    out.band = wgBandText(50);
    out.sizes = [monCombatLevel({ cb:77 }), monCombatLevel({ mlevel:8 })];
    out.pLevel = p.level;
    out.fam = MON_FAMILIES.goblin.t.map(t=>t[1]);
    out.ghoul = (()=>{ p.stunTurns = 0; p.paraGuard = 0; applyParalysisToPlayer(); return [p.stunTurns, p.paraGuard]; })();
    return out;
  });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.cbs[0]===3 && r.cbs[19]===126 && r.cbs[7]===48, 'archetype combat levels');
  A(r.e.nm==='ghoul' && r.e.cb===50 && r.m.cb===50 && r.m.shown===50 && r.m.hp > 40, 'a level-50 foe is a scaled ghoul');
  A(r.lo.cb===40 && r.lo.hp < 40, 'a level-40 foe is scaled down from its archetype');
  A(r.floor[0]===9 && r.floor[2]===126 && r.floor[1] > r.floor[0], 'floors in combat levels');
  A(r.loot===r.cb, 'loot level is the combat level outside dungeons');
  A(!r.at39.includes('Rune') && r.at40.includes('Rune') && !r.at40.includes('Dragon') && r.at126.includes('Dragon'), 'rune drops from 40, dragon from 60: '+r.at39+' / '+r.at40);
  A(r.jew10.includes('Amulet of Magic') && !r.jew10.includes('Amulet of Strength'), 'jewellery by combat level');
  A(r.band==='combat 44-56', 'band text');
  A(r.sizes[0]===77 && r.sizes[1]===48, 'monCombatLevel reads cb, falls back to the archetype');
  A(r.pLevel >= 1 && r.pLevel <= 20, 'p.level still kept for old saves');
  A(r.fam[0]===16 && r.fam[4]===68, 'families keyed by combat level');
  A(r.ghoul[0]===2 && r.ghoul[1]===8, 'paralysis grace');
  console.log('cblvl ok', JSON.stringify({ cb:r.cb, at40:r.at40, jew:r.jew10 }));
};
