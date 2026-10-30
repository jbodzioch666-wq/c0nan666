// (probe, not in ALL) a fresh character's first dungeon, straight from the world preview with no land or town first: every frame over 25ms
// from the step in, with the m3d/fpd/gfx calls that ran in it (and M3D_COARSE at each m3dInstance), to find the one long sculpt
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>{ renderGame(); ++i >= n ? res() : requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const names = Object.getOwnPropertyNames(window).filter(n=>/^(m3d|fpd|gfx|sk3|lp|cc)[A-Za-z0-9_]*$/.test(n) && typeof window[n]==='function' && !/^(renderGame|gfxRender|gfxRenderInner)$/.test(n));
    let cur = null; const W = new Map(); for (const n of names){ const f = window[n]; if (f.prototype && Object.keys(f.prototype).length) continue; const w = function(){ const tt = performance.now(); try{ return f.apply(this, arguments); } finally { const dt = performance.now() - tt; if (cur && dt > 1.5) cur.push([n + (n==='m3dInstance' ? '@' + M3D_COARSE : ''), +dt.toFixed(1)]); } }; W.set(n, f); window[n] = w; }
    const spikes = [], tw = performance.now(), rg = renderGame; renderGame = function(){ const tt = performance.now(); cur = []; try{ return rg.apply(this, arguments); } finally { const dt = performance.now() - tt; if (dt > 25) spikes.push({ ms:+dt.toFixed(0), at:+((tt - tw)/1000).toFixed(2), in:cur.slice(0, 14) }); cur = null; } };
    let dx=-1, dy=-1, bd = 1e9; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ const d = Math.abs(x - G.owPos.x) + Math.abs(y - G.owPos.y); if (d < bd){ bd = d; dx = x; dy = y; } }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; const t0 = performance.now(); enterDungeonConfirm(); setUi('playing');
    while (performance.now() - t0 < 12000){ await fr(1); if (!FPD.warmWait && !FPD.prep && !FPD.prelink && performance.now() - t0 > 3000) break; }
    renderGame = rg; for (const [n, f] of W) window[n] = f;
    return { total:+(performance.now() - t0).toFixed(0), tpl:[...M3D.tpl.keys()].map(k=>k.slice(0, 60)), spikes }; });
  console.log('total', r.total, 'templates', JSON.stringify(r.tpl));
  for (const s of r.spikes) console.log(s.ms + 'ms @' + s.at + 's  ' + s.in.map(([n, d])=>n + ' ' + d).join(' | '));
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};
