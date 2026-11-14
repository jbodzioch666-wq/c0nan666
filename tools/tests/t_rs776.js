// RS-776: a chicken on the fire is a chicken leg, not a steak: cookRigMake's 'chicken' (a turned, lumpy drumstick on its bone and knuckle),
// pale pink raw and golden brown roasted, on the campfire's grill and in the hearth's skillet. Beef stays a steak. Shots: probe zchicken
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = {}, avg = (a, o)=>{ let s = 0, n = 0; for (let i=o;i<a.length;i+=3){ s += a[i]; n++; } return s/n; };
    for (const pan of [false, true]){ const rg = cookRigMake(T, { pan }), show = (a, done)=>{ G.ui = 'cook'; CQ.list = [{ kind:'cook', a, n:3, done:0, ui:'cook' }]; CQ.next = done ? performance.now() - 1 : performance.now() + cqStepOf({ kind:'cook' }); cookRigSync(rg, true, 1); return Object.keys(rg.foods).filter(k=>rg.foods[k].visible); };
      const o = out[pan ? 'pan' : 'grill'] = {}; o.seen = show('chicken', false); const ms = rg.foods.chicken ? rg.foods.chicken.userData.meshes : [];
      o.meshes = ms.length; o.verts = ms.reduce((t, m)=>t + m.geometry.attributes.position.count, 0);
      const col = ()=>{ const a = ms[0].geometry.attributes.color.array; return [+avg(a, 0).toFixed(3), +avg(a, 1).toFixed(3), +avg(a, 2).toFixed(3)]; };
      o.raw = col(); show('chicken', true); o.done = col(); o.beef = show('beef', false);
      const bb = new T.Box3().setFromObject(rg.foods.chicken); o.len = +(bb.max.x - bb.min.x).toFixed(3); }
    G.ui = 'playing'; CQ.list = []; return out; });
  console.log(JSON.stringify(r));
  for (const k of ['grill', 'pan']){ const o = r[k];
    A(o.seen.join()==='chicken', k + ': a chicken on the fire is its own food, not a steak: ' + o.seen);
    A(o.meshes >= 4 && o.verts >= 2000, k + ': a smooth leg on its bone and knuckle: ' + o.verts);
    A(o.raw[0] > 0.55 && o.raw[1] > 0.3 && o.raw[2] > 0.25, k + ': pale pink raw: ' + o.raw);
    A(o.done[0] > o.done[1]*1.5 && o.done[1] > o.done[2]*1.5 && o.done[0] < o.raw[0], k + ': golden brown roasted: ' + o.done);
    A(o.len > 0.15 && o.len < 0.3, k + ': a leg\'s length on the grill: ' + o.len);
    A(o.beef.join()==='steak', k + ': beef still a steak'); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
