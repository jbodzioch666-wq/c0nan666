// RS-336: a click on floor you can see through a wall the cutaway has dissolved (a wall between the camera and you) goes to
// that floor - the click used to stop on the invisible wall and send you to the tile in front of it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = [];
    const P = G.player; P.x = 10; P.y = 10;
    for (let x=6;x<=15;x++) for (let y=6;y<=15;y++){ G.map[x][y] = T_FLOOR; if (G.dungeonDeco) G.dungeonDeco[x][y] = ''; }
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    const pick = (fx, fy)=>{ const v = new THREE.Vector3(fx+0.5, 0.02, fy+0.5).project(FPD.cam), rc = canvas.getBoundingClientRect(); return isoPick({ clientX:rc.left + (v.x+1)/2*rc.width, clientY:rc.top + (1-v.y)/2*rc.height }); };
    // walls just toward the camera from the floor beside you
    const yaw = ISO.yawNow||0, sx = Math.sign(Math.round(Math.sin(yaw)*10)) || 1, sy = Math.sign(Math.round(Math.cos(yaw)*10)) || 1;
    const out = { yaw:+yaw.toFixed(2), tries:[] };
    for (const [fx, fy, wx, wy] of [[P.x+sx, P.y, P.x+2*sx, P.y+sy], [P.x, P.y+sy, P.x+sx, P.y+2*sy], [P.x+sx, P.y+sy, P.x+2*sx, P.y+2*sy]]){
      for (let x=6;x<=15;x++) for (let y=6;y<=15;y++) G.map[x][y] = T_FLOOR;
      G.map[wx][wy] = T_WALL; G.map[wx+sx] && (G.map[wx+sx][wy] = T_WALL); G.map[wx][wy+sy] = T_WALL;
      FPD.mapRef = null; await frames(6);
      const on = pick(fx, fy); const z0 = FPD.cutU.uCutF.value.z; FPD.cutU.uCutF.value.z = 0; const off = pick(fx, fy); FPD.cutU.uCutF.value.z = z0;
      out.tries.push({ f:[fx-P.x, fy-P.y], on:on && [on.gx-P.x, on.gy-P.y], off:off && [off.gx-P.x, off.gy-P.y] });
    }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  const real = r.tries.filter(t=>t.off && (t.off[0]!==t.f[0] || t.off[1]!==t.f[1]));   /* (the cases where the wall really stood in the way) */
  A(real.length >= 1, 'at least one floor tile is hidden behind a wall toward the camera');
  A(real.every(t=>t.on && t.on[0]===t.f[0] && t.on[1]===t.f[1]), 'with the wall dissolved, the click goes to the floor behind it');
  console.log('cutclick ok', JSON.stringify(r));
};
