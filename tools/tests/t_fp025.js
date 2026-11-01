// FP-025: the townsfolk as the sculpted body (FP-026: always - the setting is gone, and an old save's tpFolk 'drawn' is ignored): in a town every person with a human rig carries the model (dressed by their look: a guard in the ranger kit, a villager in the
// peasant's), their drawn bodies hidden and the model's head at the drawn head, the animals left as they are; the models follow the town's
// walk
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; window.__noWarmSlice = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9;
    SET.tpFolk = 'drawn'; const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.interior = null; });
  await wait(3000);
  const look = ()=>ev(()=>{ const T = THREE, D = TPB.data, all = [...(V3.villagers||[]), ...(V3.npcs||[])], vis = o=>{ for (let a = o; a; a = a.parent) if (!a.visible) return false; return true; };
    const out = { folk:all.length, humans:0, tp:0, animals:0, animalTp:0, shown:0, modelHidden:0, headBad:0, kits:{}, walking:0, on:tpFolkOn() };
    for (const p of all){ const e = p.e; if (!e) continue; const human = !!(e.rig && e.rig.arms); if (p.v && p.v.animal){ out.animals++; if (e.tp) out.animalTp++; continue; } if (!human) continue; out.humans++; if (!e.tp) continue; out.tp++;
      if (e.tp.hide.some(m=>m.visible)) out.shown++; if (vis(e.holder) && !e.tp.meshes.every(vis)) out.modelHidden++; out.kits[e.tp.kit] = (out.kits[e.tp.kit]||0) + 1;
      p.g.updateMatrixWorld(true); const W = x=>new T.Vector3().setFromMatrixPosition(x.matrixWorld); if (W(e.tp.bones[D.bones.indexOf('Head')]).distanceTo(W(e.rig.head)) > 0.12*e.holder.matrixWorld.getMaxScaleOnAxis()) out.headBad++; if (e.tp.wUp > 0.9 && e.tp.wLeg > 0.9) out.walking++; }
    return out; });
  A(await ev(()=>!buildSettings().includes("'tpFolk'")), 'no townsfolk row in the settings');
  const m = await look(); console.log('model', JSON.stringify(m));
  A(m.on && m.humans >= 5 && m.tp===m.humans, 'every person carries the model (' + m.tp + ' of ' + m.humans + ')');
  A(m.shown===0 && m.modelHidden===0, 'the drawn bodies hidden, the models shown');
  A(m.headBad===0, 'the models\' heads at the drawn heads');
  A(m.animalTp===0, 'the animals as they were');
  A(m.kits.peasant > 0, 'villagers in the peasant\'s kit: ' + JSON.stringify(m.kits));
  A(m.walking===m.tp, 'the models follow the town\'s own walk');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
