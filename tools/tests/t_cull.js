// RS-355: three things for a frame that's spent on the processor, not the card. In a town, a whole thing the camera can't
// see - a building, a tree, a person, and every part under it - is skipped, instead of each part being tested and walked.
// In a dungeon each light's shadow refreshes on its own clock (the lantern every second frame, each torch every sixth,
// staggered), since a point light's shadow is six faces of the whole floor. And a desktop's dungeon never drops its render
// scale below 0.7: a slow frame there is rarely the pixels, and the floor was going soft for nothing
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
    for (let i=0;i<12;i++){ FPD.lan.shadow.needsUpdate = false; (FPD.torches||[]).forEach(L=>{ L.shadow.needsUpdate = false; }); FPD.flickN = (FPD.flickN||0) + 1; const n = FPD.flickN, hi = SET.gfx==='high';
      if (n % (hi ? 2 : 4) === 0) lanDue++; (FPD.torches||[]).forEach((L, k)=>{ if ((n + k) % (hi ? 6 : 8) === 0) torchDue[k]++; }); }
    out.lanDue = lanDue; out.torchDue = torchDue;
    FPD.lvl = 0; FPD.dtAvg = 1; FPD.downAt = 0; FPD.lockUntil = 0; for (let i=0;i<8;i++){ FPD.dtAvg = 1; renderGame(); FPD.downAt = 0; } out.lvl = FPD.lvl; out.scale = FPD.scale; out.phone = gfxPhone();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.list > 60 && r.dyn >= 10, 'the town has a cull list of things, the people moving');
  A(r.wrongHidden===0 && r.farHidden && r.backNear, 'nothing in view is hidden; a person far off screen is skipped and comes back');
  A(r.torches===4 && r.lanAuto===false && r.torchAuto.every(a=>a===false), 'the dungeon lights are on their own clocks');
  A(r.lanDue===6 && r.torchDue.every(n=>n===2), 'in twelve frames the lantern is due six times and each torch twice');
  A(!r.phone && r.lvl<=2 && r.scale >= 0.7, 'a desktop dungeon never drops below scale 0.7');
};
