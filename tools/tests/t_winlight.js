// RS-390: the light through a room's windows follows the hour - rose-gold at dawn, warm white by day, deep orange at dusk,
// none at night - on the floor and in the glass, changing as the clock runs, without leaving the room
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.weather = 'clear'; G.player.clock = DAY_LENGTH*5 + DAY_LENGTH*0.5; enterVillage(); setUi('playing'); enterInterior('tavern'); setUi('playing'); G.player.x = 9; G.player.y = 9; for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } });
  const out = {};
  // RS-404: the glass keeps its colour after you come in - it used to change at the next tick of the clock, a few seconds later
  out.steady = await page.evaluate(async ()=>{ G.player.clock = DAY_LENGTH*5 + DAY_LENGTH*0.735; exitInterior(); setUi('playing'); renderGame(); enterInterior('tavern'); setUi('playing'); G.player.x = 9; G.player.y = 9; for (let i=0;i<3;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const a = V3.winGlass.color.getHexString() + '/' + V3.winGlass.emissive.getHexString(); V3.winQ = -1; renderGame(); const b = V3.winGlass.color.getHexString() + '/' + V3.winGlass.emissive.getHexString();
    return { a, b }; });
  for (const [nm, ph] of [['night', 0.1], ['dawn', 0.25], ['day', 0.5], ['dusk', 0.74]]){
    out[nm] = await page.evaluate(async (ph)=>{ G.player.clock = DAY_LENGTH*5 + DAY_LENGTH*ph; for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } const m = V3.intWin[0]; return { label:timeOfDayLabel(), vis:m.visible, col:'#'+m.material.color.getHexString(), op:+m.material.opacity.toFixed(3), glass:'#'+V3.winGlass.emissive.getHexString(), n:V3.intWin.length }; }, ph);
    if (nm!=='night') await page.screenshot({ path:`${S}/s390-${nm}.png`, timeout:150000 });
  }
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  const rgb = h=>[1,3,5].map(i=>parseInt(h.slice(i, i+2), 16)), warm = h=>{ const [r,g,b] = rgb(h); return r - b; };
  const near = (a, b)=>{ const h = a.replace('/',''), k = b.replace('/',''); for (let i=0;i<12;i+=2) if (Math.abs(parseInt(h.slice(i,i+2),16) - parseInt(k.slice(i,i+2),16)) > 3) return false; return true; };
  A(near(out.steady.a, out.steady.b), 'the glass keeps its colour from tick to tick: '+JSON.stringify(out.steady));
  A(out.night.label==='night' && !out.night.vis, 'no light through the windows at night');
  A(out.dawn.label==='dawn' && out.dusk.label==='dusk' && out.dawn.vis && out.day.vis && out.dusk.vis, 'light at dawn, through the day and at dusk');
  A(warm(out.dawn.col) > warm(out.day.col) + 20 && warm(out.dusk.col) > warm(out.day.col) + 40, 'dawn and dusk light is warmer than the day\'s: '+[out.dawn.col, out.day.col, out.dusk.col]);
  A(out.dusk.glass!==out.day.glass && out.night.glass!==out.day.glass, 'the glass changes with it');
};
