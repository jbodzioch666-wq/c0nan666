// RS-589: the book shut at your side in the barber's chair, as in the dye works. Shot: shots/rs589-barber.png
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; const wait = ms=>new Promise(r=>setTimeout(r, ms));
    G.gear.offhand = rsMakeArmour('cloth', 2, 'offhand'); G.player.gold = 999; openMakeover(); await wait(300);
    for (let i=0;i<400 && (!LP.e || LP.pend);i++) await wait(25); for (let i=0;i<8;i++) await new Promise(r=>requestAnimationFrame(r));
    const tg = LP.e && LP.e.rig.tome; return { ui:G.ui, tome:!!tg, shut:tg ? { closed:tg.getObjectByName('tomeClosed').visible, open:tg.getObjectByName('tomeOpen').visible } : null }; });
  await page.screenshot({ path: SHOTS + '/rs589-barber.png' });
  console.log(JSON.stringify(r));
  if (!(r.ui==='makeover' && r.tome && r.shut.closed && !r.shut.open)) throw new Error('assert: the book shut in the barber\'s chair ' + JSON.stringify(r));
};
