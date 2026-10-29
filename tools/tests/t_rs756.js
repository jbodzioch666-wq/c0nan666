// RS-756: the Lost City. Generator 26 grows a jungle round every temple on the land (owJungleAround) and gives the jungle more and bigger
// patches; a temple on the land is the Lost City (owLostCity, siteKind 'city'): its name on the land, the map and examine, its own stone
// (FP_THEME_SPECS.city) and folk (MON_ECOSYS.city). The jungle's own plants (wgVegVariant bv 2: jtree, palm, fern, bigleaf) grow there,
// and the 3D land builds them without error
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45; const m = G.ow.map, out = { gen:G.ow.genVer, cities:[], sea:0, jungle:0 };
    for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ if (wgBioAt(x, y)===2) out.jungle++; if (m[x][y]!==OW_TEMPLE) continue; if (owSeaSite(x, y)){ out.sea++; continue; }
      let j = 0, n = 0; for (let dx=-3;dx<=3;dx++) for (let dy=-3;dy<=3;dy++){ if (dx*dx + dy*dy > 9) continue; const q = owNbG(x, y, dx, dy); if (!q || !OW_LAND_KEY[m[q[0]][q[1]]]) continue; n++; if (wgBioAt(q[0], q[1])===2) j++; }
      out.cities.push({ x, y, j, n, kind:owSiteKindAt(x, y), title:SITE_TITLE[owSiteKindAt(x, y)] }); }
    /* the jungle's plants */
    const put = [], h = k=>{ const v = Math.sin(k*12.9898 + 4.1)*43758.5453; return v - Math.floor(v); }; wgVegVariant(put, 10, 10, OW_FOREST, 2, h); out.plants = put.map(p=>p[0]);
    const c = out.cities[0]; if (!c) return out;
    out.map = (()=>{ try{ return EXAMINE_CITY; }catch(e){ return null; } })();
    /* walk up to it in 3D: its label and the jungle round it build */
    G.gameMode = 0; setUi('playing'); const q = owNbG(c.x, c.y, 0, 2) || owNbG(c.x, c.y, 2, 0); G.owPos = { x:q[0], y:q[1] }; owReveal(q[0], q[1], 8); O3.win = null; O3.dist = 9; await fr(120);
    out.labels = [...document.querySelectorAll('b')].map(b=>b.textContent).filter(t=>/Lost City|Sunken/i.test(t));
    /* and in */
    G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); out.kind = G.siteKind; out.theme = fpTheme().key; out.fams = (G.floorFams||[]).slice(); out.eco = MON_ECOSYS.city;
    out.where = bestWhere(MON_FAMILIES.spider.t[0][0]);
    out.mon = G.mon.filter(mo=>mo.alive).length; out.power = SITE_POWER.city ? SITE_POWER.city.hp : 0;
    for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    G.gameMode = 0; setUi('playing'); return out; });
  console.log(JSON.stringify(r));
  A(r.gen >= 26, 'a new world is generator 26: ' + r.gen);
  A(r.cities.length >= 1, 'there are temples on the land: ' + JSON.stringify(r.cities));
  A(r.cities.every(c=>c.kind==='city' && c.title==='Lost city'), 'each is a Lost City');
  A(r.cities.every(c=>c.j >= c.n*0.7), 'each stands in its jungle (seven in ten of the land round it, three tiles out): ' + JSON.stringify(r.cities));
  A(r.plants.includes('jtree') || r.plants.includes('palm'), 'the jungle grows giants or palms: ' + r.plants);
  A(r.plants.some(p=>p==='fern' || p==='bigleaf'), 'over a floor of ferns and big leaves: ' + r.plants);
  A(r.map && /Lost City/.test(r.map), 'examine names it');
  A(r.labels.some(t=>/Lost City/.test(t)), 'its label on the land says Lost City: ' + JSON.stringify(r.labels));
  A(r.kind==='city' && r.theme==='city', 'inside it is the Lost City, in its own stone: ' + r.kind + ' ' + r.theme);
  A(r.fams.length && r.fams.every(f=>r.eco.includes(f)), 'its folk are the jungle and the dead: ' + JSON.stringify(r.fams));
  A(!/dungeons and dungeons/.test(r.where||''), 'the bestiary says where once each: ' + r.where);
  A(r.mon > 0 && r.power > 1, 'monsters wait there, and it is a hard site');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
