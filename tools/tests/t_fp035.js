// FP-035: the sculpted body is your figure everywhere, the creator too: the tpBody setting is gone; in the character creator every
// race's preview carries the model (its drawn body hidden, the model shown, its head at the drawn head) and the face sliders are shown
// (FP-037: they shape the sculpted head); FP-036: the model looks ahead; a wood elf's hunch, hump and long nose from the drawn one;
// a dragonborn's and a tiefling's tails shown on it; a shot of each race's preview into shots/fp035_<race>.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  A(await page.evaluate(()=>!buildSettings().includes("'tpBody'") && tpOn()), 'no figure row in the settings, the model on');
  await page.evaluate(()=>{ goToCharCreate(); renderOverlay(); });
  const n = await page.evaluate(()=>RACES.length);
  for (let i = 0; i < n; i++){
    const r = await page.evaluate(async i=>{ ccSelectRace(i); await new Promise(res=>setTimeout(res, 60)); let k = 0; do { await new Promise(res=>requestAnimationFrame(res)); } while ((LP.pend || !LP.e) && k++ < 600);
      for (let j = 0; j < 3; j++) await new Promise(res=>requestAnimationFrame(res));
      const T = THREE, e = LP.e, tp = e && e.tp, D = TPB.data, vis = o=>{ for (let a = o; a; a = a.parent) if (!a.visible) return false; return true; }, W = o=>new T.Vector3().setFromMatrixPosition(o.matrixWorld);
      if (!tp) return { race:RACES[i][0], tp:false }; e.holder.updateMatrixWorld(true);
      return { race:RACES[i][0], tp:true, shown:tp.meshes.filter(vis).length, meshes:tp.meshes.length, bodyLeft:tp.hide.filter(m=>m.visible).length,
        head:+(W(tp.bones[D.bones.indexOf('Head')]).distanceTo(W(e.rig.head))/e.holder.matrixWorld.getMaxScaleOnAxis()).toFixed(3), face:[...document.querySelectorAll('.bdhead')].some(h=>h.textContent==='FACE'),
        ...(()=>{ const Li = new T.Matrix4().copy(e.holder.matrixWorld).invert(), hs = e.holder.matrixWorld.getMaxScaleOnAxis(), Lp = n=>W(tp.bones[D.bones.indexOf(n)]).applyMatrix4(Li), fw = new T.Vector3(0, 0, 1).transformDirection(tp.bones[D.bones.indexOf('Head')].matrixWorld).transformDirection(Li);
          const bm = tp.meshes.find(m=>/Body$/.test(m.name)); let tail = null; if (e.rig.tail){ tail = 0; e.rig.tail.traverse(m=>{ if (m.isMesh && vis(m)) tail++; }); } let nose = 0; e.holder.traverse(m=>{ if (m.isMesh && m.userData.tpKeep && vis(m) && m.geometry.type==='ConeGeometry' && m.geometry.parameters.height > 0.04 && m.geometry.parameters.height < 0.045) nose++; });
          return { lean:+((Lp('neck_01').z - Lp('pelvis').z)).toFixed(3), headUp:+fw.y.toFixed(2), hump:!!bm && Object.entries(TPB.geo).some(([k, g])=>g===bm.geometry && k.includes('|hump|')), tail, nose }; })() }; }, i);
    console.log(JSON.stringify(r));
    A(r.tp && r.shown===r.meshes && r.bodyLeft===0, r.race + ': the preview is the model, the drawn body hidden');
    A(r.head < 0.12, r.race + ': the model head at the drawn head');
    A(r.face, r.race + ': the face sliders shown (FP-037: back, shaping the sculpted head)');
    A(Math.abs(r.headUp) < 0.3, r.race + ': the model looks ahead, not up or down: ' + r.headUp);
    if (r.race==='Wood Elf') A(r.lean > 0.08 && r.hump && r.nose===1, 'the wood elf hunched (the neck well ahead of the hips), the hump on the back and the long drawn nose (FP-036): ' + JSON.stringify(r));
    if (!/Wood Elf|Half-Orc/.test(r.race)) A(r.lean < 0.06 && !r.hump, r.race + ': stands straight, no hump');
    if (r.race==='Dragonborn' || r.race==='Tiefling') A(r.tail > 0, r.race + ': the tail shows on the model (FP-036)');
    try{ await (await page.$('#lpSlot canvas')).screenshot({ path:__dirname + '/shots/fp035_' + r.race.replace(/\W+/g, '_') + '.png' }); }catch(e){}
  }
  // the wood elf in a town, on the model's own idle and walk: still hunched, looking ahead
  await page.evaluate(()=>{ window.__noLock = true; ccSelectRace(+(window.__twRace||2)); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9;
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.interior = null; });
  await page.evaluate(async ()=>{ const t = performance.now() + 2500; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } });
  const tw = await page.evaluate(()=>{ const T = THREE, D = TPB.data, e = V3.player.e, tp = e.tp; if (!tp) return { tp:false }; const W = o=>new T.Vector3().setFromMatrixPosition(o.matrixWorld), Li = new T.Matrix4().copy(e.holder.matrixWorld).invert(), Lp = n=>W(tp.bones[D.bones.indexOf(n)]).applyMatrix4(Li);
    const fw = new T.Vector3(0, 0, 1).transformDirection(tp.bones[D.bones.indexOf('Head')].matrixWorld).transformDirection(Li); return { tp:true, race:G.player.race, wUp:+tp.wUp.toFixed(2), lean:+(Lp('neck_01').z - Lp('pelvis').z).toFixed(3), headUp:+fw.y.toFixed(2) }; });
  console.log('town', JSON.stringify(tw)); try{ await page.screenshot({ path:__dirname + '/shots/fp035_town.png' }); }catch(e){}
  A(tw.tp && tw.lean > 0.08 && Math.abs(tw.headUp) < 0.45, 'the wood elf hunched and looking ahead in town, on the model idle (a human on it -0.26): ' + JSON.stringify(tw));
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
