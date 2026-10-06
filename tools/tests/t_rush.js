// RS-169: a monster that fights hand to hand rushes you from well off, round walls; an archer doesn't come charging in
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; v3Pref = false; fp3dPref = false;
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 9999;
    // a melee monster 8-12 walking steps away
    const d = monChaseMap(); let spot = null; for (let x=0;x<COLS && !spot;x++) for (let y=0;y<ROWS;y++){ const v = d[x + y*COLS]; if (v>=8 && v<=12 && !occupiedBy(x,y,-1)){ spot = [x,y,v]; break; } }
    if (!spot) return { none:true };
    const m = G.mon.find(o=>o.alive && rsMonStyle(o)==='melee'); if (!m) return { nomelee:true };
    G.mon = [m]; m.x = spot[0]; m.y = spot[1]; m.dormant = false; m.engaged = false; delete m._ai; m.frightenedTurns = 0; m.rootTurns = 0;
    const path0 = spot[2]; for (let t=0;t<14;t++){ p.turnCount = (p.turnCount||0) + 1; tickMonsters(); }
    const after = monChaseMap()[m.x + m.y*COLS];
    return { path0, after, adj:Math.abs(m.x-p.x)+Math.abs(m.y-p.y) };
  });
  console.log(JSON.stringify(r));
  if (r.none || r.nomelee) throw new Error('assert: setup '+JSON.stringify(r));
  if (!(r.after <= 1)) throw new Error('assert: the monster rushed you round the walls: '+JSON.stringify(r));
};
