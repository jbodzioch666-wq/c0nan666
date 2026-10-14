// RS-392: no lanterns hang from the ceiling any more - every room has torches in iron sconces on its walls, which flicker
// and carry the room at night; by day the room is lit mostly through its windows, and darker at night than by day
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.weather = 'clear'; G.player.clock = DAY_LENGTH*5 + DAY_LENGTH*0.5; enterVillage(); setUi('playing'); });
  const out = {};
  for (const key of ['tavern', 'smith', 'shop', 'temple']){
    out[key] = await page.evaluate(async (key)=>{ if (G.interior) exitInterior && exitInterior(); G.player.clock = DAY_LENGTH*5 + DAY_LENGTH*0.5; enterInterior(key); G.player.clock = DAY_LENGTH*5 + DAY_LENGTH*0.1; setUi('playing'); G.player.x = 9; G.player.y = 9; if (!G.interior || G.interior.key!==key) return { sc:-1 };
      for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      const sc = V3.lamps.filter(l=>l.sconce), hang = V3.lamps.filter(l=>l.p && l.p[1] > 1.9 && !l.sconce && l.col===0xffc070);
      return { sc:sc.length, hang:hang.length, onWall:sc.every(l=>Math.abs(l.p[2]-ROOM.y0) < 0.6 || Math.abs(l.p[0]-ROOM.x0) < 0.6), lowY:sc.every(l=>l.p[1] > 1.4 && l.p[1] < 2.1) }; }, key);
    if (key==='tavern' || key==='smith') await page.screenshot({ path:`${S}/s392-${key}-night.png`, timeout:150000 });
  }
  const light = {};
  for (const [nm, ph] of [['night', 0.1], ['day', 0.5]]){
    light[nm] = await page.evaluate(async (ph)=>{ G.player.clock = DAY_LENGTH*5 + DAY_LENGTH*ph; for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      const sc = V3.plights.filter(p=>p.userData && p.userData.sconce); const a = sc.map(p=>p.intensity); await new Promise(r=>setTimeout(r, 120)); renderGame();
      return { hemi:+V3.hemi.intensity.toFixed(3), sun:+V3.sun.intensity.toFixed(3), torch:+(sc.reduce((s, p)=>s + (p.userData.lit||0), 0)/Math.max(1, sc.length)).toFixed(3), n:sc.length, flick:sc.some((p, i)=>Math.abs(p.intensity - a[i]) > 1e-4) }; }, ph);
    await page.screenshot({ path:`${S}/s392-smith-${nm}.png`, timeout:150000 });
  }
  console.log(JSON.stringify({ out, light }));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify({ out, light })); };
  A(Object.values(out).filter(o=>o.sc!==-1).length >= 3, 'three rooms checked');
  for (const k in out){ if (out[k].sc===-1) continue; A(out[k].sc >= 2, k+' has wall torches'); A(out[k].hang===0, k+' has no hanging lantern'); A(out[k].onWall && out[k].lowY, k+'\'s torches are on its walls'); }
  A(light.night.n >= 2 && light.day.n >= 2, 'the torches have lights');
  A(light.night.flick, 'the torchlight flickers');
  A(light.day.hemi > light.night.hemi + 0.3 && light.day.sun > light.night.sun + 0.6, 'the day lights the room through its windows');
  A(light.night.torch > light.day.torch + 0.8, 'the torches carry the room at night');
};
