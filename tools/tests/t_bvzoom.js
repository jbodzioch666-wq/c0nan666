// RS-204: the bestiary's model box zooms (wheel, pinch, + and - buttons) and, zoomed in, drags up and down along the creature;
// picking a creature keeps the list where you'd scrolled it; weapon hands are turned to close round the grip, and a one-handed
// axe leads with its blade
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {}, wait = ms=>new Promise(r=>setTimeout(r, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    G.player.codexSeen = []; for (const k in MON_FAMILIES) for (const t of MON_FAMILIES[k].t) G.player.codexSeen.push(t[0]);
    G.bestSel = 'orc warrior'; setUi('bestiary'); for (let i=0;i<60 && !BV.e;i++) await wait(150);
    // zoom: the buttons, then the wheel
    const z0 = BV.zoom||1; document.querySelector('#bvSlot .bvzoom .btn').click(); A(BV.zoom > z0, 'the + button zooms in');
    const cv = document.querySelector('#bvSlot canvas'); cv.dispatchEvent(new WheelEvent('wheel', { deltaY:-300, bubbles:true, cancelable:true })); A(BV.zoom > z0*1.35, 'the wheel zooms in');
    await wait(200); out.camZ = +BV.cam.position.z.toFixed(2); A(BV.cam.position.z < 3.1/1.3, 'the camera moved in: '+out.camZ);
    document.querySelectorAll('#bvSlot .bvzoom .btn')[1].click(); for (let i=0;i<10;i++) bvZoom(1/1.5); A(BV.zoom===0.7, 'zoom has a floor');
    // picking a creature keeps the list's scroll
    const boxes = [...document.querySelectorAll('#overlay *')].filter(e=>e.scrollHeight > e.clientHeight + 20 && getComputedStyle(e).overflowY!=='visible');
    const list = boxes.find(b=>b.querySelector('[onclick^="bestPick"]')) || document.getElementById('overlay');
    list.scrollTop = 200; const want = list.scrollTop; A(want > 0, 'the list scrolls');
    const row = [...list.querySelectorAll('[onclick^="bestPick"]')].find(e=>{ const rr = e.getBoundingClientRect(), lr = list.getBoundingClientRect(); return rr.top > lr.top + 10 && rr.bottom < lr.bottom - 10; });
    row.click(); await wait(100);
    const list2 = [...document.querySelectorAll('#overlay *')].concat([document.getElementById('overlay')]).find(e=>e.scrollTop===want);
    out.scroll = [want, list2 ? list2.scrollTop : 0]; A(list2, 'the list stayed where it was: '+want);
    setUi('playing');
    // hands and axes
    const war = m3dInstance({ nm:'orc warrior' }, monsterPortraitFor('orc warrior')), hob = m3dInstance({ nm:'hobgoblin' }, monsterPortraitFor('hobgoblin'));
    const handMesh = arm=>arm.hand.children.find(o=>o.isMesh);
    A(Math.abs(handMesh(war.rig.arms[0]).rotation.y - Math.PI/2) < 1e-6 && Math.abs(handMesh(war.rig.arms[1]).rotation.y + Math.PI/2) < 1e-6, 'weapon wrist a quarter anticlockwise, the other clockwise');
    A(war.rig.wk==='axe' && Math.abs(war.rig.weapon.rotation.y + Math.PI/2) < 1e-6, 'a one-handed axe is turned round');
    A(hob.rig.wk==='sword' && Math.abs(hob.rig.weapon.rotation.y - Math.PI/2) < 1e-6, 'a sword is not');
    return out;
  });
  console.log(JSON.stringify(r));
};
