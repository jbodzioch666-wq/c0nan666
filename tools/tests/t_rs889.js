// RS-889: the open land's gathering spots remade - a mining rock is three weathered boulders (RS-886's stone, textured, smooth-shaded) with its
// ore set into their tops (crystals for gems, essence, sunstone and a fallen star; lumps for gold, guild ore and bog iron); clay and sand are
// lumpy textured heaps; a rune altar is a ring of leaning standing stones; a dig site has a heap with a trowel, a trench, pegs and a cord;
// herbs grow as plants (rosettes of leaves, curving stems, petalled flowers, mushrooms, moss). No flat-shaded stone or earth left.
// Shot: shots/rs889-nodes.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(()=>{ const T = THREE, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const L = [{ k:'mining', type:'gem' }, { k:'mining', type:'goldvein' }, { k:'mining', type:'bogiron' }, { k:'mining', type:'clay' }, { k:'mining', type:'sand' }, { k:'mining', type:'gem', gone:true },
      { k:'runecrafting', type:'air' }, { k:'archaeology', type:'barrow' }, { k:'foraging', type:'sunpetal' }, { k:'foraging', type:'ghostcap' }, { k:'foraging', type:'bloodmoss' }, { k:'foraging', type:'starlily', shut:true }];
    L.forEach((n, i)=>{ n.x = i + 3; n.y = 5; n.size = 1; });
    const keepC = window.o3C, keepH = O3.heightAt, H0 = O3.nodeHits, A0 = O3.nodeAnim, g = new T.Group(), G3 = o3NodeGeo();
    /* the ore on a gem rock: before the chunk is merged, every crystal stands on (or just in) one of its boulders */
    { const one = new T.Group(); try{ window.o3C = ()=>[0, 0]; O3.heightAt = ()=>0; O3.nodeHits = []; O3.nodeAnim = []; const keepM = window.o3MergeStatic; window.o3MergeStatic = ()=>{}; try{ o3BuildNodeChunk([{ k:'mining', type:'gem', x:3, y:5, size:1 }], one); } finally { window.o3MergeStatic = keepM; } } finally { window.o3C = keepC; O3.heightAt = keepH; O3.nodeHits = H0; O3.nodeAnim = A0; }
      one.updateMatrixWorld(true); const rocks = [], cr = []; one.traverse(o=>{ if (o.isMesh && G3.nrock.includes(o.geometry)) rocks.push(o); if (o.isMesh && o.geometry===G3.crystal) cr.push(o); });
      out.boulders = rocks.length; out.crystals = cr.length; const ray = new T.Raycaster(), wp = new T.Vector3();
      out.seated = cr.filter(c=>{ c.getWorldPosition(wp); ray.set(wp.clone().add(new T.Vector3(0, 0.6, 0)), new T.Vector3(0, -1, 0)); const h = ray.intersectObjects(rocks)[0]; return h && Math.abs(h.point.y - wp.y) < 0.05; }).length;
      out.flatRock = rocks.some(o=>o.material.flatShading); out.rockTex = rocks.every(o=>o.material.map===o3RockTex()); }
    try{ window.o3C = (x, y)=>[(x - 3)*1.0 - 5.5, 0]; O3.heightAt = ()=>0; O3.nodeHits = []; O3.nodeAnim = []; const t0 = performance.now(); o3BuildNodeChunk(L, g); out.ms = +(performance.now() - t0).toFixed(1); }
    finally { window.o3C = keepC; O3.heightAt = keepH; O3.nodeHits = H0; O3.nodeAnim = A0; }
    const mats = new Set(); g.traverse(o=>{ if (o.isMesh && o.material.visible !== false) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m=>mats.add(m)); });
    const nm = O3.nm || {}; out.keys = Object.keys(nm).filter(k=>/^(rock2_|soil2_|ruinstone2|digsoil2|herbleaf2|herbstem|mushstem|herbmoss|ore2_)/.test(k)).sort();
    out.flatStone = Object.entries(nm).filter(([k, m])=>m.flatShading && !/^ore2_/.test(k)).map(([k])=>k);
    out.soilTex = !!(nm.soil2_clay && nm.soil2_clay.map===o3SoilTex() && nm.digsoil2 && nm.digsoil2.map===o3SoilTex()); out.ruinTex = !!(nm.ruinstone2 && nm.ruinstone2.map===o3RockTex());
    out.oldUsed = ['rock_g', 'rubble', 'soil_clay', 'ruinstone', 'digsoil', 'herbleaf'].filter(k=>nm[k] && mats.has(nm[k]));
    let tris = 0; g.traverse(o=>{ if (o.isMesh && o.material.visible !== false){ const gg = o.geometry; tris += (gg.index ? gg.index.count : gg.attributes.position.count)/3; } }); out.tris = Math.round(tris);
    const cv = document.createElement('canvas'); cv.width = 1600; cv.height = 700; const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(3, 5, 3); d.castShadow = true; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.02; d.shadow.camera.left = d.shadow.camera.bottom = -7; d.shadow.camera.right = d.shadow.camera.top = 7; d.shadow.mapSize.set(2048, 2048); sc.add(d);
    const fl = new T.Mesh(new T.PlaneGeometry(30, 30), new T.MeshStandardMaterial({ color:0x5a8a3a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); g.traverse(o=>{ if (o.isMesh) o.castShadow = o.receiveShadow = true; }); sc.add(g);
    const cam = new T.PerspectiveCamera(30, 1600/700, 0.05, 80); cam.position.set(0, 2.6, 7.5); cam.lookAt(0, 0.15, 0); R.render(sc, cam); out.shot = cv.toDataURL('image/jpeg', 0.88); R.dispose();
    return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs889-nodes.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  A(r.boulders===3 && !r.flatRock && r.rockTex, 'a mining rock is three weathered, textured, smooth boulders', r);
  A(r.crystals >= 12 && r.seated >= r.crystals*0.75, 'its crystals set into the tops of its boulders', r);
  A(!r.flatStone.length, 'no flat-shaded stone or earth', r); A(r.soilTex && r.ruinTex, 'clay and the dig heap in the soil texture, the altar stones in the rock texture', r);
  A(!r.oldUsed.length, 'none of the old materials used', r);
  for (const k of ['rock2_g', 'rock2_b', 'soil2_clay', 'soil2_sand', 'ruinstone2', 'digsoil2', 'herbleaf2', 'herbstem', 'mushstem', 'herbmoss']) A(r.keys.includes(k), 'built: ' + k, r);
  A(r.ms < 60, 'a chunk of twelve spots builds quickly', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
