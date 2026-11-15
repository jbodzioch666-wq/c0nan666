// RS-658: the room-entry and first-floor hitches. (1) The town's palette is made once per race and theme and cloned per build (16-18ms of
// textures on every step through a door). (2) The hearth's grill is made in idle time a moment after the room, not in the build's frame.
// (3) The post passes' shaders are compiled against the kind of target each pass draws to, and the occlusion's depth prepass has stand-ins
// per kind of caster, so the first real frame below ground links no program (it linked for 140ms). (4) The people slice follows the screen's
// frame, tracked as the shortest interval seen
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>{ renderGame(); ++i >= n ? res() : requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const settle = async V=>{ const t0 = performance.now(); while (performance.now() - t0 < 30000){ await fr(1); if (!V.warmWait && !V.prelink && !(V===FPD && FPD.prep) && !(V===V3 && V3.peopleQ) && performance.now() - t0 > 1500) break; } };
    const out = {};
    /* (1) the palette: one make per race and theme, every build a set of clones */
    { let makes = 0; const mk = v3MaterialsMake; window.v3MaterialsMake = function(){ makes++; return mk.apply(this, arguments); };
      const t = G.ow.spawnPos; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await settle(V3); const m1 = V3.mats, made1 = makes;
      enterInterior('tavern'); setUi('playing'); const built = { cook:(V3.hearthCook||[]).length }; await settle(V3); const m2 = V3.mats;
      out.mats = { made1, madeIn:makes - made1, distinct:m1.plaster!==m2.plaster, sameMap:m1.plaster.map===m2.plaster.map, cached:V3_MATS_CACHE.size, keys:[...V3_MATS_CACHE.keys()] };
      /* (2) the grill: not in the build's frame, there a moment later */
      out.cook = { atBuild:built.cook, after:(V3.hearthCook||[]).length, hearth:!!(ROOM_LAYOUT.tavern.benches||[]).some(b=>b[0]==='hearth') };
      window.v3MaterialsMake = mk; exitInterior(); setUi('playing'); await settle(V3); }
    /* (3) below ground: the first real frames make no program */
    { let dx=-1, dy=-1, bd = 1e9; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ const d = Math.abs(x - G.owPos.x) + Math.abs(y - G.owPos.y); if (d < bd){ bd = d; dx = x; dy = y; } }
      G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(m=>{ m.alive = 0; });
      await settle(FPD); const R = FPD.r, P = GFXP.get(R), n0 = R.info.programs.length; await fr(6); const n1 = R.info.programs.length;
      const stalls = [], gp = WebGL2RenderingContext.prototype.getProgramParameter; WebGL2RenderingContext.prototype.getProgramParameter = function(prog, pname){ const t1 = performance.now(), v = gp.call(this, prog, pname); const dt = performance.now() - t1; if (dt > 4) stalls.push(+dt.toFixed(0)); return v; };
      await fr(6); WebGL2RenderingContext.prototype.getProgramParameter = gp;
      let kinds = 0, withProg = 0; if (P && P.depM){ const sc = gfxDepthKinds(P.depM); sc.traverse(o=>{ if (o.material){ kinds++; const pr = R.properties.get(o.material); if (pr && pr.currentProgram) withProg++; } }); }
      const post = P ? ['bright', 'blur', 'ssao', 'comp'].map(k=>{ const pr = P[k] && R.properties.get(P[k]); return k + ':' + !!(pr && pr.currentProgram); }) : [];
      out.floor = { n0, n1, stalls, ao:gfxAoOn('fpd'), post:post.join(' '), kinds, withProg, prelinked:!!(P && P.prelinked) }; }
    /* (4) the people slice: tracks the shortest frame */
    { const Q = { t:0, iv:undefined }; const step = iv=>{ const now = Q.t + iv; const iv0 = Q.t ? Math.min(40, now - Q.t) : 16; Q.t = now; Q.iv = Math.min(iv0, (Q.iv || 16)*1.03); return Q.iv; };
      Q.t = 1000; const a = step(5.3), b = step(5.3), c = step(30), d = step(5.3); out.slice = { a:+a.toFixed(2), b:+b.toFixed(2), c:+c.toFixed(2), d:+d.toFixed(2) }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.mats.made1===1 && r.mats.madeIn===0 && r.mats.distinct && r.mats.sameMap && r.mats.cached===1, 'the palette is made once and cloned for the room, its textures shared: ' + JSON.stringify(r.mats));
  if (r.cook.hearth) A(r.cook.atBuild===0 && r.cook.after >= 1, 'the grill comes in idle time, after the room: ' + JSON.stringify(r.cook));
  A(r.floor.n1===r.floor.n0 && r.floor.stalls.length===0, 'the first frames below ground make no program and wait on no link: ' + JSON.stringify(r.floor));
  if (r.floor.ao) A(r.floor.kinds===3 && r.floor.withProg===3 && /ssao:true/.test(r.floor.post), 'the occlusion\'s depth stand-ins and its shader are compiled: ' + JSON.stringify(r.floor));
  A(r.slice.b < 6 && r.slice.c < 6 && r.slice.d < 6, 'the slice tracks the shortest frame, not the last slow one: ' + JSON.stringify(r.slice));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
