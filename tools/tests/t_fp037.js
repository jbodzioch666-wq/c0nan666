// FP-037: the face sliders shape the sculpted head (the creator shows them; a long nose puts the head's nose tip further out, large eyes make the eyes
// part bigger, the head's geometry is a face-keyed one), and your gear dresses the sculpted body: in the dye works in rune plate the kit's body
// wears the drawn plate material, the drawn pauldrons and tabard are carried on it, the hands and the shoes are cut off their parts for the gauntlets
// and boots; in mystic robes the robe cloth, the skirt cut at the waist with its rune hem; in black dragonhide leather
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const stand = ()=>page.evaluate(async ()=>{ let k = 0; do { await new Promise(r=>requestAnimationFrame(r)); } while ((LP.pend || !LP.e) && k++ < 900); for (let i=0;i<3;i++) await new Promise(r=>requestAnimationFrame(r)); });
  await page.evaluate(()=>{ window.__noLock = true; goToCharCreate(); renderOverlay(); ccSelectRace(0); const L = lookTarget(); L.beard = 0; });
  A(await page.evaluate(()=>[...document.querySelectorAll('.bdhead')].some(h=>h.textContent==='FACE')), 'the face sliders in the creator');
  const face = async fc=>{ await page.evaluate(fc=>{ const L = lookTarget(); L.fc = fc; lookBodyTouched(); }, fc); await stand(); return page.evaluate(()=>{ const T = THREE, tp = LP.e.tp, hm = tp.meshes.find(m=>/\.head$/.test(m.name)), em = tp.meshes.find(m=>/\.eyes$/.test(m.name)), P = hm.geometry.attributes.position; let tipZ = -9, tipY = 0;
    for (let i=0;i<P.count;i++){ const x = P.getX(i), y = P.getY(i), z = P.getZ(i); if (Math.abs(x) < 0.012 && y > 1.6 && y < 1.72 && z > tipZ){ tipZ = z; tipY = y; } }
    em.geometry.computeBoundingBox(); const eb = em.geometry.boundingBox; return { faceGeo:Object.keys(TPB.geo).some(k=>TPB.geo[k]===hm.geometry && k.includes('|face|')), tipZ:+tipZ.toFixed(4), tipY:+tipY.toFixed(4), eyeW:+(eb.max.x - eb.min.x).toFixed(4), eyeH:+(eb.max.y - eb.min.y).toFixed(4) }; }); };
  const f0 = await face({}), fN = await face({ noseLen:1 }), fE = await face({ eyeSize:1, eyeSep:1 }), fS = await face({ eyeSize:0, eyeSep:0 }); console.log('face', JSON.stringify({ f0, fN, fE, fS }));
  A(!f0.faceGeo && fN.faceGeo && fE.faceGeo, 'a shaped face takes a face-keyed head geometry, the default the kit\u0027s own');
  A(fN.tipZ > f0.tipZ + 0.006 && fN.tipY < f0.tipY, 'a long nose puts the tip further out and lower: ' + JSON.stringify([f0, fN]));
  A(fE.eyeW > fS.eyeW + 0.01 && fE.eyeH > fS.eyeH*1.3, 'large, wide-set eyes against small close ones: ' + JSON.stringify([fE, fS]));
  // the gear
  await page.evaluate(()=>{ ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; });
  const dress = async (fam, tier)=>{ await page.evaluate(([fam, tier])=>{ for (const sl of ['chest', 'legs', 'head', 'arms', 'feet']){ G.gear[sl] = rsMakeArmour(fam, tier, sl); G.gear[sl].used = true; } if (G.ui!=='dyeworks') openDyeWorks(); renderOverlay(); LP.key = ''; if (LP.e) LP.scene.remove(LP.e.holder); LP.e = null; }, [fam, tier]); await stand();
    return page.evaluate(()=>{ const T = THREE, e = LP.e, tp = e.tp, D = TPB.data, W = o=>new T.Vector3().setFromMatrixPosition(o.matrixWorld), vis = o=>{ for (let a = o; a; a = a.parent) if (!a.visible) return false; return true; }; e.holder.updateMatrixWorld(true);
      const part = re=>tp.meshes.find(m=>re.test(m.name)), kind = m=>m && [].concat(m.material).map(x=>x.userData.kind || x.type), body = part(/\.Body$/), arms = part(/\.Arms(_1)?$/), hands = part(/\.Arms_2$/), feet = part(/\.(Feet|Feet_Boots)$/), legs = part(/\.Legs$/);
      const hs = e.holder.matrixWorld.getMaxScaleOnAxis(), sh = ['upperarm_r', 'upperarm_l'].map(n=>W(tp.bones[D.bones.indexOf(n)])); let pads = 0, tabard = 0, kept = 0, skirt = null, hem = 0;
      e.holder.traverse(m=>{ if (!m.isMesh || !m.userData.tpKeep || !vis(m)) return; kept++; if (m.userData.pad===1 && sh.some(p=>W(m).distanceTo(p)/hs < 0.12)) pads++; if (m.name==='tabard') tabard++; if (m===e.rig.skirt){ skirt = { tris:m.geometry.index.count/3, top:+(m.geometry.boundingSphere.radius).toFixed(3) }; } if (m.userData.hemLayer) hem++; });
      return { outfit:e.rig.wear, body:kind(body), arms:kind(arms), armsGroups:arms && arms.geometry.groups.length, hands:kind(hands), handsGroups:hands && hands.geometry.groups.length, feet:kind(feet), feetGroups:feet && feet.geometry.groups.length, legs:kind(legs), pads, tabard, kept, skirt, hem, kitPauldron:tp.meshes.some(m=>/Acc_Pauldron/.test(m.name)) }; }); };
  const pl = await dress('metal', 5); console.log('plate', JSON.stringify(pl));
  A(pl.outfit==='plate' && pl.body[0]==='metal' && pl.legs[0]==='metal', 'rune plate: the body and the legs in the drawn plate material: ' + JSON.stringify(pl));
  A(pl.armsGroups===2 && pl.arms.length===2 && pl.arms[1]==='metal', 'the hands cut off the sleeves for the gauntlets');
  A(pl.feet.length===1 && pl.feet[0]==='metal', 'the ranger kit boots whole, in the plate material');
  A(pl.pads===2 && pl.tabard===1 && !pl.kitPauldron, 'the drawn pauldrons at the model\u0027s shoulders and the tabard carried, the kit\u0027s pauldron dropped: ' + JSON.stringify(pl));
  const rb = await dress('cloth', 3); console.log('robe', JSON.stringify(rb));
  A(rb.outfit==='robe' && rb.body[0]==='cloth' && rb.skirt && rb.hem >= 1, 'mystic robes: the robe cloth on the body, the skirt and its rune hem carried: ' + JSON.stringify(rb));
  A(rb.feetGroups===2 && rb.feet[0]==='cloth' && rb.feet[1]==='leather' && rb.handsGroups===2 && rb.hands[1]==='leather', 'the peasant kit shoes cut off the trousered shins for the boots, the hands off the forearms for the gloves: ' + JSON.stringify(rb));
  A(rb.skirt.top < 0.45, 'the skirt cut at the waist (its bodice was a shell round the model): ' + JSON.stringify(rb.skirt));
  const hd = await dress('hide', 6); console.log('hide', JSON.stringify(hd));
  A(hd.hands.length===1 && hd.hands[0]==='leather', 'the ranger kit fingertips in the glove material too');
  A(hd.outfit==='jerkin' && hd.body[0]==='leather' && hd.pads===2, 'black dragonhide: leather on the body, the pauldrons carried: ' + JSON.stringify(hd));
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
