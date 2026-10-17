// RS-174: a robe top is a tunic (no skirt of its own), a robe bottom is a long skirt (not trousers), and the robe bottom's
// icon is a skirt
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const out = {};
    const top = Object.assign(rsMakeArmour('cloth', 1, 'chest'), { used:true }), bot = Object.assign(rsMakeArmour('cloth', 1, 'legs'), { used:true }), plateL = Object.assign(rsMakeArmour('metal', 1, 'legs'), { used:true });
    const skirts = (chest, legs)=>{ G.gear.chest = chest || newItem(); G.gear.legs = legs || newItem(); const e = m3dInstance({}, rsPlayerLook()); const hs = []; e.rig.hips.children.forEach(o=>{ if (o.isMesh && o.geometry.type==='CylinderGeometry') hs.push(+o.geometry.parameters.height.toFixed(2)); }); return hs.sort(); };
    out.topOverPlate = skirts(top, plateL); out.bottomAlone = skirts(null, bot); out.both = skirts(top, bot); out.plateOnly = skirts(null, plateL);
    G.gear.chest = newItem(); G.gear.legs = newItem();
    // the icon: a skirt fills the middle, where a pair of trousers has a gap between the legs
    out.kind = { robe:obItemEntry(bot).o ? obItemEntry(bot).o.kind : null, plate:obItemEntry(plateL).o ? obItemEntry(plateL).o.kind : null };
    const mid = it=>{ const img = fpUndeadSprite(obItemEntry(it), false).img, x = img.getContext('2d'), W = img.width, H = img.height; const d = x.getImageData(Math.floor(W/2) - 1, Math.floor(H*0.62), 3, Math.floor(H*0.2)).data; let a = 0; for (let i=3;i<d.length;i+=4) a += d[i] > 40 ? 1 : 0; return a/(d.length/4); };
    out.iconMid = { robe:+mid(bot).toFixed(2), plate:+mid(plateL).toFixed(2) };
    // RS-175: mid-stride, the legs stay inside a robe bottom - the skirt is carried along by them
    { G.gear.chest = newItem(); G.gear.legs = bot;
      const clip = follow=>{ const e = m3dInstance({}, rsPlayerLook()), r2 = e.rig; if (!follow) r2.skirt = null;
        let worst = 0;
        for (const ph of [Math.PI/2, Math.PI*1.5, 0.4, 2.2]){ e.wph = ph; e._lt = undefined; m3dPoseHumanoid(r2, 1, 1, 0, 0, 0, e); e.wph = ph; m3dPoseHumanoid(r2, 1, 1, 0, 0, 0, e);
          e.holder.updateMatrixWorld(true);
          const sk = e.rig.hips.children.find(o=>o.isMesh && o.geometry.type==='CylinderGeometry' && o.geometry.parameters.height > 0.4);
          if (follow && r2.skirt) m3dSkirtFollow(r2);
          const inv = sk.matrixWorld.clone().invert(), sp = sk.geometry.attributes.position, v = new THREE.Vector3();
          const pts = []; for (let i=0;i<sp.count;i++) pts.push([sp.getX(i), sp.getY(i), sp.getZ(i)]);
          let out2 = 0, tot = 0;
          r2.legs.forEach(L=>L.hip.traverse(o=>{ if (!o.isMesh) return; const gp = o.geometry.attributes.position; for (let i=0;i<gp.count;i+=3){ v.fromBufferAttribute(gp, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
            if (v.y > 0.2 || v.y < -0.23) continue; tot++;
            // the skirt's reach this way at this height: its farthest point near the same height and side
            let reach = 0; const ang = Math.atan2(v.x, v.z); for (const q of pts){ if (Math.abs(q[1]-v.y) > 0.05) continue; const qa = Math.atan2(q[0], q[2]); let da = Math.abs(qa - ang); if (da > Math.PI) da = 2*Math.PI - da; if (da < 0.35) reach = Math.max(reach, Math.hypot(q[0], q[2])); }
            if (Math.hypot(v.x, v.z) > reach + 0.01) out2++; } }));
          worst = Math.max(worst, tot ? out2/tot : 0); }
        return +worst.toFixed(3); };
      out.clip = { follow:clip(true), still:clip(false) };
      G.gear.legs = newItem(); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.topOverPlate.includes(0.48) && !r.topOverPlate.some(h=>h < 0.3), 'a robe top over plate legs has no skirt of its own at all (RS-203)');
  A(r.bottomAlone.includes(0.48), 'a robe bottom is a long skirt, even with no top');
  A(r.both.includes(0.48) && !r.both.some(h=>h < 0.3), 'top and bottom together: the long skirt, and the top stops at the waist - no hem to poke through (RS-203)');
  A(!r.plateOnly.includes(0.48), 'plate legs are still legs');
  A(r.clip.follow < 0.02 && r.clip.still > r.clip.follow*3, 'mid-stride the legs stay inside the robe, which moves with them');
  A(r.kind.robe==='robelegs' && r.kind.plate==='legs', 'the robe bottom has its own icon');
  A(r.iconMid.robe > 0.8 && r.iconMid.plate < 0.3, 'the robe bottom icon is a skirt, not two trouser legs');
};
