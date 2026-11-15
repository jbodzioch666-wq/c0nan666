// RS-897: the Dwarf Gate's leaves are cast bronze in relief (o3Site OW_MINE: a vertex-coloured grid per leaf - studded frame, rail, a lattice
// of diamonds with studs, a stepped lozenge, arrowhead strap hinges with rivets, a rune plate whose runes wake with the lintel's, a ring on a
// boss), not stone slabs with strips laid on. They still swing open. Shots: shots/rs897-gate.jpg, rs897-open.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; });
  const r = await page.evaluate(()=>{ const T = THREE, out = {}, M = o3Mats();
    O3.flames = O3.flames || []; O3.glows = O3.glows || []; O3.smoke = O3.smoke || []; O3.heightAt = O3.heightAt || (()=>0); const g = o3Site(OW_MINE, 0.5, 0.5); g.updateMatrixWorld(true);
    const faces = []; let strips = 0, runes = 0; g.traverse(o=>{ if (o.isMesh && o.userData.gateLeaf) faces.push(o); if (o.isMesh && o.parent && o.parent.userData.mv && o.material===M.carved) strips++; if (o.isMesh && o.parent && o.parent.userData.mv && o.material.emissiveMap && o.geometry.type==='PlaneGeometry') runes++; });
    out.faces = faces.length; out.strips = strips; out.runes = runes;
    out.leaf = faces.map(f=>{ const gg = f.geometry, p = gg.attributes.position, c = gg.attributes.color; let z0 = 1, z1 = -1, lo = 1, hi = 0; for (let i=0;i<p.count;i++){ z0 = Math.min(z0, p.getZ(i)); z1 = Math.max(z1, p.getZ(i)); lo = Math.min(lo, c.getX(i)); hi = Math.max(hi, c.getX(i)); }
      let bad = 0; for (const v of gg.attributes.normal.array) if (!isFinite(v)) bad++; let front = 0; const n = gg.attributes.normal; for (let i=0;i<n.count;i+=97) if (n.getZ(i) > 0.3) front++;
      return { verts:p.count, relief:+(z1 - z0).toFixed(4), shade:[+lo.toFixed(2), +hi.toFixed(2)], bad, frontShare:+(front/Math.ceil(n.count/97)).toFixed(2), metal:f.material.metalness }; });
    { for (const k in O3_GATELEAF) delete O3_GATELEAF[k]; const t0 = performance.now(); o3Site(OW_MINE, 3.5, 0.5); out.first = +(performance.now() - t0).toFixed(1); } { const t0 = performance.now(); for (let i=0;i<3;i++) o3Site(OW_MINE, 0.5 + i, 0.5); out.ms = +((performance.now() - t0)/3).toFixed(1); }
    /* render it closed, then open */
    g.traverse(o=>{ if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    const cv = document.createElement('canvas'); cv.width = 1000; cv.height = 1100; const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(2, 4, 5); d.castShadow = true; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.02; d.shadow.camera.left = d.shadow.camera.bottom = -3; d.shadow.camera.right = d.shadow.camera.top = 3; d.shadow.mapSize.set(2048, 2048); sc.add(d);
    const fl = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshStandardMaterial({ color:0x4a6a2a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); sc.add(g);
    const cam = new T.PerspectiveCamera(35, 1000/1100, 0.02, 60); cam.position.set(0.35, 0.95, 2.0); cam.lookAt(0, 0.55, 0.3); R.render(sc, cam); out.s1 = cv.toDataURL('image/jpeg', 0.9);
    g.doorWay.anim(1.2, 0.2); out.openAng = +g.children.filter(o=>o.userData.mv && o.isGroup).map(o=>Math.abs(o.rotation.y))[0].toFixed(2); cam.position.set(0.5, 0.9, 1.6); cam.lookAt(0, 0.5, 0.2); R.render(sc, cam); out.s2 = cv.toDataURL('image/jpeg', 0.9); R.dispose();
    return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs897-gate.jpg'), Buffer.from(r.s1.split(',')[1], 'base64')); fs.writeFileSync(path.join(__dirname, 'shots', 'rs897-open.jpg'), Buffer.from(r.s2.split(',')[1], 'base64')); delete r.s1; delete r.s2;
  console.log(JSON.stringify(r));
  A(r.faces===2 && !r.strips, 'two bronze relief faces, no stone strips laid on', r);
  A(r.leaf.every(l=>l.verts > 10000 && l.relief > 0.012 && l.relief < 0.03 && !l.bad && l.frontShare > 0.9 && l.metal > 0.3), 'a fine relief, facing out, metal', r);
  A(r.leaf.every(l=>l.shade[0] < 0.4 && l.shade[1] > 0.9), 'bright where it stands proud, dark in the hollows', r);
  A(r.runes===2, 'a rune band on each leaf', r);
  A(r.openAng > 1, 'the leaves still swing open', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
