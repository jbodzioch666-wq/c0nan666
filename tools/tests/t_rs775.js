// RS-775: mining. The pick swung in both hands, overhead and down onto the rock: raised back over the right shoulder, the body bending
// into the blow, the point biting the rock's near shoulder, a jar and a pry, and back. You step in to the rock (a pick's reach from it);
// each blow throws chips of stone and ore that land and lie, a puff of dust and sparks off hard stone, and sounds audMineHit (a chink,
// the head ringing, a thud, grit) - the old gathering tick kept quiet while blows sound. The pick remade: one curved forged head.
// Below ground the same swing at a vein, stepped in to it. Shots: shots/rs775-*.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 300)); });
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), wait = ms=>new Promise(res=>setTimeout(res, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4;
    skP().tools.pick = Math.max(1, skP().tools.pick||0); owHunterSpawn = ()=>{}; owHuntersStep = ()=>false;
    let n = null, st = null; for (let rr=1; rr<60 && !n; rr++) for (let i=-rr;i<=rr && !n;i++) for (let j=-rr;j<=rr && !n;j++){ if (Math.max(Math.abs(i), Math.abs(j))!==rr) continue; const q = skNodeAt(G.owPos.x + i, G.owPos.y + j); if (!q || q.k!=='mining' || q.gone || skNodeReq(q) > skLvl('mining') || mineKind(q.type)!=='hard') continue;
      for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]){ const x = q.x + dx, y = q.y + dy; if (o3Passable(x, y) && G.ow.map[x][y]!==OW_WATER && !skNodeAt(x, y)){ n = q; st = [x, y]; break; } } }
    if (!n) return { none:true };
    G.owPos = { x:st[0], y:st[1] }; owReveal(st[0], st[1], 8); await fr(120);
    const out = { type:n.type }, T = THREE, [sx, sz] = o3C(n.x, n.y), [hx, hz] = o3C(st[0], st[1]), P = O3.player, e = P.e, rock = v=>Math.hypot(v.x - sx, v.z - sz);
    let blows = [], ticks = 0; const realHit = audMineHit; audMineHit = k=>{ blows.push(k); try{ realHit(k); }catch(err){} }; const realSk = audSkill; audSkill = k=>{ if (k==='mining') ticks++; return realSk(k); };
    const real = skGatherTick; skGatherTick = ()=>{};
    skDo(skNodeOption(n)); await wait(1200);
    out.gather = !!G.gather; out.stand = +rock(O3.ppos).toFixed(3); out.want = +(o3MineRock(n).r + MINE_REACH).toFixed(3); out.tile = +Math.hypot(hx - sx, hz - sz).toFixed(3);
    /* the pick: its head one curved piece, many-sided */
    { let v = 0; e.tool.traverse(o=>{ if (o.isMesh && o.geometry===pickHeadGeo.g) v = o.geometry.attributes.position.count; }); out.headVerts = v; }
    /* the swing, held at moments of it: where the point is, how the body leans */
    const pt = ()=>{ const a = new T.Vector3(0, 0.66 + 0.37*(Math.cos(0.62) - 1), 0.37*Math.sin(0.62)); e.tool.updateWorldMatrix(true, false); return e.tool.localToWorld(a); };
    const hold = async ph=>{ for (let f=0, ok=0; f<120 && ok<2; f++){ e.mineT = ph*MINE_P + 3*MINE_P - 0.017; e.minePh = undefined; await fr(1); if (e.minePh!==undefined) ok++; }   /* (posed twice running - not while still walking up) */
      const p = pt(), ma = o3MineAim(), hb = e.holder.worldToLocal(p.clone()), [R, L] = e.rig.arms;
      const on = q=>{ const l = e.tool.worldToLocal(q); return +Math.hypot(l.x, l.z).toFixed(3); };   /* (a fist's distance off the haft's line) */
      return { tipY:+(p.y - O3.ppos.y).toFixed(2), tipAim:+p.distanceTo(ma.c).toFixed(3), fwd:+hb.z.toFixed(2), bend:+e.rig.torso.rotation.x.toFixed(2),
        right:on(R.hand.localToWorld(new T.Vector3(...m3dGrip(1)))), left:on(L.hand.localToWorld(new T.Vector3(-(e.rig.gripX || 0.026), -0.045, 0.004)))}; };
    out.ready = await hold(0.02); out.raised = await hold(0.42); out.blow = await hold(MINE_HIT + 0.005); out.pry = await hold(0.7);
    const shot = (name, yaw, up, d)=>{ const c2 = O3.cam.clone(), y = e.holder.rotation.y + yaw, a = new T.Vector3(); e.holder.getWorldPosition(a); a.y += 0.45; c2.position.set(a.x + Math.sin(y)*d, a.y + up, a.z + Math.cos(y)*d); c2.lookAt(a); c2.updateProjectionMatrix(); O3.renderer.render(O3.scene, c2); out['shot_' + name] = O3.renderer.domElement.toDataURL('image/png'); };
    await hold(0.42); shot('raised', -1.6, 0.5, 2.6); await hold(MINE_HIT + 0.005); shot('blow', -1.6, 0.4, 2.2); shot('blow2', -0.7, 0.5, 1.5);
    { const c2 = O3.cam.clone(), a = e.tool.localToWorld(new T.Vector3(0, 0.6, 0)); c2.position.set(a.x + 0.35, a.y + 0.15, a.z + 0.35); c2.lookAt(a); c2.updateProjectionMatrix(); O3.renderer.render(O3.scene, c2); out.shot_pick = O3.renderer.domElement.toDataURL('image/png'); }
    /* real blows */
    e.mineT = 0; e.minePh = undefined; blows = []; let chips = 0, sparks = 0, dust = 0; const t0 = performance.now();
    while (performance.now() - t0 < 3000){ await fr(1); const R0 = O3.mrig; chips = Math.max(chips, R0.chips.filter(c=>c.t>=0).length); sparks = Math.max(sparks, R0.sparks.filter(c=>c.t>=0).length); dust = Math.max(dust, R0.dust.filter(c=>c.t>=0).length); }
    out.blows = blows.slice(); out.chips = chips; out.sparks = sparks; out.dust = dust;
    out.chipsDown = O3.mrig.chips.filter(c=>c.t > 1.2).every(c=>Math.abs(c.m.position.y - c.b*0.5 - O3.heightAt(c.m.position.x, c.m.position.z)) < 0.02);
    /* the gathering tick stays quiet while blows sound */
    skGatherTick = real; ticks = 0; G.gather.next = 0; skGatherTick(performance.now()); out.ticksWhileBlows = ticks; G._mineBlowAt = 0; G.gather.next = 0; skGatherTick(performance.now()); out.ticksQuiet = ticks;
    /* stopping: back to your tile, the wrist straight */
    skStop(); await wait(900); out.stopped = { home:+Math.hypot(O3.ppos.x - hx, O3.ppos.z - hz).toFixed(3), mineT:e.mineT };
    /* below ground: the same swing at a vein, a step in to it */
    { const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.player.hp = G.player.maxHp = 99999;
      const p = G.player; let spot = null, vein = null; for (let x=2;x<COLS-2 && !spot;x++) for (let y=2;y<ROWS-2 && !spot;y++){ if (G.dungeonDeco[x][y]!=='ore') continue; for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) if (G.map[x+dx][y+dy]===T_FLOOR && !G.dungeonDeco[x+dx][y+dy]){ spot = { x:x+dx, y:y+dy }; vein = { x, y }; break; } }
      if (!spot){ for (let x=2;x<COLS-3 && !spot;x++) for (let y=2;y<ROWS-2 && !spot;y++){ let ok = true; for (let i=-1;i<=2;i++) for (let j=-1;j<=1;j++) if (G.map[x+i][y+j]!==T_FLOOR || G.dungeonDeco[x+i][y+j]) ok = false; if (ok){ spot = { x, y }; vein = { x:x+1, y }; G.dungeonDeco[x+1][y] = 'ore'; } } }   /* (no vein with room beside it: one laid) */
      out.dgVein = vein;
      for (const m of G.mon) m.alive = false; p.x = spot.x; p.y = spot.y; await fr(30);
      let bursts = 0; const rb = fpBurst; fpBurst = (...a)=>{ bursts++; return rb(...a); }; blows = [];
      skGatherTick = ()=>{}; skP().skills.mining = 2e7; skP().tools.pick = 8; skDo(skOptions().find(o=>o.k==='mining' && o.vein && o.vein.x===vein.x && o.vein.y===vein.y)); const de = ISO.player; de.mineT = 0; de.minePh = undefined;
      const t1 = performance.now(); while (performance.now() - t1 < 30000 && (de.mineT||0) < 2.6){ await fr(1); }
      out.dg = { blows:blows.length, bursts, step:+(de.mineStep||0).toFixed(3), want:+(1 - 0.24 - MINE_REACH).toFixed(3) };
      de.mineT = MINE_HIT*MINE_P + 3*MINE_P + 0.003; de.minePh = undefined; G.__hold = 1; await fr(1);
      { const c2 = new T.PerspectiveCamera(40, 1.5, 0.05, 50), a = de.holder.position.clone(); a.y = 0.4; const cam = ISO.cam || FPD.cam; c2.position.set(a.x + 0.3, 1.2, a.z + 1.8); c2.lookAt(a.x + 0.4, 0.3, a.z); try{ FPD.r.render(FPD.scene, c2); out.shot_dg = FPD.r.domElement.toDataURL('image/png'); }catch(err){ out.dgShotErr = String(err).slice(0, 120); } }
      fpBurst = rb; G.gather = null; skGatherTick = real; }
    audMineHit = realHit; audSkill = realSk;
    return out; });
  for (const k of Object.keys(r)) if (k.startsWith('shot_') && r[k]){ require('fs').writeFileSync(SHOTS + '/rs775-' + k.slice(5) + '.png', Buffer.from(r[k].split(',')[1], 'base64')); r[k] = true; }
  console.log(JSON.stringify(r));
  if (errs.length) console.log('ERRS ' + errs.join(' | '));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(!r.none && r.gather, 'mining a rock on the land');
  A(Math.abs(r.stand - r.want) < 0.05 && r.stand < r.tile - 0.2, 'walked up to the rock, a pick\'s reach from it');
  A(r.headVerts >= 300, 'the pick\'s head one smooth curved piece: ' + r.headVerts);
  A(r.raised.tipY > 1.0 && r.raised.bend < r.ready.bend, 'raised: the pick up over the head, the body arched back');
  A(r.blow.tipAim < 0.1, 'the blow: the point on the rock\'s near shoulder: ' + r.blow.tipAim);
  A(r.blow.bend > r.ready.bend + 0.25, 'bent into the blow');
  A(r.blow.right < 0.06 && r.blow.left < 0.06 && r.raised.right < 0.06 && r.raised.left < 0.06, 'both fists on the haft');
  A(r.blows.length >= 2 && r.blows.every(k=>k==='hard'), 'blows sounded, a hard rock\'s: ' + r.blows);
  A(r.chips >= 5 && r.sparks >= 3 && r.dust >= 1 && r.chipsDown, 'chips fly and lie, sparks and dust');
  A(r.ticksWhileBlows===0 && r.ticksQuiet===1, 'the old tick quiet while blows sound');
  A(r.stopped.home < 0.05 && r.stopped.mineT==null, 'stopping: back to your tile');
  A(r.dg.blows >= 1 && r.dg.bursts >= 2 && Math.abs(r.dg.step - r.dg.want) < 0.05, 'below ground: stepped in to the vein, blows, chips: ' + JSON.stringify(r.dg));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
