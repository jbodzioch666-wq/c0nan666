// RS-369: the weather runs on the real-time clock. Rain (now and then a storm) comes once every three to seven days and
// lasts a few hours of the day; some mornings are foggy; otherwise the sky is clear. Walking about doesn't change it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const p = G.player, D = DAY_LENGTH; p.clock = p.clock||0; weatherSync();
    const out = { first:+weatherDaysToRain().toFixed(2), w0:G.weather };
    // a hundred days, a tenth of an hour at a time: when it rains, how long, how far apart
    const spells = []; let cur = null, fogDays = new Set(), steps0 = G.weather;
    for (let i=0;i<100*240;i++){ p.clock += D/240; weatherSync(); const wet = G.weather==='rain' || G.weather==='storm';
      if (wet && !cur) cur = { a:p.clock }; if (!wet && cur){ cur.b = p.clock; spells.push(cur); cur = null; }
      if (G.weather==='fog') fogDays.add(Math.floor(p.clock/D)); }
    out.spells = spells.length;
    out.gaps = spells.slice(1).map((s0, i)=>+((s0.a - spells[i].b)/D).toFixed(2));
    out.lens = spells.map(s0=>+((s0.b - s0.a)/D).toFixed(2));
    out.fog = fogDays.size;
    // steps don't turn it
    const w1 = G.weather; for (let i=0;i<200;i++){ p.turnCount = (p.turnCount||0) + 1; rerollWeatherIfDue(); } out.stepsSame = G.weather===w1;
    // a weather set by hand stays until the plan next turns
    G.weather = 'rain'; weatherSync(); out.kept = G.weather;
    /* (RS-373) an old save's rain from the step-driven weather clears as soon as it loads, if the clock says it's dry */
    { let c = p.clock; while (weatherPlan()==='rain' || weatherPlan()==='storm'){ p.clock += D/20; } G.weather = 'rain'; p.wxLast = weatherPlan(); weatherSync.pl = null; weatherSync(); out.stale = G.weather; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.first >= 2.9 && r.first <= 7.1, 'the first rain is three to seven days off');
  A(r.spells >= 12 && r.spells <= 30, 'a dozen to thirty spells of rain in a hundred days');
  A(r.gaps.every(g=>g >= 2.9 && g <= 7.1), 'three to seven days between them');
  A(r.lens.every(l=>l >= 0.07 && l <= 0.22), 'each lasts a few hours');
  A(r.fog >= 10 && r.fog <= 45, 'some foggy mornings');
  A(r.stepsSame && r.kept==='rain', 'steps leave the weather alone');
  A(r.stale==='clear' || r.stale==='fog', 'a stale rain from an old save clears on load: '+r.stale);
};
