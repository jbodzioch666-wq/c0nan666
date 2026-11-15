// (art probe, not in ALL) the tavern's hearth close up, inside, at night: shots/zhearth-<ZTAG>.png
const fs = require('fs');
module.exports = async page=>{
  const url = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.9;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }; await fr(30);
    const key = ROOM_LAYOUT.tavern ? 'tavern' : Object.keys(ROOM_LAYOUT).find(k=>ROOM_LAYOUT[k].benches.some(b=>b[0]==='hearth'));
    enterInterior(key); await fr(60);
    const h = ROOM_LAYOUT[key].benches.find(b=>b[0]==='hearth'); let hf = null, bd = 1e9; const want = new THREE.Vector3(h[1] + 0.5, 0.3, h[2] + 0.5); for (const f of V3.flames){ const p = f.getWorldPosition(new THREE.Vector3()), d = p.distanceTo(want); if (d < bd){ bd = d; hf = f; } }
    const c = hf ? hf.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(h[1] + 0.5, 0.4, h[2] + 0.5);
    const T = THREE, W = 500, H = 400, cv = document.createElement('canvas'); cv.width = W*2; cv.height = H; const ctx = cv.getContext('2d'), r = V3.renderer, cam = V3.cam.clone();
    const shotAt = (dv, i)=>{ cam.aspect = W/H; cam.fov = 35; cam.updateProjectionMatrix(); cam.position.copy(c).add(new T.Vector3(...dv)); cam.lookAt(c.x, c.y + 0.1, c.z); r.setSize(W, H, false); gfxRender(r, V3.scene, cam, 'v3'); ctx.drawImage(r.domElement, i*W, 0, W, H); };
    for (let k=0;k<4;k++){ V3.t = (V3.t||0) + 0.03; V3.flames.forEach((f,i)=>{ const q = 0.9 + Math.sin(V3.t*13+i*2)*0.08; f.scale.set(q,q,q); }); }
    const fw = new THREE.Vector3(0, 0, 1); if (hf && hf.parent) { const q = hf.parent.getWorldQuaternion(new THREE.Quaternion()); fw.applyQuaternion(q); }
    const side = new THREE.Vector3(-fw.z, 0, fw.x); shotAt([fw.x*1.3, 0.45, fw.z*1.3], 0); shotAt([fw.x*0.8 + side.x*0.45, 0.25, fw.z*0.8 + side.z*0.45], 1); V3.sz = ''; return cv.toDataURL('image/png'); });
  fs.writeFileSync(SHOTS + '/zhearth-' + (process.env.ZTAG || 'now') + '.png', Buffer.from(url.split(',')[1], 'base64'));
};
