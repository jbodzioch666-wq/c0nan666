// (probe, not in ALL) a cube Planet's globe looking straight at its face edges, at a few zooms: shots/zseam-<edge>-<zoom>.png
//   ZSEAM=tl,fr (which edges: tl T-L, fr F-R, bl B-L, tb T-B, dr D-R, c the T-L-F corner) ZZOOM=0,2.2,5 (0 = right out)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.wildWarned = 1;
    owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; await fr(20); toggleOwZoom(); await fr(10); });
  const N = 124, at = { tl:[N, N/2], fr:[2*N, 1.5*N], bl:[0, 1.5*N], tb:[1.5*N, 0], dr:[2*N, 2.5*N], c:[N, N] };
  const edges = (process.env.ZSEAM || 'tl,fr,bl,tb').split(','), zooms = (process.env.ZZOOM || '0,2.2,5').split(',').map(Number);
  for (const e of edges) for (const z of zooms){
    const r = await page.evaluate(async ([p, z])=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
      G.owZoomScale = z || OW_ZOOM_MIN; await fr(3); GLOBE.dist = GLOBE.distGoal; globeFace(Math.min(p[0], OW_COLS - 1), Math.min(p[1], OW_ROWS - 1)); GLOBE.dirty = true; await fr(40);
      /* where the seam lies on the screen: the tiles either side of it, every few along */
      const sx = []; for (let d=-30; d<=30; d+=10){ const a = p[0]===124 ? [124, Math.min(123, Math.max(0, p[1] + d))] : p[1]===0 ? [Math.min(247, Math.max(124, p[0] + d)), 0] : p[0]===0 ? [0, Math.min(247, Math.max(124, p[1] + d))] : [Math.min(OW_COLS - 1, p[0]), Math.min(OW_ROWS - 1, p[1] + d)];
        const q = globeTileScreen(a[0], a[1]); if (q) sx.push([Math.round(q.x), Math.round(q.y)]); }
      return { pa:+GLOBE.pa.toFixed(2), zs:+(G.owZoomScale||0).toFixed(2), dist:+GLOBE.dist.toFixed(2), an:+(GLOBE.an||0).toFixed(2), seam:sx }; }, [at[e], z]);
    console.log(e, z, JSON.stringify(r)); await page.screenshot({ path: SHOTS + '/zseam-' + e + '-' + z + '.png' });
    if (process.env.ZCLIP) await page.screenshot({ path: SHOTS + '/zseam-' + e + '-' + z + '-clip.png', clip:{ x:350, y:300, width:700, height:300 } });   /* (ZCLIP=1: the middle, where the seam runs, at full size) */
    if (process.env.ZCHART && z){   /* (ZCHART=1: the chart laid over it, as drawn: shots/zseam-<edge>-<zoom>-chart.png) */
      const d = await page.evaluate(async ()=>{ const o = renderOverworldMapZoomed; let u = null; window.renderOverworldMapZoomed = function(){ const r = o.apply(this, arguments); if (GLOBE.decal && !u) u = canvas.toDataURL('image/png'); return r; };
        GLOBE.dirty = true; GLOBE.lastRef = null; for (let i=0; i<6 && !u; i++) await new Promise(r=>requestAnimationFrame(r)); window.renderOverworldMapZoomed = o; return { u, cam:owZoomLastCam && { x:+owZoomLastCam.x.toFixed(1), y:+owZoomLastCam.y.toFixed(1) }, cp:+(owZoomLastCellPx||0).toFixed(2), cw:GLOBE.lastCW, rect:GLOBE.pu.uRect.value.toArray().map(v=>+v.toFixed(3)) }; });
      if (d.u) require('fs').writeFileSync(SHOTS + '/zseam-' + e + '-' + z + '-chart.png', Buffer.from(d.u.split(',')[1], 'base64')); delete d.u; console.log('  chart', JSON.stringify(d)); } }
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};
