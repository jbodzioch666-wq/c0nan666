// FP-032: the gathering trees as the land kit's pieces when the land setting is on (SET.tpLand 'model'): an oak, maple, yew, ancient and
// magic tree from o3NodeTree are kit meshes (textured, the leaves tinted to the canopy, the magic leaves glowing) with a trunk factor
// rk for the axe's notch; the willow and a jungle crown stay drawn; with the setting off every tree is drawn. A row of them by you for
// shots/fp032_trees.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; window.__noWarmSlice = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9; G.gameMode = 0; setUi('playing'); });
  await wait(3000);
  const probe = ()=>ev(()=>{ const out = {}; for (const t of ['oak', 'maple', 'yew', 'ancient', 'magic', 'willow']){ const g = o3NodeTree(t, false), ms = []; g.traverse(m=>{ if (m.isMesh) ms.push(m); });
      out[t] = { n:ms.length, kit:ms.length > 0 && ms.every(m=>m.material.map && m.material.map.image), rk:g.userData.rk || 0, glow:ms.some(m=>m.material.emissive && m.material.emissive.r + m.material.emissive.g + m.material.emissive.b > 0.1 && m.material.map), cut:ms.some(m=>m.material.alphaTest > 0), sc:+g.scale.x.toFixed(2) }; }
    const j = o3NodeTree('oak', true); let jn = 0; j.traverse(m=>{ if (m.isMesh && m.material.map) jn++; }); out.jungleKit = jn; return out; });
  const d = await probe(); console.log('drawn', JSON.stringify(d));
  A(['oak', 'maple', 'yew', 'ancient', 'magic', 'willow'].every(t=>!d[t].kit && !d[t].rk), 'every gathering tree drawn with the setting off');
  await ev(()=>{ setSetting('tpLand', 'model'); }); await wait(500);
  const k = await probe(); console.log('kit', JSON.stringify(k));
  for (const t of ['oak', 'maple', 'yew', 'ancient', 'magic']) A(k[t].kit && k[t].rk > 1 && k[t].cut && k[t].n===2, 'the ' + t + ' is the kit tree (two textured parts, a trunk factor): ' + JSON.stringify(k[t]));
  A(k.magic.glow && !k.oak.glow, 'the magic tree glows, the oak not');
  A(!k.willow.kit && !k.willow.rk && k.jungleKit===0, 'the willow and the jungle crown stay drawn');
  for (let i=0;i<30 && !(await ev(()=>typeof O3.heightAt==='function'));i++) await wait(500);   /* (the land built, its height known) */
  A(await ev(()=>typeof O3.heightAt==='function'), 'the 3D land built');
  await ev(()=>{ const T = THREE, [px, pz] = o3C(G.owPos.x, G.owPos.y); let i = 0; for (const t of ['oak', 'maple', 'yew', 'ancient', 'magic', 'willow']){ const g = o3NodeTree(t, false); const x = px - 3.5 + i*1.5, z = pz - 2.5; g.position.set(x, O3.heightAt(x, z), z); O3.scene.add(g); i++; } }); await wait(1500);
  await page.screenshot({ path:SHOTS + '/fp032_trees.png' });
  await ev(()=>{ setSetting('tpLand', 'drawn'); }); await wait(300);
  const d1 = await probe(); A(!d1.oak.kit && !d1.oak.rk, 'drawn again with the setting off');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
