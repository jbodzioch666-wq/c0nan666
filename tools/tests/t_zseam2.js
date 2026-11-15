// probe (RS-670): click-walks over a Planet's face seams on the water - sailing in summer, and walking the winter ice - for a freeze
// after the land's frame switches to the new face. ZSAVE a planet save (else a fresh planet), ZN crossings a season (default 10).
// Each crossing: stand on water (or ice) by a seam, click-walk to the tile ten over on the other face, watch: no step for 4s while a
// path is still held is a freeze, reported with the state then.
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const txt = process.env.ZSAVE ? fs.readFileSync(process.env.ZSAVE, 'utf8') : null, N = +(process.env.ZN || 10);
  const r = await page.evaluate(async ({ txt, N })=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    if (txt){ const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); } else { goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); }
    setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; G.inTown = false; G.owZoomedOut = false;
    const m = G.ow.map, W = OW_COLS, H = OW_ROWS, out = { gen:G.ow.genVer, seasons:[] };
    const diag = ()=>{ const c = o3C(G.owPos.x, G.owPos.y); return { pos:[G.owPos.x, G.owPos.y], t:m[G.owPos.x][G.owPos.y], ice:iceAt(G.owPos.x, G.owPos.y), face:O3F.face, cf:cubeFace(G.owPos.x, G.owPos.y), lag:+figLag().toFixed(2), pp:O3.ppos ? [+O3.ppos.x.toFixed(2), +O3.ppos.z.toFixed(2)] : null, c:[+c[0].toFixed(2), +c[1].toFixed(2)], pend:!!O3.pend, win:!!O3.win, sw:O3.frameSwitches||0, path:(O3.path||[]).length, next:(O3.path||[])[0], stepT:+(O3.stepT||0).toFixed(2), ui:G.ui, mode:G.gameMode, buf:!!G.moveBuf, portal:!!G.owPortal, ferry:!!G.owFerry, lookout:!!O3.lookout, dw:!!O3.doorWalk, stepping:!!O3.stepping }; };
    /* water pairs over a seam, with ten water tiles straight on beyond */
    const pairs = []; let sd = 11; const rnd = ()=>{ sd = (sd*16807) % 2147483647; return sd/2147483647; };
    for (let tries=0; tries<300000 && pairs.length < N*8; tries++){ const x = Math.floor(rnd()*W), y = Math.floor(rnd()*H); if (cubeFace(x, y) < 0 || m[x][y]!==OW_WATER) continue;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const b = owNb(x, y, dx, dy); if (!b || cubeFace(b[0], b[1])===cubeFace(x, y) || cubeFace(b[0], b[1]) < 0 || m[b[0]][b[1]]!==OW_WATER) continue;
        let ok = true, cx = x, cy = y, ddx = dx, ddy = dy, last = null; for (let k=0;k<10 && ok;k++){ const q = owNb(cx, cy, ddx, ddy); if (!q || m[q[0]][q[1]]!==OW_WATER){ ok = false; break; }
          const back = [[1,0],[-1,0],[0,1],[0,-1]].find(([ex, ey])=>{ const z = owNb(q[0], q[1], ex, ey); return z && z[0]===cx && z[1]===cy; }); if (!back){ ok = false; break; } last = q; cx = q[0]; cy = q[1]; ddx = -back[0]; ddy = -back[1]; }
        if (ok) pairs.push({ x, y, fa:cubeFace(x, y), fb:cubeFace(b[0], b[1]), to:last }); } }
    const uniq = new Map(); for (const p of pairs){ const k = p.fa + '>' + p.fb; if (!uniq.has(k)) uniq.set(k, []); uniq.get(k).push(p); }
    out.kinds = [...uniq.keys()]; out.pairs = pairs.length;
    const watch = async limit=>{ const t0 = performance.now(); let last = G.owPos.x + ',' + G.owPos.y, lastT = t0, stuck = null, moved = 0;
      while (performance.now() - t0 < limit){ await fr(1); const k = G.owPos.x + ',' + G.owPos.y; if (k!==last){ last = k; lastT = performance.now(); moved++; }
        const held = O3.path && O3.path.length; if (!held && performance.now() - lastT > 1200) break; if (held && performance.now() - lastT > 4000){ stuck = diag(); break; } }
      return { moved, stuck }; };
    for (const [name, clock, boat] of [['summer-sail', DAY_LENGTH*0.4, 1], ['winter-ice', DAY_LENGTH*6*3 + DAY_LENGTH*0.4, 0], ['winter-boat', DAY_LENGTH*6*3 + DAY_LENGTH*0.4, 1]]){
      G.player.clock = clock; G.player.hasBoat = boat; const S = { name, winter:isWinter(), runs:[], ok:0 };
      const pick = []; const lists = [...uniq.values()].map(l=>l.slice()); while (pick.length < N){ let got = false; for (const l of lists) if (l.length && pick.length < N){ pick.push(l.shift()); got = true; } if (!got) break; }
      for (const p of pick){ if (!boat && !(iceAt(p.x, p.y) && iceAt(p.to[0], p.to[1]))) continue;
        O3.path = []; G.owPos = { x:p.x, y:p.y }; owReveal(p.x, p.y, 12); await fr(150); let t1 = performance.now(); while (performance.now() - t1 < 4000 && (O3.pend || o3FrameFor(G.owPos.x, G.owPos.y)!==O3F.face)) await fr(1);
        const start = diag(); o3WalkTo({ kind:'ground', x:p.to[0], y:p.to[1] }); const pl = (O3.path||[]).length; const w = await watch(45000); const end = diag();
        const arrived = G.owPos.x===p.to[0] && G.owPos.y===p.to[1]; if (arrived && !w.stuck) S.ok++; else S.runs.push({ from:[p.x, p.y], fa:p.fa, fb:p.fb, to:p.to, pathLen:pl, moved:w.moved, arrived, start, stuck:w.stuck, end });
        if (w.stuck){ out.stuck = true; break; } }
      out.seasons.push(S); if (out.stuck) break; }
    return out; }, { txt, N });
  console.log(JSON.stringify(r).slice(0, 14000)); if (errs.length) console.log('ERRORS', errs.slice(0, 10).join(' | '));
};
