// RS-187: take an adventurer to a newly made world from the load screen. The character comes along (skills, gear, pack,
// bank, gold, achievements) into a new save, what was left in a grave goes to the bank, everything tied to the old map
// starts afresh, and the old world's save is left exactly as it was. Backing out of the preview saves nothing.
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    o3Pref = false; v3Pref = false;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const p = G.player, out = {};
    skGainXP('mining', 50000); skGainXP('attack', 30000); p.gold = 12345;
    const bankIt = newItem(); Object.assign(bankIt, { used:1, nm:'Old Keepsake' }); bankP().stash.push(bankIt);
    const graveIt = newItem(); Object.assign(graveIt, { used:1, nm:'Grave Trinket' }); gravesP().push({ id:'g1', x:1, y:1, items:[graveIt], gold:40, place:'somewhere' });
    p.rep = { '5,5':12 }; p.mapPins = [{ x:3, y:3, k:'star' }]; p.quests = [{ id:'q1', kind:'kill' }]; p.siteDeepest = { 3:4 };
    if (!p.achievements.includes('ascended')) p.achievements.push('ascended');
    const before = { mining:skP().skills.mining, attack:skP().skills.attack, gear:Object.keys(G.gear).filter(k=>G.gear[k] && G.gear[k].used).length, inv:G.inv.length, seed:G.ow.seed, house:!!p.house };
    saveCurrentGame();
    const oldId = G.saveId, oldRaw = localStorage.getItem(SAVE_PREFIX+oldId), n0 = saveIndexList().length;
    // the load screen offers it
    setUi('titleScreen'); out.button = !!document.querySelector(`[onclick*="titleNewWorld('${oldId}')"]`);
    // back out of the preview: nothing saved
    titleNewWorld(oldId); out.ui1 = G.ui; out.back = !!document.querySelector(`[onclick*="setUi('titleScreen')"]`);
    G.newWorldFrom = false; setUi('titleScreen'); out.afterBack = { n:saveIndexList().length===n0, old:localStorage.getItem(SAVE_PREFIX+oldId)===oldRaw };
    // now really go
    titleNewWorld(oldId); out.newId = G.saveId!==oldId; out.newSeed = G.ow.seed!==before.seed;
    confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    const q = G.player;
    out.after = { mining:skP().skills.mining===before.mining, attack:skP().skills.attack===before.attack, gold:q.gold===12345,
      gear:Object.keys(G.gear).filter(k=>G.gear[k] && G.gear[k].used).length===before.gear, inv:G.inv.length===before.inv,
      bankKeep:bankP().stash.some(i=>i.nm==='Old Keepsake'), bankGrave:bankP().stash.some(i=>i.nm==='Grave Trinket'), bankGold:bankP().bankGold>=40, graves:gravesP().length,
      rep:Object.keys(q.rep||{}).length, pins:(q.mapPins||[]).length, quests:(q.quests||[]).length, deepest:Object.keys(q.siteDeepest||{}).length,
      towns:G.ow.visitedTowns.length, world:q.worldNo, ach:(q.achievements||[]).includes('ascended'), mode:G.gameMode };
    const idx = saveIndexList();
    out.saves = { n:idx.length===n0+1, oldKept:localStorage.getItem(SAVE_PREFIX+oldId)===oldRaw, newEntry:(idx.find(e=>e.id===G.saveId)||{}).world };
    // the new save loads back in the new world
    const newSeed = G.ow.seed, newId = G.saveId; loadGame(oldId); out.oldSeed = G.ow.seed===before.seed; loadGame(newId); out.reload = G.ow.seed===newSeed && G.player.worldNo===2;
    setUi('titleScreen'); out.card = /world 2/.test(document.body.textContent);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.button, 'each character card has a New world button');
  A(r.ui1==='worldPreview' && r.back && r.afterBack.n && r.afterBack.old, 'the world preview opens, and backing out saves nothing');
  A(r.newId && r.newSeed, 'a new save in a new world');
  const a = r.after;
  A(a.mining && a.attack && a.gold && a.gear && a.inv && a.bankKeep && a.ach, 'skills, gold, gear, pack, bank and achievements come along');
  A(a.bankGrave && a.bankGold && a.graves===0, 'what lay in a grave goes to the bank');
  A(a.rep===0 && a.pins===0 && a.quests===0 && a.deepest===0 && a.towns===1 && a.world===2 && a.mode===3, 'the old map\'s standing, pins, quests and progress start afresh, in a town of the new world');
  A(r.saves.n && r.saves.oldKept && r.saves.newEntry===2, 'the old save is untouched and the new one is listed as world 2');
  A(r.oldSeed && r.reload && r.card, 'both saves load into their own worlds');
};
