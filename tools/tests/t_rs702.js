// RS-702: casting with a staff flows. The cast is blended in from your guard and back out to it (the staff jumped up as it began and
// dropped back in one frame at its end), its moves are smooth curves (rsCastPose, CAST_KEYS), and the staff is turned in the fist to
// stand upright overhead as it's raised and point ahead at the thrust (it lay flat behind the head). Traces the staff's head through
// a cast at 60 fps, two-handed and one-handed with a tome. Shot: shots/rs702.png (the cast's top and its thrust). Probe zcast shows more
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (const m of G.mon) m.alive = 0; G.mon = []; rsFightNow = ()=>true; PFX.camp = -99; window.__noAutoFreeze = true;   /* (measured from the joints' own turns: a pose run here isn't rendered, so gfxAutoFreeze's frozen joints would read as they last rendered) */
    const T = THREE, out = {}; let R, W, H, sheet, cx;
    for (const tome of [false, true]){
      G.gear.weapon = rsMakeStaff(3); if (tome) G.gear.offhand = rsMakeArmour('cloth', 3, 'offhand'); rsSync && rsSync();
      for (let i=0;i<30;i++){ FP.cast = 0; renderGame(); await wait(20); }
      if (!sheet){ R = FPD.r; W = R.domElement.width; H = R.domElement.height; sheet = document.createElement('canvas'); sheet.width = W; sheet.height = H; cx = sheet.getContext('2d'); }
      const e = ISO.player, rg = e.rig, piv = m3dWpPiv(rg); e.holder.traverse(o=>{ if (o.__afz){ o.__afz = false; o.matrixAutoUpdate = true; } }); e.holder.updateMatrixWorld(true);
      const bx = new T.Box3().setFromObject(rg.weapon), top = piv.worldToLocal(new T.Vector3((bx.min.x + bx.max.x)/2, bx.max.y, (bx.min.z + bx.max.z)/2));
      const pose = c=>{ FP.cast = c; FP.dt = 1/60; isoSyncPlayer(); e.holder.updateMatrixWorld(true); const h = piv.localToWorld(top.clone()), o = piv.getWorldPosition(new T.Vector3()); e.holder.worldToLocal(h); e.holder.worldToLocal(o); return { h, lean:Math.atan2(h.z - o.z, h.y - o.y) }; };
      const tr = []; for (let i=0;i<10;i++) tr.push(pose(0)); const c0 = tr.length; for (let c=1; c>0; c-=1.5/60) tr.push(pose(c)); const c1 = tr.length; for (let i=0;i<10;i++) tr.push(pose(0));
      const sp = []; for (let i=1;i<tr.length;i++) sp.push(tr[i].h.distanceTo(tr[i-1].h)*100); const acc = []; for (let i=1;i<sp.length;i++) acc.push(Math.abs(sp[i] - sp[i-1]));
      const at = u=>tr[c0 + Math.round(u*(c1 - c0))];
      out[(tome ? 'tome' : 'two') + 'S'] = sp.slice(c0 - 3, c0 + 6).map(x=>+x.toFixed(2)); out[(tome ? 'tome' : 'two') + 'I'] = +(e.idleT||0).toFixed(2);
      out[tome ? 'tome' : 'two'] = { twoHand:!!rg.twoHand, start:+Math.max(...sp.slice(c0 - 2, c0 + 2)).toFixed(2), end:+Math.max(...sp.slice(c1 - 3, c1 + 2)).toFixed(2), peak:+Math.max(...sp).toFixed(2), maxAcc:+Math.max(...acc).toFixed(2),
        guardY:+tr[0].h.y.toFixed(2), topY:+at(0.38).h.y.toFixed(2), topLean:+at(0.38).lean.toFixed(2), thrustLean:+at(0.56).lean.toFixed(2), back:+tr[tr.length - 1].h.distanceTo(tr[0].h).toFixed(3) };
      if (!tome){ let k = 0; for (const u of [0.38, 0.56]){ pose(1 - u); const cam = FPD.cam.clone(), y = e.holder.rotation.y + 1.57, P = e.holder.position; cam.fov = 40; cam.aspect = W/H; cam.position.set(P.x + Math.sin(y)*1.6, P.y + 0.55, P.z + Math.cos(y)*1.6); cam.lookAt(P.x, P.y + 0.45, P.z); cam.updateProjectionMatrix(); R.render(FPD.scene, cam);
          const im = new Image(); im.src = R.domElement.toDataURL('image/png'); await new Promise(res=>{ im.onload = res; }); cx.drawImage(im, W/4, H/8, W/2, H*3/4, k*W/2, 0, W/2, H); k++; } }
      pose(0); }
    out.shot = sheet.toDataURL('image/png'); return out; });
  require('fs').writeFileSync(SHOTS + '/rs702.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(r.two.twoHand && !r.tome.twoHand, 'a staff in both hands, then in one with a tome');
  for (const k of ['two', 'tome']){ const q = r[k];
    A(q.start < 0.3*q.peak && q.end < 0.3*q.peak && q.back < 0.01, k + ': the cast eases out of the guard and back into it - no jump as it starts or ends');
    A(q.maxAcc < 0.6*q.peak, k + ': smooth all through - no sudden change of speed');
    A(q.topY > q.guardY + 0.15 && Math.abs(q.topLean) < 0.75, k + ': the staff raised high, standing up overhead, not laid back flat');
    A(q.thrustLean > 0.3, k + ': at the thrust the staff points ahead'); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
