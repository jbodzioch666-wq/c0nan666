// RS-735: boats are built, not bought. Every town has a Boatyard: saw logs into planks at the saw pit, twist flax into rope and sew
// linen into sailcloth at the ropewalk, then build the boat on the slipway stage by stage - keel, frames, planking, deck, masts, sails -
// and watch it grow there, in the picture and in 3D. The Peddler no longer sells one.
// Shots: shots/rs735_saw.png, rs735_rope.png, rs735_slip.png (mid-work), rs735_yard.png (3D, a sloop half built), rs735_sloop.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const idle = ()=>page.waitForFunction(()=>!CQ.list.length, null, { timeout:30000 });
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const yard = buildingByKey('boatyard'); skAdd('logs', 6); skAdd('flax', 4); skAdd('linen', 2); skGainXP('crafting', 5000);
    enterInterior('boatyard'); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const benches = Object.keys(ROOM_LAYOUT.boatyard || {}).length ? JSON.stringify(ROOM_LAYOUT.boatyard) : '';
    G.bench = 'sawpit'; WB.sel = {}; setUi('bench'); const ov = document.getElementById('overlay');
    const pl = wbRecipes('sawpit').find(x=>/^plank/i.test(x.nm)); wbPick(pl.id); wbMake(2);
    return { yard:!!yard, name:yard && yard.name, benches, title:ov.querySelector('.panel-title').textContent, wide:ov.classList.contains('ovwide'), saws:!!ov.querySelector('.by-saw'), recipes:wbRecipes('sawpit').map(x=>x.nm), peddler:typeof buyBoat, sail:typeof sailUpgrade };
  });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs735_saw.png' }); await idle();
  const r1 = await ev(async ()=>{ const out = { planks:skHave('plank'), logs:skHave('logs') };
    G.bench = 'ropewalk'; WB.sel = {}; setUi('bench'); const rp = wbRecipes('ropewalk'); out.ropeRecipes = rp.map(x=>x.nm);
    wbPick(rp.find(x=>/^rope/i.test(x.nm)).id); wbMake(2); return out; });
  await page.waitForTimeout(700); await page.screenshot({ path:SHOTS + '/rs735_rope.png' }); await idle();
  const r2 = await ev(async ()=>{ const out = { rope:skHave('rope'), flax:skHave('flax') };
    wbPick(wbRecipes('ropewalk').find(x=>/^sailcloth/i.test(x.nm)).id); wbMake(1); while (CQ.list.length) await new Promise(r=>setTimeout(r, 100)); out.cloth = skHave('sailcloth');
    /* the slipway: a rowboat's first stage through the queue */
    const S = boatStages(1); out.need = S.map(s=>s.need); G.bench = 'slipway'; setUi('bench'); const ov = document.getElementById('overlay');
    out.slip = { title:ov.querySelector('.panel-title').textContent, stages:ov.querySelectorAll('.by-st').length, boats:ov.querySelectorAll('.by-boat').length, svg:!!ov.querySelector('.by-stage svg') };
    for (const s of S) for (const k in s.need) if (k!=='plank' && k!=='rope' && k!=='sailcloth') skAdd(k, s.need[k]);
    const tot = k=>S.reduce((a, s)=>a + (s.need[k]||0), 0); skAdd('plank', Math.max(0, tot('plank') - skHave('plank'))); skAdd('rope', Math.max(0, tot('rope') - skHave('rope'))); skAdd('sailcloth', Math.max(0, tot('sailcloth') - skHave('sailcloth')));
    out.kids0 = V3.yardBoat ? V3.yardBoat.children.length : -1; boatYardWork(); out.q = CQ.list[0] && { kind:CQ.list[0].kind, total:CQ.list[0].n }; return out; });
  await page.waitForTimeout(900); await page.screenshot({ path:SHOTS + '/rs735_slip.png' });
  const mid = await ev(()=>({ pour:!!document.querySelector('.by-stage.pour'), mal:!!document.querySelector('.by-stage.pour .by-mal') })); await idle();
  const r3 = await ev(async ()=>{ const b = G.player.boatBuild, out = { st:b && b.st, kids1:V3.yardBoat ? V3.yardBoat.children.length : -1 };
    const counts = [out.kids1]; let n = 0; while (boatTier() < 1 && n++ < 200){ if (!boatWork()) break; counts.push(V3.yardBoat ? V3.yardBoat.children.length : -1); }
    out.counts = counts; out.tier = boatTier(); out.has = !!G.player.hasBoat; out.cons = skLvl('construction'); out.left = { plank:skHave('plank'), rope:skHave('rope'), cloth:skHave('sailcloth') };
    /* a sloop needs Construction 20 and the yard's fee */
    out.why = boatWhy(boatBuild()); skGainXP('construction', 400000); G.player.gold = 5000;
    const S = boatStages(2); for (const s of S) for (const k in s.need) skAdd(k, s.need[k]); out.sloopNeed = S.map(s=>s.need);
    const kid = []; while (G.player.boatBuild == null || G.player.boatBuild.st < 4){ if (!boatWork()) break; kid.push(V3.yardBoat.children.length); }
    for (let i=0;i<2;i++) boatWork(); out.sloopKids = kid; out.sloop = { ...G.player.boatBuild }; out.gold = G.player.gold;
    setUi('playing'); const P = G.player; P.x = 9; P.y = 10; for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } return out; });
  await page.waitForTimeout(400); await page.screenshot({ path:SHOTS + '/rs735_yard.png' });
  await ev(()=>{ G.bench = 'slipway'; setUi('bench'); }); await page.waitForTimeout(300); await page.screenshot({ path:SHOTS + '/rs735_sloop.png' });
  const r4 = await ev(()=>{ let n = 0; while (boatTier() < 2 && n++ < 200) if (!boatWork()) break; return { tier:boatTier(), kids:V3.yardBoat.children.length, ui:G.ui }; });
  console.log(JSON.stringify({ r0, r1, r2, mid, r3, r4 }));
  A(r0.yard && /Boatyard/.test(r0.name) && /slipway/.test(r0.benches) && /sawpit/.test(r0.benches) && /ropewalk/.test(r0.benches), 'every town has a boatyard with its benches: ' + JSON.stringify(r0));
  A(r0.peddler==='undefined' && r0.sail==='undefined', 'no buying or upgrading a boat for gold');
  A(r0.title==='SAW PIT' && r0.wide && r0.saws && r0.recipes.length===4, 'the saw pit work screen: ' + JSON.stringify(r0));
  A(r1.planks===2 && r1.logs <= 4, 'two logs sawn into planks: ' + JSON.stringify(r1));
  A(r2.rope===2 && r2.flax < 4 && r2.cloth===1, 'rope from flax and sailcloth from linen: ' + JSON.stringify(r2));
  A(r2.slip.title==='SLIPWAY' && r2.slip.stages===6 && r2.slip.boats===4 && r2.slip.svg, 'the slipway screen: ' + JSON.stringify(r2.slip));
  A(r2.q && r2.q.kind==='boat' && r2.q.total >= 1 && r2.kids0===0, 'the keel goes through the queue on an empty slipway: ' + JSON.stringify(r2));
  A(mid.pour && mid.mal, 'the slipway works while you build: ' + JSON.stringify(mid));
  A(r3.st===1 && r3.kids1 >= 3, 'the keel done, and in 3D: ' + JSON.stringify(r3));
  A(r3.tier===1 && r3.has && r3.counts[r3.counts.length - 2] > r3.kids1, 'the rowboat is built and launched, growing on the way: ' + JSON.stringify(r3.counts));
  A(r3.counts[r3.counts.length - 1]===0, 'the slipway is empty after the launch');
  A(/Construction 20/.test(r3.why), 'a sloop needs Construction 20: ' + r3.why);
  A(r3.sloop.st===4 && r3.sloopKids.length && r3.sloopKids[r3.sloopKids.length - 1] > r3.sloopKids[0] && r3.gold===4700, 'the sloop under way, its fee paid: ' + JSON.stringify(r3.sloop) + ' gold ' + r3.gold + ' ' + JSON.stringify(r3.sloopKids));
  A(r4.tier===2 && r4.kids===0, 'the sloop launched: ' + JSON.stringify(r4));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
