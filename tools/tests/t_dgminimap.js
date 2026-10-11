// RS-328: the minimap in dungeons and roadside fights turns with the camera (Z/X), like the overworld's
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a);
  const frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); } }, n);
  const shot = async nm=>{ if (process.env.SHOT_DIR) await page.screenshot({ path:process.env.SHOT_DIR+'/'+nm+'.png' }); };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = {x:dx, y:dy}; enterDungeonConfirm(); setUi('playing'); ISO.rot = 0; VIEW.yaw = null; });
  await frames(6); await shot('dgmm-0');
  const d0 = await ev(()=>({ mode:G.gameMode, mm:FP.mmRot, yaw:viewYawNow() }));
  await ev(()=>handlePlayingKey('x')); await frames(4); await page.waitForTimeout(1500); await frames(4); await shot('dgmm-1');
  const d1 = await ev(()=>({ rot:ISO.rot, mm:FP.mmRot, yaw:viewYawNow() }));
  await ev(()=>{ ISO.rot = 0; VIEW.yaw = null; G.gameMode = 0; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; randomEncounter(false); setUi('playing'); });
  await frames(4); await ev(()=>handlePlayingKey('z')); await frames(4); await page.waitForTimeout(1500); await frames(4); await shot('dgmm-enc');
  const e1 = await ev(()=>({ mode:G.gameMode, rot:ISO.rot, mm:FP.mmRot, yaw:viewYawNow() }));
  const r = { d0, d1, e1 }, A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(d0.mode===1 && Math.abs(d0.mm - d0.yaw) < 0.02, 'the dungeon minimap is turned by the camera angle');
  A(d1.rot===1 && Math.abs(d1.mm - d1.yaw) < 0.05 && Math.abs(d1.mm - d0.mm - Math.PI/2) < 0.1, 'X turns the dungeon minimap a quarter turn');
  A(e1.mode===2 && Math.abs(e1.mm - e1.yaw) < 0.05 && Math.abs(Math.atan2(Math.sin(e1.mm - d0.mm + Math.PI/2), Math.cos(e1.mm - d0.mm + Math.PI/2))) < 0.1, 'Z turns the fight minimap the other way');
  console.log('dgminimap ok', JSON.stringify(r));
};
