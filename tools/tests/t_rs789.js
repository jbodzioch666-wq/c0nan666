// RS-789: a shire's door stones and flags are darker: the average of their vertex colours stays low (it was about 0.3 at RS-784)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e)));
  const r = await page.evaluate(async ()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; const t = townList().find(t=>(townFlavorAt(t.x, t.y)||{}).race==='halfling'); G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await new Promise(r=>setTimeout(r, 3500)); let n = 0, sum = 0, cnt = 0, top = 0; V3.world.traverse(c=>{ if (c.name!=='shireDoorStone') return; n++; const C = c.geometry.attributes.color; for (let i=0;i<C.count;i++){ const v = (C.getX(i) + C.getY(i) + C.getZ(i))/3; sum += v; cnt++; if (v > top) top = v; } }); return { n, avg:+(sum/cnt).toFixed(3), top:+top.toFixed(3) }; });
  console.log('rs789', JSON.stringify(r));
  if (!(r.n > 3)) throw new Error('assert: door stones built ' + JSON.stringify(r));
  if (!(r.avg < 0.2 && r.avg > 0.05)) throw new Error('assert: dark, not black ' + JSON.stringify(r));
  if (errs.length) throw new Error('assert: no page errors: ' + errs[0]);
};
