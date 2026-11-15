// RS-788: RS-785's real grass on the open land was too much, and is gone: no blade chunks, its code out, the land's older grass back. The shire's own grass in town stays (rs779)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e)));
  const r = await page.evaluate(async ()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = Math.round(DAY_LENGTH*0.4); const t0 = performance.now(); while ((!O3.land || !O3.renderer) && performance.now() - t0 < 30000){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } await new Promise(r=>setTimeout(r, 5000)); let grass = 0, blades = 0; O3.scene.traverse(o=>{ if (/grass/i.test(o.name||'') ) grass++; if (o.isMesh && o.geometry && o.geometry.isInstancedBufferGeometry && o.geometry.attributes.aA) blades++; }); return { gone:typeof O3G==='undefined' && typeof o3GrassTick==='undefined', blades, grass, mode:G.gameMode, plants:(O3.plants||O3.grass) ? 1 : 0 }; });
  console.log('rs788', JSON.stringify(r)); await page.screenshot({ path:SHOTS + '/rs788_land.jpg', type:'jpeg', quality:85 });
  if (!r.gone) throw new Error('assert: RS-785\'s grass code is gone ' + JSON.stringify(r));
  if (r.blades) throw new Error('assert: no blade chunks on the open land ' + JSON.stringify(r));
  if (errs.length) throw new Error('assert: no page errors: ' + errs[0]);
};
