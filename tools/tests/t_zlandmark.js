// (probe, not in ALL) a Planet's landmarks in the 3D land: for each, stood some way off it on land - where it is in the world and the frame, the
// ground under it, whether it's inside the land built round you, which of its models shows - with a shot (shots/zlandmark-<kind>.png); ZTIER
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async t=>{ goToCharCreate(); ccBegin(); setWorldSizeTier(t); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; G.player.hasBoat = 1;
    for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); }, process.env.ZTIER || 'planet');
  const lms = await page.evaluate(()=>owGeo().landmarks.map(l=>({ id:l.id, kind:l.kind, x:l.x, y:l.y, tile:G.ow.map[l.x][l.y], face:owCube() ? cubeFace(l.x, l.y) : -1 })));
  console.log('landmarks', JSON.stringify(lms));
  const dists = (process.env.ZDIST || '12').split(',').map(Number);
  for (const lm0 of lms) for (const r0 of dists){ const lm = Object.assign({}, lm0, { r0 }); if (process.env.ZKIND && !process.env.ZKIND.split(',').includes(lm.kind)) continue;
    const r = await page.evaluate(async lm=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
      /* a land tile some 12 to 20 steps off it */
      const R0 = lm.r0 || 12; let at = null; for (let rr=R0; rr<R0 + 10 && !at; rr++) for (let a=0; a<16 && !at; a++){ const q = owNb(lm.x, lm.y, Math.round(Math.cos(a*Math.PI/8)*rr), Math.round(Math.sin(a*Math.PI/8)*rr)); if (q && [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA].includes(G.ow.map[q[0]][q[1]])) at = q; }
      if (!at && lm.r0 > 20){ for (let rr=lm.r0; rr<lm.r0 + 10 && !at; rr++) for (let a=0; a<16 && !at; a++){ const q = owNb(lm.x, lm.y, Math.round(Math.cos(a*Math.PI/8)*rr), Math.round(Math.sin(a*Math.PI/8)*rr)); if (q && G.ow.map[q[0]][q[1]]===OW_WATER) at = q; } }   /* (or out at sea) */
      if (!at) return { none:true }; G.owPos = { x:at[0], y:at[1] }; owReveal(at[0], at[1], 20); await fr(240);
      const o = (O3.lmObjs||[]).find(o=>o.lm.id===lm.id), l = o3L(lm.x, lm.y), pl = o3PL();
      return { lm:lm.kind, at, frame:O3F.face, inFrame:l, pl:[pl.x, pl.y], tileThere:l ? o3Tile(l[0], l[1]) : null, worldTile:G.ow.map[lm.x][lm.y], vis:o ? o.g.visible : null, pos:o ? [+o.g.position.x.toFixed(1), +o.g.position.y.toFixed(1), +o.g.position.z.toFixed(1)] : null,
        far:o && o.anim.far ? o.anim.far.visible : null, volc:!!O3.volc, win:O3.win ? [O3.win.x0, O3.win.y0] : null, W:O3_W, d:l ? +Math.hypot(l[0] - pl.x, l[1] - pl.y).toFixed(1) : null }; }, lm);
    console.log(lm.kind, r0, JSON.stringify(r)); if (!r.none) await page.screenshot({ path: SHOTS + '/zlandmark-' + lm.kind + '-' + r0 + '.png' }); }
  if (errs.length) console.log('ERRORS', errs.slice(0, 5).join(' | '));
};
