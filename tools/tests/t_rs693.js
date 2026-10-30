// RS-693: Import Without a Picker. Where the IMPORT button's file picker never opens (the claude.ai page can block it), the paste box
// opens by itself after a moment; where a picker does open (the focus goes) or a file comes, it doesn't. A save file dropped on the title
// screen, or on the paste box, imports. A click on the button still opens a picker where pickers work.
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.player.name = 'Droppy'; saveCurrentGame(); setUi('titleScreen'); });
  const json = await page.evaluate(()=>JSON.stringify({ depthcrawlSave:1, version:GAME_VERSION, data:JSON.parse(localStorage.getItem(SAVE_PREFIX + G.saveId)) }));
  const r = {}, n = ()=>page.evaluate(()=>saveIndexList().length), box = ()=>page.evaluate(()=>!!document.getElementById('saveCodeBox')), shut = ()=>page.evaluate(()=>{ const b = document.getElementById('saveCodeBox'); if (b) b.remove(); });
  /* no picker: nothing takes the focus and no file comes */
  await page.evaluate(()=>{ window.focus(); importPickWatch(); }); await page.waitForTimeout(400); r.boxEarly = await box(); await page.waitForTimeout(1200);
  r.boxNoPicker = await box(); r.dropHint = await page.evaluate(()=>/drop the save file/.test((document.getElementById('saveCodeBox')||{}).textContent||'')); await shut();
  /* a picker opened (the window loses the focus) */
  await page.evaluate(()=>{ importPickWatch(); window.dispatchEvent(new Event('blur')); }); await page.waitForTimeout(1600); r.boxPicker = await box(); await shut();
  /* a file picked in time */
  const n0 = await n(); await page.evaluate(()=>importPickWatch()); await (await page.$('input[type=file]')).setInputFiles({ name:'s.json', mimeType:'application/json', buffer:Buffer.from(json) });
  await page.waitForTimeout(1600); r.picked = (await n()) - n0; r.boxPicked = await box(); await shut();
  /* dropped on the title screen, and on the paste box (which closes) */
  const drop = sel=>page.evaluate(([j, sel])=>{ const dt = new DataTransfer(); dt.items.add(new File([j], 'depthcrawl-droppy.json', { type:'application/json' })); const el = document.querySelector(sel) || document.body;
    const ov = new DragEvent('dragover', { bubbles:true, cancelable:true, dataTransfer:dt }); el.dispatchEvent(ov); el.dispatchEvent(new DragEvent('drop', { bubbles:true, cancelable:true, dataTransfer:dt })); return ov.defaultPrevented; }, [json, sel]);
  const n1 = await n(); r.overTitle = await drop('.slotlist'); await page.waitForTimeout(600); r.dropTitle = (await n()) - n1;
  await page.evaluate(()=>pasteSaveCode()); const n2 = await n(); r.overBox = await drop('#saveCodePaste'); await page.waitForTimeout(600); r.dropBox = (await n()) - n2; r.boxAfterDrop = await box();
  /* elsewhere a drop is left alone */
  r.overPlaying = await page.evaluate(()=>{ G.ui = 'playing'; const dt = new DataTransfer(); dt.items.add(new File(['x'], 'x.json')); const ov = new DragEvent('dragover', { bubbles:true, cancelable:true, dataTransfer:dt }); document.body.dispatchEvent(ov); G.ui = 'titleScreen'; return ov.defaultPrevented; });
  /* a real click still opens a picker */
  await page.evaluate(()=>setUi('titleScreen')); await page.waitForTimeout(300); const lab = page.locator('label', { hasText:'IMPORT a save file' }).first();
  const fc = page.waitForEvent('filechooser', { timeout:3000 }).then(()=>true, ()=>false); await lab.click(); r.chooser = await fc;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(!r.boxEarly && r.boxNoPicker && r.dropHint, 'no picker: the paste box opens by itself after a moment, offering a drop');
  A(!r.boxPicker, 'a picker opening (the focus goes) leaves it shut');
  A(r.picked===1 && !r.boxPicked, 'a file picked in time imports, no paste box');
  A(r.overTitle && r.dropTitle===1, 'a save file dropped on the title screen imports');
  A(r.overBox && r.dropBox===1 && !r.boxAfterDrop, 'and dropped on the paste box, which closes');
  A(!r.overPlaying, 'a drop in play is left alone');
  A(r.chooser, 'a click on the button still opens a picker');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
