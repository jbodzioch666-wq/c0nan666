// RS-359: the sun's shadow box is fitted to the view every frame - the rectangle, in the sun's own space, round the
// camera's corner rays dropped on the ground and on a roof-high plane - so the shadow pass draws the casters in view
// instead of the whole town, and the texels go on a smaller patch. The box is snapped to whole units and capped at the
// old 36-unit box; your own patch is always inside it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; SET.gfx = 'high'; enterVillage(); setUi('playing'); G.player.clock = 10;
    for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const R = V3.renderer, sc = V3.sun.shadow.camera, out = {};
    const count = ()=>{ R.info.autoReset = false; R.info.reset(); renderGame(); const c = R.info.render.calls; R.info.autoReset = true; return c; };
    out.box = [sc.left, sc.right, sc.bottom, sc.top]; out.area = (sc.right - sc.left)*(sc.top - sc.bottom);
    out.whole = sc.left >= -18 && sc.right <= 18 && sc.bottom >= -18 && sc.top <= 18 && sc.left < 0 && sc.right > 0 && sc.bottom < 0 && sc.top > 0;
    out.snapped = [sc.left, sc.right, sc.bottom, sc.top].every(v=>v===Math.round(v));
    out.callsFit = count();
    V3.sunFitOff = true; sc.left = -18; sc.right = 18; sc.bottom = -18; sc.top = 18; sc.updateProjectionMatrix(); out.callsOld = count(); V3.sunFitOff = false; renderGame();
    out.boxBack = [sc.left, sc.right, sc.bottom, sc.top];
    // the visible ground corners sit inside the box, in the sun's space
    const cam = V3.cam; cam.updateMatrixWorld(); sc.updateMatrixWorld(true); let inside = 0, n = 0;
    for (const nx of [-1, 1]) for (const ny of [-1, 1]){ const a = new THREE.Vector3(nx, ny, -1).unproject(cam), b = new THREE.Vector3(nx, ny, 1).unproject(cam), d = b.clone().sub(a).normalize(); const tt = -a.y/d.y; if (!(tt > 0 && tt < 60)) continue; const p = a.clone().addScaledVector(d, tt).applyMatrix4(sc.matrixWorldInverse); n++; if (p.x >= sc.left && p.x <= sc.right && p.y >= sc.bottom && p.y <= sc.top) inside++; }
    out.corners = [inside, n];
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.whole && r.snapped && r.area < 36*36, 'the box is a snapped rectangle inside the old one with your patch in it: '+r.box);
  A(r.callsFit <= r.callsOld, 'the fitted box draws no more than the old one: '+r.callsFit+' vs '+r.callsOld);
  A(r.corners[0]===r.corners[1] && r.corners[1] >= 2, 'the visible ground corners are inside the box');
  A(JSON.stringify(r.boxBack)===JSON.stringify(r.box), 'the box comes back after the frame');
};
