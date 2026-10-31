// FP-010: at work through your eyes you see your own figure's pose - the tool where its hands hold it, your eyes in its head - and the
// skills move as a body would: the rod rests at an angler's slant, foraging crouches down to the plants and picks them, burying bones
// looks down at the hole and back up after. Shots: shots/fp010-forage.jpg (reaching down to a plant), shots/fp010-bury.jpg
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    G.player.clock = DAY_LENGTH*0.4; const t = townList()[0]; G.interior = null; G.gameMode = 0; G.mon = []; const P = skP(); P.tools = P.tools || {}; P.tools.axe = P.tools.pick = P.tools.rod = 1;
    for (const [dx, dy] of [[0,6],[6,0],[0,-6],[-6,0],[7,7],[-7,-7]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y) && o3Passable(x+1, y)){ G.owPos = { x, y }; break; } } setUi('playing'); });
  await wait(1500); await page.keyboard.press('o'); await wait(1500);
  A(await ev(()=>fpvLand()), 'through your eyes on the land');
  const start = k=>ev(k=>{ G.gather = { o:{ k, label:k, at:{ x:G.owPos.x + 1, y:G.owPos.y } }, iv:900000, next:performance.now()+600000, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0, last:'start' }; G.player.facing = 2; FP.lookYaw = null; FP.pitch = 0; }, k);
  const stop = ()=>ev(()=>{ skStop(); G.gather = null; FP.lookYaw = null; FP.pitch = 0; });

  /* ---- chopping: the axe in your view is the figure's axe, seen from its head ---- */
  await start('woodcutting'); await wait(2000);
  const ax = await ev(()=>{ renderGame(); const e = O3.player.e, cam = O3.cam, T = THREE; cam.updateMatrixWorld();
    const a = new T.Vector3().setFromMatrixPosition(FPW.held.matrix), b = e.tool.getWorldPosition(new T.Vector3()).applyMatrix4(cam.matrixWorldInverse);
    return { mir:!!FPW.mir, work:FPW.work, toolOff:a.distanceTo(b), eyeOff:cam.position.distanceTo(fpwEyeOf(e)), fov:FPW.cam.fov===cam.fov, pitch:FP.pitch }; });
  A(ax.mir && ax.work==='axe', 'chopping: your figure\'s pose seen from its eyes: ' + JSON.stringify(ax));
  A(ax.toolOff < 0.06, 'the axe you see is where the figure holds it: ' + JSON.stringify(ax));
  A(ax.eyeOff < 0.06 && ax.fov, 'your eyes in the figure\'s head: ' + JSON.stringify(ax));
  A(ax.pitch < 0.1 && ax.pitch > -0.9, 'looking at the trunk where the axe bites: ' + JSON.stringify(ax));
  await stop(); await wait(500);

  /* ---- fishing: the rod rests at an angler's slant, not near upright ---- */
  await start('fishing'); await wait(1500);
  const rod = await ev(async ()=>{ G.gather.iv = 2800; G.gather.next = performance.now() + 400; for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const e = O3.player.e, T = THREE, q = e.holder.getWorldQuaternion(new T.Quaternion()).invert(), d = new T.Vector3(0,1,0).applyQuaternion(e.tool.getWorldQuaternion(new T.Quaternion())).applyQuaternion(q);
    return { work:FPW.work, elev:Math.asin(d.y)*180/Math.PI }; });
  A(rod.work==='rod' && rod.elev > 25 && rod.elev < 52, 'the rod held out at a slant while you wait for a bite: ' + JSON.stringify(rod));
  await stop(); await wait(500);

  /* ---- foraging: down in a crouch, the hand down to the plants, the view down at them ---- */
  await start('foraging'); await wait(2200);
  const fo = await ev(async ()=>{ const e = O3.player.e, T = THREE, W = o=>o.getWorldPosition(new T.Vector3()); e.forT = FORAGE_P*0.45; renderGame(); await new Promise(r=>requestAnimationFrame(r));
    e.forT = FORAGE_P*0.45; renderGame(); const hs = e.holder.getWorldScale(new T.Vector3()).x, g = W(e.holder).y, a = o3ForageAim(G.gather.o);
    return { work:FPW.work, sh:(W(e.rig.arms[0].sh).y - g)/hs, hand:(W(e.rig.arms[0].hand).y - a.y)/hs, flat:Math.hypot(W(e.rig.arms[0].hand).x - a.x, W(e.rig.arms[0].hand).z - a.z)/hs, pitch:FP.pitch }; });
  A(fo.work==='forage', 'foraging through your eyes: ' + JSON.stringify(fo));
  A(fo.sh < 0.5, 'down in a crouch, the shoulders low: ' + JSON.stringify(fo));
  A(fo.hand < 0.22 && fo.flat < 0.3, 'the hand down at the plants: ' + JSON.stringify(fo));
  A(fo.pitch < -0.6, 'looking down at them: ' + JSON.stringify(fo));
  await page.screenshot({ path:SHOTS + '/fp010-forage.jpg', type:'jpeg', quality:82 });
  await stop(); await wait(500);

  /* ---- burying bones: the view goes down to the hole and comes back up ---- */
  const p0 = await ev(()=>FP.pitch||0);
  await ev(()=>{ PFX.bury = performance.now()/1000; }); await wait(1000);
  const bu = await ev(()=>({ work:FPW.work, pitch:FP.pitch, vis:FPW.arms.every(A=>A.h.visible || A.g.visible) }));
  A(bu.work==='bury' && bu.pitch < -0.9, 'kneeling to bury, looking down at the hole: ' + JSON.stringify(bu));
  await page.screenshot({ path:SHOTS + '/fp010-bury.jpg', type:'jpeg', quality:82 });
  await wait(2000);
  const up = await ev(()=>({ work:FPW.work, pitch:FP.pitch, ly:FP.lookYaw, fov:FPW.cam.fov, near:FPW.cam.near, wp:!!(FPW.mir && FPW.mir.wp) }));
  A(!up.work && Math.abs(up.pitch - p0) < 0.1 && up.ly==null, 'and back up after, as you were: ' + JSON.stringify(up));
  A(up.wp, 'your hands back to your weapon after work (FP-017: your figure\'s own, put away): ' + JSON.stringify(up));
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
