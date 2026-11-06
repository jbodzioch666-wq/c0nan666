// RS-728: the Jeweller's gem-cutting table and jeweller's bench get the work screen (a gem on the dop against the spinning lap, its
// facets coming up; a ring on the mandrel or a pendant on its stand, tapped by the hammer, cooling from the torch), and silver rings
// and amulets move off the anvil onto the jeweller's bench as Crafting recipes (first row). The anvil no longer offers silver.
// Shots: shots/rs728_cut.png (mid-cut), rs728_ring.png (mid-cast), rs728_amulet.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    skGainXP('crafting', 60000); skGainXP('smithing', 60000); skAdd('sapphire', 2); skAdd('silverb', 3); skAdd('goldb', 2); skAdd('bronze', 2);
    /* the anvil: no silver */
    enterInterior('smith'); G.bench = 'anvil'; ENCH.tab = 'forge'; ANF.bar = ANF.pc = null; setUi('bench');
    const anvil = [...document.querySelectorAll('.anf-bar')].map(e=>e.textContent), fur = (G.bench = 'furnace', FUR.sel = 'silverb', setUi('playing'), setUi('bench'), document.querySelector('.anv-right').textContent);
    setUi('playing'); exitInterior();
    /* the gem-cutting table: no jeweller in this town? set one up anyway - the benches work from any room */
    enterInterior(buildingByKey('jeweller') ? 'jeweller' : 'tailor'); G.bench = 'gemcut'; WB.sel = {}; setUi('bench');
    const ov = document.getElementById('overlay'), cut = wbRecipes('gemcut').find(x=>x.nm==='Cut sapphire'); wbPick(cut.id); wbMake(2);
    return { anvil, furSilver:/jeweller's bench/.test(fur), title:ov.querySelector('.panel-title').textContent, lap:!!ov.querySelector('.wb-lap'), cardCol:ov.querySelector('.wb-card.on').style.getPropertyValue('--bc') };
  });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs728_cut.png' }); await page.waitForTimeout(2500);
  const r1 = await ev(()=>({ q:CQ.list.length, cut:skHave('g_sapphire'), raw:skHave('sapphire') }));
  const r2 = await ev(()=>{ setUi('playing'); G.bench = 'jeweller'; WB.sel = {}; setUi('bench'); const ov = document.getElementById('overlay'), R = wbRecipes('jeweller');
    const rows = [...ov.querySelectorAll('.anv-left .anv-gh')].map(e=>e.textContent), sr = R.find(x=>x.nm==='Silver ring'); wbPick(sr.id); const right = ov.querySelector('.anv-right').textContent; const n0 = G.inv.length; wbMake(1);
    return { title:ov.querySelector('.panel-title').textContent, rows, rolled:/rolled/.test(right), mandrel:!!ov.querySelector('.wb-jham'), n0 }; });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs728_ring.png' }); await page.waitForTimeout(1200);
  const r3 = await ev(()=>{ const it = G.inv[G.inv.length - 1]; const am = wbRecipes('jeweller').find(x=>x.nm==='Sapphire Amulet'); wbPick(am.id);
    return { made:it && it.nm, slot:it && it.slot, n:G.inv.length, silver:skHave('silverb'), crafted:!!(it && it.crafted) }; });
  await page.waitForTimeout(300); await page.screenshot({ path:SHOTS + '/rs728_amulet.png' });
  console.log(JSON.stringify({ r0, r1, r2, r3 }));
  A(!r0.anvil.some(t=>/Silver/.test(t)) && r0.anvil.some(t=>/Bronze/.test(t)), 'the anvil no longer offers silver: ' + r0.anvil.join('|'));
  A(r0.furSilver, "the furnace sends silver to the jeweller's bench");
  A(r0.title==='GEM-CUTTING TABLE' && r0.lap, 'the gem-cutting table: ' + JSON.stringify(r0));
  A(r1.q===0 && r1.cut===2 && r1.raw===0, 'two sapphires cut: ' + JSON.stringify(r1));
  A(r2.title==="JEWELLER'S BENCH" && r2.mandrel && r2.rows[0]==='SILVER JEWELLERY 12' && r2.rolled, "the jeweller's bench, silver first: " + JSON.stringify(r2));
  A(r3.slot==='ring' && r3.n===r2.n0 + 1 && r3.silver >= 2 && r3.crafted, 'a silver ring cast at the bench (Crafting may keep the bar): ' + JSON.stringify(r3));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
