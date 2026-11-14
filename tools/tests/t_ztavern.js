// (probe, not in ALL) a tavern inside at night: frame and CPU times, draw calls, then with each suspect taken out in turn - the hearth fire,
// the hearth's cook rigs, the people, the lamps' shadows
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.95;
    const fr = async n=>{ const f = [], cpu = []; let last = performance.now(); for (let i=0;i<n;i++){ const a = performance.now(); renderGame(); cpu.push(performance.now() - a); await new Promise(r=>requestAnimationFrame(r)); const now = performance.now(); f.push(now - last); last = now; } return { f, cpu }; };
    await fr(60); enterInterior('tavern'); setUi('playing'); await fr(300);
    const stat = async nm=>{ await fr(30); const s = await fr(120); const F = s.f.slice().sort((a, b)=>a - b), C = s.cpu.slice().sort((a, b)=>a - b), R = V3.renderer;
      R.info.autoReset = false; R.info.reset(); renderGame(); await new Promise(r=>requestAnimationFrame(r)); const calls = R.info.render.calls, tris = R.info.render.triangles; R.info.autoReset = true;
      let lights = 0, sh = 0; V3.scene.traverse(o=>{ if (o.isLight && o.visible && o.intensity > 0){ lights++; if (o.castShadow) sh++; } });
      return { nm, median:+F[F.length>>1].toFixed(1), p90:+F[Math.floor(F.length*0.9)].toFixed(1), cpu:+C[C.length>>1].toFixed(1), cpu90:+C[Math.floor(C.length*0.9)].toFixed(1), calls, tris, lights, shadowLights:sh, progs:R.info.programs.length }; };
    const out = [await stat('tavern')];
    { const heavy = []; V3.scene.traverse(o=>{ if (!o.isMesh || !o.visible) return; let v = true, q = o; while (q){ if (!q.visible){ v = false; break; } q = q.parent; } if (!v) return; const g = o.geometry, tri = (g.index ? g.index.count : g.attributes.position.count)/3*(o.isInstancedMesh ? o.count : 1);
        let top = o; const path = []; while (top.parent && top.parent!==V3.scene){ top = top.parent; } heavy.push([(o.name || g.type) + ' in ' + (top.name || top.type) + (top.userData && top.userData.kind ? ':' + top.userData.kind : ''), Math.round(tri), o.castShadow ? 'sh' : '']); });
      const by = new Map(); for (const h of heavy){ const k = h[0]; const e = by.get(k) || [0, 0]; e[0] += h[1]; e[1]++; by.set(k, e); }
      out.push({ heavy:[...by.entries()].sort((a, b)=>b[1][0] - a[1][0]).slice(0, 15) }); }
    const fires = V3.flames.filter(f=>f.userData.hearthFire); out[0].fires = fires.length; out[0].flames = V3.flames.length; out[0].cooks = (V3.hearthCook||[]).length;
    const hide = (list, on)=>list.forEach(o=>o.visible = on);
    hide(fires, false); out.push(await stat('no hearth fire (hidden)')); hide(fires, true);
    const F0 = V3.flames; V3.flames = F0.filter(f=>!f.userData.hearthFire); out.push(await stat('hearth fire not animated')); V3.flames = F0;
    const ck = V3.hearthCook; V3.hearthCook = []; out.push(await stat('no cook sync')); V3.hearthCook = ck;
    const ppl = (V3.people||[]).map(p=>p.g).filter(Boolean); hide(ppl, false); out.push(await stat('no people')); hide(ppl, true);
    /* a CPU profile of a few frames, by function */
    return out; });
  for (const x of r) console.log(JSON.stringify(x));
  const cdp = await page.context().newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:200 }); await cdp.send('Profiler.start');
  await page.evaluate(async ()=>{ for (let i=0;i<150;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } });
  const { profile } = await cdp.send('Profiler.stop'); const self = new Map(), dt = profile.timeDeltas, byId = new Map(profile.nodes.map(n=>[n.id, n]));
  for (let i=0;i<profile.samples.length;i++){ const n = byId.get(profile.samples[i]), k = n.callFrame.functionName + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k)||0) + (dt[i]||0)); }
  console.log([...self.entries()].sort((a, b)=>b[1] - a[1]).slice(0, 25).map(([k, v])=>k + ' ' + (v/1000).toFixed(0) + 'ms').join('\n'));
};
