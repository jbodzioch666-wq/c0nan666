// (probe, not in ALL) what builds up on a dungeon floor as you fight on it: a fresh floor, after its monsters are killed and their bodies
// gone, then after leaving and coming back - frame time, the 3D CPU time, draws, objects in the scene, the lists the frame walks
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = process.env.ZSAVE ? require('fs').readFileSync(process.env.ZSAVE, 'utf8') : null;
  const r = await page.evaluate(async txt=>{ if (txt){ importSaveText(txt); loadGame(saveIndexList().slice(-1)[0].id); setUi('playing'); } else { goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); }
    saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; SET.fps = true;
    if (!txt){ const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
      G.dungeonMaxDepth = Math.max(G.dungeonMaxDepth, 3); loadLevel(2, false, false); setUi('playing'); } else { for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r)); }
    const run = async n=>{ for (let i=0;i<n;i++) await new Promise(r=>requestAnimationFrame(r)); };
    const stat = async nm=>{ await run(30); PROF.t = {}; const fr = []; let last = performance.now(); for (let i=0;i<150;i++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(t - last); last = t; }
      fr.sort((a, b)=>a - b); let objs = 0, meshes = 0, sprites = 0, lights = 0; FPD.scene.traverse(o=>{ objs++; if (o.isMesh) meshes++; if (o.isSprite) sprites++; if (o.isLight) lights++; });
      const R = FPD.r; R.info.autoReset = false; R.info.reset(); renderGame(); const calls = R.info.render.calls; R.info.autoReset = true;
      const len = v=>Array.isArray(v) ? v.length : v instanceof Map || v instanceof Set ? v.size : v ? Object.keys(v).length : 0;
      return { nm, med:+fr[75].toFixed(1), p90:+fr[135].toFixed(1), cpu3d:+((PROF.t['3d']||0)/150).toFixed(2), game:+((PROF.t.game||0)/150).toFixed(2), calls, objs, meshes, sprites, lights,
        mon:G.mon.length, alive:G.mon.filter(m=>m.alive).length, live:len(M3D.live), inst:len(M3D.inst), floats:len(FP.floats), parts:len(FP.parts||FP.particles), fx:len(FPD.fx||FP.fx), splats:len(FPD.splats||G.splats), props:len(ISO.props),
        monPos:len(FP.monPos), sceneKids:FPD.scene.children.length, progs:R.info.programs.length, geos:R.info.memory.geometries, tex:R.info.memory.textures }; };
    const out = [await stat(txt ? 'the save as it stands' : 'fresh')]; if (txt){ out.push({ deco:(()=>{ const c = {}; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ const d = G.dungeonDeco && G.dungeonDeco[x][y]; if (d) c[d] = (c[d]||0) + 1; } return c; })(), items:(()=>{ let n = 0; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.floorItem && G.floorItem[x][y]) n++; return n; })() }); }
    /* a long fight: every monster on the floor killed through the game's own death, a few times over (more spawned in) */
    const p = G.player;
    for (let wave=0; wave<(txt ? 0 : 4); wave++){
      for (let i=0;i<G.mon.length;i++){ const m = G.mon[i]; if (!m.alive) continue; m.x = Math.max(1, Math.min(COLS-2, p.x + ((i%5) - 2))); m.y = Math.max(1, Math.min(ROWS-2, p.y + ((i%3) - 1) + 1)); }
      await run(20);
      for (let i=0;i<G.mon.length;i++){ const m = G.mon[i]; if (!m.alive) continue; m.hp = 0; noteFoe(i); try{ monsterDies(i); }catch(e){} }
      await run(40); for (let t=0;t<12;t++){ tickMonsters(); await run(6); }   /* (turns pass: the bodies go) */
      if (wave < 3){ for (let k=0;k<12;k++) try{ spawnMonster(); }catch(e){ try{ spawnMonsters && spawnMonsters(); }catch(e2){} } await run(30); }
    }
    if (!txt){ await run(200); out.push(await stat('after the fights')); }
    /* leave and come back */
    saveLevelCache(G.depth); loadLevel(G.depth + 1, false, false); setUi('playing'); await run(60); saveLevelCache(G.depth); loadLevel(G.depth - 1, true, false); setUi('playing'); await run(120);
    out.push(await stat('left and came back'));
    return out; }, txt);
  for (const x of r) console.log(JSON.stringify(x));
};
