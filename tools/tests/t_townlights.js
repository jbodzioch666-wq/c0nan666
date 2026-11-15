// RS-175: every lamp in town can light up - the gate torches, the watchtower torches and the street lamps - not just the
// first few built: the town's handful of real lights go to the lamps nearest you
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    if (G.gameMode!==3){ const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); }
    G.player.clock = DAY_LENGTH*0.02;   // the middle of the night
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    v3ApplyTime(true);
    const lamps = V3.lamps.filter(l=>l.p), out = { lamps:lamps.length, lights:V3.plights.length, lit:0, missed:[] };
    const P = V3.player.g.position;
    for (const l of lamps){ P.set(l.p[0] + 0.6, 0, l.p[2] + 0.6); V3.lightAt = null; v3AssignLights();
      const pl = V3.plights.find(o=>o.userData===l); if (pl && pl.intensity > 0.5 && Math.hypot(pl.position.x - l.p[0], pl.position.z - l.p[2]) < 0.01) out.lit++; else if (out.missed.length < 5) out.missed.push(l.p.map(v=>+v.toFixed(1))); }
    out.gate = lamps.filter(l=>l.flame).length;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.lamps > r.lights, 'the town has more lamps than real lights (so they have to be shared out)');
  A(r.lit===r.lamps, 'standing by any lamp at night - gate torch, watchtower torch or street lamp - it throws light');
};
