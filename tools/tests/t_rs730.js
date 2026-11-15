// RS-730: the Alchemist's brewing cauldron and the Tailor's dye vat get the work screen: herbs drop into the bubbling brew and the
// ladle stirs as it clears to the potion's colour; a length of cloth is dipped in the vat and comes up dyed. Brew a healing potion
// (a vial makes a stronger one), brew antipoison, brew a dye, and the dye vat still opens the dye works.
// Shots: shots/rs730_cauldron.png (mid-brew), rs730_poison.png, rs730_dye.png (mid-dip), rs730_vat.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    skGainXP('alchemy', 60000); skGainXP('crafting', 60000); skAdd('silverleaf', 4); skAdd('bloodmoss', 1); skAdd('vial', 1);
    enterInterior('alch'); G.bench = 'cauldron'; WB.sel = {}; setUi('bench');
    const ov = document.getElementById('overlay'); wbPick('b_silverleaf'); const right = ov.querySelector('.anv-right').textContent; wbMake(9999);
    return { title:ov.querySelector('.panel-title').textContent, wide:ov.classList.contains('ovwide'), cards:ov.querySelectorAll('[data-wb-r]').length, rows:[...ov.querySelectorAll('.anv-left .anv-gh')].map(e=>e.textContent),
      ladle:!!ov.querySelector('.wb-ladle'), vialNote:/with a vial/.test(right), heals:/heals 2d4/.test(right), total:CQ.list[0] && CQ.list[0].total, kind:CQ.list[0] && CQ.list[0].kind,
      chips:[...ov.querySelectorAll('.wb-mat span')].map(e=>e.textContent) };
  });
  await page.waitForTimeout(800); await page.screenshot({ path:SHOTS + '/rs730_cauldron.png' });
  const mid = await ev(()=>({ pour:!!document.querySelector('.wb-stage.pour'), herb:!!document.querySelector('.wb-stage.pour .wb-herb') }));
  await page.waitForFunction(()=>!CQ.list.length, null, { timeout:15000 });
  const r1 = await ev(()=>({ heal:G.inv.filter(i=>i.kind==='heal').reduce((a, i)=>a + (i.qty||1), 0), vialPot:G.inv.some(i=>i.kind==='heal' && /\(vial\)/.test(i.nm)), vial:skHave('vial'), leaf:skHave('silverleaf') }));
  /* antipoison: a silverleaf and a bloodmoss; weapon poison+ without ghostcap says why */
  const r2 = await ev(async ()=>{ skAdd('silverleaf', 1); wbPick('b_antipoison'); wbMake(1); while (CQ.list.length) await new Promise(r=>setTimeout(r, 100));
    const anti = G.inv.some(i=>i.kind==='antipoison'); wbPick('b_wp2'); wbMake(1); return { anti, q:CQ.list.length, msg:WB.msg }; });
  await page.waitForTimeout(300); await page.screenshot({ path:SHOTS + '/rs730_poison.png' });
  /* the dye vat */
  const r3 = await ev(()=>{ setUi('playing'); exitInterior(); enterInterior('tailor'); skAdd('bloodmoss', 2); G.bench = 'dyevat'; WB.sel = {}; setUi('bench'); const ov = document.getElementById('overlay');
    const red = wbRecipes('dyevat').find(x=>x.nm==='Red dye'); wbPick(red.id); wbMake(1);
    return { title:ov.querySelector('.panel-title').textContent, wide:ov.classList.contains('ovwide'), dip:!!ov.querySelector('.wb-dip'), btn:[...ov.querySelectorAll('.btnrow .btn')].some(b=>/dye your gear/.test(b.textContent)) }; });
  await page.waitForTimeout(500); await page.screenshot({ path:SHOTS + '/rs730_dye.png' }); await page.waitForFunction(()=>!CQ.list.length, null, { timeout:15000 });
  await page.waitForTimeout(300); await page.screenshot({ path:SHOTS + '/rs730_vat.png' });
  const r4 = await ev(()=>{ const dye = skHave('dye_red'); [...document.querySelectorAll('#overlay .btnrow .btn')].find(b=>/dye your gear/.test(b.textContent)).click(); return { dye, ui:G.ui }; });
  console.log(JSON.stringify({ r0, mid, r1, r2, r3, r4 }));
  A(r0.title==='BREWING CAULDRON' && r0.wide && r0.cards===11 && r0.ladle, 'the cauldron work screen: ' + JSON.stringify(r0));
  A(r0.rows.length===2 && /^HEALING POTIONS/.test(r0.rows[0]) && /^POISONS AND CURES/.test(r0.rows[1]), 'healing potions, then poisons and cures: ' + r0.rows.join('|'));
  A(r0.vialNote && r0.heals && r0.kind==='brew' && r0.total===2, 'two minor healing potions through the brew queue: ' + JSON.stringify(r0));
  A(r0.chips.includes('Silverleaf') && r0.chips.includes('Glass Vial'), 'the herb and vial chips: ' + r0.chips.join('|'));
  A(mid.pour && mid.herb, 'the cauldron works while it brews: ' + JSON.stringify(mid));
  A(r1.heal >= 2 && r1.vialPot && r1.vial===0 && r1.leaf < 4, 'potions brewed, the vial into one: ' + JSON.stringify(r1));
  A(r2.anti, 'antipoison brewed');
  A(r2.q===0 && /ghostcap/i.test(r2.msg), 'weapon poison+ asks for ghostcap: ' + r2.msg);
  A(r3.title==='DYE VAT' && r3.wide && r3.dip && r3.btn, 'the dye vat work screen: ' + JSON.stringify(r3));
  A(r4.dye >= 1 && r4.ui==='dyeworks', 'a red dye brewed, and the dye works opens: ' + JSON.stringify(r4));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
