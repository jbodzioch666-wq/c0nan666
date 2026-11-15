// (probe, not in ALL) a click on the 3D ground walks you there, on a Planet - on the middle face and on another face
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 300)); });
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; });
  for (const face of [2, 4, 1]){
    const p = await page.evaluate(async face=>{ const N = cubeN(), o = CUBE_O[face], ok = t=>t===OW_GRASS || t===OW_FOREST || t===OW_DESERT || t===OW_TUNDRA; let at = null;
      for (let r=0; r<60 && !at; r++) for (let dx=-r; dx<=r && !at; dx++) for (let dy=-r; dy<=r; dy++){ const x = o[0]*N + (N>>1) + dx, y = o[1]*N + (N>>1) + dy; if (ok(G.ow.map[x][y]) && [[1,0],[-1,0],[0,1],[0,-1],[2,0],[0,2],[-2,0],[0,-2]].every(([a, b])=>ok(G.ow.map[x+a][y+b]))){ at = [x, y]; break; } }
      if (!at) return null; G.owPos = { x:at[0], y:at[1] }; G.gameMode = 0; for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r)); return { at, frame:O3F.face }; }, face);
    if (!p){ console.log('face', face, 'no open land'); continue; }
    const r = await page.evaluate(()=>O3.cv.getBoundingClientRect().toJSON());
    const tgt = await page.evaluate(([x, y])=>{ const a = o3Pick({ clientX:x, clientY:y }); return a && { kind:a.kind, x:a.x, y:a.y }; }, [r.left + r.width*0.55, r.top + r.height*0.55]);
    await page.mouse.click(r.left + r.width*0.55, r.top + r.height*0.55); await page.waitForTimeout(3000);
    const after = await page.evaluate(()=>[G.owPos.x, G.owPos.y]);
    console.log('face', face, JSON.stringify({ p, tgt, after, reached:tgt && after[0]===tgt.x && after[1]===tgt.y }));
  }
  if (errs.length) console.log('ERRORS', errs.slice(0, 8).join(' || '));
};
