// (probe, not in ALL) a robe close in on a woman and a man - front, three-quarter and side, from the hips to the neck. Shot: shots/zrobe.png
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const T = THREE, out = {};
    G.gear.chest = rsMakeArmour('cloth', 4, 'chest'); G.gear.chest.dye = '#e4ddcc';
    const figs = []; for (const body of [1, 0]){ G.player.look.body = body; if (body) G.player.look.beard = 0; const L = rsPlayerLook(); const e = m3dInstance({}, L); figs.push(e);
      const cm = e.rig.chestMesh, g0 = cm && (cm.geometry.userData.from || cm.geometry), q = g0 && g0.attributes.position; let ymax = -9, ymin = 9; if (q) for (let i=0;i<q.count;i++){ const Y = q.getY(i)*cm.scale.y + cm.position.y; if (Y > ymax) ymax = Y; if (Y < ymin) ymin = Y; }
      out[body ? 'fem' : 'male'] = { top:e.rig.skirt && e.rig.skirt.userData.extTop, from:e.rig.skirt && e.rig.skirt.userData.extFrom, chest:[+ymin.toFixed(3), +ymax.toFixed(3)], chestPar:cm && cm.parent && (cm.parent===e.rig.torso ? 'torso' : cm.parent===e.rig.hips ? 'hips' : cm.parent.type), skPar:e.rig.skirt.parent===e.rig.hips ? 'hips' : 'other', torsoY:e.rig.torso.position.y, armY:e.rig.arms && e.rig.arms[0].sh.position.y }; }
    const W = 330, H = 400, cv = document.createElement('canvas'); cv.width = W*6; cv.height = H; const R = new T.WebGLRenderer({ canvas:cv, antialias:true }); R.setSize(W*6, H, false); R.setScissorTest(true);
    const sc = new T.Scene(); sc.background = new T.Color('#2a2420'); sc.add(new T.HemisphereLight(0xffffff, 0x403020, 1.0)); const dl = new T.DirectionalLight(0xffffff, 1.5); dl.position.set(1.5, 3, 4); sc.add(dl);
    let k = 0; for (const e of figs){ for (const yaw of [0, 0.75, 1.5]){ const g = new T.Group(); g.add(e.holder); sc.add(g); g.rotation.y = yaw; m3dPoseHumanoid(e.rig, 0, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
        const w = e.rig.torso.localToWorld(new T.Vector3(0, 0.14, 0)), cam = new T.PerspectiveCamera(30, W/H, 0.01, 50); cam.position.set(w.x, w.y + 0.03, w.z + 0.75*(e.holder.scale.x || 1)); cam.lookAt(w.x, w.y - 0.02, w.z);
        R.setViewport(k*W, 0, W, H); R.setScissor(k*W, 0, W, H); R.render(sc, cam); sc.remove(g); k++; } }
    out.shot = cv.toDataURL('image/png'); R.dispose(); return out; });
  require('fs').writeFileSync(SHOTS + '/zrobe.png', Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
};
