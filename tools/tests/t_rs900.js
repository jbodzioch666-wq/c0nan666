// RS-900: the quest scenes on the open land (o3QuestScene) are built from smooth parts, merged by finish into kept meshes (o3QsScene):
// no flat shading but the crystal's facets, every scene well over the old part counts, built once and set down again cheaply; your grave
// is the round-headed stone (o3QsHeadstone) and a quest's raider camp the camps' fire pit and banner. Shot: shots/rs900-scenes.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; });
  const r = await page.evaluate(()=>{ const T = THREE, out = { keys:{} }, KEYS = ['hall', 'warcamp', 'hut', 'grave', 'ruin', 'dig', 'circle', 'hideout', 'obelisk', 'cairn'];
    for (const k of ['flames', 'glows', 'smoke']) O3[k] = O3[k] || []; O3.tex = O3.tex || {};
    const tm = performance.now(); o3QsMats(); out.matsMs = +(performance.now() - tm).toFixed(1); const groups = [];
    for (const key of KEYS){ const g = new T.Group(), t0 = performance.now(), hh = o3QuestScene(key, g, 0, 0, 0), ms = performance.now() - t0, t1 = performance.now(); o3QuestScene(key, new T.Group(), 0, 0, 0); const ms2 = performance.now() - t1;
      let tris = 0, flat = 0, unkept = 0, parts = 0; const box = new T.Box3();
      g.traverse(o=>{ if (!o.isMesh) return; const gg = o.geometry; tris += (gg.index ? gg.index.count : gg.attributes.position.count)/3; if (o.userData.qsPart){ parts++; if (!gg.userData.keep) unkept++; box.expandByObject(o); }
        if (o.material.flatShading && o.material!==o3QsMats().crystal) flat++; });
      out.keys[key] = { h:hh, tris:Math.round(tris), flat, unkept, parts, ms:+ms.toFixed(1), ms2:+ms2.toFixed(2), top:+box.max.y.toFixed(2), w:+Math.max(box.max.x - box.min.x, box.max.z - box.min.z).toFixed(2) }; groups.push(g); }
    /* the headstone and the camp, as o3SyncQuests sets them */
    { const g = new T.Group(); o3CampModel(g, 0, 0, 0, 3, []); const K = o3PitKit(); let pit = 0, cloth = 0; g.traverse(o=>{ if (o.geometry===K.stones) pit++; if (o.geometry===K.cloth) cloth++; }); out.camp = { pit, cloth }; }
    out.stoneKeep = !!o3QsHeadstone().userData.keep;
    out.src = { camp:/o3CampModel\(g, gx, y0, gz, 3, O3\.flames\)/.test(o3SyncQuests.toString()), grave:/o3QsHeadstone\(\)/.test(o3SyncQuests.toString()), keep:/userData\.keep\)\) o\.geometry\.dispose/.test(o3SyncQuests.toString()) };
    /* a contact sheet: each scene from the front and a little above, in sun */
    const W = 480, H = 360, sheet = document.createElement('canvas'); sheet.width = W*5; sheet.height = H*2; const sx = sheet.getContext('2d');
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    groups.forEach((g, i)=>{ const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(2, 5, 4); d.castShadow = true; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.02; d.shadow.camera.left = d.shadow.camera.bottom = -1.5; d.shadow.camera.right = d.shadow.camera.top = 1.5; d.shadow.mapSize.set(2048, 2048); sc.add(d);
      const fl = new T.Mesh(new T.PlaneGeometry(10, 10), new T.MeshStandardMaterial({ color:0x5a8a3a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); sc.add(g);
      const cam = new T.PerspectiveCamera(35, W/H, 0.02, 40); cam.position.set(1.15, 1.25, 2.15); cam.lookAt(0, 0.28, 0); R.render(sc, cam); sx.drawImage(cv, (i % 5)*W, Math.floor(i/5)*H); sx.fillStyle = '#fff'; sx.font = '20px sans-serif'; sx.fillText(KEYS[i], (i % 5)*W + 10, Math.floor(i/5)*H + 26); });
    R.dispose(); out.shot = sheet.toDataURL('image/jpeg', 0.88);
    return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs900-scenes.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  for (const [k, v] of Object.entries(r.keys)){
    A(v.parts >= 2 && !v.unkept, k + ': merged into kept parts', v);
    A(!v.flat, k + ': nothing flat-shaded but the crystal', v);
    A(v.tris > 3000, k + ': built from fine parts', v);
    A(v.top < v.h && v.w < 1.4, k + ': stands under its marker and within its tile', v);
    A(v.ms2 < 3, k + ': set down again cheaply once built', v); }
  A(r.camp.pit===1 && r.camp.cloth===1, 'a quest camp has the fire pit and the banner', r.camp);
  A(r.stoneKeep && r.src.camp && r.src.grave && r.src.keep, 'your grave the headstone; the camp the camps\' model; kept parts not thrown away', r.src);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
