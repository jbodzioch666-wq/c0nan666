// RS-146: stats and spells panels on a phone
// RS-145: the tool column
// RS-144: menu text contrast
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
  // RS-144: menu text reads clearly on the dark panels - every text shade has at least 5.5:1 contrast against the panel colour
  const con = await ev(()=>{ const L = h=>{ const n = parseInt(h.slice(1),16), c = [n>>16&255, n>>8&255, n&255].map(v=>{ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; };
    const cs = getComputedStyle(document.documentElement), bg = L(cs.getPropertyValue('--panel').trim()), out = {};
    for (const v of ['--ink','--ink-dim','--ink-faint']){ const f = L(cs.getPropertyValue(v).trim()); out[v] = +((f+0.05)/(bg+0.05)).toFixed(1); } out.dim = +((L(COL.dim)+0.05)/(bg+0.05)).toFixed(1); return out; });
  console.log('contrast', JSON.stringify(con));
  A(Object.values(con).every(c=>c >= 5.5), 'menu text is easy to read on the dark panels: '+JSON.stringify(con));
  // RS-145: on a phone the tool buttons stand in a column down the right edge, clear of the d-pad and the chat log
  const col = await ev(async ()=>{ setUi('playing'); G.gameMode = 0; renderGame(); await new Promise(r=>setTimeout(r, 200)); const t = document.querySelector('.dh-tools').getBoundingClientRect(), l = document.getElementById('logPanel').getBoundingClientRect();
    return { vert: t.height > t.width*3, right: innerWidth - t.right, clear: l.right <= t.left + 1 }; });
  A(col.vert && col.right < 16 && col.clear, 'the tool buttons stand down the right edge, clear of the log: '+JSON.stringify(col));
  // RS-146: the stats and spells panels fit on a phone: clear of the tool buttons, the minimap and each other
  const pan = await ev(async ()=>{ document.querySelectorAll('.hud, .spellcol').forEach(e=>e.style.transition = 'none'); document.body.classList.add('dh-panels'); renderGame(); for (let i=0;i<10;i++) await new Promise(r=>setTimeout(r, 200));   // (the panels slide in)
    const R = sel=>{ const e = document.querySelector(sel); if (!e || getComputedStyle(e).display==='none') return null; return e.getBoundingClientRect(); };
    const h = R('.hud'), sp = R('.spellcol'), t = R('.dh-tools'), mm = R('#miniMap'), over = (a, b)=>!!(a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom);
    const out = { hud:!!h, tools:over(h, t) || over(sp, t), mm:over(h, mm) || over(sp, mm), each:over(h, sp), onscreen: h && h.right <= innerWidth + 1 && h.left >= -1, hr: h && [h.left, h.right, innerWidth].map(Math.round), ui:G.ui, mode:G.gameMode, imm:document.body.className };
    document.body.classList.remove('dh-panels'); return out; });
  A(pan.hud && !pan.tools && !pan.mm && !pan.each && pan.onscreen, 'the stats and spells panels fit on a phone: '+JSON.stringify(pan));
  await ev(()=>{ window.dispatchEvent(new ErrorEvent('error', { message:'test boom', lineno:1 })); }); await page.waitForTimeout(300);   // (an error event, as a thrown error raises one)
  const ban = await ev(()=>{ const el = document.getElementById('crashBanner'); return el ? el.textContent : ''; });
  A(/Something went wrong/.test(ban) && /test boom/.test(ban) && /Reload/.test(ban), 'an error shows on screen: '+ban);
  await ev(()=>document.querySelector('#crashBanner button:last-child').click());
  A(!(await ev(()=>!!document.getElementById('crashBanner'))), 'and can be dismissed');
};
module.exports.mobile = true;
