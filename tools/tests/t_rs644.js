// RS-644: more of a Planet's world in its place on the turned faces. A bridge's tiles are the world's, and it was built as if they were the
// 3D land's frame (out in the sea); a town's people and size and a site's own look were read at its frame tile; a ferry's pier ran toward
// the water's side in the world, not in the frame. And on the globe's chart a name drawn by two faces' charts turned by each one's own angle,
// so its halves didn't meet over the seam: now each name turns by the grid's angle where it is, the same in both. Shot: shots/rs644-map.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; await fr(30);
    const out = {}, W = OW_COLS, H = OW_ROWS, N = cubeN(), m = G.ow.map;
    /* a bridge on a turned face: stood by it, its planks are on its tiles in the frame */
    { const b = (G.ow.bridges||[]).find(b=>b.tiles.length && cubeFace(b.tiles[0][0], b.tiles[0][1]) >= 0 && cubeFace(b.tiles[0][0], b.tiles[0][1])!==1);
      if (!b) out.bridge = { none:true };
      else { const [bx, by] = b.tiles[0]; let at = null; for (let rr=1; rr<6 && !at; rr++) for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){ const q = owNb(bx, by, dx*rr, dy*rr); if (q && m[q[0]][q[1]]!==OW_WATER && m[q[0]][q[1]]!==OW_MOUNTAIN && !OW_SITE_TILES.includes(m[q[0]][q[1]])){ at = q; break; } }
        G.owPos = { x:(at||[bx, by])[0], y:(at||[bx, by])[1] }; await fr(220);
        const plank = o3WgMat('plank', '#7a5634'), spots = [], want = b.tiles.map(([x, y])=>o3L(x, y)).filter(Boolean);
        (O3.wgGrp||{ traverse(){} }).traverse(o=>{ if (o.isMesh && o.material===plank && o.parent && Math.abs(o.parent.position.y - 0.06) < 1e-6) spots.push([o.parent.position.x - 0.5, o.parent.position.z - 0.5]); });
        const on = want.filter(([x, y])=>spots.some(([a, c])=>Math.abs(a - x) < 0.01 && Math.abs(c - y) < 0.01)).length, stray = spots.filter(([a, c])=>!(G.ow.bridges||[]).some(bb=>bb.tiles.some(([x, y])=>{ const l = o3L(x, y); return l && Math.abs(l[0] - a) < 0.01 && Math.abs(l[1] - c) < 0.01; }))).length;
        out.bridge = { face:cubeFace(bx, by), frame:O3F.face, tiles:want.length, on, stray, spots:spots.length }; } }
    /* a town on a turned face: its people and size read at its tile in the world */
    { const tp = Object.values(G.ow.townPositions||{}).filter(t=>t && cubeFace(t.x, t.y) >= 0 && cubeFace(t.x, t.y)!==1)[0];
      if (!tp) out.town = { none:true };
      else { o3FrameSet(cubeFace(tp.x, tp.y)); const l = o3L(tp.x, tp.y), seen = []; const tt = townTier, tf = townFlavorAt; townTier = (x, y)=>{ seen.push(['tier', x, y]); return tt(x, y); }; townFlavorAt = (x, y)=>{ seen.push(['flavor', x, y]); return tf(x, y); };
        try{ o3Site(OW_TOWN, l[0] + 0.5, l[1] + 0.5); } finally { townTier = tt; townFlavorAt = tf; }
        out.town = { frame:O3F.face, moved:l[0]!==tp.x || l[1]!==tp.y, calls:seen.length, right:seen.every(([, x, y])=>x===tp.x && y===tp.y) }; } }
    /* a ferry on a turned face: its pier runs out over the water in the frame */
    { const fs = (G.ow.pois||[]).filter(p=>p.k==='ferry' && cubeFace(p.x, p.y) >= 0 && cubeFace(p.x, p.y)!==1); let n = 0, wet = 0;
      for (const p of fs.slice(0, 8)){ o3FrameSet(cubeFace(p.x, p.y)); const l = o3L(p.x, p.y); if (!l) continue; const { g } = o3PoiModel(p), pier = g.children.find(c=>c.isGroup || c.type==='Group'); if (!pier) continue;
        const dx = Math.round(Math.sin(pier.rotation.y)), dy = Math.round(Math.cos(pier.rotation.y)); n++; if (o3Tile(l[0] + dx, l[1] + dy)===OW_WATER) wet++; }
      out.ferry = { n, wet }; }
    o3FrameSet(cubeFace(G.owPos.x, G.owPos.y)); await fr(30);
    /* the globe's chart over a seam: each name the same in every face's chart that draws it */
    { toggleOwZoom(); await fr(10); G.owZoomScale = 3; await fr(3); GLOBE.dist = GLOBE.distGoal; globeFace(2*N, Math.round(1.5*N)); await fr(20);   /* (looking at the seam between the front face and the east one) */
      const own = Object.prototype.hasOwnProperty.call(ctx, 'fillText'), P0 = ctx.fillText, gp = globeCubePatch, rec = {}; let cur = -1;   /* (the game's own fillText on the context, if it has one) */
      ctx.fillText = function(t, x, y, mw){ if (cur >= 0 && GLOBE.decal){ const M = this.getTransform(), s = Math.hypot(M.a, M.b), q = 1/(s*cellPx), gx = owZoomLastCam.x + (M.a*x + M.c*y + M.e)*q, gy = owZoomLastCam.y + (M.b*x + M.d*y + M.f)*q;
        (rec[t] = rec[t] || []).push({ k:cur, an:Math.atan2(M.b, M.a), x:gx, y:gy }); } return P0.apply(this, arguments); };
      globeCubePatch = function(k){ cur = k; try{ return gp.apply(this, arguments); } finally { cur = -1; } };
      try{ for (const P of (GLOBE.cpatch||[])) if (P) P.on = false; GLOBE.cview = null; for (let i=0;i<80;i++){ await fr(1); if (i > 20 && !GLOBE.cpend && !GLOBE.cq.length) break; } }   /* (RS-659: until every face's chart is drawn again - at 190 Hz twelve frames were less than the charts' 60 ms look) */ finally { if (own) ctx.fillText = P0; else delete ctx.fillText; globeCubePatch = gp; }
      let pairs = 0, off = 0, worst = 0; for (const t in rec){ const a = rec[t], ks = new Set(a.map(v=>v.k)); if (ks.size < 2 || t.length < 4) continue;
        for (const u of a) for (const v of a){ if (u.k >= v.k || Math.hypot(u.x - v.x, u.y - v.y) > 0.5) continue; pairs++; const d = Math.abs(((u.an - v.an) % (Math.PI*2) + Math.PI*3) % (Math.PI*2) - Math.PI); worst = Math.max(worst, d); if (d > 0.02) off++; } }
      const multi = Object.entries(rec).filter(([t, a])=>new Set(a.map(v=>v.k)).size > 1).map(([t, a])=>[t, a.map(v=>[v.k, +v.x.toFixed(1), +v.y.toFixed(1), +v.an.toFixed(2)])]).slice(0, 6);
      out.names = { pairs, off, worst:+worst.toFixed(3), faces:(GLOBE.cpatch||[]).map((P, k)=>P && P.on ? k : -1).filter(k=>k >= 0), texts:Object.keys(rec).length, multi }; }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs644-map.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  if (!r.bridge.none) A(r.bridge.frame!==1 && r.bridge.tiles > 0 && r.bridge.on===r.bridge.tiles && r.bridge.stray===0, 'a bridge on a turned face stands on its own tiles, and no plank is out at sea');
  if (!r.town.none) A(r.town.moved && r.town.calls >= 1 && r.town.right, 'a town on a turned face is built by its tile in the world');
  A(r.ferry.n===0 || r.ferry.wet===r.ferry.n, 'a ferry\'s pier runs out over the water');
  A(r.names.pairs >= 3 && r.names.off===0, 'a name drawn by two faces\' charts turns the same in both');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
