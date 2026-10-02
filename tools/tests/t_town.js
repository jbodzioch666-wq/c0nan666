module.exports = async page=>{
  const t0 = Date.now(); page.on('console', m=>{ if (m.text().startsWith('DBG')) console.log(m.text(), Math.round((Date.now()-t0)/1000)+'s'); });
  const r1 = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); setUi('playing');
    const p = G.player; p.gold = 1e6; p.wildWarned = 1; p.turnCount = 60;   // midday
    const towns = townList(); out.towns = towns.map(t=>{ const i = townInfo(t.x, t.y); return `${i.name}: ${i.tierNm}${i.port ? ' port' : ''} - ${i.ident.nm}`; });
    const go = t=>{ G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing'); };
    // every town lays out and draws
    for (const t of towns){ go(t); A(G.gameMode===3 && COLS===G.townLy.cols, 'cols'); renderGame(); }
    const byTier = k=>towns.find(t=>townInfo(t.x, t.y).tier===k);
    // a city
    const city = byTier(2); A(city, 'a city'); go(city);
    out.city = { cols:COLS, blds:VILLAGE_BUILDINGS.map(b=>b.key), npcs:G.villageNpcs.map(n=>n.service), folk:G.villagers.length, guards:G.villagers.filter(v=>v.guard).length, pets:G.villagers.filter(v=>v.animal).map(v=>v.animal) };
    A(VILLAGE_BUILDINGS.some(b=>b.key==='guild') && VILLAGE_BUILDINGS.some(b=>b.key==='temple'), 'city buildings');
    A(['arena','range','mayor'].every(s=>G.villageNpcs.some(n=>n.service===s)), 'city npcs');
    A(G.villagers.filter(v=>v.guard).length >= 3, 'the watch');
    // the temple
    const tb = VILLAGE_BUILDINGS.find(b=>b.key==='temple'); G.player.x = tb.door.x; G.player.y = tb.door.y + 1; moveDir(0, -1);
    A(G.interior && G.interior.key==='temple', 'into the temple by its door');
    setUi('temple'); if (G.ui==='wevent') wevChoose(1); A(document.getElementById('overlay').innerHTML.includes('THE CRUSADE'), 'temple screen');
    p.prayPts = 0; townTemplePray(); A(p.prayPts===rsLvl('prayer'), 'prayed');
    townCrusadeTake(); const c = p.crusade; A(c && c.need > 0, 'crusade');
    for (let i=0;i<c.need;i++) townOnKill({ undead:true }); A(c.got===c.need, 'undead counted');
    const g0 = p.gold; townCrusadeDone(); A(!p.crusade && p.gold > g0 && p.crusades===1, 'crusade done');
    setUi('playing'); for (const k of ['pew','books','shrine']){ A(townBench(k), 'temple '+k); setUi('playing'); }
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); }
    exitInterior();
    // the guild hall
    enterInterior('guild'); A(G.interior && G.interior.key==='guild', 'guild hall');
    setUi('guild'); A(document.getElementById('overlay').innerHTML.includes("Warriors' Guild"), 'guild screen'); setUi('playing');
    townGuild('warriors'); A(G.ui==='wevent', 'guild dialog'); wevChoose(0);
    skP().skills.attack = SK_XP[40]; skP().skills.strength = SK_XP[40]; rsSync(); const ax = skP().skills.attack;
    townGuild('warriors'); wevChoose(0); A(skP().skills.attack > ax, 'sparred');
    townGuild('warriors'); wevChoose(0); const ax2 = skP().skills.attack; A(ax2===skP().skills.attack, 'once a day');
    skP().skills.cooking = SK_XP[40]; townGuild('cooks'); wevChoose(0); A(G.ui==='cook' && G.cookAt==='guild', 'guild range'); setUi('playing');
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); }
    exitInterior();
    // the arena
    setUi('arena'); A(document.getElementById('overlay').innerHTML.includes('THE ARENA'), 'arena screen');
    arenaFight(); A(G.gameMode===2 && G.mon.length >= 1 && G.wevFight.kind==='townarena', 'arena fight');
    for (const m of G.mon){ m.alive = 0; m.hp = 0; } A(wevArenaWon(), 'arena won'); A(G.gameMode===3 && G.ui==='wevent', 'back in town with a dialog');
    out.arena = G.wevDlg.title; wevChoose(1); A(!G.arenaRun && arenaRec().best===1, 'arena record');
    // games and gambling
    G.gamesAt = 'range'; setUi('games'); mgArchery(); A(mgRec().archery > 0, 'archery'); out.archery = G.mgLast;
    G.gamesAt = 'tavern'; mgDarts(); out.darts = G.mgLast; skAdd('c_shrimp', 2); mgCook(); out.cook = G.mgLast; A(mgRec().cook > 0, 'cook-off');
    skP().tools.rod = 1; G.gamesAt = 'harbour'; mgFish(); out.fish = G.mgLast; renderOverlay();
    setUi('gamble'); const gg = p.gold; G.gbBet = 100; gbDice(); gbDraw(); A(G.gbCard, 'card drawn'); renderOverlay(); gbHiLo(1); gbWheel(); A(p.gold!==gg || gbRec().lost + gbRec().won > 0, 'gambled'); out.gamble = gbRec();
    setUi('playing');
    // the news on the board
    tkOpen('board', 'news'); const ov = document.getElementById('overlay').innerHTML; A(ov.includes('RUMOURS') && ov.includes('NEWS FROM ACROSS THE LAND'), 'news tab'); setUi('playing');
    // townsfolk: gossip, routines, the night
    const v = G.villagers.find(v=>!v.guard && !v.animal); A(v, 'a townsperson');
    G.player.x = TOWN_CX; G.player.y = 16; v.x = TOWN_CX; v.y = 15; v.indoors = false; moveDir(0, -1); A(G.ui==='wevent', 'gossip'); out.gossip = G.wevDlg.text.replace(/<[^>]+>/g, '').slice(0, 200); wevChoose(0);
    p.turnCount = DAY_LENGTH*3 + 10; for (let i=0;i<80;i++) moveVillagers();
    out.night = { indoors:G.villagers.filter(v=>v.indoors).length, folk:G.villagers.filter(v=>!v.guard && !v.animal).length };
    A(out.night.indoors > 0, 'folk go home at night');
    // shops shut
    G.player.x = 4; G.player.y = 11; G.ui = 'playing'; enterInterior('shop'); A(G.ui==='wevent' && !G.interior, 'shop shut'); wevChoose(0); A(G.interior && G.interior.key==='shop', 'knocked');
    townBench('cellar'); A(G.interior.key==='cellar', 'cellar'); townBench('crates'); townBench('stairsup'); A(G.interior.key==='shop', 'back up');
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); }
    exitInterior(); A(!G.interior && G.gameMode===3, 'out of the shop');
    enterInterior('tavern'); out.patrons = G.villagers.length; A(G.villagers.length >= 3, 'a busy tavern at night');
    townBench('stairs'); A(G.interior.key==='tavern_up', 'upstairs'); p.hp = 1; townBench('innbed'); A(p.hp===effMaxHp(), 'a night in the inn'); townBench('stairsdown'); A(G.interior.key==='tavern', 'downstairs');
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); }
    exitInterior();
    p.turnCount = DAY_LENGTH*4 + 60;
    return out;
  });
  console.log(JSON.stringify(r1, null, 1).slice(0, 4000));
  await page.evaluate(async ()=>{ G.wevDlg = null; setUi('playing'); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  await page.screenshot({ path: SHOTS+'/shot_city.png', timeout:120000 });
  const r2 = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    const p = G.player, towns = townList(), go = t=>{ G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing'); };
    // a hamlet grows into a village, then a city
    console.log('DBG r2 start');
    let h = towns.find(t=>townInfo(t.x, t.y).tier===0);
    if (h){ go(h); A(!VILLAGE_BUILDINGS.some(b=>b.key==='alch' || b.key==='tailor'), 'a hamlet has no alchemist');
      const m = G.villageNpcs.find(n=>n.service==='mayor'); A(m, 'mayor'); villageInteract(m.x, m.y); A(G.ui==='mayor', 'mayor screen');
      skAdd(SK_LOG[0].id, 500); skAdd('ironb', 200); townDonate('grow'); A(townInfo().tier===1 && VILLAGE_BUILDINGS.some(b=>b.key==='temple') && VILLAGE_BUILDINGS.some(b=>b.key==='alch'), 'grown to a village');
      townDonate('walls'); townDonate('market'); townDonate('watch'); A(townInfo().style.walled, 'walls'); checkAchievements(); A(p.achievements.includes('patron'), 'patron');
      townDonate('grow2'); A(townInfo().tier===2 && VILLAGE_BUILDINGS.some(b=>b.key==='guild'), 'grown to a city'); out.hamlet = townInfo().name; }
    // a port: the harbour
    console.log('DBG port');
    const port = towns.find(t=>townPort(t.x, t.y)) ;
    if (port){ go(port); A(G.villageNpcs.some(n=>n.service==='harbour'), 'harbour master'); setUi('harbour'); out.dests = harbourDests().map(d=>d.kind+':'+d.nm);
      for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      if (harbourDests().length){ const d = harbourDests()[0]; harbourSail(0); A(G.owPos.x===d.x && G.owPos.y===d.y, 'sailed'); } setUi('playing'); }
    out.port = port ? townInfo(port.x, port.y).name : null;
    console.log('DBG landmarks');
    // the landmarks
    for (const t of towns){ const i = townInfo(t.x, t.y); if (!i.ident.k) continue; go(t); townFixture(i.ident.k); if (G.ui==='wevent') wevChoose(0); setUi('playing'); (out.fx = out.fx||[]).push(i.ident.k); }
    console.log('DBG save');
    // save and load keeps the upgrades
    if (h){ const k = townKeyAt(h.x, h.y), ups = JSON.stringify(townRec(k).up); saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing'); A(JSON.stringify(townRec(k).up)===ups, 'upgrades survive'); }
    return out;
  });
  console.log(JSON.stringify(r2, null, 1));
  // the 2D town map of a city
  await page.evaluate(()=>{ const c = townList().find(t=>townInfo(t.x, t.y).tier===2); G.owPos = { x:c.x, y:c.y }; enterVillage(); setUi('playing'); if (v3Active()) v3Toggle(); renderGame(); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: SHOTS+'/shot_city2d.png', timeout:120000 });
  await page.evaluate(async ()=>{ if (!v3Active()) v3Toggle(); G.weather = 'rain'; G.player.x = 24; G.player.y = 8; for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  await page.screenshot({ path: SHOTS+'/shot_city_rain.png', timeout:120000 });
};
