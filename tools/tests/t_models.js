// RS-168: renamed creatures keep their 3D model - the highwayman, a mythic beast (which also stands at its lair on the map as itself)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null;
    const out = {};
    wevHighwayFight(40); const h = G.mon.find(m=>/highwayman/.test(m.nm)); out.highway = { nm:h && h.nm, model:!!(h && m3dPortrait(h)) };
    const kinds = (G.ow.mythicBeasts||[]).map(b=>mythicKind(b)); out.kinds = kinds; out.kindModels = kinds.every(k=>!!m3dPortrait({ nm:k }));
    const b = (G.ow.mythicBeasts||[]).find(b=>!b.slain);
    if (b){ mythicBeastEncounter(b); const m = G.mon.find(m=>m.mythicBeastIdx===b.i); out.myth = { nm:m && m.nm, model:!!(m && m3dPortrait(m)), same:m && m3dPortrait(m)===m3dPortrait({ nm:mythicKind(b) }) };
      // on the map, near its lair
      G.gameMode = 0; G.mon = []; G.owPos = { x:b.x + 2, y:b.y }; setUi('playing'); for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
      let meshes = 0, sprites = 0; if (O3.encGrp) O3.encGrp.traverse(o=>{ if (o.isMesh && !o.geometry.type.startsWith('Ring')) meshes++; if (o.isSprite) sprites++; });
      out.map = { o3:o3Active(), meshes, sprites }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.highway.model, 'the highwayman fights as a 3D figure');
  A(r.kindModels, 'every mythic beast is a creature with a 3D model');
  A(!r.myth || (r.myth.model && r.myth.same), 'the mythic beast you fight is the one on the map');
  A(!r.map || !r.map.o3 || r.map.meshes > 5, 'the mythic beast stands at its lair on the map as a 3D creature');
};
