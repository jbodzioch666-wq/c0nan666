// RS-778: recipes for the farmyard's chicken and beef - Chicken Pie, Chicken Soup, Beef Pie, Beef & Bloodmoss Stew and the Farmhouse
// Pie (beef, chicken and ghostcap). Each cooks from its ingredients at its level, has its own bag icon (a golden soup, a dark stew,
// pies of their own crust), browns in the pan in its own broth, and the raw chicken and beef say what they cook into.
// Shot: shots/rs778-icons.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = { cooked:{}, low:{} }, ids = ['chickpie', 'chicksoup', 'beefpie', 'beefstew', 'farmpie'];
    out.dishes = ids.map(id=>{ const d = SK_DISHES.find(d=>d.id===id); return d && [d.nm, d.cook, d.heal, Object.keys(d.need).join('+')]; });
    out.sorted = SK_DISHES.every((d, i)=>!i || SK_DISHES[i-1].cook <= d.cook);
    /* too low a level: refused, nothing spent */
    for (const id of ['beefpie']){ const d = SK_DISHES.find(d=>d.id===id); for (const k in d.need) skAdd(k, d.need[k]); const before = skHave('beef'); out.low[id] = [skCookDish(id), skHave('beef')===before]; for (const k in d.need) skAdd(k, -d.need[k]); }
    /* at level: each cooks, its ingredients spent */
    skGainXP('cooking', 5e7); const rr = Math.random; Math.random = ()=>0.999;
    for (const id of ids){ const d = SK_DISHES.find(d=>d.id===id); for (const k in d.need) skAdd(k, d.need[k]); const n = skCookDish(id); out.cooked[id] = [n, skHave('c_' + id), Object.keys(d.need).every(k=>skHave(k)===0)]; }
    Math.random = rr;
    out.uses = { chicken:resUses('chicken').join(' | '), beef:resUses('beef').join(' | ') };
    out.names = ids.map(id=>skName('c_' + id));
    /* the icons: the broth's colour in the middle of the bowl, the pie's crust */
    const px = (id, x, y)=>new Promise(res=>{ const im = new Image(); im.onload = ()=>{ const c = document.createElement('canvas'); c.width = c.height = 48; const g = c.getContext('2d'); g.drawImage(im, 0, 0); res([...g.getImageData(x, y, 1, 1).data].slice(0, 3)); }; im.src = foodIconUrl(id); });
    out.icon = { stew:await px('c_stew', 22, 24), chicksoup:await px('c_chicksoup', 22, 24), beefstew:await px('c_beefstew', 22, 24), chickpie:await px('c_chickpie', 24, 27), beefpie:await px('c_beefpie', 24, 27) };
    { const c = document.createElement('canvas'); c.width = 5*96; c.height = 96; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#2a2420'; x.fillRect(0, 0, c.width, c.height);
      for (let i=0;i<ids.length;i++){ const im = new Image(); im.src = foodIconUrl('c_' + ids[i]); await new Promise(r=>{ im.onload = r; }); x.drawImage(im, i*96, 0, 96, 96); } out.shot = c.toDataURL('image/png'); }
    /* the pan: each in its own broth */
    { const rg = cookRigMake(THREE, { pan:true }), broth = a=>{ G.ui = 'cook'; CQ.list = [{ kind:'dish', a, n:1, done:0, ui:'cook' }]; CQ.next = performance.now() + 1000; cookRigSync(rg, true, 1); const c = rg.broth.material.color; return [Object.keys(rg.foods).filter(k=>rg.foods[k].visible).join(), +c.r.toFixed(3), +c.g.toFixed(3), +c.b.toFixed(3)]; };
      out.pan = { stew:broth('stew'), chicksoup:broth('chicksoup'), beefstew:broth('beefstew') }; G.ui = 'playing'; CQ.list = []; }
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs778-icons.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  A(r.dishes.every(Boolean) && r.sorted, 'the five new dishes, in order of level: ' + JSON.stringify(r.dishes));
  A(r.low.beefpie[0]===0 && r.low.beefpie[1], 'too low a level: refused, nothing spent');
  for (const id in r.cooked) A(r.cooked[id][0]===1 && r.cooked[id][1]===1 && r.cooked[id][2], 'cooked, its ingredients spent: ' + id + ' ' + r.cooked[id]);
  A(/chicken pie/.test(r.uses.chicken) && /chicken soup/.test(r.uses.chicken) && /farmhouse pie/.test(r.uses.chicken), 'raw chicken says what it cooks into: ' + r.uses.chicken);
  A(/beef pie/.test(r.uses.beef) && /beef & bloodmoss stew/.test(r.uses.beef), 'and raw beef: ' + r.uses.beef);
  A(r.names.join() === 'Chicken Pie,Chicken Soup,Beef Pie,Beef & Bloodmoss Stew,Farmhouse Pie', 'named: ' + r.names);
  const I = r.icon, lum = c=>c[0] + c[1] + c[2];
  A(lum(I.chicksoup) > lum(I.stew) + 120 && lum(I.beefstew) < lum(I.stew), 'a golden soup and a dark stew in their bowls: ' + JSON.stringify(I));
  A(lum(I.chickpie) > lum(I.beefpie) + 200, 'a pale chicken pie, a dark beef pie');
  A(r.pan.chicksoup[0]==='stew' && r.pan.chicksoup[2] > r.pan.stew[2] && r.pan.beefstew[1] < r.pan.stew[1], 'in the pan, each in its own broth: ' + JSON.stringify(r.pan));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
