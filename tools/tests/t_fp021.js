// FP-021: your figure as a sculpted model (FP-035: always, the setting gone): below ground the
// model is built over the drawn figure, whose own body is hidden; it stands on the floor as tall as the figure; out of a fight the sword
// on the hip and the shield on the back go with it; in a fight with a sword and a kite shield its arms take the drawn ones' pose and the
// sword sits in its fist (the fingers' middle by the hilt); it walks with a stride
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; PFX.camp = -1e9;
    G.gear.weapon = rsMakeWeapon(3, 2); G.gear.weapon.used = true; G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); G.gear.offhand.used = true; });
  await wait(1200);
  const look = ()=>ev(()=>{ const T = THREE, e = ISO.player, r = e.rig, tp = e.tp, D = TPB.data, hy = e.holder.matrixWorld.elements[13];
    const W = o=>new T.Vector3().setFromMatrixPosition(o.matrixWorld), vis = o=>{ for (let a = o; a; a = a.parent) if (!a.visible) return false; return true; };
    if (!tp) return { tp:false, bodyShown:(()=>{ let n = 0; e.holder.traverse(m=>{ if (m.isMesh && vis(m)) n++; }); return n; })() };
    for (const m of tp.meshes) m.updateMatrixWorld(true);
    const box = re=>{ const m = tp.meshes.find(m=>re.test(m.name)); return m ? new T.Box3().setFromObject(m, true) : null; }, hb = box(/\.head$/), fb = box(/Feet|Boots/);
    const B = n=>W(tp.bones[D.bones.indexOf(n)]), ring = new T.Vector3(); for (const f of ['index', 'middle', 'ring', 'pinky']) for (const j of ['01', '02', '03', '04_leaf']) ring.addScaledVector(B(f + '_' + j + '_r'), 1/16);
    return { tp:true, meshes:tp.meshes.length, shown:tp.meshes.filter(vis).length, hidden:tp.hide.length, bodyLeft:tp.hide.filter(m=>m.visible).length,
      headTop:hb && +(hb.max.y - hy).toFixed(3), feet:fb && +(fb.min.y - hy).toFixed(3), figHead:+(W(r.head).y - hy).toFixed(3), figHips:+(W(r.hips).y - hy).toFixed(3),
      sheathed:!!r.sheathed, wpPelvis:+W(r.weapon).distanceTo(B('pelvis')).toFixed(3), shSpine:r.shield ? +W(r.shield).distanceTo(B('spine_03')).toFixed(3) : null, wpVis:vis(r.weapon),
      fist:+W(r.weapon).distanceTo(ring).toFixed(3), handR:+W(r.arms[0].hand).distanceTo(B('hand_r')).toFixed(3), wUp:+tp.wUp.toFixed(2), jog:+tp.jogK.toFixed(2), scale:+e.holder.matrixWorld.getMaxScaleOnAxis().toFixed(3) }; });
  await ev(()=>{ PFX.camp = -1e9; }); await wait(1500);
  const s = await look(); console.log('standing', JSON.stringify(s));
  A(s.tp && s.meshes >= 8 && s.shown===s.meshes, 'the model built and shown');
  A(s.hidden > 0 && s.bodyLeft===0, 'the drawn body hidden');
  A(Math.abs(s.feet) < 0.06*s.scale, 'standing on the floor');
  A(s.headTop > s.figHead && s.headTop < s.figHead + 0.3*s.scale, 'as tall as the figure');
  A(s.sheathed && s.wpVis && s.wpPelvis < 0.2*s.scale && s.shSpine!=null && s.shSpine < 0.25*s.scale, 'the sword on the hip and the shield on the back, carried with the model');
  await ev(()=>{ const p = G.player, F = FACING_VECT[p.facing], m = newMonster(); G.mon.push(m); Object.assign(m, { alive:1, x:p.x + F[0], y:p.y + F[1], hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin', col:'#8f8', art:null, abilities:[], speed:0, stunTurns:99 }); ISO.fighting = m; rsFightNow = ()=>true; });
  await wait(1500);
  const f = await look(); console.log('fight', JSON.stringify(f));
  A(!f.sheathed && f.wUp > 0.9, 'in a fight the arms take the drawn pose');
  A(f.fist < 0.06*f.scale, 'the sword in the model\'s fist');
  await ev(()=>{ ISO.fighting = null; G.mon.length = 0; }); await wait(300);
  const walk = await ev(async ()=>{ const p = G.player, e = ISO.player; let mx = 0;
    for (let k=0;k<4;k++){ const F = FACING_VECT[(p.facing + k) % 4], x = p.x + F[0], y = p.y + F[1]; if (tileAt(x, y)!==T_FLOOR || !isoPassable(x, y)) continue; tryMove(F[0], F[1]); for (let i=0;i<20;i++){ renderGame(); mx = Math.max(mx, e.tp ? e.tp.jogK : 0); await new Promise(r=>requestAnimationFrame(r)); } } return mx; });
  console.log('walk', walk); A(walk > 0.3, 'a stride when moving');
  // through your eyes nothing of the model is drawn by the world's camera
  await ev(()=>{ if (!SET.fpView) fpvToggle(); }); await wait(1200);
  const fp = await ev(()=>{ const e = ISO.player, tp = e.tp; if (!tp) return { tp:false }; const vis = o=>{ for (let a = o; a; a = a.parent) if (!a.visible) return false; return true; };
    const cam = FPD.cam || FPD.camera, ly = m=>!cam || cam.layers.test(m.layers); return { tp:true, fpv:fpv(), set:SET.fpView, iso:ISO.on, a:fp3dActive(), ok:FPD.ok, seen:tp.meshes.filter(m=>vis(m) && ly(m)).length }; });
  console.log('fp', JSON.stringify(fp)); A(fp.fpv && (!fp.tp || fp.seen===0), 'through your eyes the model is not drawn');
  await ev(()=>{ if (SET.fpView) fpvToggle(); }); await wait(600);
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
