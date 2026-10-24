// RS-192: every crafting screen shows what a recipe takes in colour (green enough, red short, with what you hold) and how
// many you can make: the benches, smelting, forging, brewing, cooking and dishes, arrow enchanting and house building
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    o3Pref = false; v3Pref = false;
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const out = {}, G_ = COL.green, R_ = COL.red;
    for (const k in skP().skills) skP().skills[k] = 2e7;
    skAdd('copper', 7); skAdd('bronze', 5); skAdd('silverleaf', 5); skAdd('ghostcap', 1); skAdd('meat', 3); skAdd('piedish', 2); skAdd('logs', 0);
    const has = (h, s)=>h.includes(s);
    // smelting: copper 7 -> 3 bars (2 each); forging: 5 bronze bars
    const sm = buildSmithing('smelt'); out.smelt = { green:has(sm, G_), can:/can make 3/.test(sm) };
    const fg = buildSmithing('forge'); out.forge = { x5:/&times;5</.test(fg), x1:/&times;1</.test(fg) };
    // brewing: silverleaf 5 -> 2; ghostcap 1 -> 0 (red)
    const br = buildBrewing(); out.brew = { two:/can make 2/.test(br), zero:/can make 0/.test(br), red:has(br, R_) };
    // cooking: raw meat 3; a meat pie needs a pie dish and 2 meat -> 1
    G.cookAt = 'hearth'; const ck = buildCook(); out.cook = { raw:/can cook 3/.test(ck), pie:/can make 1/.test(ck) };
    // a bench: the fletching bench, with logs short
    G.bench = 'fletching'; setUi('bench'); await new Promise(res=>setTimeout(res, 50)); const bh = document.body.innerHTML;
    out.bench = { colours:has(bh, G_) || has(bh, R_), counts:/&times;\d+<\/b><\/button>|×\d+<\/b><\/button>/.test(bh), red:bh.includes(R_.replace('#','')) || /color:\s*#d1495b|rgb\(209, 73, 91\)/.test(bh) };
    // house building: logs in colour
    out.house = houseCostText({ logs:6 }).includes(R_) || houseCostText({ logs:6 }).includes(G_);
    /* RS-193: things you buy with materials - a boat upgrade, a town project, the smith's upgrades, tools - in colour too */
    G.player.hasBoat = true; G.player.boatTier = 1; G.player.gold = 100; skAdd('ironb', 2);
    const boat = sailUpgradeHtml(); out.boat = boat.includes(R_) && /iron bar/.test(boat) && /\(2\)/.test(boat) && /1,500g/.test(boat);
    out.town = TOWN_PROJECTS.length ? townCostText(TOWN_PROJECTS[0].cost).includes('<span style="color:') : true;
    out.tools = skToolsHtml().includes(G_) || skToolsHtml().includes(R_);
    out.helpers = { max:needMax({ copper:2 }), maxGold:needMax({}, 0) };
    return out; });
  console.log(JSON.stringify(r));
  await page.screenshot({ path: SHOTS+'/shot_crafthave.png' });
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.smelt.green && r.smelt.can, 'smelting shows the ore in green and that 3 bars can be made');
  A(r.forge.x5, 'forging shows how many of each piece the bars make');
  A(r.brew.two && r.brew.zero && r.brew.red, 'brewing: 2 from five herbs, 0 (in red) from one');
  A(r.cook.raw && r.cook.pie, 'cooking: how many raw foods and dishes can be cooked');
  A(r.bench.colours && r.bench.counts, 'a crafting bench colours what it takes and counts what you can make');
  A(r.house, 'house building costs in colour');
  A(r.boat, 'a boat upgrade colours the logs, iron bars and gold it takes, with what you hold');
  A(r.town && r.tools, 'town projects and tools are in colour');
  A(r.helpers.max===3, 'needMax counts what you can make');
};
