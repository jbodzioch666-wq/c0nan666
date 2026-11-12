// RS-908: garden furnishings - a clipped hedge, a lily pond, a wrought-iron bench, a birdbath, a sundial, a scarecrow, a barrow of
// flowers, and from plans a stone well and a rose arch. Wenna stocks two of them each day besides her other pieces; they're set out in
// your plot's yard (to the land's scale) or in the house's own rooms. Shots: shots/rs908-pieces.jpg, shots/rs908-yard.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const KEYS = ['hedge', 'pond', 'gbench', 'birdbath', 'sundial', 'scarecrow', 'wbarrow', 'well', 'arch'];
  const r = await page.evaluate(async KEYS=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    out.cat = FURN_CATS.some(c=>c[0]==='garden') && KEYS.every(k=>FURN[k] && FURN[k].cat==='garden'); out.plans = FURN.well.plan && FURN.arch.plan && furnPlanPool().includes('well');
    out.stock = []; for (let d=0; d<6; d++){ p.turnCount = 60 + d*DAY_LENGTH; out.stock.push(furnStock().filter(k=>FURN[k].cat==='garden').length); } out.noPlan = furnStock().every(k=>!FURN[k].plan);
    out.pieces = {}; for (const k of KEYS){ const t0 = performance.now(), m = furnModel(k), ms = performance.now() - t0; let tris = 0, meshes = 0, flat = 0; m.traverse(o=>{ if (!o.isMesh) return; meshes++; tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count)/3; if (o.material.flatShading) flat++; }); const b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3()); out.pieces[k] = { tris:Math.round(tris), meshes, flat, ms:+ms.toFixed(1), size:s.toArray().map(v=>+v.toFixed(2)) }; }
    const T = THREE, W = 300, H = 300, cols = 5, sheet = document.createElement('canvas'); sheet.width = W*cols; sheet.height = H*2; const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    KEYS.forEach((k, i)=>{ const sc = new T.Scene(); sc.background = new T.Color(0x8ab0d0); sc.add(new T.HemisphereLight(0xfff4e0, 0x506040, 1.2)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(2, 4, 3); d.castShadow = true; d.shadow.camera.left = d.shadow.camera.bottom = -2; d.shadow.camera.right = d.shadow.camera.top = 2; sc.add(d);
      const fl = new T.Mesh(new T.PlaneGeometry(8, 8), new T.MeshStandardMaterial({ color:0x5a8a3a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); const g = furnInst(k); g.traverse(o=>{ if (o.isMesh) o.castShadow = true; }); sc.add(g);
      const bb = new T.Box3().setFromObject(g), cc = bb.getCenter(new T.Vector3()), s = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z), cam = new T.PerspectiveCamera(32, W/H, 0.01, 30);
      cam.position.set(cc.x + s*1.1, cc.y + s*0.6, cc.z + s*1.9); cam.lookAt(cc); R.render(sc, cam); sx.drawImage(cv, (i % cols)*W, Math.floor(i/cols)*H); sx.fillStyle = '#fff'; sx.font = '16px sans-serif'; sx.fillText(k, (i % cols)*W + 8, Math.floor(i/cols)*H + 20); });
    R.dispose(); out.shot = sheet.toDataURL('image/jpeg', 0.88);
    /* set out in the yard */
    p.gold = 400000; houseBuy(); plotBuy(); const h = houseP(), P = plotGet(); for (const k of KEYS) h.furn[k] = 1; G.gameMode = 0; G.owPos = { x:P.x, y:P.y };
    for (let i=0;i<30;i++){ renderGame(); await new Promise(q=>setTimeout(q, 40)); }
    heditStart(); const spots = { hedge:[-2.2, 0.2, 1.5708], pond:[1.6, 1.3, 0], gbench:[-1.6, 1.8, 0.7], birdbath:[1.0, 0.0, 0], sundial:[-1.0, 0.6, 0], scarecrow:[2.4, -1.8, -0.5], wbarrow:[0.8, 2.2, 2.5], well:[-2.2, -2.0, 0], arch:[0, 2.55, 0] }; out.placed = 0;
    for (const k of KEYS){ heditTake(k); const S = G.hedit.sel, [x, z, r] = spots[k]; S.x = x; S.z = z; S.y = 0; S.r = r; if (heditPlace(false)) out.placed++; else { out.refused = (out.refused||[]).concat(k); heditCancel(); } }
    heditEnd(); out.yard = h.yard.length;
    for (let i=0;i<10;i++){ renderGame(); await new Promise(q=>setTimeout(q, 40)); }
    const R2 = O3.renderer, c = o3C(P.x, P.y), y = O3.heightAt(c[0], c[1]), sz = R2.getSize(new T.Vector2()), cam = new T.PerspectiveCamera(36, sz.x/sz.y, 0.05, 200); cam.position.set(c[0] + 3.5, y + 4.5, c[1] + 6.5); cam.lookAt(c[0], y + 0.3, c[1]); R2.render(O3.scene, cam); out.shot2 = R2.domElement.toDataURL('image/jpeg', 0.88);
    return out; }, KEYS);
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs908-pieces.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs908-yard.jpg'), Buffer.from(r.shot2.split(',')[1], 'base64')); delete r.shot2;
  console.log(JSON.stringify(r));
  A(r.cat && r.plans && r.noPlan && r.stock.every(n=>n===2), 'a Garden kind; Wenna has two garden pieces a day; the well and arch from plans', r);
  for (const [k, v] of Object.entries(r.pieces)) A(!v.flat && v.meshes <= 9 && v.tris > 500, k + ': smooth parts merged by material', v);
  A(r.placed===9 && r.yard===9, 'all of them set out in the yard', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
