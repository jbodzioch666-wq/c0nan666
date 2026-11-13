// RS-913: trophy cases and the plot growing with the house. A trophy case (oak case, glass cabinet, gallery cabinet: 4, 8, 16 trophies) is
// built from Decorate's Build list and set down anywhere indoors; trophy scrolls are put in and taken out at it, each shown mounted - a fish
// on its board, a lump of ore on its plinth, sized by its weight, with a brass plaque. The plot on the land grows with the house (7, 9, 11,
// 13 tiles square): round the yard a box hedge, the garden's beds to the west, the pasture to the east, the Estate's orchard behind; staked
// out again if the bigger grounds don't fit where it was. Shots: shots/rs913-cases.jpg, rs913-plots.jpg, rs913-plot.jpg, rs913-room.png
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    { const roomy = ()=>{ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN && plotFind(x, y)) return { x, y }; return null; }, t = plotFind(G.owPos.x, G.owPos.y) ? null : roomy(); if (t){ G.owPos = t; enterVillage(); setUi('playing'); } }   /* (a town with open ground near it for a plot) */
    const T0 = { x:G.owPos.x, y:G.owPos.y }; p.gold = 3e6; skGainXP('construction', 6e7); houseBuy(1); out.bought = plotBuy(); out.r1 = plotR();
    try{
    /* the Manor: the grounds grow round the yard */
    houseBuy(3); const P = plotGet(); out.fit = plotR(); out.fitOk = out.fit===5 || (out.fit >= 3 && plotSiteOk(P.x, P.y, out.fit) && !plotSiteOk(P.x, P.y, out.fit + 1));
    if (out.fit < 5){ let best = null; for (let r=6;r<70 && !best;r++) for (let a=-r;a<=r && !best;a++) for (const [x, y] of [[P.x + a, P.y - r], [P.x + a, P.y + r], [P.x - r, P.y + a], [P.x + r, P.y + a]]) if (!best && x > 8 && y > 8 && x < OW_COLS - 8 && y < OW_ROWS - 8 && plotSiteOk(x, y)) best = [x, y];   /* (a test-only move to open ground: the grounds whole) */
      if (best){ P.x = best[0]; P.y = best[1]; P.r = null; G.plotSolid = null; O3.win = null; } }
    out.r3 = plotR(); out.siteOk = !!P && plotSiteOk(P.x, P.y);
    out.blocks = { hedge:plotBlock(P.x - 3, P.y), garden:plotBlock(P.x - 4, P.y + 1), pasture:plotBlock(P.x + 4, P.y), back:plotBlock(P.x, P.y - 4), path:plotBlock(P.x, P.y + 4), front:plotBlock(P.x + 1, P.y + 4),
      fence:plotBlock(P.x + 1, P.y + 5), gate:plotBlock(P.x, P.y + 5), yard:plotBlock(P.x + 2, P.y + 1), out:plotBlock(P.x, P.y + 6) };
    /* in at the gate and up the path to the yard */
    G.gameMode = 0; G.owPos = { x:P.x, y:P.y + 7 }; await fr(30); for (let i=0;i<7;i++){ tryMoveOverworld(0, -1); await fr(2); } out.at = [G.owPos.x - P.x, G.owPos.y - P.y]; await fr(20);
    out.root = !!O3.yardRoot; const c = o3C(P.x, P.y), hs = []; for (const [a, b] of [[-4.5, -4.5], [4.5, 4.5], [0, 0], [-4, 4], [4.8, -4.8]]) hs.push(O3.heightAt(c[0] + a, c[1] + b)); out.flat = +(Math.max(...hs) - Math.min(...hs)).toFixed(3);
    out.trees = 0; O3.scene.traverse(o=>{ if (o.isInstancedMesh && o.count && /tree|bush|trunk|leaf|canopy/i.test(o.name || '')){ const m = new THREE.Matrix4(), v = new THREE.Vector3(); for (let i=0;i<o.count;i++){ o.getMatrixAt(i, m); v.setFromMatrixPosition(m).applyMatrix4(o.matrixWorld); if (Math.abs(v.x - c[0]) < 5.2 && Math.abs(v.z - c[1]) < 5.2) out.trees++; } } });
    { const R = O3.renderer, T = THREE, y = O3.heightAt(c[0], c[1]), sz = R.getSize(new T.Vector2()), cam = new T.PerspectiveCamera(38, sz.x/sz.y, 0.05, 200); cam.position.set(c[0] + 6, y + 8, c[1] + 11); cam.lookAt(c[0], y + 0.3, c[1] - 0.5); R.render(O3.scene, cam); out.plotShot = R.domElement.toDataURL('image/jpeg', 0.88); }
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    /* the four plots side by side */
    { const T = THREE, W = 480, H = 360, sheet = document.createElement('canvas'); sheet.width = W*2; sheet.height = H*2; const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.shadowMap.enabled = true; const M = o3QsMats(); out.yardParts = [];
      for (let n=1;n<=4;n++){ const A = plotR(n), sc = new T.Scene(); sc.background = new T.Color(0x8ab0d0); sc.add(new T.HemisphereLight(0xfff4e0, 0x506040, 1.2)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(3, 6, 4); d.castShadow = true; d.shadow.mapSize.set(2048, 2048); d.shadow.camera.left = d.shadow.camera.bottom = -A - 1; d.shadow.camera.right = d.shadow.camera.top = A + 1; sc.add(d);
        const fl = new T.Mesh(new T.PlaneGeometry(2*A + 8, 2*A + 8), new T.MeshStandardMaterial({ color:0x5a8a3a })); fl.rotation.x = -Math.PI/2; fl.receiveShadow = true; sc.add(fl);
        for (const [key, z] of [['plot:home' + n, PLOT_HOME_Z], [n===1 ? 'plot:yard' : 'plot:yard' + n, 0]]){ const S = o3QsScene(key); if (key.startsWith('plot:yard')) out.yardParts.push(S.parts.length); for (const [geo, mk] of S.parts){ const o = new T.Mesh(geo, M[mk]); o.castShadow = o.receiveShadow = true; o.position.z = z; sc.add(o); } }
        const cam = new T.PerspectiveCamera(36, W/H, 0.05, 80); cam.position.set(A*0.7, A*1.35, A*1.85); cam.lookAt(0, 0.2, -0.4); R.render(sc, cam); sx.drawImage(cv, ((n - 1) % 2)*W, Math.floor((n - 1)/2)*H); }
      R.dispose(); out.plots = sheet.toDataURL('image/jpeg', 0.88); }
    /* trophy cases, in the house */
    try{
    G.owPos = { x:T0.x, y:T0.y }; G.gameMode = 3; enterVillage(); setUi('playing'); enterHouse(); await fr(5); const h = houseP();
    const mk = (id, nm, w, u)=>{ const it = newItem(); Object.assign(it, { used:1, consumable:0, kind:'scroll', trophy:id, nm:`Trophy ${nm} (${w} ${u})`, price:300 }); G.inv.push(it); return it; };
    const tr = [mk('salmon', 'Salmon', 14.2, 'lb'), mk('shark', 'Shark', 48, 'lb'), mk('iron', 'Iron Ore', 9.5, 'kg'), mk('goldore', 'Gold Ore', 22, 'kg'), mk('trout', 'Trout', 4.1, 'lb')];
    for (const [k, n] of Object.entries({ plank:20, nails:80, oak_plank:20, glass:20, maple_plank:20, goldb:4 })) skAdd(k, n);
    heditStart(); G.hedit.cat = 'build'; heditPanel(true); out.inList = [...document.querySelectorAll('#hedit [data-he="build"]')].some(b=>b.dataset.v==='tcase');
    heditBuild('tcase'); out.key = G.hedit.sel && G.hedit.sel.work; out.k = G.hedit.sel && G.hedit.sel.k; out.name = heditWorkName(G.hedit.sel);
    const hall = housePlan().floors[0].rooms.find(o=>o.k==='hall') || housePlan().floors[0].rooms[0], S = G.hedit.sel; let ok = false;
    for (let y=hall.y0; y<=hall.y1 && !ok; y++) for (let x=hall.x0 + 1; x<=hall.x1 && !ok; x++){ S.x = x + 0.5; S.z = y + 0.5; ok = heditOk(S); }
    out.ok = ok; out.placed = heditPlace(); heditEnd(); await fr(3);
    out.bench = ROOM_LAYOUT.house.benches.some(b=>b[0]==='tcase1'); const at = Object.keys(G.houseWork).find(t=>G.houseWork[t].key==='tcase0');
    /* put in: four fit, the fifth doesn't */
    out.ins = tr.map(it=>tcaseIn('tcase0', it)); out.held = h.tc.tcase0.length; out.bagLeft = G.inv.filter(it=>it.trophy).length;
    G.benchXY = at.split(',').map(Number); houseBench('tcase1'); out.dlg = G.ui==='wevent' && G.wevDlg.opts.map(o=>o[0]); setUi('playing');
    out.outOk = tcaseOut('tcase0', tr[1]); out.held2 = h.tc.tcase0.length; out.inBag = G.inv.includes(tr[1]);
    /* upgraded: the glass cabinet holds eight */
    h.yb.tcase0 = 2; out.cap2 = tcaseCap('tcase0'); out.k2 = heWorkKind('tcase0'); tcaseIn('tcase0', tr[1]); tcaseIn('tcase0', tr[4]); out.held3 = h.tc.tcase0.length; houseRelayout(); await fr(4);
    out.bench2 = ROOM_LAYOUT.house.benches.some(b=>b[0]==='tcase2');
    /* a second case; saves keep the trophies */
    heditStart(); heditBuild('tcase'); out.key2 = G.hedit.sel && G.hedit.sel.work; heditCancel(); heditEnd();
    const sv = JSON.parse(JSON.stringify(p.house)); out.saved = sv.tc.tcase0.length===5 && sv.tc.tcase0[0].trophy==='salmon';
    p.x = +at.split(',')[0]; p.y = +at.split(',')[1] + 2; await fr(40);
    }catch(e){ out.err2 = String(e.stack).slice(0, 400); }
    /* every grade, filled */
    { const T = THREE, W = 360, H = 400, list = [1, 2, 3], sheet = document.createElement('canvas'); sheet.width = W*3; sheet.height = H; const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace;
      const ids = [['salmon', 'Salmon', 14, 'lb'], ['iron', 'Iron Ore', 6, 'kg'], ['shark', 'Shark', 50, 'lb'], ['goldore', 'Gold Ore', 20, 'kg'], ['trout', 'Trout', 4, 'lb'], ['runite', 'Runite Ore', 30, 'kg'], ['tuna', 'Tuna', 30, 'lb'], ['coal', 'Coal', 8, 'kg'], ['pike', 'Pike', 9, 'lb'], ['mithril', 'Mithril Ore', 12, 'kg'], ['lobster', 'Lobster', 5, 'lb'], ['adamant', 'Adamant Ore', 16, 'kg'], ['swordfish', 'Swordfish', 40, 'lb'], ['silver', 'Silver Ore', 9, 'kg'], ['eel', 'Eel', 6, 'lb'], ['copper', 'Copper Ore', 4, 'kg']];
      list.forEach((gr, i)=>{ V3.tcShow = ids.slice(0, [0, 4, 8, 16][gr]).map(([id, nm, w, u])=>({ trophy:id, nm:`Trophy ${nm} (${w} ${u})` })); const sc = new T.Scene(); sc.background = new T.Color(0x2e261c);
        sc.add(new T.HemisphereLight(0xfff4e0, 0x403020, 1.5)); const dl = new T.DirectionalLight(0xffffff, 1.7); dl.position.set(1.5, 3, 4); sc.add(dl);
        const m = heditWorkModel('tcase' + gr); sc.add(m); const bb = new T.Box3().setFromObject(m), c = bb.getCenter(new T.Vector3()), sz = bb.getSize(new T.Vector3()).length();
        const cam = new T.PerspectiveCamera(30, W/H, 0.05, 50); cam.position.set(c.x + sz*0.55, c.y + sz*0.3, c.z + sz*1.6); cam.lookAt(c); R.render(sc, cam);
        sx.drawImage(cv, i*W, 0); sx.fillStyle = '#fff'; sx.font = '15px sans-serif'; sx.fillText(YARD_PIECES.find(o=>o.id==='tcase').tiers[gr - 1].gn, i*W + 6, 18); });
      V3.tcShow = null; R.dispose(); out.cases = sheet.toDataURL('image/jpeg', 0.88); }
    return out; });
  for (const [k, f] of [['plotShot', 'rs913-plot.jpg'], ['plots', 'rs913-plots.jpg'], ['cases', 'rs913-cases.jpg']]) if (r[k]){ fs.writeFileSync(path.join(__dirname, 'shots', f), Buffer.from(r[k].split(',')[1], 'base64')); delete r[k]; }
  await page.screenshot({ path:path.join(__dirname, 'shots', 'rs913-room.png') });
  console.log(JSON.stringify(r));
  A(!r.err && !r.err2, 'ran through', r);
  A(r.bought && r.r1===3 && r.fitOk && r.r3===5 && r.siteOk, 'the plot grows with the house, as far as the land allows', r);
  const b = r.blocks; A(b.hedge==='wall' && b.garden==='wall' && b.pasture==='wall' && b.back==='wall' && b.path===null && b.front===null && b.fence==='wall' && b.gate===null && b.yard===null && b.out===null, 'the hedge and grounds solid, the gate and the way to the yard open', b);
  A(r.at[0]===0 && r.at[1]===0 && r.root && r.flat < 0.02 && r.trees===0, 'in at the gate, up the path to the yard: the grounds levelled and cleared', r);
  A(r.yardParts.length===4 && r.yardParts[3] > r.yardParts[0], 'the bigger houses\' grounds', r);
  A(r.inList && r.key==='tcase0' && r.k==='tcase1' && r.name==='Oak case' && r.ok && r.placed && r.bench, 'a trophy case built and set down indoors', r);
  A(r.ins.join()==='true,true,true,true,false' && r.held===4 && r.bagLeft===1 && r.dlg && r.dlg.filter(s=>/^Take out/.test(s)).length===4 && !r.dlg.some(s=>/^Put in/.test(s)), 'four trophies in an oak case, no room for the fifth', r);
  A(r.outOk && r.held2===3 && r.inBag && r.cap2===8 && r.k2==='tcase2' && r.held3===5 && r.bench2 && r.key2==='tcase1' && r.saved, 'taken out, the glass cabinet holds more, saved with the house', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
