// RS-884: the conifers grown, as the broadleaves were (RS-883). The pine, the snow-laden fir, the cypress and the yew you chop are whorls
// of branches round a straight trunk, each carrying crossed sprays of needles (vgGrowConifer, o3NeedleTex) - longer and denser low, a
// spire on top - instead of stacked cones; their branches end inside the needles; winter's snow lies along each branch (plain white, its
// faces up); and the land draws them with the needle texture. Shot: shots/rs884-land.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), T = THREE, out = { k:{} };
    const P = {}; o3WildParts(T, P);
    const spread = (g, y0, y1)=>{ const pa = g.attributes.position; let m = 0; for (let i=0;i<pa.count;i++){ const y = pa.getY(i); if (y >= y0 && y < y1) m = Math.max(m, Math.hypot(pa.getX(i), pa.getZ(i))); } return +m.toFixed(3); };
    for (const k of ['pine', 'snowpine', 'cypress']){ const lf = P[k].find(p=>p[0]==='leaf')[1], tk = P[k].find(p=>p[0]==='trunk')[1]; lf.computeBoundingBox(); const b = lf.boundingBox, h = b.max.y - b.min.y;
      out.k[k] = { needle:lf.userData.leafy, cards:lf.index.count/6, low:spread(lf, b.min.y, b.min.y + h*0.3), high:spread(lf, b.min.y + h*0.7, b.max.y), woodOut:spread(tk, 0, 9), leafOut:spread(lf, -9, 9) }; }
    { const sn = P.snowpine.find(p=>p[0]==='snowcap')[1]; sn.computeVertexNormals(); const no = sn.attributes.normal; let up = 0; for (let i=0;i<no.count;i++) if (no.getY(i) > 0.2) up++; out.snow = { col:!!sn.attributes.color, up:+(up/no.count).toFixed(2), n:no.count, plain:!O3_WILD_SNOW.pine.attributes.color }; }
    { const g = o3NodeTree('yew'); out.yew = { needle:0, wood:0 }; g.traverse(m=>{ if (!m.isMesh) return; if (m.geometry.userData.leafy==='needle'){ out.yew.needle++; out.yew.map = m.material.map===o3NeedleTex(); } }); out.yew.tex = o3NeedleTex().image.width; }
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true; await fr(150);
    out.inst = {}; O3.world.traverse(o=>{ if (!o.isInstancedMesh || !['pine', 'snowpine', 'cypress'].includes(o.userData.kind) || !o.material.map) return; const k = o.userData.kind; out.inst[k] = out.inst[k] || { n:0, needle:0 }; out.inst[k].n++; if (o.material.map===o3NeedleTex() && o.material.alphaTest > 0.3) out.inst[k].needle++; });
    O3.renderer.render(O3.scene, O3.cam); out.shot = O3.renderer.domElement.toDataURL('image/jpeg', 0.85); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs884-land.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  for (const k of ['pine', 'snowpine', 'cypress']){ const o = r.k[k]; A(o.needle==='needle' && o.cards > 60, k + ': sprays of needle cards', o); A(o.woodOut < o.leafOut*0.85, k + ': its branches end inside its needles', o); }
  for (const k of ['pine', 'snowpine']) A(r.k[k].low > r.k[k].high*1.8, k + ': broad at the foot, narrow at the head', r.k[k]);
  A(!r.snow.col && r.snow.plain && r.snow.up > 0.9 && r.snow.n > 100, 'winter\'s snow along the branches, plain white and facing up', r.snow);
  A(r.yew.needle===1 && r.yew.map && r.yew.tex===256, 'the yew you chop grown with needles', r.yew);
  for (const [k, o] of Object.entries(r.inst)) A(o.needle===o.n, k + ' drawn with the needle texture', o);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
