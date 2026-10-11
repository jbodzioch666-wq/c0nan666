// RS-323: light carries half as far in a dungeon - your lantern, the torches, the fog, every glow, and the shafts falling
// through the cracks are narrower; and a swinging blade swings in real time (a wide sweep when it would catch you, a small
// rock held to one side when it's safe)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = [];
    const P = G.player, frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    // a blade on the tile beside you, in sight
    const bx = [[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[P.x+a, P.y+b]).find(([x,y])=>G.map[x][y]!==T_WALL); G.dungeonDeco[bx[0]][bx[1]] = 'blade';
    for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) G.dungeonSeen[x][y] = true;
    await frames(20);
    const env = FP.envNow, out = { DG:DG_LIGHT, lan:FPD.lan.distance, R:env.R, fogFar:FPD.scene.fog.far, torch:FPD.torches ? FPD.torches[0].distance : null };
    let shaftW = null; FPD.world.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.type==='PlaneGeometry' && o.geometry.parameters.height===2.2) shaftW = o.geometry.parameters.width; }); out.shaftW = shaftW;
    let arm = null; for (const [k, o] of ISO.props) if (/blade/.test(k)) o.g.traverse(c=>{ if (!arm && c.isGroup && c!==o.g && c.children.length>=2) arm = c; });
    out.arm = !!arm; const a = []; for (let i=0;i<8;i++){ await frames(2); a.push(arm ? arm.rotation.z : 0); }
    out.swing = Math.max(...a) - Math.min(...a); out.turn = G.dgTurn||0;
    return out; });
  console.log(JSON.stringify(r));
  if (!(r.DG <= 0.6 && r.lan <= r.R*1.8*0.6)) throw new Error('your lantern reaches less far '+JSON.stringify(r));
  if (r.torch!==null && r.torch > 6.5*0.6) throw new Error('the torches reach less far '+r.torch);
  if (r.shaftW!==null && r.shaftW >= 0.55) throw new Error('the shafts of light are narrower '+r.shaftW);
  if (!r.arm || r.swing < 0.1) throw new Error('the blade swings in real time between turns '+JSON.stringify(r));
};
