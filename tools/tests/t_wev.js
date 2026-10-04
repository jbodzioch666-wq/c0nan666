module.exports = async page=>{
  const frame = ()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  // setup, ticking
  const r1 = await page.evaluate(()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); setUi('playing'); o3Pref = false;
    G.player.level = 12; G.player.gold = 50000;
    const e = wevP(); A(e && e.camps.length >= 3, 'initial camps '+(e && e.camps.length));
    out.camps0 = e.camps.map(c=>c.kind+'@'+c.x+','+c.y+' s'+c.size+' in '+wevTerrName(wevTerrAt(c.x,c.y)));
    // run the clock for three days
    const t0 = G.player.turnCount||0; const seen = { boss:0, siege:0, meteor:0, festival:0, market:0, raid:0, grew:0 };
    for (let t=0; t<DAY_LENGTH*6; t++){ G.player.clock = G.player.turnCount = t0 + t; wevTick();
      if (e.boss && e.boss.state==='awake') seen.boss++;
      for (const d of e.dyn) seen[d.kind] = (seen[d.kind]||0) + 1;
      for (const k in e.town) seen[e.town[k].kind]++;
      if (e.camps.some(c=>c.size>=4)) seen.grew++; }
    out.seen = seen; out.campsAfter = e.camps.length; out.dyn = e.dyn.map(d=>d.kind);
    A(seen.boss > 0, 'boss woke'); A(seen.festival + seen.market + seen.raid > 0, 'town events'); A(seen.siege + seen.meteor > 0, 'dynamic events');
    return out;
  });
  console.log(JSON.stringify(r1));
  // a camp fight, won
  const r2 = await page.evaluate(()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    const e = wevP(); let c = e.camps[0]; if (!c) c = wevNewCamp(true);
    c.size = 4; const n0 = e.camps.length;
    G.gameMode = 0; G.ui = 'playing'; G.owPos = { x:c.x, y:c.y }; A(wevStep(), 'camp fight starts');
    A(G.gameMode===2 && G.wevFight && G.wevFight.kind==='camp', 'in camp arena'); A(G.mon.length===5, 'pack size '+G.mon.length);
    const names = G.mon.map(m=>m.nm); G.mon.forEach(m=>{ m.alive = 0; m.hp = 0; });
    window.__n0 = n0; window.__cid = c.id; return names;
  });
  console.log('camp pack', JSON.stringify(r2));
  await frame(); await frame();
  const r3 = await page.evaluate(()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    const e = wevP(); A(!e.camps.some(c=>c.id===window.__cid), 'camp removed'); A(G.gameMode===0, 'back on the overworld '+G.gameMode); A(wevStats().camps===1, 'camp count');
    // clear a whole territory: secured
    const ti = wevTerrAt(e.camps.length ? e.camps[0].x : G.owPos.x, e.camps.length ? e.camps[0].y : G.owPos.y);
    const inT = e.camps.filter(c=>wevTerrAt(c.x,c.y)===ti);
    for (const c of inT){ G.owPos = { x:c.x, y:c.y }; wevCampFight(c); G.wevFight = { kind:'camp', id:c.id }; G.mon.forEach(m=>m.alive=0); wevArenaWon(); G.gameMode = 0; }
    A(wevTerrState(ti)==='secured', 'secured '+wevTerrState(ti)); A(wevSecuredAt(G.owPos.x, G.owPos.y) || inT.length===0, 'secured at');
    // the giant: fight, flee, come back wounded, finish it
    e.boss = { g:0, state:'awake', x:G.owPos.x, y:G.owPos.y, hx:G.owPos.x, hy:G.owPos.y, until:wevTurn()+300, hp:null };
    A(wevStep(), 'boss fight starts'); const m = G.mon.find(m=>m.worldBoss); A(m && m.namedElite, 'boss monster');
    m.hp = Math.round(m.maxHp/2); wevFrame(); A(e.boss.hp===m.hp, 'boss hp synced');
    const half = m.hp, mh = m.maxHp; G.gameMode = 0; wevFrame(); A(!G.wevFight, 'fled');
    wevStep(); const m2 = G.mon.find(m=>m.worldBoss); A(m2.hp===half && m2.maxHp===mh, 'boss remembers wounds '+m2.hp+'/'+m2.maxHp);
    G.mon.forEach(m=>m.alive=0); wevArenaWon(); G.gameMode = 0;
    A(e.boss.state==='sleep' && wevStats().boss===1, 'boss slain'); checkAchievements(); A(G.player.achievements.includes('giant_slayer'), 'giant slayer');
    // a meteor
    A(wevMeteor(), 'meteor fell'); const d = e.dyn[e.dyn.length-1]; const nd = skNodeAt(d.x, d.y); A(nd && nd.type==='meteor' && nd.rich, 'meteor ore node');
    return { boss:m2.nm, mh, meteor:skNodeName(nd), req:skNodeReq(nd) };
  });
  console.log(JSON.stringify(r3));
  // a siege, broken
  const r4 = await page.evaluate(()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    const e = wevP(), [tx,ty] = wevTowns()[1] || wevTowns()[0], key = tx+','+ty;
    e.dyn = e.dyn.filter(d=>d.kind!=='siege'); e.dyn.push({ id:e.seq++, kind:'siege', key, x:tx, y:ty, camp:'orc', until:wevTurn()+200 });
    let from = null; for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if (o3Passable(tx-dx, ty-dy) && !OW_SITE_TILES.includes(G.ow.map[tx-dx][ty-dy])){ from = [tx-dx, ty-dy, dx, dy]; break; }
    A(from, 'approach'); G.gameMode = 0; G.ui = 'playing'; G.owPos = { x:from[0], y:from[1] };
    window.__rep0 = repAt(key); window.__key = key;
    tryMoveOverworld(from[2], from[3]);
    A(G.ui==='wevent' && G.wevDlg && /siege/i.test(G.wevDlg.title), 'siege prompt '+G.ui);
    wevChoose(0); A(G.gameMode===2 && G.wevFight.kind==='siege', 'siege fight');
    G.mon.forEach(m=>{ m.alive = 0; });
    return true;
  });
  await frame(); await frame();
  const r5 = await page.evaluate(()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    const e = wevP();
    A(!e.dyn.some(d=>d.kind==='siege' && d.key===window.__key), 'siege lifted'); A(G.gameMode===3, 'walked into town '+G.gameMode); A(repAt(window.__key) >= window.__rep0+3, 'rep up');
    // festival prices, market trader
    const key = window.__key; e.town[key] = { kind:'festival', name:'Harvest Festival', id:e.seq++, until:wevTurn()+100 };
    const disc = repTier(repAt(key)).disc; A(repPrice(1000)===Math.max(1, roundH(1000*disc*0.9)), 'festival price '+repPrice(1000));
    e.town[key] = { kind:'market', id:e.seq++, until:wevTurn()+100 };
    enterVillage(); const tr = G.villageNpcs.find(n=>n.service==='rareTrader'); A(tr, 'trader on the plaza');
    villageInteract(tr.x, tr.y); A(G.ui==='rareTrader', 'trader ui'); const ov = document.getElementById('overlay').innerHTML; A(ov.includes('Lamp of Knowledge'), 'stock');
    const g0 = G.player.gold; wevBuy(0); A(G.player.gold===g0-1500 && e.town[key].stock[0].sold, 'bought'); wevBuy(4); setUi('playing');
    // a raid
    e.town[key] = { kind:'raid', id:e.seq++, until:wevTurn()+100 };
    enterVillage(); return true;
  });
  // (the raid warning opens on the next frame; a frame of the 3D town can take a while in software rendering)
  for (let i=0; i<60 && !(await page.evaluate(()=>G.ui==='wevent')); i++) await page.waitForTimeout(250);
  const r6 = await page.evaluate(()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    A(G.ui==='wevent' && /Raid/.test(G.wevDlg.title), 'raid prompt'); wevChoose(0); A(G.gameMode===2 && G.wevFight.kind==='raid', 'raid fight');
    G.mon.forEach(m=>{ m.alive = 0; }); return true;
  });
  await frame(); await frame();
  const r7 = await page.evaluate(()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    A(G.gameMode===3 && wevStats().defended===2, 'raid repelled '+G.gameMode+' '+wevStats().defended);
    checkAchievements(); A(G.player.achievements.includes('defender'), 'defender');
    // every road event, every choice
    G.gameMode = 0; setUi('playing'); G.owPos = { x:G.ow.spawnPos.x+2, y:G.ow.spawnPos.y+2 };
    const log = [];
    for (const k of Object.keys(WEV_ROAD)){
      WEV_ROAD[k](); A(G.ui==='wevent' && G.wevDlg, 'road '+k); const n = G.wevDlg.opts.length;
      for (let i=0;i<n;i++){ if (i) { G.gameMode = 0; setUi('playing'); WEV_ROAD[k](); }
        const d = G.wevDlg; if (!d) throw new Error('no dialog for '+k+' option '+i+' ui '+G.ui+' mode '+G.gameMode); if (!d.opts[i]){ G.wevDlg = null; setUi('playing'); continue; } log.push(k+':'+d.opts[i][0]); wevChoose(i);
        if (G.gameMode===2){ G.mon.forEach(m=>m.alive=0); wevArenaWon(); G.gameMode = 0; }
        if (G.gameMode===3) { G.gameMode = 0; }
        setUi('playing'); }
    }
    A(G.player.roadTask && G.player.roadTask.kind==='child', 'child following');
    const rt = G.player.roadTask, [cx,cy] = rt.key.split(',').map(Number); G.owPos = { x:cx, y:cy }; const road0 = wevStats().road; enterVillage();
    A(!G.player.roadTask && wevStats().road===road0+1, 'child home');
    G.gameMode = 0; setUi('playing');
    // the map draws every event, at every zoom, with the danger wash
    G.owZoomedOut = false; toggleOwZoom(); G.player.mapFilters = { danger:1 };
    owSeenArr().fill(1); G.ow.seenVer++;
    const e0 = wevP(); e0.boss = { g:2, state:'awake', x:G.owPos.x+3, y:G.owPos.y+2, hx:G.owPos.x, hy:G.owPos.y, until:wevTurn()+200, hp:null };
    const [tx,ty] = wevTowns()[0]; e0.town[tx+','+ty] = { kind:'festival', name:'Feast of Lanterns', id:e0.seq++, until:wevTurn()+90 };
    for (const z of [1, 2, 4, 8]){ G.owZoomScale = z; renderGame(); }
    setUi('travellog'); const ov = document.getElementById('overlay').innerHTML; A(ov.includes('WORLD EVENTS'), 'travel log section'); setUi('playing');
    // save and load
    const nCamps = e0.camps.length, nDyn = e0.dyn.length; G.owZoomedOut = false; saveCurrentGame();
    const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing');
    const e1 = G.ow.ev; A(e1 && e1.camps.length===nCamps && e1.dyn.length===nDyn && e1.boss.state==='awake', 'events survive load');
    for (const d of e1.dyn) if (d.kind==='meteor') A(richAt(d.x, d.y), 'meteor ore back after load');
    return { log, stats:wevStats() };
  });
  console.log(JSON.stringify(r7));
  // screenshots: the map with events, the 3D land near a camp, a festival town
  await page.evaluate(()=>{ G.player.mapFilters = { danger:1 }; G.owZoomedOut = false; toggleOwZoom(); G.owZoomScale = 1.6; G.owZoomCenter = { x:G.owPos.x, y:G.owPos.y }; renderGame(); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: SHOTS+'/shot_wev_map.png', timeout:120000 });
  const r8 = await page.evaluate(async ()=>{
    o3Pref = true; G.owZoomedOut = false; G.gameMode = 0; G.ui = 'playing'; G.player.clock = G.player.turnCount = 100;
    const e = wevP(), c = e.camps[0] || wevNewCamp(true); c.size = 5;
    e.boss = { g:0, state:'awake', x:c.x+3, y:c.y-1, hx:c.x, hy:c.y, until:wevTurn()+200, hp:null };
    let best = null; for (let i=-6;i<=6;i++) for (let j=2;j<=6;j++){ const x = c.x+i, y = c.y+j; if (o3Passable(x,y) && !OW_SITE_TILES.includes(G.ow.map[x][y]) && (!best || Math.abs(i)+j < best[2])) best = [x,y,Math.abs(i)+j]; }
    if (best) G.owPos = { x:best[0], y:best[1] };
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    return { active:o3Active(), hits:(O3.evHits||[]).length };
  });
  console.log('3D', JSON.stringify(r8));
  await page.screenshot({ path: SHOTS+'/shot_wev_3d.png', timeout:120000 });
  await page.evaluate(async ()=>{
    const e = wevP(), [tx,ty] = wevTowns()[0]; e.town[tx+','+ty] = { kind:'festival', name:'Midsummer Fair', id:e.seq++, until:wevTurn()+150 };
    G.owPos = { x:tx, y:ty }; enterVillage(); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
  });
  await page.screenshot({ path: SHOTS+'/shot_wev_fest.png', timeout:120000 });
};
