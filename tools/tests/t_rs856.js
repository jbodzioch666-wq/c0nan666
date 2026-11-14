// RS-856: a route keeps going - sailed to a stop inland, the ship lands and you walk on to the stop (the landing used to throw the rest
// of the path away); at sea, a path cleared mid-course (as bumping the coast did) is taken up again; stopping with the route button
// stays stopped
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }); const w = ms=>new Promise(res=>setTimeout(res, ms)); window.__noLock = true;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; const p = G.player; p.hasBoat = 1; p.boatTier = 4; p.clock = 100; G.gameMode = 0; p.hp = p.maxHp = 99999;
    moveOverworldEncounters = ()=>{}; checkOverworldEncounterTrigger = ()=>{}; wevStep = ()=>false; wgStep = ()=>false; sqWorldStep = ()=>false; questOverworldTurn = ()=>false; checkMythicBeastTrigger = ()=>false;
    const M = G.ow.map, land = (x, y)=>M[x] && M[x][y]!=null && M[x][y]!==OW_WATER && o3Passable(x, y) && !OW_SITE_TILES.includes(M[x][y]);
    /* a sea tile with a straight run of open water to a coast, and walkable land beyond it */
    let pick = null;
    for (let x=12; x<OW_COLS-12 && !pick; x+=2) for (let y=12; y<OW_ROWS-12 && !pick; y+=2){ if (M[x][y]!==OW_WATER || owFresh(x, y)) continue;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ let k = 1; while (k < 14 && M[x + dx*k] && M[x + dx*k][y + dy*k]===OW_WATER && !owFresh(x + dx*k, y + dy*k)) k++; if (k < 6 || k >= 14) continue;
        let ok = true; for (let j=0;j<4;j++) if (!land(x + dx*(k + j), y + dy*(k + j))) ok = false; if (!ok) continue;
        let open = true; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (!M[x+i] || M[x+i][y+j]!==OW_WATER) open = false; if (!open) continue;
        pick = { x, y, dx, dy, k, stop:[x + dx*(k + 3), y + dy*(k + 3)] }; break; } }
    if (!pick) return { pick:null };
    G.owPos = { x:pick.x, y:pick.y }; owReveal(pick.x, pick.y, 16); for (let i=0;i<40 && !(O3.boat && O3.boat.visible && O3.ship);i++) await fr(20); await fr(30); window.__seaWind = { a:Math.atan2(pick.dx, pick.dy), s:1 };
    const out = { pick, atSea:seaOn() };
    /* 1. sail to a stop inland */ routeP().pts = [pick.stop.slice()]; routeInfo.c = null; routeGo(); out.going = G.routeOn && O3.path.length > 0;
    let landed = false; const t0 = performance.now(); while (performance.now() - t0 < 70000 && G.player.route){ await w(100); if (M[G.owPos.x][G.owPos.y]!==OW_WATER) landed = true; }
    out.landed = landed; out.reached = !G.player.route && G.owPos.x===pick.stop[0] && G.owPos.y===pick.stop[1]; out.at = [G.owPos.x, G.owPos.y];
    /* 2. at sea, the path cleared mid-course: taken up again */ G.owPos = { x:pick.x, y:pick.y }; for (let i=0;i<60;i++) await fr(1); await w(800);
    const far = [pick.x - pick.dx*0, pick.y]; let fs = null; for (const [ex, ey] of [[pick.x - 3*pick.dy, pick.y - 3*pick.dx], [pick.x + 3*pick.dy, pick.y + 3*pick.dx], [pick.x - pick.dx*3, pick.y - pick.dy*3]]) if (M[ex] && M[ex][ey]===OW_WATER){ fs = [ex, ey]; break; }
    routeP().pts = [pick.stop.slice()]; routeInfo.c = null; routeGo(); await w(2500); O3.path = []; const at1 = G.owPos.x + ',' + G.owPos.y; await w(3500);
    out.resumed = G.routeOn && (O3.path.length > 0 || !G.player.route);
    /* 3. stopped with the button: stays stopped */ if (G.player.route){ routeButton(); out.stopOff = !G.routeOn; const at2 = G.owPos.x + ',' + G.owPos.y; await w(3000); out.stayed = !O3.path.length && !G.routeOn; } else { out.stopOff = out.stayed = true; }
    return out; });
  console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  A(r.pick && r.atSea, 'no sea to sail', r); A(r.going, 'did not set off', r); A(r.landed && r.reached, 'the route stopped at the landing', r); A(r.resumed, 'the route was not taken up again', r); A(r.stopOff && r.stayed, 'the stop did not hold', r); };
