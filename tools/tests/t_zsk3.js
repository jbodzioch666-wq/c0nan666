// (probe, not in ALL) in a dungeon from a fresh start: when the skeleton's background sculpt finishes and a skeleton gets its model
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const T0 = performance.now();
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; for (const m of G.mon) m.alive = 0; G.mon = [];
    const m = newMonster(); Object.assign(m, { alive:1, x:p.x+1, y:p.y, hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'s', nm:'skeleton warrior', col:'#8f8', art:null, abilities:[], undead:true }); G.mon.push(m);
    let okAt = null, instAt = null, rg = 0, n = 0;
    for (let i=0;i<900;i++){ const t1 = performance.now(); renderGame(); rg += performance.now() - t1; n++; await new Promise(r=>setTimeout(r, 30)); const t = +((performance.now()-T0)/1000).toFixed(1); if (SK3.ok && okAt===null) okAt = t; if (M3D.inst.get(m) && instAt===null){ instAt = t; break; } }
    return { okAt, instAt, frameMs:+(rg/n).toFixed(1), frames:n }; });
  console.log('sk3', JSON.stringify(r));
};
