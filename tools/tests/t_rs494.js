// RS-494: the dye works shows you, in what you're dyeing, on its left - (RS-496) 540 x 659, a quarter smaller than the first 720 x 879
// (the barber's chair figure is 240 x 293) - turned by dragging, and dressed again as you dye; on a phone it stacks above the dyes and fits the screen
const shot = require('path').join(__dirname, 'shots', 'dye494.png');
module.exports = async page=>{
  await page.setViewportSize({ width:1600, height:1100 });
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const wait = ms=>new Promise(res=>setTimeout(res, ms)), out = {}, box = el=>{ const b = el.getBoundingClientRect(); return { x:Math.round(b.left), y:Math.round(b.top), w:Math.round(b.width), h:Math.round(b.height) }; };
    G.gear.chest = rsMakeArmour('metal', 3, 'chest'); G.gear.cape = rsMakeCape(0, 'Black Cape'); skAdd('dye_red', 5);
    openMakeover(); await wait(400); { const s = document.getElementById('lpSlot'); out.barber = s ? box(s) : null; out.barberBuf = LP.r ? [LP.r.domElement.width, LP.r.domElement.height] : null; }
    makeoverLeave(); openDyeWorks(); await wait(500);
    const s = document.getElementById('lpSlot'), body = document.querySelector('.dyewrap > .ovbody'); out.dye = s ? box(s) : null; out.body = body ? box(body) : null;
    out.canvas = !!(s && s.querySelector('canvas')); out.buf = LP.r ? [LP.r.domElement.width/LP.r.getPixelRatio(), LP.r.domElement.height/LP.r.getPixelRatio()] : null;
    out.figure = !!LP.e; const k0 = LP.key; trimDyeApply('g:chest', 'red'); await wait(300); out.redressed = LP.key!==k0 && /9a2a24/.test(LP.key);
    return out; });
  await page.screenshot({ path:shot });
  const ph = await page.evaluate(async ()=>{ await new Promise(res=>setTimeout(res, 100)); return 1; });
  await page.setViewportSize({ width:390, height:800 });
  const m = await page.evaluate(async ()=>{ renderOverlay(); await new Promise(res=>setTimeout(res, 400)); const s = document.getElementById('lpSlot'), b = s.getBoundingClientRect(), o = document.querySelector('.dyewrap > .ovbody').getBoundingClientRect();
    return { w:Math.round(b.width), h:Math.round(b.height), right:Math.round(b.right), stacked:o.top >= b.bottom - 1, scroll:document.documentElement.scrollWidth <= 392 }; });
  r.phone = m; console.log(JSON.stringify(r));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg+' '+JSON.stringify(r)); };
  A(r.barber && r.barber.w===240, 'the barber chair figure is 240 wide');
  A(r.dye && r.canvas && r.figure, 'the dye works shows your figure');
  A(r.buf && r.buf[0]===540 && r.buf[1]===659, 'drawn at 540 x 659 (RS-496: a quarter smaller than RS-494)');
  A(Math.abs(r.dye.w - 540) <= 4 && Math.abs(r.dye.h - 659) <= 4, 'shown at 540 x 659 on a big screen');
  A(r.body && r.dye.x < r.body.x && r.body.x >= r.dye.x + r.dye.w, 'on the left of the dyes');
  A(r.redressed, 'dressed again as you dye');
  A(m.w <= 380 && m.right <= 392 && m.stacked, 'on a phone it fits and stacks above the dyes');
};
