// RS-481: a dungeon frame draws far less - your lantern casts no shadows (the torches throw them), and the torches' shadows are redrawn
// only while something moves; in a still room they cost nothing
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = [];
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } };
    await frames(20); await new Promise(r=>setTimeout(r, 900)); await frames(4);
    const count = ()=>{ let k = 0; for (let i=0;i<10;i++){ (FPD.torches||[]).forEach(L=>{ L.shadow.needsUpdate = false; }); FPD.shadowFrames = 0; dgShadowTick(); (FPD.torches||[]).forEach(L=>{ if (L.shadow.needsUpdate) k++; }); } return k; };
    const still = count(); FPD.dynSig = 'moved'; const moving = count();
    return { lantern:FPD.lan.castShadow, still, moving, torches:(FPD.torches||[]).length }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.lantern, 'your lantern casts no shadows');
  A(r.still===0, 'in a still room the torch shadows are not redrawn');
  A(r.moving > 0, 'when something moves, they are');
};
