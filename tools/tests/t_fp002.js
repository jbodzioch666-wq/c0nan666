// FP-002: mouse look in the first-person view. Holding the right mouse button and dragging turns the view round and up and
// down; you face the quarter you look toward, so W walks that way; the look stays after you let go; a drag doesn't open the
// menu but a right-click without one does; Z turns you square to a quarter again and the view comes level.
// Shot: shots/fp002-look.jpg
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), frames = n=>ev(async n=>{ const t = performance.now() + n*20; for (let i=0; i<n || performance.now() < t; i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, n);
  await ev(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await frames(50);
  /* plain floor with floor on all four sides */
  await ev(()=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y) && !(G.dungeonDeco && G.dungeonDeco[x] && G.dungeonDeco[x][y]);
    let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) if (ok(x, y) && FACING_VECT.every(F=>ok(x+F[0], y+F[1]))){ const d = Math.hypot(x - p.x, y - p.y); if (d < bd){ bd = d; best = [x, y]; } }
    p.x = best[0]; p.y = best[1]; p.facing = 0; });
  await page.keyboard.press('o'); await frames(40);
  const st = ()=>ev(()=>{ const d = new THREE.Vector3(); FPD.cam.getWorldDirection(d); const p = G.player;
    return { f:p.facing, a:FP.cam.a, look:FP.lookYaw, pitch:FP.pitch||0, yaw:Math.atan2(d.z, d.x), dy:d.y, px:p.x, py:p.y, ctx:CTX.open, cur:canvas.style.cursor }; });
  const s0 = await st(); A(s0.look==null && Math.abs(s0.yaw + Math.PI/2) < 0.02, 'facing north at first: ' + s0.yaw.toFixed(3));
  const box = await page.evaluate(()=>{ const r = canvas.getBoundingClientRect(); return { x:r.left + r.width/2, y:r.top + r.height*0.45 }; });
  let DX = 0, DY = 0;
  const drag = async (dx, dy, steps)=>{ for (let i=1; i<=steps; i++) await page.mouse.move(box.x + DX + dx*i/steps, box.y + DY + dy*i/steps); DX += dx; DY += dy; };
  await page.mouse.move(box.x, box.y); await page.mouse.down({ button:'right' });
  /* 100 px right: a little to the right, still facing north */
  await drag(100, 0, 10); await frames(5); const s1 = await st();
  A(s1.look!=null && Math.abs(s1.yaw - (-Math.PI/2 + 0.45)) < 0.06, 'turned right with the mouse: ' + s1.yaw.toFixed(3)); A(s1.f===0, 'still facing north: ' + s1.f);
  A(s1.cur==='none', 'the cursor hidden while looking');
  /* 150 px more: past the half-way, facing east */
  await drag(150, 0, 10); await frames(5); const s2 = await st();
  A(Math.abs(s2.yaw - (-Math.PI/2 + 1.125)) < 0.08, 'turned on: ' + s2.yaw.toFixed(3)); A(s2.f===1, 'now facing east: ' + s2.f);
  /* up: looking up */
  await drag(0, -100, 10); await frames(5); const s3 = await st();
  A(s3.pitch > 0.4 && s3.dy > 0.35, 'looking up: pitch ' + s3.pitch.toFixed(2) + ', dir y ' + s3.dy.toFixed(2));
  const shot = await ev(async ()=>{ renderGame(); await new Promise(r=>requestAnimationFrame(r)); return FPD.r.domElement.toDataURL('image/jpeg', 0.8); });
  fs.writeFileSync(SHOTS + '/fp002-look.jpg', Buffer.from(shot.split(',')[1], 'base64'));
  await drag(0, 100, 5); await page.mouse.up({ button:'right' }); await frames(20); const s4 = await st();
  A(!s4.ctx, 'no menu after a look round'); A(s4.cur!=='none', 'the cursor back');
  A(Math.abs(s4.yaw - s2.yaw) < 0.03 && s4.look!=null, 'the look stays where it was left: ' + s4.yaw.toFixed(3) + ' vs ' + s2.yaw.toFixed(3));
  A(Math.abs(s4.pitch) < 0.05, 'level again after looking back down: ' + s4.pitch.toFixed(3));
  /* W walks the way you face (east), the look kept */
  await page.keyboard.press('w'); await frames(40); const s5 = await st();
  A(s5.px===s4.px+1 && s5.py===s4.py, 'W walked east: ' + [s5.px-s4.px, s5.py-s4.py]); A(s5.look!=null && Math.abs(s5.yaw - s4.yaw) < 0.03, 'the look kept while walking');
  /* a right-click without a drag: the menu */
  await page.mouse.click(box.x, box.y + 120, { button:'right' }); await frames(5); const s6 = await st();
  A(s6.ctx, 'a right-click still opens the menu'); await ev(()=>{ try{ ctxClose(); }catch(e){} });
  A(Math.abs(s6.yaw - s4.yaw) < 0.03, 'a click doesn\'t turn the view');
  /* Z: a quarter left from east, square to it */
  await page.keyboard.press('z'); await frames(40); const s7 = await st();
  A(s7.f===0 && s7.look==null && Math.abs(s7.yaw + Math.PI/2) < 0.03, 'Z turns you square to north: ' + [s7.f, s7.yaw.toFixed(3)]);
  /* look up, then turn: the view comes level */
  await page.mouse.move(box.x, box.y); await page.mouse.down({ button:'right' }); DX = 0; DY = 0; await drag(0, -80, 8); await page.mouse.up({ button:'right' });
  A((await st()).pitch > 0.3, 'looked up again'); await page.keyboard.press('x'); await frames(50); const s8 = await st();
  A(Math.abs(s8.pitch) < 0.05 && s8.f===1, 'X turns and the view comes level: ' + s8.pitch.toFixed(3));
  /* O off and on: looks square ahead */
  await page.keyboard.press('o'); await frames(10); await page.keyboard.press('o'); await frames(30); const s9 = await st();
  A(s9.look==null && Math.abs(s9.pitch) < 0.01, 'turning the view on starts square and level');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
