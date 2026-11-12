// RS-881: the wild land's trees, bushes, rocks, cacti and reeds remade (o3WildParts): every kind is a smooth, vertex-coloured shape with
// no stray point, the willow hangs in strands (two-sided), winter's snow is plain white (no vertex colours, so never black), the land's
// instanced trees draw with their vertex colours, and the gathering trees wear the same heaped crowns. Shot: shots/rs881-land.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), T = THREE, out = { k:{} };
    const P = {}; o3WildParts(T, P);
    for (const k of ['oak', 'birch', 'pine', 'snowpine', 'cypress', 'willow', 'dead', 'bush', 'rock', 'cactus', 'reed']){ const o = out.k[k] = { parts:0, vc:0, bad:0, tris:0, ds:0 };
      for (const [pn, geo] of P[k]||[]){ o.parts++; if (pn==='snowcap'){ o.snowVc = !!geo.userData.vc || !!geo.attributes.color; } else if (geo.userData.vc && geo.attributes.color) o.vc++; if (geo.userData.ds) o.ds++;
        const a = geo.attributes.position.array; for (const v of a) if (!isFinite(v) || Math.abs(v) > 3) o.bad++; o.tris += (geo.index ? geo.index.count : a.length/3)/3; } o.tris = Math.round(o.tris); }
    out.snow = Object.keys(O3_WILD_SNOW).filter(k=>O3_WILD_SNOW[k].userData.vc || O3_WILD_SNOW[k].attributes.color);
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true; await fr(150);
    out.inst = {}; O3.world.traverse(o=>{ if (!o.isInstancedMesh || !o.userData.kind) return; const k = o.userData.kind; out.inst[k] = out.inst[k] || { n:0, vc:0, flat:0 }; out.inst[k].n++; if (o.material.vertexColors) out.inst[k].vc++; if (o.material.flatShading) out.inst[k].flat++; });
    out.node = { crowns:0, vc:0 }; for (const ty of ['tree', 'oak', 'maple']) o3NodeTree(ty).traverse(o=>{ if (o.isMesh && o.geometry.userData.leafy){ out.node.crowns++; if (o.material.vertexColors) out.node.vc++; } });   /* (RS-883: grown crowns) */
    O3.renderer.render(O3.scene, O3.cam); out.shot = O3.renderer.domElement.toDataURL('image/jpeg', 0.85); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs881-land.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  for (const [k, o] of Object.entries(r.k)){ A(o.parts > 0 && o.vc===o.parts - (o.snowVc===undefined ? 0 : 1), k + ': every part shaded by its vertex colours', o); A(o.bad===0, k + ': no stray point', o); A(o.tris < 2400, k + ': within its triangle budget', o); A(o.snowVc!==true, k + ': its snow plain white', o); }
  A(r.k.willow.ds > 0 && r.k.reed.ds > 0, 'the willow\'s strands and the reeds are two-sided', r.k); A(!r.snow.length, 'winter\'s snow on every kind plain white', r.snow);
  const kinds = Object.keys(r.inst).filter(k=>['oak', 'birch', 'pine', 'willow', 'bush', 'rock', 'dead', 'cypress', 'snowpine', 'cactus', 'reed'].includes(k)); A(kinds.length >= 3, 'the land has its trees', r.inst);
  for (const k of kinds) A(r.inst[k].vc > 0 && r.inst[k].flat===0, k + ' draws smooth, with its vertex colours', r.inst[k]);
  A(r.node.crowns > 0 && r.node.vc===r.node.crowns, 'gathering trees wear the heaped crowns, vertex-coloured', r.node);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
