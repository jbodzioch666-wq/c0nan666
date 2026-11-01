// (art probe, not in ALL) you in the dye works in a full set of gear - ZW_SET plate (rune, tier 5), robe (mystic, 3), hide (black dragonhide, 5),
// shirt (none) - the drawn figure beside the model from five sides (shots/zwe5_<set>_<mode>_<view>.png), and the drawn chest's bounds
// against the model's torso in the holder's frame
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const set = process.env.ZW_SET || 'plate', race = +(process.env.ZW_RACE || 0), fem = process.env.ZW_FEM==='1', capeT = +(process.env.ZW_CAPE || 2), off = process.env.ZW_OFF || '', tier = process.env.ZW_TIER ? +process.env.ZW_TIER : null, legT = process.env.ZW_LEGS ? +process.env.ZW_LEGS : null, tag = process.env.ZW_TAG || '';
  await page.evaluate(([set, race, fem, capeT, off, tier0, legT0])=>{ window.__noLock = true; goToCharCreate(); ccSelectRace(race); if (fem){ const L = lookTarget(); L.body = 1; } ccBegin(); window.__legT = legT0; if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; window.__tpOn = tpOn;
    const fam = { plate:'metal', robe:'cloth', hide:'hide' }[set], tier = tier0!=null ? tier0 : { plate:5, robe:3, hide:5 }[set];
    if (fam) for (const sl of ['chest', 'legs', 'head', 'arms', 'feet']){ G.gear[sl] = rsMakeArmour(fam, tier, sl); G.gear[sl].used = true; }
    if (window.__legT!=null && fam){ G.gear.legs = rsMakeArmour(fam, window.__legT, 'legs'); G.gear.legs.used = true; } G.gear.cape = rsMakeCape(capeT, 'Red Cape'); G.gear.cape.used = true; if (off==='shield'){ G.gear.offhand = rsMakeArmour('metal', tier, 'offhand'); G.gear.offhand.used = true; G.gear.weapon = rsMakeWeapon(3, 2); G.gear.weapon.used = true; } if (off==='tome'){ G.gear.offhand = rsMakeArmour('cloth', tier, 'offhand'); G.gear.offhand.used = true; G.gear.weapon = rsMakeStaff ? rsMakeStaff(3) : G.gear.weapon; if (G.gear.weapon) G.gear.weapon.used = true; } openDyeWorks(); renderOverlay(); }, [set, race, fem, capeT, off, tier, legT]);
  for (const mode of ['drawn', 'model']){
    const r = await page.evaluate(async mode=>{ tpOn = mode==='model' ? window.__tpOn : ()=>false; LP.key = ''; if (LP.e) LP.scene.remove(LP.e.holder); LP.e = null; let k = 0; do { await new Promise(r=>requestAnimationFrame(r)); } while ((LP.pend || !LP.e) && k++ < 900);
      for (let i=0;i<3;i++) await new Promise(r=>requestAnimationFrame(r)); const T = THREE, e = LP.e, r = e.rig, D = TPB.data, Li = new T.Matrix4().copy(e.holder.matrixWorld).invert();
      const bx = m=>{ m.updateMatrixWorld(true); const b = new T.Box3().setFromObject(m, true); return [b.min, b.max].map(v=>v.applyMatrix4(Li).toArray().map(x=>+x.toFixed(3))); };
      const out = { tp:!!e.tp, outfit:e.o && e.o.outfit, wear:r.wear, chest:r.chestMesh && bx(r.chestMesh), pelvis:r.pelvisMesh && bx(r.pelvisMesh), skirt:r.skirt && bx(r.skirt) };
      if (e.tp){ const W = o=>new T.Vector3().setFromMatrixPosition(o.matrixWorld).applyMatrix4(Li).toArray().map(x=>+x.toFixed(3)); out.bones = {}; for (const n of ['pelvis', 'spine_01', 'spine_03', 'neck_01', 'clavicle_r', 'upperarm_r', 'hand_r', 'thigh_r', 'calf_r', 'foot_r']) out.bones[n] = W(e.tp.bones[D.bones.indexOf(n)]);
        out.joints = {}; for (const [n, j] of [['hips', r.hips], ['torso', r.torso], ['torsoIn', r.torsoIn], ['neck', r.neck], ['sh', r.arms[0].sh], ['el', r.arms[0].el], ['hand', r.arms[0].hand], ['hip', r.legs[0].hip], ['knee', r.legs[0].knee], ['ankle', r.legs[0].ankle]]) out.joints[n] = W(j);
        const bm = e.tp.meshes.find(m=>/Body$/.test(m.name)); if (bm){ const g = bm.geometry, P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, b = new T.Box3(), v = new T.Vector3(), tor = D.bones.map(n=>/^(spine|pelvis)/.test(n));
          for (let i=0;i<P.count;i++){ let w = 0; for (let j=0;j<4;j++) if (tor[SI.getComponent(i, j)]) w += SW.getComponent(i, j); if (w > 0.6){ v.fromBufferAttribute(P, i); bm.boneTransform(i, v); v.applyMatrix4(bm.matrixWorld).applyMatrix4(Li); b.expandByPoint(v); } } out.modelTorso = [b.min, b.max].map(v=>v.toArray().map(x=>+x.toFixed(3))); }
        out.kept = []; e.holder.traverse(m=>{ if (m.isMesh && m.userData.tpKeep && m.visible) out.kept.push(m.name || m.geometry.type); }); }
      return out; }, mode); console.log(mode, JSON.stringify(r));
    for (const [view, yaw, zoom] of [['front', 0, 1], ['side', Math.PI/2, 1], ['back', Math.PI, 1], ['three', 0.6, 1], ['chest', 0.6, 1.9]]){
      await page.evaluate(async ([yaw, zoom])=>{ LP.yaw = yaw; LP.zoom = zoom; LP.panY = null; for (let i = 0; i < 4; i++) await new Promise(r=>requestAnimationFrame(r)); }, [yaw, zoom]);
      await (await page.$('#lpSlot canvas')).screenshot({ path:__dirname + '/shots/zwe5_' + set + tag + '_' + mode + '_' + view + '.png' }); } }
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
