// RS-703: a spell leaves the staff as it comes forward. The cast is slower (CAST_RATE, about a second); the bolt waits for the thrust
// (CAST_FIRE) and leaves from the staff's head, its sound with it; the foe flinches only when the bolt lands, and one it kills stands till
// then and falls as it lands. A real cast at a foe three tiles off, sampled every frame
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms)), fr = ()=>new Promise(res=>requestAnimationFrame(res));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; randomEncounter(false); setUi('playing'); window.__corpseTime = true;
    const P = G.player, T = THREE, out = {}; P.hp = P.maxHp = 9999; G.mon = G.mon.filter((m, i)=>i===0); const m = G.mon[0]; m.hp = m.maxHp = 9999; m.atkBonus = -99;
    for (let d=3; d>=1; d--){ m.x = P.x + d; m.y = P.y; for (let x=P.x+1; x<=P.x+d; x++) if (G.map[x][P.y]===T_WALL) G.map[x][P.y] = T_FLOOR; break; }
    G.gear.weapon = rsMakeStaff(1); P.rsSpell = RS_SPELLS.find(s=>rsSpellCombat(s))[0]; skP().skills.magic = SK_XP[99]; for (const k of ['air','mind','water','earth','fire','chaos','death','blood']) skAdd('r_'+k, 500); rsSync && rsSync();
    G.foeInstant = false; for (let i=0;i<40;i++){ renderGame(); await wait(30); }
    const cast = async sure=>{ while (FP.cast > 0) await fr();   /* (a 'spell' sound elsewhere starts a cast pose too - wait it out) */ const t0 = performance.now(), rows = []; { const rr = Math.random; if (sure) Math.random = ()=>0.97; try{ rsCastAt(0, P.rsSpell); } finally { Math.random = rr; } } const s = (ISO.shots||[]).find(q=>q.kind==='spell' && q.fromStaff);
      const e = ISO.player, rg = e.rig, lean = ()=>{ const piv = m3dWpPiv(rg); if (!rg._castTip) return null; piv.updateWorldMatrix(true, false); const h = piv.localToWorld(rg._castTip.clone()), o = piv.getWorldPosition(new T.Vector3()); e.holder.worldToLocal(h); e.holder.worldToLocal(o); return Math.atan2(h.z - o.z, h.y - o.y); };
      while (performance.now() - t0 < 1800){ await fr(); const me = M3D.inst.get(m); rows.push({ ms:performance.now() - t0, cast:FP.cast, st:s ? s.t : null, go:!!(s && s.go), live:!!(s && ISO.shots.includes(s)), flash:FP.monFlash.get(m)||0, lean:lean(), dying:me && me.dying!=null && me.dying >= 0 }); }
      const go = rows.find(q=>q.go), land = rows.find(q=>q.go && !q.live), end = rows.find(q=>q.cast===0);
      return { delay:s ? +(-rows[0].st).toFixed(2) : null, goMs:go && Math.round(go.ms), goU:go && +(1 - go.cast).toFixed(2), goLean:go && go.lean!=null ? +go.lean.toFixed(2) : null, h0:s && s.h0!=null ? +s.h0.toFixed(2) : null,
        landMs:land && Math.round(land.ms), flashBefore:rows.filter(q=>land && q.ms < land.ms - 20).some(q=>q.flash > 0), flashAfter:rows.some(q=>land && q.ms >= land.ms && q.flash > 0), endMs:end && Math.round(end.ms),
        snd:s && s.sndAt ? Math.round(s.sndAt - t0) : null, dyingBefore:rows.filter(q=>land && q.ms < land.ms - 20).some(q=>q.dying), dyingAfter:rows.some(q=>q.dying) }; };
    out.hit = await cast(true); await wait(1200);
    /* a miss: its splash shows as the bolt lands */
    { const rr = Math.random; Math.random = ()=>0.01; const n0 = FP.floats.length; try{ rsCastAt(0, P.rsSpell); } finally { Math.random = rr; } const f = FP.floats.slice(n0).find(q=>q.kind==='block'), s = ISO.shots.find(q=>q.kind==='spell' && q.fromStaff); out.miss = { splat:!!f, wait:f ? +(-f.age).toFixed(2) : null, shot:s ? +(s.dur - s.t).toFixed(2) : null }; }
    await wait(2000);
    m.hp = 1; FP.monHp.set(m, 1); out.kill = await cast(true); out.dead = !m.alive;
    out.castFire = +CAST_FIRE.toFixed(3); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  const h = r.hit;
  A(h.delay > 0.45 && h.goMs > 400, 'the bolt waits for the thrust, about half a second in');
  A(h.goU > 0.4 && h.goU < 0.62 && h.goLean > 0.3, 'it leaves as the staff comes forward - the staff leaning ahead');
  A(h.h0 > 0.65, 'from the staff\'s head, up at the height it is held');
  A(h.snd!=null && Math.abs(h.snd - h.goMs) < 60, 'its sound as it leaves, not before');
  A(!h.flashBefore && h.flashAfter, 'the foe flinches when the bolt lands, not before');
  A(h.endMs > 950, 'the cast is slower - about a second');
  A(r.miss.splat && r.miss.wait > 0.5 && Math.abs(r.miss.wait - r.miss.shot) < 0.02, 'a miss splashes when the bolt lands, not before');
  A(r.dead && !r.kill.dyingBefore && r.kill.dyingAfter, 'a foe the bolt kills stands till it lands, then falls');
  A(r.kill.goLean > 0.3, 'killing it, the staff is still out and comes forward - it was put away as the foe died, before the bolt left');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
