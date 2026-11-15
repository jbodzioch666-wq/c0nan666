// RS-901: the land's places of interest (o3PoiModel) are built from smooth parts merged into kept meshes (o3QsScene 'poi:<kind>'):
// no flat shading, fine part counts, set down again cheaply; the parts that move are their own groups (the watchtower's pennant, the
// mill's sails, the ferry's boat, the grotto's fall, the stones' glow, the hermit's smoke); o3SyncPOIs keeps the kept parts when the
// window moves. Shot: shots/rs901-pois.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; });
  const r = await page.evaluate(async ()=>{ for (let i=0;i<20;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } const T = THREE, out = { keys:{} }, KEYS = ['view', 'cache', 'hamlet', 'cave', 'grotto', 'ruin', 'stones', 'oldcamp', 'well', 'hermit', 'digsite', 'ferry'];
    for (const k of ['flames', 'glows', 'smoke']) O3[k] = O3[k] || []; O3.tex = O3.tex || {};
    const groups = [];
    for (const k of KEYS){ const p = { k, x:5, y:5, id:'t' + k }, t0 = performance.now(), m = o3PoiModel(p), ms = performance.now() - t0, t1 = performance.now(); o3PoiModel(p); const ms2 = performance.now() - t1;
      let tris = 0, flat = 0, unkept = 0, low = 0; const box = new T.Box3(); m.g.updateMatrixWorld(true);
      m.g.traverse(o=>{ if (!o.isMesh) return; const gg = o.geometry, pr = gg.parameters || {}; tris += (gg.index ? gg.index.count : gg.attributes.position.count)/3; if (!gg.userData.keep) unkept++; if (o.material.flatShading) flat++; if (gg.type==='CylinderGeometry' && pr.radialSegments < 8) low++; box.expandByObject(o); });
      out.keys[k] = { tris:Math.round(tris), flat, unkept, low, ms:+ms.toFixed(1), ms2:+ms2.toFixed(2), top:+box.max.y.toFixed(2), w:+Math.max(box.max.x - box.min.x, box.max.z - box.min.z).toFixed(2), anim:Object.keys(m.anim).join(',') }; groups.push(m.g); }
    /* in the world: every place in the window rebuilt from its kept parts, twice, with nothing thrown away */
    if (O3.win && G.ow.pois){ O3.wgKey = null; o3SyncPOIs(); const first = new Set(); O3.wgGrp.traverse(o=>{ if (o.isMesh && o.geometry.userData.keep) first.add(o.geometry); }); let disposed = 0; for (const gg of first) gg.addEventListener('dispose', ()=>disposed++); O3.wgKey = null; o3SyncPOIs(); const again = new Set(); O3.wgGrp.traverse(o=>{ if (o.isMesh && first.has(o.geometry)) again.add(o.geometry); }); out.world = { kept:first.size, again:again.size, disposed }; }
    const W = 400, H = 340, sheet = document.createElement('canvas'); sheet.width = W*6; sheet.height = H*2; const sx = sheet.getContext('2d');
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    groups.forEach((g, i)=>{ const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(2, 5, 4); d.castShadow = true; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.02; d.shadow.camera.left = d.shadow.camera.bottom = -2; d.shadow.camera.right = d.shadow.camera.top = 2; d.shadow.mapSize.set(2048, 2048); sc.add(d);
      const fl = new T.Mesh(new T.PlaneGeometry(10, 10), new T.MeshStandardMaterial({ color:0x5a8a3a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; if (KEYS[i]==='ferry'){ fl.position.y = -0.14; fl.material.color.set(0x2a5a7a); } sc.add(fl); sc.add(g);
      const tall = KEYS[i]==='view', cam = new T.PerspectiveCamera(35, W/H, 0.02, 40); cam.position.set(1.2, tall ? 2.2 : 1.3, tall ? 3.2 : 2.2); cam.lookAt(0, tall ? 0.9 : 0.25, KEYS[i]==='ferry' ? 0.5 : 0); R.render(sc, cam);
      sx.drawImage(cv, (i % 6)*W, Math.floor(i/6)*H); sx.fillStyle = '#fff'; sx.font = '20px sans-serif'; sx.fillText(KEYS[i], (i % 6)*W + 10, Math.floor(i/6)*H + 26); });
    R.dispose(); out.shot = sheet.toDataURL('image/jpeg', 0.88);
    return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs901-pois.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  for (const [k, v] of Object.entries(r.keys)){
    A(!v.flat && !v.low, k + ': nothing flat-shaded, no low-sided posts', v);
    A(v.tris > 1500, k + ': built from fine parts', v);
    A(v.ms2 < 3, k + ': set down again cheaply once built', v);
    A(v.w < 1.7, k + ': within its tile and the next', v);
    A(k==='oldcamp' || k==='digsite' || !v.unkept, k + ': its parts kept', v); }
  A(/flag/.test(r.keys.view.anim) && /sails/.test(r.keys.hamlet.anim) && /boat/.test(r.keys.ferry.anim) && /fall/.test(r.keys.grotto.anim) && /glow/.test(r.keys.stones.anim) && /smoke/.test(r.keys.hermit.anim), 'the moving parts named for o3SyncPOIs', r.keys);
  A(r.world && r.world.kept > 0 && r.world.again===r.world.kept && !r.world.disposed, 'the window rebuilt from the same kept parts', r.world);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
