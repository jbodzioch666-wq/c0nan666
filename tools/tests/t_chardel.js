// RS-132: deleting a character works without browser pop-ups (the published game's page blocks them):
// the first tap arms a red "Delete?" button, a second tap deletes, and it disarms on its own after a few seconds
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  // pop-ups refuse, as they do inside the published page
  await ev(()=>{ window.confirm = ()=>false; window.alert = ()=>{}; window.prompt = ()=>null; });
  const id = await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame(); const id = G.saveId || saveIndexList()[0].id; setUi('title'); renderOverlay(); return id; });
  A(id && await ev(id=>saveIndexList().some(e=>e.id===id), id), 'a saved character on the title screen');
  const one = await ev(id=>{ titleDeleteConfirm(id); renderOverlay(); return { still:saveIndexList().some(e=>e.id===id), btn:/Delete\?/.test(document.body.innerHTML) }; }, id);
  A(one.still && one.btn, 'the first tap asks again with a red Delete? button: '+JSON.stringify(one));
  await page.waitForTimeout(4600);
  const off = await ev(id=>({ armed:titleDelArmed(id), still:saveIndexList().some(e=>e.id===id) }), id);
  A(!off.armed && off.still, 'left alone, the button goes back to normal and nothing is deleted');
  const two = await ev(id=>{ titleDeleteConfirm(id); titleDeleteConfirm(id); return saveIndexList().some(e=>e.id===id); }, id);
  A(!two, 'two taps delete the character, with no pop-up needed');
};
