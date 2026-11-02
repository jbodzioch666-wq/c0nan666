// (probe) clipping through the cape and the robe while walking: each race (ZC_RACES) in each set (ZC_SETS: plain, plate, robe, hide) with a cape,
// the sculpted figure run in the dye works' preview for ZC_FRAMES frames (ZC_MV its pace, 1 a run; ZC_FEM=1 a woman; ZC_YAW the view; ZC_CLOTH=0
// the cape not stepped). A point of the model (its skinned parts and a tail) is through the cape when the line from the body's middle at its height
// out to it crosses the cape, and through the robe when the line from the robe's own middle crosses its skirt (and 3 cm lower too - not just under
// its hem's edge; a tail is let out through the robe's back, the arms and hands are outside it). The worst frame is saved as
// shots/zclip_<set>_<race>[_y<yaw>].png. module.exports.clip runs one figure and returns the mean hits per sampled frame (for t_fp043)
const clip = (page, race, set, frames, mv, fem, cloth, yaw)=>page.evaluate(async ([race, set, frames, mv, fem, cloth, yaw])=>{ window.__noLock = true; if (window.__lpF0){ lpFrame = window.__lpF0; LP.raf = 0; } else window.__lpF0 = lpFrame;
    goToCharCreate(); ccSelectRace(race); if (fem){ const L = lookTarget(); L.body = 1; } ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const fam = { plate:'metal', robe:'cloth', hide:'hide' }[set]; if (fam) for (const sl of ['chest', 'legs', 'head', 'arms', 'feet']){ G.gear[sl] = rsMakeArmour(fam, set==='plate' ? 5 : 3, sl); G.gear[sl].used = true; }
    G.gear.cape = rsMakeCape(2, 'Red Cape'); G.gear.cape.used = true; openDyeWorks(); renderOverlay(); LP.key = ''; if (LP.e) LP.scene.remove(LP.e.holder); LP.e = null; let k = 0; do { await new Promise(r=>requestAnimationFrame(r)); } while ((LP.pend || !LP.e) && k++ < 900);
    cancelAnimationFrame(LP.raf); lpFrame = ()=>{}; LP.raf = 0; const e = LP.e, rig = e.rig, tp = e.tp, T = THREE; if (!tp) return { race:RACES[race][0], set, err:'no model' }; tp.mon = false; LP.yaw = yaw!=null ? yaw : Math.PI/2; e.holder.rotation.y = LP.yaw;
    const mat = new T.MeshBasicMaterial({ side:T.DoubleSide }), rc = new T.Raycaster(), o = new T.Vector3(), v = new T.Vector3(), d = new T.Vector3(), Hi = new T.Matrix4();
    const proxy = m=>{ if (!m || m.visible===false) return null; const g = new T.BufferGeometry(); g.setAttribute('position', m.geometry.attributes.position); if (m.geometry.index) g.setIndex(m.geometry.index); g.computeBoundingSphere(); const x = new T.Mesh(g, mat); x.matrixAutoUpdate = false; x.matrixWorld.copy(m.matrixWorld); return x; };
    const inTail = m=>{ for (let q = m; q; q = q.parent) if (q===rig.tail) return true; return false; };
    const parts = ()=>{ const P = []; for (const m of tp.meshes) if (m.visible) P.push(m); if (rig.tail && rig.tail.isObject3D) rig.tail.traverse(m=>{ if (m.isMesh && m.visible) P.push(m); }); return P; };
    let worst = { cape:0, skirt:0, f:-1 }, sum = { cape:0, skirt:0 }, shot = null, nf = 0;
    for (let f=0;f<frames;f++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now()/1000; m3dPoseHumanoid(rig, t, mv, 0, 0, 0, e); if (cloth && rig.cape) m3dCapeCloth(rig.cape, rig, 1/60); tpTick(e, mv); e.holder.updateMatrixWorld(false); if (f%3) continue; nf++;
      const pc = proxy(rig.cape), ps = rig.skirt ? proxy(rig.skirt) : null, Si = rig.skirt ? new T.Matrix4().copy(rig.skirt.matrixWorld).invert() : null; let cape = 0, skirt = 0; const by = {}; Hi.copy(e.holder.matrixWorld).invert(); const Hm = e.holder.matrixWorld;
      const tag = (m, h)=>(m.name || 'tail').replace('tp:', '') + (h.y > 0.45 ? '^' : h.y > 0.25 ? '-' : '_') + (h.z < -0.05 ? 'b' : h.z > 0.05 ? 'f' : 's');
      const thruSkirt = sl=>{ const at = dy=>{ const o2 = new T.Vector3(0, sl.y + dy, 0).applyMatrix4(rig.skirt.matrixWorld), d2 = new T.Vector3(sl.x, sl.y + dy, sl.z).applyMatrix4(rig.skirt.matrixWorld).sub(o2), l2 = d2.length(); if (l2 < 1e-4) return false; rc.set(o2, d2.normalize()); rc.far = l2 - 0.004; return rc.intersectObject(ps, false).length > 0; }; return at(0) && at(-0.03); };
      for (const m of parts()){ const pa = m.geometry.attributes.position, st = Math.max(1, Math.floor(pa.count/400)), tl = inTail(m); for (let i=0;i<pa.count;i+=st){ v.fromBufferAttribute(pa, i); if (m.isSkinnedMesh) m.applyBoneTransform(i, v); v.applyMatrix4(m.matrixWorld);
        const h = v.clone().applyMatrix4(Hi); o.set(0, h.y, 0.02).applyMatrix4(Hm); d.copy(v).sub(o); const len = d.length(); if (len < 1e-4) continue; rc.set(o, d.normalize()); rc.far = len - 0.004;
        if (pc && rc.intersectObject(pc, false).length){ cape++; const nm = 'C:' + tag(m, h); by[nm] = (by[nm] || 0) + 1; }
        if (ps && !tl && !/Arms|Hands/.test(m.name) && thruSkirt(v.clone().applyMatrix4(Si))){ skirt++; const nm = 'S:' + tag(m, h); by[nm] = (by[nm] || 0) + 1; } } }
      sum.cape += cape; sum.skirt += skirt; if (cape + skirt > worst.cape + worst.skirt){ worst = { cape, skirt, f, by }; LP.r.render(LP.scene, LP.cam); shot = LP.r.domElement.toDataURL('image/png'); } }
    if (!shot){ LP.r.render(LP.scene, LP.cam); shot = LP.r.domElement.toDataURL('image/png'); }
    /* the shape: the tail's root from the model's pelvis, and the robe's waist (its widest within 8 cm of its top) over the model's hips' (the Legs mesh's widest there), in the holder's units */
    const Hs = new T.Vector3().setFromMatrixScale(e.holder.matrixWorld).y, pel = new T.Vector3().setFromMatrixPosition(tp.F[TPB.data.bones.indexOf('pelvis')]); let tailGap = null, waist = null;
    if (rig.tail && rig.tail.isObject3D){ let best = 9; const w = new T.Vector3(); rig.tail.traverse(m=>{ if (!m.isMesh) return; const pa = m.geometry.attributes.position; for (let i=0;i<pa.count;i++){ w.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld); best = Math.min(best, w.distanceTo(pel)); } }); tailGap = +(best/Hs).toFixed(3); }
    if (rig.skirt){ const sp = rig.skirt.geometry.attributes.position, w = new T.Vector3(); let top = -9, rr = 0; for (let i=0;i<sp.count;i++){ w.fromBufferAttribute(sp, i).applyMatrix4(rig.skirt.matrixWorld); top = Math.max(top, w.y); }
      const o = new T.Vector3().setFromMatrixPosition(rig.skirt.matrixWorld); for (let i=0;i<sp.count;i++){ w.fromBufferAttribute(sp, i).applyMatrix4(rig.skirt.matrixWorld); if (w.y > top - 0.08*Hs) rr = Math.max(rr, Math.hypot(w.x - o.x, w.z - o.z)); }
      const lg = tp.meshes.find(m=>/\.Legs$/.test(m.name)); let hr = 0; if (lg){ const pa = lg.geometry.attributes.position; for (let i=0;i<pa.count;i++){ w.fromBufferAttribute(pa, i); lg.applyBoneTransform(i, w); w.applyMatrix4(lg.matrixWorld); if (Math.abs(w.y - pel.y) < 0.05*Hs) hr = Math.max(hr, Math.hypot(w.x - pel.x, w.z - pel.z)); } }
      waist = hr ? +(rr/hr).toFixed(2) : null; }
    return { race:RACES[race][0], set, fem:!!fem, tailGap, waist, worst, mean:{ cape:+(sum.cape/nf).toFixed(1), skirt:+(sum.skirt/nf).toFixed(1) }, shot }; }, [race, set, frames, mv, !!fem, cloth!==false, yaw==null ? null : yaw]);
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const races = (process.env.ZC_RACES || '0,2,3,7').split(',').map(Number), sets = (process.env.ZC_SETS || 'plain,robe').split(','), frames = +(process.env.ZC_FRAMES || 90), mv = +(process.env.ZC_MV || 1), yaw = process.env.ZC_YAW ? +process.env.ZC_YAW : null;
  for (const race of races) for (const set of sets){ const r = await clip(page, race, set, frames, mv, process.env.ZC_FEM==='1', process.env.ZC_CLOTH!=='0', yaw);
    if (r.shot) require('fs').writeFileSync(__dirname + '/shots/zclip_' + set + '_' + race + (yaw!=null ? '_y' + process.env.ZC_YAW : '') + '.png', Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot; console.log('clip', JSON.stringify(r)); }
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
module.exports.clip = clip;
