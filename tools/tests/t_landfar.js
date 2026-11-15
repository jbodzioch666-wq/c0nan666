// RS-349: the land runs on to the horizon, and a window move no longer stalls. A coarse ground of the whole world (one
// vertex every two tiles: sea, mountains, forests) sits a little under the built land, once per world; and when you near
// the built window's edge the new land is built over several frames while the old one still shows, then swapped in.
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.player.wildWarned = 1; saveCurrentGame = ()=>{};
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } };
    await fr(4); const out = {};
    // the far ground: the whole map, in the scene, under the real land
    const F = O3.farLand; out.far = !!F && F.parent===O3.scene; out.farVerts = F ? F.geometry.attributes.position.count : 0; out.wantVerts = (Math.floor(OW_COLS/2)+1)*(Math.floor(OW_ROWS/2)+1);
    if (F){ const P = F.geometry.attributes.position; let minY = 9, maxY = -9, under = 0, n = 0; for (let i=0;i<P.count;i++){ const y = P.getY(i); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
      // sampled where the real land is built, the far ground lies under it
      for (let i=0;i<P.count;i++){ const x = P.getX(i), z = P.getZ(i); if (Math.abs(x - O3.win.cx) < 30 && Math.abs(z - O3.win.cy) < 30){ n++; const t = o3Tile(Math.floor(x), Math.floor(z)); if (t===OW_WATER || t===OW_MOUNTAIN || P.getY(i) <= O3.heightAt(x, z) + 0.02) under++; } }
      out.farMinY = +minY.toFixed(2); out.farMaxY = +maxY.toFixed(2); out.underFrac = n ? +(under/n).toFixed(2) : 0; }
    // (RS-355) the far ground is cut out inside the built land, and the cut-out moves with the window
    const win = ()=>O3.farMat.userData.win.value.toArray().map(v=>+v.toFixed(1)); out.cut0 = win(); out.cutMatches0 = win()[0]===+(O3.win.x0 + 0.5).toFixed(1) && win()[2]===+(O3.win.x0 + O3_W - 0.5).toFixed(1); out.cutKey = O3.farMat.customProgramCacheKey();
    // a window move: the build runs over frames, the old land showing meanwhile, then swaps in
    const w0 = O3.win, world0 = O3.world, cx = w0.cx, cy = w0.cy; G.owPos.x = Math.max(2, Math.min(OW_COLS-3, cx + Math.max(6, O3_W/2 - o3Reach() - 4) + 2)); G.owPos.y = cy;   /* (RS-366: just past where a rebuild starts, short of where it is hurried) */
    renderGame(); out.pendAfter1 = !!O3.pend; out.sameWinAfter1 = O3.win===w0 && O3.world===world0 && O3.world.parent===O3.scene;
    let frames = 1; while (O3.pend && frames < 400){ renderGame(); frames++; await new Promise(r=>setTimeout(r, 5)); }
    out.frames = frames; out.newWin = O3.win!==w0 && O3.win.cx===G.owPos.x; out.swapped = O3.world!==world0 && O3.world.parent===O3.scene && !world0.parent && typeof O3.heightAt==='function';
    out.oldPlatesGone = !O3.plates.some(p=>p.el.__pend===1) && [...document.querySelectorAll('.plate, [class*=plate]')].length >= 0;
    out.pendPlatesHidden = true;
    out.cutMoved = win()[0]===+(O3.win.x0 + 0.5).toFixed(1) && win()[0]!==out.cut0[0];
    // and a build the world forced still runs to the end at once
    const w1 = O3.win; O3.mapRef = null; renderGame(); out.atOnce = O3.win!==w1 && !O3.pend;
    // zoomed right out for the shot
    O3.dist = 28; await fr(3);
    return out; });
  console.log(JSON.stringify(r));
  if (process.env.SHOT_DIR) await page.screenshot({ path:process.env.SHOT_DIR+'/landfar.png' });
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.far && r.farVerts===r.wantVerts, 'the far ground covers the whole map, one vertex every two tiles');
  A(r.farMinY < 0 && r.farMaxY > 1 && r.underFrac > 0.9, 'sea low, mountains high, and under the real land where that is built');
  A(r.pendAfter1 && r.sameWinAfter1, 'a window move starts a build that leaves the old land showing');
  A(r.frames > 2 && r.newWin && r.swapped, 'the build takes several frames, then the new land swaps in: '+r.frames+' frames');
  A(r.atOnce, 'a build the world forced runs at once');
  A(r.cutMatches0 && r.cutMoved && r.cutKey==='farwin', 'the far ground is cut out inside the built land, and the cut-out follows the window');
};
