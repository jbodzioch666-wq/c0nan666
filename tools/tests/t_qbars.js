// RS-304: two quick bars, up by default even when empty: the first on keys 1-9, the second on shift + 1-9. Each can run across
// or down (its own button, or Settings), and either can be switched off. The prayer page has a star on each prayer, like the
// spellbook, that puts it on a quick bar
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
  await ev(()=>{ try { localStorage.removeItem('depthcrawl_layout'); } catch(e){} LAYOUT = {}; SET.qb1 = SET_DEF.qb1; SET.qb2 = SET_DEF.qb2; SET.qbVert1 = SET_DEF.qbVert1; SET.qbVert2 = SET_DEF.qbVert2;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.player.quickBar = null; G.player.quickBar2 = null; G.player.skills.prayer = SK_XP[60]; rsSync(); G.player.prayPts = rsLvl('prayer'); renderGame(); hudLayout(); });
  await page.waitForTimeout(300);
  const bars = ()=>ev(()=>['quickBar','quickBar2'].map(id=>{ const el = document.getElementById(id); if (!el || getComputedStyle(el).display==='none') return null; const r = el.getBoundingClientRect();
    return { slots:el.querySelectorAll('.qb-slot').length, w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.left), y:Math.round(r.top), r:Math.round(r.right), b:Math.round(r.bottom), vert:el.classList.contains('qb-vert'), inView:r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 }; }));
  const apart = (a, b)=>a.r <= b.x || b.r <= a.x || a.b <= b.y || b.b <= a.y;
  out.def = await bars();
  A(out.def[0] && out.def[1] && out.def[0].slots===9 && out.def[1].slots===9, 'both bars are up by default, nine slots each: '+JSON.stringify(out.def));
  A(!out.def[0].vert && !out.def[1].vert && out.def[0].w > out.def[0].h && out.def[0].inView && out.def[1].inView && apart(out.def[0], out.def[1]), 'across, on screen, not on top of each other: '+JSON.stringify(out.def));
  await page.screenshot({ path:SHOTS+'/shot_qbars.png' });
  // the prayer page's stars fill bar 1, then bar 2
  out.star = await ev(()=>{ setUi('prayer'); const stars = [...document.querySelectorAll('#overlay .shoprow button')].filter(b=>b.textContent.trim()==='★'); stars.slice(0, 10).forEach(b=>b.click());
    const q1 = G.player.quickBar.filter(Boolean).length, q2 = G.player.quickBar2.filter(Boolean).length, first2 = G.player.quickBar2[0]; setUi('playing'); return { stars:stars.length, q1, q2, first2 }; });
  A(out.star.stars >= 10 && out.star.q1===9 && out.star.q2===1 && out.star.first2.t==='prayer', 'the prayer stars fill bar 1 then bar 2: '+JSON.stringify(out.star));
  // shift + 1 uses bar 2's first slot: its prayer turns on, and off again
  const id2 = out.star.first2.id;
  await page.keyboard.down('Shift'); await page.keyboard.press('Digit1'); await page.keyboard.up('Shift'); await page.waitForTimeout(100);
  out.shift = await ev(id=>G.player.prayers.includes(id), id2); A(out.shift, 'shift + 1 turns on the prayer in bar 2');
  await page.keyboard.press('Digit1'); await page.waitForTimeout(100);
  out.one = await ev(()=>G.player.prayers.includes(G.player.quickBar[0].id)); A(out.one, '1 turns on the prayer in bar 1');
  // turned to run down: taller than wide, at the right edge, apart from the other bar
  await ev(()=>{ document.querySelector('#quickBar2 [data-qbrot]').click(); hudLayout(); }); await page.waitForTimeout(200);
  out.v2 = await bars(); A(out.v2[1].vert && out.v2[1].h > out.v2[1].w && out.v2[1].inView && apart(out.v2[0], out.v2[1]) && !out.v2[0].vert, 'bar 2 runs down: '+JSON.stringify(out.v2));
  await ev(()=>{ setSetting('qbVert1', true); setUi('playing'); hudLayout(); }); await page.waitForTimeout(200);
  out.v12 = await bars(); A(out.v12[0].vert && out.v12[1].vert && out.v12[0].inView && out.v12[1].inView && apart(out.v12[0], out.v12[1]), 'both run down, side by side: '+JSON.stringify(out.v12));
  await page.screenshot({ path:SHOTS+'/shot_qbars_down.png' });
  // switched off in Settings
  await ev(()=>{ setSetting('qb2', false); setUi('playing'); hudLayout(); }); await page.waitForTimeout(150);
  out.off = await bars(); A(out.off[0] && !out.off[1], 'bar 2 can be switched off');
  await ev(()=>{ SET.qb1 = SET.qb2 = true; SET.qbVert1 = SET.qbVert2 = false; saveSettings(); });
  console.log(JSON.stringify(out));
};
