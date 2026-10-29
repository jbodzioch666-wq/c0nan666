// RS-752: (1) a tiefling's tail under a robe to the ankles hangs close inside it (tail.userData.tuck, TAIL_TUCK) and its swish is
// small, so no part of it comes out through the skirt - it used to swish out through the robe and the cape over it; without a robe it
// is as it was. (2) a willow's dome is closed underneath (o3ClosedDome): its shadow is whole whichever side the shadow pass draws -
// open, a one-sided pass threw only part of it (a crescent)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear();
    const T = THREE, out = {};
    /* the tail */
    const fig = robe=>{ for (const k of ['weapon','offhand','ranged','cape','chest','legs']) G.gear[k] = newItem(); G.gear.weapon = rsMakeStaff(2);
      G.gear.chest = rsMakeArmour(robe ? 'cloth' : 'metal', 3, 'chest'); G.gear.legs = rsMakeArmour(robe ? 'cloth' : 'metal', 3, 'legs'); G.gear.cape = rsMakeCape(60, 'Saradomin Cape'); rsSync && rsSync();
      const e = m3dInstance({}, rsPlayerLook({ race:'Tiefling' })), rg = e.rig; let outN = 0, tot = 0, swish = 0;
      for (let k=0;k<12;k++){ m3dPoseHumanoid(rg, k*0.23, k%3===2 ? 1 : 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); if (rg.skirt) m3dSkirtFollow(rg); swish = Math.max(swish, Math.abs(rg.tail.rotation.z));
        if (!rg.skirt) continue; e.holder.updateMatrixWorld(true); const ax = new T.Vector3(); rg.hips.getWorldPosition(ax); const ray = new T.Raycaster(), v = new T.Vector3(), d = new T.Vector3(); rg.skirt.material.side = T.DoubleSide;
        rg.tail.traverse(o=>{ if (!o.isMesh) return; const pa = o.geometry.attributes.position; for (let i=0;i<pa.count;i+=2){ v.fromBufferAttribute(pa, i); o.localToWorld(v); d.set(ax.x - v.x, 0, ax.z - v.z); const L = d.length(); if (L < 1e-4) continue; ray.set(v, d.normalize()); ray.far = L; tot++; if (ray.intersectObject(rg.skirt, false).length) outN++; } }); }
      return { tail:!!rg.tail, tuck:!!(rg.tail && rg.tail.userData.tuck), skirt:!!rg.skirt, out:outN, tot, swish:+swish.toFixed(2), sz:rg.tail ? +rg.tail.scale.z.toFixed(2) : 0 }; };
    out.robe = fig(true); out.plate = fig(false);
    /* the willow's shadow: the shadowed ground's area, the sun low, the shadow pass two-sided and one-sided, the dome open and closed */
    const R = gfxThreeR(new T.WebGLRenderer({ antialias:false })); R.setSize(200, 200, false); R.shadowMap.enabled = true; R.shadowMap.type = T.PCFShadowMap; const rt = new T.WebGLRenderTarget(200, 200), px = new Uint8Array(200*200*4);
    const area = (geo, two)=>{ const sc = new T.Scene(); sc.background = new T.Color('#000000'); const dl = new T.DirectionalLight(0xffffff, 3); dl.position.set(5, 6, 2.4); dl.castShadow = true; dl.shadow.mapSize.set(1024, 1024); Object.assign(dl.shadow.camera, { left:-3, right:3, top:3, bottom:-3, near:0.1, far:30 }); dl.shadow.camera.updateProjectionMatrix(); sc.add(dl);
      const gr = new T.Mesh(new T.PlaneGeometry(8, 8), new T.MeshLambertMaterial({ color:0xffffff })); gr.rotation.x = -Math.PI/2; gr.receiveShadow = true; sc.add(gr);
      const lm = new T.MeshBasicMaterial({ color:0xffffff }); lm.shadowSide = two ? T.DoubleSide : null; const dm = new T.Mesh(geo, lm); dm.position.y = 1.2; dm.castShadow = true; sc.add(dm);
      const cam = new T.OrthographicCamera(-3, 3, 3, -3, 0.1, 20); cam.position.set(0, 10, 0); cam.up.set(0, 0, -1); cam.lookAt(0, 0, 0); dm.visible = true;
      /* (the dome drawn plain white from above: only the ground in its shadow is dark) */
      R.setRenderTarget(rt); R.render(sc, cam); R.readRenderTargetPixels(rt, 0, 0, 200, 200, px); R.setRenderTarget(null); let n = 0; for (let i=0;i<px.length;i+=4) if (px[i] < 100) n++; return n; };
    const open = new T.SphereGeometry(0.5, 12, 8, 0, 6.283, 0, 1.9), closed = o3ClosedDome(0.5, 12, 8, 1.9);
    out.shadow = { open2:area(open, true), open1:area(open, false), closed2:area(closed, true), closed1:area(closed, false) };
    out.geo = { node:o3NodeGeo().dome.attributes.position.count === closed.attributes.position.count };
    R.dispose(); return out; });
  console.log(JSON.stringify(r));
  A(r.robe.tail && r.robe.skirt && r.robe.tuck && r.robe.tot > 30 && r.robe.out===0 && r.robe.swish <= 0.05, 'under a robe the tail stays inside it: ' + JSON.stringify(r.robe));
  A(r.plate.tail && !r.plate.skirt && !r.plate.tuck && r.plate.swish > 0.2 && r.plate.sz===1, 'without a robe it swishes as before: ' + JSON.stringify(r.plate));
  const S = r.shadow; A(S.open2 > 500 && S.closed1 > S.open2*0.9 && Math.abs(S.closed1 - S.closed2) < S.closed2*0.1, "the closed dome's shadow is whole either way: " + JSON.stringify(S));
  A(S.open1 < S.open2*0.75, 'the open dome, one-sided, threw only part (the crescent): ' + JSON.stringify(S));
  A(r.geo.node, "the woodcutting willow's dome is the closed one");
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
