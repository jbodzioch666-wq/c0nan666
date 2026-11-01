// (art probe, not in ALL) the wood elf in the creator's preview, drawn and sculpted, front, side and the head close: shots/zwe1_<mode>_<view>.png
// ZW_RACE picks another race by index (2 the wood elf)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(()=>{ goToCharCreate(); renderOverlay(); window.__tpOn = tpOn; });
  const race = +(process.env.ZW_RACE || 2);
  for (const mode of ['drawn', 'model']){
    await page.evaluate(async ([race, mode])=>{ tpOn = mode==='model' ? window.__tpOn : ()=>false; LP.key = ''; if (LP.e) LP.scene.remove(LP.e.holder); LP.e = null; ccSelectRace(race); await new Promise(r=>setTimeout(r, 60)); let k = 0; do { await new Promise(r=>requestAnimationFrame(r)); } while ((LP.pend || !LP.e) && k++ < 600); }, [race, mode]);
    for (const [view, yaw, zoom] of [['front', 0, 1], ['side', Math.PI/2, 1], ['three', 0.6, 1], ['headf', 0, 3.2], ['heads', Math.PI/2, 3.2], ['sidez', Math.PI/2, 1.7], ['backz', 2.5, 1.7]]){
      await page.evaluate(async ([yaw, zoom])=>{ LP.yaw = yaw; LP.zoom = zoom; LP.panY = null; for (let i = 0; i < 4; i++) await new Promise(r=>requestAnimationFrame(r)); }, [yaw, zoom]);
      await (await page.$('#lpSlot canvas')).screenshot({ path:__dirname + '/shots/zwe1_' + mode + '_' + view + '.png' }); }
    console.log(mode, await page.evaluate(()=>JSON.stringify({ tp:!!LP.e.tp, o:Object.fromEntries(Object.entries(LP.e.o||{}).filter(([k])=>/stoop|curve|hump|head|limb|nose|ear/i.test(k))) })));
  }
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
