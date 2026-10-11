// RS-336: every town gate - the timber palisade gate and a city's stone gatehouse - is bigger, has two oak doors standing
// open, and hangs the race's banner (its emblem in gold) on either side
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false; v3Pref = false;
    const out = {}, tl = townList();
    const look = ()=>{ const mats = v3Materials(), grp = new THREE.Group(); Object.assign(V3, { lamps:[], windows:[], flames:[], smoke:[], signs:[], banners:[], hits:[], parts:[] }); v3Palisade(mats, grp); const bm = v3RaceBannerMat(G.villageRace || 'human');
      let banners = 0, rings = 0; grp.traverse(o=>{ if (o.isMesh && o.material===bm) banners++; if (o.isMesh && o.geometry.type==='TorusGeometry') rings++; }); return { race:G.villageRace, walled:!!(G.townLy && G.townLy.info.style.walled), banners, doors:rings }; };
    const small = tl.find(t=>townTier(t.x, t.y) < 2) || tl[1];
    G.gameMode = 0; G.owPos = { x:small.x, y:small.y }; enterVillage(); setUi('playing'); out.town = look();
    const big = tl[0]; townRec(townKeyAt(big.x, big.y)).up.grow = 2; G.gameMode = 0; G.owPos = { x:big.x, y:big.y }; enterVillage(); setUi('playing'); out.city = look();
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(!r.town.walled && r.town.banners===2 && r.town.doors===2, 'a palisade gate: two race banners and two doors');
  A(r.city.walled && r.city.banners===2 && r.city.doors===2, 'a city gatehouse: two race banners and two doors');
  console.log('gates ok', JSON.stringify(r));
};
