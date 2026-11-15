// RS-179: a mythic beast is found when you first come near it - then it has a map icon (the world map and the minimap) and a
// tooltip, on the map and on its 3D figure; on a touch screen the first tap shows the tooltip and a second walks you there
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null;
    const b = (G.ow.mythicBeasts||[]).find(o=>!o.slain); if (!b) return { none:true };
    const out = {}, listed = ()=>wevMapList().some(o=>o.k==='myth' && o.b===b);
    // far off: not found
    let far = null; for (let d=30; d<60 && !far; d++) for (const [a,c] of [[d,0],[-d,0],[0,d],[0,-d]]){ const x = b.x+a, y = b.y+c; if (x>0 && y>0 && x<OW_COLS && y<OW_ROWS && G.ow.map[x][y]===OW_GRASS){ far = { x, y }; break; } }
    G.owPos = far || { x:b.x + 30, y:b.y }; mythicSpot(); out.farFound = mythicFound(b) || listed();
    // close by: found, on the map and with a tooltip
    G.owPos = { x:b.x + 2, y:b.y }; mythicSpot(); out.found = mythicFound(b); out.listed = listed();
    const tip = wevTipHtml(wevMapList().find(o=>o.k==='myth' && o.b===b)); out.tip = { name:tip.includes(b.name.replace(/'/g,'&#39;')) || tip.includes(b.name), level:/combat level/.test(tip) };
    // its map icon draws
    { const c = document.createElement('canvas'); c.width = c.height = 120; const x = c.getContext('2d'); pmEventIcon(x, 60, 70, 18, { k:'myth', x:b.x, y:b.y, b }, 1);
      const d = x.getImageData(0, 0, 120, 120).data; let n = 0; for (let i=3;i<d.length;i+=4) if (d[i] > 30) n++; out.iconPx = n; }
    // kept in the save
    saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing'); G.gameMode = 0;
    const b2 = G.ow.mythicBeasts.find(o=>o.i===b.i); out.kept = mythicFound(b2);
    // the 3D figure: point at it for the tooltip; a touch tap shows it first, then walks
    G.owPos = { x:b2.x + 2, y:b2.y }; for (let d=2; d<=4; d++) for (const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d]]) if (o3Passable(b2.x+dx, b2.y+dy) && G.owPos.x===b2.x+2 && !o3Passable(b2.x+2, b2.y)) G.owPos = { x:b2.x+dx, y:b2.y+dy };   // (somewhere you can stand)
    for (let i=0;i<5;i++){ renderGame(); try{ o3Render(); }catch(e){} await new Promise(r=>setTimeout(r, 60)); }
    const hb = (O3.beastHits||[]).find(h=>h.userData.act.i===b2.i);
    if (hb && O3.cv){ const v = hb.position.clone(); v.project(O3.cam); const rc = O3.cv.getBoundingClientRect(), cx = rc.left + (v.x*0.5+0.5)*rc.width, cy = rc.top + (-v.y*0.5+0.5)*rc.height;
      const a = o3Pick({ clientX:cx, clientY:cy }); out.pick = a && a.what;
      O3.path = []; O3.tapTip = null; TOUCH.lastTouch = performance.now(); G.wevDlg = null; setUi('playing'); out.ui = G.ui;
      touchFire(O3.cv, 'pointerdown', cx, cy);   // (as a lifted tap reaches the view)
      out.ui1 = G.ui; const tt = document.getElementById('itemTooltip'); out.tap1 = { tip:tt.style.display!=='none' && tt.innerHTML.includes('tap again'), walk:O3.path.length };
      touchFire(O3.cv, 'pointerdown', cx, cy);   // (as a lifted tap reaches the view)
      out.tap2 = { walk:O3.path.length, tipGone:tt.style.display==='none' }; O3.path = []; }
    return out; });
  console.log(JSON.stringify(r));
  if (r.none){ console.log('no mythic beast alive in this world'); return; }
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.farFound, 'a beast you have not been near is not on your map');
  A(r.found && r.listed, 'coming near one finds it and puts it on your map');
  A(r.tip.name && r.tip.level, 'its tooltip names it and gives its combat level');
  A(r.iconPx > 300, 'it has a map icon');
  A(r.kept, 'found stays found after a reload');
  if (r.pick!==undefined){
    A(r.pick==='myth', 'pointing at its 3D figure finds it (for the tooltip)');
    A(r.tap1.tip && r.tap1.walk===0, 'on a touch screen the first tap shows the tooltip without walking');
    A(r.tap2.walk > 0 && r.tap2.tipGone, 'a second tap walks you there');
  }
};
