// RS-393: a dungeon's wall torches are the same 3D iron sconces as the rooms' (RS-392), not ones painted on the wall, with a
// flickering flame; and the torchlight is all on the GPU - no whole-floor light map is worked out on the CPU every frame
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const ts = []; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.dungeonDeco[x][y]==='torch') ts.push([x,y]);
    const [tx,ty] = ts[0]; let face = null;
    for (const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]) if (G.map[tx+a][ty+b]===T_FLOOR){ G.player.x = tx+a; G.player.y = ty+b; face = [tx+0.5+a*0.6, ty+0.5+b*0.6]; break; }
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const sc = [...ISO.props.entries()].filter(([k, o])=>k.startsWith('sconce:') && o.g.visible), flat = [...ISO.props.keys()].filter(k=>k.startsWith('flame:') && (FP.flames||[]).some(f=>f.h==null && 'flame:'+f.x+','+f.y+':'===k));
    let meshes = 0, fl = null; if (sc[0]){ sc[0][1].g.traverse(o=>{ if (o.isMesh) meshes++; }); fl = sc[0][1].g.userData.flame; }
    const s0 = fl ? fl.outer.scale.y : 0; await new Promise(r=>setTimeout(r, 150)); renderGame(); const s1 = fl ? fl.outer.scale.y : 0;
    const L = fpTorchRGB(face[0], face[1]), far = fpTorchRGB(0.5, 0.5);
    let painted = 0; FPD.scene.traverse(o=>{ if (o.isMesh && o.material && o.material.name && /wallT/.test(o.material.name)) painted++; });
    return { torches:ts.length, sconces:sc.length, flat:flat.length, meshes, flick:Math.abs(s1 - s0) > 1e-4, near:+L[0].toFixed(3), cpuMap:!!(FP.L4r || FP.Lr), lights:FPD.torches.filter(l=>l.intensity > 0).length, painted };
  });
  await page.screenshot({ path:`${S}/s393-dungeon.png`, timeout:150000 });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.sconces >= 1 && r.flat===0, 'the wall torches are 3D sconces');
  A(r.meshes >= 10, 'a sconce is a proper model: plate, rivets, bracket, cup, torch, bands and flame');
  A(r.flick, 'its flame flickers');
  A(r.lights >= 1, 'the GPU torch lights are lit');
  A(r.near > 0.2, 'a sprite by a torch is still lit by it');
  A(!r.cpuMap, 'no whole-floor light map on the CPU');
};
