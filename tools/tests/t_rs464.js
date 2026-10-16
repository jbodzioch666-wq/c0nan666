// RS-464: bolts, darts, throwing knives and special ammunition can be made - their recipes belonged to no bench, so no bench showed them;
// now they're at the fletching bench with the arrows, and every recipe row has a bench
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const rows = [...new Set(crRecipes().map(r=>r.row))], home = row=>Object.keys(BENCHES).filter(k=>{ const f = BENCHES[k].rows; return f && (typeof f==='function' ? f(row) : f.includes(row)); });
    const out = { homeless:rows.filter(row=>!home(row).length) };
    G.bench = 'fletching'; setUi('bench'); const html = buildBench(); out.shows = ['bronze bolts', 'bronze darts', 'bronze knives', 'broad bolts', 'fire arrows'].map(s=>html.toLowerCase().includes(s));
    // make some bronze bolts and darts
    const bolt = crRecipes().find(r=>r.row==='Bolts' && r.lvl<=1) || crRecipes().filter(r=>r.row==='Bolts').sort((a, b)=>a.lvl - b.lvl)[0], dart = crRecipes().filter(r=>r.row==='Thrown').sort((a, b)=>a.lvl - b.lvl)[0];
    for (const rc of [bolt, dart]){ for (const m in rc.need) skAdd(m, rc.need[m]); if (skLvl('fletching') < rc.lvl) skGainXP('fletching', 1e7); }
    const bt = bolt.arrowT, have = ()=>(ammoType()===bt ? (G.player.arrows||0) : 0) + ((G.player.ammoStacks||{})[bt]||0), a0 = have(), inv0 = G.inv.length; crCraft(bolt.id); crCraft(dart.id);
    out.bolts = have() - a0; out.boltMade = out.bolts >= 12; out.dartMade = G.inv.length > inv0; out.bench = G.ui;
    setUi('playing'); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.homeless.length, 'every recipe row has a bench');
  A(r.shows.every(Boolean), 'the fletching bench shows bolts, darts, knives and special ammo');
  A(r.boltMade && r.dartMade, 'bolts and darts can be made there');
};
