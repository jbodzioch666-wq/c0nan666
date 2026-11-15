// (probe, not in ALL) a woodcutting willow in the game at midday and later: you stood two tiles south of the nearest one. Shots:
// shots/zwillow2_<hour>.png
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const fr = n=>page.evaluate(async n=>{ for (let i=0;i<n;i++) await new Promise(r=>requestAnimationFrame(r)); }, n);
  await page.evaluate(z=>{ window.__zz = z; }, +(process.env.ZZ||0));
  const info = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const s = G.ow.spawnPos; let best = null;
    for (let d=1; d<70 && !best; d++) for (let x=s.x-d; x<=s.x+d && !best; x++) for (const y of [s.y-d, s.y+d]){ const n = skNodeStatic(x, y); if (n && n.k==='woodcutting' && n.type==='willow'){ best = [x, y]; break; } }
    if (!best) return { none:1 }; G.player.wildWarned = 1; G.gameMode = 0; G.owPos = { x:best[0], y:best[1] + 2 }; G.player.clock = DAY_LENGTH*3 + DAY_LENGTH*0.5; setUi('playing'); return { at:best, phase:dayPhase() }; });
  console.log(JSON.stringify(info)); if (info.none) return;
  for (const [nm, k] of [['noon', 0.5], ['late', 0.65], ['morn', 0.36]]){
    await page.evaluate(k=>{ G.player.clock = DAY_LENGTH*3 + DAY_LENGTH*k; if (+(window.__zz||0)) O3.dist = +(window.__zz||0); }, k); await fr(150);
    await page.screenshot({ path:SHOTS + '/zwillow2_' + nm + '.png' });
    const top = await page.evaluate(at=>{ const T = THREE, [gx, gz] = o3C(at[0], at[1]), y = O3.heightAt(gx, gz), R = O3.renderer, cam = new T.PerspectiveCamera(40, 1, 0.1, 80);
      cam.position.set(gx + 0.01, y + 9, gz + 0.01); cam.lookAt(gx, y, gz); const sz = R.getSize(new T.Vector2()); R.setSize(600, 600, false); R.render(O3.scene, cam); const url = R.domElement.toDataURL('image/png'); R.setSize(sz.x, sz.y, false); return url; }, info.at);
    require('fs').writeFileSync(SHOTS + '/zwillow2_top_' + nm + '.png', Buffer.from(top.split(',')[1], 'base64')); }
  console.log(JSON.stringify(await page.evaluate(()=>{ const out = []; const wc = new THREE.Color(SK_TREE.willow.canopy).convertSRGBToLinear(); O3.scene.traverse(o=>{ if (!o.isMesh) return; const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m=>{ if (m && m.color && Math.abs(m.color.r - wc.r) < 0.01 && Math.abs(m.color.g - wc.g) < 0.01) out.push({ wil:1, type:o.type, inst:!!o.isInstancedMesh, cast:o.castShadow, ss:m.shadowSide, side:m.side, geo:o.geometry.type, n:o.geometry.attributes.position.count, sc:o.scale.toArray().map(v=>+v.toFixed(2)) }); }); }); const G3 = o3NodeGeo(); O3.scene.traverse(o=>{ if (!(o.isMesh || o.isInstancedMesh)) return; const m = o.material, nm = (m && m.name) || '', g = o.geometry;
    if (g===G3.dome || (g && g.parameters && g.parameters.thetaLength===1.9) || /willow/.test(nm) || o.userData.kind==='willow') out.push({ type:o.type, inst:!!o.isInstancedMesh, cast:o.castShadow, side:m && m.side, ss:m && m.shadowSide, cdm:!!o.customDepthMaterial, geo:g.type, n:g.attributes.position.count, merged:!!(g.userData && g.userData.mergedFrom) }); });
    return out.slice(0, 12); })));
};
