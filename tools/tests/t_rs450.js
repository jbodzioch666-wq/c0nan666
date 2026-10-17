// RS-450: a skeleton archer's arrows fly from it to its foe - you saw only the hit
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 99999; G.map = makeGrid(T_WALL); for (let x=2;x<=14;x++) for (let y=2;y<=8;y++) G.map[x][y] = T_FLOOR; for (const c of G.dungeonDeco) c.fill(''); FPD.mapRef = null;
    p.x = 3; p.y = 5; const m0 = newMonster(); Object.assign(m0, { alive:1, x:10, y:5, hp:500, maxHp:500, ac:1, atkBonus:0, dmg1:1, dmg2:1, xp:1, sym:'o', nm:'orc', col:'#8f8', art:null, abilities:[] }); G.mon = [m0];
    p.minions = [{ k:'archer', nm:'your skeleton archer', atkBonus:40, dmg1:1, dmg2:2, turnsLeft:99, reach:4, x:7, y:5 }];
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    ISO.shots = []; necroTick(); const sh = (ISO.shots||[]).find(s=>s.minion);
    return { shot:!!sh, kind:sh && sh.kind, from:sh && [+(sh.x0 - 7.5).toFixed(1), +(sh.y0 - 5.5).toFixed(1)], to:sh && [sh.x1, sh.y1] }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.shot && r.kind==='arrow', 'the archer looses an arrow you can see');
  A(Math.abs(r.from[0]) < 0.6 && Math.abs(r.from[1]) < 0.6 && r.to[0]===10.5 && r.to[1]===5.5, 'from the archer to its foe');
};
