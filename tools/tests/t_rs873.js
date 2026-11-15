// RS-873/874: the werewolf is a man until you come in sight - a bearded woodsman with yellow eyes - and on its turn within five steps (or
// once hurt) it changes: a howl, a burst of fur, and the model swaps to the werewolf (m3dWerewolf: sculpted, hunched, a wolf's head,
// long clawed arms, digitigrade legs, strand-card fur), growing into it. The bestiary shows the wolf.
// Shots: shots/rs873-man.png, rs873-change.png, rs873-wolf.png, rs873-swipe.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999;
    let dg = null; for (let x=0;x<OW_COLS && !dg;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dg = [x, y]; break; }
    G.gameMode = 0; G.owPos = { x:dg[0], y:dg[1] }; G.pendingDungeon = { x:dg[0], y:dg[1] }; enterDungeonConfirm(); setUi('playing'); G.mon = []; for (let i=0;i<10;i++){ renderGame(); await wait(30); }
    const out = {}; let best = null; for (let x=3;x<COLS-8 && !best;x++) for (let y=3;y<ROWS-4;y++){ let ok = true; for (let i=-1;i<=4 && ok;i++) for (let j=-1;j<=1;j++) if (G.map[x+i][y+j]!==T_FLOOR){ ok = false; break; } if (ok){ best = [x, y]; break; } }
    out.room = !!best; if (!best) return out; G.player.x = best[0]; G.player.y = best[1]; try{ computeDungeonVisible(); }catch(e){}
    const mk = (dx, hurt)=>({ nm:'werewolf', alive:true, hp:hurt ? 40 : 60, maxHp:60, x:best[0] + dx, y:best[1], sym:'W', col:'#a08060', cb:61, ac:12, atkBonus:5, dmg1:2, dmg2:8, xp:50, abilities:[] });
    const w = mk(4); let far = null; for (let x=0;x<COLS && !far;x++) for (let y=0;y<ROWS;y++){ const d = Math.abs(x - best[0]) + Math.abs(y - best[1]); if (G.map[x][y]===T_FLOOR && d >= 6 && d <= 7){ far = [x, y]; break; } } window.__far = far; G.mon = [w];   /* (first stood in view, a man, for the shot; then sent off out of reach) */ ISO.dist = 5.5;
    out.manPt = (m3dPortrait(w) || {}).paint===mpHumanoid; out.bestiary = !!(m3dPortrait({ nm:'werewolf' }).o || {}).were;
    for (let i=0;i<30;i++){ renderGame(); await wait(30); } const e0 = M3D.inst.get(w); out.manModel = !!(e0 && e0.pt.paint===mpHumanoid);
    return Object.assign(out, { best }); });
  console.log(JSON.stringify(r)); A(r.room, 'a room', r); await page.screenshot({ path:SHOTS + '/rs873-man.png' });
  const r2 = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)), w = G.mon[0], out = {}; w.x = window.__far[0]; w.y = window.__far[1];
    tickMonsters(); out.stillMan = !w.wolf;   /* (six or seven steps off: a man still - he walks toward you) */ out.d0 = Math.abs(w.x - G.player.x) + Math.abs(w.y - G.player.y);
    w.x = G.player.x + 4; w.y = G.player.y; tickMonsters(); out.wolf = !!w.wolf; out.at = w.x - G.player.x;   /* (four steps, in sight: he changes, and that's his turn) */
    const lg = document.body.innerText; out.said = /werewolf!/.test(lg);
    renderGame(); renderGame(); const e = M3D.inst.get(w); out.wolfModel = !!(e && e.pt.o && e.pt.o.were); out.midScale = e ? +(e.holder.scale.x/(e.wwS || 1)).toFixed(2) : null;
    return out; });
  console.log(JSON.stringify(r2)); await page.screenshot({ path:SHOTS + '/rs873-change.png' });
  const r3 = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)), w = G.mon[0], out = {}; for (let i=0;i<40;i++){ renderGame(); await wait(30); }
    const e = M3D.inst.get(w); out.grown = e ? +(e.holder.scale.x/(e.wwS || 1)).toFixed(2) : null; out.H = e ? +e.H.toFixed(2) : null; let draws = 0; e.holder.traverse(o=>{ if (o.isMesh && o.visible) draws++; }); out.draws = draws;
    /* the fur cards follow the body: every card mesh's bound centre lies within the figure's reach */
    e.holder.updateMatrixWorld(true); const hb = new THREE.Box3().setFromObject(e.holder), c = new THREE.Vector3(); out.span = +(hb.max.y - hb.min.y).toFixed(2); out.far = 0;
    e.holder.traverse(o=>{ if (o.isMesh && o.material && o.material.userData.special==='hairCard'){ o.geometry.computeBoundingSphere(); c.copy(o.geometry.boundingSphere.center).applyMatrix4(o.matrixWorld); const d = Math.hypot(c.x - e.holder.position.x, c.z - e.holder.position.z); out.far = Math.max(out.far, +d.toFixed(2)); } });
    const w2 = Object.assign({}, w, { wolf:0, hp:40, x:1, y:1, _ai:null }); G.mon.push(w2); tickMonsters(); out.hurtChanged = !!w2.wolf; G.mon.pop();
    return out; });
  console.log(JSON.stringify(r3)); await page.screenshot({ path:SHOTS + '/rs873-wolf.png' });
  await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)), w = G.mon[0]; w.x = G.player.x + 1; for (let i=0;i<14;i++){ renderGame(); await wait(30); } const e = M3D.inst.get(w); for (let i=0;i<6;i++){ e.atk = performance.now() - 150; renderGame(); await wait(16); } });
  await page.screenshot({ path:SHOTS + '/rs873-swipe.png' });
  /* (RS-874) the coat: shells over the skin, one instanced draw a part, and a hit, a death and its fall don't trip on them */
  const r4 = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)), w = G.mon[0], e = M3D.inst.get(w), out = { shells:0, shellTris:0 };
    e.holder.traverse(o=>{ if (o.isInstancedMesh && o.name==='furShell'){ out.shells++; out.shellTris += o.geometry.index.count/3*o.count; out.keep = !!o.material.onBeforeCompile && o.material.userData.special==='furShell'; } });
    out.shellTris = Math.round(out.shellTris);
    /* (RS-875) its hands palm down, claws forward */ { const t = m3dInstance({ nm:'werewolf' }, m3dPortrait({ nm:'werewolf' })); t.anim(t.rig, 1, 0, 0, 0, 0, t); t.holder.updateMatrixWorld(true);
      out.palms = t.rig.arms.map(A=>{ const M = new THREE.Matrix3().setFromMatrix4(A.hd.matrixWorld), v = new THREE.Vector3(0, 0, 1).applyMatrix3(M).normalize(); return +v.y.toFixed(2); }); } e.flash = performance.now(); for (let i=0;i<4;i++){ renderGame(); await wait(30); }
    w.alive = 0; m3dKill(w, { dmg:30, maxHp:60, kind:'melee' }); for (let i=0;i<40;i++){ renderGame(); await wait(30); } return out; });
  console.log(JSON.stringify(r4)); await page.screenshot({ path:SHOTS + '/rs873-dead.png' });
  A(r4.palms.every(y=>y < -0.6), 'palms down', r4); A(r4.shells >= 15 && r4.keep, 'a coat of shells, its shader kept in the copy', r4); A(r4.shellTris < 1500000, 'the shells kept light: ' + r4.shellTris, r4);
  A(r.manPt && r.manModel, 'a werewolf met in the flesh walks as a man', r); A(r.bestiary, 'the bestiary shows the wolf', r);
  A(r2.stillMan, 'out of reach he is still a man', r2); A(r2.wolf && r2.at===4, 'within sight he changes, and stays where he was', r2); A(r2.said, 'the change is told', r2);
  A(r2.wolfModel, 'the model swaps to the werewolf', r2); A(r2.midScale < 0.97, 'he grows into it', r2);
  A(r3.grown===1, 'grown to full size', r3); A(r3.H > 0.9, 'a head taller than a man', r3); A(r3.draws <= 40, 'few draws: ' + r3.draws, r3); A(r3.far < r3.span*0.6, 'the fur stays on the body', r3);
  A(r3.hurtChanged, 'hurt from afar, he changes too', r3);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
