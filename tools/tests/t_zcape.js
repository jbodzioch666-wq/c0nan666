// (probe, not in ALL) a cape with gear on the back: a 2h sword, a staff, a longsword and a kiteshield (the shield goes on the back),
// a bow. Each put away (rsSheath), the cloth run two seconds, drawn from behind, three-quarter behind and the side. Shot: shots/<ZOUT
// or zcape>.png, one row a setup. Prints how many cape points are inside each back item's box (in the torso's frame)
module.exports = async page=>{
  page.setDefaultTimeout(0); const out = process.env.ZOUT || 'zcape';
  const r = await page.evaluate(async ([CAPE, NOGC, WALK])=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear();
    const T = THREE, info = [], SET = [['2h sword', ()=>{ G.gear.weapon = rsMakeWeapon(3, 9); }], ['staff + shield', ()=>{ G.gear.weapon = rsMakeStaff(2); G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); }],
      ['sword + shield', ()=>{ G.gear.weapon = rsMakeWeapon(3, 5); G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); }], ['bow', ()=>{ G.gear.ranged = rsMakeBow(3, false); G.player.rsLastType = 'ranged'; }]];
    const W = 300, H = 400, cv = document.createElement('canvas'); cv.width = W*3; cv.height = H*SET.length; const R = gfxThreeR(new T.WebGLRenderer({ canvas:cv, antialias:true })); R.setSize(W*3, H*SET.length, false); R.setScissorTest(true);
    R.toneMapping = T.ACESFilmicToneMapping; R.outputColorSpace = T.SRGBColorSpace;
    const sc = new T.Scene(); sc.background = new T.Color('#3a332c'); sc.add(new T.HemisphereLight(0xdde4f0, 0x2a2018, 0.8)); const dl = new T.DirectionalLight(0xffe0b0, 1.4); dl.position.set(-1.2, 2, -1.6); sc.add(dl); const rl = new T.DirectionalLight(0x9fb4ff, 0.8); rl.position.set(1.5, 1.4, 2); sc.add(rl);
    for (let row=0; row<SET.length; row++){ const [nm, eq] = SET[row];
      for (const k of ['weapon','offhand','ranged','cape','chest','legs']) G.gear[k] = newItem(); G.player.rsLastType = 'melee'; eq(); G.gear.cape = rsMakeCape(60, CAPE); G.gear.chest = rsMakeArmour('metal', 3, 'chest'); G.gear.legs = rsMakeArmour('metal', 3, 'legs'); rsSync && rsSync();
      const e = m3dInstance({}, rsPlayerLook()), rg = e.rig; sc.add(e.holder);
      for (let i=0;i<30;i++) rsSheath(e, false, 0.1, i*0.1, 0); m3dPoseHumanoid(rg, 0, 0, 0, 0, 0, e); for (let i=0;i<30;i++) rsSheath(e, false, 0.1, i*0.1, 0); e.holder.updateMatrixWorld(true);
      if (NOGC && rg.cape) rg.cape.userData.gc = null; if (rg.cape) for (let i=0;i<150;i++){ if (WALK){ e.holder.position.z += 1.6/60; m3dPoseHumanoid(rg, i/60*1.6, 1, 0, 0, 0, e); } e.holder.updateMatrixWorld(true); m3dCapeCloth(rg.cape, rg, 1/60); } e.holder.position.set(0, 0, 0);
      e.holder.updateMatrixWorld(true);
      /* cape points inside a back item's box */
      const inv = new T.Matrix4().copy(rg.torso.matrixWorld).invert(), boxes = [];
      for (const it of (rg.shd ? rg.shd.items : [])){ if (it.holder!==rg.torso) continue; const b = new T.Box3(); it.o.traverse(o=>{ if (!o.isMesh || !o.visible) return; const g = o.geometry; g.computeBoundingBox(); b.union(g.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld))); }); boxes.push(b); }
      let inside = 0, tot = 0; const v = new T.Vector3(); if (rg.cape){ const ps = rg.cape.geometry.attributes.position; for (let i=0;i<ps.count;i++){ v.fromBufferAttribute(ps, i); rg.cape.localToWorld(v); v.applyMatrix4(inv); tot++; if (boxes.some(b=>b.containsPoint(v))) inside++; } }
      /* cape points with gear between them and your back: the gear shows through the cape */
      const gear = []; for (const it of (rg.shd ? rg.shd.items : [])) if (it.holder===rg.torso) for (const top of [it.o, it.sc]) if (top) top.traverse(o=>{ if (o.isMesh && o.visible) gear.push(o); });
      let over = 0; if (rg.cape && gear.length){ const ps = rg.cape.geometry.attributes.position, fw = new T.Vector3(0, 0, 1).transformDirection(rg.torso.matrixWorld), ray = new T.Raycaster(); ray.far = 0.2; gear.forEach(o=>{ if (o.material) o.material.side = T.DoubleSide; });
        for (let i=0;i<ps.count;i++){ v.fromBufferAttribute(ps, i); rg.cape.localToWorld(v); ray.set(v, fw); if (ray.intersectObjects(gear, false).length) over++; } }
      const U = rg.cape && rg.cape.userData, dbg = {}; if (U && U.gc){ const NX = U.grid[0], NY = U.grid[1], W = NX + 1, P = U.P; let nset = 0, below = 0, zs = []; for (let i=0;i<U.gc.length;i++) if (U.gc[i] > -1e8){ nset++; if (P[i*3+2] < U.gc[i] - 0.001) below++; if (zs.length < 6) zs.push([i, +U.gc[i].toFixed(3), +P[i*3+2].toFixed(3), +U.wl[i].toFixed(3)]); } dbg.nset = nset; dbg.below = below; dbg.zs = zs; dbg.grid = U.grid; dbg.H = U.h; dbg.manual = U.manual; }
      info.push({ nm, cape:!!rg.cape, items:boxes.length, gc:!!(rg.cape && rg.cape.userData.gc), over, tot });
      const bb = new T.Box3().setFromObject(e.holder), hgt = bb.max.y - bb.min.y;
      [Math.PI, Math.PI*0.75, Math.PI/2].forEach((yaw, k)=>{ e.holder.rotation.y = yaw; e.holder.updateMatrixWorld(true); const c = new T.Vector3(0, hgt*0.6, 0), cam = new T.PerspectiveCamera(30, W/H, 0.01, 50); cam.position.set(0, hgt*0.75, hgt*1.7); cam.lookAt(c);
        R.setViewport(k*W, (SET.length - 1 - row)*H, W, H); R.setScissor(k*W, (SET.length - 1 - row)*H, W, H); R.render(sc, cam); });
      sc.remove(e.holder); }
    const shot = cv.toDataURL('image/png'); R.dispose(); return { info, shot }; }, [process.env.ZCAPE || 'Zamorak Cape', !!process.env.ZNOGC, !!process.env.ZWALK]);
  require('fs').writeFileSync(SHOTS + '/' + out + '.png', Buffer.from(r.shot.split(',')[1], 'base64'));
  console.log(JSON.stringify(r.info));
};
