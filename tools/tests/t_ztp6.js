// (art probe, not in ALL) FP-021: the sculpted figure in a town (V3) and on the open land (O3), standing and walking: close shots into shots/ztp6_<name>.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 300)); });
  const fs = require('fs');
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const shot = (who, name, yaw)=>ev(([who, yaw])=>{ const T = THREE, W = who==='o3' ? O3 : V3, P = W.player, e = P && P.e; if (!e) return null; e.holder.updateMatrixWorld(true);
    const bb = new T.Box3().setFromObject(e.tp ? e.tp.root : e.holder), h = Math.max(0.2, bb.max.y - bb.min.y), c = bb.getCenter(new T.Vector3()), R = W.renderer, cv = R.domElement;
    const cam = new T.PerspectiveCamera(30, cv.width/cv.height, 0.01, 200), a = (P.yaw!=null ? P.yaw : e.face || 0) + yaw; cam.position.set(c.x + Math.sin(a)*h*3.2, c.y + h*0.35, c.z + Math.cos(a)*h*3.2); cam.lookAt(c);
    R.render(W.scene, cam); return cv.toDataURL('image/png'); }, [who, yaw]).then(u=>{ if (u) fs.writeFileSync(SHOTS + '/ztp6_' + name + '.png', Buffer.from(u.split(',')[1], 'base64')); });
  const state = who=>ev(who=>{ const P = who==='o3' ? O3.player : V3.player, e = P && P.e, tp = e && e.tp; if (!tp) return { tp:false, P:!!P, mode:G.gameMode };
    let vis = 0; for (const m of tp.meshes){ let v = true; for (let a = m; a; a = a.parent) if (!a.visible) v = false; vis += v; }
    return { tp:true, kit:tp.kit, meshes:tp.meshes.length, vis, shown:tp.hide.filter(m=>m.visible).length, wUp:+tp.wUp.toFixed(2), wLeg:+tp.wLeg.toFixed(2), jog:+tp.jogK.toFixed(2) }; }, who);
  const hold = async (key, ms)=>{ await page.keyboard.down(key); await wait(ms); };
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9; SET.tpBody = 'model';
    if (G.gameMode!==3){ const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.interior = null; });
  await wait(2500); console.log('v3 stand', JSON.stringify(await state('v3'))); await shot('v3', 'v3_front', 0); await shot('v3', 'v3_side', Math.PI/2);
  await hold('s', 500); console.log('v3 walk', JSON.stringify(await state('v3'))); await shot('v3', 'v3_walk', Math.PI/2); await page.keyboard.up('s');
  await ev(()=>{ SET.tpBody = 'drawn'; }); await wait(800); console.log('v3 drawn', JSON.stringify(await state('v3')));
  await ev(()=>{ SET.tpBody = 'model'; const t = townList()[0]; G.interior = null; G.gameMode = 0; G.owPos = { x:t.x + 2, y:t.y + 2 }; setUi('playing'); PFX.camp = -1e9; });
  await wait(3000); console.log('o3 stand', JSON.stringify(await state('o3'))); await shot('o3', 'o3_front', 0); await shot('o3', 'o3_side', Math.PI/2);
  await hold('d', 600); console.log('o3 walk', JSON.stringify(await state('o3'))); await shot('o3', 'o3_walk', Math.PI/2); await page.keyboard.up('d');
  if (errs.length) console.log('ERRS', errs.join(' | '));
};
