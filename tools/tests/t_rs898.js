// RS-898: a halfling town on the open land (o3Site OW_TOWN, halfling) is hobbit holes dug into their hills (o3HobbitHill): a fine turf grid
// with a bank of earth cut at the front, a planked round door with a brass knob in a ring of eleven stones, round windows framed and barred,
// a stone chimney, stepping stones - not half-balls with a flat disc and a five-sided ring on them; the stockade's stakes rounder.
// Shots: shots/rs898-shire.jpg, rs898-door.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; });
  const r = await page.evaluate(()=>{ const T = THREE, out = {};
    const all = townList().concat(G.ow.spawnPos ? [G.ow.spawnPos] : []), hob = all.find(q=>(townFlavorAt(q.x, q.y)||{}).race==='halfling'); out.hob = !!hob; if (!hob) return out;
    for (const k of ['windows', 'smoke', 'flames', 'glows']) O3[k] = O3[k] || []; O3.tex = O3.tex || {}; if (!O3.heightAt) O3.heightAt = ()=>0;
    const t0 = performance.now(), g = o3Site(OW_TOWN, hob.x + 0.5, hob.y + 0.5); out.ms = +(performance.now() - t0).toFixed(1); g.updateMatrixWorld(true);
    const M = o3Mats(); let halfBalls = 0, hills = 0, doors = 0, knobs = 0, rings = 0, frames = 0, chims = 0, low = 0;
    g.traverse(o=>{ if (!o.isMesh) return; const gg = o.geometry, pr = gg.parameters || {};
      if (gg.type==='SphereGeometry' && pr.thetaLength===Math.PI/2) halfBalls++;
      if (o.material===M.turfV){ hills++; out.hillVerts = Math.min(out.hillVerts || 1e9, gg.attributes.position.count); }
      if (gg.type==='CircleGeometry' && o.material.map===o3HobbitDoorTex()) doors++;
      if (o.material===M.hbrass) knobs++; if (gg===M.hRing) rings++; if (gg.type==='TorusGeometry' && /^hframe/.test(Object.keys(M).find(k=>M[k]===o.material) || '')) frames++;
      if (gg.type==='CylinderGeometry' && o.material===M.stone && pr.radialSegments >= 12) chims++;
      if ((o.isInstancedMesh || gg.type==='TorusGeometry') && pr.radialSegments < 8) low++; });
    Object.assign(out, { halfBalls, hills, doors, knobs, rings, frames, chims, low, smoke:O3.smoke.length });
    /* earth on the cut bank, turf on top */
    { let hg = null; g.traverse(o=>{ if (!hg && o.material===M.turfV) hg = o.geometry; }); const c = hg.attributes.color; let red = 0; for (let k=0;k<c.count;k++) if (c.getX(k) > c.getZ(k)*1.5) red++; out.earth = red; }
    g.traverse(o=>{ if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    const cv = document.createElement('canvas'); cv.width = 1400; cv.height = 900; const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(2, 5, 4); d.castShadow = true; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.02; d.shadow.camera.left = d.shadow.camera.bottom = -2; d.shadow.camera.right = d.shadow.camera.top = 2; d.shadow.mapSize.set(2048, 2048); sc.add(d);
    const fl = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshStandardMaterial({ color:0x5a8a3a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); sc.add(g);
    const cam = new T.PerspectiveCamera(35, 1400/900, 0.02, 60); cam.position.set(0.9, 1.5, 2.1); cam.lookAt(0, 0.1, 0); R.render(sc, cam); out.s1 = cv.toDataURL('image/jpeg', 0.9);
    cam.position.set(0.46, 0.2, 0.62); cam.lookAt(0.37, 0.085, 0.42); R.render(sc, cam); out.s2 = cv.toDataURL('image/jpeg', 0.9); R.dispose();
    return out; });
  if (r.s1){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs898-shire.jpg'), Buffer.from(r.s1.split(',')[1], 'base64')); fs.writeFileSync(path.join(__dirname, 'shots', 'rs898-door.jpg'), Buffer.from(r.s2.split(',')[1], 'base64')); delete r.s1; delete r.s2; }
  console.log(JSON.stringify(r));
  A(r.hob, 'a halfling town in the world', r);
  A(!r.halfBalls && r.hills===5 && r.hillVerts > 1500, 'five turf hills on a fine grid, no half-balls', r);
  A(r.doors===5 && r.knobs===5 && r.rings===5, 'each a planked door with a knob in a ring of stones', r);
  A(r.frames >= 6 && r.chims >= 6, 'framed round windows, stone chimneys with caps', r);
  A(r.smoke >= 3, 'smoke from the chimneys', r);
  A(r.earth > 50, 'earth shows where the bank is cut', r);
  A(!r.low, 'no low-sided stakes or rails', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
