// RS-104: day and night run on a real-time clock - 20 minutes of day, 10 of night - and steps don't move the sun
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const p = G.player; A(Math.abs(dayPhase() - 0.3) < 0.02 && timeOfDayLabel()==='day', 'a new hero wakes in the morning');
    // simulate the clock with fake timestamps (the real frame loop also ticks it; stop that first)
    const fl = clockTick; let real = 0; window.clockTick = ()=>{};
    const sim = ms=>{ let t = 1e12 + real; fl.at = t; for (let i=0;i<ms/250;i++){ t += 250; fl(t); } real += ms; };
    // from dawn (phase 0.22) to dusk (0.78) takes 20 minutes
    p.clock = DAY_LENGTH*2 + DAY_LENGTH*0.22; sim(20*60000); out.afterDay = +dayPhase().toFixed(3); A(Math.abs(dayPhase() - 0.78) < 0.005, 'the day lasts 20 minutes: '+dayPhase());
    sim(1000); A(isNightTime(), 'then night falls');
    sim(10*60000 - 1000); out.afterNight = +dayPhase().toFixed(3); A(Math.abs(dayPhase() - 0.22) < 0.005, 'the night lasts 10 minutes: '+dayPhase());
    // walking doesn't move the sun
    const c0 = p.clock; p.turnCount += 50; A(p.clock===c0 && dayPhase()===(c0 % DAY_LENGTH)/DAY_LENGTH, 'steps leave the clock alone');
    // the clock stops on the pause screen and the Esc page
    setUi('pause'); sim(60000); A(p.clock===c0, 'paused'); setUi('help', true); sim(60000); A(p.clock===c0, 'paused on the Esc page'); closeHelp(); setUi('playing');
    sim(60000); A(p.clock > c0, 'runs again');
    // waiting for dawn in town skips ahead to morning
    p.clock = DAY_LENGTH*5 + DAY_LENGTH*0.9; townWaitDawn(); out.dawn = +dayPhase().toFixed(3); A(Math.abs(dayPhase() - 0.27) < 0.01, 'wait for dawn');
    // an old save without a clock picks it up from its turn count
    delete p.clock; p.turnCount = DAY_LENGTH*3 + 100; A(Math.abs(dayPhase() - 0.5) < 1e-9, 'old saves read their turn count');
    saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing'); A(G.player.clock===DAY_LENGTH*3 + 100, 'and keep it on load');
    window.clockTick = fl;
    return out;
  });
  console.log(JSON.stringify(r));
  // and in the real frame loop, the clock moves by itself
  const a = await page.evaluate(()=>G.player.clock); await page.waitForTimeout(3000); const b = await page.evaluate(()=>G.player.clock);
  if (!(b > a)) throw new Error('the clock runs in real time: '+a+' -> '+b);
  console.log('3s of real time:', (b - a).toFixed(3), 'clock units');
};
