// RS-157: the town's light follows the clock smoothly - the sun crosses the sky (so shadows swing east to west), the moon lights the night,
// nothing jumps between dawn, day, dusk and night, the lamps fade up as it darkens, and the desert sun is softer
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    if (G.gameMode!==3){ const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); }
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const p = G.player, D = DAY_LENGTH, keepTheme = G.villageTheme;
    const at = ph=>{ p.clock = D*ph; v3ApplyTime(true); const d = V3.sun.position.clone().sub(V3.sun.target.position).normalize(), lamp = V3.plights.find(pl=>pl.userData && pl.userData.p && !pl.userData.always && !pl.userData.forge);
      const bg = V3.scene.background; return { i:V3.sun.intensity, h:V3.hemi.intensity, x:d.x, y:d.y, b:bg.r + bg.g + bg.b, blue:V3.sun.color.b > V3.sun.color.r, lamp:lamp ? lamp.intensity : null }; };
    G.villageTheme = 'temperate'; const out = { morning:at(0.32), noon:at(0.5), evening:at(0.68), midnight:at(0.0) };
    let jumpI = 0, jumpH = 0, jumpB = 0, prev = at(0);
    for (let k=1; k<=400; k++){ const c = at(k/400); jumpI = Math.max(jumpI, Math.abs(c.i - prev.i)); jumpH = Math.max(jumpH, Math.abs(c.h - prev.h)); jumpB = Math.max(jumpB, Math.abs(c.b - prev.b)); prev = c; }
    out.jumps = { i:+jumpI.toFixed(3), h:+jumpH.toFixed(3), b:+jumpB.toFixed(3) };
    G.villageTheme = 'desert'; out.desertNoon = at(0.5); G.villageTheme = keepTheme; at(0.5);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(Math.sign(r.morning.x) !== Math.sign(r.evening.x) && Math.abs(r.morning.x) > 0.2, 'the sun crosses the sky, so the shadows swing round');
  A(r.noon.y > r.morning.y && r.noon.i > r.morning.i, 'the sun stands highest and brightest at noon');
  A(r.midnight.blue && r.midnight.i > 0.1 && r.midnight.i < 0.4 && r.midnight.y > 0.1, 'the moon gives a dim blue light from above at night');
  A(r.jumps.i < 0.12 && r.jumps.h < 0.05 && r.jumps.b < 0.15, 'dawn, day, dusk and night blend without jumps');
  A(r.noon.lamp===null || (r.noon.lamp===0 && r.midnight.lamp > 2), 'the street lamps are off by day and lit at night');
  A(r.desertNoon.i < r.noon.i*0.8 && r.desertNoon.b < r.noon.b*1.3, 'the desert sun is softer');
};
