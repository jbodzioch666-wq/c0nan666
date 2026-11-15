// RS-597: solid shadows under the trees again - no leaf's material is masked for a dappled shadow. Shot: shots/rs597-trees.png
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.mon = []; G.weather = 'clear'; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.45; O3.dist = 8;
    for (let i=0;i<150;i++) await new Promise(r=>requestAnimationFrame(r)); let leaves = 0, masked = 0;
    O3.scene.traverse(o=>{ if (!o.isMesh || !o.castShadow || !o.material || Array.isArray(o.material)) return; const g = o.geometry && o.geometry.type; if (g!=='IcosahedronGeometry' && g!=='ConeGeometry' && !(o.material.userData && o.material.userData.leafDepth)) return; leaves++; if (o.material.alphaMap || o.material.alphaTest > 0) masked++; });
    return { leaves, masked }; });
  await page.screenshot({ path: SHOTS + '/rs597-trees.png' });
  console.log(JSON.stringify(r));
  if (!(r.leaves > 3 && r.masked===0)) throw new Error('assert: the trees throw solid shadows ' + JSON.stringify(r));
};
