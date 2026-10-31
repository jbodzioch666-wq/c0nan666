// FP-015: through your eyes in a mine the pick is seen to swing at the vein - from the head you looked straight down onto the low vein at
// your feet and the overhead swing came end on, never seen. The eyes stand back a little and above the head while you mine a vein, the
// look is down at it, not straight down, and the pick's head sweeps up and down across the view, in sight as it strikes; the chips are small
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const r0 = await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    let mx=-1, my=-1; for (let x=0;x<OW_COLS && mx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_MINE){ mx=x; my=y; break; }
    if (mx<0) return { nomine:true };
    let at = null;
    for (let k=0;k<6 && !at;k++){ G.gameMode = 0; G.pendingDungeon = { x:mx, y:my }; enterDungeonConfirm(); setUi('playing');
      for (let x=1;x<COLS-1 && !at;x++) for (let y=1;y<ROWS-1 && !at;y++){ const d = G.dungeonDeco[x][y]; if (d && /vein/.test(d)) for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if (!at && tileAt(x+dx, y+dy)===T_FLOOR && !G.dungeonDeco[x+dx][y+dy]) at = { x, y, sx:x+dx, sy:y+dy, d }; } }
    if (!at) return { novein:true };
    const p = G.player; p.x = at.sx; p.y = at.sy; p.facing = 0; G.mon = []; p.tools = Object.assign(p.tools||{}, { pick:1 }); p.skills.mining = Math.max(p.skills.mining||0, 1e6);
    if (!SET.fpView) fpvToggle(); return { at, site:G.siteKind }; });
  A(!r0.nomine && !r0.novein, 'a mine with a vein: ' + JSON.stringify(r0));
  await wait(1200);
  const eye0 = await ev(()=>{ const v = fpwEyeOf(ISO.player); return [v.x, v.y, v.z]; });
  const r1 = await ev(at=>{ const o = skOptions().find(o=>o.k==='mining' && o.cave); if (!o) return { opts:skOptions().map(o=>o.label) }; skDo(o); return { opt:o.label, vein:G.gather && G.gather.o.vein }; }, r0.at);
  A(r1.vein, 'mining the vein: ' + JSON.stringify(r1));
  await wait(1500);   /* (stepped in, turned to it, the eyes eased back) */
  /* a whole swing and a bit, every frame: where the pick's head is in the view */
  const sw = await ev(async ()=>{ const T = THREE, out = { n:0, inView:0, ymin:9, ymax:-9, pitch:[], strike:null, partsR:[], eyeBack:null };
    const g2 = FPW.weaponG.clone(); g2.position.set(0, 0, 0); g2.rotation.set(0, 0, 0); g2.scale.set(1, 1, 1); g2.updateMatrixWorld(true); const box = new T.Box3().setFromObject(g2);
    const top = new T.Vector3(0, box.max.y*0.92, 0); let best = -1;   /* (the tip of the pick, in its own frame)*/
    const v = new T.Vector3(), t0 = performance.now(); let t1 = ISO.player.mineT;
    while (performance.now() - t0 < 1700){ renderGame(); await new Promise(r=>requestAnimationFrame(r));
      FPW.weaponG.updateMatrixWorld(true); v.copy(top).applyMatrix4(FPW.weaponG.matrixWorld);   /* (FPW's scene is the view's own space) */
      const front = v.z < -0.02; v.project(FPW.cam); out.n++; out.pitch.push(+FP.pitch.toFixed(2));
      if (front && Math.abs(v.x) < 1 && Math.abs(v.y) < 1){ out.inView++; out.ymin = Math.min(out.ymin, v.y); out.ymax = Math.max(out.ymax, v.y); }
      const st = mineAnim(ISO.player.mineT||0).strike; if (st > best){ best = st; out.strike = { front, s:+st.toFixed(2), x:+v.x.toFixed(2), y:+v.y.toFixed(2) }; } }
    out.work = FPW.work; out.mineT = +(ISO.player.mineT - t1).toFixed(2);
    out.partsR = FP.parts.map(p=>p.r); const e = ISO.player, ey = fpwEyeOf(e), h = e.rig.head.getWorldPosition(new T.Vector3()), f = e.holder.rotation.y;
    out.eyeBack = +(-(ey.x - h.x)*Math.sin(f) - (ey.z - h.z)*Math.cos(f)).toFixed(2); out.eyeUp = +(ey.y - h.y).toFixed(2); return out; });
  console.log(JSON.stringify(Object.assign({}, sw, { pitch:[Math.min(...sw.pitch), Math.max(...sw.pitch)], partsR:sw.partsR.length ? Math.max(...sw.partsR) : null })));
  A(sw.work==='pick' && sw.mineT > 1.2, 'the pick in your hands, swinging all along: ' + sw.work + ' ' + sw.mineT);
  const pmin = Math.min(...sw.pitch.slice(-20)); A(pmin > -1.05 && pmin < -0.5, 'looking down at the vein, not straight down: ' + pmin);
  A(sw.eyeBack > 0.1 && sw.eyeUp > 0.1, 'the eyes stand back from the head and above it: ' + sw.eyeBack + ' ' + sw.eyeUp);
  A(sw.inView > sw.n*0.3 && sw.ymax - sw.ymin > 0.6, 'the pick\'s head sweeps up and down across the view: ' + JSON.stringify([sw.inView, sw.n, sw.ymin, sw.ymax]));
  A(sw.strike && sw.strike.front && Math.abs(sw.strike.y) < 0.9 && Math.abs(sw.strike.x) < 0.9, 'in sight as it strikes: ' + JSON.stringify(sw.strike));
  A(sw.partsR != null && Math.max(...sw.partsR) < 0.013, 'the chips small: ' + sw.partsR);

  /* done: the eyes go back into the head */
  await ev(()=>{ G.gather = null; }); await wait(1400);
  const back = await ev(()=>{ const e = ISO.player, ey = fpwEyeOf(e), h = e.rig.head.getWorldPosition(new THREE.Vector3()); return { d:+ey.distanceTo(h).toFixed(3), work:FPW.work, wk:FX.wk }; });
  A(back.d < 0.12 && !back.wk, 'mining stopped: the eyes back in the head: ' + JSON.stringify(back));

  /* the overhead view's chips as they were */
  await ev(()=>{ FP.parts = []; fpBurst(1, 1, 0.2, '#c8a060', 20, 1); });
  A(await ev(()=>Math.min(...FP.parts.map(p=>p.r))) >= 0.02, 'a burst\'s own size untouched');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
