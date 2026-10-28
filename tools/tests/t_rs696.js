// RS-696: fishing, animated. On the land: the first cast (the rod back over your shoulder, the float flown out from the tip and landing on
// the water with a splash), waiting with the float on the water, a miss that strikes at nothing (the float yanked up), and a catch (the bite
// takes the float under, the strike lifts the rod, the fish comes out of the water on the line, swung in to the tip, then into your bag,
// and a cast out again). The real loop marks a catch so the animation lands it. Shot: shots/rs696.png (the fish on the line)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), wait = ms=>new Promise(res=>setTimeout(res, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4;
    skP().tools.rod = Math.max(1, skP().tools.rod||0); owHunterSpawn = ()=>{}; owHuntersStep = ()=>false;
    let n = null, st = null; for (let rr=1; rr<40 && !n; rr++) for (let i=-rr;i<=rr && !n;i++) for (let j=-rr;j<=rr && !n;j++){ if (Math.max(Math.abs(i), Math.abs(j))!==rr) continue; const q = skNodeAt(G.owPos.x + i, G.owPos.y + j); if (!q || q.k!=='fishing' || q.gone || q.type==='deep' || skNodeReq(q) > skLvl('fishing')) continue;
      for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]){ const x = q.x + dx, y = q.y + dy; if (o3Passable(x, y) && G.ow.map[x][y]!==OW_WATER){ n = q; st = [x, y]; break; } } }
    if (!n) return { none:true };
    G.owPos = { x:st[0], y:st[1] }; owReveal(st[0], st[1], 8); await fr(120);
    const out = {}, T = THREE, [sx, sz] = o3C(n.x, n.y), spot = new T.Vector3(sx, -0.12, sz);
    /* the real loop: a try that lands a fish marks it */
    skDo(skNodeOption(n)); await wait(200); const g = G.gather; out.gather = !!g;
    { const rr = Math.random; Math.random = ()=>0.02; g.next = 0; skGatherTick(performance.now()); Math.random = rr; out.marked = [g.last, g.lastFish]; }
    const real = skGatherTick; skGatherTick = ()=>{}; g.iv = 2800;
    const at = async (last, ts, nn)=>{ g.last = last; g.n = nn; g.lastFish = 'trout'; for (let k=0;k<3;k++){ g.next = performance.now() + (2.8 - ts)*1000; await fr(1); } const P = O3.player.e.rig, R = P.arms[0];
      const tip = new T.Vector3(); O3.player.e.tool.userData.tip.getWorldPosition(tip); const F = O3.frig;
      return { arm:+R.sh.rotation.x.toFixed(2), float:F.float.visible ? [+F.float.position.distanceTo(spot).toFixed(2), +(F.float.position.y - O3.ppos.y).toFixed(2)] : null, fish:F.fish.visible ? [+F.fish.position.distanceTo(spot).toFixed(2), +F.fish.position.distanceTo(tip).toFixed(2), +F.fish.scale.x.toFixed(2)] : null,
        tipToFloat:+tip.distanceTo(F.float.position).toFixed(2), splash:F.sp.some(S=>S.t >= 0), line:F.line.visible }; };
    let missN = 0; while (o3Hash(missN, 7, 3) >= 0.55) missN++;
    out.back = await at(undefined, 0.3, 0); out.fly = await at(undefined, 0.62, 0); out.landed = await at(undefined, 1.2, 0);
    out.wait = await at('miss', 1.5, missN + 0);
    out.yank = await at('miss', 0.42, missN);
    out.bite = await at('catch', 0.12, 3); out.out = await at('catch', 0.3, 3); out.mid = await at('catch', 0.6, 3); out.tip = await at('catch', 1.05, 3); out.bag = await at('catch', 1.33, 3); out.recast = await at('catch', 1.5, 3); out.again = await at('catch', 2.4, 3);
    { await at('catch', 0.6, 3); const c2 = O3.cam.clone(), P0 = O3.ppos, d = new T.Vector3(sx - P0.x, 0, sz - P0.z).normalize(); c2.position.set((P0.x + sx)/2 - d.z*1.8, P0.y + 1.3, (P0.z + sz)/2 + d.x*1.8); c2.lookAt((P0.x + sx)/2, P0.y + 0.6, (P0.z + sz)/2); c2.updateProjectionMatrix(); O3.renderer.render(O3.scene, c2); out.shot = O3.renderer.domElement.toDataURL('image/png'); }
    skGatherTick = real; skStop(); await fr(3); out.after = O3.frig.line.visible || O3.frig.float.visible || O3.frig.fish.visible;
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs696.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(!r.none && r.gather, 'fishing a spot on the land');
  A(r.marked[0]==='catch' && r.marked[1], 'a try that lands a fish is marked for the animation');
  A(r.back.arm < -1.6 && r.back.float && r.back.float[1] > 0.6 && r.back.tipToFloat < 0.4, 'the first cast: the rod back over the shoulder, the float at its tip');
  A(r.fly.float && r.fly.float[0] > 0.2 && r.fly.float[1] > 0.3 && r.landed.float && r.landed.float[0] < 0.05, 'the float flown out over the water, and landed on it');
  A(r.wait.float && r.wait.float[0] < 0.06 && !r.wait.fish && r.wait.arm > -0.9, 'waiting: the float on the water, the rod held out');
  A(r.yank.float && r.yank.float[1] > r.wait.float[1] + 0.08 && r.yank.arm < -0.95, 'a miss: a strike at nothing, the float yanked up');
  A(r.bite.float && r.bite.float[1] < r.wait.float[1] - 0.04 && r.bite.splash, 'the bite: the float pulled under, a splash');
  A(r.mid.fish && !r.mid.float && r.mid.fish[0] > 0.3 && r.mid.fish[1] > 0.3 && r.mid.arm < -1.3, 'the strike: the rod up, the fish out of the water and coming in on the line');
  A(r.tip.fish && r.tip.fish[1] < 0.45, 'swung in to the rod\'s tip');
  A(r.bag.fish && r.bag.fish[2] < r.tip.fish[2]*0.6 && !r.recast.fish, 'into your bag');
  A(r.recast.arm < -1.5 && r.again.float && r.again.float[0] < 0.05, 'and cast out again, the float back on the water');
  A(!r.after, 'nothing left when you stop');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
