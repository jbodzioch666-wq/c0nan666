// RS-926: the garden's pieces remade as the pens were (v3Pen): apple trees with barked boughs and heaped crowns of leaf (the great oak's,
// vgCrownGeo), apples hung in them when ripe; the sapling staked and tied; the water butt of sixteen staves with hoops, a tap and a dipper;
// the compost bin with its heap and a fork; the wooden hive's flared lifts under shingles; the Estate's orchard on the plot in the same
// crowns. Shots: shots/rs926-a.jpg, rs926-b.jpg, rs926-orchard.jpg
const path = require('path'), fs = require('fs');
const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    p.gold = 5e6; skGainXP('construction', 6e7); houseBuy(4); enterHouse(); await fr(20);
    const T = THREE, ks = (window.__ks || ['patch', 'skep', 'hivebox', 'sapling', 'appletree', 'appletreef', 'wbutt', 'compost', 'spinning']), W = 260, H = 300, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.shadowMap.enabled = true;
    for (const [nm, ang] of [['a', 0.6], ['b', 2.8]]){ const sheet = document.createElement('canvas'); sheet.width = W*ks.length; sheet.height = H; const sx = sheet.getContext('2d');
      ks.forEach((k, i)=>{ const sc = new T.Scene(); sc.background = new T.Color(0x6a5a44); sc.add(new T.HemisphereLight(0xfff4e0, 0x5a4a30, 1.4)); const dl = new T.DirectionalLight(0xfff0d8, 2.2); dl.position.set(2, 4, 3); dl.castShadow = true; sc.add(dl);
        const fl = new T.Mesh(new T.PlaneGeometry(4, 4), new T.MeshStandardMaterial({ color:0x5a7a3a, roughness:1 })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl);
        const g = new T.Group(); sc.add(g); try{ v3Bench(k, 0, 0, V3.mats, g, 0); }catch(e){ out['err_' + k] = String(e).slice(0, 120); }
        if (nm==='a'){ let n = 0, red = 0; g.traverse(o=>{ if (o.isMesh){ n++; if (o.material && o.material.color && o.material.color.r > 0.3 && o.material.color.g < 0.05) red += o.geometry.attributes.position.count; } }); out.n = out.n || {}; out.n[k] = n; (out.red = out.red || {})[k] = red; const b = new T.Box3().setFromObject(g); (out.w = out.w || {})[k] = +Math.max(b.max.x - b.min.x, b.max.z - b.min.z).toFixed(2); }
        const bb = new T.Box3().setFromObject(g), hh = Math.max(0.6, bb.max.y), d = 1.2 + hh*1.1, cam = new T.PerspectiveCamera(36, W/H, 0.05, 50); cam.position.set(Math.sin(ang)*d, 0.5 + hh*0.8, Math.cos(ang)*d); cam.lookAt(0, hh*0.42, 0); R.render(sc, cam);
        sx.drawImage(cv, i*W, 0); sx.fillStyle = '#fff'; sx.font = '15px sans-serif'; sx.fillText(k, i*W + 6, 18); });
      out['sheet' + nm] = sheet.toDataURL('image/jpeg', 0.88); }
    { const S = o3QsScene('plot:yard4@6'), M3 = o3QsMats(), sc = new T.Scene(); sc.background = new T.Color(0x9ab8d8); sc.add(new T.HemisphereLight(0xfff4e0, 0x5a6a30, 1.3)); const dl = new T.DirectionalLight(0xfff0d8, 2.4); dl.position.set(3, 6, 4); sc.add(dl);
      out.leafParts = S.parts.filter(p=>/^leaf/.test(p[1])).length; for (const [geo, mk] of S.parts){ const m = new T.Mesh(geo, M3[mk] || M3.stone); sc.add(m); }
      const c2 = document.createElement('canvas'); c2.width = 900; c2.height = 520; const R2 = new T.WebGLRenderer({ canvas:c2, antialias:true, preserveDrawingBuffer:true }); R2.outputColorSpace = T.SRGBColorSpace;
      const cam = new T.PerspectiveCamera(38, 900/520, 0.05, 80); cam.position.set(1.5, 3.2, -1.2); cam.lookAt(0, 0.5, -5.2); R2.render(sc, cam); out.orch = c2.toDataURL('image/jpeg', 0.86); R2.dispose(); }
    R.dispose(); return out; });
  for (const nm of ['a', 'b']) if (r['sheet' + nm]){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs926-' + nm + '.jpg'), Buffer.from(r['sheet' + nm].split(',')[1], 'base64')); delete r['sheet' + nm]; }
  if (r.orch){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs926-orchard.jpg'), Buffer.from(r.orch.split(',')[1], 'base64')); delete r.orch; }
  console.log(JSON.stringify(r), errs.join(' | '));
  A(!Object.keys(r).some(k=>/^err_/.test(k)), 'every piece builds', r);
  A(['hivebox', 'sapling', 'appletree', 'appletreef', 'wbutt', 'compost'].every(k=>r.n[k] >= 3 && r.n[k] <= 20), 'the pieces merged by material', r);
  A(r.red.appletreef > 1000 && !r.red.appletree, 'apples on the ripe tree only', r);
  A(r.w.appletree < 1.4 && r.w.wbutt < 0.8 && r.w.compost < 1.0, 'each within its spot', r);
  A(r.leafParts >= 1, 'the orchard on the plot in heaped crowns', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
