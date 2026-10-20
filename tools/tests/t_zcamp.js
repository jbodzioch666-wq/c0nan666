// (probe, not in ALL) the open land's frame: no camp, a campfire, a fire and a tent, sitting at it - frame times, draw calls, lights, programs
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(()=>{ window.__campAlt = 1; });
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.mon = [];
    let spot = null; const sp = G.ow.spawnPos;
    for (let r=1; r<12 && !spot; r++) for (let dx=-r; dx<=r && !spot; dx++) for (let dy=-r; dy<=r; dy++){ const x = sp.x+dx, y = sp.y+dy, t = G.ow.map[x] && G.ow.map[x][y]; if ((t===OW_GRASS || t===OW_DESERT) && !skNodeAt(x, y) && !owPlaceAt(x, y)){ spot = { x, y }; break; } }
    G.owPos = { x:spot.x, y:spot.y };
    const fr = async n=>{ const f = [], cpu = []; let last = performance.now(); for (let i=0;i<n;i++){ const a = performance.now(); renderGame(); cpu.push(performance.now() - a); await new Promise(r=>requestAnimationFrame(r)); const now = performance.now(); f.push(now - last); last = now; } return { f, cpu }; };
    const stat = async (nm)=>{ const w = await fr(40); const s = await fr(150); const F = s.f.slice().sort((a, b)=>a - b), C = s.cpu.slice().sort((a, b)=>a - b); const R = O3.renderer;
      R.info.autoReset = false; R.info.reset(); renderGame(); await new Promise(r=>requestAnimationFrame(r)); const calls = R.info.render.calls; R.info.autoReset = true;
      let pl = 0; O3.scene.traverse(o=>{ if (o.isPointLight && o.visible) pl++; });
      return { nm, warmWorst:Math.round(Math.max(...w.f)), median:+F[F.length>>1].toFixed(1), p90:+F[Math.floor(F.length*0.9)].toFixed(1), cpu:+C[C.length>>1].toFixed(1), cpu90:+C[Math.floor(C.length*0.9)].toFixed(1), calls, progs:R.info.programs.length, pointLights:pl, sit:!!(O3.player && O3.player.campSit) }; };
    const out = [];
    await fr(500); out.push(await stat('none'));
    if (window.__campAlt){ for (let k=0;k<2;k++){ skP().fire = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 5000 }; G.player.campPitch = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 5000, tent:1, spit:1 }; out.push(await stat('fire+tent ' + k));
      skP().fire = null; G.player.campPitch = null; out.push(await stat('none ' + k)); } return out; }
    skP().fire = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 5000 }; G.owPos = { x:spot.x + 2, y:spot.y }; out.push(await stat('fire, away'));
    G.owPos = { x:spot.x, y:spot.y }; out.push(await stat('fire, sitting'));
    G.player.campPitch = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 5000, tent:1, spit:1 }; out.push(await stat('fire+tent, sitting'));
    /* what it costs: each piece off in turn */
    const L = O3.fireLight; L.visible = false; out.push(await stat('no fire light')); L.visible = true;
    window.__o3NoSit = 1; const cs = o3CampSit; o3CampSit = function(P, pp){ return cs.call(this, P, pp, true); }; out.push(await stat('not sat')); o3CampSit = cs;
    return out; });
  for (const x of r) console.log(JSON.stringify(x));
};
