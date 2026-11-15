// (probe, not in ALL) what the room's prelink costs once its programs exist: r.compile on the room's scene again (no new program), the
// number of objects and materials walked, and the time per kind of call inside three's compile. ZSAVE a save; ZROOM a key
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8'), room = process.env.ZROOM || 'tavern';
  const r = await page.evaluate(async ([txt, room])=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; setUi('playing');
    G.interior = null; const t = G.ow.spawnPos; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>{ renderGame(); ++i >= n ? res() : requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const settle = async ()=>{ const t0 = performance.now(); while (performance.now() - t0 < 30000){ await fr(1); if (!V3.warmWait && !V3.prelink && !V3.peopleQ && performance.now() - t0 > 2000) break; } };
    await settle(); const R0 = V3.renderer, before = new Set(R0.info.programs), lightsOut = []; V3.scene.traverse(o=>{ if (o.isLight) lightsOut.push(o.type + (o.castShadow ? '*' : '') + ':' + o.intensity.toFixed(2)); });
    enterInterior(room); setUi('playing'); await settle();
    const R = V3.renderer, sc = V3.scene, cam = V3.cam || V3.camera, lightsIn = []; sc.traverse(o=>{ if (o.isLight) lightsIn.push(o.type + (o.castShadow ? '*' : '') + ':' + o.intensity.toFixed(2)); });
    /* the programs made for the room: each one's material and object, and whether the material is one of the room's own (v3InteriorMats) */
    const im = new Set(Object.values(v3InteriorMats(room, V3.mats)||{})), fresh = [];
    for (const p of R.info.programs){ if (before.has(p)) continue; let w = null; sc.traverse(o=>{ if (w || !o.material) return; for (const m of [].concat(o.material)){ const pr = R.properties.get(m); if (pr && pr.currentProgram===p) w = (o.isSkinnedMesh ? 'skin ' : o.isInstancedMesh ? 'inst ' : o.isSprite ? 'sprite ' : o.isPoints ? 'points ' : '') + (o.name||'') + '/' + m.type + (m.name ? ':' + m.name : '') + ' ' + Object.keys(m.userData||{}).join('/') + (im.has(m) ? ' [room]' : ''); } });
      fresh.push((p.cacheKey.split(',')[0]) + ' ' + (w || 'none in scene (shadow/depth/post)')); }
    window.__fresh = fresh; window.__lights = { out:lightsOut, in:lightsIn }; let objs = 0, mats = new Set(); sc.traverse(o=>{ if (o.material){ objs++; [].concat(o.material).forEach(m=>mats.add(m)); } });
    const n0 = R.info.programs.length; const times = []; for (let i=0;i<3;i++){ const t0 = performance.now(); R.compile(sc, cam); times.push(+(performance.now() - t0).toFixed(1)); }
    const fg = sc.fog; sc.fog = null; const t1 = performance.now(); R.compile(gfxShadowKinds(sc), cam, sc); const shadowMs = +(performance.now() - t1).toFixed(1); sc.fog = fg;
    const t2 = performance.now(); gfxPrelink(V3, R, sc, cam); const preMs = +(performance.now() - t2).toFixed(1);
    /* the same scene, the materials deduplicated by their program key: how many distinct keys */
    const keys = new Set(); for (const m of mats){ try{ const p = R.properties.get(m); if (p && p.currentProgram) keys.add(p.currentProgram.cacheKey); }catch(e){} }
    return { objs, mats:mats.size, progs:n0, after:R.info.programs.length, compileMs:times, shadowMs, preMs, keys:keys.size, cam:!!cam, fresh:window.__fresh, lights:window.__lights }; }, [txt, room]);
  const { fresh, lights, ...rest } = r; console.log(JSON.stringify(rest)); console.log('lights out', JSON.stringify(lights.out)); console.log('lights in', JSON.stringify(lights.in)); console.log('programs made for the room:'); for (const f of fresh) console.log('  ' + f);
};
