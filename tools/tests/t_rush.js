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
    // (a passive creature, like a rat, wanders until you start the fight - so take a hostile one, or one you've already started on)
    const melee = G.mon.filter(o=>o.alive && rsMonStyle(o)==='melee' && !['archer','caster','thief'].includes(monAi(o).role)), m = melee.find(o=>monAi(o).aggro!=='passive') || melee[0]; if (!m) return { nomelee:true };
    if (monAi(m).aggro==='passive') m.engaged = true;
    G.mon = [m]; m.x = spot[0]; m.y = spot[1]; m.dormant = false; m.engaged = !!m.engaged; m.frightenedTurns = 0; m.rootTurns = 0;
    const path0 = spot[2]; for (let t=0;t<14;t++){ p.turnCount = (p.turnCount||0) + 1; tickMonsters(); }
    const after = monChaseMap()[m.x + m.y*COLS];
    // (RS-171) a dashing monster stops beside you - it used to run on past and back every turn
    let dash = null;
    for (const [ax, ay] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const x = p.x+ax, y = p.y+ay;
      if (tileOpen(x, y) && tileOpen(p.x+ax, p.y) && tileOpen(p.x, p.y+ay) && tileOpen(p.x+2*ax, p.y) && tileOpen(p.x, p.y+2*ay)){
        if (!hasAbility(m, 'aggressive')) m.abilities = (m.abilities||[]).concat('aggressive');
        m.x = x; m.y = y; m.engaged = true; const seen = [];
        for (let t=0;t<4;t++){ p.turnCount = (p.turnCount||0) + 1; tickMonsters(); seen.push(Math.abs(m.x-p.x)+Math.abs(m.y-p.y)); }
        dash = seen; break; } }
    return { path0, after, adj:Math.abs(m.x-p.x)+Math.abs(m.y-p.y), dash };
  });
  console.log(JSON.stringify(r));
  if (r.none || r.nomelee) throw new Error('assert: setup '+JSON.stringify(r));
  if (r.dash && !r.dash.every(v=>v===1)) throw new Error('assert: a dashing monster stops beside you: '+JSON.stringify(r));
  if (!(r.after <= 1)) throw new Error('assert: the monster rushed you round the walls: '+JSON.stringify(r));
};
