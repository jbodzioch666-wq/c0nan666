// FP-005: aiming with the right mouse button held. The mouse is held to the middle of the view (pointer lock where the page may),
// a crosshair is drawn there, and a left click while aiming strikes what's under the crosshair, not under the cursor; letting go
// gives the cursor back; without aiming a left click is at the cursor; a creature aimed at that can't be reached says why.
// Shot: shots/fp005-aim.jpg
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  const at = await ev(()=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y) && !(G.dungeonDeco && G.dungeonDeco[x] && G.dungeonDeco[x][y]);
    let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f]; let good = true; for (let k=0; k<=4 && good; k++) good = ok(x+F[0]*k, y+F[1]*k);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2];
    window.__fights = 0; const f0 = fight; window.fight = (...a)=>{ window.__fights++; return f0(...a); };
    window.__msgs = []; const l0 = logMsg; window.logMsg = (m, ...a)=>{ window.__msgs.push(String(m)); return l0(m, ...a); };
    return { x:p.x, y:p.y, F:FACING_VECT[p.facing] }; });
  await page.keyboard.press('o'); await wait(800);
  await ev(()=>{ window.__noLock = true; });   /* (held, the real mouse on this PC turns the view too: the lock is checked on its own at the end) */
  const goblin = k=>ev(([at, k])=>{ G.mon.forEach(m=>{ m.alive = 0; }); const m = newMonster(); G.mon.push(m);
    Object.assign(m, { alive:1, x:at.x + at.F[0]*k, y:at.y + at.F[1]*k, hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin', col:'#8f8', art:null, abilities:[], stunTurns:999 }); }, [at, k]);   /* (stunned: it stays where it's put) */
  const st = ()=>ev(()=>({ fights:window.__fights, on:FPL.on, locked:document.pointerLockElement===canvas, cur:canvas.style.cursor, msgs:window.__msgs.slice(-4) }));
  const side = await ev(()=>{ const r = canvas.getBoundingClientRect(); return { x:r.left + r.width*0.12, y:r.top + r.height*0.5 }; });
  await goblin(1); await wait(1400);
  /* the goblin is in the middle, the cursor far off to the left over nothing: a plain left click there is a swing at the air - which
     (FP-018) lands at its contact on whatever stands within reach before you: the goblin, though the cursor was off it */
  await page.mouse.move(side.x, side.y); await page.mouse.click(side.x, side.y); await wait(500);
  A((await st()).fights===1, 'but the swing lands on the goblin before you (FP-018)'); await ev(()=>{ window.__fights = 0; });
  await wait(1400);
  /* aiming: the right button held where the cursor is */
  await page.mouse.down({ button:'right' }); await wait(300); const s1 = await st();
  A(s1.on, 'holding the right button aims');
  const cross = await ev(async ()=>{ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const d = ctx.getImageData(canvas.width/2 - 1, canvas.height/2 - 1, 3, 3).data; let b = 0; for (let i=0;i<d.length;i+=4) b = Math.max(b, d[i+3] > 200 ? d[i] : 0);
    const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height; const g = c.getContext('2d'); g.drawImage(FPD.cv, 0, 0, c.width, c.height); g.drawImage(canvas, 0, 0); return { b, shot:c.toDataURL('image/jpeg', 0.8) }; });
  A(cross.b > 200, 'a crosshair in the middle: ' + cross.b); fs.writeFileSync(SHOTS + '/fp005-aim.jpg', Buffer.from(cross.shot.split(',')[1], 'base64'));
  /* a left click while aiming: at the crosshair - the goblin - though the cursor was far to the left */
  await page.mouse.down({ button:'left' }); await wait(200); await page.mouse.up({ button:'left' }); await wait(450); const s2 = await st();   /* (FP-018: landed at its contact) */
  A(s2.fights===1, 'a left click while aiming strikes the goblin under the crosshair: ' + s2.fights);
  await page.mouse.up({ button:'right' }); await wait(300); const s3 = await st();
  A(!s3.on && !s3.locked && s3.cur!=='none', 'letting go gives the cursor back');
  /* out of reach: told why */
  await page.keyboard.press('z'); await page.keyboard.press('x'); await wait(600); await goblin(3); await wait(1400);
  await page.mouse.move(side.x, side.y); await page.mouse.down({ button:'right' }); await wait(300); await page.mouse.down({ button:'left' }); await wait(100); await page.mouse.up({ button:'left' }); await page.mouse.up({ button:'right' }); await wait(300);
  const s4 = await st(); A(s4.fights===1, 'a goblin three tiles off isn\'t struck with a blade');
  A(s4.msgs.some(m=>/out of reach/.test(m)), 'it says it\'s out of reach: ' + JSON.stringify(s4.msgs));
  /* the mouse held to the middle while you aim, its moves turning the view, and given back after */
  await ev(()=>{ window.__noLock = false; }); await page.mouse.down({ button:'right' }); await wait(400); const s5 = await st(); console.log('pointer lock in the test browser: ' + s5.locked);
  if (s5.locked){ const a0 = await ev(()=>FP.cam.a); await ev(()=>{ FPL.skip = 0; window.dispatchEvent(new MouseEvent('mousemove', { movementX:100, movementY:0, buttons:2, bubbles:true })); }); await wait(100);
    const a1 = await ev(()=>FP.cam.a); A(Math.abs(a1 - a0 - 0.45) < 0.1, 'the held mouse turns the view: ' + (a1 - a0).toFixed(3)); }
  await page.mouse.up({ button:'right' }); await wait(300); const s6 = await st(); A(!s6.on && !s6.locked && s6.cur!=='none', 'letting go of the held mouse gives the cursor back');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
