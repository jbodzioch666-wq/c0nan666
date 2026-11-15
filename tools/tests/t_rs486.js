// RS-486: the land's shadows hold still - the sun turns across the sky in small steps, not smoothly, so the shadow map isn't redrawn a
// hair differently every time (they fluttered as it was), while over the day it still swings round
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = true; G.interior = null; G.gameMode = 0; G.weather = 'clear';
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } };
    await frames(10); if (!o3Active() || !O3.sun) return { skip:true };
    const dir = ()=>O3.sun.position.clone().sub(O3.sun.target.position).normalize().toArray().map(v=>+v.toFixed(6)).join(',');
    const D = DAY_LENGTH, at = c=>{ G.player.clock = c; o3ApplyTime(); return dir(); }; const a = at(D*0.3), seen = new Set(); for (let i=0;i<30;i++) seen.add(at(D*0.3 + i*D/1800/10));   /* (three real seconds: a day is 1,800 of them) */ const c = at(D*0.45); const distinct = seen.size;
    return { a, c, distinct }; });
  console.log(JSON.stringify(r));
  if (r.skip) return;
  if (r.distinct > 2) throw new Error('over three seconds the sun moves at most one step, so the shadows hold still '+JSON.stringify(r));
  if (r.a===r.c) throw new Error('over the day it still moves '+JSON.stringify(r));
};
