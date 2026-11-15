// RS-919: the towns' landmarks remade (townLmModel) - the town mine, the moonwell, the war totem, the caravan, the tinkers' workshop,
// the great brazier, the ember altar, the minstrels' stage and the wardens' fletchery: each builds sound (every part has normals and a
// finite box), stays inside its 2.6-tile lot, is built once and reused (kept geometry), and a town with its landmark builds without error.
// Shots: shots/rs919-landmarks.jpg (two sides each), rs919-town.png
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = { kinds:{} }, T = THREE, ks = ['mine', 'moonwell', 'totem', 'caravan', 'workshop', 'brazier', 'altar', 'stage', 'fletchery'], W = 300, H = 300, sides = [1.1, 2.2], cols = 6;
    const sheet = document.createElement('canvas'); sheet.width = W*cols; sheet.height = H*Math.ceil(ks.length*sides.length/cols); const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; let n = 0;
    for (const k of ks){ const t0 = performance.now(), g = townLmModel(k), t1 = performance.now(), g2 = townLmModel(k), t2 = performance.now(), box = new T.Box3(); let bad = 0, verts = 0; g.updateMatrixWorld(true);
      g.traverse(m=>{ if (!m.isMesh) return; const b = new T.Box3().setFromObject(m); if (!isFinite(b.min.x) || !m.geometry.attributes.normal) bad++; else box.union(b); verts += m.geometry.attributes.position.count; });
      out.kinds[k] = { meshes:g.children.length, bad, verts, ms:+(t1 - t0).toFixed(1), again:+(t2 - t1).toFixed(2), shared:g.children[0].geometry===g2.children[0].geometry,
        lot:Math.max(-box.min.x, box.max.x, -box.min.z, box.max.z) <= 1.45, top:+box.max.y.toFixed(2) };
      for (const a of sides){ const sc = new T.Scene(); sc.background = new T.Color(0x8fb4d8); sc.add(new T.HemisphereLight(0xdde8ff, 0x605040, 1.3)); const dl = new T.DirectionalLight(0xfff2dc, 2.2); dl.position.set(4, 8, 6); sc.add(dl);
        const gr = new T.Mesh(new T.CircleGeometry(2.2, 40), new T.MeshStandardMaterial({ color:0x6a8a4a })); gr.rotation.x = -Math.PI/2; sc.add(gr); sc.add(g);
        const cam = new T.PerspectiveCamera(35, 1, 0.05, 50); cam.position.set(Math.cos(a)*5.2, 3.0, Math.sin(a)*5.2); cam.lookAt(0, 0.9, 0); R.render(sc, cam);
        sx.drawImage(cv, (n%cols)*W, Math.floor(n/cols)*H); sx.fillStyle = '#fff'; sx.font = '15px sans-serif'; sx.fillText(k, (n%cols)*W + 6, Math.floor(n/cols)*H + 18); n++; } }
    R.dispose(); out.sheet = sheet.toDataURL('image/jpeg', 0.88);
    /* a town with its landmark */
    const lab = ()=>(V3.hits||[]).map(o=>o.userData.act && o.userData.act.label).filter(l=>/^The (town mine|moonwell|war totem|caravan|tinkers|great brazier|ember altar|minstrels|wardens)/.test(l||''));
    for (const tp of Object.values(G.ow.townPositions||{}).filter(Boolean)){ G.owPos = { x:tp.x, y:tp.y }; enterVillage(); setUi('playing'); for (let i=0;i<8;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } if (lab().length) break; }
    for (let i=0;i<30;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } { const hb = V3.hits.find(o=>lab().includes(o.userData.act && o.userData.act.label)); if (hb){ G.player.x = Math.floor(hb.position.x); G.player.y = Math.floor(hb.position.z) + 3; for (let i=0;i<30;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } } }
    out.ident = lab(); out.ui = G.ui; out.inTown = !!G.villageRace;
    return out; });
  if (r.sheet){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs919-landmarks.jpg'), Buffer.from(r.sheet.split(',')[1], 'base64')); delete r.sheet; }
  await page.screenshot({ path:path.join(__dirname, 'shots', 'rs919-town.png') });
  console.log(JSON.stringify(r));
  for (const [k, K] of Object.entries(r.kinds)){ A(K.meshes > 0 && K.bad===0, k + ' builds sound', r); A(K.lot, k + ' inside its lot', r); A(K.shared, k + ' built once and reused', r); }
  A(r.ident && r.ident.length===1, 'the town has its landmark', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
