// RS-896: the Dwarf Gate's ore cart is a tub of planks flaring to an iron-bound rim on a frame, axles and flanged, dished iron wheels, ore and
// rock heaped over it (not a four-sided tapered cylinder on plain discs); its lantern hangs from a braced arm on a lathed post: hook, ring, cap,
// glowing panes between four bars, a base (not an iron box). Shots: shots/rs896-cart.jpg, rs896-lamp.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; });
  const r = await page.evaluate(()=>{ const T = THREE, out = {};
    O3.flames = O3.flames || []; O3.glows = O3.glows || []; O3.smoke = O3.smoke || []; O3.heightAt = O3.heightAt || (()=>0); const g = o3Site(OW_MINE, 0.5, 0.5); g.updateMatrixWorld(true);
    let cart = null; g.traverse(o=>{ if (o.isGroup && Math.abs(o.position.x - 0.5) < 1e-6 && Math.abs(o.position.z - 0.74) < 1e-6) cart = o; });
    out.cart = !!cart; if (cart){ let low = 0, wheels = 0, planks = 0, iron = 0; cart.children.forEach(o=>{ const gg = o.geometry, pr = gg.parameters || {};
        if (gg.type==='CylinderGeometry' && pr.radialSegments===4) low++; if (gg.type==='LatheGeometry' && pr.segments >= 24) wheels++; if (gg.type==='ExtrudeGeometry' && o.material===o3Mats().wood) planks++; if (o.material===o3Mats().iron) iron++; });
      Object.assign(out, { low, wheels, planks, iron });
      const bb = new T.Box3().setFromObject(cart); out.cartSize = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z].map(v=>+v.toFixed(3)); }
    let boxes = 0, panes = 0, lathes = 0; const wp = new T.Vector3(), near = o=>o.getWorldPosition(wp).distanceTo(new T.Vector3(-0.47, 0.4, 0.62)) < 0.45; g.traverse(o=>{ if (!o.isMesh || !near(o)) return; const gg = o.geometry; if (gg.type==='BoxGeometry' && o.material===o3Mats().iron) boxes++; if (o.material===o3Mats().lampGlass) panes++; if (gg.type==='LatheGeometry') lathes++; });
    Object.assign(out, { boxes, panes, lathes });
    /* render it alone */
    g.traverse(o=>{ if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    const cv = document.createElement('canvas'); cv.width = 1400; cv.height = 900; const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(3, 5, 4); d.castShadow = true; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.02; d.shadow.camera.left = d.shadow.camera.bottom = -3; d.shadow.camera.right = d.shadow.camera.top = 3; d.shadow.mapSize.set(2048, 2048); sc.add(d);
    const fl = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshStandardMaterial({ color:0x6a7a4a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); sc.add(g); g.position.set(0, 0, 0);
    const cam = new T.PerspectiveCamera(35, 1400/900, 0.02, 60); cam.position.set(1.0, 0.42, 1.25); cam.lookAt(0.5, 0.09, 0.74); R.render(sc, cam); out.s1 = cv.toDataURL('image/jpeg', 0.9);
    cam.position.set(-0.2, 0.62, 1.05); cam.lookAt(-0.45, 0.45, 0.62); R.render(sc, cam); out.s2 = cv.toDataURL('image/jpeg', 0.9); R.dispose();
    return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs896-cart.jpg'), Buffer.from(r.s1.split(',')[1], 'base64')); fs.writeFileSync(path.join(__dirname, 'shots', 'rs896-lamp.jpg'), Buffer.from(r.s2.split(',')[1], 'base64')); delete r.s1; delete r.s2;
  console.log(JSON.stringify(r));
  A(r.cart && !r.low, 'the cart found, no four-sided tub', r);
  A(r.wheels===4, 'four lathed wheels', r);
  A(r.planks >= 13 && r.iron >= 14, 'a tub of planks bound in iron', r);
  A(r.cartSize[0] > 0.17 && r.cartSize[1] > 0.15 && r.cartSize[2] > 0.22, 'a cart the size of the old one', r);
  A(!r.boxes && r.panes===1 && r.lathes >= 3, 'the lantern lathed with panes, no iron box', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
