// probe (RS-697): the felling swing, frame by frame. Chops the nearest tree on the land, lets you walk up to it, then holds the swing
// at chosen moments (rsChopPose reads P.e.chopT), each shot from the side through a close camera, as one sheet (shots/zchop.png,
// labelled), then a few blows run for real and a shot of the chips, the notch and the leaves. ZSIDE=-1 shoots from the other side;
// ZD the camera's distance (default 2.2); ZUP its height (default 0.6); ZCAM=front|right|back|left puts the camera that way from the figure, as it faces
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ({ side, dist, up, vw, ang })=>{ const process_env_cam = vw, ANG = ang; const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), wait = ms=>new Promise(res=>setTimeout(res, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4;
    skP().tools.axe = Math.max(1, skP().tools.axe||0); owHunterSpawn = ()=>{}; owHuntersStep = ()=>false;
    let n = null, st = null; for (let rr=1; rr<40 && !n; rr++) for (let i=-rr;i<=rr && !n;i++) for (let j=-rr;j<=rr && !n;j++){ if (Math.max(Math.abs(i), Math.abs(j))!==rr) continue; const q = skNodeAt(G.owPos.x + i, G.owPos.y + j); if (!q || q.k!=='woodcutting' || q.gone || skNodeReq(q) > skLvl('woodcutting')) continue;
      for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]){ const x = q.x + dx, y = q.y + dy; if (o3Passable(x, y) && G.ow.map[x][y]!==OW_WATER && !skNodeAt(x, y)){ n = q; st = [x, y]; break; } } }
    if (!n) return { none:true };
    G.owPos = { x:st[0], y:st[1] }; owReveal(st[0], st[1], 8); await fr(120); skDo(skNodeOption(n)); await wait(1200); if (!G.gather) return { nogather:true };
    const real = skGatherTick; skGatherTick = ()=>{};
    const T = THREE, P = O3.player, e = P.e, PP = O3.ppos.clone(), [sx, sz] = o3C(n.x, n.y), mid = new T.Vector3((PP.x + sx)/2, PP.y + 0.55, (PP.z + sz)/2), dx = sx - PP.x, dz = sz - PP.z, L = Math.hypot(dx, dz) || 1;
    const cam = O3.cam.clone(); cam.fov = 40; const R = O3.renderer, W = R.domElement.width, H = R.domElement.height; cam.aspect = W/H; cam.position.set(mid.x - dz/L*dist*side, mid.y + up, mid.z + dx/L*dist*side); cam.lookAt(mid); cam.updateProjectionMatrix();
    { const vw = process_env_cam; if (vw){ const y = e.holder.rotation.y, f = [Math.sin(y), Math.cos(y)], rt = [-Math.cos(y), Math.sin(y)], k = { front:[1, 0.35], right:[0.25, 1], back:[-1, -0.35], left:[0.35, -1] }[vw] || [1, 0], c = O3.ppos;
        cam.position.set(c.x + (f[0]*k[0] + rt[0]*k[1])*dist, c.y + 0.5 + up, c.z + (f[1]*k[0] + rt[1]*k[1])*dist); cam.lookAt(c.x + f[0]*0.15, c.y + 0.5, c.z + f[1]*0.15); cam.updateProjectionMatrix(); } }
    const plan = [0, 0.15, 0.3, 0.42, 0.5, 0.55, 0.6, 0.65, 0.75, 0.85];
    const sheet = document.createElement('canvas'), cw = 380, ch = Math.round(cw*H/W); sheet.width = cw*5; sheet.height = ch*Math.ceil((plan.length + 3)/5) + ch; const sx2 = sheet.getContext('2d'); sx2.font = 'bold 18px monospace'; sx2.fillStyle = '#fff';
    const frame = ()=>{ const im = new Image(); im.src = R.domElement.toDataURL('image/png'); return new Promise(res=>{ im.onload = ()=>res(im); }); };
    const info = { stand:+Math.hypot(O3.ppos.x - sx, O3.ppos.z - sz).toFixed(3), trunkR:+o3ChopTrunkR(n).toFixed(3), chop:!!O3.chop, key:O3.chopKey }, at = [];
    const put = async (k, lbl)=>{ R.render(O3.scene, cam); const im = await frame(); sx2.drawImage(im, (k % 5)*cw, Math.floor(k/5)*ch, cw, ch); sx2.fillText(lbl, (k % 5)*cw + 8, Math.floor(k/5)*ch + 22); };
    for (let k=0;k<plan.length;k++){ const ph = plan[k];
      for (let f=0; f<2; f++){ e.chopT = ph*CHOP_P + 3*CHOP_P - 0.017; e.chopPh = undefined; await fr(1); }
      const head = new T.Vector3(0, 0.66, 0.1); e.tool.updateWorldMatrix(true, false); e.tool.localToWorld(head); const lh = new T.Vector3(); e.rig.arms[1].hand.getWorldPosition(lh); const butt = e.tool.localToWorld(new T.Vector3(0, -0.06, 0));
      const bh = e.holder.worldToLocal(head.clone()), tl = (pt)=>{ const q = e.tool.worldToLocal(pt); return [+q.y.toFixed(2), +Math.hypot(q.x, q.z).toFixed(3)]; }, Rh = e.rig.arms[0].hand, Lh = e.rig.arms[1].hand;
      const fh = e.holder.worldToLocal(e.tool.localToWorld(new T.Vector3(0, 0.26, 0))), Hp = rsChopPose.Z.H.p;
      at.push(['body', 'fist', [+fh.x.toFixed(3), +fh.y.toFixed(3), +fh.z.toFixed(3)], 'Hp', [+Hp.x.toFixed(3), +Hp.y.toFixed(3), +Hp.z.toFixed(3)], +bh.x.toFixed(2), +bh.y.toFixed(2), +bh.z.toFixed(2), 'R', tl(Rh.localToWorld(new T.Vector3(...m3dGrip(1)))), 'L', tl(Lh.localToWorld(new T.Vector3(-0.026, -0.04, 0)))]);
      const hx = head.x - O3.ppos.x, hz = head.z - O3.ppos.z; at.push([ph, +Math.hypot(head.x - sx, head.z - sz).toFixed(3), +(head.y - O3.ppos.y).toFixed(2), +lh.distanceTo(butt).toFixed(3), 'fwd', +((hx*dx + hz*dz)/L).toFixed(3), 'side', +((hx*dz - hz*dx)/L).toFixed(3)]);
      if (process_env_cam==='hands'){ const y = e.holder.rotation.y, a = new T.Vector3(), b2 = new T.Vector3(); e.rig.arms[0].hand.getWorldPosition(a); e.rig.arms[1].hand.getWorldPosition(b2); a.add(b2).multiplyScalar(0.5);
        cam.position.set(a.x + Math.sin(y + ANG)*dist, a.y + up, a.z + Math.cos(y + ANG)*dist); cam.lookAt(a); cam.updateProjectionMatrix(); }
      await put(k, 'ph ' + ph); }
    info.at = at; { const Ra = e.rig.arms[0], hs = e.holder.getWorldScale(new T.Vector3()).x, m = m3dArmPt(Ra, new T.Vector3()); info.rel = +(e.tool.getWorldScale(new T.Vector3()).x/hs).toFixed(3); info.arm = +((m.E.length() + m.F.length())*Ra.sh.getWorldScale(new T.Vector3()).x/hs).toFixed(3); info.gripOff = +(new T.Vector3(...m3dGrip(1)).length()*Ra.hand.getWorldScale(new T.Vector3()).x/hs).toFixed(3); } { const v = new T.Vector3(); e.rig.arms[0].sh.getWorldPosition(v); e.holder.worldToLocal(v); const w = new T.Vector3(); e.rig.arms[1].sh.getWorldPosition(w); e.holder.worldToLocal(w); const hd = new T.Vector3(); e.rig.head.getWorldPosition(hd); e.holder.worldToLocal(hd); info.shR = [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)]; info.shL = [+w.x.toFixed(3), +w.y.toFixed(3)]; info.holderScale = +e.holder.scale.x.toFixed(3); info.yawOff = +(e.holder.rotation.y - Math.atan2(sx - O3.ppos.x, sz - O3.ppos.z)).toFixed(2); }
    /* a few blows for real */
    e.chopT = 0; await wait(4200); await put(plan.length, 'after 3 blows'); info.hits = O3.chop && O3.chop.hits; info.chips = O3.crig.chips.filter(c=>c.t>=0).length; info.leaves = O3.crig.leaves.filter(c=>c.t>=0).length;
    const c2 = O3.cam.clone(); c2.position.set(PP.x - dx*1.2 - dz/L*0.6, PP.y + 1.1, PP.z - dz*1.2 + dx/L*0.6); c2.lookAt(sx, PP.y + 0.3, sz); c2.updateProjectionMatrix(); R.render(O3.scene, c2); { const im = await frame(); sx2.drawImage(im, ((plan.length + 1) % 5)*cw, Math.floor((plan.length + 1)/5)*ch, cw, ch); sx2.fillText('from behind', ((plan.length + 1) % 5)*cw + 8, Math.floor((plan.length + 1)/5)*ch + 22); }
    { for (let f=0; f<2; f++){ e.chopT = CHOP_HIT*CHOP_P + 3*CHOP_P; e.chopPh = undefined; await fr(1); } const c3 = O3.cam.clone(); c3.position.set(mid.x, PP.y + 2.2, mid.z + 0.001); c3.lookAt(mid.x, PP.y, mid.z); c3.updateProjectionMatrix(); R.render(O3.scene, c3); const im = await frame(); const k = plan.length + 2; sx2.drawImage(im, (k % 5)*cw, Math.floor(k/5)*ch, cw, ch); sx2.fillText('top, the blow', (k % 5)*cw + 8, Math.floor(k/5)*ch + 22); }
    { const gp = [0.2, 0.42, 0.55, 0.6, 0.68]; for (let k=0;k<gp.length;k++){ for (let f=0; f<2; f++){ e.chopT = gp[k]*CHOP_P + 3*CHOP_P - 0.017; e.chopPh = undefined; await fr(1); }
        R.render(O3.scene, O3.cam); const v = O3.ppos.clone(); v.y += 0.5; v.project(O3.cam); const px = (v.x + 1)/2*W, py = (1 - v.y)/2*H, cwW = W*0.22, chH = cwW*ch/cw; const im = await frame();
        const y0 = Math.ceil((plan.length + 3)/5)*ch; sx2.drawImage(im, px - cwW/2, py - chH/2, cwW, chH, k*cw, y0, cw, ch); sx2.fillText('game ' + gp[k], k*cw + 8, y0 + 22); } }
    skGatherTick = real;
    return { n:{ x:n.x, y:n.y, type:n.type }, info, sheet:sheet.toDataURL('image/png') }; }, { side:+(process.env.ZSIDE || 1), dist:+(process.env.ZD || 2.2), up:+(process.env.ZUP || 0.6), vw:process.env.ZCAM || '', ang:+(process.env.ZANG || 0.9) });
  if (r.sheet) fs.writeFileSync(SHOTS + '/zchop.png', Buffer.from(r.sheet.split(',')[1], 'base64')); delete r.sheet;
  console.log(JSON.stringify(r)); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
