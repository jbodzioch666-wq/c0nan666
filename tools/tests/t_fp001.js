// FP-001: the first-person view below ground. O turns it on: the camera stands at eye height in your tile looking the way you face,
// a ceiling is built over you and your own figure is hidden. W walks forward, S back, A and D step aside keeping your facing, Z and X
// turn, the d-pad walks and turns, the minimap turns with you. O again brings back the view from above.
// Shots: shots/fp001-iso.jpg, shots/fp001-fp.jpg
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), frames = n=>ev(async n=>{ const t = performance.now() + n*20; for (let i=0; i<n || performance.now() < t; i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, n);   /* (at least n frames of 20 ms: a fast screen runs frames quicker than the easing) */
  await ev(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await frames(50);
  const st = ()=>ev(async ()=>{ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const c = FPD.cam, d = new THREE.Vector3(); c.getWorldDirection(d); const p = G.player;
    return { fpv:fpv(), y:c.position.y, dx:d.x, dz:d.z, cx:c.position.x, cz:c.position.z, px:p.x, py:p.y, f:p.facing, held:ISO.player && ISO.player.holder.visible,
      ceil:FPD.world.children.some(m=>m.userData.fk==='ceil'), mini:fpMiniYaw(), shot:FPD.r.domElement.toDataURL('image/jpeg', 0.8) }; });
  const iso = await st(); A(!iso.fpv && iso.y > 3, 'seen from above at first: y ' + iso.y.toFixed(2)); A(iso.held, 'your figure seen from above'); A(!iso.ceil, 'no ceiling from above');
  /* a way to face with open floor ahead, behind and to the left */
  await ev(()=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y) && !(G.dungeonDeco && G.dungeonDeco[x] && G.dungeonDeco[x][y]);   /* (plain floor: not the stairs you came down) */
    let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) if (ok(x, y)) for (let f=0; f<4; f++){ const F = FACING_VECT[f], L = FACING_VECT[(f+3)%4], d = Math.hypot(x - p.x, y - p.y);
      if (d < bd && ok(x+F[0], y+F[1]) && ok(x-F[0], y-F[1]) && ok(x+L[0], y+L[1]) && ok(x+F[0]+L[0], y+F[1]+L[1])){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; });
  await frames(40);
  await page.keyboard.press('o'); await frames(40);
  const fp = await st(); const F0 = await ev(()=>FACING_VECT[G.player.facing]);
  A(fp.fpv, 'O turns the first-person view on'); A(Math.abs(fp.y - 0.62) < 0.05, 'the camera at eye height: ' + fp.y.toFixed(3));
  A(Math.hypot(fp.cx - (fp.px + 0.5), fp.cz - (fp.py + 0.5)) < 0.5, 'the camera in your tile');
  A(fp.dx*F0[0] + fp.dz*F0[1] > 0.95, 'looking the way you face: ' + [fp.dx.toFixed(2), fp.dz.toFixed(2)] + ' vs ' + F0 + ' ' + JSON.stringify(await ev(()=>[FP.cam, G.player.facing, G.player.x, G.player.y, ISO.player.pos, FPD.cam.position])));
  A(!fp.held, 'your own figure hidden'); A(fp.ceil, 'a ceiling over you');
  { const mx = Math.cos(fp.mini)*F0[0] - Math.sin(fp.mini)*F0[1], my = Math.sin(fp.mini)*F0[0] + Math.cos(fp.mini)*F0[1]; A(my < -0.95 && Math.abs(mx) < 0.2, 'the minimap shows your facing up: ' + [mx.toFixed(2), my.toFixed(2)]); }
  fs.writeFileSync(SHOTS + '/fp001-iso.jpg', Buffer.from(iso.shot.split(',')[1], 'base64')); fs.writeFileSync(SHOTS + '/fp001-fp.jpg', Buffer.from(fp.shot.split(',')[1], 'base64'));
  /* W forward, S back, A aside keeping the facing */
  /* (FP-003: walking is free - a key held until you're over into the next tile) */
  const toTile = (async k=>{ const t0 = await ev(()=>[G.player.x, G.player.y]); await page.keyboard.down(k); await ev(async t0=>{ const end = performance.now() + 2000; while (performance.now() < end && G.player.x===t0[0] && G.player.y===t0[1]){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, t0); await page.keyboard.up(k); });
  const walk = async (k, want, msg)=>{ const b = await st(); await toTile(k); await frames(10); const a = await st();
    A(a.px===b.px+want[0] && a.py===b.py+want[1], msg + ': moved ' + [a.px-b.px, a.py-b.py] + ', wanted ' + want); A(a.f===b.f, msg + ': still facing ' + b.f + ', now ' + a.f); return a; };
  const L0 = await ev(()=>FACING_VECT[(G.player.facing+3)%4]);
  await walk('w', F0, 'W walks forward');
  await walk('s', [-F0[0], -F0[1]], 'S walks back');
  const a1 = await walk('a', L0, 'A steps left');
  A(Math.floor(a1.cx)===a1.px && Math.floor(a1.cz)===a1.py, 'the camera followed the step');
  await walk('d', [-L0[0], -L0[1]], 'D steps right');
  /* Z and X turn, the camera with them */
  const f0 = (await st()).f; await page.keyboard.press('z'); await frames(30); const z = await st(); A(z.f===(f0+3)%4, 'Z turns left: ' + f0 + ' to ' + z.f);
  { const F = await ev(()=>FACING_VECT[G.player.facing]); A(z.dx*F[0] + z.dz*F[1] > 0.9, 'the camera turned with you'); A(z.px===fp.px && z.py===fp.py, 'turning stays put'); }
  await page.keyboard.press('x'); await frames(5); A((await st()).f===f0, 'X turns back');
  /* the d-pad: up walks forward, the sides turn */
  const pd = await ev(()=>{ const p = G.player, b = [p.x, p.y, p.facing]; padStep('right'); const t = p.facing; padStep('left'); padStep('up'); return { b, t, f:p.facing }; });
  await frames(40); const pa = await st();
  A(pd.t===(pd.b[2]+1)%4 && pd.f===pd.b[2], 'the pad turns right and back'); A(pa.px===pd.b[0]+F0[0] && pa.py===pd.b[1]+F0[1], 'the pad walks forward');
  /* the turn buttons turn you */
  await ev(()=>viewRotate(1)); A((await st()).f===(f0+1)%4, 'the turn button turns you'); await ev(()=>viewRotate(-1));
  /* O again: from above */
  await page.keyboard.press('o'); await frames(40); const back = await st();
  A(!back.fpv && back.y > 3, 'O brings back the view from above: y ' + back.y.toFixed(2)); A(back.held, 'your figure seen again'); A(!back.ceil, 'the ceiling gone');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
