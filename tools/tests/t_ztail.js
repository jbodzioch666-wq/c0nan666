// (probe, not in ALL) a tiefling in a robe and a cape, the tail swishing: from behind, three-quarter and the side, at three moments of
// the swish; ZROBE=0 for plate, ZRACE=Dragonborn for another race. Shot: shots/<ZOUT or ztail>.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const out = process.env.ZOUT || 'ztail';
  const r = await page.evaluate(async ([ROBE, CAPE, RACE])=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); const T = THREE, p = G.player; p.race = RACE; for (const k of ['weapon','offhand','ranged','cape','chest','legs']) G.gear[k] = newItem();
    G.gear.weapon = rsMakeStaff(2); if (ROBE){ G.gear.chest = rsMakeArmour('cloth', 3, 'chest'); G.gear.legs = rsMakeArmour('cloth', 3, 'legs'); } else { G.gear.chest = rsMakeArmour('metal', 3, 'chest'); G.gear.legs = rsMakeArmour('metal', 3, 'legs'); }
    if (CAPE) G.gear.cape = rsMakeCape(60, 'Saradomin Cape'); rsSync && rsSync();
    const e = m3dInstance({}, rsPlayerLook({ race:RACE })), rg = e.rig; const info = { tail:!!rg.tail, skirt:!!rg.skirt, cape:!!rg.cape };
    const W = 300, H = 400, ROWS = 3, cv = document.createElement('canvas'); cv.width = W*3; cv.height = H*ROWS; const R = gfxThreeR(new T.WebGLRenderer({ canvas:cv, antialias:true })); R.setSize(W*3, H*ROWS, false); R.setScissorTest(true);
    R.toneMapping = T.ACESFilmicToneMapping; R.outputColorSpace = T.SRGBColorSpace;
    const sc = new T.Scene(); sc.background = new T.Color('#3a332c'); sc.add(new T.HemisphereLight(0xdde4f0, 0x2a2018, 0.8)); const dl = new T.DirectionalLight(0xffe0b0, 1.4); dl.position.set(-1.2, 2, -1.6); sc.add(dl); const rl = new T.DirectionalLight(0x9fb4ff, 0.8); rl.position.set(1.5, 1.4, 2); sc.add(rl);
    sc.add(e.holder); let t = 0;
    for (let row=0; row<ROWS; row++){
      for (let i=0;i<40;i++){ t += 1/60; m3dPoseHumanoid(rg, t + row*0.43, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); if (rg.cape) m3dCapeCloth(rg.cape, rg, 1/60); if (rg.skirt) m3dSkirtFollow(rg); }
      info['z' + row] = +(rg.tail.rotation.z).toFixed(2);
      /* tail points outside the robe: a level ray from the point in to the body's middle crosses the skirt */
      if (rg.skirt){ e.holder.updateMatrixWorld(true); const ax = new T.Vector3(); rg.hips.getWorldPosition(ax); const ray = new T.Raycaster(), v = new T.Vector3(), d = new T.Vector3(), side = rg.skirt.material.side; rg.skirt.material.side = T.DoubleSide; let out = 0, tot = 0;
        rg.tail.traverse(o=>{ if (!o.isMesh) return; const pa = o.geometry.attributes.position; for (let i=0;i<pa.count;i+=2){ v.fromBufferAttribute(pa, i); o.localToWorld(v); d.set(ax.x - v.x, 0, ax.z - v.z); const L = d.length(); if (L < 1e-4) continue; d.normalize(); ray.set(v, d); ray.far = L; tot++; if (ray.intersectObject(rg.skirt, false).length) out++; } });
        rg.skirt.material.side = side; info['out' + row] = out + '/' + tot; }
      const bb = new T.Box3().setFromObject(e.holder), hgt = bb.max.y - bb.min.y;
      [Math.PI, Math.PI*0.7, Math.PI/2].forEach((yaw, k)=>{ e.holder.rotation.y = yaw; e.holder.updateMatrixWorld(true); const c = new T.Vector3(0, hgt*0.35, 0), cam = new T.PerspectiveCamera(30, W/H, 0.01, 50); cam.position.set(0, hgt*0.45, hgt*1.5); cam.lookAt(c);
        R.setViewport(k*W, (ROWS - 1 - row)*H, W, H); R.setScissor(k*W, (ROWS - 1 - row)*H, W, H); R.render(sc, cam); }); e.holder.rotation.y = 0; }
    return { info, shot:cv.toDataURL('image/png') }; }, [process.env.ZROBE!=='0', process.env.ZCAPE!=='0', process.env.ZRACE || 'Tiefling']);
  require('fs').writeFileSync(SHOTS + '/' + out + '.png', Buffer.from(r.shot.split(',')[1], 'base64'));
  console.log(JSON.stringify(r.info));
};
