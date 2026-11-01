// FP-039: the last of the gear on the sculpted body - studs carried and laid on the model's chest above its belt; under plate one kit belt, in the
// drawn belt's material; a robe's front trim on the model's chest (the robe's bodice is empty, the trim measured against its cloth) and its skirt's
// top drawn in to the model's waist; a hunched model's back lit as its new shape (float normals); the face sliders' wider reach
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const stand = ()=>page.evaluate(async ()=>{ let k = 0; do { await new Promise(r=>requestAnimationFrame(r)); } while ((LP.pend || !LP.e || !LP.e.tp) && k++ < 900); for (let i=0;i<4;i++) await new Promise(r=>requestAnimationFrame(r)); });
  // the face sliders: the jaw at its ends
  await page.evaluate(()=>{ window.__noLock = true; goToCharCreate(); renderOverlay(); ccSelectRace(0); const L = lookTarget(); L.beard = 0; });
  const jaw = async v=>{ await page.evaluate(v=>{ const L = lookTarget(); L.fc = { jaw:v }; lookBodyTouched(); }, v); await stand(); return page.evaluate(()=>{ const hm = LP.e.tp.meshes.find(m=>/\.head$/.test(m.name)), P = hm.geometry.attributes.position; let w = 0;
    for (let i=0;i<P.count;i++){ const y = P.getY(i); if (y > 1.6 && y < 1.62 && P.getZ(i) > 0) w = Math.max(w, Math.abs(P.getX(i))); } return { w:+w.toFixed(4), floatN:hm.geometry.attributes.normal.array instanceof Float32Array }; }); };
  const j0 = await jaw(0), j1 = await jaw(1); console.log('jaw', JSON.stringify({ j0, j1 }));
  A(j1.w > j0.w*1.25 && j0.floatN && j1.floatN, 'the jaw slider reaches as far as the drawn head: ' + JSON.stringify([j0, j1]));
  // the gear
  await page.evaluate(()=>{ ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; });
  const dress = async (fam, tier, fem, race)=>{ await page.evaluate(([fam, tier, fem, race])=>{ if (race!=null){ goToCharCreate(); ccSelectRace(race); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); } G.player.look.body = fem ? 1 : 0;
      for (const sl of ['chest', 'legs', 'head', 'arms', 'feet']){ G.gear[sl] = rsMakeArmour(fam, tier, sl); G.gear[sl].used = true; } G.gear.cape = rsMakeCape(2, 'Red Cape'); G.gear.cape.used = true;
      if (G.ui!=='dyeworks') openDyeWorks(); renderOverlay(); LP.key = ''; if (LP.e) LP.scene.remove(LP.e.holder); LP.e = null; }, [fam, tier, fem, race]); await stand();
    return page.evaluate(()=>{ const T = THREE, e = LP.e, tp = e.tp, r = e.rig, vis = o=>{ for (let a = o; a; a = a.parent) if (!a.visible) return false; return true; }; e.holder.updateMatrixWorld(true);
      const body = tp.meshes.filter(m=>/\.Body$/.test(m.name)), fw = new T.Vector3(0, 0, 1).transformDirection(e.holder.matrixWorld).normalize(), rc = new T.Raycaster();
      const off = c=>{ const p = new T.Vector3().setFromMatrixPosition(c.matrixWorld); rc.set(p.clone().addScaledVector(fw, 0.5), fw.clone().negate()); const h = rc.intersectObjects(body, false)[0]; return h ? +(h.distance - 0.5).toFixed(3) : null; };
      const kids = r.torsoIn.children.filter(c=>c.isMesh && vis(c) && c.userData.tpKeep), studs = kids.filter(c=>c.userData.stud), trims = kids.filter(c=>c.userData.frontTrim), cord = r.torsoIn.children.find(c=>c.userData.capeCord);
      const belts = tp.meshes.filter(m=>/Body_Belt/.test(m.name)).map(m=>[m.name.slice(-6), [].concat(m.material).map(x=>x.userData.kind || x.type).join()]);
      const bm = body[0], hump = Object.keys(TPB.geo).some(k=>TPB.geo[k]===bm.geometry && k.includes('|hump|'));
      return { outfit:r.wear, studs:studs.map(off), trims:trims.map(off), belts, cord:cord ? { keep:!!cord.userData.tpKeep, sx:+cord.scale.x.toFixed(3) } : null, skirtOwn:!!(r.skirt && r.skirt.userData.own), hump, humpFloatN:bm.geometry.attributes.normal.array instanceof Float32Array }; }); };
  const pl = await dress('metal', 2, false); console.log('plate', JSON.stringify(pl));
  A(pl.studs.length===9 && pl.studs.every(d=>d!=null && Math.abs(d) < 0.015), 'the nine studs carried, each on the model chest: ' + JSON.stringify(pl.studs));
  A(pl.belts.length===1 && pl.belts[0][0]==='Belt_2' && pl.belts[0][1]==='metal', 'under plate one belt, the lower, in the trim metal: ' + JSON.stringify(pl.belts));
  A(pl.cord && pl.cord.keep && pl.cord.sx < 1, 'the cape cord carried and drawn in to the model neck: ' + JSON.stringify(pl.cord));
  const hd = await dress('hide', 2, false); console.log('hide', JSON.stringify(hd));
  A(hd.belts.length===2 && hd.belts.every(b=>b[1]==='leather'), 'over hide both kit belts, in dark leather: ' + JSON.stringify(hd.belts));
  A(hd.studs.length===9 && hd.studs.every(d=>d!=null && Math.abs(d) < 0.015), 'the hide studs on the model chest: ' + JSON.stringify(hd.studs));
  const rb = await dress('cloth', 3, true); console.log('robe', JSON.stringify(rb));
  A(rb.outfit==='robe' && rb.trims.length >= 8 && rb.trims.every(d=>d!=null && Math.abs(d) < 0.025), 'a robe trim down the front on the model chest: ' + JSON.stringify(rb.trims));
  A(rb.skirtOwn, 'the robe skirt its own copy, drawn in at the waist');
  const we = await dress('cloth', 3, false, 2); console.log('wood elf', JSON.stringify(we));
  A(we.hump && we.humpFloatN, 'the wood elf hunch lit as its shape (float normals on the hump geometry)');
  A(we.trims.every(d=>d!=null && Math.abs(d) < 0.03), 'the hunched wood elf robe trim on the chest: ' + JSON.stringify(we.trims));
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
