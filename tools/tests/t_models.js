// RS-168: renamed creatures keep their 3D model - the highwayman, a mythic beast (which also stands at its lair on the map as itself)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null;
    const out = {};
    wevHighwayFight(40); const h = G.mon.find(m=>/highwayman/.test(m.nm)); out.highway = { nm:h && h.nm, model:!!(h && m3dPortrait(h)) };
    const kinds = (G.ow.mythicBeasts||[]).map(b=>mythicKind(b)); out.kinds = kinds; out.kindModels = kinds.every(k=>!!m3dPortrait({ nm:k }));
    const b = (G.ow.mythicBeasts||[]).find(b=>!b.slain);
    if (b){ mythicBeastEncounter(b); const m = G.mon.find(m=>m.mythicBeastIdx===b.i); out.myth = { nm:m && m.nm, model:!!(m && m3dPortrait(m)), same:m && m3dPortrait(m)===m3dPortrait({ nm:mythicKind(b) }), level:m ? monCombatLevel(m) : 0 };
      /* RS-170: kill it - another rises somewhere else a while later */ m.hp = 0; monsterDies(G.mon.indexOf(m)); out.respawnAt = G.ow.mythicNextAt;
      // on the map, near its lair
      G.gameMode = 0; G.mon = []; G.owPos = { x:b.x + 2, y:b.y }; G.player.turnCount = (G.player.turnCount||0) + MYTHIC_RESPAWN + 1; mythicTick();
      const nb = (G.ow.mythicBeasts||[]).find(o=>o.i>=1000 && !o.slain); out.newBeast = nb ? { far:Math.hypot(nb.x-G.owPos.x, nb.y-G.owPos.y) >= 20, saved:(G.ow.mythicNew||[]).some(o=>o.i===nb.i) } : null;
      G.owPos = { x:b.x + 2, y:b.y }; setUi('playing'); for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
      let meshes = 0, sprites = 0; if (O3.encGrp) O3.encGrp.traverse(o=>{ if (o.isMesh && !o.geometry.type.startsWith('Ring')) meshes++; if (o.isSprite) sprites++; });
      out.map = { o3:o3Active(), meshes, sprites }; }
    // RS-169: the bestiary's skeleton is the sculpted dungeon skeleton
    G.gameMode = 0; (G.player.codexSeen = G.player.codexSeen || []).push('skeleton'); G.bestSel = 'skeleton'; setUi('bestiary'); for (let i=0;i<100 && !(BV.e && BV.e.sk); i++) await new Promise(r=>setTimeout(r, 150)); out.skState = { ok:SK3.ok, building:SK3.building, wait:BV.skWait }; out.bestiary = { sk:!!(BV.e && BV.e.sk), key:BV.key }; setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.bestiary.sk, 'the bestiary shows the sculpted skeleton');
  A(r.highway.model, 'the highwayman fights as a 3D figure');
  A(r.kindModels, 'every mythic beast is a creature with a 3D model');
  A(!r.myth || r.myth.level >= 100, 'a mythic beast is at least level 100');
  A(!r.myth || (r.respawnAt > 0 && r.newBeast && r.newBeast.far && r.newBeast.saved), 'a slain mythic beast is followed by a new one elsewhere');
  A(!r.myth || (r.myth.model && r.myth.same), 'the mythic beast you fight is the one on the map');
  A(!r.map || !r.map.o3 || r.map.meshes > 5, 'the mythic beast stands at its lair on the map as a 3D creature');
};
