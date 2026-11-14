// (probe, not in ALL) walking a dungeon floor with a save (ZSAVE) at real frame rate: frame intervals, the slow frames, and a CPU profile's
// top functions inside them. ZDEPTH sets the floor (default 3)
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = process.env.ZSAVE ? fs.readFileSync(process.env.ZSAVE, 'utf8') : null;
  await page.evaluate(async ([txt, depth, basic])=>{ window.__noWarmSlice = false; window.__zBasic = basic;
    if (txt){ const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); } else { goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); }
    setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1, bd = 1e9; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ const d = Math.abs(x - G.owPos.x) + Math.abs(y - G.owPos.y); if (d < bd){ bd = d; dx = x; dy = y; } }
    G.interior = null; G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.dungeonMaxDepth = Math.max(G.dungeonMaxDepth, depth + 1);
    if (window.__zBasic && FPD.r){ FPD.r.shadowMap.type = THREE.BasicShadowMap; } G.dgCache = {}; loadLevel(depth, false, false); setUi('playing'); G.player.hp = G.player.maxHp = 99999; G.mon.forEach(m=>{ m.alive = 0; });
  }, [txt, +(process.env.ZDEPTH || 3), !!process.env.ZBASIC]);
  await page.evaluate(()=>{ window.__wm = []; const wr = gfxWarmRender; gfxWarmRender = function(r, scene, cam){ const W = FPD.warmWait, m = W && W.mats[W.i-1], t = performance.now(); const out = wr.apply(this, arguments);
      const dt = performance.now() - t; if (m && dt > 30){ let who = ''; scene.traverse(o=>{ if (!who && o.material===m){ let p = o, path = []; while (p && p!==scene){ path.unshift(p.name || p.type); p = p.parent; } who = path.slice(-4).join('/'); } }); window.__wm.push([+dt.toFixed(0), m.type, m.name || '', (m.customProgramCacheKey && m.customProgramCacheKey()) || '', who, !!m.map, m.transparent ? 'T' : '']); } return out; }; });
  await page.waitForTimeout(6000);
  // a long walk: every room in turn
  await page.evaluate(()=>{ const R = G.genRooms || []; window.__walkQ = R.map(r=>[r.x + (r.w>>1), r.y + (r.h>>1)]); window.__fr = []; let last = performance.now();
    const loop = ()=>{ const t = performance.now(); window.__fr.push([+(t - last).toFixed(1), G.player.x, G.player.y]); last = t;
      if (!ISO.path.length && window.__walkQ.length){ const [x, y] = window.__walkQ.shift(); ISO.path = isoFindPath(x, y, false) || []; ISO.nextStep = 0; }
      if (window.__walkOn) requestAnimationFrame(loop); };
    window.__walkOn = true; requestAnimationFrame(loop); });
  const cdp = await page.context().newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:200 }); await cdp.send('Profiler.start');
  const t0 = Date.now(); while (Date.now() - t0 < 40000){ await page.waitForTimeout(1000); const left = await page.evaluate(()=>window.__walkQ.length + ISO.path.length); if (!left) break; }
  const { profile } = await cdp.send('Profiler.stop');
  const fr = await page.evaluate(()=>{ window.__walkOn = false; return window.__fr; });
  const iv = fr.map(f=>f[0]).slice(5).sort((a,b)=>a-b), q = p=>iv[Math.floor(iv.length*p)];
  console.log('frames', JSON.stringify({ n:iv.length, p50:q(0.5), p90:q(0.9), p99:q(0.99), max:iv[iv.length-1], over50:iv.filter(v=>v>50).length, over100:iv.filter(v=>v>100).length }));
  console.log('slow', JSON.stringify(fr.filter(f=>f[0] > 50).slice(0, 30)));
  // the profile: total self time per function, and inside the slow frames' windows
  const nodes = new Map(profile.nodes.map(n=>[n.id, n])), self = new Map(), parent = new Map(); for (const n of profile.nodes) for (const c of (n.children||[])) parent.set(c, n.id);
  let t = profile.startTime; const samples = profile.samples, dts = profile.timeDeltas, slowSelf = new Map(), slowIncl = new Map();
  // the slow windows in profile time: frames are in page time - approximate by the biggest gaps between samples of the main thread is hard, so take samples whose stack holds a long task (>50ms of consecutive non-idle)
  let run = [], runT0 = 0; const flush = ()=>{ const dur = run.length ? run[run.length-1][0] - runT0 : 0; if (dur > 50) for (const [, id] of run){ const n = nodes.get(id), nm = n.callFrame.functionName || '(anon)'; slowSelf.set(nm, (slowSelf.get(nm)||0) + 0.2); const seen = new Set(); for (let p = id; p!==undefined; p = parent.get(p)){ const f = nodes.get(p).callFrame.functionName || '(anon)'; if (seen.has(f)) continue; seen.add(f); slowIncl.set(f, (slowIncl.get(f)||0) + 0.2); } } run = []; };
  for (let i=0;i<samples.length;i++){ t += dts[i]; const n = nodes.get(samples[i]), nm = n.callFrame.functionName || '(anon)'; self.set(nm, (self.get(nm)||0) + dts[i]/1000);
    const idle = nm==='(idle)' || nm==='(program)' || nm==='(garbage collector)'; if (idle){ flush(); } else { if (!run.length) runT0 = t/1000; run.push([t/1000, samples[i]]); } }
  flush();
  const top = (m, k)=>[...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0, k).map(([f, v])=>f + ' ' + v.toFixed(0));
  console.log('lights', JSON.stringify(await page.evaluate(()=>{ let pl = 0, ps = 0, vis = 0, sl = 0, dl = 0, pad = 0; FPD.scene.traverse(o=>{ if (o.isPointLight){ pl++; if (o.visible) vis++; if (o.castShadow && o.visible) ps++; if (o.userData.padL) pad++; } if (o.isSpotLight) sl++; if (o.isDirectionalLight) dl++; }); return { pl, vis, ps, pad, sl, dl, ceil:FPD.lightCeil, shadowMap:FPD.r.shadowMap.enabled, type:FPD.r.shadowMap.type }; })));
  console.log('warmMats', JSON.stringify(await page.evaluate(()=>window.__wm.sort((a,b)=>b[0]-a[0]).slice(0, 25))));
  console.log('selfAll', JSON.stringify(top(self, 15)));
  console.log('slowSelf', JSON.stringify(top(slowSelf, 20)));
  console.log('slowIncl', JSON.stringify(top(slowIncl, 30)));
};
