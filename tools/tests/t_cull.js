// RS-355: three things for a frame that's spent on the processor, not the card. In a town, a whole thing the camera can't
// see - a building, a tree, a person, and every part under it - is skipped, instead of each part being tested and walked.
// In a dungeon each light's shadow refreshes on its own clock, since a point light's shadow is six faces of the whole floor
// (RS-363: above 45 fps every light every second frame, the torches staggered; below it the lantern every second frame and
// each torch every sixth, with the frame time in an average of its own). And a desktop's dungeon never drops its render
// scale below 0.6 (0.7 in RS-355)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.player.wildWarned = 1; saveCurrentGame = ()=>{};
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 15)); } };
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await fr(8);
    const out = { list:(V3.cullList||[]).length, dyn:(V3.cullList||[]).filter(e=>e.dyn).length, culled:V3.culled };
    // everything in view is visible; a person walked far off screen is skipped, and back again when they return
    const fru = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(V3.cam.projectionMatrix, V3.cam.matrixWorldInverse));
    let wrongHidden = 0; for (const e of V3.cullList){ if (e.dyn) continue; if (!e.o.visible && fru.intersectsSphere(new THREE.Sphere(e.c, Math.max(0, e.r - 3)))) wrongHidden++; } out.wrongHidden = wrongHidden;
    const p = V3.villagers[0]; const x0 = p.g.position.x, z0 = p.g.position.z; p.g.position.set(x0 + 60, 0, z0 + 60); v3CullTops(); out.farHidden = !p.g.visible; p.g.position.set(x0, 0, z0); v3CullTops(); out.backNear = p.g.visible || !fru.intersectsSphere(new THREE.Sphere(new THREE.Vector3(x0, 0.8, z0), 2.2));
    // the dungeon: lights on their own clocks, and the scale floor
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); await fr(10);
    out.lanAuto = FPD.lan.shadow.autoUpdate; out.torchAuto = (FPD.torches||[]).map(L=>L.shadow.autoUpdate); out.torches = (FPD.torches||[]).length;
    // which lights are due each frame: count the frames in 12 on which each is marked (the renderer clears the mark as it draws)
    // simpler: run the gate alone twelve times and read the marks before a render clears them
    let lanDue = 0; const torchDue = (FPD.torches||[]).map(()=>0);
    const due = (dt)=>{ let lan = 0, perFrame = []; const td = (FPD.torches||[]).map(()=>0); FPD.shadowFrames = 0; FP.dt = dt; FPD.shAvg = dt;
      for (let i=0;i<12;i++){ FPD.dynAt = performance.now(); FPD.lan.shadow.needsUpdate = false;   /* (RS-481: as if something were moving - in a still room the torches aren't redrawn at all) */ (FPD.torches||[]).forEach(L=>{ L.shadow.needsUpdate = false; }); dgShadowTick();
        if (FPD.lan.shadow.needsUpdate) lan++; let f = 0; (FPD.torches||[]).forEach((L, k)=>{ if (L.shadow.needsUpdate){ td[k]++; f++; } }); perFrame.push(f); }
      return { lan, td, perFrame }; };
    SET.gfx = 'high'; out.fast = due(1/60); out.slow = due(1/30);
    // the shadow clock keeps its own average: the render scaler's is left alone
    FPD.dtAvg = 0.0123; FP.dt = 0.09; dgShadowTick(); out.scalerAvg = FPD.dtAvg;
    FPD.lvl = 0; FPD.dtAvg = 1; FPD.downAt = 0; FPD.lockUntil = 0; for (let i=0;i<8;i++){ FPD.dtAvg = 1; FPD.adj = 200; FPD.upAt = 0; FPD.lockUntil = 0; renderGame(); FPD.downAt = 0; }   /* (the scaler judges every 120 frames: let each of these be one of those) */ out.lvl = FPD.lvl; out.scale = FPD.scale; out.phone = gfxPhone();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.list > 60 && r.dyn >= 10, 'the town has a cull list of things, the people moving');
  A(r.wrongHidden===0 && r.farHidden && r.backNear, 'nothing in view is hidden; a person far off screen is skipped and comes back');
  A(r.torches===4 && r.lanAuto===false && r.torchAuto.every(a=>a===false), 'the dungeon lights are on their own clocks');
  A(r.fast.lan===6 && r.fast.td.every(n=>n===6) && r.fast.perFrame.every(f=>f===2), 'above 45 fps: every light every second frame, two torches on each frame: '+JSON.stringify(r.fast));
  A(r.slow.lan===6 && r.slow.td.every(n=>n===2), 'below 45 fps: the lantern six times in twelve, each torch twice: '+JSON.stringify(r.slow));
  A(r.scalerAvg===0.0123, 'the shadow clock leaves the render scaler\'s average alone');
  A(!r.phone && r.lvl===3 && Math.abs(r.scale - 0.6) < 0.01, 'a desktop dungeon drops as far as scale 0.6 and no further: '+r.lvl+' '+r.scale);
};
