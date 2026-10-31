// probe: on a phone, a sword and kite shield through your eyes; chop a real tree until it falls, and watch the left hand
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>console.log('PAGEERR', String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const r = await ev(async ()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; G.player.hp = G.player.maxHp = 99999;
    skP().tools.axe = Math.max(1, skP().tools.axe||0); owHunterSpawn = ()=>{}; owHuntersStep = ()=>false;
    G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); G.gear.offhand.used = true;
    let n = null, st = null; for (let rr=1; rr<40 && !n; rr++) for (let i=-rr;i<=rr && !n;i++) for (let j=-rr;j<=rr && !n;j++){ if (Math.max(Math.abs(i), Math.abs(j))!==rr) continue; const q = skNodeAt(G.owPos.x + i, G.owPos.y + j); if (!q || q.k!=='woodcutting' || q.gone || skNodeReq(q) > skLvl('woodcutting')) continue;
      for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]){ const x = q.x + dx, y = q.y + dy; if (o3Passable(x, y) && G.ow.map[x][y]!==OW_WATER && !skNodeAt(x, y)){ n = q; st = [x, y]; break; } } }
    if (!n) return { none:true }; G.owPos = { x:st[0], y:st[1] }; owReveal(st[0], st[1], 8); window.__zn = n; return { n:[n.x, n.y], st }; });
  console.log(JSON.stringify(r)); if (r.none) return;
  await wait(1500); await ev(()=>{ if (!SET.fpView) fpvToggle(); }); await wait(1500);
  const st = tag=>ev(tag=>{ const e = O3.player.e, rr = e.rig; return JSON.stringify({ tag, ui:G.ui, g:!!G.gather, offKind:FPW.offKind, offG:!!(FPW.offG && FPW.offG.parent), figShield:!!rr.shield, sheathed:rr.sheathed, toolKey:e.toolKey, style:FPW.style, work:FPW.work, gone:!!(skNodeAt(__zn.x, __zn.y)||{}).gone, fight:e.fight }); }, tag).then(console.log);
  await st('before'); await page.screenshot({ path:'tools/tests/out/zfpsh0.png' });
  await ev(()=>{ skDo(skNodeOption(__zn)); });
  for (let i=0;i<(+process.env.ZS_N||30);i++){ await wait(+process.env.ZS_DT||700); if (process.env.ZS_SHOT) await page.screenshot({ path:'tools/tests/out/zfpsh-'+i+'.png' }); await ev(()=>{ if (G.gather) G.gather.next = Math.min(G.gather.next, performance.now()); }); await st('t'+i); }
  await page.screenshot({ path:'tools/tests/out/zfpsh1.png' });
};
module.exports.mobile = true;
