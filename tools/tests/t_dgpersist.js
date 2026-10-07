// RS-205: a site's floors are laid out once and kept with the save - dying brings you back to the same floor; the stone
// stands where you fell down below and is reclaimed there; the fallen master opens a portal out instead of ending the run
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await ev(async ()=>{
    const out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON && G.ow.dungeonMax[x][y] >= 2){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    let P = G.player; const slot = G.dungeonSlot, sig = ()=>G.map.map(c=>c.join('')).join('|') + '#' + G.mon.map(m=>m.nm+m.x+','+m.y).join(',');
    const s1 = sig(); out.slot = slot; out.depth = G.depth;
    // die on floor 1, away from the way in: the floor is kept, the stone stands where you fell
    let fx = -1, fy = -1; for (let x=COLS-2;x>0 && fx<0;x--) for (let y=ROWS-2;y>0;y--) if (G.map[x][y]===T_FLOOR && !G.dungeonDeco[x][y] && Math.abs(x-G.genStart.x)+Math.abs(y-G.genStart.y) > 6){ fx=x; fy=y; break; }
    P.x = fx; P.y = fy; P.gold = 1000; G.inv.push(genItem(5, 'weapon', 1), genItem(5, 'weapon', 1), genItem(5, 'weapon', 1), genItem(5, 'weapon', 1), genItem(5, 'weapon', 1));
    const foes = G.mon.filter(m=>m.alive).length;
    playerDies('a test'); continueAfterDeath(); G.gameOver = 0;
    const g = P.graves[P.graves.length-1];
    out.mode = G.gameMode; out.cached = !!G.dgCache[slot+'_1']; out.grave = g && g.dg && { slot:g.dg.slot, d:g.dg.d, x:g.dg.x, y:g.dg.y, ox:g.x, oy:g.y, items:g.items.length };
    out.graveAtDoor = [dx, dy];
    // not picked up at the dungeon's door on the land
    G.owPos = { x:dx, y:dy }; graveCheck(); out.stillThere = P.graves.includes(g);
    // back in: the same floor, the same foes, and the stone on its tile
    G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    out.same = sig()===s1; out.foes = [foes, G.mon.filter(m=>m.alive).length]; out.deco = G.dungeonDeco[g.dg.x][g.dg.y];
    // the save carries the floors
    saveCurrentGame(); const data = JSON.parse(localStorage.getItem(SAVE_PREFIX+G.saveId)); out.saved = Object.keys(data.dgCache||{});
    out.savedKB = Math.round(JSON.stringify(data.dgCache).length/1024);
    G.dgCache = {}; loadGame(G.saveId); setUi('playing'); out.sameAfterLoad = sig()===s1; out.decoAfterLoad = G.dungeonDeco[g.dg.x][g.dg.y];
    // kneel at the stone: everything back, the deco gone (the load made a new player object - find the stone again)
    const P2 = G.player, g2 = P2.graves.find(q=>q.id===g.id);
    const inv0 = G.inv.length, gold0 = P2.gold; P2.x = g2.dg.x; P2.y = g2.dg.y; graveCheck();
    out.reclaimed = !P2.graves.includes(g2) && G.inv.length===inv0 + g2.items.length && P2.gold===gold0 + g2.gold && G.dungeonDeco[g2.dg.x][g2.dg.y]==='';
    out.reclaimDbg = [P2.graves.length, G.inv.length, inv0, g2.items.length, P2.gold, gold0, g2.gold, G.dungeonDeco[g2.dg.x][g2.dg.y]];
    // the master falls: a portal opens, the run stays
    saveLevelCache(G.depth); loadLevel(G.dungeonMaxDepth, false); setUi('playing');
    out.boss = [G.isBossFloor, G.bossIdx];
    const ent = { x:G.dungeonEntrance.x, y:G.dungeonEntrance.y };
    bossDefeated();
    out.afterBoss = { ui:G.ui, mode:G.gameMode, slot:G.dungeonSlot, done:G.dgDone, cacheKept:Object.keys(G.dgCache).some(k=>k.startsWith(slot+'_')), entTile:G.ow.map[ent.x][ent.y]===OW_GRASS };
    P = G.player;
    let px=-1, py=-1, pd = 1e9; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_EXIT){ const d = Math.hypot(x-P.x, y-P.y); if (d < pd){ pd = d; px=x; py=y; } }
    out.portal = [px, py, +pd.toFixed(1)];
    victoryContinue(); out.uiBack = G.ui;
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 80)); }
    out.portals3d = typeof FPD!=='undefined' && FPD.portals ? FPD.portals.length : -1;
    // step through: out on the land, the floors let go
    P.x = px; P.y = py; G.map[px][py] = T_FLOOR; const w = portalWallDir(px, py) || [0, 1]; P.x = px + w[0]; P.y = py + w[1]; G.map[px][py] = T_EXIT; G.map[P.x][P.y] = T_FLOOR;
    for (const m of G.mon) m.alive = 0;
    tryMove(-w[0], -w[1]);
    out.left = { mode:G.gameMode, slot:G.dungeonSlot, done:G.dgDone, cache:Object.keys(G.dgCache).filter(k=>k.startsWith(slot+'_')).length };
    return out; });
  A(r.mode===0 && r.cached, 'the floor you died on is kept '+JSON.stringify(r));
  A(r.grave && r.grave.slot===r.slot && r.grave.d===1 && r.grave.ox===r.graveAtDoor[0] && r.grave.oy===r.graveAtDoor[1] && r.grave.items > 0, 'the stone is down the site, marked at its door '+JSON.stringify(r.grave));
  A(r.stillThere, 'not picked up at the door');
  A(r.same && r.foes[0]===r.foes[1] && r.deco==='pgrave', 'back in: same floor, same foes, the stone on its tile '+JSON.stringify([r.same, r.foes, r.deco]));
  A(r.saved.includes(r.slot+'_1') && r.sameAfterLoad && r.decoAfterLoad==='pgrave' && r.savedKB < 400, 'the save carries the floor '+JSON.stringify([r.saved, r.sameAfterLoad, r.decoAfterLoad, r.savedKB]));
  A(r.reclaimed, 'reclaimed at the stone '+JSON.stringify(r.reclaimDbg));
  A(r.boss[0]===1 && r.boss[1]>=0, 'boss floor '+JSON.stringify(r.boss));
  A(r.afterBoss.ui==='victory' && r.afterBoss.mode===1 && r.afterBoss.slot===r.slot && r.afterBoss.done===1 && r.afterBoss.cacheKept && r.afterBoss.entTile, 'after the boss you are still inside '+JSON.stringify(r.afterBoss));
  A(r.portal[0]>=0 && r.portal[2] <= 4, 'a portal near you '+JSON.stringify(r.portal));
  A(r.uiBack==='playing' && r.portals3d===1, 'the portal is modelled '+JSON.stringify([r.uiBack, r.portals3d]));
  A(r.left.mode===0 && r.left.slot===0 && r.left.done===0 && r.left.cache===0, 'stepping through leaves the site behind '+JSON.stringify(r.left));
  console.log('dgpersist ok '+JSON.stringify({ kb:r.savedKB, portal:r.portal }));
};
