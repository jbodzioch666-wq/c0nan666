// probe: a bow or a crossbow through your eyes through a shot, a sheet of poses (shots/zfpbow.jpg).
// ZB_KIND=bow|long|xbow, ZB_T=tier, ZB_P='[0,0.2,0.35,0.45,0.7,0.9]' the points of the shot, ZB_K='{...}' merged into FPW_BOW[kind], ZB_CROP=1 the middle
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>console.log('PAGEERR', String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') console.log('CONSOLEERR', m.text().slice(0, 300)); });
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(async ()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  await ev(()=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y);
    let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f]; let good = true; for (let k=0; k<=5 && good; k++) good = ok(x+F[0]*k, y+F[1]*k);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; G.mon.forEach(m=>{ m.alive = 0; }); });
  await page.keyboard.press('o'); await wait(800);
  const kind = process.env.ZB_KIND || 'bow', T = +(process.env.ZB_T || 3), P = JSON.parse(process.env.ZB_P || '[0,0.2,0.35,0.45,0.7,0.9]');
  await ev(([kind, T, K])=>{ G.gear.ranged = kind==='xbow' ? rsMakeCrossbow(T) : rsMakeBow(T, kind==='long'); G.gear.ranged.used = true;
    let at = 0; if (kind==='xbow') for (let t=0; t<40; t++) if (ammoKind(t)==='bolt'){ at = t; break; }
    G.gear.ammo = newItem(); G.player.arrows = 0; addArrows(50, at + Math.min(2, T));
    if (K) Object.assign(FPW_BOW[kind==='xbow' ? 'xbow' : 'bow'], K); FPW.bowOut = true; FPW.wkey = ''; }, [kind, T, process.env.ZB_K ? JSON.parse(process.env.ZB_K) : null]);
  const grab = ()=>ev(async ()=>{ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height; const g = c.getContext('2d'); g.drawImage(FPD.cv, 0, 0, c.width, c.height); g.drawImage(canvas, 0, 0); return c.toDataURL('image/jpeg', 0.9); });
  const shots = [];
  if (process.env.ZB_SET){ for (const k of JSON.parse(process.env.ZB_SET)){ await ev(([kind, k, p])=>{ Object.assign(FPW_BOW[kind==='xbow' ? 'xbow' : 'bow'], k); FPW.wkey = ''; window.__fpwP = p; }, [kind, k, P[0]]); await wait(400); shots.push(await grab()); } }   /* (ZB_SET='[{...},...]' a cell for each at ZB_P's first point) */
  else for (const p of P){ await ev(p=>{ window.__fpwP = p; }, p); await wait(400); shots.push(await grab()); }
  console.log('info', JSON.stringify(await ev(()=>({ kind:FPW.bow && FPW.bow.kind, style:FPW.style, arms:FPW.arms.length, ammo:rangedAmmoN(G.gear.ranged), d:FPW.bow && FPW.bow.d }))));
  const out = await ev(async ([shots, crop])=>{ const im = await Promise.all(shots.map(s=>new Promise(r=>{ const i = new Image(); i.onload = ()=>r(i); i.src = s; })));
    const w = im[0].width/2, h = im[0].height/2, c = document.createElement('canvas'); c.width = w*2; c.height = h*Math.ceil(im.length/2); const g = c.getContext('2d');
    im.forEach((i, n)=>crop ? g.drawImage(i, i.width*0.25, i.height*0.25, i.width*0.5, i.height*0.5, (n%2)*w, Math.floor(n/2)*h, w, h) : g.drawImage(i, (n%2)*w, Math.floor(n/2)*h, w, h)); return c.toDataURL('image/jpeg', 0.86); }, [shots, !!process.env.ZB_CROP]);
  fs.writeFileSync(SHOTS + '/zfpbow.jpg', Buffer.from(out.split(',')[1], 'base64'));
  await ev(()=>{ delete window.__fpwP; });
};
