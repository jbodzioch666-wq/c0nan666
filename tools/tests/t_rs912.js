// RS-912: bees, the orchard and sheep. Built from Decorate's Build list: beehives in the garden (a skep, upgraded to a wooden hive) giving honey
// and beeswax a day; apple trees in the Estate's orchard (a ground of its own past the pasture, through a gate) that grow three days and then
// bear apples; a sheepfold in the pasture: lambs bought there grow into sheep, sheared for a fleece a day, spun into balls of wool at a
// spinning wheel (built for the house, set down anywhere indoors). Apples and honey are eaten. Shots: shots/rs912-models.jpg, rs912-sheep.jpg,
// rs912-yard.png
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    p.gold = 3e6; skGainXP('construction', 6e7); houseBuy(4); const h = houseP(); enterHouse(); await fr(5);
    const spotIn = (S, area, skip)=>{ for (const k in G.houseArea){ if (G.houseArea[k]!==area) continue; const [x, y] = k.split(',').map(Number); if (skip && skip(x, y)) continue; S.x = x + 0.5; S.z = y + 0.5; if (heditOk(S)) return [x, y]; } return null; };
    try{
    out.orchard = Object.values(G.houseArea).filter(a=>a==='orchard').length; out.gate = (()=>{ const P = housePlan(); return P.floors[0].doors.some(([x, y])=>x===P.orch.x0 - 1); })();
    heditStart(); G.hedit.cat = 'build'; heditPanel(true); out.list = [...document.querySelectorAll('#hedit [data-he="build"]')].map(b=>b.dataset.v + ':' + b.textContent.replace(/\s+/g, ' ').slice(0, 30));
    for (const [k, n] of Object.entries({ flax:200, logs:60, oak_plank:40, nails:200, plank:40, maple_plank:20 })) skAdd(k, n);
    /* a hive: built into your hand, set down in the garden, upgraded */
    heditBuild('hive'); out.hiveKey = G.hedit.sel && G.hedit.sel.work; out.hiveK = G.hedit.sel && G.hedit.sel.k; out.hiveAt = spotIn(G.hedit.sel, 'garden', (x, y)=>y < housePlan().garden.y0 + 2); out.hiveIn = spotIn(G.hedit.sel, 'in');
    out.hiveAt = spotIn(G.hedit.sel, 'garden'); heditUpgrade(); out.hiveK2 = G.hedit.sel.k; out.hiveNm = heditWorkName(G.hedit.sel); out.hivePlaced = heditPlace();
    /* a tree in the orchard; the fold in the pasture; the spinning wheel indoors */
    heditBuild('tree'); out.treeKey = G.hedit.sel && G.hedit.sel.work; out.treeGarden = !!spotIn(G.hedit.sel, 'garden'); out.treeAt = spotIn(G.hedit.sel, 'orchard'); out.treePlaced = heditPlace();
    heditBuild('fold'); out.foldAt = spotIn(G.hedit.sel, 'pasture', (x, y)=>x < housePlan().pas.x0 + 2); out.foldPlaced = heditPlace();
    heditBuild('spinwheel'); out.spinAt = spotIn(G.hedit.sel, 'in'); out.spinPlaced = heditPlace(); heditEnd(); await fr(3);
    out.benches = ROOM_LAYOUT.house.benches.map(b=>b[0]).filter(k=>/skep|hivebox|sapling|apple|fold|spinning/.test(k)).sort();
    /* two days on: honey and wax */
    p.clock += 2*DAY_LENGTH; out.stock = hiveStock('hive0'); hiveUse('hive0'); out.honey = skHave('honey'); out.wax = skHave('beeswax'); out.stock2 = hiveStock('hive0');
    /* the tree: growing, then bearing */
    out.tree0 = treeState('tree0').grown; p.clock += 2*DAY_LENGTH; houseRelayout(); out.treeKind = heWorkKind('tree0'); treeUse('tree0'); out.apples = skHave('apple'); out.treeKind2 = heWorkKind('tree0');
    /* sheep: four lambs at the fold, grown, sheared */
    out.sheepMax = farmMax('sheep'); const f = farmP(); f.feed = 60; out.bought = farmBuy('sheep', 6); for (const a of f.a) if (a.k==='sheep') a.g = FARM_KIND.sheep.grow; f.at = clockNow(); p.clock += 2*DAY_LENGTH; farmUpdate();
    out.shear = farmShear(); out.wool = skHave('wool'); houseRelayout(); out.sheepWalk = G.villagers.filter(v=>v.animal==='sheep').length;
    out.foods = skFoods().map(o=>o.id).filter(id=>id==='apple' || id==='honey').sort(); 
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    /* the models */
    const T = THREE, W = 300, H = 300, cols = 4;
    const shots = (list, mk)=>{ const sheet = document.createElement('canvas'); sheet.width = W*cols; sheet.height = H*Math.ceil(list.length/cols); const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace;
      list.forEach((it, i)=>{ const sc = new T.Scene(); sc.background = new T.Color(0x34402a); sc.add(new T.HemisphereLight(0xfff4e0, 0x403020, 1.6)); const dl = new T.DirectionalLight(0xffffff, 1.8); dl.position.set(2, 4, 3); sc.add(dl);
        const [m, nm] = mk(it); sc.add(m); const bb = new T.Box3().setFromObject(m), c = bb.getCenter(new T.Vector3()), sz = bb.getSize(new T.Vector3()).length();
        const cam = new T.PerspectiveCamera(32, 1, 0.01, 50); cam.position.set(c.x + sz*1.0, c.y + sz*0.6, c.z + sz*1.25); cam.lookAt(c); R.render(sc, cam);
        sx.drawImage(cv, (i % cols)*W, Math.floor(i/cols)*H); sx.fillStyle = '#fff'; sx.font = '15px sans-serif'; sx.fillText(nm, (i % cols)*W + 6, Math.floor(i/cols)*H + 18); });
      R.dispose(); return sheet.toDataURL('image/jpeg', 0.85); };
    const keep = JSON.stringify(h.yb);
    out.shot = shots([['skep'], ['hivebox'], ['sapling'], ['appletree'], ['appletreef'], ['fold', 1], ['fold', 2], ['spinning']], ([k, gr])=>{ if (gr) h.yb.fold = gr; return [heditWorkModel(k), k + (gr ? ' ' + gr : '')]; });
    h.yb = JSON.parse(keep);
    try{ out.sheep = shots([['#e8dcc8', 1], ['#2a2220', 1], ['#6a4a34', 0.4], ['#e8dcc8', 0.5, 0.75]], ([face, wool, sz])=>{ const m = m3dBeast({ head:'sheep', fur:'#ece6d6', face, wool, legs:'short', hoof:true, len:sz||0.9, tall:sz||0.9 }); m.rotation.y = 0.9; return [m, 'sheep ' + face + ' wool ' + wool]; }); }catch(e){ out.sheepErr = String(e.stack).slice(0, 300); }
    setUi('playing'); houseRelayout(); const pa = housePlan().pas; p.x = pa.x0 + 3; p.y = pa.y1; await fr(90); return out; });
  for (const [k, f] of [['shot', 'rs912-models.jpg'], ['sheep', 'rs912-sheep.jpg']]) if (r[k]){ fs.writeFileSync(path.join(__dirname, 'shots', f), Buffer.from(r[k].split(',')[1], 'base64')); delete r[k]; }
  await page.screenshot({ path:path.join(__dirname, 'shots', 'rs912-yard.png') });
  console.log(JSON.stringify(r));
  A(!r.err && !r.sheepErr, 'ran through', r);
  A(r.orchard > 20 && r.gate && ['hive', 'tree', 'fold', 'spinwheel'].every(k=>r.list.some(s=>s.startsWith(k + ':'))), 'the Estate\'s orchard and its gate; the Build list', r);
  A(r.hiveKey==='hive0' && r.hiveK==='skep' && !r.hiveIn && r.hiveAt && r.hiveK2==='hivebox' && r.hiveNm==='Wooden hive' && r.hivePlaced, 'a hive built, set in the garden (not indoors), upgraded', r);
  A(r.treeKey==='tree0' && !r.treeGarden && r.treeAt && r.treePlaced && r.foldAt && r.foldPlaced && r.spinAt && r.spinPlaced, 'the tree in the orchard only, the fold, the spinning wheel', r);
  A(['appletree', 'fold', 'hivebox', 'spinning'].every(k=>r.benches.includes(k) || (k==='appletree' && r.benches.includes('sapling'))), 'all stand in the house', r);
  A(r.stock.honey===4 && r.stock.wax===2 && r.honey===4 && r.wax===2 && !r.stock2.honey, 'two days of honey and wax', r);
  A(!r.tree0 && r.treeKind==='appletreef' && r.apples===3 && r.treeKind2==='appletree', 'the tree grown, its apples picked', r);
  A(r.sheepMax===4 && r.bought===4 && r.wool===8 && r.sheepWalk===4, 'four sheep, two days of wool', r);
  A(r.foods.join()==='apple,honey', 'apples and honey eaten', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
