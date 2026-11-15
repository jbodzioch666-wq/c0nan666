// RS-893: camp tents are ridge tents (o3TentKit/o3Tent): sagging canvas sides darker at the hem, a closed back, front flaps tied back on a
// dark inside, poles, ridge pole, guy ropes and pegs - not four-sided flat-shaded cones. A camp's tents (o3CampModel, quest camps) face their
// fire; your own camp tent is pale canvas; the old camp's tent has fallen half over. Shots: shots/rs893-camp.jpg, rs893-tent.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(()=>{ const T = THREE, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const K = o3TentKit(), g = new T.Group(); o3CampModel(g, 0, 0, 0, 4, []);
    let cones = 0; const tents = []; g.traverse(o=>{ if (o.isMesh && o.geometry.type==='ConeGeometry' && (o.geometry.parameters||{}).radialSegments===4) cones++; if (o.isGroup && o.children.some(c=>c.geometry===K.canvas)) tents.push(o); });
    out.cones = cones; out.tents = tents.length;
    out.facing = tents.map(t=>{ const f = new T.Vector3(1, 0, 0).applyQuaternion(t.quaternion), to = new T.Vector3(-t.position.x, 0, -t.position.z).normalize(); return +f.dot(to).toFixed(2); });
    const bb = new T.Box3().setFromBufferAttribute(K.canvas.attributes.position); out.size = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z].map(v=>+v.toFixed(2));
    const c = K.canvas.attributes.color; let lo = 1, hi = 0; for (let i=0;i<c.count;i++){ lo = Math.min(lo, c.getX(i)); hi = Math.max(hi, c.getX(i)); } out.shade = [+lo.toFixed(2), +hi.toFixed(2)];
    out.mats = tents[0] ? tents[0].children.map(m=>({ tex:m.material.map===o3CanvasTex(), flat:!!m.material.flatShading, ds:m.material.side===T.DoubleSide })) : [];
    /* render: the camp, and one tent close */
    const cv = document.createElement('canvas'); cv.width = 1400; cv.height = 800; const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(3, 5, 2); d.castShadow = true; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.02; d.shadow.camera.left = d.shadow.camera.bottom = -3; d.shadow.camera.right = d.shadow.camera.top = 3; d.shadow.mapSize.set(2048, 2048); sc.add(d);
    const fl = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshStandardMaterial({ color:0x5a8a3a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); sc.add(g);
    const solo = o3Tent('#d8ccb0', 1); solo.position.set(2.4, 0, 0); solo.rotation.y = -0.6; sc.add(solo);
    const cam = new T.PerspectiveCamera(35, 1400/800, 0.05, 60); cam.position.set(1.4, 1.6, 2.4); cam.lookAt(0, 0.15, 0); R.render(sc, cam); out.s1 = cv.toDataURL('image/jpeg', 0.9);
    cam.position.set(3.3, 0.55, 0.9); cam.lookAt(2.4, 0.2, 0); R.render(sc, cam); out.s2 = cv.toDataURL('image/jpeg', 0.9); R.dispose();
    return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs893-camp.jpg'), Buffer.from(r.s1.split(',')[1], 'base64')); fs.writeFileSync(path.join(__dirname, 'shots', 'rs893-tent.jpg'), Buffer.from(r.s2.split(',')[1], 'base64')); delete r.s1; delete r.s2;
  console.log(JSON.stringify(r));
  A(!r.cones && r.tents===4, 'a camp of four has four ridge tents and no cones', r);
  A(r.facing.every(f=>f > 0.95), 'every door turned to the fire', r);
  A(r.size[0] > 0.55 && r.size[1] > 0.35 && r.size[2] > 0.48, 'a tent the size of the old ones', r);
  A(r.shade[0] < 0.3 && r.shade[1] > 0.95, 'the canvas darker at its hem, the inside dark', r);
  A(r.mats.length===3 && r.mats[0].tex && r.mats[0].ds && !r.mats.some(m=>m.flat), 'woven canvas, two-sided, nothing flat-shaded', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
