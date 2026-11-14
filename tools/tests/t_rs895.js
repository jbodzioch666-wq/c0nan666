// RS-895: a camp's fire is a pit (o3FirePit: soot-stained stones in a ring, a bed of ash, charred logs leant together, glowing coals) and its
// flag a banner (o3Banner: a swallowtailed cloth with a painted sign on a crossbar, a pole with an iron point) - no four-sided pole and flat
// card; your own fire uses the same pit, its spit forked sticks (no dodecahedra, no six- or four-sided sticks). Shots: shots/rs895-camp.jpg, rs895-pit.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(()=>{ const T = THREE, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const K = o3PitKit(), g = new T.Group(); o3CampModel(g, 0, 0, 0, 4, []);
    let low = 0, plane = 0, pits = 0, banners = 0; g.traverse(o=>{ if (!o.isMesh) return; const gg = o.geometry, pr = gg.parameters || {};
      if (/Cylinder|Cone/.test(gg.type) && pr.radialSegments < 8) low++; if (gg.type==='PlaneGeometry') plane++; if (gg===K.logs) pits++; if (gg===K.cloth) banners++; });
    Object.assign(out, { low, plane, pits, banners });
    out.keep = ['stones', 'ash', 'logs', 'coals', 'fork', 'bar', 'bwood', 'biron', 'cloth'].every(k=>K[k] && K[k].userData.keep);
    const c = K.stones.attributes.color; let lo = 1, hi = 0; for (let i=0;i<c.count;i++){ lo = Math.min(lo, c.getX(i)); hi = Math.max(hi, c.getX(i)); } out.soot = [+lo.toFixed(2), +hi.toFixed(2)];
    const lc = K.logs.attributes.color; lo = 1; hi = 0; for (let i=0;i<lc.count;i++){ lo = Math.min(lo, lc.getX(i)); hi = Math.max(hi, lc.getX(i)); } out.char = [+lo.toFixed(2), +hi.toFixed(2)];
    const bb = new T.Box3().setFromBufferAttribute(K.cloth.attributes.position); out.cloth = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z].map(v=>+v.toFixed(3));
    /* the cloth's swallowtail: the middle of its foot higher than its corners */
    const cp = K.cloth.attributes.position, nv = 25; out.tail = +(cp.getY(11*nv + 24) - cp.getY(0*nv + 24)).toFixed(3);
    /* your own fire: the pit, and the spit on forks */
    G.player.turnCount = 10; skP().fire = { x:G.ow.px, y:G.ow.py, until:1e9 }; O3.scene = O3.scene || new T.Scene(); O3.heightAt = O3.heightAt || (()=>0); O3.fireGrp = null; O3.campTent = O3.campSpit = null; o3Campfire(T);
    let own = { low:0, dodec:0, pit:0, forks:0 }; O3.fireGrp.traverse(o=>{ if (!o.isMesh) return; const gg = o.geometry, pr = gg.parameters || {}; if (/Cylinder|Cone/.test(gg.type) && pr.radialSegments < 8) own.low++; if (gg.type==='DodecahedronGeometry') own.dodec++; if (gg===K.logs) own.pit++; if (gg===K.fork) own.forks++; }); out.own = own;
    /* render */
    const cv = document.createElement('canvas'); cv.width = 1400; cv.height = 900; const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(3, 5, 2); d.castShadow = true; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.02; d.shadow.camera.left = d.shadow.camera.bottom = -3; d.shadow.camera.right = d.shadow.camera.top = 3; d.shadow.mapSize.set(2048, 2048); sc.add(d);
    const fl = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshStandardMaterial({ color:0x5a8a3a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); sc.add(g);
    const pit = o3FirePit(1); pit.position.set(2.4, 0, 0); sc.add(pit); const sp = O3.campSpit; O3.fireGrp.remove(sp); sp.visible = true; sp.position.set(2.4, 0, 0); sc.add(sp);
    const cam = new T.PerspectiveCamera(35, 1400/900, 0.05, 60); cam.position.set(1.2, 1.3, 2.2); cam.lookAt(-0.1, 0.25, -0.1); R.render(sc, cam); out.s1 = cv.toDataURL('image/jpeg', 0.9);
    cam.position.set(2.85, 0.45, 0.55); cam.lookAt(2.4, 0.1, 0); R.render(sc, cam); out.s2 = cv.toDataURL('image/jpeg', 0.9); R.dispose();
    return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs895-camp.jpg'), Buffer.from(r.s1.split(',')[1], 'base64')); fs.writeFileSync(path.join(__dirname, 'shots', 'rs895-pit.jpg'), Buffer.from(r.s2.split(',')[1], 'base64')); delete r.s1; delete r.s2;
  console.log(JSON.stringify(r));
  A(!r.low && !r.plane, 'no low-sided poles or flat cards in a camp', r);
  A(r.pits===1 && r.banners===1, 'a camp has a fire pit and a banner', r);
  A(r.keep, 'kit geometries kept across rebuilds', r);
  A(r.soot[0] < 0.45 && r.soot[1] > 0.95, 'the stones sooty toward the fire', r);
  A(r.char[0] < 0.25 && r.char[1] > 0.95, 'the logs charred at their ends in the fire', r);
  A(r.cloth[0] > 0.25 && r.cloth[1] > 0.3 && r.cloth[2] > 0.02, 'a banner cloth of a size, hanging in folds', r);
  A(r.tail > 0.05, 'a swallowtailed foot', r);
  A(!r.own.low && !r.own.dodec && r.own.pit===1 && r.own.forks===2, 'your own fire: the pit and forked sticks', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
