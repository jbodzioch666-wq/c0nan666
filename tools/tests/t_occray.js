// RS-360: the see-through rays (what stands between the camera and you) cast only when that line has moved, and then
// every third frame. Standing still, no ray is cast at all. The rays walk every triangle of the merged town, and were
// most of a town frame's JavaScript. The shadow proxies sit on layer 1, so the rays never walk them either
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; SET.gfx = 'high'; enterVillage(); setUi('playing'); G.player.clock = 100;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } }; await fr(12);
    const out = {}; let rays = 0, hitProxy = false; const f = V3.ray.intersectObjects.bind(V3.ray); V3.ray.intersectObjects = (...a)=>{ rays++; const h = f(...a); if (h.some(x=>x.object.userData.proxy)) hitProxy = true; return h; };
    await fr(10); out.still = rays; rays = 0;
    G.player.x += 1; await fr(12); out.moved = rays; rays = 0; out.fadedSet = V3.occFaded instanceof Set;
    await fr(10); out.stillAgain = rays; out.hitProxy = hitProxy;
    V3.ray.intersectObjects = f;
    out.camLayer1 = V3.cam.layers.test({ mask: 2 }); let px = 0, px1 = 0; V3.scene.traverse(o=>{ if (o.userData.proxy){ px++; if (o.layers.mask===2) px1++; } }); out.px = px; out.px1 = px1;
    // a building marked as in the way still fades: the stored set drives the fade each frame
    const bg = (V3.occ||[]).map(o=>o.userData.grp).find(g=>g && g.children.some(c=>c.userData.merged)); V3.occFaded.add(bg); await fr(6); const mm = bg.children.find(c=>c.userData.merged); out.fades = !!(mm.userData.matF && mm.material===mm.userData.matF); V3.occFaded.delete(bg);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.still===0 && r.stillAgain===0, 'standing still casts no ray');
  A(r.moved > 0 && r.moved <= 40 && r.fadedSet, 'a step casts the rays again, every third frame: '+r.moved);
  A(!r.hitProxy && r.camLayer1 && r.px > 0 && r.px1===r.px, 'the proxies are on layer 1, which the camera sees and the rays skip');
  A(r.fades, 'a building in the stored set still fades');
};
