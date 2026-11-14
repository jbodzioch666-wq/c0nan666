// RS-907: your plot on the open land. Bought from the estate agent once you own a house: a fenced yard seven tiles square on open
// ground near the town, your house at the back of it (a cottage, a house, a manor, an estate with its tower by its size), its front
// door the way in and out. The fence and cottage are solid, the gate open; nothing grows or roams inside. The yard is decorated in the
// edit mode as the rooms are, its pieces to the land's scale, a solid one walling off its tile; the portal and the map know the plot.
// Shots: shots/rs907-plot.jpg (the plot on the land, a piece set out), shots/rs907-homes.jpg (the four houses)
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const frames = n=>page.evaluate(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 40)); } }, n);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    { const roomy = ()=>{ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN && plotFind(x, y)) return { x, y }; return null; }, t = plotFind(G.owPos.x, G.owPos.y) ? null : roomy(); if (t){ G.owPos = t; enterVillage(); setUi('playing'); } }   /* (a town with open ground near it for a plot) */
    p.gold = 400000; houseBuy(); const h = houseP(); setUi('estate'); out.offer = /plot on the open land/.test(document.getElementById('overlay').textContent);
    const g0 = p.gold; out.bought = plotBuy(); { const PQ = plotGet(); if (PQ) PQ.q = 0; }   /* (RS-921: the gate pinned to the south, as this test's walks expect) */ out.paid = g0 - p.gold; const P = plotGet(); out.P = P && { x:P.x, y:P.y, d:Math.hypot(P.x - G.owPos.x, P.y - G.owPos.y) }; out.siteOk = !!P && plotSiteOk(P.x, P.y);
    out.where = P ? plotWhere(P) : ''; out.again = plotBuy(); setUi('playing');
    out.blocks = P && { door:plotBlock(P.x, P.y - 1), wall:plotBlock(P.x + 1, P.y - 2), fence:plotBlock(P.x - 3, P.y), gate:plotBlock(P.x, P.y + 3), yard:plotBlock(P.x + 2, P.y + 1), out:plotBlock(P.x, P.y + 4) };
    out.passFence = o3Passable(P.x + 3, P.y + 1); out.node = skNodeAt(P.x + 1, P.y + 1); out.taken = owSpotTaken(P.x + 2, P.y + 2);
    out.portal = housePortalDests().some(d=>d.kind==='home' && d.x===P.x); out.search = mapSearchIndex().some(o=>o.nm==='Your plot');
    return out; });
  console.log(JSON.stringify(r));
  A(r.offer && r.bought && r.paid===25000 && r.P && r.P.d >= 5 && r.P.d <= 26 && r.siteOk && r.again===false, 'a plot bought from the agent, on open ground near the town', r);
  A(r.blocks.door==='door' && r.blocks.wall==='wall' && r.blocks.fence==='wall' && r.blocks.gate===null && r.blocks.yard===null && r.blocks.out===null && !r.passFence, 'the cottage and fence solid, the gate and yard open, the door the way in', r.blocks);
  A(r.node===null && r.taken && r.portal && r.search, 'nothing gathered or spawned inside; the portal and the map know it', r);
  /* out to the plot: the land levelled and cleared, in at the gate and through the door */
  const r2 = await page.evaluate(async ()=>{ const P = plotGet(), out = {}; G.gameMode = 0; G.owPos = { x:P.x, y:P.y + 5 }; for (let i=0;i<30;i++){ renderGame(); await new Promise(q=>setTimeout(q, 40)); }
    for (let i=0;i<5;i++) tryMoveOverworld(0, -1); out.at = [G.owPos.x - P.x, G.owPos.y - P.y]; for (let i=0;i<20;i++){ renderGame(); await new Promise(q=>setTimeout(q, 40)); }
    out.root = !!O3.yardRoot && !!O3.yardGrp; const c = o3C(P.x, P.y); const hs = []; for (const [a, b] of [[-2.5, -2.5], [2.5, 2.5], [0, 0], [-2, 2], [2.8, -2.8]]) hs.push(O3.heightAt(c[0] + a, c[1] + b)); out.flat = Math.max(...hs) - Math.min(...hs);
    out.trees = 0; O3.scene.traverse(o=>{ if (o.isInstancedMesh && o.count && /tree|bush|trunk|leaf|canopy/i.test(o.name || '')) { const m = new THREE.Matrix4(), v = new THREE.Vector3(); for (let i=0;i<o.count;i++){ o.getMatrixAt(i, m); v.setFromMatrixPosition(m).applyMatrix4(o.matrixWorld); if (Math.abs(v.x - c[0]) < 3.2 && Math.abs(v.z - c[1]) < 3.2) out.trees++; } } });
    out.yardIn = heditIn();
    /* decorating the yard */
    const h = houseP(); h.furn.rtable = 2; h.furn.painting = 1; heditStart(); heditTake('painting'); out.wallRefused = !G.hedit.sel && h.furn.painting===1;
    heditTake('rtable'); const S = G.hedit.sel; S.x = 1.5; S.z = 1.0; S.y = 0; out.okHere = heditOk(S); S.x = 0; S.z = 1; out.okPath = heditOk(S); S.x = 0; S.z = -1.5; out.okHouse = heditOk(S); S.x = 1.75; S.z = 1.0; S.r = 0.6; out.placed = heditPlace(false);
    out.yard = h.yard.length; out.kids = O3.yardGrp.children.length; out.solid = plotBlock(P.x + 2, P.y + 1); out.sc = +O3.yardGrp.children[0].scale.x.toFixed(2);
    /* picked up again by clicking it */
    O3.yardGrp.updateMatrixWorld(true); const wp = new THREE.Vector3(); new THREE.Box3().setFromObject(O3.yardGrp.children[0]).getCenter(wp); const sp = wp.clone().project(O3.cam), rc = O3.cv.getBoundingClientRect();
    heditDown({ clientX:rc.left + (sp.x + 1)/2*rc.width, clientY:rc.top + (1 - sp.y)/2*rc.height, pointerType:'mouse' }); out.picked = !!(G.hedit.sel && G.hedit.sel.yard && G.hedit.sel.k==='rtable') && h.yard.length===0;
    heditCancel(); out.back = h.yard.length===1; heditEnd();
    for (let i=0;i<10;i++){ renderGame(); await new Promise(q=>setTimeout(q, 40)); }
    return out; });
  console.log(JSON.stringify(r2));
  A(r2.at[0]===0 && r2.at[1]===0 && r2.root && r2.flat < 0.02 && r2.trees===0 && r2.yardIn, 'in at the gate to the yard: the land levelled, nothing growing in it, the edit mode there', r2);
  A(r2.wallRefused && r2.okHere && !r2.okPath && !r2.okHouse && r2.placed && r2.yard===1 && r2.kids===1 && r2.solid==='wall' && r2.sc===0.42, "a table set out in the yard, to the land's scale, walling off its tile; not on the path or the house; nothing hung on a wall", r2);
  A(r2.picked && r2.back, 'clicked, it is picked up again; put back', r2);
  /* the shots: the plot from the camera, and the four houses */
  await frames(10);
  const shot = await page.evaluate(()=>{ const P = plotGet(), T = THREE, R = O3.renderer, c = o3C(P.x, P.y), y = O3.heightAt(c[0], c[1]), sz = R.getSize(new T.Vector2()), cam = new T.PerspectiveCamera(36, sz.x/sz.y, 0.05, 200);
    cam.position.set(c[0] + 4.5, y + 5.5, c[1] + 8); cam.lookAt(c[0], y + 0.4, c[1] - 0.6); R.render(O3.scene, cam); return R.domElement.toDataURL('image/jpeg', 0.88); });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs907-plot.jpg'), Buffer.from(shot.split(',')[1], 'base64'));
  const r3 = await page.evaluate(async ()=>{ const T = THREE, W = 480, H = 360, sheet = document.createElement('canvas'); sheet.width = W*2; sheet.height = H*2; const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H; const out = {};
    const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true; const M = o3QsMats();
    for (let n=1;n<=4;n++){ const sc = new T.Scene(); sc.background = new T.Color(0x8ab0d0); sc.add(new T.HemisphereLight(0xfff4e0, 0x506040, 1.2)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(3, 5, 4); d.castShadow = true; d.shadow.camera.left = d.shadow.camera.bottom = -4; d.shadow.camera.right = d.shadow.camera.top = 4; sc.add(d);
      const fl = new T.Mesh(new T.PlaneGeometry(12, 12), new T.MeshStandardMaterial({ color:0x5a8a3a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl);
      const t0 = performance.now(), S = o3QsScene('plot:home' + n), ms = performance.now() - t0; let tris = 0; for (const [geo, mk] of S.parts){ const o = new T.Mesh(geo, M[mk]); o.castShadow = o.receiveShadow = true; o.position.z = PLOT_HOME_Z; sc.add(o); tris += (geo.index ? geo.index.count : geo.attributes.position.count)/3; }
      for (const [geo, mk] of o3QsScene('plot:yard').parts){ const o = new T.Mesh(geo, M[mk]); o.castShadow = o.receiveShadow = true; sc.add(o); }
      out['home' + n] = { parts:S.parts.length, tris:Math.round(tris), ms:+ms.toFixed(1), smoke:(S.smoke||[]).length };
      const cam = new T.PerspectiveCamera(34, W/H, 0.05, 50); cam.position.set(3.2, 3.6, 5.6); cam.lookAt(0, 0.6, -0.9); R.render(sc, cam); sx.drawImage(cv, ((n - 1) % 2)*W, Math.floor((n - 1)/2)*H); }
    R.dispose(); out.shot = sheet.toDataURL('image/jpeg', 0.88); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs907-homes.jpg'), Buffer.from(r3.shot.split(',')[1], 'base64')); delete r3.shot; console.log(JSON.stringify(r3));
  for (let n=1;n<=4;n++) A(r3['home' + n].parts <= 16 && r3['home' + n].tris > 3000, 'house ' + n + ': smooth parts merged by material', r3['home' + n]);
  /* in through the front door, and out again into the yard */
  const r4 = await page.evaluate(async ()=>{ const P = plotGet(), out = {}; G.owPos = { x:P.x, y:P.y }; tryMoveOverworld(0, -1); out.inHouse = G.gameMode===3 && G.interior && G.interior.key==='house' && G.interior.out.plot===1; out.stay = [G.owPos.x - P.x, G.owPos.y - P.y];
    for (let i=0;i<20;i++){ renderGame(); await new Promise(q=>setTimeout(q, 40)); } out.v3 = !!(V3.decorGrp && V3.decorGrp.parent);
    const [dx, dy] = houseDoorXY(); G.player.x = dx; G.player.y = dy - 1; moveDir(0, 1); for (let i=0;i<20;i++){ renderGame(); await new Promise(q=>setTimeout(q, 40)); }
    out.outside = G.gameMode===0 && !G.interior && G.owPos.x===P.x && G.owPos.y===P.y; out.o3 = o3Active();
    /* the house's portal back to the plot */
    tryMoveOverworld(0, -1); houseP().built.portal = 1; housePortalGo(housePortalDests().findIndex(d=>d.kind==='home')); out.portalBack = G.gameMode===0 && G.owPos.x===P.x && G.owPos.y===P.y;
    return out; });
  console.log(JSON.stringify(r4));
  A(r4.inHouse && r4.stay[0]===0 && r4.stay[1]===0 && r4.v3 && r4.outside && r4.o3 && r4.portalBack, 'through the cottage door into the house and out again into the yard; the portal comes back to it', r4);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
