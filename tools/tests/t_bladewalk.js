// RS-313: click-to-move crosses a swinging blade when it guards the only way through; where there is another way round, the
// path still takes it. RS-329: it is a trap - cocked and still until you step under it, then it drops and sweeps through
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
    // (RS-329) it's a trap: standing beside it, nothing happens - it hangs cocked and still
    P.x = x0 + 2; P.y = y0; for (let k=0;k<3;k++){ playerWait(); while (foePending()) foeFlush(); }
    out.besideFired = bladeFiredAt(x0+3, y0); const nw = performance.now();
    out.idle = [0, 0.4, 0.9, 2.7].map(t=>+bladeAngle(0, nw, t, 0).toFixed(3));
    // walk it out, as the click would: it walks straight in, the blade drops and catches you, and you carry on
    const rnd = Math.random; Math.random = ()=>0.9; P.x = x0; P.y = y0;
    let hp0 = P.hp; ISO.path = path || []; ISO.target = null; ISO.fighting = null; ISO.mineAt = null;
    out.log = []; for (let k=0;k<12 && ISO.path.length;k++){ ISO.nextStep = 0; isoTickPath(performance.now()); while (foePending()) foeFlush(); out.log.push(P.x-x0); }
    out.end = [P.x - x0, P.y - y0]; out.hurt = P.hp < hp0; const f = bladeFiredAt(x0+3, y0); out.fired = f > 0;
    out.swing = [0, 0.3, 0.6, 1.5, 4].map(s=>+bladeAngle(f, f + s*1000, 0, 0).toFixed(3));
    // a lucky roll: you throw yourself flat and it sweeps over
    Math.random = ()=>0.1; P.x = x0 + 2; hp0 = P.hp; tryMove(1, 0); while (foePending()) foeFlush(); out.ducked = P.x===x0+3 && P.hp===hp0;
    Math.random = rnd;
    // a second row open beside it: the path goes round the blade instead
    for (let x=x0;x<=x0+6;x++) G.map[x][y0+1] = T_FLOOR; P.x = x0; P.y = y0;
    const p2 = isoFindPath(x0+6, y0, false); out.round = !!p2 && !p2.some(([x,y])=>x===x0+3 && y===y0);
    // a locked door with no key still blocks the way
    for (let x=x0;x<=x0+6;x++) G.map[x][y0+1] = T_WALL; D[x0+3][y0] = 'ldoor'; P.x = x0; P.y = y0;
    out.locked = isoFindPath(x0+6, y0, false)===null;
    return out; });
  console.log(JSON.stringify(r));
  if (!r.through) throw new Error('the path crosses the blade in the only corridor '+JSON.stringify(r));
  if (r.besideFired) throw new Error('standing beside the blade does not set it off '+JSON.stringify(r));
  if (Math.max(...r.idle) - Math.min(...r.idle) > 0.05 || r.idle[0] < 1.2) throw new Error('an unsprung blade hangs cocked up and still '+JSON.stringify(r));
  if (r.end[0]!==6 || r.end[1]!==0 || r.log.join()!=='1,2,3,4,5,6') throw new Error('you walk all the way through '+JSON.stringify(r));
  if (!r.fired || !r.hurt) throw new Error('stepping under it springs the blade and it catches you '+JSON.stringify(r));
  if (!(r.swing[0] > 1.2 && Math.min(r.swing[1], r.swing[2]) < 0 && r.swing[4] > 1.2)) throw new Error('it drops, sweeps through and is hauled back up '+JSON.stringify(r.swing));
  if (!r.ducked) throw new Error('a lucky roll ducks under it '+JSON.stringify(r));
  if (!r.round) throw new Error('with a way round, the path avoids the blade');
  if (!r.locked) throw new Error('a locked door without the key still blocks the path');
};
