// FP-035: the sculpted body is your figure everywhere, the creator too: the tpBody setting is gone; in the character creator every
// race's preview carries the model (its drawn body hidden, the model shown, its head at the drawn head) and the face sliders are gone
// (the sculpted head has one face for each sex); a shot of each race's preview into shots/fp035_<race>.png
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
        head:+(W(tp.bones[D.bones.indexOf('Head')]).distanceTo(W(e.rig.head))/e.holder.matrixWorld.getMaxScaleOnAxis()).toFixed(3), face:[...document.querySelectorAll('.bdhead')].some(h=>h.textContent==='FACE'), body:[...document.querySelectorAll('.bdhead')].length }; }, i);
    console.log(JSON.stringify(r));
    A(r.tp && r.shown===r.meshes && r.bodyLeft===0, r.race + ': the preview is the model, the drawn body hidden');
    A(r.head < 0.12, r.race + ': the model head at the drawn head');
    A(!r.face, r.race + ': no face sliders');
    try{ await (await page.$('#lpSlot canvas')).screenshot({ path:__dirname + '/shots/fp035_' + r.race.replace(/\W+/g, '_') + '.png' }); }catch(e){}
  }
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
