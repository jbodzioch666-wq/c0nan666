// RS-506: a tile changing somewhere on the map (a cleared site reclaimed by the wild, a new one rising, a bridge mended) rebuilds
// the land in the background, the way a walk's rebuild does - it used to rebuild the whole land in one frame, a 1.5s freeze at a
// phone's pace, then warm every shader again. Checked at a quarter of this machine's speed: a far tile changes, the worst frame
// stays a fraction of that, the rebuild is sliced, and once it lands the changed tile is part of the land
module.exports = async page=>{
  await page.evaluate(()=>{ window.__noWarmSlice = 0; });
  const cdp = await page.context().newCDPSession(page);
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; for (let i=0;i<30;i++){ renderGame(); await new Promise(r2=>setTimeout(r2, 40)); }
    let n = 0; while (O3.warmWait && n++ < 900){ await new Promise(r2=>requestAnimationFrame(r2)); renderGame(); } await new Promise(r2=>setTimeout(r2, 1500)); });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:4 });
  const r = await page.evaluate(async ()=>{
    let fx = -1, fy = -1; for (let x=5;x<OW_COLS-5 && fx<0;x++) for (let y=5;y<OW_ROWS-5;y++) if (G.ow.map[x][y]===OW_GRASS && Math.hypot(x - G.owPos.x, y - G.owPos.y) > 60){ fx = x; fy = y; break; }
    let atOnce = 0, sliced = 0; const ob = o3Build, os = o3BuildStart; o3Build = function(){ atOnce++; return ob.apply(this, arguments); }; o3BuildStart = function(){ sliced++; return os.apply(this, arguments); };
    const key0 = O3.mapKey; G.ow.map[fx][fy] = OW_FOREST; G.player.turnCount = (G.player.turnCount||0) + 1;
    const d = []; let last = performance.now(); const t0 = last;
    await new Promise(res=>{ const f = t=>{ d.push(t - last); last = t; renderGame(); if (t - t0 < 9000 && (t - t0 < 1500 || O3.pend)) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    o3Build = ob; o3BuildStart = os; d.shift();
    return { atOnce, sliced, worst:Math.round(Math.max(...d)), keyMoved:O3.mapKey!==key0, built:!O3.pend }; });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:1 });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.keyMoved && r.atOnce===0 && r.sliced >= 1, 'the change rebuilt the land in slices, not at once');
  A(r.built, 'and the rebuild landed');
  A(r.worst < 800, 'no frame froze anywhere near the old 1.5s');
};
