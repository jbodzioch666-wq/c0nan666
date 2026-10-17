// RS-405: a character can be locked on the title screen so it can't be deleted; the lock outlasts saving, and unlocking
// brings the delete button back
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    window.confirm = ()=>false;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame(); const id = G.saveId || saveIndexList()[0].id;
    setUi('title'); renderOverlay(); const out = {}, H = ()=>buildTitleScreen();
    out.unlockedBtn = H().includes(`titleLock('${id}')`) && H().includes(`titleDeleteConfirm('${id}')`);
    titleLock(id); out.locked = saveLocked(id); out.delGone = !H().includes(`titleDeleteConfirm('${id}')`) && H().includes('iconbtn locked');
    titleDeleteConfirm(id); titleDeleteConfirm(id); titleDelete(id); out.survives = saveIndexList().some(e=>e.id===id);
    loadGame(id); setUi('playing'); saveCurrentGame(); setUi('title'); renderOverlay(); out.afterSave = saveLocked(id);
    // RS-407: a locked hardcore character survives a death like a standard one
    loadGame(id); setUi('playing'); G.player.hardcore = true; G.player.gold = 500; playerDies('a test'); out.hcKept = saveIndexList().some(e=>e.id===id) && !hcFatal();
    continueAfterDeath(); out.hcLives = !G.gameOver && G.player.hardcore && G.ui==='playing'; G.player.hardcore = false; saveCurrentGame(); setUi('title'); renderOverlay();
    titleLock(id); out.unlocked = !saveLocked(id) && H().includes(`titleDeleteConfirm('${id}')`);
    titleDeleteConfirm(id); titleDeleteConfirm(id); out.deleted = !saveIndexList().some(e=>e.id===id) && !saveLocked(id);
    return out;
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.unlockedBtn, 'each adventurer has a lock button beside delete');
  A(r.locked && r.delGone, 'locked: the delete button is gone and the lock shows');
  A(r.survives && r.afterSave, 'a locked adventurer can\'t be deleted, and stays locked after saving');
  A(r.hcKept && r.hcLives, 'a locked hardcore character survives its death');
  A(r.unlocked && r.deleted, 'unlocked, it can be deleted again');
};
