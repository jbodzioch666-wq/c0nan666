// (art probe, not in ALL) FP-023's kit trees close up: a camera set by the first kit oak, pine and bush, into shots/znk2_<name>.png.
// ZN_NOSHADOW=1 turns the kit's shadows off, ZN_FRONT=1 draws the leaves one-sided, ZN_NOSWAY=1 leaves them still
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 300)); });
  const fs = require('fs');
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const TAG = process.env.ZN_TAG || '';
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9;
    const m = G.ow.map; let best = null, bd = 1e9; for (let x=2;x<OW_COLS-2;x++) for (let y=2;y<OW_ROWS-2;y++){ if (m[x][y]!==OW_GRASS) continue; let n = 0; for (let i=-2;i<=2;i++) for (let j=-2;j<=2;j++) if (m[x+i][y+j]===OW_FOREST) n++; if (n < 10) continue; const d = Math.hypot(x - G.owPos.x, y - G.owPos.y); if (d < bd){ bd = d; best = [x, y]; } }
    if (best) G.owPos = { x:best[0], y:best[1] }; G.gameMode = 0; setUi('playing'); SET.tpLand = 'model'; });
  await wait(4000);
  await ev(([ns, fr, nw])=>{ O3.world.traverse(o=>{ if (o.isInstancedMesh && o.material.map){ if (ns) o.castShadow = false; if (fr) o.material.side = THREE.FrontSide; if (nw && o.material.userData) { o.material.onBeforeCompile = ()=>{}; o.material.needsUpdate = true; } } }); }, [!!process.env.ZN_NOSHADOW, !!process.env.ZN_FRONT, !!process.env.ZN_NOSWAY]);
  await wait(600);
  const kinds = await ev(()=>{ const out = {}; O3.world.traverse(o=>{ if (o.isInstancedMesh && o.material.map && o.userData.kind && !out[o.userData.kind]){ const M = new THREE.Matrix4(); o.getMatrixAt(0, M); const p = new THREE.Vector3().setFromMatrixPosition(M); out[o.userData.kind] = [p.x, p.y, p.z, o.material.side, o.material.alphaTest, !!o.material.map.image, o.material.map.colorSpace]; } }); return out; });
  console.log('kinds', JSON.stringify(kinds));
  const shoot = (name, p, yaw, dist, h)=>ev(([name, p, yaw, dist, h])=>{ const T = THREE, cv = O3.renderer.domElement, cam = new T.PerspectiveCamera(35, cv.width/cv.height, 0.05, 200);
    cam.position.set(p[0] + Math.sin(yaw)*dist, p[1] + h, p[2] + Math.cos(yaw)*dist); cam.lookAt(p[0], p[1] + 0.6, p[2]); O3.renderer.render(O3.scene, cam); return cv.toDataURL('image/png'); }, [name, p, yaw, dist, h]).then(u=>fs.writeFileSync(SHOTS + '/znk2_' + TAG + name + '.png', Buffer.from(u.split(',')[1], 'base64')));
  for (const k of ['oak', 'pine', 'bush', 'rock', 'dead']) if (kinds[k]) await shoot(k, kinds[k], 0.7, 3.5, 1.4);
  if (errs.length) console.log('ERRS', errs.slice(0, 8).join(' | '));
};
