// RS-651: a dungeon on the land is a barrow you walk into. You stop clear of its door; on Enter you walk up the forecourt, two pale eyes
// look out of the dark, you go in and down while the dark takes the screen, and the first floor loads. A key skips the walk.
// Shots: shots/rs651-barrow.png (standing at it), shots/rs651-walk.png (at the door), shots/rs651-in.png (going in)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e.stack || e).slice(0, 300)));
  const fr = n=>page.evaluate(n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
  const out = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.gameMode = 0;
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    for (const s of sites){ /* come at it from the open land in front-ish, walking the last step so you stop where you would */
      for (const [dx, dy] of [[1,1],[0,1],[1,0],[-1,1],[1,-1],[-1,0],[0,-1],[-1,-1]]){ const q = owNb(s.x, s.y, dx, dy); if (!q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) continue;
        G.owPos = { x:q[0], y:q[1] }; owReveal(q[0], q[1], 8); await fr(120); moveDir(-dx, -dy); await fr(90);
        if (G.owPos.x===s.x && G.owPos.y===s.y) return { s, from:[dx, dy] }; }
    }
    return { none:true }; });
  if (out.none) throw new Error('no barrow to walk up to');
  Object.assign(out, await page.evaluate(()=>{ const PL = o3PL(), g = O3.doors && O3.doors.get(PL.x+','+PL.y), c = new THREE.Vector3(); if (!g) return { noModel:true }; g.getWorldPosition(c);
    return { ui:G.ui, eyes:(g.doorEyes||[]).length, stand:+Math.hypot(O3.ppos.x - c.x, O3.ppos.z - c.z).toFixed(2) }; }));
  await page.screenshot({ path: SHOTS + '/rs651-barrow.png' });
  /* in: watch it every frame */
  Object.assign(out, await page.evaluate(async ()=>{ G.pendingDungeonModifier = null; enterDungeonConfirm();
    const r = { started:!!O3.doorWalk, modeAt:G.gameMode, uiAt:G.ui, eyesSeen:false, maxFade:0, minY:9, t:0 }; const y0 = O3.ppos.y, t0 = performance.now();
    window.__dw = r;
    await new Promise(res=>{ const f = ()=>{ const W = O3.doorWalk, PL = o3PL(), g = O3.doors && O3.doors.get(PL.x+','+PL.y);
      if (g && (g.doorEyes||[]).some(e=>e.visible)) r.eyesSeen = true;
      const el = document.getElementById('transFade'); if (el && el.style.display==='block') r.maxFade = Math.max(r.maxFade, +el.style.opacity);
      if (W && O3.ppos) r.minY = Math.min(r.minY, O3.ppos.y - y0);
      if (G.gameMode===1 || performance.now() - t0 > 9000){ r.t = +((performance.now() - t0)/1000).toFixed(1); res(); } else requestAnimationFrame(f); }; requestAnimationFrame(f); });
    r.end = { mode:G.gameMode, walk:!!O3.doorWalk, fade:(document.getElementById('transFade')||{ style:{} }).style.display, ent:G.dungeonEntrance };
    return r; }));
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(!out.noModel && out.eyes===2, 'the barrow is built, with its eyes in the door');
  A(out.ui==='playing', 'stepping onto it asks nothing (RS-665: no risk window) (' + out.ui + ')');
  A(out.stand > 0.95 && out.stand < 1.2, 'you stop clear of its door, not in it');
  A(out.started && out.modeAt===0 && out.uiAt==='playing', 'Enter starts the walk, out on the land');
  A(out.eyesSeen, 'something looks out of the dark');
  A(out.minY < -0.15, 'you go down as you go in');
  A(out.maxFade > 0.5, 'the dark takes the screen');
  A(out.end.mode===1 && !out.end.walk && out.end.ent && out.end.ent.x===out.s.x && out.end.ent.y===out.s.y, 'then the barrow\'s first floor');
  A(out.t > 1.2 && out.t < 6, 'a walk of a few seconds (' + out.t + 's)');
  A(out.end.fade!=='block', 'the dark lifted');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
