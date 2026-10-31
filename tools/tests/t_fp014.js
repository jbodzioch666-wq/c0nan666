// FP-014: through your eyes on a phone, the d-pad's walk stops when you let go - it held its key down for good in a town or on the
// land, so you walked on until the Peddler's desk stopped you and the shop opened, and walked back into it each time it was shut.
// A menu opening lets go of the walk too.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    if (G.gameMode!==3){ const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.interior = null; G.player.clock = DAY_LENGTH*0.4; });
  await wait(1500); await ev(()=>{ enterInterior('shop'); setUi('playing'); if (!SET.fpView) fpvToggle(); }); await wait(1500);
  A(await ev(()=>fpvTown() && G.interior && G.interior.key==='shop'), 'through your eyes in the Peddler\'s shop');
  const st = ()=>ev(()=>({ ui:G.ui, x:+FPM.x.toFixed(3), y:+FPM.y.toFixed(3), held:[...(ISO.held||[])] }));
  const at = (x, y)=>ev(([x, y])=>{ if (G.ui!=='playing') setUi('playing'); const p = G.player; p.x = x; p.y = y; p.facing = 0; p.faceDiag = null; FPM.key = null; FP.lookYaw = null; ISO.held && ISO.held.clear(); }, [x, y]);
  const pad = (type)=>ev(type=>{ const b = document.querySelector('.dpad [data-dir="up"]'); b.dispatchEvent(new PointerEvent(type, { bubbles:true, pointerId:7, isPrimary:true, pointerType:'touch' })); }, type);
  A(await ev(()=>{ const b = document.querySelector('.dpad [data-dir="up"]'); return !!b && b.offsetParent!==null; }), 'the d-pad on the screen');

  /* held a moment on the open floor, then let go: you stop */
  await at(10, 12); await wait(500);
  const s0 = await st(); await pad('pointerdown'); await wait(450); const s1 = await st(); await pad('pointerup'); await wait(150);
  A(s1.y < s0.y - 0.2 && s1.held.includes('arrowup'), 'held up on the pad: you walk forward: ' + JSON.stringify([s0, s1]));
  const s2 = await st(); await wait(1200); const s3 = await st();
  A(!s3.held.length && Math.abs(s3.y - s2.y) < 0.02, 'let go: you stop where you are: ' + JSON.stringify([s2, s3]));

  /* held into the desk: the shop opens; let go, shut it, and you don't walk back into it */
  await at(10, 9); await wait(500);
  await pad('pointerdown'); let s; for (let i=0; i<40; i++){ await wait(100); s = await st(); if (s.ui!=='playing') break; }
  A(s.ui==='shop', 'walked into the desk: the shop opens: ' + JSON.stringify(s));
  await pad('pointerup'); await wait(200); await ev(()=>setUi('playing')); await wait(200);
  const d0 = await st(); await wait(1500); const d1 = await st();
  A(d1.ui==='playing' && !d1.held.length && Math.hypot(d1.x - d0.x, d1.y - d0.y) < 0.02, 'the shop shut: you stand at the desk, not walking into it again: ' + JSON.stringify([d0, d1]));

  /* a menu opening lets go of a walk that was never let go of */
  await at(10, 12); await wait(400);
  await ev(()=>{ ISO.held.add('w'); }); await wait(300); await ev(()=>setUi('inventory')); await wait(300); await ev(()=>setUi('playing'));
  const m0 = await st(); await wait(1000); const m1 = await st();
  A(!m1.held.length && Math.abs(m1.y - m0.y) < 0.02, 'a menu opened lets go of the walk: ' + JSON.stringify([m0, m1]));
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
module.exports.mobile = true;
