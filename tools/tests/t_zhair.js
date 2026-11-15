// (art probe, not in ALL) heads with each hairstyle from four sides, and under helmets
const shotlib = require('./shotlib');
module.exports = async page=>{
  await shotlib.install(page);
  const sets = process.env.ZHAIR ? JSON.parse(process.env.ZHAIR) : [['m_long', { hair:2, beard:0 }], ['f_long', { hair:2, body:1 }], ['m_short', { hair:1, beard:3 }], ['f_tail', { hair:3, body:1 }], ['m_swept', { hair:9, beard:0 }]];
  for (const [nm, lk, helm, fx] of sets){
    const urls = await page.evaluate(([lk, helm, fx])=>{ if (!window.__inCC){ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); window.__inCC = 1; }
      const L = Object.assign(lookDefault('Human'), { body:0 }, lk), pt = rsPlayerLook({ race:'Human', look:L, bare:true }); if (helm) pt.o.helm = helm;
      const root = m3dBuilders().get(pt.paint)(pt.o); root.updateMatrixWorld(true); const head = M3D.meta.get(root).rig.head, c = new THREE.Vector3(); head.getWorldPosition(c); c.y -= 0.02; if (fx) (new Function('head', fx))(head);
      const us = __shot(root, { yaws:[0.5, 1.57, 2.6, 3.4], w:360, h:420, focus:c, span:0.42, pitch:0.15 }); const cv = document.createElement('canvas'); cv.width = 1440; cv.height = 420; const x = cv.getContext('2d');
      return Promise.all(us.map((u, i)=>new Promise(r=>{ const im = new Image(); im.onload = ()=>{ x.drawImage(im, i*360, 0); r(); }; im.src = u; }))).then(()=>[cv.toDataURL('image/png')]); }, [lk, helm, fx]);
    shotlib.save(urls, 'zhair_' + nm);
  }
};
