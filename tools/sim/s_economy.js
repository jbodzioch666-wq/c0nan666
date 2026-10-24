// the gold sinks, from the tables: what a whole game's worth of purchases comes to, to set against the gold an hour the
// combat and gather sims report
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const rows = [], add = (nm, gold, note)=>rows.push({ nm, gold:Math.round(gold), note:note||'' });
    const tools = SK_TIER.filter(t=>t[0]!=='Dragon' && t[0]!=='Infernal').reduce((a,t)=>a+t[2], 0);
    add('tools, bronze to rune, all four', tools*4); add('dragon tools, all four', 25000*4); add('infernal tools, all four', 60000*4);
    add('rowboat and every boat upgrade', BOAT_PRICE + BOAT_TIERS.filter(Boolean).reduce((a,t)=>a+(t.gold||0), 0), 'plus logs and bars');
    add('harpoons, iron to dragon', HARPOONS.filter(Boolean).reduce((a,h)=>a+h.price, 0));
    add('a house', HOUSE_PRICE, 'furniture costs logs and bars');
    add('town projects, one town', TOWN_PROJECTS.reduce((a,t)=>a+(t.cost.gold||0), 0), 'plus logs and bars; per town');
    add('property, one town', ECO_PROPS.reduce((a,p)=>a+p.price, 0), `earns ${ECO_PROPS.reduce((a,p)=>a+p.inc, 0)}g a day (a day is ${DAY_LENGTH} turns, about 30 minutes)`);
    let reinf = 0; const pieces = [rsMakeWeapon(5, 3)].concat(['head','chest','legs','arms','feet','offhand'].map(sl=>rsMakeArmour('metal', 5, sl)));
    for (const it of pieces) for (let n=0;n<5;n++){ it.reinf = n; reinf += reinfCost(it); }
    add('reinforcing a full rune set to +5', reinf, 'some +4 and +5 attempts fail and still cost');
    add('a rune scimitar and full rune at the Peddler', pieces.reduce((a,it)=>a+(it.price||0), 0), 'if it were all in stock');
    const total = rows.reduce((a,r)=>a+r.gold, 0);
    return { rows, total };
  });
  for (const row of r.rows) console.log(`${row.gold.toString().padStart(8)}  ${row.nm}${row.note ? '  ('+row.note+')' : ''}`);
  console.log(`${r.total.toString().padStart(8)}  everything above`);
};
