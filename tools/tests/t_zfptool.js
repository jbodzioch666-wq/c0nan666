// probe: one work tool through your eyes pinned at points of its cycle (shots/zfptool-<kind>.jpg). ZTK=woodcutting|mining|fishing|foraging,
// ZTP='[0,0.45,0.6,0.7]' the points (fishing: seconds into a cast), ZTO='{...}' merged into FPW_TOOL[kind] (st replaced whole, kf replaced) to try a pose
module.exports = async page=>{ const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4;
    const t = townList()[0]; G.interior = null; G.gameMode = 0; G.mon = [];
    for (const [dx, dy] of [[0,6],[6,0],[0,-6],[-6,0],[7,7],[-7,-7]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y)){ G.owPos = { x, y }; break; } } setUi('playing'); });
  await wait(1500); await page.keyboard.press('o'); await wait(2000);
  const k = process.env.ZTK || 'woodcutting', pts = JSON.parse(process.env.ZTP || '[0,0.45,0.6,0.72]'), o = process.env.ZTO ? JSON.parse(process.env.ZTO) : null;
  await ev(([k, o])=>{ G.gather = { o:{ k, label:k, at:{ x:G.owPos.x, y:G.owPos.y - 1 } }, iv:900000, next:performance.now()+600000, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0 }; G.player.facing = 0; FP.lookYaw = null;
    if (o){ const kind = { woodcutting:'axe', mining:'pick', fishing:'rod', foraging:'forage' }[k]; Object.assign(FPW_TOOL[kind], o); FPW.wkey = ''; } }, [k, o]);
  await wait(1200); const shots = [];
  for (const p of pts){ if (k==='fishing') await ev(p=>{ const g = G.gather; g.iv = 2800; g.next = performance.now() + 2800 - p*1000; g.last = 'start'; window.__fpwFreeze = 1; }, p); else await ev(p=>{ window.__fpwP = p; }, p); await wait(k==='fishing' ? 0 : 250); shots.push((await page.screenshot({ type:'png' })).toString('base64')); }
  const out = await ev(async shots=>{ const im = await Promise.all(shots.map(s=>new Promise(r=>{ const i = new Image(); i.onload = ()=>r(i); i.src = 'data:image/png;base64,' + s; })));
    const w = im[0].width/2, h = im[0].height/2, c = document.createElement('canvas'); c.width = w*2; c.height = h*2; const g = c.getContext('2d');
    im.forEach((i, n)=>g.drawImage(i, (n%2)*w, Math.floor(n/2)*h, w, h)); return c.toDataURL('image/jpeg', 0.85); }, shots);
  require('fs').writeFileSync(SHOTS + '/zfptool-' + k + '.jpg', Buffer.from(out.split(',')[1], 'base64'));
};
