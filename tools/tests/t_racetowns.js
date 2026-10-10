// RS-223: a town for every race. A world deals its town races from a shuffled deck, so all ten appear (RS-242: wood elves too); the new ones
// (halfling, gnome, dragonborn, tiefling, half-elf) have their own names, buildings, townsfolk at their race's height,
// and a landmark you use once a day: burrow kitchens, tinkers' workshop, great brazier, ember altar, minstrels' stage.
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    const all = townList().concat(G.ow.spawnPos ? [G.ow.spawnPos] : []);
    const towns = all.map(t=>({ x:t.x, y:t.y, race:(townFlavorAt(t.x, t.y)||{}).race, name:townName(t.x, t.y), k:townInfo(t.x, t.y).ident.k }));
    const out = { towns, races:[...new Set(towns.map(t=>t.race))], n:all.length, fx:{} };
    const p = G.player;
    for (const [race, k] of [['halfling','pantry'],['gnome','workshop'],['dragon','brazier'],['tiefling','altar'],['halfelf','stage'],['woodelf','fletchery']]){
      const t = towns.find(q=>q.race===race); if (!t){ out.fx[race] = 'no town'; continue; }
      G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
      const r = { k:townInfo().ident.k, vr:G.villageRace, folk:v3VillagerLook(0).stature, guard:townFolkLook({ guard:true }, 1).o };
      const fl0 = p.skills.fletching||0, inv0 = G.inv.length, bag0 = JSON.stringify(p.bag), ac0 = p.buffACTurns||0, xp0 = p.skills.mining||0;
      p.turnCount = (p.turnCount||0) + DAY_LENGTH*3;   /* a fresh day */
      townFixture(k); r.bagChanged = JSON.stringify(p.bag)!==bag0; r.ac = p.buffACTurns > ac0 ? p.buffACAmt : 0;
      r.fletch = (p.skills.fletching||0) - fl0; r.arrows = G.inv.length > inv0 || JSON.stringify(p.bag)!==bag0;
      const before = JSON.stringify(p.bag), fl1 = p.skills.fletching||0; townFixture(k); r.again = JSON.stringify(p.bag)!==before; r.fletchAgain = (p.skills.fletching||0) - fl1;
      if (k==='stage'){ const a = p.skills.mining||0; skGainXP('mining', 1000); r.songGain = (p.skills.mining||0) - a; r.buff = buffList().some(x=>/song/.test(x.nm)); p.songT = -99999; const b = p.skills.mining||0; skGainXP('mining', 1000); r.plainGain = (p.skills.mining||0) - b; }
      out.fx[race] = r;
    }
    return out; });
  A(R.n >= 9, 'nine or more towns on a medium world: '+R.n);
  A(R.races.length===10, 'every race has a town: '+R.races.join(','));
  const F = R.fx;
  for (const [race, k] of [['halfling','pantry'],['gnome','workshop'],['dragon','brazier'],['tiefling','altar'],['halfelf','stage'],['woodelf','fletchery']]) A(F[race] && F[race].k===k && F[race].vr===race, race+' town has its '+k+': '+JSON.stringify(F[race]));
  A(F.halfling.bagChanged && !F.halfling.again, 'the burrow kitchens fill your bag once a day');
  A(F.gnome.bagChanged && !F.gnome.again, 'the tinkers give gems once a day');
  A(F.woodelf.fletch > 0 && F.woodelf.arrows && !F.woodelf.fletchAgain, 'the wardens\' fletchery gives arrows and Fletching xp once a day (RS-242): '+JSON.stringify(F.woodelf));
  A(F.tiefling.bagChanged && !F.tiefling.again, 'the ember altar gives runes once a day');
  A(F.dragon.ac===3, 'the brazier hardens your hide');
  A(F.halfelf.songGain > F.halfelf.plainGain && F.halfelf.buff, 'the minstrels\' song speeds xp: '+JSON.stringify(F.halfelf));
  A(F.halfling.folk < 0.75 && F.gnome.folk < 0.7 && F.dragon.folk > 1, 'townsfolk stand at their race\'s height');
  // RS-225: you start in a town of your own race
  const st = await ev(()=>['Dwarf','Halfling','Dragonborn','Half-Elf','Half-Orc','Tiefling','Wood Elf','High Elf'].map(nm=>{
    goToCharCreate(); G.chosenRace = RACES.findIndex(r=>r[0]===nm); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const sp = G.ow.spawnPos, f = townFlavorAt(sp.x, sp.y) || G.ow.townFlavor[0] || {}; return [nm, lookRaceKey(nm), f.race, new Set(Object.values(G.ow.townFlavor).map(t=>t.race)).size]; }));
  A(st.every(([, want, got, n])=>want===got && n===10), 'each race starts in its own town, and every race still has one: '+JSON.stringify(st));
  // RS-234: and that town stands on its race's home ground - a halfling shire in the grassland, never the desert
  const home = await ev(()=>{ const out = []; for (const [nm, ok] of [['Halfling', [OW_GRASS]], ['Halfling', [OW_GRASS]], ['Halfling', [OW_GRASS]], ['Wood Elf', [OW_FOREST]], ['High Elf', [OW_FOREST]]]){
    goToCharCreate(); G.chosenRace = RACES.findIndex(r=>r[0]===nm); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const sp = G.ow.spawnPos, t = G.ow.spawnBiome; out.push([nm, t, ok.includes(t)]); } return out; });
  A(home.every(h=>h[2]), 'each start town on its race\'s home ground: '+JSON.stringify(home));
  A(F.dragon.guard.head==='drake' && F.dragon.guard.tail==='dragon' && F.tiefling.guard.tail==='spade', 'dragonborn and tiefling guards look the part');
};
