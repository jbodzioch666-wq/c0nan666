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
    // RS-159: town rain is thin streaks, not big round sprites
    { const keepW = G.weather; G.weather = 'rain'; for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
      let sprites = 0; V3.scene.traverse(o=>{ if (o.isSprite && o.material===V3.partMatRain) sprites++; });
      const a = V3.rain && V3.rain.geometry.attributes.position, lens = []; if (a) for (let i=0;i<20;i++) lens.push(Math.hypot(a.getX(i*2+1)-a.getX(i*2), a.getY(i*2+1)-a.getY(i*2), a.getZ(i*2+1)-a.getZ(i*2)));
      out.rain = { streaks:!!(V3.rain && V3.rain.visible && V3.rain.isLineSegments), sprites, maxLen:+Math.max(0, ...lens).toFixed(2) };
      G.weather = keepW; renderGame(); out.rain.offAfter = !(V3.rain && V3.rain.visible); }
    // RS-158: no round blob at anyone's feet in town; on the overworld the player casts a real shadow in a tight shadow box
    const blobs = sc=>{ let n = 0; sc.traverse(o=>{ if (o.isMesh && o.material===m3dShadowMat()) n++; }); return n; };
    out.townBlobs = blobs(V3.scene);
    G.gameMode = 0; G.interior = null; setUi('playing'); for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    let casters = 0; if (O3.player) O3.player.g.traverse(o=>{ if (o.isMesh && o.castShadow) casters++; });
    out.ow = { o3:o3Active(), blobs:O3.pgrp ? blobs(O3.pgrp) : -1, casters, half:O3.sun ? O3.sun.shadow.camera.right : 0, dist:O3.dist };
    // RS-170: no haze when zoomed out on a clear day (only foggy weather brings it), and a softer midday sun
    if (o3Active()){ const kw = G.weather; G.weather = 'clear'; p.clock = D*0.5; O3.dist = 28; o3ApplyTime(); out.ow.clearFog = O3.scene.fog ? O3.scene.fog.near : 1e9; out.ow.sun = O3.sun.intensity;
      G.weather = 'fog'; o3ApplyTime(); out.ow.fogFog = O3.scene.fog ? O3.scene.fog.near : 1e9; G.weather = kw; o3ApplyTime(); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(Math.sign(r.morning.x) !== Math.sign(r.evening.x) && Math.abs(r.morning.x) > 0.2, 'the sun crosses the sky, so the shadows swing round');
  A(r.noon.y > r.morning.y && r.noon.i > r.morning.i, 'the sun stands highest and brightest at noon');
  A(r.midnight.blue && r.midnight.i > 0.1 && r.midnight.i < 0.4 && r.midnight.y > 0.1, 'the moon gives a dim blue light from above at night');
  A(r.jumps.i < 0.12 && r.jumps.h < 0.05 && r.jumps.b < 0.15, 'dawn, day, dusk and night blend without jumps');
  A(r.noon.lamp===null || (r.noon.lamp===0 && r.midnight.lamp > 2), 'the street lamps are off by day and lit at night');
  A(r.rain.streaks && r.rain.sprites===0 && r.rain.maxLen > 0.1 && r.rain.maxLen < 0.5 && (r.rain.offAfter || /rain|storm/.test(String(r.keepW))), 'town rain falls as thin streaks: '+JSON.stringify(r.rain));
  A(r.townBlobs===0, 'no round blob shadows at the feet in town');
  A(!r.ow.o3 || (r.ow.blobs===0 && r.ow.casters > 3 && r.ow.half <= Math.max(9, r.ow.dist*1.2)), 'the overworld player casts a real shadow and has no blob');
  A(!r.ow.o3 || (r.ow.clearFog > 1000 && r.ow.fogFog < 60 && r.ow.sun < 1.5), 'no zoomed-out haze on a clear overworld day, a softer sun, and fog weather still hazes');
  A(r.desertNoon.i < r.noon.i*0.8 && r.desertNoon.b < r.noon.b*1.3, 'the desert sun is softer');
};
