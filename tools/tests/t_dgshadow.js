// RS-410: in a dungeon you throw a real shadow - your lantern hangs over your shoulder, toward the camera and a little to one
// side, and lights you into its shadow map, so a short soft shadow falls on the floor behind you, as the sun's does outside;
// it's redrawn every frame while you walk, so it keeps up with you
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(m=>{ m.alive = 0; });
    // open floor all round, away from the torches
    const open = (x,y)=>{ for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++) if (G.map[x+i]===undefined || G.map[x+i][y+j]!==T_FLOOR || G.dungeonDeco[x+i][y+j]) return false; return true; };
    let t = null; for (let x=3;x<COLS-3 && !t;x++) for (let y=3;y<ROWS-3;y++) if (open(x,y)){ t = [x,y]; break; }
    G.player.x = t[0]; G.player.y = t[1]; G.player.facing = 2; if (ISO.player) ISO.player.pos = null;
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const L = FPD.lan, pp = ISO.player.pos, out = { t, near:L.shadow.camera.near, h:+L.position.y.toFixed(2), off:+Math.hypot(L.position.x - pp.x, L.position.z - pp.y).toFixed(2), cast:L.castShadow };
    let castMeshes = 0; ISO.player.holder.traverse(o=>{ if (o.isMesh && o.castShadow) castMeshes++; }); out.castMeshes = castMeshes;
    // toward the camera's side of you
    const toCam = [FPD.cam.position.x - pp.x, FPD.cam.position.z - pp.y], toLan = [L.position.x - pp.x, L.position.z - pp.y]; out.camSide = toCam[0]*toLan[0] + toCam[1]*toLan[1] > 0;
    // walking: the lantern's shadow is redrawn every frame
    ISO.player.pos.mv = 1; let ups = 0; for (let i=0;i<6;i++){ L.shadow.needsUpdate = false; dgShadowTick(); if (L.shadow.needsUpdate) ups++; } out.walkUps = ups; ISO.player.pos.mv = 0;
    const v = new THREE.Vector3(pp.x, 0.4, pp.y).project(FPD.cam); const rc = canvas.getBoundingClientRect(); out.sx = rc.left + (v.x+1)/2*rc.width; out.sy = rc.top + (1-v.y)/2*rc.height;
    return out;
  });
  console.log(JSON.stringify(r));
  await page.screenshot({ path:`${S}/dgshadow.png`, clip:{ x:Math.max(0, r.sx-250), y:Math.max(0, r.sy-200), width:500, height:400 }, timeout:150000 });
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.cast && r.castMeshes > 0, 'the lantern casts no shadows - the torches throw them (RS-480/481)');
  A(r.h >= 1.4 && r.off >= 0.25 && r.camSide, 'held up over your shoulder, on the camera\'s side');
  A(r.walkUps===6, 'redrawn every frame while you walk');
};
