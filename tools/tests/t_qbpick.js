// RS-321: click an empty quick-bar slot and the side window opens on your bag, showing only what can go on the bar (potions,
// scrolls, food); tap one and it goes in that slot
module.exports = async page=>{
  await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const pot = k=>{ const it = newItem(); Object.assign(it, { used:1, nm:POTIONS[k][0], consumable:1, kind:'heal', hd1:POTIONS[k][1], hd2:POTIONS[k][2], price:POTIONS[k][4] }); return it; };
    G.inv = [pot(0), rsMakeStaff(1), pot(1)]; skAdd('c_trout', 3); skAdd('c_shrimp', 2);
    G.player.quickBar = Array(9).fill(null); G.player.quickBar2 = Array(9).fill(null); SP.open = false;
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const slot = await page.evaluate(()=>{ const e = document.querySelectorAll('#quickBar .qb-slot')[3]; const r = e.getBoundingClientRect(); return { x:r.left+r.width/2, y:r.top+r.height/2 }; });
  await page.mouse.click(slot.x, slot.y); await page.waitForTimeout(150);
  const open = await page.evaluate(()=>{ const sp = document.getElementById('sidePanel'); const inv = [...sp.querySelectorAll('[data-sp-inv]')].map(e=>G.inv[+e.dataset.spInv].nm);
    return { open:SP.open, tab:SP.tab, pick:SP.pick, inv, food:sp.querySelectorAll('[data-sp-food]').length, banner:/Choosing for quick bar 1, slot 4/.test(sp.textContent), glow:document.querySelectorAll('#quickBar .qb-slot')[3].classList.contains('picking') }; });
  await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/qbpick.png' });
  const cell = await page.evaluate(()=>{ const e = document.querySelector('#sidePanel [data-sp-inv]'); const r = e.getBoundingClientRect(); return { x:r.left+r.width/2, y:r.top+r.height/2, nm:G.inv[+e.dataset.spInv].nm }; });
  await page.mouse.click(cell.x, cell.y); await page.waitForTimeout(150);
  const put = await page.evaluate(()=>({ q:G.player.quickBar[3], pick:SP.pick, inv:G.inv.length }));
  // and food, into the second bar
  const s2 = await page.evaluate(()=>{ const e = document.querySelectorAll('#quickBar2 .qb-slot')[0]; const r = e.getBoundingClientRect(); return { x:r.left+r.width/2, y:r.top+r.height/2 }; });
  await page.mouse.click(s2.x, s2.y); await page.waitForTimeout(150);
  const f = await page.evaluate(()=>{ const e = document.querySelector('#sidePanel [data-sp-food]'); const r = e.getBoundingClientRect(); return { x:r.left+r.width/2, y:r.top+r.height/2, id:e.dataset.spFood }; });
  await page.mouse.click(f.x, f.y); await page.waitForTimeout(150);
  const food = await page.evaluate(()=>G.player.quickBar2[0]);
  // clicking a filled slot still uses it rather than choosing
  const used = await page.evaluate(()=>{ SP.open = false; hudLayout(); const n0 = skHave(G.player.quickBar2[0].id); G.player.hp = 1; qbUse(0, 1); return { picking:!!SP.pick, ate:skHave(G.player.quickBar2[0].id) < n0 }; });
  console.log(JSON.stringify({ open, cell, put, food, used }));
  if (!(open.open && open.tab==='inv' && open.pick && open.banner && open.glow)) throw new Error('an empty slot opens the bag to choose for it '+JSON.stringify(open));
  if (open.inv.some(nm=>!/potion/i.test(nm)) || open.inv.length!==2 || open.food!==2) throw new Error('only what can go on the bar is shown '+JSON.stringify(open));
  if (!put.q || put.q.t!=='item' || put.q.nm!==cell.nm || put.pick || put.inv!==3) throw new Error('tapping an item puts it in the slot (and keeps it in the bag) '+JSON.stringify(put));
  if (!food || food.t!=='food' || food.id!==f.id) throw new Error('food goes in too '+JSON.stringify(food));
  if (used.picking || !used.ate) throw new Error('a filled slot is used, not chosen for '+JSON.stringify(used));
};
