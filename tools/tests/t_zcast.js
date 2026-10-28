// probe (RS-702): the spell cast with a staff, frame by frame. Holds FP.cast at moments through the cast in a dungeon and shoots the
// figure from the side and the front (shots/zcast.png), and traces the staff's head through the whole cast (and a moment either side):
// its speed each step and the biggest jump in speed - a snap shows as a spike. ZTOME=1 carries a tome; ZD camera distance
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ({ tome, dist })=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (const m of G.mon) m.alive = 0; G.mon = [];
    G.gear.weapon = rsMakeStaff(3); if (tome) G.gear.offhand = rsMakeArmour('cloth', 3, 'offhand'); rsSync && rsSync(); rsFightNow = ()=>true; PFX.camp = -99; window.__noAutoFreeze = true;   /* (measured from the joints' own turns: a pose run here isn't rendered, so gfxAutoFreeze's frozen joints would read as they last rendered) */
    for (let i=0;i<40;i++){ renderGame(); await wait(20); }
    ISO.player.holder.traverse(o=>{ if (o.__afz){ o.__afz = false; o.matrixAutoUpdate = true; } }); const T = THREE, e = ISO.player, rg = e.rig, out = { wk:rg.wk, twoHand:!!rg.twoHand, grip2:!!rg.grip2, look:rsPlayerLook().o.weapon, key:ISO.lookKey };
    const piv = m3dWpPiv(rg); e.holder.updateMatrixWorld(true); const bx = new T.Box3().setFromObject(rg.weapon), top = piv.worldToLocal(new T.Vector3((bx.min.x + bx.max.x)/2, bx.max.y, (bx.min.z + bx.max.z)/2)), hd = [piv, top.x, top.y, top.z];
    const pose = c=>{ FP.cast = c; FP.dt = 1/60; isoSyncPlayer(); e.holder.updateMatrixWorld(true); const v = new T.Vector3(hd[1], hd[2], hd[3]); hd[0].localToWorld(v); return e.holder.worldToLocal(v); };
    /* trace: 30 frames of rest, the cast at 60 fps (FP.cast falls CAST_RATE a second), 30 frames after */
    const tr = []; for (let i=0;i<20;i++) tr.push(pose(0)); for (let c=1; c>0; c-=CAST_RATE/60) tr.push(pose(c)); for (let i=0;i<20;i++) tr.push(pose(0));
    const sp = []; for (let i=1;i<tr.length;i++) sp.push(tr[i].distanceTo(tr[i-1]));
    const acc = []; for (let i=1;i<sp.length;i++) acc.push(Math.abs(sp[i] - sp[i-1]));
    out.speed = sp.map(x=>+(x*100).toFixed(1)); out.maxAcc = +(Math.max(...acc)*100).toFixed(2); out.maxAt = acc.indexOf(Math.max(...acc)) + 1; out.n = tr.length;
    out.path = tr.filter((_, i)=>i % 4===0).map(v=>[+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)]);
    /* the sheet */
    const R = FPD.r, W = R.domElement.width, H = R.domElement.height, plan = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], cw = 300, ch = Math.round(cw*H/W);
    const sheet = document.createElement('canvas'); sheet.width = cw*5; sheet.height = ch*4; const c = sheet.getContext('2d'); c.font = 'bold 16px monospace'; c.fillStyle = '#fff';
    let k = 0; for (const vw of [1.57, 0.5]) for (const u of plan){ pose(Math.max(0.0001, 1 - u)); if (vw > 1){ const hv = new T.Vector3(hd[1], hd[2], hd[3]); piv.localToWorld(hv); const pv = piv.getWorldPosition(new T.Vector3()); e.holder.worldToLocal(hv); e.holder.worldToLocal(pv); const ax = hv.sub(pv).normalize(); (out.ax = out.ax || []).push([u, +(Math.acos(ax.y)*57.3).toFixed(0), +ax.z.toFixed(2), 'hand', +rg.arms[0].hand.rotation.x.toFixed(2), +rg.arms[0].hand.rotation.y.toFixed(2), +rg.arms[0].hand.rotation.z.toFixed(2), 'sh', +rg.arms[0].sh.rotation.x.toFixed(2), +rg.arms[0].sh.rotation.y.toFixed(2), +rg.arms[0].sh.rotation.z.toFixed(2), +rg.arms[0].el.rotation.x.toFixed(2), 'piv', +piv.rotation.x.toFixed(2), +piv.rotation.y.toFixed(2), +piv.rotation.z.toFixed(2)]); } const cam = FPD.cam.clone(), y = e.holder.rotation.y + vw, P = e.holder.position, hs = e.holder.scale.x;
        cam.fov = 40; cam.position.set(P.x + Math.sin(y)*dist, P.y + 0.55, P.z + Math.cos(y)*dist); cam.lookAt(P.x, P.y + 0.45, P.z); cam.aspect = W/H; cam.updateProjectionMatrix(); R.render(FPD.scene, cam);
        const im = new Image(); im.src = R.domElement.toDataURL('image/png'); await new Promise(res=>{ im.onload = res; }); c.drawImage(im, (k % 5)*cw, Math.floor(k/5)*ch, cw, ch); c.fillText((vw > 1 ? 'side ' : 'front ') + u, (k % 5)*cw + 6, Math.floor(k/5)*ch + 18); k++; }
    out.sheet = sheet.toDataURL('image/png'); return out; }, { tome:!!process.env.ZTOME, dist:+(process.env.ZD || 1.6) });
  if (r.sheet) fs.writeFileSync(SHOTS + '/zcast.png', Buffer.from(r.sheet.split(',')[1], 'base64')); delete r.sheet;
  console.log(JSON.stringify(r)); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
