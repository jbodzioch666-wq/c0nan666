module.exports = async page=>{
  const frame = ()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const r1 = await page.evaluate(()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); confirmWorldPreview(); setUi('playing'); o3Pref = false; G.gameMode = 0;
    G.player.gold = 100000; G.player.level = 10;
    // roads: every other step free
    const rt = []; for (let i=0;i<OW_COLS*OW_ROWS;i++) if (G.ow.road[i]===1) rt.push(i);
    A(rt.length > 20, 'roads laid'); const j = rt[0], x = j%OW_COLS, y = (j/OW_COLS)|0;
    G.player._roadHalf = false; const c1 = wgStepCost(x, y), c2 = wgStepCost(x, y); A(c1 + c2 === 1, 'road steps '+c1+c2);
    // bands and the area
    out.area = wgArea(x, y); out.arena = wgArenaLevel(); A(out.area.band >= 1, 'band');
    // a broken bridge, mended
    const b = G.ow.bridges.find(b=>b.broken);
    if (b){ const [bx,by] = b.tiles[0]; let from = null; for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if (wgRoadAt(bx-dx, by-dy)===1){ from = [bx-dx, by-dy, dx, dy]; break; }
      A(from, 'bridge approach'); G.owPos = { x:from[0], y:from[1] }; frameLoop.op = null; tryMoveOverworld(from[2], from[3]); wgOnStep(null);
      A(G.ui==='wevent' && /bridge/i.test(G.wevDlg.title), 'bridge dialog '+G.ui); skAdd('logs', 12); wevChoose(0);
      A(wgState().fixed[b.id] && wgRoadKind(bx, by)===2, 'bridge mended'); out.bridge = b.id; }
    // every kind of point of interest
    const seenK = {};
    for (const p of G.ow.pois){ if (seenK[p.k]) continue; seenK[p.k] = 1;
      let from = null; for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const fx = p.x-dx, fy = p.y-dy; if (o3Passable(fx, fy) && !OW_SITE_TILES.includes(G.ow.map[fx][fy])){ from = [fx, fy, dx, dy]; break; } }
      if (!from) continue; G.gameMode = 0; setUi('playing'); G.owPos = { x:from[0], y:from[1] }; G.ow.encounters = [];
      tryMoveOverworld(from[2], from[3]);
      out['poi_'+p.k] = G.ui==='wevent' ? G.wevDlg.title + ' / ' + G.wevDlg.opts.map(o=>o[0]).join(' | ') : 'ui:'+G.ui+' mode:'+G.gameMode;
      if (G.ui==='wevent'){ const d = G.wevDlg; if (p.k==='cave' || p.k==='grotto' || p.k==='ruin'){ window.__delve = p.id; wevChoose(0); A(G.gameMode===2 && G.wevFight.kind==='delve', 'delve fight'); return out; } wevChoose(0); }
    }
    return out;
  });
  console.log(JSON.stringify(r1, null, 1));
  await page.evaluate(()=>{ G.mon.forEach(m=>m.alive = 0); }); await frame(); await frame();
  const r2 = await page.evaluate(()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    A(G.gameMode===0 && wgState().done[window.__delve], 'delve cleared and looted '+G.gameMode);
    // the rest of the kinds
    const seenK = { [G.ow.pois.find(p=>p.id===window.__delve).k]:1 };
    for (const p of G.ow.pois){ if (seenK[p.k]) continue; seenK[p.k] = 1;
      let from = null; for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const fx = p.x-dx, fy = p.y-dy; if (o3Passable(fx, fy) && !OW_SITE_TILES.includes(G.ow.map[fx][fy])){ from = [fx, fy, dx, dy]; break; } }
      if (!from) continue; G.gameMode = 0; setUi('playing'); G.owPos = { x:from[0], y:from[1] }; G.ow.encounters = [];
      tryMoveOverworld(from[2], from[3]);
      out['poi_'+p.k] = G.ui==='wevent' ? G.wevDlg.title : 'ui:'+G.ui;
      if (G.ui==='wevent'){ if (['cave','grotto','ruin'].includes(p.k)){ wevChoose(G.wevDlg.opts.length-1); continue; } const pos0 = G.owPos.x+','+G.owPos.y; wevChoose(0); if (p.k==='ferry') A(G.owPos.x+','+G.owPos.y !== pos0, 'ferried'); }
      if (G.gameMode===2){ G.mon.forEach(m=>m.alive=0); G.wevFight = null; G.gameMode = 0; }
    }
    // camping gear
    G.gameMode = 0; setUi('playing'); for (const g of WG_CAMP_GEAR) wgBuyCamp(g.id); A(wgCamp().tent===1 && wgCamp().spit===1, 'camp kit');
    const m0 = wgCampMult(); A(m0 < 1, 'safer camping '+m0);
    let t = 0; do { campOutside(); t++; if (G.gameMode===2){ G.mon.forEach(m=>m.alive=0); G.gameMode = 0; setUi('playing'); } } while (!G.player.campPitch && t < 20);
    A(G.player.campPitch && G.player.campPitch.spit, 'camp pitched with spit'); A(skFireHere(), 'campfire lit');
    // the Wilderness: warned on entering, and death there leaves no grave
    const w = G.ow.wild; let wx = G.owPos.x, wy = G.owPos.y;
    if (w.side==='north') wy = 2; else if (w.side==='south') wy = OW_ROWS-3; else if (w.side==='west') wx = 2; else wx = OW_COLS-3;
    for (let r=0;r<30;r++){ let ok = false; for (let i=-r;i<=r && !ok;i++) for (let j2=-r;j2<=r && !ok;j2++){ const xx = wx+i, yy = wy+j2; if (xx>0 && yy>0 && xx<OW_COLS-1 && yy<OW_ROWS-1 && o3Passable(xx,yy) && G.ow.map[xx][yy]!==OW_WATER && !OW_SITE_TILES.includes(G.ow.map[xx][yy]) && wgWildLevel(xx,yy)){ wx = xx; wy = yy; ok = true; } } if (ok) break; }
    G.owPos = { x:wx, y:wy }; G.player._areaKey = null; G.player.wildWarned = 0; setUi('playing'); wgOnStep(null);
    A(G.ui==='wevent' && /Wilderness/.test(G.wevDlg.title), 'wilderness warning'); wevChoose(0);
    out.wild = wgWildLevel(wx, wy); A(out.wild > 0, 'in the wild');
    renderGame(); A(document.getElementById('wildHud') && document.getElementById('wildHud').style.display==='block', 'wild hud');
    G.inv.push(genItem(5,'weapon',2), genItem(5,'weapon',2), genItem(5,'weapon',2), genItem(5,'weapon',2), genItem(5,'weapon',2));
    playerDies('a test'); A(G.deathWild, 'death flagged wild'); continueAfterDeath(false); A(!G.player.grave, 'no grave in the wild');
    // route by road and walking to a town
    G.gameMode = 0; setUi('playing'); const spx = G.ow.spawnPos; G.owPos = { x:spx.x, y:spx.y+1 };
    const tw = wevTowns().find(([x,y])=>!(x===spx.x && y===spx.y) && G.ow.comp[y*OW_COLS+x]===G.ow.comp[spx.y*OW_COLS+spx.x]);
    if (tw){ G.player.route = { pts:[[tw[0], tw[1]]] }; routeInfo.c = null; const ri = routeInfo(); A(ri && ri.steps > 0, 'road route'); let onRoad = 0; for (const j of ri.tiles) if (G.ow.road[j]) onRoad++; out.routeRoadShare = (onRoad/ri.steps).toFixed(2);
      G.player.route = null; wgWalkTo(tw[0], tw[1]); A(G.routeWalk && G.routeWalk.steps.length > 0, 'walking to town'); G.routeWalk = null; }
    // the travel log and the maps
    setUi('travellog'); A(document.getElementById('overlay').innerHTML.includes('THE LAND'), 'travel log land'); setUi('playing');
    owSeenArr().fill(1); G.ow.seenVer++;
    G.owZoomedOut = false; toggleOwZoom(); for (const z of [1, 2, 3, 6]){ G.owZoomScale = z; renderGame(); } G.owZoomedOut = false; renderGame();
    // save and load
    const k1 = pmMapKey(), fixed = JSON.stringify(wgState().fixed), cont = wgContinent(); saveCurrentGame();
    const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing');
    A(pmMapKey()===k1 && JSON.stringify(wgState().fixed)===fixed && wgContinent()===cont, 'world and changes survive load');
    out.stat = G.player.wgStat; out.lore = wgState().lore.length;
    return out;
  });
  console.log(JSON.stringify(r2, null, 1));
  // 3D: roads, a point of interest, wildlife and a hunt
  const r3 = await page.evaluate(async ()=>{
    o3Pref = true; G.gameMode = 0; G.ui = 'playing'; G.owZoomedOut = false; G.player.clock = G.player.turnCount = 90;
    const p = G.ow.pois.find(p=>p.k==='hamlet') || G.ow.pois[0]; let best = null;
    for (let i=-5;i<=5;i++) for (let j=2;j<=5;j++){ const x = p.x+i, y = p.y+j; if (o3Passable(x,y) && !OW_SITE_TILES.includes(G.ow.map[x][y]) && G.ow.map[x][y]!==OW_WATER && (!best || Math.abs(i)+j < best[2])) best = [x,y,Math.abs(i)+j]; }
    if (best) G.owPos = { x:best[0], y:best[1] };
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const wl = (O3.wild||[]).filter(w=>w.k!=='bird');
    let hunted = null;
    if (wl.length){ const w = wl[0]; O3.ppos.set(w.x+1, 0, w.z); const before = skHave('meat'); for (let k=0;k<10 && w.alive;k++){ w.flee = 0; wgHunt({ w }); if (G.gameMode===2) break; } hunted = { k:w.k, alive:w.alive, meat:skHave('meat')-before, mode:G.gameMode }; if (G.gameMode===2){ G.mon.forEach(m=>m.alive=0); } }
    return { active:o3Active(), wgHits:(O3.wgHits||[]).length, wild:(O3.wild||[]).map(w=>w.k).join(','), hunted };
  });
  console.log('3D', JSON.stringify(r3));
  await frame(); await frame();
  await page.evaluate(async ()=>{ G.gameMode = 0; setUi('playing'); for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } });
  await page.screenshot({ path: SHOTS+'/shot_wg_3d.png', timeout:120000 });
  await page.evaluate(()=>{ o3Pref = false; G.owZoomedOut = false; toggleOwZoom(); G.owZoomScale = 3; G.mapLayersOpen = false; renderGame(); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: SHOTS+'/shot_wg_map.png', timeout:120000 });
};
