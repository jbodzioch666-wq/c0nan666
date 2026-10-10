// RS-313: click-to-move crosses a swinging blade when it guards the only way through, and walks on through even when the
// blade catches you; where there is another way round, the path still takes it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = {x:dx, y:dy}; enterDungeonConfirm(); setUi('playing'); loadLevel(2, false); setUi('playing');
    G.mon = []; const P = G.player; effMaxHp = ()=>9999; P.hp = P.maxHp = 9999; const D = G.dungeonDeco, out = {};
    // a sealed corridor, x0..x0+6 on row y0, with a blade in the middle
    const x0 = 3, y0 = 3;
    for (let x=x0-1;x<=x0+7;x++) for (let y=y0-1;y<=y0+3;y++){ G.map[x][y] = T_WALL; D[x][y] = ''; }
    for (let x=x0;x<=x0+6;x++) G.map[x][y0] = T_FLOOR;
    D[x0+3][y0] = 'blade'; P.x = x0; P.y = y0;
    const path = isoFindPath(x0+6, y0, false); out.path = path && path.length;
    out.through = !!path && path.some(([x,y])=>x===x0+3 && y===y0);
    // walk it out, as the click would, one step a tick (a frame drawn inside a step doesn't take another): a blade that catches
    // you does not stop you on it
    let hits = 0; const hp0 = P.hp; ISO.path = path || []; ISO.target = null; ISO.fighting = null; ISO.mineAt = null;
    out.log = []; for (let k=0;k<12 && ISO.path.length;k++){ ISO.nextStep = 0; const h = P.hp; isoTickPath(performance.now()); out.log.push(P.x-x0); }
    out.end = [P.x - x0, P.y - y0]; out.hurt = P.hp < hp0;
    // and again with the blade's swing the other way round (it catches you on alternate steps), so one of the two walks is hit
    P.x = x0; P.y = y0; P.turnCount = (P.turnCount||0) + 1; ISO.path = isoFindPath(x0+6, y0, false) || []; const hp1 = P.hp;
    for (let k=0;k<12 && ISO.path.length;k++){ ISO.nextStep = 0; isoTickPath(performance.now()); }
    out.end2 = [P.x - x0, P.y - y0]; out.hurt2 = P.hp < hp1;
    // a second row open beside it: the path goes round the blade instead
    for (let x=x0;x<=x0+6;x++) G.map[x][y0+1] = T_FLOOR; P.x = x0; P.y = y0;
    const p2 = isoFindPath(x0+6, y0, false); out.round = !!p2 && !p2.some(([x,y])=>x===x0+3 && y===y0);
    // a locked door with no key still blocks the way
    for (let x=x0;x<=x0+6;x++) G.map[x][y0+1] = T_WALL; D[x0+3][y0] = 'ldoor'; P.x = x0; P.y = y0;
    out.locked = isoFindPath(x0+6, y0, false)===null;
    return out; });
  console.log(JSON.stringify(r));
  if (!r.through) throw new Error('the path crosses the blade in the only corridor '+JSON.stringify(r));
  if (r.end[0]!==6 || r.end[1]!==0 || r.log.join()!=='1,2,3,4,5,6') throw new Error('you walk all the way through '+JSON.stringify(r));
  if (r.end2[0]!==6 || r.hurt===r.hurt2) throw new Error('caught by the blade or not, you walk on through '+JSON.stringify(r));
  if (!r.round) throw new Error('with a way round, the path avoids the blade');
  if (!r.locked) throw new Error('a locked door without the key still blocks the path');
};
