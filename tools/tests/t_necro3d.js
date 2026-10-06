// RS-181: your raised dead are real 3D figures in the dungeon (a sculpted skeleton, or the creature's own model) ringed in green,
// and the Raise box can be dragged anywhere without raising on the drag
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    skAdd('bones', 10); G.player.skills.necromancy = Math.max(G.player.skills.necromancy||0, SK_XP[31]);   // (Necromancy 30: zombies too)
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const out = {};
    necroRaise('skeleton'); necroRaise('zombie');
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    for (let i=0;i<100 && !(typeof SK3!=='undefined' && SK3.ok);i++){ renderGame(); await new Promise(r=>setTimeout(r, 150)); }   // (the sculpted skeleton is built in the background)
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    out.minions = (G.player.minions||[]).map(m=>{ const px = necroProxy(m), e = M3D.inst.get(px); return { k:m.k, model:!!(e && e.holder.parent===FPD.scene), sk:!!(e && e.sk), ring:!!(e && e._ring) }; });
    const b = document.getElementById('necroBtn'); out.btn = { drag:b && b.dataset.drag };
    return out; });
  // drag the Raise box: it moves, and doesn't raise anything
  const box = await page.evaluate(()=>{ const r = document.getElementById('necroBtn').getBoundingClientRect(); return { x:r.left + r.width/2, y:r.top + r.height/2, n:(G.player.minions||[]).length }; });
  await page.mouse.move(box.x, box.y); await page.mouse.down(); await page.mouse.move(box.x - 150, box.y - 120, { steps:8 }); await page.mouse.up(); await page.waitForTimeout(300);
  const after = await page.evaluate(()=>{ const r = document.getElementById('necroBtn').getBoundingClientRect(); return { x:r.left + r.width/2, y:r.top + r.height/2, n:(G.player.minions||[]).length, saved:!!(LAYOUT.necro && LAYOUT.necro.x!==undefined) }; });
  r.drag = { moved:Math.round(Math.hypot(after.x - box.x, after.y - box.y)), raised:after.n - box.n, saved:after.saved };
  await page.evaluate(()=>{ delete LAYOUT.necro; saveLayout(); applyMoved('necro'); });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.minions.length >= 1 && r.minions.every(m=>m.model && m.ring), 'each raised minion is a 3D figure in the scene, ringed in green');
  A(r.minions.some(m=>m.k==='skeleton' && m.sk), 'a raised skeleton is the sculpted skeleton');
  A(r.btn.drag==='necro' && r.drag.moved > 100 && r.drag.raised===0 && r.drag.saved, 'the Raise box drags anywhere, keeps its place, and the drag raises nothing');
};
