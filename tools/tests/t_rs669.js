// RS-669: dye bought in a building shows when you step out. The town's scene is parked while you're inside (RS-582) and comes back with
// its figure as it was; the key that says what the figure wears was V3's, and the room's figure had already matched it - so the town's
// figure kept the old colours until a restart. Dye a cape inside, step out: the town's figure is dressed again. And on the open land a
// town's plate says what it is as big as its name.
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4;
    const out = {};
    /* the plate on the open land, first */
    G.gameMode = 0; renderGame(); await fr(120);
    const pl = (O3.plates || []).find(p=>p.town && p.el && p.el.querySelector('span')); if (pl){ const b2 = pl.el.querySelector('b'), sp = pl.el.querySelector('span'); out.nameSize = parseFloat(getComputedStyle(b2).fontSize); out.subSize = parseFloat(getComputedStyle(sp).fontSize); }
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await fr(120); out.mode = G.gameMode;
    G.gear.cape = { nm:'Plain cape', slot:'cape', used:true, capeCol:'#6a2a2a', aff:[] }; renderGame(); await fr(40);
    const town0 = V3.player; out.town0Key = !!(town0 && town0.lookKey);
    const b = (VILLAGE_BUILDINGS || []).find(b=>b.key==='tailor') || (VILLAGE_BUILDINGS || [])[0]; out.bld = b && b.key;
    enterInterior(b.key); await fr(120); out.inside = !!G.interior; out.room = V3.player!==town0;
    G.gear.cape.dye = '#2a4aa0'; renderGame(); await fr(40); out.roomKey = V3.player.lookKey===rsLookKey();
    exitInterior(); await fr(120); out.outside = !G.interior;
    out.townKey = V3.player.lookKey===rsLookKey(); out.redressed = V3.player!==town0;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.inside && r.room, 'into a building, its own room and figure');
  A(r.roomKey, 'the dye shows inside');
  A(r.outside && r.townKey && r.redressed, 'and out in the town too: the parked figure is dressed again');
  A(r.nameSize > 0 && Math.abs(r.subSize - r.nameSize) < 0.6, 'a town\'s plate: what it is as big as its name');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
