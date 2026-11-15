// RS-527: the appearance preview frames the figure as it stands - hat, horns and boots - so every race fits head to foot, a tall
// wood elf as well as a gnome; zooming still closes in on the face
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); renderOverlay(); const out = {}, v = new THREE.Vector3();
    for (let i=0;i<RACES.length;i++){ ccSelectRace(i); await new Promise(res=>setTimeout(res, 60)); let n = 0; do { await new Promise(res=>requestAnimationFrame(res)); } while ((LP.pend || !LP.e) && n++ < 600);
      await new Promise(res=>requestAnimationFrame(res)); LP.e.holder.updateMatrixWorld(true); LP.cam.updateMatrixWorld(); const bx = new THREE.Box3().setFromObject(LP.e.holder);
      const ndc = y=>v.set(0, y, 0).project(LP.cam).y; out[RACES[i][0]] = [+ndc(bx.max.y).toFixed(3), +ndc(bx.min.y).toFixed(3)]; }
    LP.zoom = LP_ZMAX; await new Promise(res=>requestAnimationFrame(res)); await new Promise(res=>requestAnimationFrame(res)); const h = LP.e.rig.head.getWorldPosition(new THREE.Vector3()); LP.cam.updateMatrixWorld(); out.face = +h.clone().project(LP.cam).y.toFixed(3); LP.zoom = 1;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k in r) if (k!=='face') A(r[k][0] < 0.97 && r[k][1] > -0.97, k + ' fits head to foot');
  A(Math.abs(r.face) < 0.5, 'zoomed in, the face is near the middle');
};
