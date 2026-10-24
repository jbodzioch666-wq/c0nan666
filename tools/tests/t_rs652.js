// RS-652: a barrow's sunken stair. The land is cut open in front of its door (o3LandCut: no ground triangle in the stair, a finer
// patch round it), no water is drawn down it, nothing grows in it, and on Enter you walk to its head, look down, go down the steps
// to the door and on into the dark. Shots: shots/rs652-stair.png (standing at it), shots/rs652-down.png (on the steps)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e.stack || e).slice(0, 300)));
  const out = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 120, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    let tried = 0;
    for (const s of sites){ if (++tried > 14) break;
      for (const [dx, dy] of [[1,1],[0,1],[1,0],[-1,1],[1,-1]]){ const q = owNb(s.x, s.y, dx, dy); if (!q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) continue;
        setUi('playing'); G.owPos = { x:q[0], y:q[1] }; owReveal(q[0], q[1], 8); await fr(120); moveDir(-dx, -dy); await fr(90);
        if (G.owPos.x!==s.x || G.owPos.y!==s.y) continue;
        const PL = o3PL(), g = O3.doors && O3.doors.get(PL.x+','+PL.y);
        if (g && g.userData.pit) return { s, from:[dx, dy], tried };
        break; }
    }
    return { none:true, tried }; });
  if (out.none) throw new Error('no barrow with a stair near ' + JSON.stringify(out));
  Object.assign(out, await page.evaluate(()=>{ const PL = o3PL(), g = O3.doors.get(PL.x+','+PL.y), c = g.userData.pit;
    /* the land: no triangle of the ground in the stair, and the finer patch is there */
    const geo = O3.land.geometry, P = geo.attributes.position.array, I = geo.index.array; let inPit = 0, edge = 0;
    for (let k=0;k<I.length;k+=3){ const a = I[k]*3, b = I[k+1]*3, d = I[k+2]*3, x = (P[a] + P[b] + P[d])/3, z = (P[a+2] + P[b+2] + P[d+2])/3;
      if (Math.abs(x - c.cx) > 1.5 || Math.abs(z - c.cz) > 1.5) continue; const [u, v] = o3PitLocal(c, x, z); if (Math.abs(u) < O3_PIT.hw - 0.03 && v > O3_PIT.z0 + 0.03 && v < O3_PIT.z1 - 0.03) inPit++; else if (Math.abs(u) < O3_PIT.hw + 0.06 && v > -0.06 && v < O3_PIT.z1 + 0.06) edge++; }
    /* the water's mask down the stair, and nothing growing in it */
    const [mx, mz] = o3PitWorld(c, 0, 0.3), dO = O3.depthO, i = Math.round((mx - dO.x)*dO.z), j = Math.round((mz - dO.y)*dO.z), dd = O3.depthTex.image.data, mask = dd[(j*dO.w + i)*4 + 1];
    let veg = 0; O3.world.traverse(o=>{ if (!o.isInstancedMesh || !o.count) return; const m4 = new THREE.Matrix4(), v3 = new THREE.Vector3(); for (let n=0;n<o.count;n++){ o.getMatrixAt(n, m4); v3.setFromMatrixPosition(m4); if (o3InCut(v3.x, v3.z, -0.04)) veg++; } });
    const w = new THREE.Vector3(); g.getWorldPosition(w);
    return { cutPatch:geo.userData.cuts, inPit, edge, mask, veg, stand:+Math.hypot(O3.ppos.x - w.x, O3.ppos.z - w.z).toFixed(2), ui:G.ui }; }));
  await page.screenshot({ path: SHOTS + '/rs652-stair.png' });
  Object.assign(out, await page.evaluate(async ()=>{ G.pendingDungeonModifier = null; enterDungeonConfirm();
    const r = { started:!!O3.doorWalk, pit:!!(O3.doorWalk && O3.doorWalk.pit), eyesSeen:false, maxFade:0, minY:9, onSteps:0, t:0 }; const y0 = O3.ppos.y, t0 = performance.now();
    await new Promise(res=>{ const f = ()=>{ const W = O3.doorWalk, PL = o3PL(), g = O3.doors && O3.doors.get(PL.x+','+PL.y);
      if (g && (g.userData.eyes||[]).some(e=>e.visible)) r.eyesSeen = true;
      const el = document.getElementById('transFade'); if (el && el.style.display==='block') r.maxFade = Math.max(r.maxFade, +el.style.opacity);
      if (W && O3.ppos){ const dy = O3.ppos.y - y0; r.minY = Math.min(r.minY, dy); if (dy < -0.15 && dy > -0.4 && !r.onSteps){ r.onSteps = 1; window.__shotNow = true; } }
      if (G.gameMode===1 || performance.now() - t0 > 10000){ r.t = +((performance.now() - t0)/1000).toFixed(1); res(); } else requestAnimationFrame(f); }; requestAnimationFrame(f); });
    r.end = { mode:G.gameMode, walk:!!O3.doorWalk, ent:G.dungeonEntrance };
    return r; }));
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(out.cutPatch >= 1, 'the land has its stair cut');
  A(out.inPit===0, 'no ground left in the stair');
  A(out.edge > 10, 'the finer ground runs up to the cut');
  A(out.mask===255, 'no water drawn down the stair');
  A(out.veg===0, 'nothing growing in the stair');
  A(out.ui==='dungeonPrompt' && out.stand > 0.95 && out.stand < 1.2, 'you stop clear of it and are asked');
  A(out.started && out.pit, 'Enter walks you down the stair');
  A(out.eyesSeen, 'something looks out of the dark');
  A(out.minY < -0.45, 'you go down the steps to the door (' + out.minY + ')');
  A(out.maxFade > 0.5, 'the dark takes the screen');
  A(out.end.mode===1 && !out.end.walk && out.end.ent && out.end.ent.x===out.s.x && out.end.ent.y===out.s.y, 'then the barrow\'s first floor');
  A(out.t > 1.5 && out.t < 7, 'a walk of a few seconds (' + out.t + 's)');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
