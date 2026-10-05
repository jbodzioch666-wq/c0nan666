// RS-137: on a phone - a saved character loads, the rooms use half-size textures (and none are built ahead), and any error shows
// on screen with Reload and Dismiss instead of leaving a dead page
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const id = await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame(); return G.saveId; });
  await page.reload(); await page.waitForTimeout(1500);
  const r = await ev(async id=>{ const out = {}; titleResume(id); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); } out.ui = G.ui; out.low = v3LowMem();
    if (G.gameMode!==3){ const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); }
    const b = buildingByKey('tavern'); G.player.x = b.door.x; G.player.y = b.door.y + 1; renderGame(); doorPrewarm(); out.warm = Object.keys(V3.warm||{}).length;
    enterInterior('tavern'); setUi('playing'); renderGame(); const k = Object.keys(V3_INT_TEX).find(k=>k.startsWith('boards')); out.size = k ? V3_INT_TEX[k].map.image.width : 0; exitInterior();
    return out; }, id);
  console.log(JSON.stringify(r));
  A(r.ui==='playing', 'a saved character loads after a reload');
  A(r.low && r.size===512 && r.warm===0, 'phones get half-size room textures, built only on walking in: '+JSON.stringify(r));
  await ev(()=>{ window.dispatchEvent(new ErrorEvent('error', { message:'test boom', lineno:1 })); }); await page.waitForTimeout(300);   // (an error event, as a thrown error raises one)
  const ban = await ev(()=>{ const el = document.getElementById('crashBanner'); return el ? el.textContent : ''; });
  A(/Something went wrong/.test(ban) && /test boom/.test(ban) && /Reload/.test(ban), 'an error shows on screen: '+ban);
  await ev(()=>document.querySelector('#crashBanner button:last-child').click());
  A(!(await ev(()=>!!document.getElementById('crashBanner'))), 'and can be dismissed');
};
module.exports.mobile = true;
