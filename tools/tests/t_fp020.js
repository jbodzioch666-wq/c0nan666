// FP-020: the arms through your eyes as a sculpted model (SET.fpArms 'model', a test against the drawn ones - 'drawn' the default): in a
// fight with a sword and a kite shield the model is drawn in place of the drawn hands and arms, its right hand where the drawn one is and
// closed round the hilt (its fingers' middle on the hilt's axis), its forearm from the figure's elbow, shown on the screen; bare fists
// in a fight have their knuckles on along the forearm; back to 'drawn' and the drawn ones are back
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  A(await ev(()=>SET.fpArms==='drawn'), 'the drawn arms by default');
  await ev(()=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y) && !(G.dungeonDeco && G.dungeonDeco[x] && G.dungeonDeco[x][y]); let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f]; let good = true; for (let k=0; k<=4 && good; k++) good = ok(x+F[0]*k, y+F[1]*k);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; G.mon.forEach(m=>{ m.alive = 0; });
    const F = FACING_VECT[p.facing], m = newMonster(); G.mon.push(m); Object.assign(m, { alive:1, x:p.x + F[0], y:p.y + F[1], hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin', col:'#8f8', art:null, abilities:[], speed:0, stunTurns:99 });
    G.gear.weapon = rsMakeWeapon(3, 2); G.gear.weapon.used = true; G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); G.gear.offhand.used = true; FPW.wkey = ''; if (!SET.fpView) fpvToggle();
    SET.fpArms = 'model'; ISO.fighting = m; rsFightNow = ()=>G.ui==='playing'; });
  await wait(1500);
  const look = ()=>ev(()=>{ const T = THREE, m = FPA.mesh, b = m && m.skeleton.bones, hs = FPW.mir.hands, P = M=>new T.Vector3().setFromMatrixPosition(M), out = { vis:!!(m && m.visible), drawn:hs.map(h=>h.visible), arms:FPW.arms.some(a=>a.g.visible || a.up.visible), style:FPW.style };
    if (!m) return out;
    const k = new T.Vector3().setFromMatrixColumn(hs[0].matrixWorld, 1).length(), inv = new T.Matrix4().copy(hs[0].matrixWorld).invert();
    out.dHand = +(P(b[2].matrixWorld).distanceTo(P(hs[0].matrixWorld))/k).toFixed(3);   /* (in the drawn hand's own units: about 0.1 its size) */
    const ring = new T.Vector3(); for (let j=3;j<19;j++) ring.add(P(b[j].matrixWorld).multiplyScalar(1/16)); ring.applyMatrix4(inv); out.ringAxis = +Math.hypot(ring.x, ring.z).toFixed(3);   /* (the four fingers' joints round the grip's axis, +y of the drawn hand) */
    const e = fpwWorker(), V = fpwMirrorCam().matrixWorldInverse, E = e.rig.arms[0].el.getWorldPosition(new T.Vector3()).applyMatrix4(V); out.dElbow = +(P(b[1].matrixWorld).distanceTo(E)/k).toFixed(3);
    const W = P(b[2].matrixWorld), kn = new T.Vector3(); for (const j of [3, 7, 11, 15]) kn.add(P(b[j].matrixWorld).multiplyScalar(0.25)); const rg = new T.Vector3(); for (let j=3;j<19;j++) rg.add(P(b[j].matrixWorld).multiplyScalar(1/16));
    out.knuckleVsForearm = +(kn.sub(rg).normalize().angleTo(W.clone().sub(E).normalize())*180/Math.PI).toFixed(0);
    /* on the screen: the drawn canvas's pixel where the model's hand is */
    const v = W.clone().project(FPW.cam), c = document.createElement('canvas'); c.width = FPW.cv.width; c.height = FPW.cv.height; const x = c.getContext('2d'); FPW.r.render(FPW.scene, FPW.cam); x.drawImage(FPW.cv, 0, 0);
    const px = Math.round((v.x*0.5 + 0.5)*c.width), py = Math.round((-v.y*0.5 + 0.5)*c.height); let a = 0; for (let dx=-6; dx<=6; dx+=3) for (let dy=-6; dy<=6; dy+=3){ const d = x.getImageData(Math.min(c.width-1, Math.max(0, px+dx)), Math.min(c.height-1, Math.max(0, py+dy)), 1, 1).data; a = Math.max(a, d[3]); }
    out.onScreen = v.x > -1 && v.x < 1 && v.y > -1 && v.y < 1; out.alpha = a; return out; });
  const s1 = await look();
  A(s1.vis && s1.drawn.every(v=>!v) && !s1.arms, 'the model in place of the drawn hands and arms: ' + JSON.stringify(s1));
  A(s1.dHand < 0.15, 'its hand where the drawn hand is: ' + JSON.stringify(s1));
  A(s1.ringAxis < 0.02, 'closed round the hilt - its fingers round the grip\'s axis: ' + JSON.stringify(s1));
  A(s1.dElbow < 0.01, 'its forearm from the figure\'s elbow: ' + JSON.stringify(s1));
  A(!s1.onScreen || s1.alpha > 200, 'drawn on the screen: ' + JSON.stringify(s1));
  /* bare fists in a fight: a boxer's guard, the knuckles on along the forearm */
  await ev(()=>{ G.gear.weapon = newItem(); G.gear.offhand = newItem(); FPW.wkey = ''; }); await wait(1500);
  const s2 = await look();
  A(s2.vis && s2.style==='fists' && s2.knuckleVsForearm < 40, 'bare fists knuckles along the forearm: ' + JSON.stringify(s2));
  A(s2.onScreen && s2.alpha > 200, 'the fists in sight: ' + JSON.stringify(s2));
  /* back to the drawn arms */
  await ev(()=>{ SET.fpArms = 'drawn'; }); await wait(600);
  const s3 = await look();
  A(!s3.vis && s3.drawn.every(v=>v), 'the drawn ones back: ' + JSON.stringify(s3));
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
