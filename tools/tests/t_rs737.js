// RS-737: the garden. A room built out of doors with four raised beds, a water butt and a compost heap; it comes with three flax and three
// silverleaf seeds. A bed is sown from a seed, watered for a bigger crop, grows on the clock (sprouting, in leaf, in bud, ready) and is
// harvested for Foraging xp and the crop, often with a seed back. Seeds are found now and then while foraging, and kept under Seeds in the bag.
// Shots: shots/rs737_garden.png (the garden from the game's camera), rs737_beds.jpg (close up: the four beds at the four stages)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n);
  const r0 = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    p.gold = 400000; skGainXP('construction', 200000); houseBuy(1); houseBuy(2);   /* (RS-909: a House, its garden and paddock with it) */
    enterHouse(); const L0 = skLvl('construction');
    const h = houseP(), L = ROOM_LAYOUT.house;
    return { con:L0, seeds:[skHave('seed_flax'), skHave('seed_silverleaf')],
      patches:L.benches.filter(b=>b[0]==='patch').length, deco:(L.deco||[]).map(d=>d[0]), garden:JSON.stringify(gardenP()), v3:(V3.garden||[]).length }; });
  /* sow a bed: the dialog lists the seeds; water it; ask after it */
  const r1 = await ev(()=>{ const p = G.player; G.benchXY = housePlan().beds[0].slice(1, 3); useBench('patch'); const dlg = document.getElementById('overlay').textContent; wevChoose(0); setUi('playing');
    const g = gardenP(), b = g[0] && Object.assign({}, g[0]); useBench('patch'); const w = gardenP()[0].w; useBench('patch');
    const msg = G.log.slice(-1)[0]; return { dlg:/sow flax/i.test(dlg) && /silverleaf/i.test(dlg), sown:b && b.id, t0:b && b.t0, seeds:skHave('seed_flax'), w, info:msg && msg.msg, st:gardenStage(g[0]), bed:gardenBedAt(G.benchXY[0], G.benchXY[1]) }; });
  /* grow it on the clock, then pick it */
  const r2 = await ev(()=>{ const p = G.player, b = gardenP()[0], st = []; for (const f of [0.1, 0.3, 0.7, 1.01]){ p.clock = b.t0 + GARDEN_GROW.flax*f; st.push(gardenStage(b)); }
    const fl0 = skHave('flax'), xp0 = (skP().skills.foraging||0); useBench('patch'); return { st, got:skHave('flax') - fl0, xp:(skP().skills.foraging||0) - xp0, empty:gardenP()[0]===null }; });
  /* the herbs need their Foraging level; seeds turn up while foraging and sit under Seeds in the bag */
  const r3 = await ev(()=>{ skAdd('seed_ghostcap', 1); const lv = skLvl('foraging'); G.benchXY = housePlan().beds[1].slice(1, 3);
    useBench('patch'); const dlg = document.getElementById('overlay').textContent; setUi('playing');
    gardenSeedFound('bloodmoss'); resCats.c = null; const cats = resCats(), seeds = (cats.find(c=>c[0]==='Seeds')||[])[1] || [];
    return { lv, needs:/ghostcap needs foraging/i.test(dlg), seeds, hook:/gardenSeedFound/.test(skGatherTick.toString()), mats:resCats().filter(c=>c[0]!=='Seeds').some(c=>c[1].some(id=>/^seed_/.test(id))) }; });
  /* all four beds at the four stages, for the shots */
  await ev(()=>{ const p = G.player, g = gardenP(), now = p.clock = 5000; g[0] = { id:'flax', t0:now - 2 }; g[1] = { id:'silverleaf', t0:now - 15, w:1 }; g[2] = { id:'flax', t0:now - 25, w:1 }; g[3] = { id:'silverleaf', t0:now - 50 };
    const o = housePlan().garden, x0 = o.x0 + 1, y0 = o.y1 - 4; p.x = x0; p.y = y0 + 4; v3GardenSync(true); });
  await frames(25); await page.screenshot({ path:SHOTS + '/rs737_garden.png' });
  const r4 = await ev(()=>{ const T = THREE, o = housePlan().garden, cx = (o.x0 + o.x1 + 1)/2, cz = (o.y0 + o.y1 + 1)/2, R = V3.renderer, sz = R.getSize(new T.Vector2());
    const c = new T.PerspectiveCamera(40, sz.x/sz.y, 0.05, 100); c.position.set(cx + 1.2, 3.4, cz + 4.2); c.lookAt(cx, 0.2, cz); c.updateProjectionMatrix(); R.render(V3.scene, c);
    const kids = V3.garden.map(B=>B.g.children.length), stages = gardenP().map(gardenStage); return { kids, stages, url:R.domElement.toDataURL('image/jpeg', 0.88) }; });
  require('fs').writeFileSync(SHOTS + '/rs737_beds.jpg', Buffer.from(r4.url.split(',')[1], 'base64')); delete r4.url;
  /* (RS-739) the paths are three pieces that don't overlap (they flickered where two crossed) */
  const r5 = await ev(()=>{ const paths = []; V3.world.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.type==='PlaneGeometry' && o.material && o.material.map===V3_INT_TEX.gravel) paths.push(o.geometry.parameters.width+'x'+o.geometry.parameters.height); });
    return { paths:paths.join() }; });
  console.log(JSON.stringify({ r0, r1, r2, r3, r4, r5 }));
  A(r5.paths==='0.9x5.5', 'the path from the back door (RS-909): ' + JSON.stringify(r5));
  A(r0.patches===4 && r0.deco.includes('compost') && r0.deco.includes('wbutt') && r0.v3===4, 'the garden of a House, four beds: ' + JSON.stringify(r0));
  A(r0.seeds.join()==='3,3', 'it comes with three flax and three silverleaf seeds');
  A(r1.dlg && r1.sown==='flax' && r1.seeds===2 && r1.w===1 && r1.st===0 && r1.bed===0 && /sprouting/.test(r1.info), 'a bed sown with flax, watered, then asked after: ' + JSON.stringify(r1));
  A(r2.st.join()==='0,1,2,3' && r2.got >= 5 && r2.got <= 12 && r2.xp > 0 && r2.empty, 'it grows on the clock and is picked: ' + JSON.stringify(r2));
  A(r3.needs && r3.hook && r3.seeds.includes('seed_bloodmoss') && r3.seeds.includes('seed_ghostcap') && !r3.mats, 'herbs need their level; seeds in the bag: ' + JSON.stringify(r3));
  A(r4.stages.join()==='0,1,2,3' && r4.kids.every(n=>n > 0) && r4.kids[3] > r4.kids[1],   /* (RS-892: beds 0 and 2 are flax, 1 and 3 silverleaf - only like with like is compared; flax sprouts as thin stalks) */ 'the beds show their crops: ' + JSON.stringify(r4));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
