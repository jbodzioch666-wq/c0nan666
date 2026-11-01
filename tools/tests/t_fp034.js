// FP-034: on a phone, a gathering spot's work is stopped by a tap: on the ground (even your own tile, which used to count as the tree
// beside you and started the chopping again), or on the spot you're working; a tap on the ground a few tiles off walks you there
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; window.__noWarmSlice = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9; G.gameMode = 0; setUi('playing'); skP().tools.axe = 1; });
  await wait(2500);
  const atTree = ()=>ev(()=>{ let n = null, best = 1e9; for (let i=-14;i<=14;i++) for (let j=-14;j<=14;j++){ const x = G.owPos.x + i, y = G.owPos.y + j, t = skNodeAt(x, y); if (!t || t.k!=='woodcutting' || t.gone || t.shut || skNodeReq(t) > skLvl('woodcutting') || t.gate) continue; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ax = x+dx, ay = y+dy; if (!o3Passable(ax, ay) || skNodeAt(ax, ay)) continue; const d = i*i+j*j; if (d < best){ best = d; n = { tx:x, ty:y, ax, ay }; } } }
    if (!n) return null; G.owPos = { x:n.ax, y:n.ay }; return n; });
  const start = ()=>ev(()=>{ const n = skNodesNear().find(t=>t.k==='woodcutting'); if (n) skDo(skNodeOption(n)); return !!G.gather; });
  const screen = (x, y, fx, fz)=>ev(([x, y, fx, fz])=>{ const T = THREE, c = o3C(x, y), wx = c[0] - 0.5 + fx, wz = c[1] - 0.5 + fz, v = new T.Vector3(wx, O3.heightAt(wx, wz), wz); v.project(O3.cam); const r = O3.cv.getBoundingClientRect(); return { x:r.left + (v.x + 1)/2*r.width, y:r.top + (1 - v.y)/2*r.height }; }, [x, y, fx, fz]);
  const n = await atTree(); A(n, 'a tree to chop'); await wait(1500);
  /* 1: a tap on your own tile, on its side toward the tree */
  A(await start(), 'chopping'); await wait(1200);
  const own = await screen(n.ax, n.ay, 0.5 + (n.tx - n.ax)*0.3, 0.5 + (n.ty - n.ay)*0.3); const pick = await ev(p=>{ const a = o3Pick({ clientX:p.x, clientY:p.y, button:0 }); return a && a.kind; }, own); console.log('own tile pick', pick);
  await page.touchscreen.tap(own.x, own.y); await wait(1200);
  A(await ev(()=>!G.gather), 'a tap on your own tile stops the chopping (it picked: ' + pick + ')');
  /* 2: a tap on the tree you're chopping */
  A(await start(), 'chopping again'); await wait(1200);
  const tr = await ev(n=>{ const T = THREE, c = o3C(n.tx, n.ty), v = new T.Vector3(c[0], O3.heightAt(c[0], c[1]) + 0.6, c[1]); v.project(O3.cam); const r = O3.cv.getBoundingClientRect(); return { x:r.left + (v.x + 1)/2*r.width, y:r.top + (1 - v.y)/2*r.height }; }, n);
  const tp = await ev(p=>{ const a = o3Pick({ clientX:p.x, clientY:p.y, button:0 }); return a && a.kind + ':' + a.x + ',' + a.y; }, tr); console.log('tree pick', tp);
  await page.touchscreen.tap(tr.x, tr.y); await wait(800);
  A(await ev(()=>!G.gather), 'a tap on the tree you are chopping stops you (it picked: ' + tp + ')');
  /* 3: a tap on the ground a few tiles away, back from the tree */
  A(await start(), 'chopping a third time'); await wait(1200);
  let away = null; for (const [ux, uy] of [[n.ax - n.tx, n.ay - n.ty], [n.ay - n.ty, n.ax - n.tx], [n.ty - n.ay, n.tx - n.ax]]) for (const k of [3, 2]){ if (away) break; const bx = n.ax + ux*k, by = n.ay + uy*k; if (!(await ev(([x, y])=>o3Passable(x, y) && !skNodeAt(x, y), [bx, by]))) continue; const p = await screen(bx, by, 0.5, 0.5);
    const a = await ev(p=>{ const r = O3.cv.getBoundingClientRect(); if (p.x < r.left + 20 || p.x > r.right - 20 || p.y < r.top + 20 || p.y > r.bottom - 20 || document.elementFromPoint(p.x, p.y)!==O3.cv) return 'off'; const a = o3Pick({ clientX:p.x, clientY:p.y, button:0 }); return a && a.kind; }, p); if (a==='ground') away = { p, bx, by }; }
  if (away){ await page.touchscreen.tap(away.p.x, away.p.y); await wait(3000); const w = await ev(()=>({ g:!!G.gather, pos:G.owPos.x + ',' + G.owPos.y })); console.log('walk away', JSON.stringify(away), JSON.stringify(w));
    A(!w.g && w.pos!==n.ax + ',' + n.ay, 'a tap on the ground further off stops the work and walks you away'); }
  else console.log('no open ground round you to tap');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
module.exports.mobile = true;
