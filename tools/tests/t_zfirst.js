// (probe, not in ALL) the first arrival: every v3/o3/m3d/gfx function wrapped, inclusive time and calls, for the first town build and
// the first step out onto the land (ZLAND=1 for the land only); the top of each list
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async land=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } };
    const P = {}; const names = Object.getOwnPropertyNames(window).filter(n=>/^(v3|o3|m3d|gfx|fp|town|ow|sk3|mp)[A-Za-z0-9_]*$/.test(n) && typeof window[n]==='function' && !/^(v3Render|o3Render|renderGame|gfxRender|gfxRenderInner)$/.test(n));
    for (const n of names){ const f = window[n]; if (f.prototype && Object.keys(f.prototype).length) continue; const w = function(){ const t0 = performance.now(); try{ return f.apply(this, arguments); } finally { const d = performance.now() - t0; const p = P[n] || (P[n] = { ms:0, n:0, max:0 }); p.ms += d; p.n++; if (d > p.max) p.max = d; } }; w.prototype = f.prototype; try{ window[n] = w; }catch(e){} }
    const top = k=>Object.entries(P).filter(([n, p])=>p.ms > 8).sort((a, b)=>b[1].ms - a[1].ms).slice(0, k).map(([n, p])=>n + ' ' + Math.round(p.ms) + 'ms x' + p.n + ' max ' + Math.round(p.max));
    const out = {}; const frames = [];
    const step = async (label, act, n)=>{ for (const k in P) delete P[k]; act(); let last = performance.now(); const f = []; for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const now = performance.now(); f.push(Math.round(now - last)); last = now; } f.sort((a, b)=>b - a); out[label] = { worst:f.slice(0, 6), top:top(28) }; };
    if (!land){ const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; await step('first town', ()=>{ enterVillage(); setUi('playing'); }, 200); G.gameMode = 0; G.villageNpcs = []; }
    await step('first land', ()=>{ G.gameMode = 0; setUi('playing'); }, 200);
    return out; }, !!process.env.ZLAND);
  for (const k in r){ console.log('== ' + k + ' worst frames ' + r[k].worst.join(' ')); for (const l of r[k].top) console.log('   ' + l); }
};
