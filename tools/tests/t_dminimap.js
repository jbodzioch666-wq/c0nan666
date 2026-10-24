// RS-394: the dungeon minimap turns with the camera (it was held at the town camera's last angle), shows N where north lies,
// and has the turn buttons on its edge like the town and land minimap
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const run = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); } };
    await run(6); const a0 = FP.mmRot, rb = document.getElementById('mmRot'), btn = !!rb && rb.style.display!=='none';
    rb.children[1].click(); await run(25); const a1 = FP.mmRot;
    const d = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
    setUi('inventory'); await new Promise(r=>setTimeout(r, 500)); const hidden = rb.style.display==='none'; setUi('playing'); await run(3);
    return { a0:+a0.toFixed(3), a1:+a1.toFixed(3), turned:+d.toFixed(3), cam:+(ISO.yawNow - a1).toFixed(3), btn, hidden, back:rb.style.display!=='none' };
  });
  await page.screenshot({ path:`${S}/s394-dmini.png`, timeout:150000 });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.btn, 'the turn buttons are on the dungeon minimap');
  A(Math.abs(Math.abs(r.turned) - Math.PI/2) < 0.05, 'a turn of the camera turns the minimap a quarter');
  A(Math.abs(r.cam) < 1e-6, 'the minimap follows the dungeon camera');
  A(r.hidden && r.back, 'the buttons go with the minimap and come back with it');
};
