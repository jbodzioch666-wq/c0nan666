// RS-906: furnishing plans and trophies. A plan is learned for good (p.fplans): read from a scroll that drops (FPLAN_DROP) or comes in a
// casket, or bought from Wenna (three a day). A piece is made at a carpentry bench - the carpenter's workbench now built in your own
// workshop, or the Boatyard's - from planks and nails (linen for cloth, a bar for metal) by Construction level, into the house's store.
// Six pieces are made only from plans; a boss gives its site's trophy (dragon head, giant's skull, golden idol, crown) the first time,
// kept for you if you've no house yet. Shot: shots/rs906-pieces.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    /* a trophy before there's a house: kept */
    out.t1 = furnTrophy('lair'); out.t2 = furnTrophy('lair'); out.pend = (p.furnPend||{}).tdragon;
    out.stockClean = furnStock().every(k=>!FURN[k].plan && !FURN[k].trophy);
    p.gold = 400000; houseBuy(); const h = houseP(); out.merged = h.furn.tdragon===1 && !p.furnPend;
    /* Wenna's plans */
    setUi('furnisher'); const ov = document.getElementById('overlay'); out.planRows = ov.querySelectorAll('[data-fplan]').length; const pk = furnPlanStock()[0], g0 = p.gold; furnPlanBuy(pk); out.bought = !!(p.fplans||{})[pk] && g0 - p.gold===furnPlanPrice(pk); setUi('playing');
    /* a plan scroll read from the pack; a second copy kept */
    const it = furnPlanItem('armour'); addToInventory(it); useFromInv(G.inv.indexOf(it)); out.learned = !!p.fplans.armour && !G.inv.includes(it);
    const it2 = furnPlanItem('armour'); addToInventory(it2); useFromInv(G.inv.indexOf(it2)); out.dupKept = G.inv.includes(it2);
    out.roll = furnPlanRoll(); out.rollOk = !!FURN[out.roll] && !FURN[out.roll].trophy && !p.fplans[out.roll];
    /* the workbench in your workshop */
    const wb = HOUSE_SPOTS.find(s=>s.id==='workbench'); out.spot = !!wb && wb.k==='carpentry' && wb.room==='workshop';
    h.size = 2; h.rooms.push({ k:'workshop', c:0, r:1 }); h.built.workbench = 1; enterHouse(); const wbAt = ROOM_LAYOUT.house.benches.find(b=>b[0]==='carpentry'); out.inHouse = !!wbAt;
    G.benchXY = wbAt; houseCarpentry(); out.dlg = G.ui==='wevent' && /furnishings/i.test(document.getElementById('overlay').textContent);
    G.wevDlg.opts[0][1](); await new Promise(q=>setTimeout(q, 20)); out.craftUi = G.ui;
    /* made: too low, then with the level and the stuff */
    skP().skills.construction = 0; renderOverlay(); out.lowOff = !!document.querySelector('[data-fmake="armour"][disabled]');
    skP().skills.construction = SK_XP[99]; const c = furnCost('armour'); for (const k in c) skAdd(k, c[k]); renderOverlay(); out.cost = c; out.onBtn = !!document.querySelector('[data-fmake="armour"]:not([disabled])');
    const x0 = skP().skills.construction, n0 = h.furn.armour||0; furnMake('armour'); out.made = (h.furn.armour||0) - n0; out.spent = Object.keys(c).every(k=>skHave(k) < c[k]);
    setUi('playing');
    /* every new piece: smooth, merged, cheap to set down */
    const KEYS = ['armour', 'fountain', 'tapestry', 'harp', 'clock', 'wrack', 'tdragon', 'tskull', 'tidol', 'tcrown']; out.pieces = {};
    for (const k of KEYS){ const t0 = performance.now(), m = furnModel(k), ms = performance.now() - t0; let tris = 0, meshes = 0, flat = 0; m.traverse(o=>{ if (!o.isMesh) return; meshes++; tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count)/3; if (o.material.flatShading) flat++; }); out.pieces[k] = { tris:Math.round(tris), meshes, flat, ms:+ms.toFixed(1) }; }
    const T = THREE, W = 300, H = 300, cols = 5, sheet = document.createElement('canvas'); sheet.width = W*cols; sheet.height = H*2; const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true;
    KEYS.forEach((k, i)=>{ const sc = new T.Scene(); sc.background = new T.Color(0x3a3028); sc.add(new T.HemisphereLight(0xfff0e0, 0x403020, 1.1)); const d = new T.DirectionalLight(0xfff0d8, 2.2); d.position.set(2, 4, 3); d.castShadow = true; d.shadow.camera.left = d.shadow.camera.bottom = -2; d.shadow.camera.right = d.shadow.camera.top = 2; sc.add(d);
      const fl = new T.Mesh(new T.PlaneGeometry(8, 8), new T.MeshStandardMaterial({ color:0x6a5440 })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl); const g = furnInst(k); if (FURN[k].wall) g.position.y = 0.8; g.traverse(o=>{ if (o.isMesh) o.castShadow = true; }); sc.add(g);
      const bb = new T.Box3().setFromObject(g), cc = bb.getCenter(new T.Vector3()), s = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z), cam = new T.PerspectiveCamera(32, W/H, 0.01, 30);
      cam.position.set(cc.x + s*1.1, cc.y + s*0.5, cc.z + s*1.9); cam.lookAt(cc); R.render(sc, cam); sx.drawImage(cv, (i % cols)*W, Math.floor(i/cols)*H); sx.fillStyle = '#fff'; sx.font = '16px sans-serif'; sx.fillText(k, (i % cols)*W + 8, Math.floor(i/cols)*H + 20); });
    R.dispose(); out.shot = sheet.toDataURL('image/jpeg', 0.88); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs906-pieces.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  A(r.t1==='tdragon' && r.t2===null && r.pend===1 && r.merged, "a lair boss's dragon head, once; kept until there's a house", r);
  A(r.stockClean && r.planRows===3 && r.bought, "Wenna sells neither plan-only pieces nor trophies; three plans a day, learned when bought", r);
  A(r.learned && r.dupKept && r.rollOk, 'a plan read and learned; a known one kept; drops roll unknown plans', r);
  A(r.spot && r.inHouse && r.dlg && r.craftUi==='furnCraft', "the carpenter's workbench in the workshop opens the furnishings", r);
  A(r.lowOff && r.onBtn && r.made===1 && r.spent, 'made by Construction level from planks, nails and a bar, into the store', r);
  for (const [k, v] of Object.entries(r.pieces)) A(!v.flat && v.meshes <= 9 && v.tris > 500, k + ': smooth parts merged by material', v);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
