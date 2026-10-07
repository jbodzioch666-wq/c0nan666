// RS-197: the hearthstone - bound at a town's waypoint stone, T (or its button on the bar) takes you back there from the open land or
// any town; it won't work in a dungeon or a fight, and it goes cold for a while after each use. It is kept with the save.
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {}, wait = ms=>new Promise(r=>setTimeout(r, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    const p = G.player, [t0, t1] = townList();
    // no bind yet: T says so, and the bar's T is greyed
    G.gameMode = 0; G.owPos = { x:t1.x+3, y:t1.y }; renderGame();
    const bt = ()=>document.querySelector('.dh-slot[data-k="T"]'); A(bt() && bt().classList.contains('off'), 'a T button on the bar, greyed while unbound');
    dhPress('t'); A(G.gameMode===0 && G.owPos.x===t1.x+3, 'unbound: nothing happens');
    // bind it at the first town's waypoint
    G.owPos = { x:t0.x, y:t0.y }; trackVisitedTown(t0.x, t0.y); trackVisitedTown(t1.x, t1.y); enterVillage(); setUi('waypoint');
    const ov = ()=>document.getElementById('overlay').innerHTML; A(/hearthstone: not bound/.test(ov()), 'the waypoint offers to bind it');
    [...document.querySelectorAll('#overlay .wp-hearth button')][0].click(); A(p.hearth===t0.x+','+t0.y && /bound here/.test(ov()), 'bound');
    setUi('playing');
    // out in the wild: T brings you home
    G.gameMode = 0; G.interior = null; G.owPos = { x:t1.x, y:t1.y+4 }; renderGame(); A(!bt().classList.contains('off'), 'lit once bound');
    { const keep = o3Active; o3Active = ()=>true; G.owPortal = null; dhPress('T'); const opened = G.owPortal && G.owPortal.key===t0.x+','+t0.y; o3Active = keep; G.owPortal = null; p.hearthAt = undefined;
      A(opened, 'in the open a portal home tears open beside you (RS-202)'); }
    dhPress('T'); out.home = [G.gameMode, G.owPos.x===t0.x && G.owPos.y===t0.y]; A(G.gameMode===3 && G.owPos.x===t0.x && G.owPos.y===t0.y, 'home: '+JSON.stringify(out.home));
    // cold now: from another town it refuses until the cooldown runs out
    G.owPos = { x:t1.x, y:t1.y }; enterVillage(); setUi('playing'); renderGame();
    A(hearthLeft() > 0 && /\dm/.test(bt().textContent), 'cooling, with the minutes on the button: '+bt().textContent);
    dhPress('t'); A(G.owPos.x===t1.x, 'still cold');
    p.clock = clockNow() + HEARTH_CD + 1; renderGame(); dhPress('t'); A(G.gameMode===3 && G.owPos.x===t0.x, 'from a town, once it has warmed');
    // never in a dungeon
    p.clock += HEARTH_CD + 1; let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); A(G.gameMode===1, 'in a dungeon');
    dhPress('t'); A(G.gameMode===1, 'not from a dungeon');
    // the bind is saved
    saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); A(G.player.hearth===t0.x+','+t0.y, 'saved');
    return out;
  });
  console.log(JSON.stringify(r));
};
