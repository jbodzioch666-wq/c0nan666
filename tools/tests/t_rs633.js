// RS-633: generator 16 - the narrow seas go from four of the seven unjoined edges (the north and south faces' sides, which meet the tops
// and bottoms of L and R): the land, rivers and roads run over them; seas stay only along the back face's three edges and at the four
// corners of the middle face; no ghost is left in the void; you can walk over such an edge on foot, the 3D land running on.
// Shots: shots/rs633-edge.png, shots/rs633-preview.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const r = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), out = { w:[] };
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet');
    for (const seed of [777, 424242]){ wgRegenerate(seed); const N = cubeN(), W = OW_COLS, M = G.ow.map, road = G.ow.road;
      const edges = { Tl:[N, 0, -1, 0], Tr:[2*N - 1, 0, 1, 0], Dl:[N, 2*N, -1, 0], Dr:[2*N - 1, 2*N, 1, 0] };
      const per = {}; let rivers = 0, roads = 0;
      for (const [k, [x0, y0, dx, dy]] of Object.entries(edges)){ let land = 0; for (let i=6;i<N - 6;i++){ const x = x0, y = y0 + i, q = owOff(x, y, dx, dy); if (!q) continue; const a = M[x][y], b = M[q[0]][q[1]];
        if (a!==OW_WATER && b!==OW_WATER) land++; if (a===OW_RIVER && b===OW_RIVER) rivers++; if (road[y*W + x] && road[q[1]*W + q[0]]) roads++; } per[k] = land; }
      let ghost = 0; for (let x=0;x<W;x++) for (let y=0;y<OW_ROWS;y++) if (cubeFace(x, y) < 0 && M[x][y]!==OW_WATER) ghost++;
      let seaBad = 0; for (let x=0;x<W;x++) for (let y=0;y<OW_ROWS;y++){ if (cubeFace(x, y) < 0) continue; if (cubeStraitDist(x, y) < 0.6 && M[x][y]!==OW_WATER) seaBad++; }
      out.w.push({ seed, ver:G.ow.genVer, per, rivers, roads, ghost, seaBad }); }
    /* walk on foot over T's west edge onto L, where it's land both sides */
    confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.wildWarned = 1;
    const N = cubeN(), M = G.ow.map, ok = t=>t!==OW_WATER && t!==OW_MOUNTAIN && t!==OW_RIVER && !OW_SITE_TILES.includes(t); let row = -1;
    for (let y=10; y<N - 10 && row < 0; y++){ let good = true, x = N + 4, yy = y; for (let k=0;k<12 && good;k++){ const q = owOff(x, yy, -1, 0); if (!q || !ok(M[q[0]][q[1]])) good = false; else { x = q[0]; yy = q[1]; } if (cubeFace(x, yy)===0 && k > 0){ /* past the edge the next west step in the frame is down L */ } } if (good && ok(M[N + 4][y])) row = y; }
    out.row = row;
    if (row < 0){ for (let i=0;i<14;i++){ const q = owOff(N + 4, 30, -(i + 1), 0); if (q) M[q[0]][q[1]] = OW_GRASS; } M[N + 4][30] = OW_GRASS; row = 30; out.forced = true; }
    G.owPos = { x:N + 4, y:row }; for (let i=0;i<150;i++) await raf();
    let prev = o3PL(), cont = true, onL = false, landAhead = true; for (let k=0;k<12;k++){ const key = viewRotDir([-1, 0]), d = o3DirToG(key[0], key[1]); const nb = owNb(G.owPos.x, G.owPos.y, d[0], d[1]); if (nb && !ok(M[nb[0]][nb[1]])) M[nb[0]][nb[1]] = OW_GRASS;
      tryMoveOverworld(d[0], d[1]); for (let i=0;i<20;i++) await raf(); const l = o3PL(); if (O3F.face===4 && Math.abs(l.x - prev.x) + Math.abs(l.y - prev.y)!==1) cont = false; prev = l; if (cubeFace(G.owPos.x, G.owPos.y)===0) onL = true;
      if (k===1){ const pl = o3PL(); for (let j=1;j<=6;j++) if (o3Tile(pl.x - j, pl.y)===OW_WATER && M[o3G(pl.x - j, pl.y)[0]][o3G(pl.x - j, pl.y)[1]]!==OW_WATER) landAhead = false; } }
    Object.assign(out, { cont, onL, landAhead, face:cubeFace(G.owPos.x, G.owPos.y), frame:O3F.face });
    return out; });
  await page.screenshot({ path: SHOTS + '/rs633-edge.png' });
  await page.evaluate(()=>{ setUi('worldPreview'); renderWorldPreviewMap(); }); await page.waitForTimeout(300); await page.screenshot({ path: SHOTS + '/rs633-preview.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.w.every(w=>w.ver===16), 'new planets are made by generator 16');
  A(r.w.every(w=>Object.values(w.per).filter(v=>v > 10).length >= 2), 'land runs over the joined-up edges');
  A(r.w.some(w=>w.rivers > 0 || w.roads > 0), 'rivers or roads carry on over an edge');
  A(r.w.every(w=>w.ghost===0), 'nothing left in the void');
  A(r.w.every(w=>w.seaBad===0), 'the seas left are only along the back face and at the middle face\'s corners');
  A(r.cont && r.onL && r.face===0, 'walking west on foot over the north face\'s edge, the 3D place goes on a step at a time, onto L');
  A(r.landAhead, 'the land past the edge is drawn as land');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
