// RS-638: the game's own searches go over a Planet's face edges - a route planned from the north face onto L is found, by either
// planner, and walking it gets you there; its steps replayed on the world's neighbours land on the stop; the minimap near the edge shows
// the land past it, not void. Shot: shots/rs638-route.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const r = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), out = {};
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.wildWarned = 1;
    const N = cubeN(), M = G.ow.map, y0 = N >> 1, a = [N + 6, y0];
    /* clear ground from 6 tiles inside T, west over its edge and 6 tiles on into L */
    const line = [a]; let c = a; for (let k=0;k<12;k++){ const q = owOff(c[0], c[1], -1, 0); if (!q) break; line.push(q); c = q; }
    for (const [x, y] of line) for (const [i, j] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){ const q = owOff(x, y, i, j); if (q) M[q[0]][q[1]] = OW_GRASS; }
    const b = line[line.length - 1]; out.a = a; out.b = b; out.bFace = cubeFace(b[0], b[1]);
    G.owPos = { x:a[0], y:a[1] }; for (let i=0;i<120;i++) await raf();
    const replay = path=>{ if (!path) return null; let p = [a[0], a[1]]; for (const j of path){ const x = j%OW_COLS, y = (j/OW_COLS)|0, d = owStepTo(p[0], p[1], x, y), q = owNb(p[0], p[1], d[0], d[1]); if (!q || q[0]!==x || q[1]!==y) return false; p = q; } return p[0]===b[0] && p[1]===b[1]; };
    const bfs = owBfs(a[0], a[1], b[0], b[1]), rp = wgRoutePath(a[0], a[1], b[0], b[1]);
    out.bfs = bfs ? bfs.length : null; out.rp = rp ? rp.length : null; out.bfsOk = replay(bfs); out.rpOk = replay(rp);
    /* the minimap near the edge: every cell of it a real tile */
    { let bad = 0, n = 0; const PL = o3PL(); for (let j=-20;j<=20;j++) for (let i=-20;i<=20;i++){ n++; if (!o3G(PL.x + i, PL.y + j)) bad++; } out.mm = [n, bad]; }
    /* and walk the route */
    G.player.route = { pts:[[b[0], b[1]]] }; G.player.routeRoads = false; routeGo();
    for (let i=0;i<900 && !(G.owPos.x===b[0] && G.owPos.y===b[1]);i++) await raf();
    out.walked = G.owPos.x===b[0] && G.owPos.y===b[1]; out.at = [G.owPos.x, G.owPos.y];
    return out; });
  await page.screenshot({ path: SHOTS + '/rs638-route.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.bFace===0, 'the stop is over the edge, on L');
  A(r.bfs && r.bfsOk && r.rp && r.rpOk, 'both route planners find the way over the edge, and its steps land on the stop');
  A(r.mm[1]===0, 'the minimap shows the land past the edge');
  A(r.walked, 'walking the route gets you there');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
