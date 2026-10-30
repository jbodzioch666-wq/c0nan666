// RS-752: (the tail's tuck under a robe went in RS-753: it comes out through the robe now, t_rs753) a willow's dome is closed
// underneath (o3ClosedDome): its shadow is whole whichever side the shadow pass draws -
// open, a one-sided pass threw only part of it (a crescent)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear();
    const T = THREE, out = {};
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
  const S = r.shadow; A(S.open2 > 500 && S.closed1 > S.open2*0.9 && Math.abs(S.closed1 - S.closed2) < S.closed2*0.1, "the closed dome's shadow is whole either way: " + JSON.stringify(S));
  A(S.open1 < S.open2*0.75, 'the open dome, one-sided, threw only part (the crescent): ' + JSON.stringify(S));
  A(r.geo.node, "the woodcutting willow's dome is the closed one");
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
