// RS-865: a tree's boughs closed at every bend - each length of trunk and branch was an open-ended cylinder, and where the next one turned
// away a ring of gap showed the grass behind it; now a rounded knuckle closes each joint. Shot: shots/rs865-tree.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const w = ms=>new Promise(r=>setTimeout(r, ms)); goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.clock = Math.round(0.45*DAY_LENGTH) + 3*DAY_LENGTH;
    const bark = [], cards = []; shireTree(0, 0, 0, 1, 4242, bark, cards); const cyl = bark.filter(g=>g.type==='CylinderGeometry'), knots = bark.filter(g=>g.type==='SphereGeometry');
    const big = cyl.filter(g=>g.parameters.radiusTop > 0.012).length;
    const t = townList().find(t=>(townFlavorAt(t.x, t.y)||{}).race==='elf') || townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    let tt = null; for (let x=0;x<COLS && !tt;x++) for (let y=0;y<ROWS;y++) if (G.villageDeco[x][y]==='tree'){ tt = [x, y]; break; } if (tt){ G.player.x = tt[0]; G.player.y = Math.min(ROWS - 2, tt[1] + 1); }
    for (let i=0;i<40;i++){ V3.dist = 3; if (V3.player) V3.player.g.scale.setScalar(0.001); renderGame(); await w(25); }
    return { cyl:cyl.length, big, knots:knots.length }; });
  await page.screenshot({ path: SHOTS + '/rs865-tree.png' }); console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  A(r.cyl > 20 && r.knots===r.big, 'a bough without its knuckle', r); };
