// RS-803: a ship with her bow on a coast or on the map's edge comes round and sails off: one key press, or a tap. She used to bump forward as she turned, which cancelled the order and pinned her there. Sailing straight at a coast still stops her, and holding on still lands you.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error' && !/favicon|404|net::/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), w = ms=>new Promise(res=>setTimeout(res, ms)); window.__noLock = true; window.__noPirates = true;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; const p = G.player; p.hasBoat = 1; p.boatTier = 4; p.clock = DAY_LENGTH*0.4; G.gameMode = 0; moveOverworldEncounters = ()=>{}; checkOverworldEncounterTrigger = ()=>{}; wevStep = ()=>false; wgStep = ()=>false; sqWorldStep = ()=>false; questOverworldTurn = ()=>false; checkMythicBeastTrigger = ()=>false;
    const M = G.ow.map, wet = (x, y)=>M[x] && M[x][y]===OW_WATER, land = t=>t===OW_GRASS || t===OW_FOREST || t===OW_DESERT;
    /* a coast to the south, open water north of it */
    let shore = null; for (let x=3;x<OW_COLS-3 && !shore;x++) for (let y=8;y<OW_ROWS-3 && !shore;y++){ if (!land(M[x][y+1]) || wgRoadAt(x, y+1)) continue; let all = true; for (let k=0;k<7;k++) for (const e of [-1,0,1]) if (!wet(x+e, y-k)) all = false; if (all) shore = { x, y }; }
    /* the map's west edge, with water running east */
    let edge = null; for (let y=3;y<OW_ROWS-3 && !edge;y++){ let all = true; for (let i=0;i<8;i++) if (!wet(i, y)) all = false; if (all) edge = { x:0, y }; }
    const place = async (at, yaw, fx, fz)=>{ G.owPos.x = at.x; G.owPos.y = at.y; owReveal(at.x, at.y, 8); await w(700); for (let i=0;i<30 && !(O3.ship && O3.boat.visible);i++) await fr(10); const S = seaState(), L = o3PL(); S.v = 0; S.sail = 0; S.k = 0; S.want = null; S.yaw = O3.boatYaw = yaw; O3.path = []; O3.ppos.x = L.x + fx; O3.ppos.z = L.y + fz; await w(80); return S; };
    const off = at=>Math.hypot(G.owPos.x - at.x, G.owPos.y - at.y), o = { shore, edge };
    if (shore){ const S = await place(shore, 0, 0.5, 0.95); o.shoreBow = S.yaw; moveInput(0, -1); await w(100); o.shoreHeld = S.want!=null; await w(7000); o.shorePress = { moved:off(shore), v:S.v, on:seaOn() };
      await place(shore, 0, 0.5, 0.95); o3WalkTo({ x:shore.x, y:shore.y - 5 }); o.shoreSteps = O3.path.length; await w(7000); o.shoreTap = { moved:off(shore), path:O3.path.length };
      /* straight at it she still stops, and holding on still lands you */
      const q = { x:shore.x, y:shore.y - 3 }, S2 = await place(q, 0, 0.5, 0.5); moveInput(0, 1); const t0 = performance.now(); while (performance.now() - t0 < 6000 && !S2.blocked) await w(60); await w(300); o.stop = { blocked:S2.blocked, want:S2.want, sail:S2.sail, wet:wet(G.owPos.x, G.owPos.y) }; const t1 = performance.now(); while (performance.now() - t1 < 5000 && seaOn()){ moveInput(0, 1); await w(90); } o.ashore = !seaOn() && !wet(G.owPos.x, G.owPos.y); }
    if (edge){ const S = await place(edge, -Math.PI/2, 0.12, 0.5); moveInput(1, 0); await w(7000); o.edgePress = { moved:off(edge), v:S.v };
      await place(edge, -Math.PI/2, 0.12, 0.5); o3WalkTo({ x:7, y:edge.y }); await w(7000); o.edgeTap = { moved:off(edge), path:O3.path.length };
      /* into the edge itself she stops and doesn't throw */ const S3 = await place(edge, -Math.PI/2, 0.5, 0.5); const t = performance.now(); while (performance.now() - t < 1500){ moveInput(-1, 0); await w(90); } await w(700); o.edgeInto = { x:G.owPos.x, v:S3.v, pp:O3.ppos.x }; }
    return o; });
  console.log('rs803', JSON.stringify(r));
  A(r.shore || r.edge, 'a place to try it', r);
  if (r.shore){ A(r.shoreHeld, 'the order stands', r); A(r.shorePress.moved >= 2, 'one key press takes her off the coast', r); A(r.shoreSteps > 0 && r.shoreTap.moved >= 2, 'a tap takes her off the coast', r); A(r.stop.blocked && r.stop.wet, 'straight at it she stops', r); A(r.ashore, 'held into it, you land', r); }
  if (r.edge){ A(r.edgePress.moved >= 2, 'one key press takes her off the edge', r); A(r.edgeTap.moved >= 2, 'a tap takes her off the edge', r); A(r.edgeInto.x===0 && r.edgeInto.pp >= 0, 'she stays on the map', r); }
  A(!errs.length, 'no page errors', errs);
};
