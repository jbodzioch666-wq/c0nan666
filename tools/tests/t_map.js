module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); setUi('playing');
    // geography
    const t0 = performance.now(); const geo = owGeo(); out.geoMs = Math.round(performance.now()-t0);
    A(geo.places.length > 3, 'places '+geo.places.length);
    const names = geo.places.map(p=>p.name); A(new Set(names).size===names.length, 'unique names');
    out.places = geo.places.map(p=>p.kind+':'+p.name+' ('+p.n+')');
    out.landmarks = geo.landmarks.map(l=>l.name+' @'+l.x+','+l.y);
    A(geo.landmarks.length >= 1, 'landmarks');
    A(owGeo()===geo, 'geo cached');
    for (const lm of geo.landmarks){ if (lm.kind==='tower') A(G.ow.map[lm.x][lm.y]===OW_GRASS, 'tower on grass'); if (lm.kind==='volcano') A(G.ow.map[lm.x][lm.y]===OW_MOUNTAIN || G.ow.map[lm.x][lm.y]===OW_MOUNTAINPASS, 'volcano on mountain'); }
    for (const s of names) A(/^[\x20-\x7e]+$/.test(s), 'ascii name');
    // the map opens with its tool bar
    G.gameMode = 0; G.owZoomedOut = false; toggleOwZoom();
    A(G.owZoomedOut && G.mapMode==='look', 'map open');
    const mt = document.getElementById('mapTools'); A(mt && mt.style.display==='flex', 'toolbar shown'); A(mt.innerHTML.includes('Travel log'), 'toolbar content');
    // every zoom level and every layer draws without error
    const times = {};
    for (const z of [1, 1.25, 2, 3, 5, 8]){ G.owZoomScale = z; const a = performance.now(); renderGame(); renderGame(); times[z] = Math.round((performance.now()-a)/2); }
    out.renderMs = times;
    for (const [k] of MAP_LAYERS) mapToggle(k);
    renderGame(); for (const [k] of MAP_LAYERS) mapToggle(k);
    A(mapF('sites')==='done', 'sites cycles '+mapF('sites')); mapToggle('sites'); mapToggle('sites'); A(mapF('sites')==='all', 'sites back to all');
    G.mapLayersOpen = true; mapToolsSync(true); A(mt.innerHTML.includes('Sites: all'), 'layers panel');
    // pins
    const px = G.owPos.x+3, py = G.owPos.y+2;
    pinOpen(-1, px, py, 300, 300); A(document.getElementById('pinEdit').style.display==='block', 'pin editor');
    pinPick('skull'); document.getElementById('pinNote').value = 'troll bridge'; pinSave();
    A(pinsP().length===1 && pinsP()[0].k==='skull' && pinsP()[0].note==='troll bridge', 'pin saved');
    pinOpen(0, 0, 0, 300, 300); pinPick('heart'); pinSave(); A(pinsP()[0].k==='heart', 'pin edited');
    pinOpen(-1, px+1, py, 300, 300); pinSave(); A(pinsP().length===2, 'second pin');
    pinOpen(1, 0, 0, 300, 300); pinDelete(); A(pinsP().length===1, 'pin deleted');
    renderGame();
    // a route: two stops on reachable ground
    const reach = [];
    for (let d=6; d<40 && reach.length<2; d+=3) for (const [dx,dy] of [[d,0],[0,d],[-d,0],[0,-d]]){ const x = G.owPos.x+dx, y = G.owPos.y+dy;
      if (reach.length<2 && o3Passable(x,y) && !OW_SITE_TILES.includes(G.ow.map[x][y]) && owBfs(G.owPos.x, G.owPos.y, x, y)) reach.push([x,y]); }
    A(reach.length===2, 'found route stops');
    G.mapMode = 'route'; routeAdd(reach[0][0], reach[0][1]); routeAdd(reach[1][0], reach[1][1]);
    const ri = routeInfo(); A(ri && ri.steps > 0 && ri.bad < 0, 'route planned'); out.routeSteps = ri.steps;
    renderGame(); A(mt.innerHTML.includes('Walk route'), 'walk button');
    routeUndo(); A(G.player.route.pts.length===1, 'undo'); routeAdd(reach[1][0], reach[1][1]);
    // walk it on the flat map, step by step
    o3Pref = false;
    const start = { x:G.owPos.x, y:G.owPos.y }, steps0 = travelP().steps;
    routeGo(); A(!G.owZoomedOut && G.routeWalk && G.routeWalk.steps.length===ri.steps, 'walking');
    let guard = 0; while (G.routeWalk && guard++ < 2000){ G.routeWalk.next = 0; routeWalkTick(performance.now()); frameLoop.op !== (G.owPos.x+','+G.owPos.y+'|'+G.ow.seed) && (()=>{ const prev = frameLoop.op; frameLoop.op = G.owPos.x+','+G.owPos.y+'|'+G.ow.seed; travelTick(prev); })(); if (G.gameMode!==0) break; }
    out.walked = { from:start, to:{ x:G.owPos.x, y:G.owPos.y }, mode:G.gameMode, steps:travelP().steps-steps0, left:G.player.route && G.player.route.pts.length };
    A(G.owPos.x!==start.x || G.owPos.y!==start.y, 'moved');
    if (G.gameMode===0 && G.owPos.x===reach[1][0] && G.owPos.y===reach[1][1]) A(!G.player.route, 'route done');
    G.gameMode = 0; G.ui = 'playing';
    A(owWalkArr()[G.owPos.y*OW_COLS+G.owPos.x]===1, 'walked painted');
    // landmarks: sight and visit each
    for (const lm of geo.landmarks){
      let best = null; for (let i=-6;i<=6;i++) for (let j=-6;j<=6;j++){ const x = lm.x+i, y = lm.y+j; if (o3Passable(x,y) && Math.max(Math.abs(i),Math.abs(j)) <= lm.r && (!best || i*i+j*j < best[2])) best = [x,y,i*i+j*j]; }
      if (!best) continue;
      G.owPos = { x:best[0], y:best[1] }; travelTick(null);
      A(travelP().lmSeen.includes(lm.id) && travelP().lmVisit.includes(lm.id), 'visited '+lm.id);
    }
    out.lm = { seen:travelP().lmSeen, visit:travelP().lmVisit };
    out.regions = travelP().regions;
    // the travel log
    setUi('travellog'); const ov = document.getElementById('overlay').innerHTML; A(ov.includes('TRAVEL LOG') && ov.includes('LANDMARKS'), 'travel log'); setUi('playing');
    // exploration honours
    owSeenArr().fill(1); G.ow.seenVer++; checkAchievements();
    A(['explorer_25','explorer_50','explorer_90'].every(a=>G.player.achievements.includes(a)), 'explorer honours');
    if (geo.landmarks.length && geo.landmarks.every(l=>travelP().lmVisit.includes(l.id))) A(G.player.achievements.includes('sightseer'), 'sightseer');
    out.stats = travelStats();
    // save and load keeps the painted land, pins and travel
    const walkedN = owWalkArr().reduce((a,b)=>a+b,0);
    G.owZoomedOut = false; saveCurrentGame();
    const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing');
    A(owWalkArr().reduce((a,b)=>a+b,0)===walkedN, 'walked survives load');
    A(pinsP().length===1 && pinsP()[0].note==='troll bridge', 'pins survive');
    A(travelP().lmVisit.length===out.lm.visit.length, 'travel survives');
    // the map again after load, close in, with a pin open
    G.owZoomedOut = false; toggleOwZoom(); G.owZoomScale = 8; renderGame(); toggleOwZoom(); A(!G.owZoomedOut, 'closed');
    renderGame(); A(document.getElementById('mapTools').style.display==='none', 'toolbar hidden');
    return out;
  });
  console.log(JSON.stringify(r, null, 1).slice(0, 4000));
  // 3D: the landmarks stand in the land
  const r3 = await page.evaluate(async ()=>{
    o3Pref = true; G.owZoomedOut = false; G.gameMode = 0; G.ui = 'playing';
    const lm = owGeo().landmarks.find(l=>l.kind==='tower') || owGeo().landmarks[0]; G.player.clock = G.player.turnCount = 120; if (lm){ let best = null; for (let i=-12;i<=12;i++) for (let j=-12;j<=12;j++){ const x = lm.x+i, y = lm.y+j; if (o3Passable(x,y) && !OW_SITE_TILES.includes(G.ow.map[x][y]) && j >= 7 && (!best || i*i+j*j < best[2])) best = [x,y,i*i+j*j]; } if (best) G.owPos = { x:best[0], y:best[1] }; }
    for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    return { active:o3Active(), objs:(O3.lmObjs||[]).length, hits:(O3.lmHits||[]).length, edges:Object.keys(O3.lmEdge||{}).length, vis:(O3.lmObjs||[]).map(o=>o.g.visible) };
  });
  console.log('3D', JSON.stringify(r3));
  if (r3.active && !r3.objs) throw new Error('no 3D landmarks');
  await page.screenshot({ path: SHOTS+'/shot_lm3d.png', timeout:120000 });
  // screenshots of the chart at three zooms
  for (const z of [1.25, 3, 8]){
    await page.evaluate((z)=>{ o3Pref = false; G.owZoomedOut = false; toggleOwZoom(); G.owZoomScale = z; G.mapLayersOpen = false; renderGame(); }, z);
    await page.waitForTimeout(400);
    await page.screenshot({ path: SHOTS+'/shot_map_'+z+'.png', timeout:120000 });
  }
  // the pin editor and the route mode, by mouse
  await page.evaluate(()=>{ G.wevDlg = null; G.wevPending = null; setUi('playing'); G.gameMode = 0; G.owZoomedOut = true; G.owZoomScale = 3; G.mapMode = 'pin'; renderGame(); });
  await page.mouse.click(700, 520); await page.waitForTimeout(200);
  const pe = await page.evaluate(()=>({ open:!!G.pinEdit, disp:document.getElementById('pinEdit').style.display }));
  console.log('pin by mouse', JSON.stringify(pe)); if (!pe.open) throw new Error('pin editor by click');
  await page.keyboard.type('camp spot'); await page.keyboard.press('Enter');
  const pn = await page.evaluate(()=>pinsP().map(p=>p.note)); console.log('pins', JSON.stringify(pn)); if (!pn.includes('camp spot')) throw new Error('pin by keyboard');
  await page.evaluate(()=>{ G.mapMode = 'route'; renderGame(); });
  await page.mouse.click(760, 560); await page.mouse.click(820, 600); await page.waitForTimeout(200);
  await page.mouse.move(705, 500); await page.waitForTimeout(200);
  await page.screenshot({ path: SHOTS+'/shot_map_tools.png', timeout:120000 });
};
