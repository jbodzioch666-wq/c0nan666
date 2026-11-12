// RS-904: decorating your house, ESO and WoW style. Wenna the furnisher stands on every town square (the plain pieces always, five finer
// ones that change by the day); what you buy goes to the house's store. At home, Decorate is the edit mode: take a piece from the store, it
// follows the pointer and is placed with a click - turned, raised, stacked on a table, hung on a wall - snapped or free; click a placed
// piece to move it, X sends it back to the store. A solid piece walls off its tile; placed pieces are saved. Every piece is built from
// smooth parts merged by material. Shots: shots/rs904-room.png, rs904-pieces.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const frames = n=>page.evaluate(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } }, n);
  const shop = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const wn = G.villageNpcs.find(n=>n.service==='furnisher'), out = { npc:!!wn, tile:wn ? G.map[wn.x][wn.y]===T_VENDOR : false };
    setUi('furnisher'); out.noHouse = /no house/.test(document.getElementById('overlay').textContent);
    p.gold = 200000; houseBuy(); setUi('furnisher'); const ov = document.getElementById('overlay'); out.rows = ov.querySelectorAll('[data-fbuy]').length; out.stock = furnStock();
    p.turnCount += DAY_LENGTH*3; out.stock2 = furnStock(); const g0 = p.gold;
    furnBuy('chair'); out.paid = g0 - p.gold; Object.assign(houseP().furn, { rtable:1, candle:2, fruit:1, painting:1, bookcase:1, rugr:1, ptree:1, armchair:1 });
    setUi('playing'); enterHouse(); return out; });
  await page.evaluate(()=>console.log('STAGE house')); await frames(40); await page.evaluate(()=>console.log('STAGE edit'));
  const ed = await page.evaluate(async ()=>{ const out = {}, h = houseP(), p = G.player, fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    out.v3 = v3Active(); const panel = document.getElementById('hedit'); out.btn = !!panel && panel.style.display!=='none' && /Decorate/.test(panel.textContent);
    panel.querySelector('[data-he="start"]').click(); out.on = !!G.hedit;
    /* a mouse at the screen point of a world spot */
    const at = (x, y, z)=>{ const v = new THREE.Vector3(x, y, z).project(V3.cam), r = V3.cv.getBoundingClientRect(); return { clientX:r.left + (v.x + 1)/2*r.width, clientY:r.top + (1 - v.y)/2*r.height, pointerType:'mouse', button:0, shiftKey:false }; };
    const fx = p.x + 0.5, fz = p.y - 1.5;   /* (in the parlour, ahead of the front door) */
    heditTake('rtable'); heditMove(at(fx, 0, fz)); out.ghost = !!(V3.heGhost && V3.heGhost.parent); out.ok1 = heditOk(G.hedit.sel); heditTurn(1); out.r1 = +G.hedit.sel.r.toFixed(3);
    heditDown(at(fx, 0, fz)); out.placed = h.decor.length; out.solid = G.map[Math.floor(h.decor[0].x)][Math.floor(h.decor[0].z)]===T_WALL; out.snapped = h.decor[0].x*4===Math.round(h.decor[0].x*4);
    await fr(4);
    /* stacked: the bowl of apples on the table's top */
    heditTake('fruit'); heditMove(at(h.decor[0].x, 0.78, h.decor[0].z)); heditDown(at(h.decor[0].x, 0.78, h.decor[0].z)); const fd = h.decor.find(d=>d.k==='fruit'); out.stackY = fd ? +fd.y.toFixed(2) : -1;
    heditTake('candle'); heditMove(at(h.decor[0].x + 0.25, 0.78, h.decor[0].z + 0.1)); heditDown(at(h.decor[0].x + 0.25, 0.78, h.decor[0].z + 0.1));
    /* a rug, a chair, a tree free (snap off), raised and lowered */
    heditTake('rugr'); heditMove(at(fx, 0, fz + 0.2)); heditDown(at(fx, 0, fz + 0.2));
    heditTake('chair'); heditMove(at(fx + 0.9, 0, fz)); heditTurn(1); heditTurn(1); heditDown(at(fx + 0.9, 0, fz));
    heditSnap(); out.snap = G.hedit.snap; heditTake('ptree'); heditMove(at(fx - 1.37, 0, fz - 0.61)); heditLift(1); out.lifted = +G.hedit.sel.y.toFixed(3); heditLift(-1); heditDown(at(fx - 1.37, 0, fz - 0.61)); heditSnap();
    /* the painting on the back wall: find a full wall's face by looking for the occluders */
    heditTake('painting'); let wallOk = false; for (const o of (V3.occ||[])){ const bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3()); const e = at(c.x, 1.6, bb.max.z + 0.001); heditMove(e); if (G.hedit.sel.onWall && heditOk(G.hedit.sel)){ heditDown(e); wallOk = true; break; } }
    out.wall = wallOk; if (!wallOk) heditCancel(); const pd = h.decor.find(d=>d.k==='painting'); out.wallY = pd ? +pd.y.toFixed(2) : -1;
    /* moved: pick the chair back up and send it to the store */
    const ci = h.decor.findIndex(d=>d.k==='chair'), cd = h.decor[ci]; out.pickI = heditPickAt(at(cd.x, 0.5, cd.z)); out.ci = ci; { const e = at(cd.x, 0.5, cd.z), r = V3.cv.getBoundingClientRect(); V3.ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left)/r.width)*2 - 1, -((e.clientY - r.top)/r.height)*2 + 1), V3.cam); const hs = V3.ray.intersectObjects(V3.decorGrp.children, true); out.hits = hs.slice(0, 3).map(q=>{ let o = q.object, n = 0; while (o && o.userData.di===undefined){ o = o.parent; n++; } return [q.object.type, n, o ? o.userData.di : 'none', o && o.userData.furn]; }); out.kids = V3.decorGrp.children.map(c=>c.userData.di + ':' + c.userData.furn).join(' '); } heditDown(at(cd.x, 0.5, cd.z)); out.picked = G.hedit.sel && G.hedit.sel.k; heditStore(); out.chairBack = h.furn.chair;
    /* refused: in the front door */
    const [dx, dy] = houseDoorXY(); heditTake('armchair'); G.hedit.sel.x = dx + 0.5; G.hedit.sel.z = dy + 0.5; out.door = heditOk(G.hedit.sel); out.place = heditPlace(); heditCancel();
    out.n = h.decor.length; out.decor = h.decor.map(d=>d.k).join(','); await fr(10); return out; });
  await page.screenshot({ path: path.join(__dirname, 'shots', 'rs904-room.png') });
  const after = await page.evaluate(async ()=>{ const out = {}; handleKeydown(new KeyboardEvent('keydown', { key:'Escape' })); out.off = !G.hedit;
    /* kept in the save, and back in 3D on the way in again */
    const js = JSON.parse(JSON.stringify(G.player.house)); out.saved = js.decor.length; out.grp = V3.decorGrp ? V3.decorGrp.children.length : -1;
    /* every piece: smooth, merged, cheap to set down again */
    out.pieces = {}; for (const k in FURN){ const t0 = performance.now(); delete (furnModel.c||{})[k]; const m = furnModel(k), ms = performance.now() - t0; let tris = 0, meshes = 0, flat = 0; m.traverse(o=>{ if (!o.isMesh) return; meshes++; tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count)/3; if (o.material.flatShading) flat++; }); const t1 = performance.now(); furnInst(k); out.pieces[k] = { tris:Math.round(tris), meshes, flat, ms:+ms.toFixed(1), ms2:+(performance.now() - t1).toFixed(2) }; }
    /* a contact sheet of them all */
    const T = THREE, KEYS = Object.keys(FURN), W = 260, H = 240, cols = 7, sheet = document.createElement('canvas'); sheet.width = W*cols; sheet.height = H*Math.ceil(KEYS.length/cols); const sx = sheet.getContext('2d');
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    KEYS.forEach((k, i)=>{ const sc = new T.Scene(); sc.background = new T.Color(0x3a3028); sc.add(new T.HemisphereLight(0xfff0e0, 0x403020, 1.1)); const d = new T.DirectionalLight(0xfff0d8, 2.2); d.position.set(2, 4, 3); d.castShadow = true; d.shadow.camera.left = d.shadow.camera.bottom = -2; d.shadow.camera.right = d.shadow.camera.top = 2; sc.add(d);
      const fl = new T.Mesh(new T.PlaneGeometry(8, 8), new T.MeshStandardMaterial({ color:0x6a5440 })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); const g = furnInst(k); if (FURN[k].wall) g.position.y = 0.6; g.traverse(o=>{ if (o.isMesh) o.castShadow = true; }); sc.add(g);
      const bb = new T.Box3().setFromObject(g), c = bb.getCenter(new T.Vector3()), s = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z), cam = new T.PerspectiveCamera(32, W/H, 0.01, 30);
      cam.position.set(c.x + s*1.3, c.y + s*0.8, c.z + s*1.9); cam.lookAt(c); try{ R.render(sc, cam); }catch(err){ (out.rerr = out.rerr || []).push(k + ':' + String(err).slice(0, 80)); } sx.drawImage(cv, (i % cols)*W, Math.floor(i/cols)*H); sx.fillStyle = '#fff'; sx.font = '16px sans-serif'; sx.fillText(k, (i % cols)*W + 8, Math.floor(i/cols)*H + 20); });
    R.dispose(); out.shot = sheet.toDataURL('image/jpeg', 0.88); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs904-pieces.jpg'), Buffer.from(after.shot.split(',')[1], 'base64')); delete after.shot;
  console.log(JSON.stringify({ shop, ed, after }));
  A(shop.npc && shop.tile && shop.noHouse, 'Wenna the furnisher on the square; no house, nowhere to put it', shop);
  A(shop.rows===17 && shop.stock.length===17 && shop.stock.join()!==shop.stock2.join(), 'the plain pieces and five finer ones, changing by the day', shop);
  A(shop.paid===420, 'bought for its price', shop);
  A(ed.v3 && ed.btn && ed.on && ed.ghost && ed.ok1, 'Decorate at home: a piece taken from the store follows the pointer', ed);
  A(Math.abs(ed.r1 - Math.PI/4) < 0.01 && ed.snapped && ed.solid, 'placed snapped and turned an eighth; a table walls off its tile', ed);
  A(ed.stackY > 0.7 && ed.stackY < 0.85, 'the bowl stacked on the table top', ed);
  A(ed.snap===0 && ed.lifted > 0.02, 'snap off, and a piece raised', ed);
  A(ed.wall && ed.wallY > 0.5, 'a painting hung on a wall', ed);
  A(ed.picked==='chair' && ed.chairBack===1, 'a placed piece picked up and sent back to the store', ed);
  A(!ed.door && !ed.place, 'nothing in the front door', ed);
  A(after.off && after.saved===ed.n && after.grp===ed.n, 'Escape ends it; the pieces kept in the save and shown', after);
  for (const [k, v] of Object.entries(after.pieces)){ A(!v.flat && v.meshes <= 8, k + ': smooth parts merged by material', v); A(v.tris > (k.startsWith('rug') ? 40 : 300), k + ': fine parts', v); A(v.ms2 < 3, k + ': set down again cheaply', v); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
