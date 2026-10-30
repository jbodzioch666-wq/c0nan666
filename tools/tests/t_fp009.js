// FP-009: through your eyes the entrances are walked with your own eyes - the camera rides your hidden figure up to a barrow and in,
// and down a dungeon's stair - and at work you hold the tool and turn to what you work: an axe to a tree, a pick to a rock.
// Shots: shots/fp009-axe.jpg (chopping, at the top of the swing), shots/fp009-barrow.jpg (walking up to the barrow)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    G.player.clock = DAY_LENGTH*0.4; const t = townList()[0]; G.interior = null; G.gameMode = 0; G.mon = [];
    for (const [dx, dy] of [[0,6],[6,0],[0,-6],[-6,0],[7,7],[-7,-7]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y)){ G.owPos = { x, y }; break; } } setUi('playing'); });
  await wait(1500); await page.keyboard.press('o'); await wait(1500);
  A(await ev(()=>fpvLand()), 'through your eyes on the land');

  /* ---- at work: the tool in hand, the view turned to it ---- */
  for (const [k, kind] of [['woodcutting','axe'], ['mining','pick']]){
    await ev(k=>{ G.gather = { o:{ k, label:k, at:{ x:G.owPos.x + 1, y:G.owPos.y } }, iv:900000, next:performance.now()+600000, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0 }; G.player.facing = 2; FP.lookYaw = null; FP.pitch = 0; }, k);
    await wait(1800);
    const w = await ev(()=>{ const c = o3C(G.gather.o.at.x, G.gather.o.at.y), want = Math.atan2(c[1] - FPM.y, c[0] - FPM.x), d = (FP.lookYaw==null ? 9 : FP.lookYaw) - want;
      return { work:FPW.work, held:!!FPW.held, off:Math.abs(Math.atan2(Math.sin(d), Math.cos(d))), pitch:FP.pitch }; });
    A(w.work===kind && w.held, k + ': the ' + kind + ' in hand: ' + JSON.stringify(w));
    A(w.off < 0.15, k + ': you turn to it: ' + JSON.stringify(w));
    A(kind==='axe' ? w.pitch > -0.9 && w.pitch < 0.1 : w.pitch < -0.1, k + ': looking at the trunk where the axe bites (FP-010: from the eyes in your head, a little down) or down at the rock: ' + w.pitch);
    if (kind==='axe'){ await ev(()=>{ window.__fpwP = 0.45; }); await wait(300); await page.screenshot({ path:SHOTS + '/fp009-axe.jpg', type:'jpeg', quality:82 }); await ev(()=>{ delete window.__fpwP; }); }
  }
  await ev(()=>{ skStop(); G.gather = null; FP.lookYaw = null; FP.pitch = 0; }); await wait(600);
  A(await ev(()=>!FPW.work), 'the tool put away after work');

  /* ---- up to a barrow and in, through your eyes ---- */
  const at = await ev(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>{ renderGame(); ++i >= n ? res() : requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    for (const s of sites) for (const [dx, dy] of [[1,1],[0,1],[1,0],[-1,1],[1,-1],[-1,0],[0,-1],[-1,-1]]){ const q = owNb(s.x, s.y, dx, dy); if (!q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) continue;
      G.owPos = { x:q[0], y:q[1] }; owReveal(q[0], q[1], 8); await fr(120); moveDir(-dx, -dy); await fr(90); if (G.owPos.x===s.x && G.owPos.y===s.y) return s; }
    return null; });
  A(at, 'a barrow to walk up to');
  await ev(()=>{ G.pendingDungeonModifier = null; enterDungeonConfirm(); const r = window.__dw = { started:!!O3.doorWalk, n:0, far:0, low:9, hid:0, fp:0 }, t0 = performance.now();
    window.__dwP = new Promise(res=>{ const f = ()=>{ if (O3.doorWalk && O3.ppos && O3.player && O3.cam){ const c = O3.cam.position; r.n++; r.far = Math.max(r.far, Math.hypot(c.x - O3.ppos.x, c.z - O3.ppos.z)); r.low = Math.min(r.low, c.y - O3.ppos.y); if (!O3.player.g.visible) r.hid++; if (FX.on.o3) r.fp++; }
      if (G.gameMode===1 || performance.now() - t0 > 9000){ r.mode = G.gameMode; res(); } else requestAnimationFrame(f); }; requestAnimationFrame(f); }); });
  await page.waitForTimeout(1100); await page.screenshot({ path:SHOTS + '/fp009-barrow.jpg', type:'jpeg', quality:82 });
  const dw = await ev(async ()=>{ await window.__dwP; return window.__dw; });
  A(dw.started && dw.n > 10, 'the walk in ran: ' + JSON.stringify(dw));
  A(dw.far < 0.6 && dw.low > 0.15 && dw.hid===dw.n && dw.fp===dw.n, 'the camera rides at your eyes all the way, your figure hidden: ' + JSON.stringify(dw));
  A(dw.mode===1, 'into the dungeon: ' + dw.mode);
  await wait(2500);

  /* ---- down a dungeon stair, through your eyes ---- */
  const st = await ev(async ()=>{ let sx = -1, sy = -1; for (let y=0; y<ROWS && sx<0; y++) for (let x=0; x<COLS; x++) if (tileAt(x, y)===T_STAIRSD){ sx = x; sy = y; break; }
    if (sx < 0) return { none:true }; const p = G.player; for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) if (tileOpen(sx + dx, sy + dy)){ p.x = sx + dx; p.y = sy + dy; break; }
    if (ISO.player && ISO.player.pos){ ISO.player.pos.x = p.x + 0.5; ISO.player.pos.y = p.y + 0.5; }
    for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    let went = 0; const ok = isoStairWalk(sx, sy, false, ()=>{ went = 1; }), r = { ok, minH:0, maxH:0, n:0 }, t0 = performance.now();
    await new Promise(res=>{ const f = ()=>{ renderGame(); if (FPD.stair){ r.n++; r.minH = Math.min(r.minH, FP.rideH||0); r.maxH = Math.max(r.maxH, FP.rideH||0); }
      if ((went && !FPD.stair) || performance.now() - t0 > 6000){ r.went = went; res(); } else requestAnimationFrame(f); }; requestAnimationFrame(f); });
    return r; });
  A(!st.none, 'a stair down on the first floor');
  A(st.ok && st.n > 10 && st.went, 'the walk down the stair ran: ' + JSON.stringify(st));
  A(st.minH < -0.15, 'your eyes go down with you on the stair: ' + JSON.stringify(st));
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
