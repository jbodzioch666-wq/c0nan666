// runs on an emulated phone (see run.js): real touch input through the DevTools protocol
module.exports = async page=>{
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, pts)=>cdp.send('Input.dispatchTouchEvent', { type, touchPoints:pts.map((p, i)=>({ x:p[0], y:p[1], id:i })) });
  const wait = ms=>page.waitForTimeout(ms);
  const tap = async (x, y)=>{ await touch('touchStart', [[x, y]]); await wait(60); await touch('touchEnd', []); await wait(150); };
  const hold = async (x, y)=>{ await touch('touchStart', [[x, y]]); await wait(800); await touch('touchEnd', []); await wait(200); };
  const pinch = async (cx, cy, d0, d1)=>{ await touch('touchStart', [[cx-d0, cy], [cx+d0, cy]]); for (let i=1;i<=8;i++){ const d = d0 + (d1-d0)*i/8; await touch('touchMove', [[cx-d, cy], [cx+d, cy]]); await wait(40); } await touch('touchEnd', []); await wait(200); };
  const frames = n=>page.evaluate(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n);
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const out = {};

  // the head and the touch mode
  out.head = await page.evaluate(()=>({ vp:!!document.querySelector('meta[name=viewport]'), touch:TOUCH.on, w:innerWidth }));
  A(out.head.vp && out.head.touch && out.head.w===390, 'phone layout and touch mode');

  // onto open ground on the 3D overworld
  const g = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    G.gameMode = 0; o3Pref = true; G.player.turnCount = 60; G.ow.encounters = []; G.player.wildWarned = 1;
    let f = null; for (let x=6;x<OW_COLS-6 && !f;x++) for (let y=6;y<OW_ROWS-6;y++){ let ok = true; for (let i=-4;i<=4 && ok;i++) for (let j=-4;j<=4;j++) if (!o3Passable(x+i,y+j) || OW_SITE_TILES.includes(G.ow.map[x+i][y+j])){ ok = false; break; } if (ok){ f = [x,y]; break; } }
    G.owPos = { x:f[0], y:f[1] }; for (let i=0;i<14;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const r = O3.cv.getBoundingClientRect(); return { o3:o3Active(), cx:r.left + r.width/2, cy:r.top + r.height*0.45, pad:getComputedStyle(document.getElementById('touchControls')).display };
  });
  out.g = g; A(g.o3, 'the 3D overworld'); A(g.pad==='flex', 'the d-pad shows while playing');

  // a tap walks (once the finger lifts)
  await tap(g.cx + 70, g.cy - 40); out.tapPath = await page.evaluate(()=>O3.path.length);
  A(out.tapPath > 0, 'a tap walks');
  await page.evaluate(()=>{ O3.path = []; });
  // a long press opens the menu and doesn't walk
  await hold(g.cx + 70, g.cy - 40); out.long = await page.evaluate(()=>({ ctx:CTX.open, path:O3.path.length }));
  A(out.long.ctx && out.long.path===0, 'a long press opens the menu, without walking');
  await page.evaluate(()=>ctxClose());
  // a pinch zooms, and doesn't walk
  const d0 = await page.evaluate(()=>O3.dist);
  await pinch(g.cx, g.cy, 40, 140); out.zoomIn = await page.evaluate(()=>({ dist:O3.dist, path:O3.path.length }));
  A(out.zoomIn.dist < d0 && out.zoomIn.path===0, 'pinch out zooms in');
  await pinch(g.cx, g.cy, 140, 40); out.zoomOut = await page.evaluate(()=>O3.dist);
  A(out.zoomOut > out.zoomIn.dist, 'pinch in zooms out');

  // the d-pad: a corner steps diagonally
  const p0 = await page.evaluate(()=>({ x:G.owPos.x, y:G.owPos.y }));
  const ur = await page.evaluate(()=>{ const r = document.querySelector('.dpad [data-dir=ur]').getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; });
  await tap(ur[0], ur[1]); const p1 = await page.evaluate(()=>({ x:G.owPos.x, y:G.owPos.y }));
  out.pad = [p1.x-p0.x, p1.y-p0.y]; A(p1.x===p0.x+1 && p1.y===p0.y-1, 'the pad corner steps diagonally');
  // holding walks on
  await touch('touchStart', [ur]); await wait(1100); await touch('touchEnd', []); await wait(100);
  const p2 = await page.evaluate(()=>({ x:G.owPos.x, y:G.owPos.y })); out.held = p2.x - p1.x; A(p2.x - p1.x >= 2, 'holding the pad keeps walking');

  // the hotbar scrolls instead of losing slots
  out.slots = await page.evaluate(()=>{ const el = document.querySelector('.dh-slots'); return el ? { sw:el.scrollWidth, cw:el.clientWidth, ov:getComputedStyle(el).overflowX } : null; });
  A(out.slots && out.slots.ov==='auto', 'the hotbar scrolls');

  // menus hide the pad
  await page.evaluate(()=>{ setUi('inventory'); touchUiSync(); });
  out.padMenu = await page.evaluate(()=>getComputedStyle(document.getElementById('touchControls')).display);
  A(out.padMenu==='none', 'the pad hides behind a menu');
  await page.evaluate(()=>{ setUi('playing'); touchUiSync(); });
  // the pad toggle on the HUD
  await page.evaluate(()=>{ renderGame(); document.querySelector('.dh-tools [data-act=pad]').click(); touchUiSync(); });
  out.padOff = await page.evaluate(()=>getComputedStyle(document.getElementById('touchControls')).display);
  A(out.padOff==='none', 'the pad toggles off');
  await page.evaluate(()=>{ document.querySelector('.dh-tools [data-act=pad]').click(); touchUiSync(); });

  // the world map: a finger drags it, a pinch zooms it
  await page.evaluate(async ()=>{ toggleOwZoom(); G.owZoomScale = 3; for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const m0 = await page.evaluate(()=>{ const c = owZoomCenter(), r = canvas.getBoundingClientRect(); return { x:c.x, y:c.y, s:owZoomScale(), cx:r.left + r.width/2, cy:r.top + r.height/2 }; });
  await touch('touchStart', [[m0.cx, m0.cy]]); for (let i=1;i<=6;i++){ await touch('touchMove', [[m0.cx - i*20, m0.cy - i*10]]); await wait(30); } await touch('touchEnd', []); await wait(150);
  const m1 = await page.evaluate(()=>{ const c = owZoomCenter(); return { x:c.x, y:c.y, ui:G.ui }; });
  out.mapDrag = [+(m1.x-m0.x).toFixed(1), +(m1.y-m0.y).toFixed(1)]; A(m1.x > m0.x && m1.y > m0.y && m1.ui==='playing', 'the map drags (and the drag teleports nowhere)');
  await pinch(m0.cx, m0.cy, 30, 120); out.mapZoom = await page.evaluate(()=>owZoomScale()); A(out.mapZoom > m0.s, 'the map pinches');
  await page.evaluate(()=>toggleOwZoom());

  // the dungeon view: tap to walk, the camera buttons show
  const d = await page.evaluate(async ()=>{
    const s = questNearbySites(G.ow.spawnPos.x, G.ow.spawnPos.y, 1, 80, ['dungeon'])[0] || questNearbySites(G.ow.spawnPos.x, G.ow.spawnPos.y, 1, 80, null)[0];
    G.owPos = { x:s.x, y:s.y }; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon = [];
    for (let i=0;i<14;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } touchUiSync();
    const r = canvas.getBoundingClientRect(); return { iso:isoOn(), rot:getComputedStyle(document.querySelector('.padx')).display, cx:r.left + r.width/2, cy:r.top + r.height*0.4, x:G.player.x, y:G.player.y, rot0:ISO.rot };
  });
  out.dungeon = { iso:d.iso, rot:d.rot }; A(d.iso, 'the dungeon view'); A(d.rot==='flex', 'camera buttons in the dungeon');
  const rb = await page.evaluate(()=>{ const r = document.querySelector('.padx [data-rot=x]').getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; });
  await tap(rb[0], rb[1]); out.rot = await page.evaluate(()=>ISO.rot); A(out.rot!==d.rot0, 'the camera turns');
  await page.screenshot({ path:SHOTS+'/shot_touch_dungeon.png', timeout:120000 });
};
module.exports.mobile = true;
