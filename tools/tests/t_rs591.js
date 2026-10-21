// RS-591: the roads as worn paths and old roads, painted into the ground: traced into smooth curves (no right-angled steps, no ringed
// disc at each tile), drawn into the road texture the land's shader paints from - a verge, the bed, ruts, a lane's grass strip, old
// paving - with grass kept off the bed, lanes out to the hamlets, pebbles, kerb stones and milestones; and the old ribbon kept on low
// graphics. Shots: shots/rs591-road.png, shots/rs591-low.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 200)); });
  const fr = n=>page.evaluate(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, n);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.mon = []; G.weather = 'clear';
    const sp = G.ow.spawnPos; let best = null, bn = 0;
    for (let x=sp.x-25; x<=sp.x+25; x++) for (let y=sp.y-25; y<=sp.y+25; y++){ if (wgRoadAt(x, y)!==1) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (wgRoadAt(x+i, y+j)===1) n++; if (n > bn && G.ow.map[x][y]!==OW_TOWN){ bn = n; best = { x, y }; } }
    G.owPos = best; for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const out = {}, m = O3.rmask; out.mask = !!m; if (!m) return out;
    /* the curves: their sharpest turn (a staircase turned a right angle at every tile) */
    let worst = 0, segs = 0, lanes = 0, paved = 0; for (const c of m.chains){ if (c.lane) lanes++; if (c.pav.some(p=>p > 0.5)) paved++; const P = c.p;
      for (let i=1;i<P.length - 1;i++){ const a = Math.atan2(P[i][1] - P[i-1][1], P[i][0] - P[i-1][0]), b = Math.atan2(P[i+1][1] - P[i][1], P[i+1][0] - P[i][0]); let d = Math.abs(b - a); if (d > Math.PI) d = 2*Math.PI - d; worst = Math.max(worst, d); segs++; } }
    out.curves = { chains:m.chains.length, lanes, paved, segs, worstTurn:+(worst*180/Math.PI).toFixed(1) };
    /* timing: the mask built again */
    { const t0 = performance.now(); const mm = o3RoadMask(O3.win.x0, O3.win.y0, O3_W, 5); out.ms = Math.round(performance.now() - t0); mm.tex.dispose(); }
    /* worn along a diagonal stretch, between the tile centres where the old ribbon never went */
    { const px = G.owPos.x + 0.5, pz = G.owPos.y + 0.5, c = m.chains.slice().sort((a, b)=>Math.min(...a.p.map(q=>Math.hypot(q[0] - px, q[1] - pz))) - Math.min(...b.p.map(q=>Math.hypot(q[0] - px, q[1] - pz))))[0], P = c.p, k = P.map(q=>Math.hypot(q[0] - px, q[1] - pz)).reduce((bi, v, i, A)=>v < A[bi] ? i : bi, 0), w = o3RoadWear(P[k][0], P[k][1]); out.onBed = w ? +w.w.toFixed(2) : null;
      const n = c.n[k], off = o3RoadWear(P[k][0] + n[0]*0.9, P[k][1] + n[1]*0.9); out.offBed = off ? +off.w.toFixed(2) : null; }
    /* grass: no blade on a road's bed */
    { let on = 0, all = 0; O3.world.traverse(o=>{ if (!o.isInstancedMesh || o.geometry.attributes.position.count!==3) return; const M4 = new THREE.Matrix4(), v = new THREE.Vector3();
        for (let i=0;i<o.count;i++){ o.getMatrixAt(i, M4); v.setFromMatrixPosition(M4); const w = o3RoadWear(v.x, v.z); all++; if (w && w.w > 0.6 && !(w.mid > 0.5 && w.pav < 0.3)) on++; } }); out.grass = { all, onBed:on }; }
    /* the land's shader paints the road; no square of dirt under its tiles */
    { const bl = O3.land.geometry.attributes.blend, ps = O3.land.geometry.attributes.position; let dirt = 0, n = 0; for (let i=0;i<ps.count;i+=7){ const x = Math.floor(ps.getX(i) - 0.5), z = Math.floor(ps.getZ(i) - 0.5); if (wgRoadAt(x, z)!==1) continue; n++; if (bl.getY(i) > 0.8) dirt++; } out.tileDirt = n ? +(dirt/n).toFixed(2) : 0; }
    out.stones = 0; O3.wgGrp.traverse(o=>{ if (o.isInstancedMesh) out.stones += o.count; });
    return out; });
  await page.screenshot({ path: SHOTS + '/rs591-road.png' });
  /* low graphics: painted too since RS-616, no errors */
  const low = await page.evaluate(async ()=>{ const s0 = SET.gfx; SET.gfx = 'low'; O3.win = null; O3.wgKey = null; for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    let ribbon = 0; O3.wgGrp.traverse(o=>{ if (o.isMesh && o.geometry.attributes.rd) ribbon++; }); SET.gfx = s0; return { ribbon }; });
  await page.screenshot({ path: SHOTS + '/rs591-low.png' });
  r.low = low; console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.mask && r.curves.chains > 0, 'the roads traced into curves');
  A(r.curves.worstTurn < 50, 'no right-angled steps: the sharpest turn ' + r.curves.worstTurn + ' degrees');
  A(r.onBed > 0.7 && r.offBed !== null && r.offBed < 0.2, 'worn on the bed, untouched a little off it: ' + r.onBed + ' / ' + r.offBed);
  A(r.grass.all > 1000 && r.grass.onBed === 0, 'no grass on the bed: ' + JSON.stringify(r.grass));
  A(r.tileDirt < 0.2, 'no square of dirt under each road tile: ' + r.tileDirt);
  A(r.stones > 20, 'pebbles, kerbs and milestones by the road: ' + r.stones);
  A(r.ms < 250, 'the road texture built quickly: ' + r.ms + 'ms');
  A(r.low.ribbon === 0, 'on low graphics the painted road too (RS-616: it was the old strip): ' + JSON.stringify(r.low));
  A(!errs.some(e=>/shader|WebGL|THREE|Error/i.test(e)), 'no errors: ' + errs.join(' | '));
};
