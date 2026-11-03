// RS-798: snakes crawl and die with their whole body. The body tube is live, not a frozen merged copy; it follows the path the head took, the head stays on its end alive and dead;
// a dead snake stays on the floor, lies in long curves, rolls its belly up and opens its jaw; a cobra's hood lies along the neck, flared only when reared. Eels and worms keep a live tube too
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>{ throw e; });
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), wait = ms=>new Promise(res=>setTimeout(res, ms)); window.__noLock = true;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; const p = G.player; p.hp = p.maxHp = 99999; G.gameMode = 0;
    let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx = x; dy = y; break; } G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const fl = (x, y)=>G.map[x] && G.map[x][y]===T_FLOOR; let best = null, bs = -1; for (let x=3;x<G.map.length-3;x++) for (let y=3;y<G.map[0].length-3;y++){ if (!fl(x, y)) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (fl(x+i, y+j)) n++; if (n > bs){ bs = n; best = { x, y }; } }
    p.x = best.x; p.y = best.y;
    const spawn = async nm=>{ G.mon = []; const m = Object.assign(newMonster(), { nm, alive:true, hp:50, maxHp:50, x:p.x + 2, y:p.y - 2, awake:false, mlevel:5 }); G.mon.push(m); await fr(40); return { m, e:M3D.inst.get(m) }; };
    const headGap = e=>{ const a = e.rig.tube.geometry.attributes.position, H = e.rig.head.position, g = e.rig.tube.geometry.userData, nS = g.nS, nR = g.nR; let cx = 0, cy = 0, cz = 0; for (let j=0;j<=nS;j++){ const v = nR*(nS + 1) + j; cx += a.getX(v)/(nS + 1); cy += a.getY(v)/(nS + 1); cz += a.getZ(v)/(nS + 1); } return Math.hypot(H.x - cx, H.y - cy, H.z - cz); };
    const out = {};
    /* a live tube, for all the long bodies */
    out.live = {}; for (const nm of ['giant eel', 'purple worm', 'giant leech', 'remorhaz']){ const { e } = await spawn(nm); const t = e.rig.tube, a0 = t.geometry.attributes.position.array.slice(); await wait(350); const a1 = t.geometry.attributes.position.array; let mv = 0; for (let i=0;i<a0.length;i++) mv = Math.max(mv, Math.abs(a0[i] - a1[i])); out.live[nm] = { vis:t.visible, inTree:(()=>{ let x = t; while (x.parent) x = x.parent; return x===e.holder || x.isScene; })(), mv:+mv.toFixed(4) }; }
    /* the crawl */
    const { m, e } = await spawn('giant constrictor snake'); const t = e.rig.tube;
    out.vis = t.visible; out.gap0 = headGap(e); const c0 = t.geometry.attributes.position.array.slice(), start = { x:e.holder.position.x, z:e.holder.position.z };
    for (const [a, b] of [[-1,0],[-1,0],[-1,0],[0,1],[0,1],[0,1],[-1,0]]){ m.x += a; m.y += b; await wait(330); }
    out.gapWalk = headGap(e); const c1 = t.geometry.attributes.position.array; let moved = 0; for (let i=0;i<c0.length;i++) moved = Math.max(moved, Math.abs(c0[i] - c1[i])); out.moved = moved;
    const S = e.crawlS; out.trail = S ? S.tr.filter(q=>q.w).length : 0; out.bodyLen = (()=>{ const P = e.rig.livePts; let L = 0; for (let i=1;i<P.length;i++) L += P[i].distanceTo(P[i-1]); return L*e.root.scale.x; })();
    /* its tail end is back along the way it came, and its body bends with the path, not the head alone */
    const P = e.rig.livePts, sc = e.root.scale.x; let bend = 0; for (let i=1;i+1<P.length;i++){ const a = P[i].clone().sub(P[i-1]).normalize(), b = P[i+1].clone().sub(P[i]).normalize(); bend += Math.acos(Math.min(1, a.dot(b))); } out.bend = bend; out.sc = sc;
    await wait(1500); out.gapRest = headGap(e);
    /* the death */
    m.hp = 0; m.alive = false; m3dKill(m, { kind:'melee', dmg:50, maxHp:50 }); out.dk = e.dkind; let top = 0; const hist = [], t0 = performance.now(); let jaw = 0; while (performance.now() - t0 < 3000){ await fr(1); const C = e.chain; if (!C) continue; let tt = 0, av = 0; for (const q of C.p){ tt = Math.max(tt, q.x.y); av += q.x.y/C.p.length; } hist.push([C.t, tt, av]); top = Math.max(top, tt); jaw = Math.max(jaw, e.rig.jaw.rotation.x); }
    const C = e.chain; out.chain = !!C; if (C){ out.h0 = C.h0; out.top = top; out.endTop = hist[hist.length-1][1]; out.endAvg = hist[hist.length-1][2]; out.gapDead = headGap(e); out.jaw = jaw; let L = 0; for (let i=1;i<C.p.length;i++) L += C.p[i].x.distanceTo(C.p[i-1].x); out.deadLen = L; out.deadSpan = C.p[0].x.distanceTo(C.p[C.p.length-1].x); const n = C.p.length, far = C.p.map(q=>q.x), k = Math.round(n*0.17); let fold = 1; for (let i=0;i+k<n;i++){ let st = 0; for (let j=i;j<i+k;j++) st += far[j].distanceTo(far[j+1]); fold = Math.min(fold, far[i].distanceTo(far[i+k])/st); } out.fold = fold;
      /* belly up along the middle: the tube's top vertex at mid-body has the belly colour's side: read by the twist of the frames */
      out.t = C.t; }
    /* the hood */
    { const { m:w, e:ew } = await spawn('poison wyrm'); let crawl = 9; for (const [a, b] of [[-1,0],[-1,0],[-1,0],[0,1],[0,1],[0,1]]){ w.x += a; w.y += b; const t1 = performance.now(); while (performance.now() - t1 < 250){ await fr(1); crawl = Math.min(crawl, ew.rig.hood.scale.x); } } await wait(1800); const rear = ew.rig.hood.scale.x; out.hood = { crawl, rear }; }
    return out; });
  console.log('rs798', JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(r)); };
  for (const [nm, d] of Object.entries(r.live)){ A(d.vis && d.inTree, nm + ': its own tube is the one drawn'); A(d.mv > 0.0005, nm + ': its body moves'); }
  A(r.vis, 'the snake draws its live tube');
  A(r.gap0 < 0.02 && r.gapWalk < 0.02 && r.gapRest < 0.02, 'the head stays on the end of the body while it lives');
  A(r.moved > 0.1, 'the whole body moves as it crawls');
  A(r.trail > 20, 'the body lays down a trail to follow');
  A(r.bend > 1, 'the body bends along its path');
  A(r.bodyLen > 2 && r.bodyLen < 6, 'a giant snake stays a sensible length');
  A(r.dk==='serpent' && r.chain, 'it dies as a chain of its own length');
  A(r.top <= r.h0 + 0.15, 'dying does not throw it into the air');
  A(r.endTop < 0.25 && r.endAvg < 0.15, 'it comes to lie on the floor');
  A(r.gapDead < 0.02, 'the head stays on the body when it dies');
  A(r.jaw > 0.4, 'its jaw falls open');
  A(r.fold > 0.35, 'it lies in curves, not folded in a heap');
  A(r.hood.rear > r.hood.crawl + 0.2, 'a cobra flares its hood when it rears and folds it to crawl');
};
