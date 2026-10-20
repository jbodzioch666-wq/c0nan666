// (art probe, not in ALL) the mage kit's staff in the right fist, close up from three sides: shots/zstaff-<ZTAG>.png; and the tome
// with your emblem, shut and open: shots/ztome-<ZTAG>.png. Prints where the staff's shaft passes the palm
const fs = require('fs');
module.exports = async page=>{
  if (process.env.ZDX || process.env.ZDY) await page.evaluate(([x, y])=>{ if (x!=='') window.__staffDX = +x; if (y!=='') window.__staffDY = +y; }, [process.env.ZDX||'', process.env.ZDY||'']);
  if (process.env.ZNOSKIN) await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); });
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const T = THREE, out = {};
    const shot = (e, focus, dirs, W, H)=>{ const cv = document.createElement('canvas'); cv.width = W*dirs.length; cv.height = H; const ctx = cv.getContext('2d');
      const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const r = gfxThreeR(new T.WebGLRenderer({ canvas:c2, antialias:true, preserveDrawingBuffer:true }));
      const sc = new T.Scene(); sc.background = new T.Color(0x2a2620); sc.add(new T.HemisphereLight(0xffffff, 0x404040, 1.1)); const d = new T.DirectionalLight(0xffffff, 1.3); d.position.set(1, 2, 2); sc.add(d); sc.add(e.holder);
      e.holder.updateMatrixWorld(true); const c = focus.getWorldPosition(new T.Vector3());
      dirs.forEach((dv, i)=>{ const cam = new T.PerspectiveCamera(30, W/H, 0.001, 20); cam.position.copy(c).add(new T.Vector3(...dv)); cam.lookAt(c); r.render(sc, cam); ctx.drawImage(c2, i*W, 0); });
      r.dispose(); return cv.toDataURL('image/png'); };
    /* the staff */
    const pt = rsPlayerLook(), e = m3dInstance({}, pt), rg = e.rig; m3dPoseHumanoid(rg, 0, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
    const hand = rg.arms[0].hand, s = e.holder.scale.x || 1; out.wk = rg.wk;
    if (rg.weapon){ const bb = new T.Box3().setFromObject(rg.weapon), hp = hand.getWorldPosition(new T.Vector3()); out.staffH = +(bb.max.y - bb.min.y).toFixed(3);
      const piv = rg.weapon.parent, ax = new T.Vector3(0, 1, 0).applyQuaternion(piv.getWorldQuaternion(new T.Quaternion())), o0 = piv.getWorldPosition(new T.Vector3());
      const rel = hp.clone().sub(o0), along = rel.dot(ax), perp = rel.clone().sub(ax.clone().multiplyScalar(along)); out.palmToShaft = +(perp.length()).toFixed(4); out.handDown = +(hp.y).toFixed(3); }
    { const hs = hand.children.find(o=>o.isMesh) || hand, b = rg.b || 1; out.hsMesh = hs!==hand; hand.updateMatrixWorld(true); const W = v=>v.clone(); const hole = hs.localToWorld(new T.Vector3(0, -0.056, 0.024*b)), pal = hs.localToWorld(new T.Vector3(0, -0.03, 0.004)), tip = hs.localToWorld(new T.Vector3(0, -0.07, 0.026*b));
      const g = hand.localToWorld(new T.Vector3(...m3dGrip(b))); const inHand = v=>{ const q = hand.worldToLocal(v.clone()); return q.toArray().map(x=>+x.toFixed(4)); };
      out.handSpace = { hole:inHand(hole), palm:inHand(pal), fingerTip:inHand(tip), grip:inHand(g), b }; }
    out.staffUrl = shot(e, hand, [[0.18, 0.02, 0.0], [0, 0.03, 0.18], [-0.12, 0.05, 0.12]], 360, 360);
    /* the tome */
    G.player.emblem = 'sun'; const L2 = rsPlayerLook(); L2.o = Object.assign({}, L2.o, { weapon:'staff', tome:'#5a2a6a', tomeEm:'sun', tomeEmCol:'#e0b848' }); const e2 = m3dInstance({}, L2); m3dPoseHumanoid(e2.rig, 0, 0, 0, 0, 0, e2);
    const tg = e2.rig.tome; out.tome = !!tg; if (tg){ const cl = tg.getObjectByName('tomeClosed'), op = tg.getObjectByName('tomeOpen'); let ems = 0; tg.traverse(o=>{ if (o.isMesh && o.material && o.material.map && o.material.alphaTest) ems++; }); out.tomeEmblems = ems;
      cl.visible = true; op.visible = false; e2.holder.updateMatrixWorld(true); out.tomeUrl = shot(e2, tg, [[0.12, 0.1, 0.12], [-0.12, -0.08, 0.1]], 320, 320); }
    return out; });
  const tag = process.env.ZTAG || 'now';
  if (r.staffUrl) fs.writeFileSync(SHOTS + '/zstaff-' + tag + '.png', Buffer.from(r.staffUrl.split(',')[1], 'base64'));
  if (r.tomeUrl) fs.writeFileSync(SHOTS + '/ztome-' + tag + '.png', Buffer.from(r.tomeUrl.split(',')[1], 'base64'));
  delete r.staffUrl; delete r.tomeUrl; console.log(JSON.stringify(r));
};
