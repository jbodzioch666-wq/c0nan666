// RS-642: a cube Planet's globe chart without seams. Every face that shows gets its own chart laid over it (the chart used to be one
// stretch of the stored grid, and past the seams the grid's cross doesn't join the plain globe showed); the chart's coast, fog and colour
// run on over those seams (the tiles past them copy the land across, pmGhostSrc); the void between the faces is no named sea; writing near
// such a seam stays on its own face, a route or a quest trail isn't drawn across the grid; a click on any face reads that face's chart.
// Shot: shots/rs642-seam.png (looking straight at the seam between the north face and the west one)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const out = {}, fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.wildWarned = 1; await fr(20);
    const W = OW_COLS, H = OW_ROWS, N = cubeN(), m = G.ow.map, seen = owSeenArr();
    /* the tiles past a seam copy the land across it */
    { const gs = pmGhostSrc(), y = Math.round(N/2), c = (y + 1)*(W + 2) + (N - 1) + 1, q = owOff(N, y, -1, 0), tb = gs[(0)*(W + 2) + Math.round(1.5*N) + 1], qb = owOff(Math.round(1.5*N), 0, 0, -1);
      out.ghost = { tl:gs[c]===q[1]*W + q[0], top:tb===qb[1]*W + qb[0], inFace:gs[(N + 1)*(W + 2) + N + 1 + 5]===-1, joined:gs[(Math.round(1.5*N) + 1)*(W + 2) + N + 1]===-1 }; }
    /* its fog: a seen tile across the seam isn't fogged on this side */
    { for (let x=0;x<W;x++) for (let y=0;y<H;y++) seen[y*W + x] = cubeFace(x, y) >= 0 ? 1 : 0; G.ow.seenVer = (G.ow.seenVer||0) + 1;
      const fc = pmFogMask(), a = fc.getContext('2d').getImageData(N - 1 + 1, Math.round(N/2) + 1, 1, 1).data[3], b = fc.getContext('2d').getImageData(1, 1, 1, 1).data[3]; out.fog = { seam:a, voidFar:b }; }
    /* its coast: no ink line along a seam where the land runs on over it (any of the seven seams the grid doesn't join), at land with land
       all round it there, no peaks; and the same edges with the copying switched off, as before, are inked */
    { const land = t=>t!==OW_WATER && t!==OW_RIVER && t!==OW_MOUNTAIN && t!==OW_MOUNTAINPASS, gs = pmGhostSrc(), at = (u, v)=>{ if (u < -1 || v < -1 || u > W || v > H) return -1; const g = gs[(v + 1)*(W + 2) + u + 1]; return g >= 0 ? m[g % W][(g/W)|0] : -1; };
      const edges = []; for (let x=0; x<W && edges.length < 24; x++) for (let y=0; y<H && edges.length < 24; y+=2){ if (cubeFace(x, y) < 0 || cubeCornerDist(x, y) < 14) continue;
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ if (cubeFace(x + dx, y + dy) >= 0 || x + dx < 0 || y + dy < 0 || x + dx >= W || y + dy >= H) continue; const ax = dy ? 1 : 0, ay = dx ? 1 : 0; let ok = true;   /* (not at the grid's own end: the chart has no pixels past it) */
          for (let k=-1; k<=1 && ok; k++){ const tx = x + k*ax, ty = y + k*ay; if (cubeFace(tx, ty) < 0 || cubeFace(tx - dx, ty - dy) < 0 || !land(m[tx][ty]) || !land(m[tx - dx][ty - dy]) || !land(at(tx + dx, ty + dy)) || !land(at(tx + 2*dx, ty + 2*dy))) ok = false; }
          if (ok){ edges.push([x, y, dx, dy]); break; } } }
      const inked = ()=>{ const P = PM.P, cx = PM.cv.getContext('2d'); let bad = 0; for (const [x, y, dx, dy] of edges){
          /* the tile just past the edge, in the void (the chart's smoothing reaches it when drawn large): the land across's colour, or (as it
             was) the void's sea, inked along the edge - its blue over its red, all over it */
          const d = cx.getImageData((x + dx)*P, (y + dy)*P, P, P).data; let br = 0; for (let k=0;k<P*P;k++) br += d[k*4 + 2] - d[k*4]; if (br/(P*P) > 0) bad++; } return bad; };
      PM.key = null; pmBuild(); const bad = inked(); const sv = pmGhostSrc, none = new Int32Array((W + 2)*(H + 2)).fill(-1); pmGhostSrc = ()=>none; let was = 0; try{ PM.key = null; pmBuild(); was = inked(); } finally { pmGhostSrc = sv; PM.key = null; pmBuild(); }
      out.coast = { tried:edges.length, bad, was }; }
    /* the void is nobody's sea: no name of the land out in it */
    { const geo = geoBuild(pmMapKey()); let vo = 0, n = 0; for (const pl of geo.places) for (const [lx, ly] of pl.labels){ n++; if (cubeFace(lx, ly) < 0){ vo++; (out.voidNames = out.voidNames || []).push([pl.kind, pl.n, lx, ly, pl.tiles ? pl.tiles.length : -1]); } } out.names = { n, inVoid:vo }; }
    /* a line across the grid's void, lifted */
    out.line = { across:owNetLine(N, N/2, N - 30, N + 30), onFace:owNetLine(N + 10, N + 10, 2*N - 10, 2*N - 10) };
    /* writing near a seam the grid doesn't join, kept on its face; by one it does, left */
    { const sv = cellPx; cellPx = 10; GLOBE.decal = { w:1, h:1, bw:1, bh:1 }; GLOBE.upr = 0;
      try{ const a = pmFaceKeep((N + 1)*10, (N/2)*10, 60, 8, 0, 0), b = pmFaceKeep((2*N - 1)*10, (1.5*N)*10, 60, 8, 0, 0); out.keep = { tl:+(a[0]/10 - N).toFixed(1), fr:+(b[0]/10 - (2*N - 1)).toFixed(1) }; }
      finally { GLOBE.decal = null; cellPx = sv; } }
    /* the globe, close in, looking straight at the seam between the north face and the west one */
    toggleOwZoom(); await fr(10); G.owZoomScale = 3.5; await fr(3); GLOBE.dist = GLOBE.distGoal; globeFace(N, Math.round(N/2)); await fr(30);
    const CP = GLOBE.cpatch || [], on = CP.map((P, k)=>P && P.on ? k : -1).filter(k=>k >= 0), rect = canvas.getBoundingClientRect(), k = canvas.width/rect.width, cw = canvas.width, ch = canvas.height;
    /* every point of the globe on the screen takes its own face's chart */
    let pts = 0, cov = 0; const hitTile = (sx, sy)=>{ const T = THREE, ray = new T.Raycaster(); ray.setFromCamera(new T.Vector2(sx/cw*2 - 1, 1 - sy/ch*2), GLOBE.cam); const o = ray.ray.origin, d = ray.ray.direction, b = o.dot(d), c = o.dot(o) - 1, disc = b*b - c;
      if (disc < 0) return null; const h = o.clone().addScaledVector(d, -b - Math.sqrt(disc)); return globeTileOf(globeUnturn(h)); };
    for (let j=1;j<12;j++) for (let i=1;i<16;i++){ const t = hitTile(cw*i/16, ch*j/12); if (!t) continue; pts++; const tx = clamp(Math.floor(t.x + 0.5), 0, W - 1), ty = clamp(Math.floor(t.y + 0.5), 0, H - 1), f = cubeFace(tx, ty), P = CP[f];
      if (P && P.on){ const R4 = GLOBE.pu['uRF' + f].value; if ((t.x + 0.5)/W >= R4.x && (t.x + 0.5)/W <= R4.z && (t.y + 0.5)/H >= R4.y && (t.y + 0.5)/H <= R4.w) cov++; } }
    out.globe = { pa:+GLOBE.pa.toFixed(2), cube:GLOBE.pu.uCube.value, faces:on, pts, cov };
    /* a click on the other side of the seam reads that face's chart */
    { const t = [Math.round(N/2), N + 6], s = globeTileScreen(t[0], t[1]), e = s && globeEv({ clientX:rect.left + s.x/k, clientY:rect.top + s.y/k }), gx = e && owZoomLastCam.x + (e.clientX - rect.left)*k/owZoomLastCellPx - 0.5, gy = e && owZoomLastCam.y + (e.clientY - rect.top)*k/owZoomLastCellPx - 0.5;
      out.click = { face:cubeFace(t[0], t[1]), hover:GLOBE.hoverFace, d:e ? +Math.max(Math.abs(gx - t[0]), Math.abs(gy - t[1])).toFixed(2) : null }; }
    /* the frames while it turns, the charts redrawn as it goes */
    { const fs = []; let l = performance.now(); for (let i=0;i<60;i++){ globeTurn(0.004, 0.002); await fr(1); const t = performance.now(); fs.push(t - l); l = t; } fs.sort((a, b)=>a - b); out.frames = { med:+fs[30].toFixed(1), p90:+fs[54].toFixed(1) }; }
    await fr(20); globeFace(N, Math.round(N/2)); await fr(30);
    return out; });
  await page.screenshot({ path: SHOTS + '/rs642-seam.png' });
  /* a generator 14 planet (laid flat) keeps its one chart */
  const r2 = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    toggleOwZoom(); await fr(3); const out = {};
    /* generator 19: a sea or a forest over a seam the grid doesn't join is one place, one name; generator 18's keep theirs */
    { const W = OW_COLS, H = OW_ROWS, pairs = g=>{ let same = 0, n = 0; for (let x=0;x<W;x++) for (let y=0;y<H;y+=2){ if (cubeFace(x, y) < 0) continue;
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ if (cubeFace(x + dx, y + dy) >= 0) continue; const q = owOff(x, y, dx, dy); if (!q) continue; const a = g.placeAt[y*W + x], b = g.placeAt[q[1]*W + q[0]];
          if (a < 0 || b < 0 || g.places[a].kind!==g.places[b].kind || g.places[a].kind==='sea' || g.places[a].kind==='lake') continue; n++; if (a===b) same++; } }
        let vd = 0; for (let x=0;x<W;x++) for (let y=0;y<H;y++) if (cubeFace(x, y) < 0 && g.placeAt[y*W + x] >= 0) vd++; return { n, same, vd }; };   /* (the land's places over the seams; and any place out in the void) */
      out.v19 = Object.assign(pairs(geoBuild(pmMapKey())), { ver:G.ow.genVer }); G.ow.genVer = 18; wgRegenerate(G.ow.seed); out.v18 = Object.assign(pairs(geoBuild(pmMapKey())), { ver:G.ow.genVer }); } G.worldSizeTier = 'planet'; OW_COLS = 432; OW_ROWS = 216; recomputeWorldSizeConstants(); G.ow.genVer = 14; G.ow.townPositions = {}; G.ow.townFlavor = {}; G.ow.siteMoves = {}; wgRegenerate(777);
    G.gameMode = 0; G.interior = null; owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; toggleOwZoom(); await fr(10); G.owZoomScale = 2; await fr(3); GLOBE.dist = GLOBE.distGoal; await fr(30);
    return Object.assign(out, { cube:owCube(), uCube:GLOBE.pu.uCube.value, pa:+GLOBE.pa.toFixed(2), one:!!GLOBE.lastRef && GLOBE.lastRef.pa > 0 }); });
  r.flat = r2; console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ghost.tl && r.ghost.top && r.ghost.inFace && r.ghost.joined, 'past a seam the grid doesn\'t join, the tiles copy the land across it (and only there)');
  A(r.fog.seam===0 && r.fog.voidFar===255, 'the fog past a seam is the land across it\'s');
  A(r.coast.tried >= 3 && r.coast.bad===0 && r.coast.was >= r.coast.tried*0.8, 'no inked coast and sea along a seam the land runs on over (as there was)');
  A(r.names.n > 10 && r.names.inVoid===0, 'no name of the land out in the void');
  A(!r.line.across && r.line.onFace, 'a line across the grid\'s void is lifted');
  A(r.keep.tl >= 2.5 && Math.abs(r.keep.fr) < 0.01, 'writing by a seam the grid doesn\'t join is kept on its face; by one it joins, left');
  A(r.globe.pa > 0.9 && r.globe.cube===1 && r.globe.faces.includes(4) && r.globe.faces.includes(0), 'the north face and the west one each have their own chart');
  A(r.globe.pts > 60 && r.globe.cov===r.globe.pts, 'every point of the globe on the screen is under its own face\'s chart');
  A(r.click.face===0 && r.click.hover===0 && r.click.d!=null && r.click.d <= 1, 'a click across the seam reads that face\'s chart');
  A(r.frames.med < 34, 'it turns smoothly');
  A(!r.flat.cube && r.flat.uCube===0 && r.flat.pa > 0.5 && r.flat.one, 'a generator 14 planet keeps its one chart');
  A(r.flat.v19.ver >= 19 && r.flat.v19.same >= r.flat.v19.n*0.9 && r.flat.v19.vd===0, 'generator 19: a forest or a desert over a seam is one place, and the void none');
  A(r.flat.v18.ver===18 && (r.flat.v18.n===0 || r.flat.v18.same < r.flat.v18.n*0.6) && r.flat.v18.vd > 0, 'generator 18 keeps its places as they were');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
