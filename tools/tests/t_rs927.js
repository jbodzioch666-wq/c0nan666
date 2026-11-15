// RS-927: the ships' art pass - sailcloth (panels, tabling, reef bands; no shadow speckle on the sail), the foot cut in a curve, planked castle tops
// with rails, a rudder on every ship (a tiller on the rowboat), wales, mast tops, ratlines and deadeyes, an anchor at the cathead; still baked to a
// few draws at sea. Shots shots/rs927-a..e.jpg (whole, from above, the stern, the bow)
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); }; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = {}, W = 380, H = 320, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.shadowMap.enabled = true;
    for (const [nm, ang, el, zm, lx] of (window.__views || [['a', 0.7, 0.55, 1, 0], ['b', 2.5, 0.45, 1, 0], ['c', 1.2, 0.9, 0.55, 0], ['d', -2.2, 0.3, 0.45, -1], ['e', 1.0, 0.25, 0.45, 1]])){ const sheet = document.createElement('canvas'); sheet.width = W*5; sheet.height = H; const sx = sheet.getContext('2d');
      for (let t=1;t<=5;t++){ const sc = new T.Scene(); sc.background = new T.Color(0x7fa6c4); sc.add(new T.HemisphereLight(0xfff4e0, 0x305070, 1.3)); const dl = new T.DirectionalLight(0xfff0d8, 2.4); dl.position.set(3, 5, 2); dl.castShadow = true; dl.shadow.camera.left = dl.shadow.camera.bottom = -3; dl.shadow.camera.right = dl.shadow.camera.top = 3; sc.add(dl);
        const fl = new T.Mesh(new T.PlaneGeometry(12, 12), new T.MeshStandardMaterial({ color:0x2a5a7a, roughness:0.3 })); fl.rotation.x = -Math.PI/2; fl.position.y = 0.2; fl.receiveShadow = true; sc.add(fl);
        const g = new T.Group(); sc.add(g); try{ v3ShipBuild(g, t, 6, 0, false); }catch(e){ out['err' + t] = String(e).slice(0, 150); } out['n' + t] = g.children.length;
        const bb = new T.Box3().setFromObject(g), c = bb.getCenter(new T.Vector3()).add(new T.Vector3(lx*(g.userData.L||2)*0.42, lx ? -0.2 : 0, 0)), sz = bb.getSize(new T.Vector3()), d = Math.max(sz.x, sz.y)*1.5*zm, cam = new T.PerspectiveCamera(34, W/H, 0.05, 80);
        cam.position.set(c.x + Math.sin(ang)*d*Math.cos(el), c.y + Math.sin(el)*d, c.z + Math.cos(ang)*d*Math.cos(el)); cam.lookAt(c.x, zm < 1 ? 0.5 : c.y, c.z); R.render(sc, cam);
        sx.drawImage(cv, (t - 1)*W, 0); sx.fillStyle = '#fff'; sx.font = '15px sans-serif'; sx.fillText('t' + t, (t - 1)*W + 6, 18); }
      out['sheet' + nm] = sheet.toDataURL('image/jpeg', 0.9); }
    R.dispose();
    /* what each ship carries, at sea (baked) */
    out.ships = []; for (let t=1;t<=5;t++){ const g = new T.Group(); v3ShipBuild(g, t, 6, 0, true); const U = g.userData, L = U.L; let n = 0, rud = 0, anc = 0, thin = 0; g.traverse(o=>{ if (o.isMesh) n++; });
      const raw = new T.Group(); window.__noShipBake = true; v3ShipBuild(raw, t, 6, 0, true); window.__noShipBake = false; raw.traverse(o=>{ if (!o.isMesh) return; if (o.geometry.type==='CylinderGeometry' && o.geometry.parameters.radiusTop < 0.003) thin++; if (o.geometry.type==='ExtrudeGeometry'){ o.geometry.computeBoundingBox(); if (o.position.x + o.geometry.boundingBox.min.x < -L/2 - 0.05) rud++; } if (o.geometry.type==='TorusGeometry' && o.material.metalness > 0.5) anc++; });
      out.ships.push({ t, n, rud, anc, rat:thin, sailShade:U.sails.every(s=>!s.receiveShadow), sailTex:U.sails.every(s=>s.material.map && (t===5 || s.material.map===YB.tex.seam || s.material.map===YB.tex.stripe)) }); }
    return out; });
  for (const k of Object.keys(r)) if (k.startsWith('sheet')){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs927-' + k.slice(5) + '.jpg'), Buffer.from(r[k].split(',')[1], 'base64')); delete r[k]; }
  console.log(JSON.stringify(r), errs.join(' | '));
  const S = r.ships; A(S.every(s=>s.rud===1), 'a rudder on every ship', S); A(S.every(s=>s.anc===(s.t >= 2 ? 1 : 0)), 'an anchor from the sloop up', S);
  A(S.every(s=>s.sailShade && s.sailTex), 'the sails in their cloth, without shadow speckle', S); A(S.every(s=>s.rat===(s.t >= 3 ? s.rat : 0)) && S[2].rat >= 10 && S[4].rat > S[2].rat, 'ratlines from the caravel up', S);
  A(S.every(s=>s.n <= 32), 'still a few draws at sea', S); A(!errs.length && !Object.keys(r).some(k=>k.startsWith('err')), 'no errors: ' + errs.join(' | '), r);
};
