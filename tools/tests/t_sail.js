module.exports = async page=>{
  const r1 = await page.evaluate(()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin();
    // an archipelago with islands to find
    let tries = 0; while ((G.ow.islands||[]).length < 3 && tries++ < 8) setContinentType('archipelago');
    confirmWorldPreview(); setUi('playing'); o3Pref = false; G.gameMode = 0;
    out.islands = G.ow.islands.map(i=>i.name+' ('+i.n+')'); A(G.ow.islands.length >= 1, 'islands');
    // island resources
    let pearl = 0, sun = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ const n = skNodeStatic(x, y); if (!n) continue; if (n.type==='pearl') pearl++; if (n.type==='sunstone') sun++; }
    out.pearlBeds = pearl; out.sunstone = sun; A(pearl + sun > 0, 'island resources');
    // boats: buy, then build up to a galleon
    const p = G.player; p.gold = 100000; p.level = 30; buyBoat(); A(boatTier()===1, 'rowboat');
    for (let t=2;t<=4;t++){ skAdd('logs', 100); skAdd('ironb', 30); sailUpgrade(); A(boatTier()===t, 'tier '+t); }
    out.boat = boatName(); A(stormRisk()===0, 'galleon storm proof');
    p._sailN = 0; const c = [sailStepCost(), sailStepCost(), sailStepCost()]; A(c.reduce((a,b)=>a+b,0)===1, 'galleon steps '+c);
    checkAchievements(); A(p.achievements.includes('admiral'), 'admiral');
    // harpoons: the big fish need one
    const deep = { k:'fishing', type:'deep', x:0, y:0 };
    A(!skNodeItems(deep).some(f=>f.id==='marlin'), 'no marlin without a harpoon');
    skP().skills = skP().skills || {}; p.harpoon = 1; A(skNodeItems(deep).some(f=>f.id==='marlin'), 'marlin with harpoon');
    // charting an island and its cache
    const isl = G.ow.islands[0]; G.owPos = { x:isl.land[0], y:isl.land[1] }; p._areaKey = null; p.wildWarned = 1; wgOnStep(null);
    if (G.ui==='wevent') wevChoose(0);
    A(islandCharted(isl.id), 'charted');
    setUi('seacharts'); A(document.getElementById('overlay').innerHTML.includes(cap(isl.name)), 'sea charts list'); setUi('playing');
    const cache = G.ow.pois.find(o=>o.k==='cache');
    if (cache){ let from = null; for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const fx = cache.x-dx, fy = cache.y-dy; if (o3Passable(fx, fy) && !OW_SITE_TILES.includes(G.ow.map[fx][fy])){ from = [fx, fy, dx, dy]; break; } }
      if (from){ G.owPos = { x:from[0], y:from[1] }; G.ow.encounters = []; tryMoveOverworld(from[2], from[3]); A(G.ui==='wevent' && /cache/i.test(G.wevDlg.title), 'cache dialog '+G.ui); const g0 = p.gold; wevChoose(0); A(wgState().done[cache.id] && p.gold > g0, 'dug up'); out.cache = 'dug'; } }
    // sailing home to an island by the sea charts
    const sp = G.ow.spawnPos; G.owPos = { x:sp.x, y:sp.y+1 }; setUi('playing');
    const far = G.ow.islands.find(i=>islandCharted(i.id)); G.player.route = null; wgWalkTo(far.land[0], far.land[1]);
    out.sailRoute = G.routeWalk ? G.routeWalk.steps.length : (O3.path||[]).length; A(out.sailRoute > 0, 'a course to the island'); G.routeWalk = null;
    // winter: the ice
    p.clock = p.turnCount = DAY_LENGTH*6*3 + 5; seasonTick(); A(isWinter(), 'winter');
    const mask = iceMask(); let ice = -1; for (let i=0;i<mask.length;i++) if (mask[i]){ ice = i; break; }
    out.iceTiles = mask.reduce((a,v)=>a+v, 0);
    if (ice >= 0){ const ix = ice%OW_COLS, iy = (ice/OW_COLS)|0; p.hasBoat = 0; A(o3Passable(ix, iy), 'walk on the ice');
      let holes = 0; for (let i=0;i<mask.length;i++) if (mask[i]){ const n = skNodeAt(i%OW_COLS, (i/OW_COLS)|0); if (n && n.type==='ice') holes++; } out.iceHoles = holes; A(holes > 0, 'ice holes');
      G.owPos = { x:ix, y:iy }; p.clock = p.turnCount = DAY_LENGTH*6*4 + 5; seasonTick(); A(G.ow.map[G.owPos.x][G.owPos.y]!==OW_WATER, 'thaw puts you ashore'); p.hasBoat = 1; }
    return out;
  });
  console.log(JSON.stringify(r1, null, 1));
  // the maps and 3D, in winter, on the boat
  const r2 = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    const p = G.player; p.clock = p.turnCount = DAY_LENGTH*6*3 + 40; seasonTick(); owSeenArr().fill(1); G.ow.seenVer++;
    G.owZoomedOut = false; toggleOwZoom(); for (const z of [1, 2, 4]){ G.owZoomScale = z; renderGame(); } G.owZoomedOut = false;
    renderGame();
    // out on the water near an island, in 3D
    o3Pref = true; G.gameMode = 0; G.ui = 'playing';
    const isl = G.ow.islands[0]; let w = null; for (let r=2;r<10 && !w;r++) for (let i=-r;i<=r && !w;i++) for (let j=-r;j<=r;j++){ const x = isl.land[0]+i, y = isl.land[1]+j; if (G.ow.map[x] && G.ow.map[x][y]===OW_WATER && !iceAt(x,y)){ w = [x,y]; break; } }
    if (w) G.owPos = { x:w[0], y:w[1] };
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const out = { active:o3Active(), tierBuilt:O3.boatTierBuilt, boatVisible:O3.boat && O3.boat.visible };
    // save and load
    saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing');
    A(boatTier()===4 && p.harpoon >= 1 || G.player.boatTier===4, 'boat survives load'); A(islandCharted(isl.id), 'charts survive load');
    return out;
  });
  console.log('3D', JSON.stringify(r2));
  await page.evaluate(async ()=>{ G.gameMode = 0; setUi('playing'); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } });
  await page.screenshot({ path: SHOTS+'/shot_sail_3d.png', timeout:120000 });
  await page.evaluate(()=>{ o3Pref = false; G.owZoomedOut = false; toggleOwZoom(); G.owZoomScale = 1.6; G.mapLayersOpen = false; renderGame(); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: SHOTS+'/shot_sail_map.png', timeout:120000 });
};
