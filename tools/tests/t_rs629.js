// RS-629: a Planet is round - sailing west off the map's edge comes in at the east, and back; what you see is revealed across the seam;
// the 3D land carries on round it; another size still stops at its edge. Shot: shots/rs629-seam.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), out = {};
    goToCharCreate(); ccBegin(); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.hasBoat = true;
    { let y0 = -1; for (let y=0;y<OW_ROWS && y0<0;y++) if (G.ow.map[0][y]===OW_WATER) y0 = y; G.owPos = { x:0, y:y0 }; tryMoveOverworld(-1, 0); out.flatStops = G.owPos.x===0; }
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null; G.player.hasBoat = true; G.player.wildWarned = 1;
    const W = OW_COLS, y = Math.floor(OW_ROWS/2); out.seaBoth = G.ow.map[0][y]===OW_WATER && G.ow.map[W-1][y]===OW_WATER;
    G.owPos = { x:1, y }; for (let i=0;i<60;i++) await raf();
    tryMoveOverworld(-1, 0); for (let i=0;i<5;i++) await raf(); tryMoveOverworld(-1, 0); out.west = [G.owPos.x, G.owPos.y]; out.wrapped = G.owPos.x===W-1 && G.owPos.y===y;
    const s = owSeenArr(); out.seenBoth = !!(s[y*W + W - 4] && s[y*W + 3]);
    for (let i=0;i<120;i++) await raf(); out.o3 = !!(O3.win && Math.abs(O3.win.cx - G.owPos.x) < 30);
    tryMoveOverworld(1, 0); for (let i=0;i<5;i++) await raf(); out.back = G.owPos.x===0;
    for (let i=0;i<60;i++) await raf(); return out; });
  await page.screenshot({ path: SHOTS + '/rs629-seam.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.flatStops, 'another size still stops at its edge');
  A(r.seaBoth, 'open sea down the seam');
  A(r.wrapped && r.back, 'sailing west off the edge comes in at the east, and back');
  A(r.seenBoth, 'what you see is revealed on both sides of the seam');
  A(r.o3, 'the 3D land is built round you on the far side');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
