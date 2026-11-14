// RS-910: the working pieces (bed, hearth, benches, altar, portal, garden beds, pens) are set down freely like any furnishing - a quarter of a
// step with snap on, anywhere with it off, turned an eighth at a time - and can go to the store and be set out again on either floor, indoors
// pieces anywhere indoors, beds in the garden, pens in the pasture. A room's rug is a piece of its own, picked up like the rest; Wenna sells
// every design (seven medallions, three kilims, chequers). Shots: shots/rs910-rugs.jpg, rs910-room.png
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    /* Wenna's rugs, and their models */
    const rugs = Object.keys(FURN).filter(k=>FURN[k].rug); out.rugs = rugs.length; out.inStock = rugs.every(k=>furnStock().includes(k)); out.flat = rugs.every(k=>FURN[k].flat && FURN[k].cat==='rug');
    const T = THREE, W = 260, H = 260, cols = 6, sheet = document.createElement('canvas'); sheet.width = W*cols; sheet.height = H*2; const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace;
    rugs.forEach((k, i)=>{ const sc = new T.Scene(); sc.background = new T.Color(0x3a2a1a); sc.add(new T.HemisphereLight(0xfff4e0, 0x403020, 2.2)); const g = furnInst(k); sc.add(g); const cam = new T.PerspectiveCamera(30, 1, 0.05, 20); cam.position.set(0, 5.6, 0.6); cam.lookAt(0, 0, 0); R.render(sc, cam);
      sx.drawImage(cv, (i % cols)*W, Math.floor(i/cols)*H); sx.fillStyle = '#fff'; sx.font = '14px sans-serif'; sx.fillText(FURN[k].nm, (i % cols)*W + 6, Math.floor(i/cols)*H + 18); });
    R.dispose(); out.shot = sheet.toDataURL('image/jpeg', 0.85);
    /* a new manor: its rooms' rugs laid as pieces */
    p.gold = 3e6; skGainXP('construction', 6e7); houseBuy(1); houseBuy(3); const h = houseP(); for (const s of HOUSE_SPOTS) h.built[s.id] = 1;
    out.rugsLaid = h.decor.filter(d=>FURN[d.k] && FURN[d.k].rug).map(d=>d.k + (d.f ? '^' : '')).sort();
    enterHouse(); await fr(20); out.decorDrawn = V3.decorGrp ? V3.decorGrp.children.length : 0;
    const find = key=>{ for (const t in G.houseWork) if (G.houseWork[t].key===key) return G.houseWork[t]; return null; };
    try{
    /* the hearth: picked up, turned an eighth, set down off the grid with snap off */
    heditStart(); const at = (x, y, z)=>{ const v = new THREE.Vector3(x, y, z).project(V3.cam), rc = V3.cv.getBoundingClientRect(); return { clientX:rc.left + (v.x + 1)/2*rc.width, clientY:rc.top + (1 - v.y)/2*rc.height, pointerType:'mouse', button:0 }; };
    const hw = find('hearth'); out.hearth0 = hw && [hw.x, hw.y]; heditPickWork(at(hw.x + 0.5, 0.5, hw.y + 0.5)); out.pick = G.hedit.sel && G.hedit.sel.work;
    heditTurn(1); G.hedit.snap = 0; const S = G.hedit.sel; out.turn = +S.r.toFixed(3); S.x = hw.x + 0.5 - 1.37; S.z = hw.y + 0.5 + 1.21; out.ok = heditOk(S); out.placed = heditPlace(); out.wpos = h.wpos.hearth;
    const h2 = find('hearth'); out.tile = h2 && [h2.x, h2.y]; out.exact = h2 && G.houseAt['hearth|' + h2.x + '|' + h2.y]; out.rot = h2 && G.houseRot['hearth|' + h2.x + '|' + h2.y];
    await fr(5);
    /* to the store, and out again upstairs */
    const h3 = find('hearth'); heditPickWork(at(G.houseAt['hearth|' + h3.x + '|' + h3.y][0], 0.5, G.houseAt['hearth|' + h3.x + '|' + h3.y][1])); out.pick2 = G.hedit.sel && G.hedit.sel.work; heditStore(); out.stored = !!(h.wpos.hearth && h.wpos.hearth.s) && !find('hearth') && !G.hedit.sel; out.list = heWorkStored(); heditEnd();
    houseStair(); heditStart(); heditTakeWork('hearth'); const U = G.hedit.sel, ch = housePlan().floors[1].rooms.find(o=>o.k==='chapel'); U.x = ch.x0 + 3.5; U.z = ch.y1 + 0.5 - 0.25; out.upOk = heditOk(U); out.upPlaced = heditPlace(); out.upAt = h.wpos.hearth; out.upHere = !!find('hearth'); heditEnd();
    /* a pen to the store: back out only in the pasture */
    houseStair(); out.down = !find('hearth'); heditStart(); await fr(5); const cp = find('coop'); heditPickWork(at(cp.x + 0.5, 0.4, cp.y + 0.5)); out.coopPick = G.hedit.sel && G.hedit.sel.work; heditStore(); heditTakeWork('coop'); const C = G.hedit.sel;
    C.x = housePlan().floors[0].rooms[0].x0 + 1.5; C.z = housePlan().floors[0].rooms[0].y0 + 1.5; out.coopIndoors = heditOk(C); const pa = housePlan().pas; C.x = pa.x0 + 3.5; C.z = pa.y0 + 2.5; out.coopPasture = heditOk(C); heditPlace();
    /* the great hall's rug picked up (not the furniture on it) and stored */
    await fr(5); const d = h.decor.find(d=>d.k==='rg_crimson' && !d.f); heditDown(at(d.x + 0.6, 0.006, d.z + 0.2)); out.rugSel = G.hedit.sel && G.hedit.sel.k; const rs0 = h.furn.rg_crimson||0; heditStore(); out.rugStore = (h.furn.rg_crimson||0) - rs0; heditTake('rg_kblue'); out.noKilim = !G.hedit.sel;
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    heditEnd(); setUi('playing'); p.x = housePlan().stair[0]; p.y = housePlan().stair[1] + 2; await fr(30); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs910-rugs.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  await page.screenshot({ path:path.join(__dirname, 'shots', 'rs910-room.png') });
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(r.rugs===11 && r.inStock && r.flat, 'eleven rug designs, all at Wenna\'s', r);
  A(r.rugsLaid.length===6 && r.rugsLaid.includes('rg_crimson') && r.rugsLaid.includes('rg_altar^') && r.decorDrawn >= 2, 'the manor\'s rooms come with their rugs as pieces', r);
  A(r.pick==='hearth' && Math.abs(r.turn - Math.PI/4) < 0.01 && r.ok && r.placed && r.wpos.px===+(r.hearth0[0] + 0.5 - 1.37).toFixed(3) && r.exact && Math.abs(r.rot - Math.PI/4) < 0.01, 'a working piece set down off the grid, turned an eighth', r);
  A(r.pick2==='hearth' && r.stored && r.list.includes('hearth') && r.upOk && r.upPlaced && r.upAt.f===1 && r.upHere && r.down, 'to the store, and set out upstairs', r);
  A(r.coopPick==='coop' && !r.coopIndoors && r.coopPasture, 'a pen only in the pasture', r);
  A(r.rugSel==='rg_crimson' && r.rugStore===1 && r.noKilim, 'a rug picked up and put in the store', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
