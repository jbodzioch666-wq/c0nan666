// (art probe, not in ALL) one creature close up, lit like a dungeon, in its own renderer: shots/zspider-<ZTAG>.png (ZMON, default giant spider)
const fs = require('fs');
module.exports = async page=>{
  const url = await page.evaluate(async nm=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const T = THREE;
    const m = { nm, x:5, y:5, hp:10, maxHp:10, alive:true }, pt = m3dPortrait(m), e = m3dInstance(m, pt);
    const cv = document.createElement('canvas'); cv.width = 1000; cv.height = 700; const r = gfxThreeR(new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }));
    const sc = new T.Scene(); sc.background = new T.Color(0x1a1612); sc.add(new T.HemisphereLight(0xc8c0b0, 0x302820, 0.9)); const d = new T.DirectionalLight(0xffe0b0, 1.6); d.position.set(2, 3, 2); sc.add(d); const d2 = new T.DirectionalLight(0x8090c0, 0.5); d2.position.set(-2, 1, -1); sc.add(d2);
    sc.add(e.holder); e.anim && e.anim(e.rig, 1.0, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
    const bb = new T.Box3().setFromObject(e.holder), c = bb.getCenter(new T.Vector3()), s = bb.getSize(new T.Vector3()).length();
    const cam = new T.PerspectiveCamera(30, 1000/700, 0.01, 50); cam.position.set(c.x + s*0.55, c.y + s*0.45, c.z + s*0.75); cam.lookAt(c);
    r.render(sc, cam); r.render(sc, cam); return cv.toDataURL('image/png'); }, process.env.ZMON || 'giant spider');
  fs.writeFileSync(SHOTS + '/zspider-' + (process.env.ZTAG || 'now') + '.png', Buffer.from(url.split(',')[1], 'base64'));
};
