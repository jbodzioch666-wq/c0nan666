// RS-369: town puddles dry up. When the
// rain stops the puddles shrink and fade away (RS-374: in about fifteen seconds) instead of staying, or vanishing all at once
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    weatherSync = ()=>{}; G.weather = 'rain'; const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await frames(6);
    const pg = V3.townPuddles, sz = ()=>pg.userData.im ? +pg.userData.sc.toFixed(2) : null;   /* (RS-380: one instanced mesh, scaled as they fill and dry) */
    const out = { n:pg && pg.userData.im ? pg.userData.im.count : 0, one:pg ? pg.children.length : 0, rain:{ vis:pg.visible, k:V3.wetK, sz:sz() } };
    G.weather = 'clear'; townPuddleSync(TOWN_DRY_S/4); out.drying = { vis:pg.visible, k:+V3.wetK.toFixed(2), sz:sz(), op:+pg.userData.pm.opacity.toFixed(2) };
    townPuddleSync(TOWN_DRY_S); out.dry = { vis:pg.visible, k:V3.wetK };
    /* (RS-375) dry means none drawn - counted by what is really on screen (every parent shown), after a few frames of the town's culling */
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    { let v = 0; for (const d of pg.children){ let on = true; for (let q=d;q;q=q.parent) if (!q.visible) on = false; if (on) v++; } out.drawnDry = v; }
    G.weather = 'rain'; townPuddleSync(1); out.refill = +V3.wetK.toFixed(2);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.n > 0 && r.one===1 && r.rain.vis && r.rain.k===1, 'puddles in the rain, all one instanced mesh (RS-380)');
  A(r.drying.vis && r.drying.k > 0.5 && r.drying.k < 0.9 && r.drying.sz < r.rain.sz, 'drying: still there, smaller');
  A(!r.dry.vis && r.dry.k===0, 'dried up after the rain');
  A(r.drawnDry===0, 'and none drawn in dry weather (RS-375: the culling used to show them)');
  A(r.refill > 0.2 && r.refill < 0.3, 'they fill again when the rain comes back');
};
