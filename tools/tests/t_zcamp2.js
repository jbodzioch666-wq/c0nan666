// (probe, not in ALL) the open land's frame by the game's own timers (the card's GPU time, the 3D CPU time), not the frame rate - capped by the
// screen's refresh it hides a cost: no camp, a fire stood away from, sitting at the fire, with a tent; then each piece of the camp off in turn
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = window.__kit===undefined ? 2 : window.__kit; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.mon = []; G.weather = 'clear'; SET.fps = true; G.gear.cape = rsMakeCape(5); G.player.look.body = 1; G.player.look.beard = 0;
    G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.85;   /* (evening: the fire's light counts) */
    let spot = null; const sp = G.ow.spawnPos;
    for (let r=1; r<12 && !spot; r++) for (let dx=-r; dx<=r && !spot; dx++) for (let dy=-r; dy<=r; dy++){ const x = sp.x+dx, y = sp.y+dy, t = G.ow.map[x] && G.ow.map[x][y]; if ((t===OW_GRASS || t===OW_DESERT) && !skNodeAt(x, y) && !owPlaceAt(x, y)){ spot = { x, y }; break; } }
    G.owPos = { x:spot.x, y:spot.y };
    let rg = 0; const run = async n=>{ for (let i=0;i<n;i++){ await new Promise(r=>requestAnimationFrame(r)); } };   /* (the game's own loop draws each frame - calling renderGame here as well drew every frame twice) */
    const stat = async nm=>{ await run(40); PROF.t = {}; PROF.gpuN = 0; let fr = 0; const t0 = performance.now(); await run(160); fr = (performance.now() - t0)/160; gfxGpuPoll();
      const R = O3.renderer; R.info.autoReset = false; R.info.reset(); renderGame(); const calls = R.info.render.calls, tris = R.info.render.triangles; R.info.autoReset = true;
      const n = 160, g = PROF.gpuN ? PROF.t.gpu/PROF.gpuN : null;
      return { nm, frame:+fr.toFixed(1), game:+((PROF.t.game||0)/n).toFixed(2), loop:+((PROF.t.loop||0)/n).toFixed(2), cpu3d:+((PROF.t['3d']||0)/n).toFixed(2), gpu:g===null ? null : +g.toFixed(2), sh:PROF.gpuN ? +((PROF.t.g_shadow||0)/PROF.gpuN).toFixed(2) : null, sc:PROF.gpuN ? +((PROF.t.g_scene||0)/PROF.gpuN).toFixed(2) : null, post:PROF.gpuN ? +((PROF.t.g_post||0)/PROF.gpuN).toFixed(2) : null, calls, tris, sit:!!(O3.player && O3.player.campSit) }; };
    const out = []; await run(400);
    const fireOn = ()=>{ skP().fire = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 5000 }; }, fireOff = ()=>{ skP().fire = null; G.player.campPitch = null; };
    const tentOn = ()=>{ G.player.campPitch = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 5000, tent:1, spit:1 }; };
    for (let k=0;k<2;k++){ fireOff(); out.push(await stat('none')); fireOn(); out.push(await stat('fire, sitting')); tentOn(); out.push(await stat('fire+tent, sitting')); }
    /* the cloth, timed: each call and its cost a frame, sitting at the fire */
    { fireOn(); tentOn(); const W = {}; for (const nm of ['m3dSkirtFollow', 'm3dSkirtCloth', 'm3dCapeCloth', 'm3dCapeSwing', 'm3dFastNormals', 'm3dHairSway', 'o3CampSit', 'm3dPoseHumanoid']){ const f = window[nm]; if (!f) continue; W[nm] = { n:0, ms:0, f }; window[nm] = function(){ const a = performance.now(); try{ return f.apply(this, arguments); } finally { W[nm].n++; W[nm].ms += performance.now() - a; } }; }
      await run(120); const o = {}; for (const k in W){ window[k] = W[k].f; o[k] = [+(W[k].n/120).toFixed(1), +(W[k].ms/120).toFixed(2)]; } out.push({ nm:'cloth calls a frame [n, ms]', o, skirt:!!(O3.player.e.rig.skirt), cape:!!O3.player.e.rig.cape }); }
    /* the pieces, one off at a time */
    const L = O3.fireLight; const i0 = L.intensity; L.visible = false; out.push(await stat('fire light hidden (count kept off)')); L.visible = true;
    const cs = o3CampSit; o3CampSit = function(P, pp){ return cs.call(this, P, pp, true); }; out.push(await stat('not sat')); o3CampSit = cs;
    const cf = o3Campfire; o3Campfire = function(){ if (O3.fireGrp) O3.fireGrp.visible = false; if (O3.fireLight) O3.fireLight.intensity = 0; }; out.push(await stat('no fire group')); o3Campfire = cf;
    return out; });
  for (const x of r) console.log(JSON.stringify(x));
};
