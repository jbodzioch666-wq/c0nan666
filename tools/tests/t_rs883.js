// RS-883: trees grown, not balls on sticks. Every broadleaf (oak, birch, willow, bush, jungle giant, and the trees you chop) is a trunk
// forking into limbs and branches with a clump of leaf cards at each end (vgGrowTree): no solid ball inside any more (no card drawn from
// the leaf texture's solid corner but the willow's hanging strands), the limbs reaching up into the leaves and out across the crown, and
// winter's snow thin caps on the clumps. The gathering trees fork lower (O3_FORK), the yew keeps its tiers. Shot: shots/rs883-land.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), T = THREE, out = { k:{}, node:{} };
    const solid = g=>{ const uv = g.attributes.uv; let n = 0; for (let i=0;i<uv.count;i++) if (Math.abs(uv.getX(i) - 0.025) < 1e-3 && Math.abs(uv.getY(i) - 0.975) < 1e-3) n++; return n; };
    const box = g=>{ g.computeBoundingBox(); return g.boundingBox; };
    const P = {}; o3WildParts(T, P); o3JungleParts(T, P);
    for (const k of ['oak', 'birch', 'willow', 'bush', 'jtree']){ const lf = P[k].find(p=>p[0]==='leaf')[1], wd = (P[k].find(p=>p[0]==='trunk') || [])[1], lb = box(lf);
      const o = out.k[k] = { solid:solid(lf), leafVerts:lf.attributes.position.count, leafLow:+lb.min.y.toFixed(3), leafTop:+lb.max.y.toFixed(3) };
      if (wd){ const wb = box(wd); o.woodTop = +wb.max.y.toFixed(3); o.woodSpread = +Math.max(wb.max.x - wb.min.x, wb.max.z - wb.min.z).toFixed(3); o.leafSpread = +Math.max(lb.max.x - lb.min.x, lb.max.z - lb.min.z).toFixed(3); } }
    out.snow = Object.keys(O3_WILD_SNOW).map(k=>{ const b = box(O3_WILD_SNOW[k]); return [k, !!O3_WILD_SNOW[k].attributes.color, +(b.max.y - b.min.y).toFixed(3)]; });
    for (const ty of ['tree', 'oak', 'willow', 'maple', 'magic', 'ancient', 'yew']) for (const j of [false, true]){ const g = o3NodeTree(ty, j), o = out.node[ty + (j ? '_j' : '')] = { leafy:0, wood:0, tier:0 };
      g.traverse(m=>{ if (!m.isMesh) return; if (m.geometry.userData.leafy) o.leafy++;  }); if (o.leafy) o.wood = g.children.some(c=>c.geometry===o3NodeTreeGeo(ty, j && !!O3_JUNGLE_CROWN[ty]).wood) ? 1 : 0; }
    out.trunkH = { tree:o3TrunkH('tree'), yew:o3TrunkH('yew') };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true; await fr(150);
    O3.renderer.render(O3.scene, O3.cam); out.shot = O3.renderer.domElement.toDataURL('image/jpeg', 0.85); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs883-land.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  for (const k of ['oak', 'birch', 'bush', 'jtree']) A(r.k[k].solid===0, k + ': no solid ball inside its leaves', r.k[k]);
  A(r.k.willow.solid > 0 && r.k.willow.leafLow < r.k.willow.leafTop*0.45, 'the willow\'s strands hang low', r.k.willow);
  for (const k of ['oak', 'birch', 'willow', 'jtree']){ const o = r.k[k]; A(o.woodTop > o.leafLow + 0.05, k + ': its limbs reach up into its leaves', o); A(o.woodSpread > o.leafSpread*0.4, k + ': its limbs spread out across the crown', o); }
  for (const [k, col, h] of r.snow){ A(!col, k + ': winter\'s snow plain white', r.snow); if (r.k[k]) A(h < r.k[k].leafTop - r.k[k].leafLow, k + ': its snow caps sit among the leaves', [h, r.k[k]]); }
  for (const [ty, o] of Object.entries(r.node)){ if (ty==='yew') A(o.leafy===1, 'the yew grown (RS-884: needles, not tiers)', o); else A(o.leafy===1 && o.wood===1 && !o.tier, ty + ': a gathering tree grown, leaves on limbs', o); }
  A(r.trunkH.tree < 1.5 && r.trunkH.yew > 1.5, 'gathering trees fork lower, the yew\'s trunk as it was', r.trunkH);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
