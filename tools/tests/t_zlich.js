// (probe, not in ALL) the sculpted skeletons dressed by class, full length from four sides: ZMONS='lich acolyte,lich' (default the four
// liches), ZOUT the shot's name (default zlich), ZWALK=1 mid-stride. Shot: shots/<ZOUT>.png, one row a monster
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const names = (process.env.ZMONS || 'lich acolyte,lich,archlich,risen lich-lord').split(','), out = process.env.ZOUT || 'zlich', walk = +(process.env.ZWALK || 0);
  const r = await page.evaluate(async ([names, walk, plain, zoom])=>{ window.ZPLAIN = plain; window.ZZOOM = zoom; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const T = THREE, info = {};
    const W = 300, H = 380, cv = document.createElement('canvas'); cv.width = W*4; cv.height = H*names.length; const R = gfxThreeR(new T.WebGLRenderer({ canvas:cv, antialias:true })); R.setSize(W*4, H*names.length, false); R.setScissorTest(true);
    R.toneMapping = T.ACESFilmicToneMapping; R.outputColorSpace = T.SRGBColorSpace;
    const sc = new T.Scene(); sc.background = new T.Color('#3a332c'); sc.add(new T.HemisphereLight(0xdde4f0, 0x2a2018, 0.8)); const dl = new T.DirectionalLight(0xffe0b0, 1.4); dl.position.set(1.2, 2, 1.6); sc.add(dl); const rl = new T.DirectionalLight(0x9fb4ff, 1.0); rl.position.set(-1.5, 1.4, -2); sc.add(rl);   /* (the bestiary's lights) */
    const fl = new T.Mesh(new T.CircleGeometry(1.2, 40), new T.MeshStandardMaterial({ color:0x5a4a3a })); fl.rotation.x = -Math.PI/2; sc.add(fl);
    for (let row=0; row<names.length; row++){ const nm = names[row]; let e = null; for (let i=0;i<900 && !e;i++){ e = sk3Instance({ nm, x:0, y:0 }); if (!e) await new Promise(r=>requestAnimationFrame(r)); }
      if (!e){ info[nm] = 'none'; continue; }
      if (window.ZPLAIN) e.holder.traverse(o=>{ if (o.isMesh && o.material.side===2 && o.geometry.attributes.color && o.geometry.attributes.color.array[0] < 0.1) o.material = new T.MeshStandardMaterial({ color:0x202020, side:2 }); });
      info.rim = M3D.rim && M3D.rim.value && M3D.rim.value.toArray();
      sk3Pose(1.3, walk, 0, 0, e.seed, e.rig, 0.6); e.holder.updateMatrixWorld(true);
      const box0 = new T.Box3().setFromObject(e.holder), hgt = box0.max.y - box0.min.y; info[nm] = { h:+hgt.toFixed(2), cls:e.cls };
      [0, 0.8, 1.57, 3.14].forEach((yaw, k)=>{ const g = new T.Group(); g.add(e.holder); sc.add(g); g.rotation.y = yaw; g.updateMatrixWorld(true);
        const zm = window.ZZOOM, c = new T.Vector3(0, hgt*(zm ? 0.75 : 0.5), 0), cam = new T.PerspectiveCamera(30, W/H, 0.01, 50); cam.position.set(0, hgt*(zm ? 0.8 : 0.62), hgt*(zm ? 1.0 : 2.25)); cam.lookAt(c);
        R.setViewport(k*W, (names.length - 1 - row)*H, W, H); R.setScissor(k*W, (names.length - 1 - row)*H, W, H); R.render(sc, cam); sc.remove(g); }); }
    const shot = cv.toDataURL('image/png'); R.dispose(); return { info, shot }; }, [names, walk, !!process.env.ZPLAIN, !!process.env.ZZOOM]);
  require('fs').writeFileSync(SHOTS + '/' + out + '.png', Buffer.from(r.shot.split(',')[1], 'base64'));
  console.log(JSON.stringify(r.info));
};
