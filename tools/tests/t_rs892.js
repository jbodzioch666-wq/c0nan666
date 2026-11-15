// RS-892: the house garden's beds grow the open land's herbs (RS-889's parts, gardenHerbGeo): arched leaf rosettes, curving stems in bud, open
// flowers (daisy, lily, five petals with an eye); flax as tall thin stalks with blue flowers; ghostcaps as mushrooms; bloodmoss on moss cushions.
// The old garden balls (sphere leaves, icosahedron blooms) are gone. Shots: shots/rs892-kinds.jpg (four herbs ready), rs892-stages.jpg
// (silverleaf sprouting, in leaf, in bud, ready)
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const ev = (f, a)=>page.evaluate(f, a), frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n);
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    p.gold = 400000; skGainXP('construction', 200000); houseBuy(1); houseBuy(2);   /* (RS-909: a House, its garden and paddock with it) */
    enterHouse(); });
  const shoot = (beds)=>ev(async beds=>{ const p = G.player, g = gardenP(), now = p.clock = 9000; beds.forEach(([id, f], i)=>{ g[i] = { id, t0:now - f*GARDEN_GROW[id], w:i & 1 }; });
    const o = housePlan().garden, x0 = o.x0 + 2, y0 = o.y1 - 4; p.x = o.x0; p.y = o.y1; v3GardenSync(true);
    for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const T = THREE, cx = x0 + 2.5, cz = y0 + 2.5, R = V3.renderer, sz = R.getSize(new T.Vector2()), c = new T.PerspectiveCamera(36, sz.x/sz.y, 0.05, 100); c.position.set(cx + 0.6, 2.2, cz + 3.0); c.lookAt(cx, 0.2, cz); c.updateProjectionMatrix(); R.render(V3.scene, c); const url1 = R.domElement.toDataURL('image/jpeg', 0.88);
    c.position.set(cx - 0.3, 2.0, cz - 2.6); c.lookAt(cx, 0.2, cz); R.render(V3.scene, c); const url2 = R.domElement.toDataURL('image/jpeg', 0.88); const H = gardenHerbGeo(), geos = V3.garden.map(B=>B.g.children.map(m=>Object.keys(H).find(k=>H[k]===m.geometry) || (m.geometry===gardenMoundGeo() ? 'mound' : m.geometry.type)));
    return { stages:gardenP().map(gardenStage), geos, url:url1, url2 }; }, beds);
  const k = await shoot([['flax', 1.2], ['sunpetal', 1.2], ['ghostcap', 1.2], ['bloodmoss', 1.2]]); fs.writeFileSync(path.join(__dirname, 'shots', 'rs892-kinds.jpg'), Buffer.from(k.url.split(',')[1], 'base64')); fs.writeFileSync(path.join(__dirname, 'shots', 'rs892-kinds2.jpg'), Buffer.from(k.url2.split(',')[1], 'base64')); delete k.url; delete k.url2;
  const s = await shoot([['silverleaf', 0.1], ['silverleaf', 0.4], ['silverleaf', 0.7], ['silverleaf', 1.2]]); fs.writeFileSync(path.join(__dirname, 'shots', 'rs892-stages.jpg'), Buffer.from(s.url.split(',')[1], 'base64')); delete s.url; delete s.url2;
  const sum = r=>r.geos.map(g=>{ const o = {}; for (const x of g) o[x] = (o[x]||0) + 1; return o; });
  console.log(JSON.stringify({ kinds:{ st:k.stages, g:sum(k) }, stages:{ st:s.stages, g:sum(s) } }));
  const K = sum(k), S = sum(s);
  A(k.stages.every(x=>x===3) && JSON.stringify(s.stages)==='[0,1,2,3]', 'the beds at the stages asked', { k:k.stages, s:s.stages });
  A(K[0].hstem >= 27 && K[0].hfive >= 27, 'flax: tall stalks, three to a spot, each with a flower', K[0]);
  A(K[1].hdaisy===9 && K[1].heye===9 && K[1].hleaf >= 45, 'sunpetal: daisies with eyes over leaf rosettes', K[1]);
  A(K[2].mcap >= 18 && K[2].mstem >= 18 && !K[2].hleaf, 'ghostcap: mushrooms', K[2]); A(K[3].mound===9 && K[3].hfive >= 27, 'bloodmoss: moss cushions with little flowers', K[3]);
  A(S[0].hleaf===18 && !S[0].hstem && S[1].hleaf===45 && !S[1].hstem && S[2].hbud===9 && S[2].hstem===9 && S[3].hfive===9, 'silverleaf grows: two leaves, a rosette, a stem in bud, a flower', S);
  const all = k.geos.concat(s.geos).flat(); A(!all.includes('IcosahedronGeometry') && !all.includes('SphereGeometry'), 'no old garden balls', all.filter(x=>/Geometry$/.test(x)));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
