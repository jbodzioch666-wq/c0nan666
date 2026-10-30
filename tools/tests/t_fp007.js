// FP-007: the whole game in first person. In a town and on the open land the O key puts the view behind your eyes as below
// ground: the camera at eye height where you stand, your figure hidden, hands drawn over the view; W walks freely and crosses
// into the next tile as a step, Z turns, the right mouse button looks round, the left one is the town's click at the cursor.
// O again puts the view back above. Shots: shots/fp007-town.jpg, shots/fp007-land.jpg
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    if (G.gameMode!==3){ const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.interior = null; G.player.clock = DAY_LENGTH*0.4; });
  await wait(1500);
  /* face a way with two open tiles ahead */
  const face = ()=>ev(()=>{ const p = G.player, h = fpmHere();
    for (let f=0; f<4; f++){ const F = FACING_VECT[f]; if (!fpmSolid(h[0]+F[0], h[1]+F[1]) && !fpmSolid(h[0]+2*F[0], h[1]+2*F[1])){ p.facing = f; FP.lookYaw = null; FX.a = null; return f; } }
    return -1; });
  const hold = async (key, ok, ms)=>{ await page.keyboard.down(key); const t = Date.now(); let r = false; while (Date.now() - t < ms){ await wait(60); if (await ev(ok)){ r = true; break; } } await page.keyboard.up(key); await wait(200); return r; };
  const shoot = async name=>{ await wait(300); await page.screenshot({ path:SHOTS + '/' + name, type:'jpeg', quality:85 }); };

  /* ---- a town ---- */
  A(await ev(()=>G.gameMode===3 && v3Active()), 'in a town, drawn in 3D');
  await page.keyboard.press('o'); await wait(900);
  const t1 = await ev(()=>{ const c = V3.cam.position, g = V3.player.g.position; return { on:fpvTown(), dxz:Math.hypot(c.x - g.x, c.z - g.z), eye:c.y - g.y, vis:V3.player.g.visible, fov:V3.cam.fov, near:V3.cam.near,
    hands:!!FPW.dom && FPW.cv.style.display==='block' && FPW.cv.parentNode===V3.cv.parentNode && FPW.cv.previousSibling===V3.cv }; });
  A(t1.on, 'O turns the first-person view on in a town');
  A(t1.dxz < 0.35 && t1.eye > 0.6 && t1.eye < 1.3, 'the camera at your eyes where you stand: ' + t1.dxz.toFixed(2) + ' off, ' + t1.eye.toFixed(2) + ' up');
  A(!t1.vis, 'your own figure hidden: ' + JSON.stringify(t1)); A(t1.fov > 50 && t1.near < 0.1, 'a wide, near view: ' + t1.fov.toFixed(1));
  A(t1.hands, 'hands drawn over the town\'s view');
  await shoot('fp007-town.jpg');
  let f = await face(); A(f >= 0, 'an open way to walk in town'); await wait(500);
  const p0 = await ev(()=>{ window.__p0 = { x:G.player.x, y:G.player.y }; return window.__p0; });
  await hold('w', ()=>G.player.x!==window.__p0.x || G.player.y!==window.__p0.y, 2500);
  const t2 = await ev(([p0, f])=>{ const F = FACING_VECT[f]; return { x:G.player.x, y:G.player.y, ok:G.player.x===p0.x+F[0] && G.player.y===p0.y+F[1], fm:Math.floor(FPM.x)===G.player.x && Math.floor(FPM.y)===G.player.y, mode:G.gameMode, ui:G.ui }; }, [p0, f]);
  A(t2.ok, 'W walks you one tile on: ' + JSON.stringify([p0, t2]));
  A(t2.fm, 'your eyes walked there too');
  const a0 = await ev(()=>FX.a); await page.keyboard.press('z'); await wait(700); const a1 = await ev(()=>FX.a);
  A(Math.abs(Math.abs(Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0))) - Math.PI/2) < 0.05, 'Z turns a quarter: ' + a0.toFixed(2) + ' to ' + a1.toFixed(2));
  /* the right button looks round */
  const box = await ev(()=>{ const r = V3.cv.getBoundingClientRect(); return { x:r.left, y:r.top, w:r.width, h:r.height }; });
  const cx = box.x + box.w/2, cy = box.y + box.h/2;
  await page.mouse.move(cx, cy); await page.mouse.down({ button:'right' }); for (let i=1; i<=8; i++){ await page.mouse.move(cx + i*15, cy); await wait(30); } await page.mouse.up({ button:'right' }); await wait(200);
  const a2 = await ev(()=>FX.a); A(Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1))) > 0.15, 'the right mouse button turns the view: ' + a1.toFixed(2) + ' to ' + a2.toFixed(2));
  /* the left one is the town's own click, at the cursor */
  await ev(()=>{ window.__clk = 0; const o = v3Click; v3Click = e=>{ window.__clk++; window.__clkAt = [e.clientX, e.clientY]; }; window.__v3c = o; });
  await page.mouse.click(cx + 40, cy + 60); await wait(200);
  const clk = await ev(()=>{ v3Click = window.__v3c; return { n:window.__clk, at:window.__clkAt }; });
  A(clk.n===1 && Math.abs(clk.at[0] - cx - 40) < 1, 'a left click is the town\'s click at the cursor: ' + JSON.stringify(clk));

  /* ---- inside: the near walls stand full height ---- */
  await ev(()=>{ enterInterior('tavern'); setUi('playing'); }); await wait(2000);
  const room = await ev(()=>{ const z = ROOM.y1 + 1.15; let tall = 0, over = 0; V3.world.traverse(o=>{ if (!o.isMesh || !o.geometry || !o.geometry.parameters) return; const w = o.getWorldPosition(new THREE.Vector3()), h = o.geometry.parameters.height; if (Math.abs(w.z - z) > 0.05) return; if (h > 2) tall++; if (w.y > 2 && h > 0.4 && h < 1) over++; });
    return { int:G.interior && G.interior.key, on:fpvTown(), tall, over, hid:!V3.player.g.visible }; });
  A(room.int==='tavern' && room.on && room.hid, 'first person inside the tavern: ' + JSON.stringify(room));
  A(room.tall >= 2 && room.over >= 1, 'its front wall stands full height either side of the door, with the wall over it: ' + JSON.stringify(room));
  await ev(()=>{ exitInterior(); setUi('playing'); }); await wait(800);

  /* ---- the open land ---- */
  await ev(()=>{ const t = townList()[0]; G.interior = null; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; setUi('playing');
    for (const [dx, dy] of [[2,0],[-2,0],[0,2],[0,-2],[3,0],[-3,0],[0,3],[0,-3],[3,3],[-3,-3]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y)){ G.owPos = { x, y }; break; } } });
  await wait(2500);
  const l1 = await ev(()=>{ const c = O3.cam.position, l = o3PL(), gy = O3.heightAt(FPM.x, FPM.y); return { on:fpvLand(), dxz:Math.hypot(c.x - FPM.x, c.z - FPM.y), tile:Math.floor(FPM.x)===l.x && Math.floor(FPM.y)===l.y, eye:c.y - gy, vis:O3.player.g.visible, fogN:O3.scene.fog.near,
    hands:FPW.cv.style.display==='block' && FPW.cv.previousSibling===O3.cv }; });
  A(l1.on, 'the first-person view carries on out on the land');
  A(l1.tile && l1.dxz < 0.2 && l1.eye > 0.55 && l1.eye < 1.3, 'the camera at your eyes on your tile: ' + JSON.stringify(l1));
  A(!l1.vis && l1.hands, 'your figure hidden, your hands over the land');
  A(l1.fogN < 15, 'the haze drawn in to hide where the built land ends: ' + l1.fogN);
  await shoot('fp007-land.jpg');
  f = await face(); A(f >= 0, 'an open way to walk on the land'); await wait(500);
  const o0 = await ev(()=>({ x:G.owPos.x, y:G.owPos.y })); await ev(o=>{ window.__o0 = o; }, o0);
  const wentL = await hold('w', ()=>G.owPos.x!==window.__o0.x || G.owPos.y!==window.__o0.y || G.gameMode!==0 || G.ui!=='playing', 3000);
  const l2 = await ev(()=>({ pos:G.owPos, mode:G.gameMode, ui:G.ui }));
  A(wentL, 'W walks you over the land into the next tile: ' + JSON.stringify([o0, l2]));

  /* ---- O again: seen from above ---- */
  if (l2.ui!=='playing' || l2.mode!==0){ await ev(()=>{ setUi('playing'); }); }
  await page.keyboard.press('o'); await wait(800);
  const back = await ev(()=>({ on:fpvAny(), fov:O3.cam.fov, vis:O3.player.g.visible, hands:FPW.cv.style.display }));
  A(!back.on && back.fov===34 && back.vis && back.hands==='none', 'O puts the view back above, your figure shown: ' + JSON.stringify(back));
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
