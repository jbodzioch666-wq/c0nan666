// (probe, not in ALL) does anything build up over a session? Rounds (ZROUNDS, default 6) of: into the same dungeon, down three floors (walked,
// its monsters killed), out to the open land and a walk there - after each round the dungeon's and the open land's scenes counted (objects,
// meshes, lights), their renderers' geometries, textures and shader programs, the JS heap, and the median frame in each place. ZTIER=planet
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async t=>{ goToCharCreate(); ccBegin(); setWorldSizeTier(t); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null;
    for (const k of ['attack','strength','defence','hitpoints']) G.player.skills[k] = SK_XP[70]; rsSync();
    for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); }, process.env.ZTIER || 'planet');
  const rounds = +(process.env.ZROUNDS || 6);
  for (let k=0; k<rounds; k++){
    const r = await page.evaluate(async k=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
      const med = async n=>{ const a = []; let l = performance.now(); for (let i=0;i<n;i++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); a.push(t - l); l = t; } a.sort((x, y)=>x - y); return +a[n >> 1].toFixed(1); };
      /* the same dungeon each round */
      if (!window.__lk){ let dx = -1, dy = -1; const sp = G.owPos; let bd = 1e9; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ const d = Math.hypot(x - sp.x, y - sp.y); if (d < bd){ bd = d; dx = x; dy = y; } } window.__lk = { x:dx, y:dy }; }
      const D = window.__lk; G.owPos = { x:D.x, y:D.y }; G.pendingDungeon = { x:D.x, y:D.y }; enterDungeonConfirm(); setUi('playing'); G.player.hp = G.player.maxHp = 99999;
      let dgMs = 0;
      for (let d=1; d<=3; d++){ if (d > 1) loadLevel(d, false); setUi('playing'); await fr(60);
        const fl = []; for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++) if (G.map[x][y]===T_FLOOR) fl.push([x, y]);
        for (let w=0; w<4; w++){ const [x, y] = fl[(k*7 + d*13 + w*31) % fl.length]; ISO.path = isoFindPath(x, y, false) || []; ISO.nextStep = 0; await fr(50); }
        if (d===1) dgMs = await med(60);
        for (let i=0;i<G.mon.length;i++) if (G.mon[i].alive) try{ monsterDies(i); }catch(e){} await fr(20); }
      const cnt = sc=>{ let n = 0, meshes = 0, lights = 0; if (sc) sc.traverse(o=>{ n++; if (o.isMesh) meshes++; if (o.isLight) lights++; }); return { n, meshes, lights }; };
      const dg = Object.assign(cnt(FPD.scene), FPD.r ? { geo:FPD.r.info.memory.geometries, tex:FPD.r.info.memory.textures, progs:FPD.r.info.programs.length } : {});
      /* out, and a walk on the open land */
      dgFinish(true); setUi('playing'); G.player.hp = G.player.maxHp = 99999; await fr(90);
      for (let s=0; s<40; s++){ const d = [[1,0],[0,1],[-1,0],[0,-1]][(s >> 3) % 4]; try{ tryMove(d[0], d[1]); }catch(e){} await fr(3); }
      const owMs = await med(60);
      const ow = Object.assign(cnt(O3.scene), O3.renderer ? { geo:O3.renderer.info.memory.geometries, tex:O3.renderer.info.memory.textures, progs:O3.renderer.info.programs.length } : {});
      return { round:k, dgMs, owMs, tpl:M3D.tpl.size, dg, ow, heapMB:performance.memory ? Math.round(performance.memory.usedJSHeapSize/1e6) : null, mode:G.gameMode }; }, k);
    console.log(JSON.stringify(r));
  }
  if (errs.length) console.log('ERRORS', errs.slice(0, 5).join(' | '));
};
