// (art probe, not in ALL) the gear audit: every race (ZG_RACES, default all; ZG_FEM=1 women) in each set (ZG_SETS: plain, plate (tier 5, a shield),
// robe (3), hide (5), dragon (plate 6, spikes)) with a cape, the sculpted figure from three sides: shots/zgear_<set>_<race><f>_<view>.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 200)); });
  const races = (process.env.ZG_RACES || '0,1,2,3,4,5,6,7,8,9').split(',').map(Number), sets = (process.env.ZG_SETS || 'plain,plate,robe,hide,dragon').split(','), fem = process.env.ZG_FEM==='1';
  await page.evaluate(z=>{ window.__zgZoom = z; }, process.env.ZG_ZOOM || ''); for (const race of races){
    await page.evaluate(([race, fem])=>{ window.__noLock = true; goToCharCreate(); ccSelectRace(race); if (fem){ const L = lookTarget(); L.body = 1; } ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; window.__g0 = Object.assign({}, G.gear); }, [race, fem]);
    for (const set of sets){
      await page.evaluate(async set=>{ for (const sl of ['chest', 'legs', 'head', 'arms', 'feet', 'offhand', 'cape']) G.gear[sl] = window.__g0[sl];
        const fam = { plate:'metal', dragon:'metal', robe:'cloth', hide:'hide' }[set], tier = { plate:5, dragon:6, robe:3, hide:5 }[set];
        if (fam) for (const sl of ['chest', 'legs', 'head', 'arms', 'feet']){ G.gear[sl] = rsMakeArmour(fam, tier, sl); G.gear[sl].used = true; }
        G.gear.cape = rsMakeCape(2, 'Red Cape'); G.gear.cape.used = true; if (set==='plate'){ G.gear.offhand = rsMakeArmour('metal', 5, 'offhand'); G.gear.offhand.used = true; }
        if (G.ui!=='dyeworks') openDyeWorks(); renderOverlay(); LP.key = ''; if (LP.e) LP.scene.remove(LP.e.holder); LP.e = null; let k = 0; do { await new Promise(r=>requestAnimationFrame(r)); } while ((LP.pend || !LP.e) && k++ < 900); for (let i=0;i<3;i++) await new Promise(r=>requestAnimationFrame(r)); }, set);
      for (const [view, yaw] of [['three', 0.6], ['side', Math.PI/2], ['back', Math.PI - 0.5]]){
        await page.evaluate(async yaw=>{ LP.yaw = yaw; LP.zoom = +(window.__zgZoom || 0.85); LP.panY = null; for (let i = 0; i < 4; i++) await new Promise(r=>requestAnimationFrame(r)); }, yaw);
        await (await page.$('#lpSlot canvas')).screenshot({ path:__dirname + '/shots/zgear_' + set + '_' + race + (fem ? 'f' : '') + '_' + view + '.png' }); } } }
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
