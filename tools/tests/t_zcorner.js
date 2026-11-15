// probe (RS-670): a Planet's cube corners, where the last narrow seas lie. ZSAVE a planet save (else a fresh planet). For each corner
// with land close by: stand on land on one face by the corner sea, plan a route (as a map tap does) to land across the corner on
// another face and set off; and sail by click-walk across the water. Watches for a freeze: no step for 4s while a path is still
// held, and reports the state then (figure lag, frame, build pending, path, flags). ZWATCH=1 leaves the browser open at a freeze.
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const txt = process.env.ZSAVE ? fs.readFileSync(process.env.ZSAVE, 'utf8') : null;
  const r = await page.evaluate(async txt=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    if (txt){ const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); } else { goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); }
    setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; G.inTown = false; G.player.hasBoat = 1; G.player.clock = DAY_LENGTH*0.4; G.owZoomedOut = false;
    const m = G.ow.map, W = OW_COLS, H = OW_ROWS, land = t=>[OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(t);
    const out = { gen:G.ow.genVer, size:W + 'x' + H, corners:[] };
    const diag = ()=>{ const c = o3C(G.owPos.x, G.owPos.y); return { pos:[G.owPos.x, G.owPos.y], t:m[G.owPos.x][G.owPos.y], face:O3F.face, cf:cubeFace(G.owPos.x, G.owPos.y), lag:+figLag().toFixed(2), pp:O3.ppos ? [+O3.ppos.x.toFixed(2), +O3.ppos.z.toFixed(2)] : null, c:[+c[0].toFixed(2), +c[1].toFixed(2)], pend:!!O3.pend, win:!!O3.win, sw:O3.frameSwitches||0, path:(O3.path||[]).length, next:(O3.path||[])[0], stepT:+(O3.stepT||0).toFixed(2), routeOn:!!G.routeOn, rw:!!G.routeWalk, ui:G.ui, mode:G.gameMode, buf:!!G.moveBuf, portal:!!G.owPortal, ferry:!!G.owFerry, lookout:!!O3.lookout, dw:!!O3.doorWalk, cliff:owCliffAt(G.owPos.x, G.owPos.y) }; };
    /* the corner seas: water with a small corner distance; land by them, grouped by corner and face */
    const spots = new Map();
    for (let x=0;x<W;x++) for (let y=0;y<H;y++){ if (cubeFace(x, y) < 0 || !land(m[x][y])) continue; const cd = cubeCornerDist(x, y); if (cd > 6) continue;
      let sea = false; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const q = owNb(x, y, dx, dy); if (q && m[q[0]][q[1]]===OW_WATER && cubeCornerDist(q[0], q[1]) <= 3.5) sea = true; } if (!sea) continue;
      const d = cubeTileDir(x, y), ck = d.map(v=>v > 0 ? 1 : -1).join(''), k = ck + '|' + cubeFace(x, y); if (!spots.has(k)) spots.set(k, []); spots.get(k).push({ x, y, cd }); }
    const byCorner = new Map(); for (const [k, l] of spots){ const [ck, f] = k.split('|'); if (!byCorner.has(ck)) byCorner.set(ck, []); byCorner.get(ck).push({ f:+f, l:l.sort((a, b)=>a.cd - b.cd) }); }
    out.cornersFound = [...byCorner.entries()].map(([k, v])=>k + ':' + v.map(e=>e.f + 'x' + e.l.length).join(','));
    const watch = async (label, limit)=>{ const t0 = performance.now(); let last = G.owPos.x + ',' + G.owPos.y, lastT = t0, stuck = null, moved = 0;
      while (performance.now() - t0 < limit){ await fr(1); const k = G.owPos.x + ',' + G.owPos.y; if (k!==last){ last = k; lastT = performance.now(); moved++; }
        const held = (O3.path && O3.path.length) || G.routeWalk; if (!held && performance.now() - lastT > 1500) break;   /* (arrived, or gave up) */
        if (held && performance.now() - lastT > 4000){ stuck = diag(); break; } }
      return { label, moved, stuck, end:diag() }; };
    for (const [ck, faces] of byCorner){ if (faces.length < 2) continue; const A = faces[0], B = faces[1], a = A.l[0], b = B.l[0]; const rec = { corner:ck, from:[a.x, a.y, A.f], to:[b.x, b.y, B.f], runs:[] };
      /* stand by the corner on face A */
      G.player.route = null; G.routeOn = false; O3.path = []; G.owPos = { x:a.x, y:a.y }; owReveal(a.x, a.y, 12); await fr(150); let t1 = performance.now(); while (performance.now() - t1 < 4000 && (O3.pend || o3FrameFor(G.owPos.x, G.owPos.y)!==O3F.face)) await fr(1);
      rec.start = diag();
      /* a route over the corner, as a map tap plans it, and off along it */
      routeAdd(b.x, b.y); const ri = routeInfo(); rec.route = ri ? { tiles:ri.tiles.length, bad:ri.bad, steps:!!ri.steps } : null;
      if (ri && ri.steps){ routeGo(); rec.runs.push(await watch('route', 40000)); }
      /* back, and sail over by click: the nearest water tile by B */
      G.player.route = null; G.routeOn = false; O3.path = []; G.owPos = { x:a.x, y:a.y }; await fr(60); t1 = performance.now(); while (performance.now() - t1 < 4000 && (O3.pend || o3FrameFor(G.owPos.x, G.owPos.y)!==O3F.face)) await fr(1);
      let wq = null; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const q = owNb(b.x, b.y, dx, dy); if (q && m[q[0]][q[1]]===OW_WATER){ wq = q; break; } }
      if (wq){ o3WalkTo({ kind:'ground', x:wq[0], y:wq[1] }); rec.sailPath = (O3.path||[]).length; rec.runs.push(await watch('sail', 40000)); }
      out.corners.push(rec); if (rec.runs.some(x=>x.stuck)){ out.stuckAt = rec; break; } }
    return out; }, txt);
  console.log(JSON.stringify(r).slice(0, 12000)); if (errs.length) console.log('ERRORS', errs.slice(0, 10).join(' | '));
  if (r.stuckAt && process.env.ZWATCH) await new Promise(()=>{});
};
