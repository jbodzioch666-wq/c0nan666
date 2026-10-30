// RS-521: a tile changing far off (a site reclaimed, a bridge mended) no longer stops a walk while the map's regions, the far
// ground and the land's normals are worked out in one go: each is worked out a little a frame, the old one shown meanwhile.
// Checked at a quarter of this machine's speed - the worst frame well under the 350ms it was - and that what comes out of the
// slices is the same as what one go makes
module.exports = async page=>{
  await page.evaluate(()=>{ window.__noWarmSlice = 0; });
  const cdp = await page.context().newCDPSession(page);
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; for (let i=0;i<30;i++){ renderGame(); await new Promise(r2=>setTimeout(r2, 40)); }
    let n = 0; while (O3.warmWait && n++ < 900){ await new Promise(r2=>requestAnimationFrame(r2)); renderGame(); } await new Promise(r2=>setTimeout(r2, 1500)); });
  const r0 = await page.evaluate(()=>{ const out = {};
    /* the land's normals, summed a few rows at a time, are three's own */
    const NV = O3_W*O3_R + 1, land = O3.land;   /* (RS-654: the land's grid, then the barrows' stair patches after it (RS-652) - judged on the grid, clear of the cuts, whose triangles are re-laid) */
    if (land){ const g = land.geometry.clone(); g.computeVertexNormals(); const a = land.geometry.attributes.normal.array, b = g.attributes.normal.array, P = land.geometry.attributes.position.array, cuts = O3.cuts||[]; let d = 0;
      for (let k=0;k<NV*NV;k++){ if (cuts.some(c=>Math.abs(P[k*3] - c.cx) < 3 && Math.abs(P[k*3+2] - c.cz) < 3)) continue; for (let e=0;e<3;e++) d = Math.max(d, Math.abs(a[k*3+e] - b[k*3+e])); } out.normDiff = d; out.cuts = cuts.length; } else out.normDiff = 'no land';
    return out; });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:4 });
  const r = await page.evaluate(async ()=>{
    let fx = -1, fy = -1; for (let x=5;x<OW_COLS-5 && fx<0;x++) for (let y=5;y<OW_ROWS-5;y++) if (G.ow.map[x][y]===OW_GRASS && Math.hypot(x - G.owPos.x, y - G.owPos.y) > 60){ fx = x; fy = y; break; }
    const g0 = owGeo(), far0 = O3.farLand;
    G.ow.map[fx][fy] = OW_FOREST; G.player.turnCount = (G.player.turnCount||0) + 1;
    const first = owGeo(), pendAfter = !!owGeo.pend;
    const d = []; let last = performance.now(); const t0 = last;
    await new Promise(res=>{ const f = t=>{ d.push(t - last); last = t; if (t - t0 < 9000 && (t - t0 < 1500 || O3.pend || owGeo.pend || O3.farPend)) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    d.shift(); await new Promise(r2=>setTimeout(r2, 300));
    const g1 = owGeo(), key = pmMapKey(), ref = geoBuild(key), sum = g=>JSON.stringify([g.places.map(p=>[p.name, p.kind, p.n, p.lx, p.ly]), g.landmarks.map(l=>[l.id, l.x, l.y, l.name]), g.coast.length, g.land]);
    return { stale:first===g0, pendAfter, fresh:g1!==g0 && g1.key===key, same:sum(g1)===sum(ref), farNew:O3.farLand!==far0 && O3.farKey.endsWith('|' + O3.mapKey), worst:Math.round(Math.max(...d)) }; });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:1 });
  Object.assign(r, r0); console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(typeof r.normDiff==='number' && r.normDiff < 1e-4, 'the land\'s normals are the same as three\'s');
  A(r.stale && r.pendAfter, 'the regions are not worked out in one call - the old ones answer meanwhile');
  A(r.fresh && r.same, 'and once done they are exactly what one go makes');
  A(r.farNew, 'the far ground is remade for the change');
  A(r.worst < 260, 'no frame comes near the old 350ms');
};
