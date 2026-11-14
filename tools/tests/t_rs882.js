// RS-882: the broadleaf crowns made of leaves. Every oak, birch, willow, bush and jungle giant wears a crown of leaf cards (vgLeafyCrown:
// cut-out clusters of painted leaves over a dark core) instead of a smooth blob; their cards are lit as one round crown (normals out from its
// middle, and not turned round on a card's back - o3LeafCards); the gathering trees wear them too, on shorter trunks with boughs up into
// the crown. Shot: shots/rs882-land.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), T = THREE, out = { k:{} };
    const P = {}; o3WildParts(T, P); o3JungleParts(T, P);
    for (const k of ['oak', 'birch', 'willow', 'bush', 'jtree']){ const e = (P[k] || []).find(p=>p[0]==='leaf'); if (!e){ out.k[k] = null; continue; } const g = e[1], pa = g.attributes.position, no = g.attributes.normal, uv = g.attributes.uv;
      g.computeBoundingBox(); const c = g.boundingBox.getCenter(new T.Vector3()); let out_ = 0, n = 0, cut = 0; let nc = 0; for (let i=0;i<pa.count;i+=7){ n++; const isCard = uv && (uv.getX(i) > 0.1 || uv.getY(i) < 0.9); if (isCard) cut++; else continue; nc++; const d = new T.Vector3().fromBufferAttribute(pa, i).sub(c); d.y = Math.max(0, d.y); if (d.dot(new T.Vector3().fromBufferAttribute(no, i)) > 0) out_++; } n = n || 1;
      out.k[k] = { leafy:!!g.userData.leafy, ds:!!g.userData.ds, vc:!!g.userData.vc, outward:+(out_/Math.max(1, nc)).toFixed(2), cards:+(cut/n).toFixed(2) }; }
    out.lift = O3_TREE_LIFT; out.tex = !!o3LeafTex().image && o3LeafTex().image.width;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true; await fr(150);
    out.inst = {}; O3.world.traverse(o=>{ if (!o.isInstancedMesh || !['oak', 'birch', 'willow', 'bush', 'jtree'].includes(o.userData.kind)) return; const m = o.material; if (!m.map) return; const k = o.userData.kind; out.inst[k] = out.inst[k] || { n:0, cards:0 }; out.inst[k].n++; if (m.userData.cards && m.alphaTest > 0.3 && m.side===T.DoubleSide && m.map===o3LeafTex()) out.inst[k].cards++; });
    out.node = { trees:0, cards:0, boughs:0 }; const G3 = o3NodeGeo(); for (const ty of ['tree', 'oak', 'maple', 'willow', 'ancient']){ const g = o3NodeTree(ty); const cr = []; g.traverse(o=>{ if (o.isMesh && o.geometry.userData.leafy) cr.push(o); }); if (!cr.length) continue; out.node.trees++; if (cr.every(o=>o.material.userData.cards && o.material.map===o3LeafTex())) out.node.cards++; if (g.children.some(c=>c.geometry===o3NodeTreeGeo(ty).wood)) out.node.boughs++; }   /* (RS-883: grown - the limbs are its boughs) */
    O3.renderer.render(O3.scene, O3.cam); out.shot = O3.renderer.domElement.toDataURL('image/jpeg', 0.85); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs882-land.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  for (const k of ['oak', 'birch', 'willow', 'bush', 'jtree']){ const o = r.k[k]; A(o && o.leafy && o.ds && o.vc, k + ': a two-sided, vertex-coloured crown of leaf cards', r.k); A(o.outward > 0.75, k + ': its leaves lit as one round crown, normals outward', o); A(o.cards > 0.12, k + ': cut-out cards over its core', o); }
  A(r.tex===256, 'the painted leaf texture', r); A(r.lift < 1, 'the gathering trees\' crowns lowered onto their trunks', r);
  const kinds = Object.keys(r.inst); A(kinds.length >= 1, 'the land has broadleaf trees', r.inst); for (const k of kinds) A(r.inst[k].cards===r.inst[k].n, k + ' draws its crown as leaf cards', r.inst[k]);
  A(r.node.trees > 0 && r.node.cards===r.node.trees && r.node.boughs===r.node.trees, 'gathering trees wear leaf-card crowns over boughs', r.node);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
