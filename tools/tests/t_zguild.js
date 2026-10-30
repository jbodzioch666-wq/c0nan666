// probe (RS-717): the guild hall's range close up: shots/zguild.png (and zguild2.png from nearer the master's side)
module.exports = async page=>{ page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; const city = townList().find(t=>townInfo(t.x, t.y).tier===2) || townList()[0];
    G.owPos = { x:city.x, y:city.y }; enterVillage(); setUi('playing'); enterInterior('guild'); p.x = 7; p.y = 9; ISO.dist = 5; renderGame(); });
  await page.waitForTimeout(3000); await page.screenshot({ path:SHOTS + '/zguild.png' });
  await page.evaluate(()=>{ G.player.x = 7; G.player.y = 7; ISO.dist = 4; renderGame(); }); await page.waitForTimeout(1500); await page.screenshot({ path:SHOTS + '/zguild2.png' });
};
