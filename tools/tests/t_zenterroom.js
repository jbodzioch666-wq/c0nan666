// (probe, not in ALL) stepping into a building the way you really do: standing a few tiles from the tavern door for a while first (the
// door prewarm paints its boards), then in. Every v3/m3d/gfx function wrapped; prints the frames over 16ms from the step in with what ran
// in them, and the driver link stalls by program (with the warm batch's material when one is in a warm draw). ZSAVE a save; ZROOM a key
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8'), room = process.env.ZROOM || 'tavern';
  const r = await page.evaluate(async ([txt, room])=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; setUi('playing');
    G.interior = null; const t = G.ow.spawnPos; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>{ renderGame(); ++i >= n ? res() : requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const t0 = performance.now(); while (performance.now() - t0 < 30000){ await fr(1); if (!V3.warmWait && !V3.prelink && !V3.peopleQ && performance.now() - t0 > 3000) break; }
    /* stand five tiles from the door, long enough for the prewarm */
    const b = VILLAGE_BUILDINGS.find(x=>x.key===room) || VILLAGE_BUILDINGS[0], dr = b.door; G.player.x = dr.x; G.player.y = Math.min(ROWS - 2, dr.y + 5); const t1 = performance.now(); while (performance.now() - t1 < 5000) await fr(1);
    const warmed = !!(V3.warm && V3.warm[b.key]), texReady = Object.keys(V3_INT_TEX||{}).filter(k=>k.startsWith('mats:' + b.key)).length, texKeys = Object.keys(V3_INT_TEX||{}).slice(0, 8);
    let matsErr = null; try{ v3InteriorMats(b.key, V3.mats); }catch(e){ matsErr = String(e.stack || e).slice(0, 300); }   /* (what the prewarm's go() would have hit, its error swallowed) */
    const texAfter = Object.keys(V3_INT_TEX||{}).filter(k=>k.startsWith('mats:'));
    const matKeyOut = (G.villageRace||'human') + '|' + G.villageTheme, matCache = v3Materials.cache ? [...v3Materials.cache.keys()] : null;
    /* wrap */
    const names = Object.getOwnPropertyNames(window).filter(n=>/^(v3|m3d|gfx|sk3|iso)[A-Za-z0-9_]*$/.test(n) && typeof window[n]==='function' && !/^(renderGame|gfxRender|gfxRenderInner|v3Render)$/.test(n));
    let cur = null; const W = new Map();
    for (const n of names){ const f = window[n]; if (f.prototype && Object.keys(f.prototype).length) continue; const w = function(){ const tt = performance.now(); try{ return f.apply(this, arguments); } finally { const dt = performance.now() - tt; if (cur && dt > 1.5) cur.push([n, +dt.toFixed(1)]); } }; W.set(n, f); window[n] = w; }
    const sdfT = { part:0, run:0, mesh:0, uv:0 }, part0 = SDF.part; SDF.part = function(a2, b2, h){ const tt = performance.now(), P = part0.call(this, a2, b2, h); sdfT.part = Math.max(sdfT.part, performance.now() - tt); const run0 = P.run; P.run = function(){ const t2 = performance.now(), v = run0.apply(this, arguments); sdfT.run = Math.max(sdfT.run, performance.now() - t2); return v; }; return P; };
    const mg0 = SDF.meshGen; SDF.meshGen = function(P){ const it = mg0.call(this, P); return { next(){ const tt = performance.now(), v = it.next(); sdfT.mesh = Math.max(sdfT.mesh, performance.now() - tt); return v; } }; };
    const uv0 = window.m3dUV; window.m3dUV = function(){ const tt = performance.now(), v = uv0.apply(this, arguments); sdfT.uv = Math.max(sdfT.uv, performance.now() - tt); return v; };
    const folds = [], sf0 = window.m3dSkirtFollow; window.m3dSkirtFollow = function(r2){ const tt = performance.now(), v = sf0.apply(this, arguments); const dt = performance.now() - tt; if (dt > 8) folds.push([+dt.toFixed(1), !!r2.seatBox, r2.skirt && r2.skirt.geometry.attributes.position.count, !!(r2.skirt && r2.skirt.userData.own)]); return v; };
    const benches = {}, vb0 = window.v3Bench; window.v3Bench = function(k){ const tt = performance.now(), v = vb0.apply(this, arguments); const dt = performance.now() - tt; if (!benches[k] || dt > benches[k]) benches[k] = +dt.toFixed(1); return v; };
    const preSet = new Set(), pl0 = window.gfxPrelink; window.gfxPrelink = function(V, r2){ const before = new Set(r2.info.programs); const v = pl0.apply(this, arguments); for (const p of r2.info.programs) if (!before.has(p)) preSet.add(p); return v; };
    const stalls = [], gp = WebGL2RenderingContext.prototype.getProgramParameter, tw = performance.now();
    WebGL2RenderingContext.prototype.getProgramParameter = function(prog, pname){ const done = pname===0x8B86 ? gp.call(this, prog, 0x91B1) : null; const tt = performance.now(), v = gp.call(this, prog, pname); const dt = performance.now() - tt; if (dt > 4){ const Wm = V3.warmWait, m = Wm && Wm.mats[Wm.i - 1]; const pp = V3.renderer.info.programs.find(q=>q.program===prog); stalls.push([+dt.toFixed(0), prog, +((tt - tw)/1000).toFixed(2), (pp ? 'prelinked:' + preSet.has(pp) + ' used:' + pp.usedTimes + ' linkDoneBefore:' + done + ' ' : 'noprog ') + (m ? m.type + (m.name ? ':' + m.name : '') + ' ' + Object.keys(m.userData||{}).join('/') + ' obj:' + (m.__warmObj||'') : (Wm ? 'warm?' : 'real render'))]); } return v; };
    const spikes = []; const rg = renderGame; renderGame = function(){ const tt = performance.now(); cur = []; try{ return rg.apply(this, arguments); } finally { const dt = performance.now() - tt; if (dt > 16) spikes.push({ ms:+dt.toFixed(0), at:+((tt - tw)/1000).toFixed(2), in:cur.slice(0, 18) }); cur = null; } };
    /* in */
    enterInterior(b.key); setUi('playing'); const t2 = performance.now(); while (performance.now() - t2 < 15000){ await fr(1); if (!V3.warmWait && !V3.prelink && !V3.peopleQ && performance.now() - t2 > 2500) break; }
    renderGame = rg; for (const [n, f] of W) window[n] = f; WebGL2RenderingContext.prototype.getProgramParameter = gp; SDF.part = part0; SDF.meshGen = mg0; window.m3dUV = uv0; window.v3Bench = vb0; window.m3dSkirtFollow = sf0; window.gfxPrelink = pl0;
    const R = V3.renderer, sc = V3.scene, who = p=>{ let w = ''; sc.traverse(o=>{ if (w || !o.material) return; for (const m of [].concat(o.material)){ const pr = R.properties.get(m); if (pr && pr.currentProgram===p) w = (o.name || o.type) + '/' + m.type + (m.name ? ':' + m.name : '') + ' ' + Object.keys(m.userData||{}).join('/'); } }); return w; };
    return { room:b.key, warmed, texReady, texKeys, texAfter, matsErr, sdfT, benches, matKeyOut, matCache, matKeyIn:(G.villageRace||'human') + '|' + G.villageTheme, folds, spikes, stalls:stalls.map(([dt, prog, at, ctx])=>{ const p = R.info.programs.find(q=>q.program===prog); return dt + 'ms @' + at + 's ' + (p ? p.cacheKey.split(',')[0] + ' ' + who(p) : 'gone') + ' [' + ctx + ']'; }) }; }, [txt, room]);
  console.log('room', r.room, 'prewarmed', r.warmed, 'mats keys before', r.texReady, 'after', JSON.stringify(r.texAfter), 'matsErr', r.matsErr); console.log('sculpt steps max ms', JSON.stringify(r.sdfT), 'benches', JSON.stringify(r.benches)); console.log('mat key out', r.matKeyOut, 'in', r.matKeyIn, 'cache', JSON.stringify(r.matCache)); console.log('skirt folds over 8ms [ms, seated, verts, own]', JSON.stringify(r.folds));
  for (const s of r.spikes) console.log(s.ms + 'ms @' + s.at + 's  ' + s.in.map(([n, d])=>n + ' ' + d).join(' | '));
  console.log('link stalls', JSON.stringify(r.stalls));
};
