// probe: work through your eyes on the land - axe, pick, rod, foraging - shots at points of the cycle (shots/zfpwork-<k>.jpg, 4 to a sheet)
module.exports = async page=>{ const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.4;
    const t = townList()[0]; G.interior = null; G.gameMode = 0; G.mon = [];
    for (const [dx, dy] of [[0,6],[6,0],[0,-6],[-6,0],[7,7],[-7,-7]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y)){ G.owPos = { x, y }; break; } } setUi('playing'); });
  await wait(1500); await page.keyboard.press('o'); await wait(2500);
  for (const k of (process.env.ZWK || 'woodcutting,mining,fishing,foraging').split(',')){
    await ev(k=>{ G.gather = { o:{ k, label:k, at:{ x:G.owPos.x + 1, y:G.owPos.y } }, iv:2800, next:performance.now()+1400, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0 }; }, k);
    await wait(900); const shots = [];
    for (let i=0;i<4;i++){ await wait(i ? 290 : 10); console.log(k, i, JSON.stringify(await ev(()=>({ work:FPW.work, key:FPW.wkey.slice(0, 30), ph:+(FPW.workPh||0).toFixed(2), ly:FP.lookYaw, pt:+(FP.pitch||0).toFixed(2) }))));
      shots.push((await page.screenshot({ type:'png' })).toString('base64')); }
    const out = await ev(async shots=>{ const im = await Promise.all(shots.map(s=>new Promise(r=>{ const i = new Image(); i.onload = ()=>r(i); i.src = 'data:image/png;base64,' + s; })));
      const w = im[0].width/2, h = im[0].height/2, c = document.createElement('canvas'); c.width = w*2; c.height = h*2; const g = c.getContext('2d');
      im.forEach((i, n)=>g.drawImage(i, (n%2)*w, Math.floor(n/2)*h, w, h)); return c.toDataURL('image/jpeg', 0.85); }, shots);
    require('fs').writeFileSync(SHOTS + '/zfpwork-' + k + '.jpg', Buffer.from(out.split(',')[1], 'base64'));
    await ev(()=>{ G.gather = null; }); await wait(300); }
};
