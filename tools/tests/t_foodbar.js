// RS-189: cooked dishes (meat pies, hearty stews...) show in the resource bag with the other food, every food in the side
// panel has its own picture and name, the U slot shows the food it will eat next, and a food on the quick bar has its picture
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    o3Pref = false; v3Pref = false;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const p = G.player, out = {};
    for (const [id, n] of [['c_meatpie', 3], ['c_stew', 2], ['c_trout', 4], ['c_meat', 1]]) skAdd(id, n);
    out.bag = resCats().find(c=>c[0]==='Fish & food')[1].filter(id=>['c_meatpie','c_stew'].includes(id));
    out.src = resSources('c_meatpie').join(' ');
    SP.open = true; SP.tab = 'inv'; hudLayout(); renderGame(); await new Promise(res=>setTimeout(res, 100));
    const cells = [...document.querySelectorAll('#sidePanel [data-sp-food]')];
    out.cells = cells.map(c=>({ id:c.dataset.spFood, nm:(c.querySelector('.fdnm')||{}).textContent, src:(c.querySelector('img')||{}).src||'' }));
    out.distinct = new Set(out.cells.map(c=>c.src)).size;
    // U eats the right one, and its slot says which
    p.hp = Math.max(1, effMaxHp() - 2); hudLayout(); renderGame();
    const u = document.querySelector('[data-k="U"]'); out.uTitle = u && u.getAttribute('title');
    out.next = foodNext().id;
    // a food on the quick bar
    qbAdd({ t:'food', id:'c_stew' }); out.qb = qbIcon({ t:'food', id:'c_stew' }).includes(foodIconUrl('c_stew'));
    return out; });
  console.log(JSON.stringify(r).replace(/data:image[^"]{40,}/g, 'data:...').slice(0, 1200));
  const el = await page.$('#sidePanel'); if (el) await el.screenshot({ path: SHOTS+'/shot_foodbar.png' });
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r).replace(/data:image[^"]{40,}/g, 'data:...').slice(0, 1500)); };
  A(r.bag.length===2 && /hearth/.test(r.src), 'meat pies and stews are in the bag, with where they come from');
  A(r.cells.length>=4 && r.distinct===r.cells.length && r.cells.every(c=>c.nm && /^data:image\/png/.test(c.src)), 'each food has its own picture and a name');
  A(r.cells.some(c=>c.nm==='Meat Pie') && r.cells.some(c=>c.nm==='Stew'), 'the pie and the stew are named');
  A(/next: /.test(r.uTitle||''), 'the U slot names what it will eat');
  A(r.qb, 'a food on the quick bar has its own picture');
};
