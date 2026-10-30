// probe: a skill's work through your eyes at moments of its cycle, and the last from above to compare (shots/zfpmir-<k>.jpg, 3 by 2).
// ZTK=woodcutting|mining|fishing|foraging|bury, ZTP='[0,0.3,0.6,0.75,0.9]' seconds into the cycle (fishing: into a cast, ZTL=start|catch|miss),
// ZONE=n also saves the nth full size (shots/zfpmir-one.png)
module.exports = async page=>{ const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4;
    const t = townList()[0]; G.interior = null; G.gameMode = 0; G.mon = [];
    for (const [dx, dy] of [[0,6],[6,0],[0,-6],[-6,0],[7,7],[-7,-7]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y)){ G.owPos = { x, y }; break; } } setUi('playing'); });
  if (process.env.ZFK) await ev(o=>{ Object.assign(FORAGE_K, o); }, JSON.parse(process.env.ZFK));
  await wait(1500); await page.keyboard.press('o'); await wait(2000);
  const k = process.env.ZTK || 'woodcutting', pts = JSON.parse(process.env.ZTP || '[0,0.3,0.6,0.75,0.9]'), last = process.env.ZTL || 'start';
  const found = await ev(async k=>{ if (k==='bury') return true; const P = skP(); P.tools = P.tools || {}; P.tools.axe = P.tools.pick = P.tools.rod = 1;   /* (a real node of the skill, stood beside, and started as the game does) */
    const x0 = G.owPos.x, y0 = G.owPos.y, cands = [];
    for (let r=1; r<40 && cands.length<12; r++) for (let dy=-r; dy<=r; dy++) for (let dx=-r; dx<=r; dx++){ if (Math.max(Math.abs(dx), Math.abs(dy))!==r) continue; const n = skNodeAt(x0+dx, y0+dy);
      if (!n || n.gone || n.shut || n.k!==k || n.gate || n.type==='deep' || skNodeReq(n) > 1) continue; { const c = o3C(n.x, n.y); if (o3InBigTown(c[0], c[1])) continue; }   /* (not one a full-size town has cleared) */
      for (const [ax, ay] of [[0,1],[1,0],[0,-1],[-1,0]]){ const x = n.x+ax, y = n.y+ay; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && G.ow.map[x][y]!==OW_RIVER && o3Passable(x, y) && !owSiteKindAt(x, y) && !skNodeAt(x, y)){ cands.push({ n, x, y }); break; } } }
    for (const best of cands){ G.owPos = { x:best.x, y:best.y }; owReveal(best.x, best.y, 6); for (let i=0;i<60;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
      skDo(skNodeOption(best.n)); if (G.gather){ G.gather.iv = 2800; if (k==='foraging'){ G.gather.iv = 600000; G.gather.next = performance.now() + 600000; } return true; }   /* (a patch picked bare would end it) */ }
    return false; }, k);
  if (!found) throw new Error('no ' + k + ' node near');
  await wait(3500);
  let pin = async t=>{ await ev(([k, t, last])=>{ const e = O3.player.e, now = performance.now();
    if (k==='woodcutting') e.chopT = t; else if (k==='mining') e.mineT = t; else if (k==='foraging') e.forT = t;
    else if (k==='fishing'){ G.gather.iv = 2800; G.gather.next = now + 2800 - t*1000; G.gather.last = last; G.gather.n = last==='start' ? 0 : 1; } }, [k, t, last]); await ev(()=>new Promise(r=>requestAnimationFrame(()=>{ renderGame(); requestAnimationFrame(r); }))); };
  const shots = [];
  if (process.env.ZDBG) console.log('DBG', JSON.stringify(await ev(()=>{ const e = O3.player.e, r = e.rig, T = THREE, f = v=>[+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)], W = o=>f(o.getWorldPosition(new T.Vector3()));
    const a = G.gather && o3ForageAim(G.gather.o); return { aim:a && f(a), shR:W(r.arms[0].sh), elR:W(r.arms[0].el), hR:W(r.arms[0].hand), hold:W(e.holder), hs:e.holder.getWorldScale(new T.Vector3()).x, eye:f(fpwEyeOf(e)), pitch:FP.pitch, forT:e.forT, fdbg:window.__fdbg }; })));
  if (k==='bury'){ await ev(()=>{ PFX.bury = performance.now()/1000; }); pin = async t=>{ await ev(async t=>{ while (performance.now()/1000 - PFX.bury < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, t); }; }   /* (in real time: the view takes its time to look down) */
  for (const t of pts){ await pin(t); if (process.env.ZDBG) console.log('DBG', t, JSON.stringify(await ev(()=>{ const e = O3.player.e, r = e.rig, f = v=>[+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)]; return { hR:f(r.arms[0].hand.getWorldPosition(new THREE.Vector3())), hL:f(r.arms[1].hand.getWorldPosition(new THREE.Vector3())), forT:e.forT, fh:FPW.arms && FPW.arms.map(A=>f(A.h.getWorldPosition(new THREE.Vector3()))), vis:FPW.arms && FPW.arms[0].h.visible, pitch:+(FP.pitch||0).toFixed(3), eye:f(fpwEyeOf(e)), hold:f(e.holder.getWorldPosition(new THREE.Vector3())), mir:!!FPW.mir, work:FPW.work, tip:FPW.held && FPW.cam ? f(new THREE.Vector3(0, 0.7, 0).applyMatrix4(FPW.held.matrix).project(FPW.cam)) : null, cam:FPW.cam && [FPW.cam.fov, FPW.cam.aspect] }; })));shots.push((await page.screenshot({ type:'png' })).toString('base64')); if (process.env.ZONE && +process.env.ZONE===shots.length - 1) require('fs').writeFileSync(SHOTS + '/zfpmir-one.png', Buffer.from(shots[shots.length - 1], 'base64')); }
  await page.keyboard.press('o'); await wait(900); if (k==='bury') await ev(()=>{ PFX.bury = performance.now()/1000 - 0.8; }); await pin(pts[Math.min(1, pts.length - 1)]);
  { const c = await ev(()=>{ const v = new THREE.Vector3(); O3.player.g.getWorldPosition(v); v.y += 0.4; v.project(O3.cam); const r = O3.renderer.domElement.getBoundingClientRect(); return { x:r.left + (v.x*0.5+0.5)*r.width, y:r.top + (-v.y*0.5+0.5)*r.height }; });   /* (your figure close, from above) */
    shots.push((await page.screenshot({ type:'png', clip:{ x:Math.max(0, c.x - 105), y:Math.max(0, c.y - 90), width:210, height:180 } })).toString('base64')); }
  const out = await ev(async shots=>{ const im = await Promise.all(shots.map(s=>new Promise(r=>{ const i = new Image(); i.onload = ()=>r(i); i.src = 'data:image/png;base64,' + s; })));
    const w = im[0].width/2, h = im[0].height/2, c = document.createElement('canvas'); c.width = w*3; c.height = h*2; const g = c.getContext('2d');
    im.forEach((i, n)=>g.drawImage(i, (n%3)*w, Math.floor(n/3)*h, w, h)); return c.toDataURL('image/jpeg', 0.85); }, shots);
  require('fs').writeFileSync(SHOTS + '/zfpmir-' + k + '.jpg', Buffer.from(out.split(',')[1], 'base64'));
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
