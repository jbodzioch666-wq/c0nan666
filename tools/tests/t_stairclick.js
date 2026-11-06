// RS-297: clicking a staircase in a dungeon takes it - a click anywhere on the drawn flight (its treads, its risers, its
// sides) picks the stair tile, from every quarter turn of the camera, rather than the floor in front of it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = {x:dx, y:dy}; enterDungeonConfirm(); setUi('playing');
    loadLevel(2, false); setUi('playing');
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(res=>setTimeout(res, 30)); } };
    const kinds = [T_STAIRSU, T_STAIRSD];
    for (const kind of kinds){
      let st = null; for (let x=1;x<COLS-1 && !st;x++) for (let y=1;y<ROWS-1;y++) if (G.map[x][y]===kind){ st = [x,y]; break; }
      A(st, 'a staircase '+kind);
      // stand a few tiles off, on reachable floor, with nothing about
      let stand = null, bd = 1e9; for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++){ if (G.map[x][y]!==T_FLOOR) continue; const d = Math.hypot(x-st[0], y-st[1]); if (d >= 2.5 && d <= 5 && Math.abs(d - 3.5) < bd){ G.player.x = x; G.player.y = y; if (isoFindPath(st[0], st[1], false)){ bd = Math.abs(d - 3.5); stand = [x,y]; } } }
      A(stand, 'somewhere to stand near the stairs');
      G.player.x = stand[0]; G.player.y = stand[1]; G.mon = [];
      for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) G.dungeonSeen[x][y] = true;
      const res = [];
      for (let rot=0;rot<4;rot++){
        ISO.rot = rot; G.player.viewRot = rot; await frames(30);
        const rc = canvas.getBoundingClientRect(), ray = new THREE.Raycaster();
        let on = 0, got = 0;
        for (let i=0;i<=10;i++) for (let j=0;j<=10;j++) for (const h of [0.05, 0.3, 0.6, 0.85]){
          const c = isoProject(st[0] + 0.1 + i*0.08, st[1] + 0.1 + j*0.08, kind===T_STAIRSU ? h : 0.02);
          const cx = rc.left + c.sx/canvas.width*rc.width, cy = rc.top + c.sy/canvas.height*rc.height;
          // is the stair flight what's actually under the cursor here?
          ray.setFromCamera({ x:(cx-rc.left)/rc.width*2-1, y:-((cy-rc.top)/rc.height*2-1) }, FPD.cam);
          const hit = ray.intersectObject(FPD.world, true).find(h=>h.object.isMesh && h.object.visible!==false && !(h.object.material && h.object.material.transparent && h.object.material.opacity < 0.5));
          if (!hit) continue;
          const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld), P = hit.point;
          if (Math.floor(P.x - n.x*0.01)!==st[0] || Math.floor(P.z - n.z*0.01)!==st[1]) continue;
          if (kind===T_STAIRSD && P.y > 0.05) continue;   /* (the wall above a way down isn't the way down) */
          on++; const pk = isoPick({ clientX:cx, clientY:cy }); if (pk && pk.gx===st[0] && pk.gy===st[1]) got++;
        }
        res.push({ rot, on, got });
      }
      out[kind===T_STAIRSU ? 'up' : 'down'] = res;
      for (const q of res) if (q.on >= 10) A(q.got >= q.on*0.97, 'a click on the stairs picks them: '+JSON.stringify(res));
      A(res.some(q=>q.on >= 10), 'the stairs were on screen: '+JSON.stringify(res));
      // and clicking them walks you there and takes them
      const d0 = G.depth; ISO.rot = 0; G.player.viewRot = 0;
      isoAct({ mon:null, gx:st[0], gy:st[1] }, false);
      A(ISO.path.length, 'a path to the stairs');
      let t = performance.now(); for (let i=0;i<40 && G.depth===d0;i++){ t += 1000; isoTickPath(t); }
      A(G.depth!==d0, 'walked onto the stairs and took them');
      out['took'+kind] = [d0, G.depth];
      if (G.depth!==2){ loadLevel(2, G.depth > 2); setUi('playing'); }
    }
    return out;
  });
  console.log(JSON.stringify(r));
};
