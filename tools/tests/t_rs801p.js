// RS-801: sailing over a Planet's seam. The land's frame turns as you cross; she keeps her way and her true heading (never turning back on her wake), and the tiles go on one by one.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), w = ms=>new Promise(res=>setTimeout(res, ms)); window.__noLock = true;
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; const p = G.player; p.wildWarned = 1; G.gameMode = 0; G.interior = null; p.clock = DAY_LENGTH*0.4; p.hasBoat = 1; p.boatTier = 4; moveOverworldEncounters = ()=>{}; checkOverworldEncounterTrigger = ()=>{}; wevStep = ()=>false; wgStep = ()=>false; sqWorldStep = ()=>false; questOverworldTurn = ()=>false; checkMythicBeastTrigger = ()=>false; window.__seaWind = { a:0, s:1 };
    /* a straight run of water over a seam: 6 tiles either side, and a tile of water each side of that run */
    const wet = g=>g && G.ow.map[g[0]][g[1]]===OW_WATER && !iceAt(g[0], g[1]); let run = null;
    for (let x=0;x<OW_COLS && !run;x+=1) for (let y=0;y<OW_ROWS && !run;y+=1){ if (!wet([x, y]) || !cubeFace(x, y) && cubeFace(x, y)!==0) continue; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nb = owNb(x, y, dx, dy); if (!nb || cubeFace(nb[0], nb[1])===cubeFace(x, y)) continue; const fw = o3WalkLine(nb, x, y, 7), bk = o3WalkLine([x, y], nb[0], nb[1], 7); if (fw && bk){ run = { start:bk[bk.length - 1], seamA:[x, y], seamB:nb, first:bk[bk.length - 2] }; break; } } }
    function o3WalkLine(from, ax, ay, n){ const out = [from]; let c = from, dx = from[0] - ax, dy = from[1] - ay; if (Math.abs(dx) > 1 || Math.abs(dy) > 1) return null; for (let i=0;i<n;i++){ const q = owNb(c[0], c[1], dx, dy); if (!q || !wet(q) || cubeFace(q[0], q[1])!==cubeFace(from[0], from[1])) return null; out.push(q); c = q; } return out; }
    if (!run) return { none:true };
    G.owPos = { x:run.start[0], y:run.start[1] }; owReveal(run.start[0], run.start[1], 10); O3.win = null; for (let i=0;i<60 && !(O3.boat && O3.boat.visible && O3.ship && O3.ppos);i++) await fr(15); await fr(30);
    const S = seaState(), l0 = o3PL(), L1 = o3L(run.first[0], run.first[1]); const dir = [L1[0] - l0.x, L1[1] - l0.y]; S.yaw = O3.boatYaw = Math.atan2(dir[0], dir[1]); moveInput(dir[0], dir[1]);
    const seen = [], t0 = performance.now(); let turnBack = 0, lastK = '', maxStop = 0, stop0 = performance.now(), crossed = false, vAtCross = null, yawErr = null; const f0 = cubeFace(G.owPos.x, G.owPos.y);
    while (performance.now() - t0 < 9000){ await fr(1); const k = G.owPos.x + ',' + G.owPos.y; if (k!==lastK){ if (seen.includes(k)) turnBack++; seen.push(k); lastK = k; stop0 = performance.now(); } maxStop = Math.max(maxStop, performance.now() - stop0); if (!crossed && cubeFace(G.owPos.x, G.owPos.y)!==f0){ crossed = true; vAtCross = S.v; } if (!seaOn()) break; }
    return { run, f0, crossed, vAtCross, tiles:seen.length, turnBack, maxStop:Math.round(maxStop), v:S.v, on:seaOn() }; });
  console.log('rs801p', JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(r)); };
  if (r.none) return console.log('no straight sea over a seam in this world');
  A(r.crossed, 'she crosses the seam'); A(r.turnBack===0, 'she never turns back on her wake'); A(r.tiles >= 8, 'the tiles go on'); A(r.vAtCross > 1, 'with her way on');
  A(!errs.length, 'no page errors: ' + errs.join('; '));
};
