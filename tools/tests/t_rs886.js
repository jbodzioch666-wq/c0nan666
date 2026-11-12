// RS-886: weathered stone. The open land's rough stones (o3RockGeo: the barrows' slabs, kerbs and capstones, the lair's boulders, the mines'
// rocks) are fine smooth-shaded spheres cut along their beds, not twelve-sided dice: indexed, no stray point, their seam welded (one normal
// where two points meet), and the rock is textured, not flat-shaded. The Necromancer's Tower is built, not a column: steps, buttresses, lit
// pointed windows, a porch, horns and a claw of bone round the orb, its fixed parts merged. The dragon's hoard is heaped coins.
// Shots: shots/rs886-tower.jpg, shots/rs886-rocks.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), T = THREE, out = { rocks:[] };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true; await fr(60);
    for (const [rr, sd] of [[0.12, 7], [0.07, 201], [0.2, 902], [0.035, 471]]){ const g = o3RockGeo(rr, sd), P = g.attributes.position, N = g.attributes.normal, W = new Map(); let bad = 0, crease = 0;
      for (let i=0;i<P.count;i++){ for (const v of [P.getX(i), P.getY(i), P.getZ(i)]) if (!isFinite(v)) bad++; const k = [P.getX(i), P.getY(i), P.getZ(i)].map(v=>Math.round(v*1e5)).join(','); const w = W.get(k); if (w!=null && (Math.abs(N.getX(w) - N.getX(i)) + Math.abs(N.getY(w) - N.getY(i)) + Math.abs(N.getZ(w) - N.getZ(i))) > 1e-3) crease++; else if (w==null) W.set(k, i); }
      g.computeBoundingBox(); const b = g.boundingBox; out.rocks.push({ verts:P.count, indexed:!!g.index, bad, crease, size:+((b.max.x - b.min.x)/(2*rr)).toFixed(2), again:o3RockGeo(rr, sd).attributes.position.count===P.count }); }
    const mats = o3Mats(); out.rockMat = { map:!!mats.rock.map, flat:!!mats.rock.flatShading };
    /* the tower, built where you stand */
    const x = G.owPos.x, y = G.owPos.y, tw = o3Site(OW_NECROTOWER, x + 0.5, y + 0.5); out.tower = { meshes:0, bone:0, purple:0, orbCore:0, bad:0, h:0 };
    tw.traverse(m=>{ if (m.isSprite && m.children.some(c=>c.isMesh)) out.tower.orbCore++; if (!m.isMesh) return; out.tower.meshes++; if (m.material===mats.bone) out.tower.bone += m.geometry.attributes.position.count; if (m.material===mats.purple && m.parent===tw) out.tower.purple += m.geometry.attributes.position.count; for (const v of m.geometry.attributes.position.array) if (!isFinite(v)) out.tower.bad++; });
    { const b = new T.Box3().setFromObject(tw); out.tower.h = +(b.max.y - b.min.y).toFixed(2); }
    /* the hoard */
    const lair = new T.Group(); o3DragonLair(lair, mats, k=>o3Hash(3, 4, k), 0.5, 0.5); out.heap = { map:!!(mats.hoardHeap && mats.hoardHeap.map), bump:!!(mats.hoardHeap && mats.hoardHeap.bumpMap), used:0 }; lair.traverse(m=>{ if (m.isMesh && m.material===mats.hoardHeap) out.heap.used++; });
    /* shots: the tower in the light, and a row of stones */
    const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(3, 5, 3); sc.add(d);
    tw.position.set(0, 0, 0); tw.traverse(o=>{ o.matrixAutoUpdate = true; }); sc.add(tw); const cam = new T.PerspectiveCamera(36, O3.cam.aspect, 0.05, 50); cam.position.set(1.6, 2.0, 3.6); cam.lookAt(0, 1.15, 0); O3.renderer.render(sc, cam); out.shot = O3.renderer.domElement.toDataURL('image/jpeg', 0.85);
    sc.remove(tw); for (let i=0;i<6;i++){ const m = new T.Mesh(o3RockGeo(0.12, 300 + i*17), mats.rock); m.position.set(-0.75 + i*0.3, 0.06, 0); m.scale.set(1 + (i % 2)*1.6, 1 + (i % 3)*0.5, 1); sc.add(m); }
    cam.position.set(0, 0.7, 1.5); cam.lookAt(0, 0.05, 0); O3.renderer.render(sc, cam); out.shot2 = O3.renderer.domElement.toDataURL('image/jpeg', 0.85); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs886-tower.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); fs.writeFileSync(path.join(__dirname, 'shots', 'rs886-rocks.jpg'), Buffer.from(r.shot2.split(',')[1], 'base64')); delete r.shot; delete r.shot2;
  console.log(JSON.stringify(r));
  for (const k of r.rocks){ A(k.indexed && k.verts > 200 && !k.bad, 'a stone: a fine sphere, no stray point', k); A(k.crease===0, 'a stone: its seam welded', k); A(k.size > 0.6 && k.size < 2.6, 'a stone about its size', k); A(k.again, 'a stone kept and copied', k); }
  A(r.rockMat.map && !r.rockMat.flat, 'the land\'s rock textured, not flat-shaded', r.rockMat);
  const t = r.tower; A(!t.bad, 'the tower: no stray point', t); A(t.meshes < 40, 'the tower: its fixed parts merged', t); A(t.bone > 800, 'the tower: horns and a claw of bone', t); A(t.purple >= 8*10, 'the tower: its pointed windows lit', t); A(t.orbCore===1, 'the orb has a core of light', t); A(t.h > 2.0, 'the tower stands tall', t);
  A(r.heap.map && r.heap.bump && r.heap.used >= 4, 'the hoard heaped coins', r.heap);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
