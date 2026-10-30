// RS-745: the carpentry bench stands in the Boatyard, not in your house: walk up to it and saw logs into flatpacks for Construction xp
// and gold; the house's Workshop no longer has one, and a house that built one drops it. Shots: rs745_yard.png, rs745_bench.jpg
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, fs = require('fs');
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60*12; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    enterInterior('boatyard'); for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const out = { deco:G.villageDeco[6][6], tile:G.map[6][6]===T_BENCH };
    /* walk up to it and use it */
    skAdd('logs', 8); const xp0 = skP().skills.construction || 0, g0 = p.gold; p.x = 6; p.y = 7; moveDir(0, -1);
    out.dlg = { ui:G.ui, title:G.wevDlg && G.wevDlg.title, sub:G.wevDlg && G.wevDlg.sub };
    if (G.ui==='wevent') wevChoose(1); out.made = { xp:(skP().skills.construction||0) - xp0, gold:p.gold - g0, logs:skHave('logs') };
    setUi('playing'); p.x = 7; p.y = 8; for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const T = THREE, R = V3.renderer, sz = R.getSize(new T.Vector2()), c = new T.PerspectiveCamera(40, sz.x/sz.y, 0.05, 100); c.position.set(8.2, 1.9, 8.6); c.lookAt(6.5, 0.6, 6.5); c.updateProjectionMatrix(); R.render(V3.scene, c); out.shot = R.domElement.toDataURL('image/jpeg', 0.88);
    /* the house: no carpentry bench to build, and an old one dropped */
    out.spot = HOUSE_SPOTS.some(s=>s.id==='carpentry'); out.room = HOUSE_ROOMS.workshop.does;
    p.house = { v:2, size:1, rooms:[{ k:'parlour', c:0, r:0 }, { k:'workshop', c:1, r:0 }], built:{ carpentry:1, furnace:1 } }; const h = houseP(); out.built = Object.keys(h.built).join();
    return out; });
  fs.writeFileSync(SHOTS + '/rs745_bench.jpg', Buffer.from(r0.shot.split(',')[1], 'base64')); delete r0.shot;
  await page.screenshot({ path:SHOTS + '/rs745_yard.png' });
  console.log(JSON.stringify(r0));
  A(r0.deco==='bench:carpentry' && r0.tile, 'the carpentry bench stands in the Boatyard: ' + JSON.stringify(r0));
  A(r0.dlg.ui==='wevent' && r0.dlg.title==='Carpentry bench' && r0.dlg.sub==='the Boatyard', 'walking into it opens it: ' + JSON.stringify(r0.dlg));
  A(r0.made.xp > 0 && r0.made.gold > 0 && r0.made.logs < 8, 'flatpacks for xp and gold: ' + JSON.stringify(r0.made));
  A(!r0.spot && !/carpentry/.test(r0.room) && r0.built==='furnace', 'the house has none, and an old one is dropped: ' + JSON.stringify(r0));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
