// RS-195/196: the character sheet is two pages side by side - CHARACTER STATS and EQUIPMENT (the figure laid out like an action RPG's,
// the whole bag under it) - floating over the game like the side panel, with no dark backdrop. Gear moves by drag and drop:
// bag to figure wears it, figure to bag takes it off, bag to bag moves it, ring to ring swaps. Tapping a piece marks what it changes.
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
  const open = ()=>ev(async ()=>{ setUi('charsheet'); renderOverlay(); await new Promise(r=>setTimeout(r, 150)); });
  const box = sel=>ev(s=>{ const e = document.querySelector('#overlay '+s); if (!e) return null; const r = e.getBoundingClientRect(); return { x:r.left + r.width/2, y:r.top + r.height/2 }; }, sel);
  const drag = async (from, to)=>{ const a = await box(from), b = await box(to); A(a && b, 'drag ends exist: '+from+' -> '+to);
    await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x + 10, a.y + 10, { steps:3 }); await page.mouse.move(b.x, b.y, { steps:8 });
    const hot = await ev(()=>document.querySelector('#overlay .cs-dropok') ? 'ok' : document.querySelector('#overlay .cs-dropno') ? 'no' : ''); await page.mouse.up(); await page.waitForTimeout(150); return hot; };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const k of ['attack','strength','defence','ranged','magic']) G.player.skills[k] = SK_XP[60]; rsSync();
    G.gear.weapon = rsMakeWeapon(3, 3); G.gear.chest = rsMakeArmour('metal', 3, 'chest'); G.gear.head = rsMakeArmour('metal', 2, 'head'); G.gear.ring1 = rsMakeJewel('ring', 0); G.gear.ring2 = newItem();
    G.inv = []; for (let i=0;i<4;i++) G.inv.push(genItem(6, i%2 ? 'weapon' : 'armor')); G.inv.push(rsMakeArmour('metal', 6, 'chest')); G.inv.push(rsMakeWeapon(5, 3)); });
  await open();
  const look = await ev(()=>{ const q = s=>document.querySelector('#overlay '+s), cs = getComputedStyle(document.getElementById('overlay')), sp = q('.cs-statspage').getBoundingClientRect(), gp = q('.cs-gearpage').getBoundingClientRect();
    return { bg:cs.backgroundImage, bgc:cs.backgroundColor, pages:[sp.right <= gp.left + 1, Math.abs(sp.top - gp.top) < 2, sp.width > 300, gp.width > 300], detail:!!q('.charsheet-detail'), equipBtn:/EQUIP\b/.test(q('.cs-book').textContent.replace(/EQUIPMENT/g, '')),
      slots:document.querySelectorAll('#overlay .doll-slot').length, bag:document.querySelectorAll('#overlay .cs-bag [data-csinv]').length, close:!!q('.cs-gearpage .sp-x') }; });
  out.look = look;
  A(look.bg==='none' && /rgba\(0, 0, 0, 0\)|transparent/.test(look.bgc), 'no dark backdrop: '+look.bg+' '+look.bgc);
  A(look.pages.every(Boolean), 'two pages side by side'); A(!look.detail && !look.equipBtn, 'no compare window and no equip button');
  A(look.slots===14 && look.bag===Math.ceil(50/10)*10 && look.close, 'figure, the whole bag, and a close in the title bar');
  // bag -> figure: the rune platebody goes on, the old one comes off into the bag
  A(await drag('.cs-bag [data-csinv="4"]', '.doll-slot[data-slot="chest"]')==='ok', 'the chest lights up as a place to drop it');
  let st = await ev(()=>({ chest:G.gear.chest.rsTier, old:G.inv.some(it=>it.rsTier===3 && it.slot==='chest'), n:G.inv.length }));
  A(st.chest===6 && st.old && st.n===6, 'dragged on: '+JSON.stringify(st));
  A(await ev(()=>String(window.getSelection())===''), 'dragging selects nothing on the page');   /* (RS-198) */
  // a weapon dropped on the head slot is refused
  const wi = await ev(()=>G.inv.findIndex(it=>it.rsTier===5 && it.slot==='weapon'));
  A(await drag(`.cs-bag [data-csinv="${wi}"]`, '.doll-slot[data-slot="head"]')==='no', 'a weapon is refused on the head'); A(await ev(()=>G.gear.head.rsTier===2), 'the helm stays on');
  // ... but dropped anywhere else on the figure it goes in its own slot
  await drag(`.cs-bag [data-csinv="${wi}"]`, '.doll-slot[data-slot="weapon"]'); A(await ev(()=>G.gear.weapon.rsTier===5), 'the rune scimitar is wielded');
  // figure -> bag: the helm comes off into the cell it was dropped on
  await drag('.doll-slot[data-slot="head"]', '.cs-bag [data-csinv="0"]');
  st = await ev(()=>({ head:!!(G.gear.head && G.gear.head.used), first:G.inv[0] && G.inv[0].slot })); A(!st.head && st.first==='head', 'taken off into the bag: '+JSON.stringify(st));
  // ring to ring swaps
  await drag('.doll-slot[data-slot="ring1"]', '.doll-slot[data-slot="ring2"]'); A(await ev(()=>!G.gear.ring1.used && G.gear.ring2.used), 'the ring moved to the other hand');
  // bag -> an empty bag cell moves it to the end
  const nm0 = await ev(()=>G.inv[0].nm); await drag('.cs-bag [data-csinv="0"]', '.cs-bag [data-csinv="30"]'); A(await ev(nm=>G.inv[G.inv.length-1].nm===nm, nm0), 'moved within the bag');
  // a tap (no drag) picks a piece, and the stats page marks the change
  await ev(()=>{ G.inv.push(rsMakeArmour('metal', 6, 'head')); renderOverlay(); });
  await page.waitForTimeout(250);
  const hi = await ev(()=>G.inv.length-1), hb = await box(`.cs-bag [data-csinv="${hi}"]`); await page.mouse.click(hb.x, hb.y); await page.waitForTimeout(150);
  out.deltas = await ev(()=>document.querySelectorAll('#overlay .cs-statspage .cs-delta').length); A(out.deltas > 0, 'a tap marks what changes');
  // the tabs
  for (const [t, want] of [['defence', /Defence bonus/], ['skills', /Woodcutting/], ['other', /In the bank/], ['offence', /Melee to hit/]]) A(await ev(([t, w])=>{ csTab(t); return new RegExp(w).test(document.querySelector('#overlay .cs-statgrid').textContent); }, [t, want.source]), 'tab '+t);
  await page.screenshot({ path:SHOTS+'/shot_charsheet.png' });
  // saved
  A(await ev(()=>{ saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); return G.gear.weapon.rsTier===5 && G.gear.chest.rsTier===6 && !(G.gear.head && G.gear.head.used); }), 'the new gear is saved');
  console.log(JSON.stringify(out));
};
