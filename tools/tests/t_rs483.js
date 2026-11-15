// RS-483: the title screen's import is a real file picker on the page, taking any file - a save file, or a text file holding a save code
module.exports = async page=>{
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.player.name = 'Filey'; saveCurrentGame(); setUi('titleScreen'); });
  const json = await page.evaluate(()=>JSON.stringify({ depthcrawlSave:1, version:GAME_VERSION, data:JSON.parse(localStorage.getItem(SAVE_PREFIX + G.saveId)) }));
  const inp = await page.$('input[type=file]'); const accept = await inp.getAttribute('accept');
  const n0 = await page.evaluate(()=>saveIndexList().length);
  await inp.setInputFiles({ name:'depthcrawl-filey.json', mimeType:'application/octet-stream', buffer:Buffer.from(json) }); await page.waitForTimeout(500);
  const n1 = await page.evaluate(()=>saveIndexList().length);
  const code = await page.evaluate(async j=>saveCodeOf(j), json);
  await (await page.$('input[type=file]')).setInputFiles({ name:'code.txt', mimeType:'text/plain', buffer:Buffer.from(code) }); await page.waitForTimeout(800);
  const n2 = await page.evaluate(()=>saveIndexList().length);
  const r = { accept, n0, n1, n2 }; console.log(JSON.stringify(r));
  if (accept) throw new Error('the picker takes any file '+JSON.stringify(r));
  if (n1!==n0 + 1) throw new Error('a save file imports from the page\'s own picker, whatever its type '+JSON.stringify(r));
  if (n2!==n1 + 1) throw new Error('a text file holding a save code imports too '+JSON.stringify(r));
};
