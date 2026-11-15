// (probe, not in ALL) does walking work: real arrow keys and a click on the 3D ground, on a medium world and a Planet, outside a town
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 300)); });
  for (const tier of ['medium', 'planet']){
    await page.evaluate(async tier=>{ goToCharCreate(); ccBegin(); setWorldSizeTier(tier); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
      if (G.gameMode===3){ G.gameMode = 0; G.interior = null; }
      for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r)); }, tier);
    const before = await page.evaluate(()=>({ pos:[G.owPos.x, G.owPos.y], mode:G.gameMode, ui:G.ui, face:typeof cubeFace==='function' && owCube() ? cubeFace(G.owPos.x, G.owPos.y) : null, frame:O3F.face }));
    const keys = []; for (const k of ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft']){ const p0 = await page.evaluate(()=>[G.owPos.x, G.owPos.y]); await page.keyboard.press(k); await page.waitForTimeout(500); const p1 = await page.evaluate(()=>[G.owPos.x, G.owPos.y, G.gameMode]); keys.push([k, p0.join(','), p1.join(',')]); }
    const click = await page.evaluate(async ()=>{ if (G.gameMode!==0 || !O3.cam) return 'no 3D'; const p0 = [G.owPos.x, G.owPos.y]; const r = O3.cv.getBoundingClientRect();
      const ev = { clientX:r.left + r.width*0.62, clientY:r.top + r.height*0.45 }; const a = o3Pick(ev); return { pick:a && { kind:a.kind, x:a.x, y:a.y }, at:p0 }; });
    if (click && click.pick){ const r = await page.evaluate(()=>O3.cv.getBoundingClientRect().toJSON()); await page.mouse.click(r.left + r.width*0.62, r.top + r.height*0.45); await page.waitForTimeout(2500); }
    const after = await page.evaluate(()=>({ pos:[G.owPos.x, G.owPos.y], path:(O3.path||[]).length, mode:G.gameMode }));
    console.log(tier, JSON.stringify({ before, keys, click, after }));
  }
  if (errs.length) console.log('ERRORS', errs.slice(0, 8).join(' || '));
};
