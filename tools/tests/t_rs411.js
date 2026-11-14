// RS-411: the XP tracker's bar wraps round at a level-up instead of sliding back; explored doorways stay drawn out of sight;
// a recipe's "logs" counts plain logs only (building costs still take any kind); the dungeon and fight minimap goes when a
// menu is open; the world map pans by the pixel, not by the whole tile
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; });
  await page.waitForTimeout(800);

  // 1. the XP bar at a level-up: on up to the end, then from empty to the new level's share
  const frac = ()=>ev(()=>{ const el = document.querySelector('#xpTracker [data-bar="xpt-woodcutting"]'); return el ? parseFloat(getComputedStyle(el).width)/el.parentElement.getBoundingClientRect().width : -1; });
  await ev(()=>{ skGainXP('woodcutting', 1); const p = G.player; p.skills.woodcutting = SK_XP[5] + Math.round(0.7*(SK_XP[6]-SK_XP[5])); renderXpTracker(); });
  await page.waitForTimeout(900);
  const w1 = await frac();
  await ev(()=>{ const p = G.player; p.skills.woodcutting = SK_XP[6] + Math.round(0.15*(SK_XP[7]-SK_XP[6])); renderXpTracker(); });
  await page.waitForTimeout(250); const w2 = await frac();
  await page.waitForTimeout(1300); const w3 = await frac();
  console.log('xp bar', w1.toFixed(2), w2.toFixed(2), w3.toFixed(2));
  A(w1 > 0.6 && w1 < 0.8, 'the bar shows 70% before the level: '+w1);
  A(w2 > w1, 'at the level-up it runs on toward the end, not back: '+w1+' -> '+w2);
  A(Math.abs(w3 - 0.15) < 0.06, 'then it settles at the new level\'s 15%: '+w3);

  // 2. logs: oak logs don't count toward a recipe's plain logs, but do toward a building cost
  const lg = await ev(()=>{ const b = skP().bag; delete b.logs; b.oak = 7;
    return { have:needHave('logs'), any:needHave('logs', true), max:needMax({ logs:1, bowstring:1 }), html:needHtml({ logs:2 }), house:houseCostText({ logs:5 }) }; });
  console.log('logs', JSON.stringify(lg));
  A(lg.have===0 && lg.max===0 && /\(0\)/.test(lg.html), 'a recipe\'s logs are plain logs only: '+JSON.stringify(lg));
  A(lg.any===7 && /any kind/.test(lg.house) && /\(7\)/.test(lg.house), 'a building cost still takes logs of any kind: '+lg.house);

  // 3. the minimap in a roadside fight goes when the inventory opens
  await ev(()=>{ randomEncounter(false); setUi('playing'); });
  await page.waitForTimeout(1500);
  const m0 = await ev(()=>({ fresh:!!FP.mmBox && performance.now() - FP.mmBox.t < 400 }));
  await ev(()=>setUi('inventory')); await page.waitForTimeout(900);
  const m1 = await ev(()=>{ const rb = document.getElementById('mmRot'); return { stale:!FP.mmBox || performance.now() - FP.mmBox.t > 500, btns:!!rb && rb.style.display!=='none' }; });
  console.log('minimap', JSON.stringify(m0), JSON.stringify(m1));
  A(m0.fresh, 'the fight minimap is drawn while playing');
  A(m1.stale && !m1.btns, 'with the inventory open it is not drawn, nor its turn buttons: '+JSON.stringify(m1));
  await ev(()=>{ setUi('playing'); });

  // 4. an explored doorway is drawn when it's out of sight; an unexplored one isn't
  const dr = await ev(()=>{
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const ds = []; for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++) if (['door','arch','dooro'].includes(G.dungeonDeco[x][y])) ds.push([x, y]);
    if (ds.length < 2) return { n:ds.length };
    for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) G.dungeonSeen[x][y] = false;
    const [a, b] = ds; G.dungeonSeen[a[0]][a[1]] = true;
    const S = fpCollectSprites(new Set()), at = ([x,y])=>S.some(s=>s.model && s.prop && s.prop.kind==='dress' && s.x===x+0.5 && s.y===y+0.5);
    return { n:ds.length, seen:at(a), unseen:at(b) };
  });
  console.log('doors', JSON.stringify(dr));
  A(dr.n >= 2, 'the floor has doorways');
  A(dr.seen && !dr.unseen, 'the explored doorway is drawn out of sight, the unexplored one is not: '+JSON.stringify(dr));

  // 5. the world map follows a drag by the fraction of a tile
  const wm = await ev(()=>{ G.gameMode = 0; G.dungeonDeco = null; setUi('playing'); toggleOwZoom(); G.owZoomScale = 4;
    const c = owZoomCenter(); c.x = Math.floor(OW_COLS/2); c.y = Math.floor(OW_ROWS/2); renderGame(); const a = Object.assign({}, owZoomLastCam);
    c.x += 0.25; c.y += 0.4; renderGame(); const b = Object.assign({}, owZoomLastCam);
    return { open:owMapOpen(), dx:b.x - a.x, dy:b.y - a.y }; });
  console.log('map', JSON.stringify(wm));
  A(wm.open && Math.abs(wm.dx - 0.25) < 1e-6 && Math.abs(wm.dy - 0.4) < 1e-6, 'the map moves by a quarter tile for a quarter-tile drag: '+JSON.stringify(wm));
  await page.screenshot({ path:SHOTS + '/rs411-map.png' });
};
