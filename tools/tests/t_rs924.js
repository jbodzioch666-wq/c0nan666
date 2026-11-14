// RS-924: the farmyard's pens remade (v3Pen) - the hen house in board and batten under shingles, the byre weatherboarded under a coursed
// thatch, a hewn trough on trestles, a sheepfold of woven wattle, rounded bales - each kind at both grades, merged by material; and in bed
// you sleep in your nightclothes (no hat, staff or cape through the blanket - covered by t_rs922). Shots: shots/rs924-a.jpg, rs924-b.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = { parts:{} }; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    try{
      const T = THREE, ks = ['coop', 'byre', 'trough', 'fold', 'hay'], W = 300, H = 300, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.shadowMap.enabled = true;
      for (const [nm, ang] of [['a', 0.6], ['b', 2.6]]){ const sheet = document.createElement('canvas'); sheet.width = W*ks.length; sheet.height = H*2; const sx = sheet.getContext('2d');
        ks.forEach((k, i)=>[1, 2].forEach((hg, j)=>{ const sc = new T.Scene(); sc.background = new T.Color(0x6a5a44); sc.add(new T.HemisphereLight(0xfff4e0, 0x5a4a30, 1.4)); const dl = new T.DirectionalLight(0xfff0d8, 2.2); dl.position.set(2, 4, 3); dl.castShadow = true; sc.add(dl);
          const fl = new T.Mesh(new T.PlaneGeometry(4, 4), new T.MeshStandardMaterial({ color:0x7a5a3a, roughness:1 })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl);
          const g = new T.Group(); sc.add(g); v3Pen(k, g, {}, hg); if (nm==='a') out.parts[k + hg] = g.children.length;
          const cam = new T.PerspectiveCamera(36, W/H, 0.05, 50); cam.position.set(Math.sin(ang)*2.3, 1.5, Math.cos(ang)*2.3); cam.lookAt(0, 0.4, 0); R.render(sc, cam);
          sx.drawImage(cv, i*W, j*H); sx.fillStyle = '#fff'; sx.font = '15px sans-serif'; sx.fillText(k + ' ' + hg, i*W + 6, j*H + 18); }));
        out['sheet' + nm] = sheet.toDataURL('image/jpeg', 0.88); }
      R.dispose();
      /* in the house: a farmyard with all its pens, no errors */
      p.gold = 5e6; skGainXP('construction', 6e7); houseBuy(3); const h = houseP(); out.has = typeof houseHas==='function' && houseHas('farmyard');
      enterHouse(); await fr(20); out.inHouse = G.interior && G.interior.key;
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    return out; });
  for (const nm of ['a', 'b']) if (r['sheet' + nm]){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs924-' + nm + '.jpg'), Buffer.from(r['sheet' + nm].split(',')[1], 'base64')); delete r['sheet' + nm]; }
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(Object.values(r.parts).every(n=>n >= 4 && n <= 30), 'every pen built, merged by material', r);
  A(r.inHouse==='house', 'the house builds with them', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
