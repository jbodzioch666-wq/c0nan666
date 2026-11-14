// (probe, not in ALL) a tree's shadow on the open land at midday, close in: as it is; leaves hidden; the sun's shadow off (materials rebuilt)
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const info = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.mon = []; G.weather = 'clear'; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.45;
    const sp = G.ow.spawnPos; let best = null, bn = -1;
    for (let x=sp.x-20; x<=sp.x+20; x++) for (let y=sp.y-20; y<=sp.y+20; y++){ if (!G.ow.map[x] || G.ow.map[x][y]!==OW_GRASS) continue; let n = 0; for (let i=-2;i<=2;i++) for (let j=-2;j<=2;j++){ const t = G.ow.map[x+i] && G.ow.map[x+i][y+j]; if (t===OW_GRASS) n++; } if (n > bn){ bn = n; best = { x, y }; } }
    G.owPos = best; O3.dist = 7; if (window.__rain) G.weather = 'rain'; for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r)); return best; });
  const clip = { x:300, y:120, width:800, height:520 }, shot = n=>page.screenshot({ path: SHOTS + '/ztree-' + n + '.png', clip });
  await shot('a');
  await page.evaluate(async ()=>{ window.__leaf = []; O3.world.traverse(o=>{ if (o.isInstancedMesh && o.castShadow && o.material && o.material.flatShading!==undefined) window.__leaf.push(o); }); window.__leaf.forEach(o=>o.visible = false); for (let i=0;i<20;i++) await new Promise(r=>requestAnimationFrame(r)); });
  await shot('b');
  await page.evaluate(async ()=>{ window.__leaf.forEach(o=>o.visible = true); O3.sun.castShadow = false; O3.scene.traverse(o=>{ if (o.material) [].concat(o.material).forEach(m=>m.needsUpdate = true); }); for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); });
  await shot('c');
  await page.evaluate(async ()=>{ O3.sun.castShadow = true; O3.scene.traverse(o=>{ if (o.material) [].concat(o.material).forEach(m=>m.needsUpdate = true); }); G.weather = 'rain'; for (let i=0;i<90;i++) await new Promise(r=>requestAnimationFrame(r)); });
  await shot('rain');
  console.log(JSON.stringify(info));
  console.log(JSON.stringify(await page.evaluate(()=>{ const o = { inst:0, withDepth:0, nodeLeaf:0, merged:0, depthMeshes:[] }; O3.scene.traverse(m=>{ if (!m.isMesh || !m.castShadow) return; if (m.customDepthMaterial && o.depthMeshes.length < 12) o.depthMeshes.push([m.isInstancedMesh ? 'I' : 'M', m.geometry.type, !!m.geometry.attributes.uv, m.visible, m.geometry.attributes.position.count]); if (m.isInstancedMesh){ o.inst++; if (m.customDepthMaterial) o.withDepth++; } else if (m.geometry && m.geometry.type==='IcosahedronGeometry') o.nodeLeaf++; else if (m.geometry && m.geometry.type==='BufferGeometry' && m.geometry.attributes.position.count > 5000) o.merged++; }); return o; })));
};
