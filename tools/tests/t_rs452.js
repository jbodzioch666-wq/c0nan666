// RS-452: the dungeon's stairs (and a way out) are solid to monsters - none walks into one or stands in one - and nothing lies in one: no ore
// vein, cave pool, herb or chest, on a new floor or a kept one
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = { floors:0, decoIn:[], monIn:0 };
    for (const kind of ['dungeon','castle','necro','mine','pyramid']){ const sites = questNearbySites(G.owPos.x, G.owPos.y, 0, 400, [kind]); if (!sites.length) continue;
      for (let rep=0; rep<3; rep++){ const s = sites[rep % sites.length]; G.gameMode = 0; G.owPos = { x:s.x, y:s.y }; G.pendingDungeon = { x:s.x, y:s.y }; G.dgCache = {}; enterDungeonConfirm(); setUi('playing');
        for (let d=1; d<=Math.min(3, G.dungeonMaxDepth||1); d++){ if (d > 1){ G.dgCache = {}; loadLevel(d, false); } out.floors++;
          for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (stairTile(x, y)){ const dd = G.dungeonDeco[x][y]; if (dd && dd!=='dark') out.decoIn.push(kind + ' ' + dd); if (G.mon.some(m=>m.alive && m.x===x && m.y===y)) out.monIn++; } } } }
    // monsters chasing you round a stairway never step into it
    const p = G.player; p.hp = p.maxHp = 99999; G.map = makeGrid(T_WALL); for (let x=2;x<=10;x++) for (let y=2;y<=6;y++) G.map[x][y] = T_FLOOR; for (const c of G.dungeonDeco) c.fill('');
    G.map[6][4] = T_STAIRSD; p.x = 7; p.y = 4; const m0 = newMonster(); Object.assign(m0, { alive:1, x:3, y:4, hp:500, maxHp:500, ac:1, atkBonus:0, dmg1:1, dmg2:1, xp:1, sym:'o', nm:'orc', col:'#8f8', art:null, abilities:[] }); G.mon = [m0];
    let stood = 0; for (let t=0;t<12;t++){ tickMonsters(); if (m0.x===6 && m0.y===4) stood++; } out.chase = { stood, near:Math.max(Math.abs(m0.x - p.x), Math.abs(m0.y - p.y)) };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.floors >= 15 && !r.decoIn.length, 'nothing lies in any stairway or way out: ' + r.decoIn.join(', '));
  A(r.monIn===0, 'no monster stands in one');
  A(r.chase.stood===0 && r.chase.near <= 1, 'a monster comes round the stairs to you, never into them');
};
