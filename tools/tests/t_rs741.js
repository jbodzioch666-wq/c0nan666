// RS-741: a crowd of melee monsters closes in on every side. Five come at you in a line across an open room: each heads for a free
// square round you of its own (the corners too), walking round the ones already there, instead of queueing behind the first.
// In a corridor they still come one at a time.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; v3Pref = false; fp3dPref = false;
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 99999;
    const melee = G.mon.filter(o=>o.alive && rsMonStyle(o)==='melee' && !['archer','caster','thief'].includes(monAi(o).role)), m0 = melee[0]; if (!m0) return { nomelee:true };
    /* an open room, 17 by 11, walled round, the player in its middle */
    const cx = Math.floor(COLS/2), cy = Math.floor(ROWS/2), room = (w, h)=>{ for (let x=cx-10;x<=cx+10;x++) for (let y=cy-7;y<=cy+7;y++){ if (!G.map[x]) continue; G.map[x][y] = (Math.abs(x-cx) <= w && Math.abs(y-cy) <= h) ? T_FLOOR : T_WALL; } };
    const crowd = n=>{ G.mon = []; for (let k=0;k<n;k++){ const m = Object.assign({}, m0, { x:cx - 2 - k, y:cy, alive:true, dormant:false, engaged:true, frightenedTurns:0, rootTurns:0, hp:99999, maxHp:99999 }); delete m._ai; G.mon.push(m); } };
    const adj = ()=>G.mon.filter(m=>Math.max(Math.abs(m.x-p.x), Math.abs(m.y-p.y))===1 && (Math.abs(m.x-p.x) + Math.abs(m.y-p.y)===1 || monDiagAdj(m))).length;
    const run = n=>{ for (let t=0;t<n;t++){ p.turnCount = (p.turnCount||0) + 1; tickMonsters(); } };
    room(8, 5); p.x = cx; p.y = cy; crowd(5); const at0 = adj(); run(8); const open = adj(), spots = G.mon.map(m=>(m.x - p.x)+','+(m.y - p.y)).join(' ');
    const stack = new Set(G.mon.map(m=>m.x+','+m.y)).size===G.mon.length;
    /* a corridor, one wide: one at you, the rest behind */
    room(8, 0); p.x = cx; p.y = cy; crowd(4); run(8); const corridor = adj(), lined = G.mon.every(m=>m.y===cy);
    return { at0, open, spots, stack, corridor, lined };
  });
  console.log(JSON.stringify(r));
  A(!r.nomelee, 'a melee monster to copy');
  A(r.at0===0 && r.open >= 5 && r.stack, 'all five close in round you in the open: ' + JSON.stringify(r));
  A(r.corridor===1 && r.lined, 'in a corridor they come one at a time: ' + JSON.stringify(r));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
