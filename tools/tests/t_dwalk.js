// RS-171: walking round a dungeon - an even stride on diagonals, the camera leads a little ahead of you,
// pillars dissolve in the cutaway like walls, and on a phone you stand in the middle of the clear view
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); hudLayout();
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const out = { iso:isoOn() };
    // the stride: frames to cross a straight and a diagonal step, and how even the pace is along the way
    const keepDt = FP.dt; FP.dt = 0.016;
    const stride = (tx, ty)=>{ const pos = { x:0.5, y:0.5 }; let n = 0, lo = 9, hi = 0, px = 0.5, py = 0.5;
      while ((pos.x!==tx || pos.y!==ty) && n < 200){ isoGlide(pos, tx, ty); n++; const s = Math.hypot(pos.x-px, pos.y-py); if (pos.x!==tx || pos.y!==ty){ lo = Math.min(lo, s); hi = Math.max(hi, s); } px = pos.x; py = pos.y; }
      return { n, even:+(hi/lo).toFixed(3) }; };
    out.straight = stride(1.5, 0.5); out.diag = stride(1.5, 1.5);
    // two diagonals in a row, the second set when the first is three quarters done: no lurch to catch up
    { const pos = { x:0.5, y:0.5 }; let hi = 0, lo = 9, px = 0.5, py = 0.5;
      for (let i=0;i<14;i++){ isoGlide(pos, 1.5, 1.5); const s = Math.hypot(pos.x-px, pos.y-py); lo = Math.min(lo, s); hi = Math.max(hi, s); px = pos.x; py = pos.y; }
      for (let i=0;i<10;i++){ isoGlide(pos, 2.5, 2.5); const s = Math.hypot(pos.x-px, pos.y-py); lo = Math.min(lo, s); hi = Math.max(hi, s); px = pos.x; py = pos.y; }
      out.chain = +(hi/lo).toFixed(3); }
    // the camera leads: you're mid-step toward the tile to the east, so the focus drifts ahead of you
    const e = ISO.player, p = G.player;
    if (e && e.pos){ const tx = p.x+0.5, ty = p.y+0.5; FP.dt = 0.05;
      for (let i=0;i<30;i++){ e.pos.x = tx - 0.5; e.pos.y = ty; e.pos.mv = 1; isoCamera(FPD.cam, FPD.cam.aspect); }
      out.lead = { x:+ISO.lead.x.toFixed(2), y:+ISO.lead.y.toFixed(2) };
      for (let i=0;i<60;i++){ e.pos.x = tx; e.pos.y = ty; e.pos.mv = 0; isoCamera(FPD.cam, FPD.cam.aspect); }
      out.settle = +Math.hypot(ISO.lead.x, ISO.lead.y).toFixed(2); }
    FP.dt = keepDt;
    // pillars and the ceiling's ribs take the cutaway, like the walls
    const cutKeys = Object.keys(FPD.mats||{}).filter(k=>/:(trim|wall)$/.test(k)).map(k=>[k, !!(FPD.mats[k].customProgramCacheKey && FPD.mats[k].customProgramCacheKey()==='fpdcut')]);
    out.cut = cutKeys;
    // framing: you stand in the middle of the gap between the clock bar and the d-pad
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const pr = isoProject(e.pos.x, e.pos.y, 0.45), cr = canvas.getBoundingClientRect(), sy = cr.top + pr.sy/canvas.height*cr.height;
    out.frame = { gap:HUD_GAP.on, top:Math.round(HUD_GAP.top), bot:Math.round(HUD_GAP.bot), shift:isoFrameShift(), y:Math.round(sy), mid:Math.round((HUD_GAP.top + HUD_GAP.bot)/2) };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.iso, 'the dungeon is in the 3D view');
  A(Math.abs(r.diag.n - r.straight.n) <= 1 && r.diag.even < 1.05 && r.straight.even < 1.05, 'a diagonal step takes the same time as a straight one, at an even pace');
  A(r.chain < 1.25, 'one diagonal after another walks evenly, with no lurch to catch up');
  A(r.lead && r.lead.x > 0.4 && Math.abs(r.lead.y) < 0.1, 'the camera leads a little in the way you walk');
  A(r.settle < 0.05, 'and settles back over you when you stop');
  A(r.cut.length >= 2 && r.cut.every(c=>c[1]), 'walls and pillars both dissolve in the cutaway');
  A(r.frame.gap && r.frame.shift > 0 && Math.abs(r.frame.y - r.frame.mid) < 40, 'on a phone you stand in the middle of the clear view');
};
module.exports.mobile = true;
