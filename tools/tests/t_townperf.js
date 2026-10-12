// RS-348: a town draws far less. Its still parts bake into one mesh per material inside each building, tree and fence (so
// each still fades on its own when it's in the way), the townsfolk are sculpted coarse, and folk far from you cast no
// shadow. A town was some 2,500 draws and 4.8 million triangles a frame; now about half the draws and a third of the
// triangles. On a phone the shadow maps are half size, the post buffer isn't multisampled and at most four lamps light
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.player.clock = 10;
    for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const R = V3.renderer; R.info.autoReset = false; R.info.reset(); renderGame(); const calls = R.info.render.calls, tris = R.info.render.triangles; R.info.autoReset = true;
    const tri = o=>{ const g = o.geometry; return (g.index ? g.index.count/3 : g.attributes.position.count/3); };
    let merged = 0, mergedTris = 0; V3.world.traverse(o=>{ if (o.isMesh && o.userData.merged){ merged++; mergedTris += tri(o); } });
    const pt = p=>{ let n = 0; p.e.holder.traverse(o=>{ if (o.isMesh && !o.userData.proxy) n += tri(o); }); return n|0; };   /* (RS-359: the shadow proxy repeats the triangles for the shadow pass only) */
    const out = { calls, tris, merged, mergedTris:mergedTris|0, mergedFrom:V3.mergedFrom, mergedTo:V3.mergedTo, player:pt(V3.player), folk:V3.villagers.length ? Math.max(...V3.villagers.map(pt)) : 0, npc:V3.npcs.length ? Math.max(...V3.npcs.map(pt)) : 0 };
    // the people are their own meshes, never merged
    out.peopleMerged = (()=>{ let m = false; V3.player.g.traverse(o=>{ if (o.userData.merged) m = true; }); return m; })();   /* (RS-352: the townsfolk merge within their joints; you don't) */
    // a building still fades on its own: its merged walls go see-through
    const bg = (V3.occ||[]).map(o=>o.userData.grp).find(g=>g && g.children.some(c=>c.userData.merged));
    if (bg){ bg.userData.fade = 1; bg.userData.faded = false; renderGame(); const mm = bg.children.find(c=>c.userData.merged); out.fadeSeeThrough = !!(mm.userData.matF && mm.material===mm.userData.matF && mm.material.transparent);
      const other = (V3.occ||[]).map(o=>o.userData.grp).find(g=>g && g!==bg && g.children.some(c=>c.userData.merged)); out.otherSolid = other ? !other.children.find(c=>c.userData.merged).material.transparent : true; bg.userData.fade = 0; }
    // folk far from you cast no shadow, near ones do
    const far = V3.villagers.find(p=>Math.hypot(p.g.position.x - G.player.x - 0.5, p.g.position.z - G.player.y - 0.5) > 10), near = V3.villagers.find(p=>Math.hypot(p.g.position.x - G.player.x - 0.5, p.g.position.z - G.player.y - 0.5) < 8);
    const casts = p=>{ const px = p.e.shadowProxy; if (px) return px.castShadow ? 1 : 0; let c = 0, n = 0; p.e.holder.traverse(o=>{ if (o.isMesh){ n++; if (o.castShadow) c++; } }); return c/Math.max(1, n); };   /* (RS-359: a person casts through one proxy) */
    out.farCast = far ? casts(far) : 0; out.nearCast = near ? casts(near) : 1; out.hasFar = !!far; out.hasNear = !!near;
    // the phone tier reads the device: here (a desktop test) the full share applies
    out.phone = gfxPhone(); out.plights = V3.plights.length; out.shadowMap = V3.sun.shadow.mapSize.x; out.pr = gfxPR();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.merged > 100 && r.mergedFrom - r.mergedTo > 800, 'the still parts baked together: '+r.mergedFrom+' meshes to '+r.mergedTo);
  A(r.calls < 1600, 'a town frame is under 1,600 draws, shadows included');
  A(r.tris < 2600000, 'a town frame is under 2.6 million triangles');
  A(r.player > 150000 && r.folk < 120000 && r.npc < 120000, 'the townsfolk are sculpted coarse, you are not');
  A(!r.peopleMerged, 'your own figure keeps its own parts');
  A(r.fadeSeeThrough && r.otherSolid, 'a building in the way goes see-through on its own, merged walls and all');
  A(!r.hasFar || r.farCast===0, 'folk far from you cast no shadow');
  A(!r.hasNear || r.nearCast > 0.5, 'folk near you cast shadows');
  A(r.phone===false && r.plights===8 && r.shadowMap===2048, 'a desktop keeps the full share');
};
