// (art probe, not in ALL) a woman in a robe with a closed tome in her left hand and the sage's hat on: the hand and book from three
// sides, and the waist's cord from the front: shots/zhold-<ZTAG>.png. ZTOME='[dx,dy,dz,tilt]' ZCORD='[y0,y1]' try placements
const fs = require('fs');
module.exports = async page=>{
  if (process.env.ZTOME || process.env.ZCORD) await page.evaluate(([t, c])=>{ if (t) window.__tomeK = JSON.parse(t); if (c) window.__cordY = JSON.parse(c); }, [process.env.ZTOME||'', process.env.ZCORD||'']);
  const url = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; G.ccLook = Object.assign(lookDefault('Human'), { body:1 }); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const T = THREE;
    G.gear.offhand = rsMakeArmour('cloth', 2, 'offhand'); G.player.emblem = 'cross'; G.player.look = Object.assign(lookOf(G.player), { body:1 });
    const L = rsPlayerLook({ look:Object.assign(lookDefault('Human'), { body:1 }) }), e = m3dInstance({}, L); e.fight = false; m3dPoseHumanoid(e.rig, 0, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
    const W = 360, H = 360, views = []; const cv = document.createElement('canvas'); cv.width = W*4; cv.height = H; const ctx = cv.getContext('2d');
    const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const r = gfxThreeR(new T.WebGLRenderer({ canvas:c2, antialias:true, preserveDrawingBuffer:true }));
    const sc = new T.Scene(); sc.background = new T.Color(0x2a2620); sc.add(new T.HemisphereLight(0xffffff, 0x404040, 1.1)); const d = new T.DirectionalLight(0xffffff, 1.3); d.position.set(1, 2, 2); sc.add(d); sc.add(e.holder); e.holder.updateMatrixWorld(true);
    const hand = e.rig.arms[1].hand.getWorldPosition(new T.Vector3()), waist = e.rig.torso.getWorldPosition(new T.Vector3());
    const go = (c, dv, i, fov)=>{ const cam = new T.PerspectiveCamera(fov||30, W/H, 0.001, 20); cam.position.copy(c).add(new T.Vector3(...dv)); cam.lookAt(c); r.render(sc, cam); ctx.drawImage(c2, i*W, 0); };
    go(hand, [-0.3, 0.05, 0.12], 0); go(hand, [0, 0.03, 0.32], 1); go(hand, [-0.12, -0.25, 0.12], 2); go(waist.clone().add(new T.Vector3(0, 0.05, 0)), [0, 0.05, 1.0], 3, 32);
    r.dispose(); return cv.toDataURL('image/png'); });
  fs.writeFileSync(SHOTS + '/zhold-' + (process.env.ZTAG || 'now') + '.png', Buffer.from(url.split(',')[1], 'base64'));
};
