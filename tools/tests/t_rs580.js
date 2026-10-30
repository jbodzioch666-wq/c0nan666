// RS-580: an instanced mesh is culled by a sphere round all of its instances. A town's palisade - its stakes and their tips, one
// instanced mesh each - was culled by one stake's shape at the town's corner, and from anywhere else in town the fence was gone. From
// each corner of the town and its middle, every instanced mesh with instances in view is drawn
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
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ims >= 1, 'the town has its instanced meshes');
  A(r.spots.every(q=>q.wrong===0 && q.shown >= 1), 'from every side of the town, what is in view is drawn');
  /* and the sphere follows: moved instances, or fewer of them, get a new one */
  const k = await page.evaluate(()=>{ const T = THREE, im = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial(), 2), M = new T.Matrix4();
    im.setMatrixAt(0, M.makeTranslation(0, 0, 0)); im.setMatrixAt(1, M.makeTranslation(10, 0, 0)); im.instanceMatrix.needsUpdate = true; const r0 = gfxInstSphere(im).radius;
    im.setMatrixAt(1, M.makeTranslation(40, 0, 0)); im.instanceMatrix.needsUpdate = true; const r1 = gfxInstSphere(im).radius; im.count = 1; const r2 = gfxInstSphere(im).radius; return [r0, r1, r2].map(v=>+v.toFixed(2)); });
  A(k[0] > 5 && k[1] > 20 && k[2] < 1, 'the sphere is worked out again as the instances move or go: ' + k);
};
