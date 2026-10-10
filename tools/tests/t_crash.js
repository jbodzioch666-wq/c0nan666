// RS-146: stats and spells panels on a phone
// RS-145: the tool column
// RS-144: menu text contrast
// RS-137: on a phone - a saved character loads, the rooms use half-size textures (and none are built ahead), and any error shows
// on screen with Reload and Dismiss instead of leaving a dead page
const seasonRe = ()=>'spring|summer|autumn|winter';
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
  // RS-147: closed, the panels leave nothing on screen; the fullscreen and layout buttons are gone
  const shut = await ev(async ()=>{ renderGame(); for (let i=0;i<5;i++) await new Promise(r=>setTimeout(r, 100));
    const gone = sel=>{ const e = document.querySelector(sel); if (!e) return true; const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display==='none' || cs.visibility==='hidden' || r.left >= innerWidth; };
    return { hud:gone('.hud'), spell:gone('.spellcol'), full:!!document.querySelector('.dh-tools [data-act="full"]'), layout:!!document.querySelector('.dh-tools [data-act="layout"]') }; });
  A(shut.hud && shut.spell && !shut.full && !shut.layout, 'closed panels are off screen and the fullscreen and layout buttons are gone: '+JSON.stringify(shut));
  // RS-149: on a phone the side panel (every tab) sits clear of the tool buttons, the minimap and its turn buttons, the d-pad and the route button,
  // and the quick bar steps aside rather than jumping up over the minimap
  const sp = await ev(async ()=>{ const out = {}; document.getElementById('sidePanel') && (document.getElementById('sidePanel').style.transition = 'none');
    const R = e=>e && getComputedStyle(e).display!=='none' && e.offsetHeight > 0 ? e.getBoundingClientRect() : null, over = (a, b)=>!!(a && b && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1);
    for (const t of SP_TABS.map(x=>x.id)){ SP.open = true; SP.tab = t; hudLayout(); renderGame(); await new Promise(r=>setTimeout(r, 120)); hudLayout();
      const s = R(document.getElementById('sidePanel')), hits = [];
      for (const [k, e] of [['tools', document.querySelector('.dh-tools')], ['mm', document.getElementById('miniMap')], ['pad', document.querySelector('.controls .pad')], ['route', document.querySelector('.dh-route')], ...[...document.querySelectorAll('#mmRot button')].map(b=>['rot', b])]) if (over(s, R(e))) hits.push(k);
      const qb = document.getElementById('quickBar'); if (qb && getComputedStyle(qb).visibility!=='hidden' && over(R(qb), R(document.getElementById('miniMap')))) hits.push('qbar');
      out[t] = s ? (hits.join(',') || 'ok') + ' ' + [s.left, s.top, s.right, s.bottom].map(Math.round).join('/') : 'hidden'; }
    SP.open = false; hudLayout(); renderGame(); return out; });
  console.log('side panel', JSON.stringify(sp));
  A(Object.values(sp).every(v=>/^ok /.test(v)), 'the side panel fits on a phone without covering any button: '+JSON.stringify(sp));
  // a held finger doesn't leave the browser's title tooltip stuck: touching a button drops its title
  const tt = await ev(()=>{ const b = document.querySelector('.dh-tools [data-act="side"]'); const r = b.getBoundingClientRect(); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true, pointerType:'touch', clientX:r.left+4, clientY:r.top+4 })); showTooltip({ clientX:50, clientY:50 }, '<div>stuck?</div>'); b.dispatchEvent(new MouseEvent('mouseover', { bubbles:true, clientX:r.left+4, clientY:r.top+4 })); return { title:b.getAttribute('title'), kept:b.dataset.ttl||'', tip:document.getElementById('itemTooltip').style.display }; });
  A(!tt.title && /side panel/.test(tt.kept) && tt.tip==='none', 'after a touch no black tooltip pops up to get stuck: '+JSON.stringify(tt));
  // RS-151: no name plate; the clock bar at the top shows the season, the time of day and the hour, clear of the minimap
  const clk = await ev(async ()=>{ setUi('playing'); renderGame(); await new Promise(r=>setTimeout(r, 300));
    const el = document.getElementById('dhClock'), r = el && el.getBoundingClientRect(), mm = document.getElementById('miniMap').getBoundingClientRect();
    const keep = G.player.clock; G.player.clock = DAY_LENGTH*0.5; const noon = clockHM(); G.player.clock = DAY_LENGTH*0.75; const six = clockHM(); G.player.clock = keep;
    return { plate:!!document.querySelector('.dh-name'), text:el ? el.textContent : '', shown:!!(r && r.width && getComputedStyle(el).display!=='none'), clearMm:!!(r && r.right <= mm.left), noon, six }; });
  console.log('clock bar', JSON.stringify(clk));
  A(!clk.plate && clk.shown && clk.clearMm && new RegExp(seasonRe()).test(clk.text) && /\d{1,2}:\d\d (am|pm)/.test(clk.text) && clk.noon==='12:00 pm' && clk.six==='6:00 pm', 'the clock bar replaces the name plate: '+JSON.stringify(clk));
  // RS-153 (RS-298: the bag on the equipment page): a grid of item pictures like the side panel; a tap picks one, and its buttons can be scrolled to
  const inv = await ev(async ()=>{ for (let i=0;i<12;i++) G.inv.push(genItem(3, i%2 ? 'weapon' : 'armor')); G.invSel = 0; setUi('inventory'); csBagTab('all'); renderOverlay(); await new Promise(r=>setTimeout(r, 150));
    let cells = document.querySelectorAll('#overlay .cs-bag .sp-cell'); cells[3].click(); await new Promise(r=>setTimeout(r, 100)); cells = document.querySelectorAll('#overlay .cs-bag .sp-cell');
    const last = [...document.querySelectorAll('#overlay .cs-acts .btn')].pop(); if (last) last.scrollIntoView(); await new Promise(r=>setTimeout(r, 100));
    const btn = last ? last.getBoundingClientRect() : { top:-1, bottom:1e9 };
    const out = { cells:cells.length, items:G.inv.length, sel:G.charSheetInvSel, picked:!!document.querySelector('#overlay .cs-bag .sp-cell.sel'), detail:!!document.querySelector('#overlay .detailpane'), btnOn: btn.top >= 0 && btn.bottom <= innerHeight + 1, rows:document.querySelectorAll('#overlay .invrow').length };
    G.inv.splice(G.inv.length - 12, 12); G.invSel = 0; setUi('playing'); renderGame(); return out; });
  console.log('inventory', JSON.stringify(inv));
  A(inv.cells===inv.items && inv.sel===3 && inv.picked && inv.detail && inv.btnOn && inv.rows===0, 'the inventory is a picture grid and its buttons can be reached: '+JSON.stringify(inv));
  // RS-154: the character sheet on a phone - the pack is a picture grid, a tap picks a piece (it drags onto the figure, RS-196), the numbers stand in one column
  const cs = await ev(async ()=>{ for (let i=0;i<6;i++) G.inv.push(genItem(3, i%2 ? 'weapon' : 'armor')); setUi('inventory'); renderOverlay(); await new Promise(r=>setTimeout(r, 150));
    const cells = document.querySelectorAll('#overlay .cs-pack .sp-cell.can'); if (cells[0]) cells[0].click(); await new Promise(r=>setTimeout(r, 100));
    const picked = !!document.querySelector('#overlay .cs-pack .sp-cell.sel'), equip = !!document.querySelector('#overlay .cs-pack .sp-cell.csdrag');   /* (RS-196: gear is dragged on, no equip button) */
    G.csPage = 'stats'; renderOverlay(); await new Promise(r=>setTimeout(r, 100));   /* (RS-195: on a phone the stats are their own page) */
    const rows = [...document.querySelectorAll('#overlay .cs-statgrid > div')].slice(0, 2).map(e=>Math.round(e.getBoundingClientRect().left));
    const out = { cells:cells.length, rows:document.querySelectorAll('#overlay .cs-pack .invrow').length, picked, equip, oneCol:rows.length===2 && rows[0]===rows[1] && rows[0] > 0 }; G.csPage = 'gear';
    G.inv.splice(G.inv.length - 6, 6); G.charSheetInvSel = null; setUi('playing'); renderGame(); return out; });
  console.log('character sheet', JSON.stringify(cs));
  A(cs.cells >= 1 && cs.rows===0 && cs.picked && cs.equip && cs.oneCol, 'the character sheet works on a phone: '+JSON.stringify(cs));
  // RS-155/156: the figure shows each worn item's own picture, and an empty slot only its name; previewing a pack item marks what changes in the stats, and leaves your gear as it was
  const cs2 = await ev(async ()=>{ for (let i=0;i<8;i++) G.inv.push(genItem(3, i%2 ? 'weapon' : 'armor')); const before = Object.assign({}, G.gear);
    const worn = PAPERDOLL_SLOTS.filter(s=>G.gear[s.key] && G.gear[s.key].used).length;
    const pick = G.inv.findIndex(it=>{ G.charSheetActivePane = 'pack'; const k = G.charSheetInvSel; G.charSheetInvSel = G.inv.indexOf(it); const c = csPreviewItem(); const a = fullStatRows(), b = c ? fullStatRowsWith(c) : null; G.charSheetInvSel = k; return b && b.some((x, j)=>String(x[1])!==String(a[j][1])); });
    setUi('inventory'); G.charSheetInvSel = pick; G.charSheetActivePane = 'pack'; renderOverlay(); await new Promise(r=>setTimeout(r, 150));
    const slots = document.querySelectorAll('#overlay .doll-slot'), imgs = document.querySelectorAll('#overlay .doll-slot img.doll-img');
    const out = { worn, slots:slots.length, imgs:imgs.length, canvases:document.querySelectorAll('#overlay .doll-slot canvas').length, empty:document.querySelectorAll('#overlay .doll-slot .doll-empty').length, total:PAPERDOLL_SLOTS.length, pick, deltas:document.querySelectorAll('#overlay .cs-delta').length,
      same:Object.keys(before).every(k=>G.gear[k]===before[k]) && Object.keys(G.gear).length===Object.keys(before).length };
    G.inv.splice(G.inv.length - 8, 8); G.charSheetInvSel = -1; setUi('playing'); renderGame(); return out; });
  console.log('paper doll', JSON.stringify(cs2)); const PAPERDOLL_N = cs2.total;
  A(cs2.worn > 0 && cs2.slots===PAPERDOLL_N && cs2.imgs===cs2.worn && cs2.empty===PAPERDOLL_N - cs2.worn && cs2.canvases===0 && cs2.pick >= 0 && cs2.deltas > 0 && cs2.same, 'the paper doll and the stat preview: '+JSON.stringify(cs2));
  // RS-149: the full-screen menus fit a phone's width - nothing runs off the right edge
  const wide = await ev(async ()=>{ const out = {};
    for (const u of ['charsheet','stats','bestiary','journal','skills','settings','inventory']){ setUi(u); renderOverlay(); await new Promise(r=>setTimeout(r, 150));
      let worst = 0; for (const e of document.querySelectorAll('#overlay .ovbody *')){ const r = e.getBoundingClientRect(); if (r.width && r.height && getComputedStyle(e).visibility!=='hidden') worst = Math.max(worst, r.right); }
      out[u] = Math.round(worst - innerWidth); }
    setUi('playing'); renderGame(); return out; });
  console.log('menus past the edge', JSON.stringify(wide));
  A(Object.values(wide).every(v=>v <= 1), 'every menu fits the phone screen: '+JSON.stringify(wide));
  await ev(()=>{ window.dispatchEvent(new ErrorEvent('error', { message:'test boom', lineno:1 })); }); await page.waitForTimeout(300);   // (an error event, as a thrown error raises one)
  const ban = await ev(()=>{ const el = document.getElementById('crashBanner'); return el ? el.textContent : ''; });
  A(/Something went wrong/.test(ban) && /test boom/.test(ban) && /Reload/.test(ban), 'an error shows on screen: '+ban);
  await ev(()=>document.querySelector('#crashBanner button:last-child').click());
  A(!(await ev(()=>!!document.getElementById('crashBanner'))), 'and can be dismissed');
};
module.exports.mobile = true;
