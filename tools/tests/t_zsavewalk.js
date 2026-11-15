// (probe, not in ALL) a save (ZSAVE) loaded where it stands and walked room to room at real frame rate: frame intervals, the game's own
// 3D / GPU timers, draw calls, triangles, lights and shadow casters, and a CPU profile's top functions
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const info = await page.evaluate(async txt=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data || JSON.parse(txt); importSaveText(txt); const id = saveIndexList().slice(-1)[0].id; loadGame(id);
    setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999;
    for (let i=0;i<240;i++) await new Promise(r=>requestAnimationFrame(r));
    return { mode:G.gameMode, depth:G.depth, site:G.siteKind, theme:G.dungeonTheme || G.arenaTheme || null, size:COLS + 'x' + ROWS, mons:(G.mon||[]).filter(m=>m.alive).length, rooms:(G.genRooms||[]).length }; }, txt);
  console.log('at', JSON.stringify(info));
  /* standing still a moment, then walking every room in turn */
  const snap = async nm=>page.evaluate(async nm=>{ SET.fps = true; PROF.t = {}; PROF.gpuN = 0; const fr = []; let last = performance.now();
    for (let i=0;i<150;i++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(t - last); last = t; gfxGpuPoll(); }
    fr.sort((a, b)=>a - b); const n = 150, R = FPD.r; R.info.autoReset = false; R.info.reset(); renderGame(); const calls = R.info.render.calls, tris = R.info.render.triangles; R.info.autoReset = true;
    let lights = 0, shL = 0, casters = 0, pts = 0; FPD.scene.traverse(o=>{ if (o.isLight && o.visible && o.intensity > 0){ lights++; if (o.castShadow){ shL++; if (o.isPointLight) pts++; } } if (o.isMesh && o.visible && o.castShadow) casters++; });
    return { nm, med:+fr[n>>1].toFixed(1), p90:+fr[Math.floor(n*0.9)].toFixed(1), worst:+fr[n-1].toFixed(1), cpu3d:+((PROF.t['3d']||0)/n).toFixed(2), game:+((PROF.t.game||0)/n).toFixed(2),
      gpu:PROF.gpuN ? +(PROF.t.gpu/PROF.gpuN).toFixed(2) : null, sh:PROF.gpuN ? +((PROF.t.g_shadow||0)/PROF.gpuN).toFixed(2) : null, sc:PROF.gpuN ? +((PROF.t.g_scene||0)/PROF.gpuN).toFixed(2) : null,
      calls, tris, progs:R.info.programs.length, slow:fr.filter(x=>x > 50).length, lights, shadowLights:shL, pointShadows:pts, casters, shUpd:R.shadowMap.autoUpdate, at:[G.player.x, G.player.y] }; }, nm);
  console.log(JSON.stringify(await snap('standing')));
  console.log(JSON.stringify(await page.evaluate(()=>{ const by = new Map(); FPD.scene.traverse(o=>{ if (!o.isMesh || !o.visible) return; let v = true, q = o; while (q){ if (!q.visible){ v = false; break; } q = q.parent; } if (!v) return;
      const g = o.geometry, tri = Math.round((g.index ? g.index.count : g.attributes.position.count)/3*(o.isInstancedMesh ? o.count : 1)); let top = o; while (top.parent && top.parent!==FPD.scene) top = top.parent;
      const k = (o.name || g.type) + ' < ' + (top.name || top.type) + (o.castShadow ? ' [cast]' : ''); const e = by.get(k) || [0, 0]; e[0] += tri; e[1]++; by.set(k, e); });
    return { heavy:[...by.entries()].sort((a, b)=>b[1][0] - a[1][0]).slice(0, 14) }; })));
  console.log(JSON.stringify(await page.evaluate(()=>{ const out = []; FPD.scene.traverse(o=>{ if (!o.isMesh || !o.visible || !o.castShadow) return; const g = o.geometry, tri = Math.round((g.index ? g.index.count : g.attributes.position.count)/3); if (tri*(o.isInstancedMesh ? o.count : 1) < 3000 || (g.type!=='SphereGeometry' && g.type!=='CapsuleGeometry' && g.type!=='BufferGeometry')) return;
      const chain = []; let q = o; while (q && q!==FPD.scene){ chain.push((q.name || q.type) + (q.userData && (q.userData.d || q.userData.kind || q.userData.k) ? ':' + (q.userData.d || q.userData.kind || q.userData.k) : '')); q = q.parent; }
      const p = g.parameters || {}; out.push([g.type, tri, o.isInstancedMesh ? o.count : 1, o.name, JSON.stringify(p).slice(0, 80), o.material && (o.material.type + (o.material.transparent ? ' T' : '') + (o.material.emissive ? ' e' + o.material.emissiveIntensity : '')), chain.slice(0, 5).join(' < '), o.getWorldPosition(new THREE.Vector3()).toArray().map(v=>+v.toFixed(1))]); });
    return { big:out.slice(0, 25) }; })));
  console.log(JSON.stringify(await page.evaluate(()=>({ lan:!!(FPD.lan && FPD.lan.castShadow), lanMap:FPD.lan && FPD.lan.shadow.mapSize.x, torchMap:(FPD.torches||[]).map(L=>L.castShadow ? L.shadow.mapSize.x : 0), gfx:SET.gfx }))));
  await page.evaluate(()=>{ const fl = []; for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++) if (G.map[x][y]===T_FLOOR) fl.push([x, y]); let sd = 7; const rnd = ()=>{ sd = (sd*16807) % 2147483647; return sd/2147483647; }; window.__walkQ = []; for (let i=0;i<60;i++) window.__walkQ.push(fl[Math.floor(rnd()*fl.length)]); window.__walkOn = true;
    const loop = ()=>{ if (!ISO.path.length && window.__walkQ.length){ for (let k=0;k<8 && !ISO.path.length && window.__walkQ.length;k++){ const [x, y] = window.__walkQ.shift(); ISO.path = isoFindPath(x, y, false) || []; } ISO.nextStep = 0; } if (window.__walkOn) requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
  const cdp = await page.context().newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:250 });
  if (process.env.ZTHROTTLE) await cdp.send('Emulation.setCPUThrottlingRate', { rate:+process.env.ZTHROTTLE });   /* (ZTHROTTLE=4: the CPU slowed, nearer a phone's) */
  await cdp.send('Profiler.start');

  for (let k=0;k<5;k++) console.log(JSON.stringify(await snap('walking ' + k)));
  const { profile } = await cdp.send('Profiler.stop'); const self = new Map(), dt = profile.timeDeltas, byId = new Map(profile.nodes.map(n=>[n.id, n]));
  for (let i=0;i<profile.samples.length;i++){ const n = byId.get(profile.samples[i]), k = n.callFrame.functionName + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k)||0) + (dt[i]||0)); }
  const tot = [...self.values()].reduce((a, b)=>a + b, 0);
  console.log('profile (self ms over the walk, of ' + (tot/1000).toFixed(0) + '):\n' + [...self.entries()].sort((a, b)=>b[1] - a[1]).slice(0, +(process.env.ZTOP||22)).map(([k, v])=>'  ' + k + ' ' + (v/1000).toFixed(0)).join('\n'));
  await page.evaluate(()=>{ window.__walkOn = false; });
};
