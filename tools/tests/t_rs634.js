// RS-634: walking works on every face of a Planet - the arrow keys and a click on the ground both move you on a face other than the
// middle one, where the 3D land's frame isn't the world as stored (the step waited for the figure, measured against the stored place)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; });
  const out = [];
  for (const face of [2, 4]){
    const p = await page.evaluate(async face=>{ const N = cubeN(), o = CUBE_O[face], ok = t=>t===OW_GRASS || t===OW_FOREST || t===OW_DESERT || t===OW_TUNDRA; let at = null;
      for (let r=0; r<60 && !at; r++) for (let dx=-r; dx<=r && !at; dx++) for (let dy=-r; dy<=r; dy++){ const x = o[0]*N + (N>>1) + dx, y = o[1]*N + (N>>1) + dy; if ([[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],[2,0],[0,2],[-2,0],[0,-2]].every(([a, b])=>ok(G.ow.map[x+a][y+b]) && !skNodeAt(x+a, y+b))){ at = [x, y]; break; } }
      if (!at){ at = [o[0]*N + (N>>1), o[1]*N + (N>>1)]; for (let a=-2;a<=2;a++) for (let b=-2;b<=2;b++) G.ow.map[at[0]+a][at[1]+b] = OW_GRASS; }
      G.owPos = { x:at[0], y:at[1] }; G.gameMode = 0; for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r)); return { at, frame:O3F.face, id:O3F.id, lag:+figLag().toFixed(2) }; }, face);
    const keys = []; for (const k of ['ArrowUp', 'ArrowDown']){ const a = await page.evaluate(()=>[G.owPos.x, G.owPos.y]); await page.keyboard.press(k); await page.waitForTimeout(600); const b = await page.evaluate(()=>[G.owPos.x, G.owPos.y]); keys.push(a.join()!==b.join()); }
    const r = await page.evaluate(()=>O3.cv.getBoundingClientRect().toJSON()), cx = r.left + r.width*0.56, cy = r.top + r.height*0.56;
    const tgt = await page.evaluate(([x, y])=>{ const a = o3Pick({ clientX:x, clientY:y }); return a && { kind:a.kind, x:a.x, y:a.y }; }, [cx, cy]);
    await page.mouse.click(cx, cy); await page.waitForTimeout(3000); const after = await page.evaluate(()=>[G.owPos.x, G.owPos.y]);
    out.push({ face, p, keys, tgt, clicked:!tgt || tgt.kind!=='ground' || (after[0]===tgt.x && after[1]===tgt.y) });
  }
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(out.every(o=>!o.p.id && o.p.lag < 1), 'on a face that isn\'t the middle one, the figure is where you are');
  A(out.every(o=>o.keys.every(Boolean)), 'the arrow keys walk');
  A(out.every(o=>o.clicked), 'a click on the ground walks you there');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
