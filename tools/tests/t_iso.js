// RS-108: isometric 3D everywhere - no key or saved setting switches the overworld, a town or a dungeon to a flat view
module.exports = async page=>{
  await page.evaluate(()=>{ try { localStorage.setItem('depthcrawl_world3d','0'); localStorage.setItem('depthcrawl_town3d','0'); localStorage.setItem('depthcrawl_viewiso','0'); } catch(e){} });
  await page.reload(); await page.waitForTimeout(1500);
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const key = async k=>{ await page.keyboard.press(k); await page.waitForTimeout(250); };
  A(await ev(()=>o3Pref && v3Pref && fp3dPref), 'old saved flat-view settings are ignored');
  A(await ev(()=>typeof o3Toggle==='undefined' && typeof v3Toggle==='undefined' && typeof toggleView3d==='undefined'), 'the flat-view switches are gone');
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.player.wildWarned = 1; G.ow.encounters = []; G.gameMode = 0; G.interior = null; renderGame(); if (document.activeElement) document.activeElement.blur(); });
  await page.waitForTimeout(800);
  // overworld: O does nothing, M opens the world map and closes it again
  await key('o'); A(await ev(()=>o3Pref && !G.owZoomedOut && G.ui==='playing'), 'O does nothing');
  await key('m'); A(await ev(()=>G.owZoomedOut), 'M opens the world map'); await key('m'); A(await ev(()=>!G.owZoomedOut), 'M closes it');
  A(await ev(()=>!/flat overworld map|flat isometric map|flat town map/.test(document.body.innerText)), 'no flat-view buttons');
  // a town: M leaves it 3D
  await ev(()=>{ const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); }); await page.waitForTimeout(500);
  await key('m'); A(await ev(()=>v3Pref && G.gameMode===3), 'M in town leaves the 3D town');
  // a dungeon: M leaves it 3D
  await ev(()=>{ let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = {x:dx, y:dy}; enterDungeonConfirm(); setUi('playing'); }); await page.waitForTimeout(500);
  await key('m'); A(await ev(()=>fp3dPref && fp3dActive()), 'M in a dungeon leaves the 3D view');
  console.log('ok');
};
