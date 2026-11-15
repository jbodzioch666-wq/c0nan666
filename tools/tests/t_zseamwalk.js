// probe (RS-670, zseamwalk): walking over a Planet's face seams. For each of many pairs of land tiles that face each other over a seam, stand on
// one side, walk eight steps over to the other (so the land's frame switches to the new face), and after every step and at the end
// check that a click-walk still moves you: the figure's lag against the tile you stand on, the frame, the land build pending.
// ZN = how many crossings (default 20), ZSEED a fixed seed. Reports every crossing where a step or the click failed.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const N = +(process.env.ZN || 20);
  const r = await page.evaluate(async N=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; G.player.clock = DAY_LENGTH*0.4;
    const m = G.ow.map, W = OW_COLS, H = OW_ROWS, land = t=>[OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(t);
    /* seam pairs: a land tile whose neighbour over the edge (owNb) is on another face and is land too, and the walk beyond it stays on land */
    const pairs = []; let sd = 7; const rnd = ()=>{ sd = (sd*16807) % 2147483647; return sd/2147483647; };
    for (let tries=0; tries<200000 && pairs.length < N*6; tries++){ const x = Math.floor(rnd()*W), y = Math.floor(rnd()*H); if (cubeFace(x, y) < 0 || !land(m[x][y])) continue;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const b = owNb(x, y, dx, dy); if (!b || cubeFace(b[0], b[1])===cubeFace(x, y) || cubeFace(b[0], b[1]) < 0 || !land(m[b[0]][b[1]])) continue;
        /* the road on: eight tiles straight over, each land (stepping with owNb each time, the direction turning with the face) */
        let ok = true, cx = x, cy = y, ddx = dx, ddy = dy; const path = []; for (let k=0;k<8 && ok;k++){ const q = owNb(cx, cy, ddx, ddy); if (!q || !land(m[q[0]][q[1]])){ ok = false; break; }
          /* the direction in the new tile's grid: where did we come from */
          const back = [[1,0],[-1,0],[0,1],[0,-1]].find(([ex, ey])=>{ const z = owNb(q[0], q[1], ex, ey); return z && z[0]===cx && z[1]===cy; }); if (!back){ ok = false; break; }
          path.push([q[0], q[1], ddx, ddy]); cx = q[0]; cy = q[1]; ddx = -back[0]; ddy = -back[1]; }
        if (ok) pairs.push({ x, y, fa:cubeFace(x, y), fb:cubeFace(b[0], b[1]), path }); } }
    const uniq = new Map(); for (const p of pairs){ const k = p.fa + '>' + p.fb; if (!uniq.has(k)) uniq.set(k, []); uniq.get(k).push(p); }
    const pick = []; while (pick.length < N){ let got = false; for (const l of uniq.values()) if (l.length && pick.length < N){ pick.push(l.shift()); got = true; } if (!got) break; }
    const out = { pairs:pairs.length, kinds:[...uniq.keys()], runs:[] };
    const diag = ()=>{ const c = o3C(G.owPos.x, G.owPos.y); return { pos:[G.owPos.x, G.owPos.y], face:O3F.face, lag:+figLag().toFixed(2), pp:O3.ppos ? [+O3.ppos.x.toFixed(2), +O3.ppos.z.toFixed(2)] : null, c:[+c[0].toFixed(2), +c[1].toFixed(2)], pend:!!O3.pend, win:!!O3.win, sw:O3.frameSwitches||0, path:(O3.path||[]).length, ui:G.ui, mode:G.gameMode, step:O3.stepping, buf:!!(G.moveBuf && (G.moveBuf.length||G.moveBuf.dx!=null)), portal:!!G.owPortal, ferry:!!G.owFerry, lookout:!!O3.lookout, dw:!!O3.doorWalk }; };
    for (const p of pick){ G.owPos = { x:p.x, y:p.y }; O3.path = []; owReveal(p.x, p.y, 10); await fr(150);
      /* let the frame settle on the start face */ const t0 = performance.now(); while (performance.now() - t0 < 4000 && (O3.pend || o3FrameFor(G.owPos.x, G.owPos.y)!==O3F.face)) await fr(1);
      const run = { from:[p.x, p.y], fa:p.fa, fb:p.fb, sw0:O3.frameSwitches||0, steps:[] }; let bad = false;
      for (const [qx, qy, dx, dy] of p.path){ const before = diag();
        /* the step as the player would take it: the stored-grid step turned into the frame, through the key path */
        const fd = O3F.id ? [dx, dy] : o3Rot([dx, dy], o3FrameTurn(G.owPos.x, G.owPos.y)); const t1 = performance.now(); moveInput(fd[0], fd[1]);
        let waited = 0; while (performance.now() - t1 < 3000 && (G.owPos.x!==qx || G.owPos.y!==qy)){ await fr(1); waited++; }
        const moved = G.owPos.x===qx && G.owPos.y===qy; await fr(8);
        /* a click to the tile one on - does the click path take it? */
        const d = diag(); if (!moved || d.lag > 0.75){ bad = true; run.steps.push({ want:[qx, qy], fd, moved, waited, before, after:d }); }
        if (!moved){ G.owPos = { x:qx, y:qy }; } }
      /* at the end: a real click-walk to the next tile over */
      { const last = p.path[p.path.length - 1], q = owNb(last[0], last[1], last[2], last[3]); let clicked = null;
        if (q && land(m[q[0]][q[1]])){ const b0 = diag(); o3WalkTo({ kind:'ground', x:q[0], y:q[1] }); const t2 = performance.now(); while (performance.now() - t2 < 3000 && (G.owPos.x!==q[0] || G.owPos.y!==q[1])) await fr(1);
          clicked = { to:q, moved:G.owPos.x===q[0] && G.owPos.y===q[1], before:b0, after:diag() }; if (!clicked.moved) bad = true; }
        run.click = clicked; }
      run.sw = (O3.frameSwitches||0) - run.sw0; run.end = diag(); if (bad || run.sw > 2) out.runs.push(run); out.done = (out.done||0) + 1; }
    return out; }, N);
  console.log(JSON.stringify(r, null, 0).slice(0, 20000)); if (errs.length) console.log('ERRORS', errs.slice(0, 10).join(' | '));
};
