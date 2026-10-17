// RS-482: a save can be copied as a text code and pasted back in - for an app that can't open a file picker or save a file (the Claude
// app on a phone): copy where you played, paste where you want to play; a pasted save file's text works too
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    G.player.name = 'Codey'; G.player.gold = 4321; saveCurrentGame(); const id = G.saveId, out = {};
    const code = await copySaveCode(id); out.prefix = code.slice(0, 4); out.len = code.length; out.box = !!document.getElementById('saveCodeText') && document.getElementById('saveCodeText').value===code;
    document.getElementById('saveCodeBox').remove();
    const before = saveIndexList().length; out.ok = await pasteSaveCodeGo(code); const after = saveIndexList(); out.added = after.length - before;
    const imp = after.filter(e=>e.name==='Codey' && e.id!==id)[0]; out.gold = imp ? JSON.parse(localStorage.getItem(SAVE_PREFIX + imp.id)).gold : null;
    const raw = JSON.stringify({ depthcrawlSave:1, version:GAME_VERSION, data:JSON.parse(localStorage.getItem(SAVE_PREFIX + id)) }); out.rawOk = await pasteSaveCodeGo(raw);
    out.wrapped = await pasteSaveCodeGo('Here is your save code:\n\n' + code.slice(0, 40) + '\n' + code.slice(40) + '\n\nPaste it on the title screen.');   /* (RS-484: inside a copied message) */
    out.bad = await pasteSaveCodeGo('hello there');
    setUi('titleScreen'); out.button = /pasteSaveCode\(\)/.test(document.body.innerHTML) && /copySaveCode\(/.test(document.body.innerHTML);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(/^DC[01]:/.test(r.prefix) && r.box, 'a save becomes a code, shown to copy');
  A(r.ok && r.added===1 && r.gold===4321, 'pasting the code brings the adventurer back, gold and all');
  A(r.rawOk, "a save file's text pasted works too");
  A(r.wrapped, 'a code inside a whole copied message, line breaks and all, is found (RS-484)');
  A(r.bad===false, 'nonsense is refused');
  A(r.button, 'the title screen offers to paste a code, and each save to copy one');
};
