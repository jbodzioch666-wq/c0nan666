// probe (RS-698): the trees you can chop, every kind in a row beside you (o3NodeTree at its normal size), shot from the side and from the
// game's camera: shots/ztrees.png
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; await fr(90);
    const T = THREE, P = O3.ppos, types = ['tree', 'oak', 'willow', 'maple', 'yew', 'magic', 'ancient'], R = O3.renderer, W = R.domElement.width, H = R.domElement.height, objs = [];
    types.forEach((ty, i)=>{ const o = o3NodeTree(ty), x = P.x + 0.9 + i*0.85, z = P.z; o.position.set(x, O3.heightAt(x, z), z); O3.scene.add(o); objs.push(o); });
    const sheet = document.createElement('canvas'); sheet.width = W; sheet.height = H*2; const c = sheet.getContext('2d');
    const shot = async (cam, y)=>{ R.render(O3.scene, cam); const im = new Image(); im.src = R.domElement.toDataURL('image/png'); await new Promise(res=>{ im.onload = res; }); c.drawImage(im, 0, y); };
    await fr(2); const cam = O3.cam.clone(); cam.fov = 40; cam.position.set(P.x + 3, P.y + 1.1, P.z + 6.5); cam.lookAt(P.x + 3, P.y + 0.8, P.z); cam.updateProjectionMatrix(); await shot(cam, 0);
    const c2 = O3.cam.clone(); c2.position.add(new T.Vector3(3, 0, 0)); await shot(c2, H);
    objs.forEach(o=>O3.scene.remove(o)); return { sheet:sheet.toDataURL('image/png') }; });
  fs.writeFileSync(SHOTS + '/ztrees.png', Buffer.from(r.sheet.split(',')[1], 'base64')); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
