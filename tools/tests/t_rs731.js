// RS-731: the dye works says what each worn piece is - a named piece (a unique, a set piece) gave no hint it was gloves or boots - and
// shows its icon; a piece whose name already says it (Bronze Gauntlets) gets no tag.
// Shot: shots/rs731_dyeworks.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; skAdd('dye_blue', 3);
    const named = (fam, t, slot, nm)=>Object.assign(rsMakeArmour(fam, t, slot), { nm });
    G.gear.arms = named('metal', 2, 'arms', 'Grasp of the Old King'); G.gear.feet = named('hide', 2, 'feet', 'Striders of the Dusk'); G.gear.head = rsMakeArmour('metal', 1, 'head');
    G.gear.legs = named('cloth', 2, 'legs', 'Mistweave'); openDyeWorks();
    const rows = [...document.querySelectorAll('#overlay .dyerow')].map(e=>({ t:e.querySelector('.dyen').textContent, k:(e.querySelector('.dyek') || {}).textContent || '', ic:!!e.querySelector('img.dyeic') })).filter(x=>x.t.trim());
    return { ui:G.ui, rows }; });
  await page.waitForTimeout(500); await page.screenshot({ path:SHOTS + '/rs731_dyeworks.png' });
  console.log(JSON.stringify(r));
  const row = re=>r.rows.find(x=>re.test(x.t)) || {};
  A(r.ui==='dyeworks', 'the dye works opens');
  A(row(/Grasp of the Old King/).k==='gauntlets', 'named gauntlets say so: ' + JSON.stringify(row(/Grasp/)));
  A(row(/Striders of the Dusk/).k==='boots', 'named boots say so');
  A(row(/Mistweave/).k==='trousers', 'named trousers say so');
  A(row(/Full Helm/).ic && !row(/Full Helm/).k, 'a plain helm: its icon, no tag: ' + JSON.stringify(row(/Full Helm/)));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
