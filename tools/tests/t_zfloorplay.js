// (probe, not in ALL) real play on one dungeon floor for a while: walking to the monsters and fighting them with your own blows, more
// coming in; every ten seconds the frame time and everything that could pile up - then leaving the floor and coming back
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 160)));
  await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = Number(window.__kit||0); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; SET.fps = true;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    G.dungeonMaxDepth = Math.max(G.dungeonMaxDepth, 3); loadLevel(2, false, false); setUi('playing');
    /* the fight: each frame, if a monster is beside you, strike it; else walk toward the nearest; now and then a fresh band comes in */
    const cl = typeof cloneMonsterTemplate==='function' ? null : null; window.__band = G.mon.filter(m=>m.alive).map(m=>Object.assign({}, m)); window.__play = true; window.__lastStep = 0;
    const loop = ()=>{ if (!window.__play) return; try{ const p = G.player, now = performance.now(); if (G.ui!=='playing'){ setUi('playing'); }
      if (now - window.__lastStep > 160 && !ISO.path.length){ window.__lastStep = now; let best = null, bd = 1e9; for (const m of G.mon) if (m.alive){ const d = Math.max(Math.abs(m.x - p.x), Math.abs(m.y - p.y)); if (d < bd){ bd = d; best = m; } }
        if (best && bd <= 1){ moveDir(Math.sign(best.x - p.x), Math.sign(best.y - p.y)); }
        else if (best){ ISO.path = isoFindPath(best.x, best.y, true) || []; ISO.nextStep = 0; }
        else if (window.__band.length){ /* a fresh band: the floor's first monsters again, at their own spots */ for (const t of window.__band){ const m = Object.assign({}, t); m.alive = true; m.hp = m.maxHp; G.mon.push(m); } } }
      p.hp = p.maxHp; }catch(e){ console.error(e); } requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
  const stat = nm=>page.evaluate(async nm=>{ PROF.t = {}; const fr = []; let last = performance.now(); for (let i=0;i<120;i++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(t - last); last = t; }
    fr.sort((a, b)=>a - b); let objs = 0, meshes = 0, sprites = 0, lights = 0; FPD.scene.traverse(o=>{ objs++; if (o.isMesh) meshes++; if (o.isSprite) sprites++; if (o.isLight) lights++; });
    const R = FPD.r, len = v=>Array.isArray(v) ? v.length : v instanceof Map || v instanceof Set ? v.size : 0;
    return { nm, med:+fr[60].toFixed(1), p90:+fr[108].toFixed(1), cpu3d:+((PROF.t['3d']||0)/120).toFixed(2), objs, meshes, sprites, lights, mon:G.mon.length, alive:G.mon.filter(m=>m.alive).length, live:len(M3D.live), inst:len(M3D.inst),
      floats:len(FP.floats), parts:len(FP.parts), monPos:len(FP.monPos), monAlive:len(FP.monAlive), monHp:len(FP.monHp), kids:FPD.scene.children.length, progs:R.info.programs.length, geos:R.info.memory.geometries, tex:R.info.memory.textures, turn:G.player.turnCount, kills:(G.player.stats||{}).kills }; }, nm);
  const out = [];
  for (let k=0;k<7;k++){ await page.waitForTimeout(k ? 9000 : 3000); out.push(await stat('t+' + (k*10) + 's')); console.log(JSON.stringify(out[out.length-1])); }
  await page.evaluate(async ()=>{ window.__play = false; saveLevelCache(G.depth); loadLevel(G.depth + 1, false, false); setUi('playing'); for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); saveLevelCache(G.depth); loadLevel(G.depth - 1, true, false); setUi('playing'); for (let i=0;i<120;i++) await new Promise(r=>requestAnimationFrame(r)); });
  console.log(JSON.stringify(await stat('left and came back')));
  if (errs.length) console.log('errors: ' + errs.slice(0, 4).join(' | '));
};
