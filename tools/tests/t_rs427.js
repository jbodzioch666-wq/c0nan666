// RS-427: a two-legged body killed and thrown down keeps its legs - a thigh at the hip swings back only about 20 degrees from straight
// down the body and forward at most about 120, measured in the body's own plane, so a body on its back no longer lies with its legs
// tucked up under it, cut off at the waist (the old limit only looked at how far behind the body the thigh pointed). And an altar is solid,
// there's none in a pyramid, and no chest or altar is ever put where it blocks the way through a floor
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const names = ['goblin','ogre','hill giant','bandit','dark wizard','barbarian','goblin','ogre','bandit','dark wizard','hill giant','barbarian'];
  const r = await page.evaluate(async names=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 99999; for (const m of G.mon) m.alive = 0; G.mon = []; tickMonsters = ()=>{};
    { let best = null, bn = -1; for (let x=4;x<COLS-4;x++) for (let y=4;y<ROWS-4;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } }
      p.x = best[0]; p.y = best[1]; }
    const spots = []; for (let dx=-2;dx<=2;dx++) for (let dy=-2;dy<=2;dy++){ if (!dx && !dy) continue; const x = p.x+dx, y = p.y+dy; if (G.map[x][y]===T_FLOOR && (Math.abs(dx)+Math.abs(dy))%2===0) spots.push([x,y]); }
    const T = THREE, out = [], fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); } };
    const ang = P=>{ const sp = new T.Vector3().subVectors(P[0].x, P[1].x).normalize(), x = new T.Vector3().subVectors(P[7].x, P[4].x).normalize(), y = new T.Vector3().subVectors(P[2].x, P[1].x).normalize(), f = new T.Vector3().crossVectors(x, y);
      f.addScaledVector(sp, -f.dot(sp)).normalize(); return [[10,11],[14,15]].map(([h,k])=>{ const t = new T.Vector3().subVectors(P[k].x, P[h].x); return Math.atan2(t.dot(f), t.dot(sp))*57.3; }); };
    const kinds = ['melee','ranged','magic'];
    for (let i0=0;i0<names.length;i0+=spots.length){
      const batch = names.slice(i0, i0+spots.length); G.mon = [];
      batch.forEach((nm, i)=>{ const [x,y] = spots[i]; const m = newMonster(); Object.assign(m, { alive:1, x, y, hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'o', nm, col:'#8f8', art:null, abilities:[] }); G.mon.push(m); });
      await fr(40);
      const es = G.mon.map(m=>M3D.inst.get(m));
      G.mon.forEach((m, i)=>{ m.alive = 0; m3dKill(m, { dmg:20, maxHp:20, kind:kinds[(i0 + i) % 3], crit:(i % 2)===0 }); });
      FP.dt = 1/60; const lo = es.map(()=>999), hi = es.map(()=>-999), end = es.map(()=>null);
      for (let f=0;f<300;f++){ FP.t += 1/60; m3dSweep();
        es.forEach((e,i)=>{ if (!e || !e.chain || !e.chain.hipLim || e.chain.t < 0.25) return; const a = ang(e.chain.p); lo[i] = Math.min(lo[i], ...a); hi[i] = Math.max(hi[i], ...a); end[i] = a; }); }
      es.forEach((e, i)=>{ if (e && e.chain && e.chain.hipLim) out.push({ nm:batch[i], lo:+lo[i].toFixed(0), hi:+hi[i].toFixed(0), end:end[i] && end[i].map(v=>+v.toFixed(0)) }); });
      if (i0===0){ await fr(2); }
      for (const e of es) if (e && e.holder.parent && i0 + spots.length < names.length){ e.holder.parent.remove(e.holder); M3D.live.delete(e); }
    }
    return out; }, names);
  await page.screenshot({ path:SHOTS + '/rs427_dead.png' });
  const lv = await page.evaluate(()=>{
    const out = { levels:0, cuts:[], byStairs:[], pyrAltar:0, altarSolid:null, chests:0, kinds:{} };
    const reach = (sx, sy, pass)=>{ const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; for (let h=0; h<q.length; h++){ const [x, y] = q[h]; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = x+dx, ny = y+dy, k = nx + ',' + ny; if (seen.has(k) || !pass(nx, ny)) continue; seen.add(k); q.push([nx, ny]); } } return seen; };
    for (const kind of ['pyramid','castle','necro','dungeon']){
      const sites = questNearbySites(G.owPos.x, G.owPos.y, 0, 400, [kind]); if (!sites.length) continue; out.kinds[kind] = 0;
      for (let rep=0; rep<6; rep++){ const s = sites[rep % sites.length]; G.gameMode = 0; G.owPos = { x:s.x, y:s.y }; G.pendingDungeon = { x:s.x, y:s.y }; G.dgCache = {}; enterDungeonConfirm(); setUi('playing');
        for (let d=1; d<=Math.min(3, G.dungeonMaxDepth||1); d++){ if (d > 1){ G.dgCache = {}; loadLevel(d, false); }
          out.levels++; out.kinds[kind]++;
          const isC = (x, y)=>{ const t = G.map[x] && G.map[x][y]; return t===T_VAULT || t===T_CORRUPT_CHEST || (G.dungeonDeco[x] && G.dungeonDeco[x][y]==='altar'); };
          for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ if (G.siteKind==='pyramid' && G.dungeonDeco[x][y]==='altar') out.pyrAltar++; if (isC(x, y) || G.dungeonDeco[x][y]==='lchest'){ for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++){ const t = G.map[x+i] && G.map[x+i][y+j]; if (t===T_STAIRSU || t===T_STAIRSD || t===T_EXIT || t===T_FLEE) out.byStairs.push(G.siteKind + ' ' + d + ' ' + x + ',' + y + ' ' + G.map[x][y] + '/' + G.dungeonDeco[x][y] + ' by ' + t); } } if (isC(x, y)){ out.chests++; if (G.dungeonDeco[x][y]==='altar' && out.altarSolid===null) out.altarSolid = dgSolid(x, y); } }
          const base = (x, y)=>{ const t = G.map[x] && G.map[x][y]; return t!==undefined && t!==T_WALL; };
          const A = reach(G.player.x, G.player.y, (x, y)=>base(x, y) && (!dgSolid(x, y) || isC(x, y))), B = reach(G.player.x, G.player.y, (x, y)=>base(x, y) && !dgSolid(x, y));
          for (const k of A){ const [x, y] = k.split(',').map(Number); if (!B.has(k) && !isC(x, y)){ out.cuts.push(G.siteKind + ' ' + d + ' ' + k); break; } } } } }
    return out; });
  console.log(JSON.stringify(lv).slice(0, 600));
  for (const x of r) console.log(x.nm, 'hip', x.lo, '..', x.hi, 'at rest', JSON.stringify(x.end));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m); };
  A(r.length >= 8, 'two-legged bodies fell as chains: ' + r.length);
  A(r.every(x=>x.lo > -32 && x.hi < 130), 'every thigh stays between about 20 degrees back and 120 forward of straight down the body: ' + r.map(x=>x.nm+' '+x.lo+'..'+x.hi).join(', '));
  A(lv.levels >= 12 && lv.chests > 0, 'floors made, with chests or altars on them');
  A(!lv.cuts.length, 'no chest or altar blocks the way: ' + lv.cuts.join('; '));
  A(!lv.byStairs.length, 'no chest or altar on the landing by the stairs: ' + lv.byStairs.join('; '));
  A(lv.pyrAltar===0, 'no altar in a pyramid');
  A(lv.altarSolid!==false, 'an altar is solid');
};
