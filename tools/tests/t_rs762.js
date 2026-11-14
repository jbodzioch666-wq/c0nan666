// RS-762: a tail over a robe under a cape comes out through the robe's back and runs down between the robe and the cape, out below the
// cape's hem and back along the ground - it went straight back through the cape. Over a robe with no cape it's RS-753's (out behind,
// the full swish). Shot: shots/rs762.png (behind, three-quarter, side)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear();
    const T = THREE, out = {};
    const fig = (race, cape)=>{ G.player.race = race; for (const k of ['weapon','offhand','ranged','cape','chest','legs']) G.gear[k] = newItem(); G.gear.weapon = rsMakeStaff(2);
      G.gear.chest = rsMakeArmour('cloth', 3, 'chest'); G.gear.legs = rsMakeArmour('cloth', 3, 'legs'); if (cape) G.gear.cape = rsMakeCape(60, 'Saradomin Cape'); rsSync && rsSync();
      const e = m3dInstance({}, rsPlayerLook({ race })), rg = e.rig, o = { cape:!!rg.cape, swish:0, covered:0, under:0, below:0, through:0, outRobe:0, tot:0 };
      for (let k=0;k<12;k++){ m3dPoseHumanoid(rg, k*0.23, k%3===2 ? 1 : 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); if (rg.cape) for (let j=0;j<30;j++){ m3dPoseHumanoid(rg, k*0.23 + j/60, k%3===2 ? 1 : 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); m3dCapeCloth(rg.cape, rg, 1/60); }   /* (the cloth settles over it, as it does frame by frame) */ m3dSkirtFollow(rg); e.holder.updateMatrixWorld(true); o.swish = Math.max(o.swish, Math.abs(rg.tail.rotation.z)); }
      const ax = new T.Vector3(), root = new T.Vector3(), v = new T.Vector3(), d = new T.Vector3(), ray = new T.Raycaster(); rg.hips.getWorldPosition(ax); rg.tail.getWorldPosition(root);
      rg.skirt.material.side = T.DoubleSide; if (rg.cape) rg.cape.material.side = T.DoubleSide; let cMin = 9; if (rg.cape){ const pa = rg.cape.geometry.attributes.position; for (let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa, i); rg.cape.localToWorld(v); cMin = Math.min(cMin, v.y); } }
      rg.tail.traverse(m=>{ if (!m.isMesh) return; const pa = m.geometry.attributes.position; for (let i=0;i<pa.count;i+=2){ v.fromBufferAttribute(pa, i); m.localToWorld(v); if (v.distanceTo(root) < (race==='Dragonborn' ? 0.11 : 0.07)) continue; o.tot++;
        d.set(ax.x - v.x, 0, ax.z - v.z); const L = d.length(); if (L < 1e-4) continue; d.normalize(); ray.set(v, d); ray.far = L; if (ray.intersectObject(rg.skirt, false).length) o.outRobe++;   /* (the robe between it and the body's middle: outside the robe) */
        if (!rg.cape) continue; if (v.y < cMin) o.below++; else { o.under++; ray.set(v, d); ray.far = L; if (ray.intersectObject(rg.cape, false).length) o.through++; } } });   /* (the cape between it and the body: it has come through the cape) */
      return o; };
    out.tief = fig('Tiefling', true); out.drag = fig('Dragonborn', true); out.bare = fig('Tiefling', false);
    return out; });
  console.log(JSON.stringify(r));
  for (const k of ['tief', 'drag']){ const f = r[k]; A(f.cape && f.outRobe >= f.tot*0.9, k + ': outside the robe: ' + JSON.stringify(f));
    A(f.under >= 10 && f.through===0 && f.below >= 10, k + ': under the cape, never through it, out below its hem: ' + JSON.stringify(f)); A(f.swish < 0.1, k + ': it only stirs under the cape: ' + f.swish); }
  A(!r.bare.cape && r.bare.outRobe >= r.bare.tot*0.9 && r.bare.swish > 0.25, 'no cape: out behind the robe, the full swish: ' + JSON.stringify(r.bare));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
