// RS-894: the dragon lair's mouth (o3DragonLair) is a face of rock in relief - a vertex-coloured grid of lumps, cracks and a heavy lip that
// rolls back into the dark, its edges snapped onto the outline and the opening - not a bevelled extruded slab; its teeth are lathed, wavering
// stalactites instead of seven-sided cones; the crag is cut wider than the mouth so no lit jamb shows within. Shot: shots/rs894-lair.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(()=>{ const T = THREE, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    O3.smoke = O3.smoke || []; O3.flames = O3.flames || []; O3.heightAt = O3.heightAt || (()=>0); const mats = {}, g = new T.Group(); o3DragonLair(g, mats, k=>o3Hash(k, 3, 77), 0, 0); g.updateMatrixWorld(true);
    let bevel = 0, cones = 0, lathes = 0, relief = null; const bb = new T.Box3();
    g.traverse(o=>{ if (!o.isMesh) return; const gg = o.geometry, pr = gg.parameters || {};
      if (gg.type==='ExtrudeGeometry' && pr.options && pr.options.bevelEnabled) bevel++;
      if (gg.type==='ConeGeometry' && pr.radialSegments===7) cones++;
      if (gg.type==='LatheGeometry' && o.material===mats.lairCrag) lathes++;
      if (gg.type==='BufferGeometry' && o.material===mats.lairCrag && gg.attributes.color){ bb.setFromBufferAttribute(gg.attributes.position); if (bb.max.x - bb.min.x > 1.5 && bb.max.z - bb.min.z < 0.8) relief = o; } });
    out.bevel = bevel; out.cones = cones; out.lathes = lathes; out.relief = !!relief;
    if (relief){ const gg = relief.geometry, p = gg.attributes.position; bb.setFromBufferAttribute(p); out.verts = p.count; out.depth = +(bb.max.z - bb.min.z).toFixed(2); out.tris = gg.index.count/3;
      let bad = 0; const n = gg.attributes.normal.array; for (let i=0;i<n.length;i++) if (!isFinite(n[i])) bad++; out.badN = bad;
      const rc = new T.Raycaster(), hit = (x, y)=>{ rc.set(new T.Vector3(x, y, 2), new T.Vector3(0, 0, -1)); return rc.intersectObject(relief).length > 0; };
      out.inHole = [[-0.42, 0.05], [0.42, 0.05], [-0.42, 0.3], [0.42, 0.3], [-0.38, 0.5], [0.38, 0.5], [0, 0.3], [-0.2, 0.7], [0.2, 0.7], [0, 0.76]].filter(([x, y])=>hit(x, y)).length;   /* (inside the opening: straight sides to 0.34, an arch over them to 0.82) */
      out.onFace = [[-0.7, 0.4], [0.7, 0.4], [0, 1.0], [-0.6, 0.9]].filter(([x, y])=>hit(x, y)).length; }
    const cv = document.createElement('canvas'); cv.width = 1400; cv.height = 900; const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    g.traverse(o=>{ if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.6); d.position.set(3, 5, 4); d.castShadow = true; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.02; d.shadow.camera.left = d.shadow.camera.bottom = -3; d.shadow.camera.right = d.shadow.camera.top = 3; d.shadow.mapSize.set(2048, 2048); sc.add(d);
    const fl = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshStandardMaterial({ color:0x6a7a4a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); sc.add(g);
    const cam = new T.PerspectiveCamera(35, 1400/900, 0.05, 60); cam.position.set(0.6, 1.6, 3.4); cam.lookAt(0, 0.5, 0); R.render(sc, cam); out.shot = cv.toDataURL('image/jpeg', 0.9); R.dispose();
    return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs894-lair.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  A(!r.bevel && !r.cones, 'no bevelled slab arch, no seven-sided cone teeth', r);
  A(r.lathes===9, 'nine lathed stalactites', r);
  A(r.relief && r.verts > 4000 && r.depth > 0.3, 'a vertex-coloured relief face with depth', r);
  A(!r.badN, 'every normal finite', r);
  A(r.inHole===0, 'the opening stays clear of the face', r);
  A(r.onFace===4, 'the face covers the rock round the mouth', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
