// RS-401 (and RS-402: the wild animals): the open land draws far less - a chunk's gathering-spot discs, ripples, bubbles and glows are batched into a few meshes
// moved by the card, the land's sites and dressing are merged like a town's, creatures off screen aren't posed and far ones throw
// no shadow, and the gathering spots near you aren't looked over again every frame
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = true; G.gameMode = 0; G.interior = null;
    G.player.clock = DAY_LENGTH*5 + DAY_LENGTH*0.5; G.weather = 'clear';
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 50)); } };
    O3.dist = 28; await fr(30);
    const out = {};
    // the gathering spots: no single-spot disc, ripple, bubble or glow left in any chunk
    let lone = 0, batched = 0, chunks = 0;
    for (const c of O3.nodeChunks.values()){ chunks++; c.g.traverse(o=>{ if (o.isSprite) lone++; else if (o.isMesh && o.material && o.material.userData && o.material.userData.own && !o.userData.merged && o.geometry.type!=='CylinderGeometry') lone++;   /* (a rich vein's beam of light stays its own: there are only ever a few) */ if ((o.isMesh || o.isPoints) && o.material && o.material.isShaderMaterial) batched++; }); }
    out.nodes = { chunks, lone, batched, nodeAnim:(O3.nodeAnim||[]).filter(a=>a.kind==='disc' || a.kind==='ripple' || a.kind==='bub' || a.kind==='glow').length };
    // the land is merged
    out.merged = [O3.mergedFrom, O3.mergedTo];
    // a frame with nothing new to check doesn't look the spots over again
    let looks = 0; const k0 = skNodeAt; window.skNodeAt = (...a)=>{ looks++; return k0(...a); }; O3.nodeTick = null; renderGame(); window.skNodeAt = k0; out.relooks = looks;   /* (the hover and the gathering menus look a few up on their own) */
    // the landmark test isn't run for a tile already known
    let lm = 0; const l0 = owLandmarkFoot; window.owLandmarkFoot = (...a)=>{ lm++; return l0(...a); }; SKN.st.clear(); const p = G.owPos; for (let i=0;i<50;i++) skNodeStatic(p.x+(i%7), p.y+((i/7)|0)); const lm1 = lm; lm = 0; for (let i=0;i<50;i++) skNodeStatic(p.x+(i%7), p.y+((i/7)|0)); window.owLandmarkFoot = l0; out.landmarkLooks = [lm1, lm];
    // a creature off screen isn't posed; one far off throws no shadow
    O3.camTgt && o3CreatureShadows(); const w = (O3.wild||[]).find(q=>q.e && q.e.holder && (q.e.holder.userData.shL||[]).length);
    if (w){ const h = w.e.holder, c = O3.camTgt; h.position.set(c.x + 200, 0, c.z + 200); o3AnimTick(); out.offscreenPosed = o3AnimDue(h, 0); h.position.set(c.x, 0, c.z); o3AnimTick(); out.nearPosed = o3AnimDue(h, 0) || o3AnimDue(h, 1);
      h.position.set(c.x + 30, 0, c.z); o3CreatureShadows(); let sh = 0; h.traverse(o=>{ if (o.isMesh && o.castShadow) sh++; }); out.farShadow = sh;
      h.position.set(c.x + 2, 0, c.z); o3CreatureShadows(); sh = 0; h.traverse(o=>{ if (o.isMesh && o.castShadow) sh++; }); out.nearShadow = sh; }
    // (RS-402) a flock is one instanced mesh; a deer, boar or rabbit is a few skinned meshes, its parts' looks baked into one
    out.flocks = (O3.wild||[]).filter(q=>q.k==='bird' && q.e).map(q=>{ let n = 0, inst = 0; q.e.holder.traverse(o=>{ if (o.isMesh) n++; if (o.isInstancedMesh) inst++; }); return [n, inst]; });
    out.beasts = (O3.wild||[]).filter(q=>q.k!=='bird' && q.e && q.e.rig).map(q=>{ let sk = 0; q.e.holder.traverse(o=>{ if (o.isSkinnedMesh) sk++; }); return sk; });
    // and a townsperson is still merged the careful way
    out.looseLeft = M3D_LOOSE;
    // and in all: the draws a frame zoomed out
    const R = O3.renderer; R.info.autoReset = false; R.info.reset(); gfxShadowTick.movedAt = performance.now(); o3Render(); out.draws = R.info.render.calls; R.info.autoReset = true;
    return out;
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.nodes.chunks > 0 && r.nodes.lone===0 && r.nodes.nodeAnim===0, 'no gathering-spot disc, ripple, bubble or glow is its own draw');
  A(r.nodes.batched > 0, 'they are batched into card-driven meshes');
  A(r.merged[0] > 0 && r.merged[1] < r.merged[0]*0.7, 'the land is merged');
  A(r.relooks < 40, 'a frame with nothing new does not look the spots over again');
  A(r.landmarkLooks[0] > 0 && r.landmarkLooks[1]===0, 'a known tile skips the landmark test');
  if (r.offscreenPosed!==undefined){ A(r.offscreenPosed===false && r.nearPosed===true, 'a creature off screen is not posed, one in view is'); A(r.farShadow===0 && r.nearShadow > 0, 'a far creature throws no shadow, a near one does'); }
  A(r.flocks.every(([n, i])=>n===1 && i===1), 'a flock of birds is one instanced mesh');
  A(r.beasts.length===0 || r.beasts.every(n=>n <= 2), 'a wild beast is at most two skinned meshes');
  A(r.looseLeft===false, 'the loose merge is only switched on while the land\'s creatures are built');
  A(r.draws < 1100, 'the open land zoomed out draws under 1,100 times a frame');
};
