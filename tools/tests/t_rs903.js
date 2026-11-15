// RS-903: digging for treasure is shown - a buried cache's Dig, a treasure map read on its X and a dungeon's loose earth each take out a
// spade (rsToolModel 'spade') and throw up two spadefuls (rsSpadePose: blade driven in, levered, lifted with a clod on it, thrown aside,
// earth flying) before the find comes (digStart/digFinish on their own clock). Shots: shots/rs903-land.png, rs903-dungeon.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const frames = n=>page.evaluate(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } }, n);
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = Math.round(0.42*DAY_LENGTH) + 3*DAY_LENGTH; });
  await frames(50);
  /* the open land: a buried cache dug up */
  const land = await page.evaluate(async ()=>{ const out = { chips:0, clod:0, fpart:0 }, g0 = G.player.gold; O3.dist = 3.2;
    WG_POI.cache({ id:'t903', x:G.owPos.x, y:G.owPos.y }); out.dlg = G.ui; G.wevDlg.opts[0][1](); setUi('playing'); out.dig = !!G.dig; out.gold0 = G.player.gold===g0;
    const t0 = performance.now(); let tool = '', sawHit = 0;
    while (G.dig && performance.now() - t0 < 6000){ renderGame(); await new Promise(q=>setTimeout(q, 30)); const e = O3.player && O3.player.e; if (e){ tool = e.toolKey || tool; if (e.tool && e.tool.userData.clod && e.tool.userData.clod.visible) out.clod++; }
      if (O3.mrig) for (const c of O3.mrig.chips) if (c.t >= 0) sawHit++; if (performance.now() - t0 > 1700) break; }
    window.__l = { t0, g0, tool, sawHit, out }; return out; });
  await page.screenshot({ path: __dirname + '/shots/rs903-land.png' });
  Object.assign(land, await page.evaluate(async ()=>{ const L = window.__l, out = L.out; let tool = L.tool, sawHit = L.sawHit;
    while (G.dig && performance.now() - L.t0 < 6000){ renderGame(); await new Promise(q=>setTimeout(q, 30)); const e = O3.player && O3.player.e; if (e){ tool = e.toolKey || tool; if (e.tool && e.tool.userData.clod && e.tool.userData.clod.visible) out.clod++; } if (O3.mrig) for (const c of O3.mrig.chips) if (c.t >= 0) sawHit++; }
    for (let i=0;i<4;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); }
    out.ms = Math.round(performance.now() - L.t0); out.tool = tool; out.chips = sawHit; out.gold = G.player.gold - L.g0; out.after = O3.player && O3.player.e ? O3.player.e.toolKey : '?'; return out; }));
  /* a treasure map read on its X */
  const map = await page.evaluate(async ()=>{ const it = sqTreasureMap(); it.mx = G.owPos.x; it.my = G.owPos.y; addToInventory(it); const idx = G.inv.indexOf(it), g0 = G.player.gold; sqMapRead(idx); const dig = !!G.dig, mid = G.player.gold===g0;
    const t0 = performance.now(); while (G.dig && performance.now() - t0 < 6000){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } return { dig, mid, gold:G.player.gold - g0, gone:!G.inv.includes(it) }; });
  await page.evaluate(()=>{ if (G.ui!=='playing') setUi('playing'); });
  /* below ground: loose earth and a shovel */
  const dun = await page.evaluate(async ()=>{ const out = {}; let dx = null; for (let x=0;x<OW_COLS && !dx;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx = [x, y]; break; }
    if (!dx) return { none:true }; G.gameMode = 0; G.owPos = { x:dx[0], y:dx[1] }; G.pendingDungeon = { x:dx[0], y:dx[1] }; enterDungeonConfirm(); setUi('playing'); G.mon = [];
    for (let i=0;i<30;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); }
    const p = G.player, D = G.dungeonDeco; let at = null; for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const x = p.x + a, y = p.y + b; if (G.map[x] && G.map[x][y]===T_FLOOR && !D[x][y]){ at = [x, y]; break; } }
    if (!at) return { nofloor:true }; D[at[0]][at[1]] = 'dig'; skP().bag.shovel = 1; const g0 = p.gold; p.x = at[0]; p.y = at[1]; dgStep(at[0], at[1]); out.dig = !!G.dig; out.mode = G.dig && G.dig.mode; out.mid = p.gold===g0; out.cleared = !D[at[0]][at[1]];
    const t0 = performance.now(); let tool = '', parts = 0, clod = 0;
    while (G.dig && performance.now() - t0 < 6000){ const n0 = FP.parts.length; renderGame(); await new Promise(q=>setTimeout(q, 30)); const e = ISO.player; if (e){ tool = e.toolKey || tool; if (e.tool && e.tool.userData.clod && e.tool.userData.clod.visible) clod++; } parts = Math.max(parts, FP.parts.filter(q=>q.col===G.dig?.col || q.col==='#5a4636').length); if (performance.now() - t0 > 1650 && !out.snap){ out.snap = 1; break; } }
    out.tool = tool; out.parts = parts; out.clod = clod; return out; });
  await page.screenshot({ path: __dirname + '/shots/rs903-dungeon.png' });
  const dun2 = await page.evaluate(async ()=>{ const g0 = G.player.gold, t0 = performance.now(); while (G.dig && performance.now() - t0 < 6000){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } for (let i=0;i<5;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } return { gold:G.player.gold - g0, done:!G.dig, after:ISO.player ? ISO.player.toolKey : '?' }; });
  console.log(JSON.stringify({ land, map, dun, dun2 }));
  A(land.dlg==='wevent' && land.dig && land.gold0, 'the cache\'s Dig starts a dig before anything is found', land);
  A(land.tool==='spade0' && land.clod > 3 && land.chips > 0, 'on the land: the spade out, a clod lifted on it, earth thrown up', land);
  A(land.gold > 0 && land.ms > 2000 && land.ms < 4500 && land.after==='', 'the chest after two spadefuls, the spade put away', land);
  A(map.dig && map.mid && map.gone && map.gold > 0, 'a treasure map\'s X dug before the casket', map);
  if (!dun.none && !dun.nofloor){
    A(dun.dig && dun.mode===1 && dun.mid && dun.cleared, 'loose earth: a dig below ground, the tile used up', dun);
    A(dun.tool==='spade0' && dun.parts > 0 && dun.clod > 1, 'below ground: the spade out, a clod lifted, earth flying', dun);
    A(dun2.gold > 0 && dun2.done && dun2.after==='', 'the gold after the dig, the spade put away', dun2); }
  else console.log('(no dungeon floor to dig)');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
