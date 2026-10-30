// RS-732: the emblem on a tome takes the tome's trim dye. Its material glowed a fixed gold, which swamped the dye - a red or blue
// cross still looked gold; now the faint glow is the emblem's own colour.
// Shots: shots/rs732_red.png, rs732_blue.png, rs732_white.png, rs732_plain.png (close on the tome in the dye works)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.offhand = rsMakeArmour('cloth', 3, 'offhand'); G.player.emblem = 'cross'; for (const d of ['red', 'blue', 'white']) skAdd('dye_' + d, 3); openDyeWorks(); });
  await page.waitForTimeout(4000);
  const emis = ()=>page.evaluate(()=>{ const out = []; LP.scene.traverse(o=>{ if (o.isMesh && o.material.map && Object.values(M3D_TOMEEM).includes(o.material.map)) out.push(o.material.emissive.getHexString()); }); return out; });
  const res = {};
  for (const d of ['red', 'blue', 'white', null]){
    await page.evaluate(d=>trimDyeApply('g:offhand', d), d); await page.waitForTimeout(2500);
    const box = await page.evaluate(()=>{ const r = document.getElementById('lpSlot').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
    await page.screenshot({ path:SHOTS + '/rs732_' + (d || 'plain') + '.png', clip:{ x:box[0] + box[2]*0.5, y:box[1] + box[3]*0.45, width:box[2]*0.4, height:box[3]*0.3 } });
    res[d || 'plain'] = { em:await emis(), col:await page.evaluate(()=>rsPlayerLook().o.tomeEmCol) };
  }
  console.log(JSON.stringify(res));
  const ch = h=>[0, 2, 4].map(i=>parseInt(h.slice(i, i+2), 16));
  A(res.red.em.length && res.red.em.every(h=>{ const c = ch(h); return c[0] > c[1] && c[0] > c[2]; }), 'a red emblem glows red, not gold: ' + JSON.stringify(res.red));
  A(res.blue.em.length && res.blue.em.every(h=>{ const c = ch(h); return c[2] > c[0] && c[2] > c[1]; }), 'a blue emblem glows blue: ' + JSON.stringify(res.blue));
  A(res.plain.col==='#d8b050' && res.plain.em.length, 'washed out it is gold again: ' + JSON.stringify(res.plain));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
