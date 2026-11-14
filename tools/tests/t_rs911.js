// RS-911: Decorate's Build list makes a working piece into your hand to set down (no more empty spaces on the plan); a piece picked up shows
// its grade and is upgraded where it stands - the straw, oak and four-poster bed, hearth and iron range, furnace and blast furnace, anvil and
// steel anvil, oak, marble and gilded altar, hen house and big coop, byre and big byre - each with its own model and what it does.
// Shots: shots/rs911-grades.jpg (every grade), rs911-room.png
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    p.gold = 3e6; skGainXP('construction', 6e7); houseBuy(3); const h = houseP(); enterHouse(); await fr(5);
    out.noSpots = !ROOM_LAYOUT.house.benches.some(b=>/^spot_/.test(b[0]));
    try{
    /* the Build list: the bed made, into your hand, set down in the great hall */
    heditStart(); G.hedit.cat = 'build'; heditPanel(true); out.buildList = [...document.querySelectorAll('#hedit [data-he="build"]')].map(b=>b.dataset.v);
    out.noLogs = heditBuild('bed') || 0; out.bedBuilt0 = houseTier('bed');
    skAdd('logs', 10); heditBuild('bed'); out.bedBuilt = houseTier('bed'); out.inHand = G.hedit.sel && G.hedit.sel.work; out.name1 = heditWorkName(G.hedit.sel);
    heditPanel(true); out.pips = document.querySelectorAll('#hedit .he-pips i').length; out.upBtn = !!document.querySelector('#hedit [data-he="upg"]');
    /* upgraded in hand: no oak, then oak, then the four-poster */
    heditUpgrade(); out.noOak = houseTier('bed');
    skAdd('oak_plank', 8); skAdd('linen', 10); heditUpgrade(); out.oak = houseTier('bed'); out.name2 = heditWorkName(G.hedit.sel);
    skAdd('yew_plank', 10); skAdd('goldb', 2); heditUpgrade(); out.four = houseTier('bed'); out.name3 = heditWorkName(G.hedit.sel); heditPanel(true); out.upBtn3 = !!document.querySelector('#hedit [data-he="upg"]');
    const hall = housePlan().floors[0].rooms.find(o=>o.k==='hall'), S = G.hedit.sel; S.x = hall.x0 + 2.5; S.z = hall.y0 + 1.5; out.ok = heditOk(S); out.placed = heditPlace(); heditEnd();
    /* the rest built and upgraded to the top */
    for (const sp of HOUSE_SPOTS){ if (!houseTier(sp.id)) h.built[sp.id] = 1; const gs = houseGrades(sp.id); h.built[sp.id] = gs.length; }
    out.altarM = houseAltarMult();
    /* what the grades do: the range burns half, the blast furnace pours more, the steel anvil pays more, the bed leaves you well rested */
    G.cookAt = 'hearth'; const f = SK_FISH[0]; skP().skills.cooking = 0; h.built.hearth = 1; const b1 = skBurnChance(f); h.built.hearth = 2; const b2 = skBurnChance(f); out.burn = [b1, b2];
    skAdd('iron', 1400); skP().skills.smithing = 2e7; const i0 = skHave('ironb'); skSmelt('ironb', true); out.smelted = skHave('ironb') - i0;
    const m0 = skXpMult('smithing'); out.rest0 = restLeft(); G.benchXY = null; houseBench('bed'); out.rest = restLeft(); out.restMult = +(skXpMult('smithing')/m0).toFixed(3);
    /* the pens: the big coop takes more hens */
    out.hens1 = farmMax('chicken'); heditStart(); houseRelayout(); await fr(3); const cp = (()=>{ for (const t in G.houseWork) if (G.houseWork[t].key==='coop') return G.houseWork[t]; })();
    const at = (x, y, z)=>{ const v = new THREE.Vector3(x, y, z).project(V3.cam), rc = V3.cv.getBoundingClientRect(); return { clientX:rc.left + (v.x + 1)/2*rc.width, clientY:rc.top + (1 - v.y)/2*rc.height, pointerType:'mouse', button:0 }; };
    heditPickWork(at(cp.x + 0.5, 0.4, cp.y + 0.5)); out.coopSel = G.hedit.sel && G.hedit.sel.work; skAdd('oak_plank', 16); skAdd('nails', 30); heditUpgrade(); out.coopGrade = penGrade('coop'); out.coopName = heditWorkName(G.hedit.sel); heditCancel(); heditEnd(); out.hens2 = farmMax('chicken');
    h.pg.byre = 2;
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    h.pg = h.pg || {};
    /* every grade's model, side by side */
    const T = THREE, W = 300, H = 300, list = [['bed',1],['bed',2],['bed',3],['hearth',1],['hearth',2],['furnace',1],['furnace',2],['anvil',1],['anvil',2],['altar',1],['altar',2],['altar',3],['coop',1],['coop',2],['byre',1],['byre',2]], cols = 6;
    const sheet = document.createElement('canvas'); sheet.width = W*cols; sheet.height = H*Math.ceil(list.length/cols); const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace; const keep = JSON.stringify([h.built, h.pg]);
    list.forEach(([k, gr], i)=>{ if (PEN_GRADES[k]) h.pg[k] = gr; else h.built[HOUSE_SPOTS.find(s=>s.k===k).id] = gr; const sc = new T.Scene(); sc.background = new T.Color(0x2e261c);
      sc.add(new T.HemisphereLight(0xfff4e0, 0x403020, 1.6)); const dl = new T.DirectionalLight(0xffffff, 1.6); dl.position.set(2, 4, 3); sc.add(dl);
      const m = heditWorkModel(k); sc.add(m); const bb = new T.Box3().setFromObject(m), c = bb.getCenter(new T.Vector3()), sz = bb.getSize(new T.Vector3()).length();
      const cam = new T.PerspectiveCamera(32, 1, 0.05, 50); cam.position.set(c.x + sz*0.95, c.y + sz*0.75, c.z + sz*1.35); cam.lookAt(c); R.render(sc, cam);
      sx.drawImage(cv, (i % cols)*W, Math.floor(i/cols)*H); sx.fillStyle = '#fff'; sx.font = '15px sans-serif'; sx.fillText(houseGrades(PEN_GRADES[k] ? k : HOUSE_SPOTS.find(s=>s.k===k).id)[gr - 1].gn, (i % cols)*W + 6, Math.floor(i/cols)*H + 18); });
    R.dispose(); out.shot = sheet.toDataURL('image/jpeg', 0.85); [h.built, h.pg] = JSON.parse(keep);
    setUi('playing'); houseRelayout(); const hall = housePlan().floors[0].rooms.find(o=>o.k==='hall'); p.x = hall.x0 + 2; p.y = hall.y1; await fr(30); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs911-grades.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  await page.screenshot({ path:path.join(__dirname, 'shots', 'rs911-room.png') });
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(r.noSpots && r.buildList.includes('bed') && r.buildList.includes('portal'), 'no empty spaces on the plan; the Build list', r);
  A(!r.bedBuilt0 && r.bedBuilt===1 && r.inHand==='bed' && r.name1==='Straw bed' && r.pips===3 && r.upBtn, 'the bed built into your hand, its grade shown', r);
  A(r.noOak===1 && r.oak===2 && r.name2==='Oak bed' && r.four===3 && r.name3==='Four-poster bed' && !r.upBtn3, 'upgraded to the oak bed and the four-poster', r);
  A(r.ok && r.placed, 'set down in the great hall', r);
  A(r.altarM===4 && Math.abs(r.burn[1] - r.burn[0]/2) < 1e-9 && r.burn[0] > 0 && r.smelted > 700 && !r.rest0 && r.rest===1200 && r.restMult > 1.05, 'what the grades do', r);
  A(r.coopSel==='coop' && r.coopGrade===2 && r.coopName==='Big coop' && r.hens1===6 && r.hens2===8, 'the big coop, more hens', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
