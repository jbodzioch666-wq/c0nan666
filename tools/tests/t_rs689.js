// RS-689: Taps at the Gate - on a phone, standing on the tile beside a Guardians' Gate (where you're nudged clear of its stonework, up
// to 0.95 from the tile's middle), a tap still walks you: figLag measures to where the nudge puts you (it measured to the tile's middle,
// past FIG_LAG_MAX, so a tap or a route never took its next step - a player was stuck there). And the gate's tap box is its own size: a
// tap on its door, a guardian or a wall takes you in (the old shrine's 1 x 1.2 box missed them and walked you to the tile behind). The
// Rotunda's dome too, from your boat beside it.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const fr = n=>page.evaluate(n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
  const setup = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; G.player.hasBoat = 1; window.__trans = true;
    G.ow.encounters = []; wevStep = ()=>false; checkOverworldEncounterTrigger = ()=>false;   /* (nothing to meet on the way) */
    const m = G.ow.map, land = [], sea = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_TEMPLE) (owSeaSite(x, y) ? sea : land).push({ x, y });
    const by = l=>l.sort((a, b)=>Math.hypot(a.x - G.owPos.x, a.y - G.owPos.y) - Math.hypot(b.x - G.owPos.x, b.y - G.owPos.y))[0];
    window.__L = by(land); window.__S = by(sea); if (!__L) return { noLand:true };
    /* the tile beside the gate where the nudge is biggest */
    let best = null, bn = 0; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){ const q = owNb(__L.x, __L.y, dx, dy); if (!q || !o3Passable(q[0], q[1]) || OW_SITE_TILES.includes(m[q[0]][q[1]])) continue;
      G.owPos = { x:q[0], y:q[1] }; owReveal(q[0], q[1], 8); await fr(40); const nd = o3YardNudge(q[0], q[1]), n = nd ? Math.hypot(nd[0], nd[1]) : 0; if (n > bn){ bn = n; best = q; } }
    window.__N = best; return { land:land.length, sea:sea.length, nudge:+bn.toFixed(2), at:best }; });
  console.log(JSON.stringify(setup));
  if (setup.noLand) throw new Error('no land temple');
  const go = (spot, sea)=>page.evaluate(async ([spot, sea])=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    G.gameMode = 0; G.inTown = false; G.interior = null; O3.doorWalk = null; O3.path = []; G.routeOn = false; G.pendingDungeon = null; setUi('playing');
    const T = sea ? __S : __L; let at = __N; if (sea){ at = null; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const q = owNb(T.x, T.y, dx, dy); if (q && G.ow.map[q[0]][q[1]]===OW_WATER){ at = q; break; } } }
    G.owPos = { x:at[0], y:at[1] }; owReveal(at[0], at[1], 8);
    let last = null, still = 0; for (let i=0;i<600 && still < 15;i++){ await fr(1); if (!O3.ppos) continue; const p = O3.ppos.x + ',' + O3.ppos.z; still = p===last ? still + 1 : 0; last = p; }
    const C = o3C(T.x, T.y), g = O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g) return { nog:true }; const S = g.scale.x;
    const v = g.localToWorld(new THREE.Vector3(spot[0]/S, spot[1]/S, spot[2]/S)); v.project(O3.cam); const r = O3.cv.getBoundingClientRect();
    const ex = { clientX:r.left + (v.x + 1)/2*r.width, clientY:r.top + (1 - v.y)/2*r.height }, a = o3Pick(ex);
    return { lag:+figLag().toFixed(2), x:ex.clientX, y:ex.clientY, on:v.x > -1 && v.x < 1 && v.y > -1 && v.y < 1, pick:a ? a.kind + (a.kind==='site' ? ':' + (a.x===T.x && a.y===T.y) : '') : null }; }, [spot, sea]);
  const watch = ()=>page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    const t0 = performance.now(); let last = '', lastT = t0; while (performance.now() - t0 < 25000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk, k = (W ? W.leg + ':' + (W.v||0).toFixed(3) + ':' + (W.look||0).toFixed(3) : 'n') + ':' + O3.ppos.x.toFixed(3) + ',' + O3.ppos.z.toFixed(3) + ':' + G.owPos.x + ',' + G.owPos.y;
      if (k!==last){ last = k; lastT = performance.now(); } if (performance.now() - lastT > 3000) break; }
    return { mode:G.gameMode, kind:G.siteKind, pos:[G.owPos.x, G.owPos.y] }; });
  const out = { setup };
  /* a tap on the ground two tiles off, away from the gate: you walk there (the stuck player's case) */
  { const s = await go([0, 0, 0], false); out.lag = s.lag;
    const r = await page.evaluate(()=>{ const away = [Math.sign(__N[0] - __L.x), Math.sign(__N[1] - __L.y)], q = [__N[0] + 2*away[0], __N[1] + 2*away[1]]; o3WalkTo({ kind:'ground', x:q[0], y:q[1] }); return { q, path:(O3.path||[]).length }; });
    await fr(10); const t = await page.evaluate(async q=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }); const t0 = performance.now(); while (performance.now() - t0 < 8000 && (O3.path||[]).length) await fr(1); return { pos:[G.owPos.x, G.owPos.y], left:(O3.path||[]).length }; }, r.q);
    out.away = { path:r.path }; out.awayPos = t.pos; out.awayLeft = t.left; out.awayFrom = setup.at; }
  out.taps = [];
  for (const [nm, spot] of [['door low', [0, 0.45, 1.3]], ['left guard', [-1.22, 0.9, 0.92]], ['right guard', [1.22, 0.9, 0.92]], ['left wall', [-1.3, 1.4, 0]], ['crown', [0, 2.3, 1.1]]]){
    const s = await go(spot, false); if (!s.on){ out.taps.push({ nm, off:true }); continue; } await page.touchscreen.tap(s.x, s.y); const w = await watch(); out.taps.push({ nm, lag:s.lag, pick:s.pick, mode:w.mode, kind:w.kind }); }
  if (setup.sea){ const s = await go([0, 2.9, 0], true); if (s.on){ await page.touchscreen.tap(s.x, s.y); const w = await watch(); out.sea = { pick:s.pick, mode:w.mode, kind:w.kind }; } }
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(out)); };
  A(setup.nudge > 0.75, 'beside the gate you are nudged past FIG_LAG_MAX: ' + setup.nudge);
  A(out.lag < 0.1, 'and figLag counts from where the nudge puts you: ' + out.lag);
  A(out.away.path >= 1 && out.awayLeft===0 && (out.awayPos[0]!==setup.at[0] || out.awayPos[1]!==setup.at[1]), 'a tap on the ground walks you off from there');
  for (const t of out.taps) A(t.off || (t.pick==='site:true' && t.mode===1 && t.kind==='city'), 'a tap on the gate (the Lost City since RS-756)\'s ' + t.nm + ' takes you in');
  A(out.taps.filter(t=>!t.off).length >= 3, "enough of the gate is on the phone's screen to tap");
  if (out.sea) A(out.sea.pick==='site:true' && out.sea.mode===1 && out.sea.kind==='temple', 'a tap on the Rotunda\'s dome takes you in from your boat');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
module.exports.mobile = true;
