// RS-408: a click on the dungeon's minimap walks you to the spot - if you've seen it - whichever way the minimap is turned;
// a click on a spot you haven't seen does nothing, and a click on the minimap never reaches the floor drawn under it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    G.mon.forEach(m=>{ m.alive = 0; }); tickMonsters = ()=>{};
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    const p = G.player, out = { rots:[] };
    // the target: a seen floor tile well away from you, reachable
    const reach = new Map([[p.x+','+p.y, 0]]), q = [[p.x, p.y]];
    while (q.length){ const [x,y] = q.shift(); for (const [i,j] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X = x+i, Y = y+j, k = X+','+Y; if (reach.has(k) || !isoPassable(X, Y)) continue; reach.set(k, reach.get(x+','+y)+1); q.push([X, Y]); } }
    const far = [...reach.entries()].filter(([k,d])=>d >= 6 && d <= 14 && G.map[+k.split(',')[0]][+k.split(',')[1]]===T_FLOOR && !G.dungeonDeco[+k.split(',')[0]][+k.split(',')[1]]);
    const click = (x, y)=>{ const B = FP.mmBox, a = FP.mmRot||0, lx = (x+0.5)*B.cp - COLS*B.cp/2, ly = (y+0.5)*B.cp - ROWS*B.cp/2;
      const px = B.bx + B.size/2 + lx*Math.cos(a) - ly*Math.sin(a), py = B.by + B.size/2 + lx*Math.sin(a) + ly*Math.cos(a), rc = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new MouseEvent('click', { bubbles:true, clientX:rc.left + px/canvas.width*rc.width, clientY:rc.top + py/canvas.height*rc.height })); };
    let clicked = 0; const isoAct0 = isoAct; isoAct = (...a)=>{ clicked++; return isoAct0(...a); };
    for (const rot of [0, 1]){
      if (rot) viewRotate(1); await fr(3);
      const [k] = far[rot*3 % far.length]; const [tx, ty] = k.split(',').map(Number), sx = p.x, sy = p.y;
      // not seen yet: nothing happens
      G.dungeonSeen[tx][ty] = false; ISO.path = []; click(tx, ty); const unseen = ISO.path.length===0;
      // seen: you walk there
      G.dungeonSeen[tx][ty] = true; click(tx, ty); const planned = ISO.path.length;
      for (let i=0;i<60 && ISO.path.length;i++){ ISO.nextStep = 0; isoTickPath(performance.now()); }
      out.rots.push({ rot, from:[sx, sy], to:[tx, ty], unseen, planned, at:[p.x, p.y], arrived:p.x===tx && p.y===ty, mm:!!FP.mmBox });
    }
    out.floorClicks = clicked;
    // RS-408: the door stands the walls' full height
    { const bb = new THREE.Box3().setFromObject(isoPropModel({ x:0, y:0, kind:'dress', d:'door', rot:0, side:1 })); out.doorTop = +bb.max.y.toFixed(3); }
    return out;
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.rots.length===2 && r.rots.every(o=>o.mm), 'the minimap is up');
  A(r.rots.every(o=>o.unseen), 'a spot you haven\'t seen: no walk');
  A(r.rots.every(o=>o.planned > 0 && o.arrived), 'a seen spot: you walk there, the minimap turned or not');
  A(r.floorClicks===0, 'the click never reaches the floor drawn under the minimap');
  A(r.doorTop >= 0.99, 'the door is as tall as the walls');
};
