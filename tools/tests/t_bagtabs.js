// RS-298: the inventory lives on the equipment page. I opens the character stats and the equipment side by side, centred; the bag
// under the figure is in tabs (all, gear, food, scrolls, resources, junk); a piece picked in the bag gets the old inventory's
// buttons and details; P opens the character stats on their own, centred too
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    G.inv = []; G.inv.push(rsMakeWeapon(3, 3), rsMakeArmour('metal', 2, 'head'), rsMakeArmour('metal', 1, 'chest'), genPotion(3), mkAntipoison(), sqTome('insight'));
    skAdd('c_'+SK_FISH[0].id, 6); skAdd(SK_ORE[0].id, 12); skAdd(SK_LOG[0].id, 7); skAdd('bones', 10); });
  // I: both pages, centred, and no separate inventory screen
  await page.keyboard.press('i'); await page.waitForTimeout(250);
  out.i = await ev(()=>{ const q = s=>document.querySelector('#overlay '+s), sp = q('.cs-statspage'), gp = q('.cs-gearpage');
    const a = sp && sp.getBoundingClientRect(), b = gp && gp.getBoundingClientRect();
    return { ui:G.ui, both:!!(a && b && a.right <= b.left + 1), mid:a && b ? Math.round((a.left + b.right)/2 - innerWidth/2) : null, tabs:[...document.querySelectorAll('#overlay .cs-bagtab')].map(e=>e.textContent.replace(/\s*\d+$/, '').trim()),
      cells:document.querySelectorAll('#overlay .cs-bag .sp-cell').length, oldInv:!!q('.invgrid') }; });
  A(out.i.ui==='inventory' && out.i.both, 'I opens the stats beside the equipment: '+JSON.stringify(out.i));
  A(Math.abs(out.i.mid) <= 30, 'the two pages are centred: '+out.i.mid);
  A(out.i.tabs.join()==='All,Gear,Food,Scrolls,Resources,Junk', 'the bag has its tabs: '+out.i.tabs);
  A(out.i.cells===6 && !out.i.oldInv, 'every item in the bag, no old inventory grid');
  // the tabs show what belongs in them
  const tab = t=>ev(t=>{ csBagTab(t); return { cells:[...document.querySelectorAll('#overlay .cs-bag .sp-cell')].map(e=>G.inv[+e.dataset.csinv].nm), res:document.querySelector('#overlay .cs-res') ? document.querySelector('#overlay .cs-res').textContent : '', bar:!!document.getElementById('invSearch') }; }, t);
  out.gear = await tab('gear'); A(out.gear.cells.length===3, 'gear: the weapon, helm and body: '+out.gear.cells);
  out.food = await tab('food'); A(out.food.cells.length===2 && /Cooked/.test(out.food.res), 'food: the potions and the cooked fish: '+JSON.stringify(out.food));
  out.scroll = await tab('scroll'); A(out.scroll.cells.length===1, 'scrolls: the tome');
  out.res = await tab('res'); A(!out.res.cells.length && /Copper Ore/.test(out.res.res) && /Bones/.test(out.res.res) && !/Cooked/.test(out.res.res) && !out.res.bar, 'resources: ores, logs and bones, not food: '+out.res.res.slice(0, 120));
  // a pick in the bag: its buttons and details, and the stats page marks what it would change; E equips it
  await tab('all');
  out.pick = await ev(()=>{ charSheetInvSelect(0); const acts = [...document.querySelectorAll('#overlay .cs-acts .btn')].map(b=>b.textContent.trim());
    return { acts, detail:!!document.querySelector('#overlay .cs-gearpage .detailpane'), sel:G.invSel }; });
  A(out.pick.acts.some(t=>/equip/.test(t)) && out.pick.acts.some(t=>/sell/.test(t)) && out.pick.detail && out.pick.sel===0, 'a picked piece gets its buttons and details: '+JSON.stringify(out.pick));
  await ev(()=>{ G.player.skills.attack = SK_XP[60]; rsSync(); renderOverlay(); });
  await page.keyboard.press('e'); await page.waitForTimeout(150);
  out.eq = await ev(()=>({ w:G.gear.weapon.rsTier, n:G.inv.length, sel:G.charSheetInvSel })); A(out.eq.w===3 && out.eq.sel===-1, 'E wields it: '+JSON.stringify(out.eq));
  // with nothing picked, E does nothing to the bag
  const n0 = await ev(()=>G.inv.length); await page.keyboard.press('e'); await page.waitForTimeout(100); A(await ev(n=>G.inv.length===n, n0), 'E with nothing picked changes nothing');
  await page.screenshot({ path:SHOTS+'/shot_bagtabs.png' });
  // P: the stats alone, centred, with a way back to the equipment
  await page.keyboard.press('p'); await page.waitForTimeout(200);
  out.p = await ev(()=>{ const sp = document.querySelector('#overlay .cs-statspage'), r = sp && sp.getBoundingClientRect();
    return { ui:G.ui, gear:!!document.querySelector('#overlay .cs-gearpage'), mid:r ? Math.round(r.left + r.width/2 - innerWidth/2) : null, back:/equipment/.test((document.querySelector('#overlay .cs-pgsw')||{}).textContent||'') }; });
  A(out.p.ui==='charsheet' && !out.p.gear && Math.abs(out.p.mid) <= 30 && out.p.back, 'P is the stats on their own, centred: '+JSON.stringify(out.p));
  await page.keyboard.press('Escape'); A(await ev(()=>G.ui==='playing'), 'Escape closes it');
  console.log(JSON.stringify(out));
};
