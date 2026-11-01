// FP-024: goblins, kobolds and imps as sculpted models (SET.tpMon 'model', a test against the drawn ones - 'drawn' the default): below
// ground with the setting on, a goblin, a goblin archer and an imp carry the kit's model on their drawn rigs (the Puglin with its stick,
// the archer keeping its drawn bow and losing the stick, the Imp with its mace), their drawn bodies hidden, the model's head at the
// drawn head; through your eyes the models still show; back to 'drawn' and the drawn monsters are back
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; window.__noWarmSlice = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; PFX.camp = -1e9;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0;
    const p = G.player, names = ['goblin', 'goblin archer', 'imp']; let k = 0;
    for (let r=1; r<=2 && k<names.length; r++) for (let dx=-r; dx<=r && k<names.length; dx++) for (let dy=-r; dy<=r && k<names.length; dy++){ if (Math.max(Math.abs(dx), Math.abs(dy))!==r) continue; const x = p.x + dx, y = p.y + dy;
      if (tileAt(x, y)!==T_FLOOR || G.mon.some(m=>m.x===x && m.y===y)) continue; const m = newMonster(); G.mon.push(m); Object.assign(m, { alive:1, x, y, hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:names[k], baseNm:names[k], col:'#8f8', art:null, abilities:[], speed:0, stunTurns:99, style:names[k]==='goblin archer' ? 'ranged' : undefined }); k++; } });
  await wait(1200);
  const look = ()=>ev(()=>{ const T = THREE, D = TPB.data; return G.mon.map(m=>{ const e = M3D.inst.get(m), r = e && e.rig; if (!e) return { nm:m.nm, none:true }; const vis = o=>{ for (let a = o; a; a = a.parent) if (!a.visible) return false; return true; };
    const o = { nm:m.nm, tp:!!e.tp, hidden:0, shown:0, wpVis:(()=>{ let n = 0; if (r && r.weapon) r.weapon.traverse(x=>{ if (x.isMesh && vis(x)) n++; }); return n > 0; })(), parts:e.tp ? e.tp.meshes.map(x=>x.name.slice(3).split('.')[1]) : [] };
    if (e.tp){ o.hidden = e.tp.hide.length; o.shown = e.tp.hide.filter(x=>x.visible).length; const W = x=>new T.Vector3().setFromMatrixPosition(x.matrixWorld); o.headGap = +W(e.tp.bones[D.bones.indexOf('Head')]).distanceTo(W(r.head)).toFixed(3); o.sc = +e.holder.matrixWorld.getMaxScaleOnAxis().toFixed(3); o.modelVis = e.tp.meshes.every(vis); }
    return o; }); });
  A(await ev(()=>SET.tpMon==='drawn'), 'the drawn monsters by default');
  A(await ev(()=>buildSettings().includes("setSetting('tpMon', 'model')")), 'a row in the settings');
  const d0 = await look(); console.log('drawn', JSON.stringify(d0));
  A(d0.length===3 && d0.every(o=>!o.none && !o.tp), 'three drawn monsters with models');
  await ev(()=>{ SET.tpMon = 'model'; }); await wait(2500);
  const m = await look(); console.log('model', JSON.stringify(m));
  const by = n=>m.find(o=>o.nm===n);
  A(m.every(o=>o.tp && o.hidden > 0 && o.shown===0 && o.modelVis), 'every one carries the model, its drawn body hidden');
  A(by('goblin').parts.includes('Stick') && !by('goblin').wpVis, 'the goblin holds the Puglin\'s stick, its drawn weapon hidden');
  A(!by('goblin archer').parts.includes('Stick') && by('goblin archer').wpVis, 'the archer keeps its drawn bow and loses the stick');
  A(by('imp').parts.includes('Mace') && by('imp').parts.length===5, 'the imp is the Imp, mace and all');
  A(m.every(o=>o.headGap < 0.12*o.sc), 'the model\'s head at the drawn head: ' + m.map(o=>o.headGap).join(','));
  await ev(()=>{ if (!SET.fpView) fpvToggle(); }); await wait(1200);
  const f = await look(); console.log('fp', JSON.stringify(f.map(o=>[o.nm, o.tp, o.modelVis])));
  A(await ev(()=>fpv()) && f.every(o=>o.tp && o.modelVis), 'through your eyes the models still show');
  await ev(()=>{ if (SET.fpView) fpvToggle(); SET.tpMon = 'drawn'; }); await wait(2000);
  const d1 = await look(); console.log('back', JSON.stringify(d1));
  A(d1.every(o=>!o.none && !o.tp), 'the drawn monsters back');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
