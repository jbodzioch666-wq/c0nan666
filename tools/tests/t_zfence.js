// (probe, not in ALL) a town's instanced meshes from the four sides of the town: does the culling draw them where their instances are in view
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } };
    await fr(30); const out = { walled:!!(G.townLy && G.townLy.info.style.walled), spots:[] }, T = THREE, F = new T.Frustum(), M = new T.Matrix4(), v = new T.Vector3(), S = new T.Sphere();
    const ims = []; V3.world.traverse(o=>{ if (o.isInstancedMesh && o.count > 20 && o.frustumCulled) ims.push(o); });
    out.ims = ims.length;
    for (const [x, y] of [[3, 3], [COLS-4, 3], [3, ROWS-4], [COLS-4, ROWS-4], [COLS>>1, ROWS>>1]]){ G.player.x = x; G.player.y = y; V3.camPos = null; await fr(20); V3.cam.updateMatrixWorld(); F.setFromProjectionMatrix(M.multiplyMatrices(V3.cam.projectionMatrix, V3.cam.matrixWorldInverse));
      let shown = 0, wrong = 0; const ex = [];
      for (const im of ims){ im.updateMatrixWorld(); let anyIn = false; for (let i=0;i<im.count && !anyIn;i++){ im.getMatrixAt(i, M); v.setFromMatrixPosition(M).applyMatrix4(im.matrixWorld); S.set(v, 0.3); if (F.intersectsSphere(S)) anyIn = true; }
        const drawn = F.intersectsObject(im); if (drawn) shown++; if (anyIn && !drawn){ wrong++; if (ex.length < 4) ex.push((im.geometry.type||'') + ' x' + im.count); } }
      out.spots.push({ at:[x, y], shown, wrong, ex }); }
    return out; });
  console.log(JSON.stringify(r));
};
