// RS-564: on a phone a tap is not a mouse resting on the screen. The browser's made-up mouse move at a tap used to set the dungeon's
// hover spot, and the yellow box stayed on that spot of the screen - crawling over the floor as you walked. Now a tap leaves no hover
module.exports = async page=>{
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx = x; dy = y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = []; for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const box = await page.evaluate(()=>{ const r = canvas.getBoundingClientRect(); return { x:r.left + r.width*0.5, y:r.top + r.height*0.35 }; });
  await page.touchscreen.tap(box.x, box.y);
  const r = await page.evaluate(async ()=>{ for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } const F = ISO.fx; const out = { mouse:ISO.mouse, glow:!!(F && F.hoverGlow && F.hoverGlow.visible) };
    /* a mouse made up from a touch is turned away; a real one still hovers */
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX:200, clientY:200, sourceCapabilities:new InputDeviceCapabilities({ firesTouchEvents:true }) })); out.fake = ISO.mouse;
    TOUCH.lastTouch = 0; canvas.dispatchEvent(new MouseEvent('mousemove', { clientX:200, clientY:200, sourceCapabilities:new InputDeviceCapabilities({ firesTouchEvents:false }) })); out.real = !!ISO.mouse;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.mouse && !r.glow, 'a tap leaves no hover box behind');
  A(!r.fake, 'a mouse move made up from a touch is turned away');
  A(r.real, 'a real mouse still hovers');
};
module.exports.mobile = true;
