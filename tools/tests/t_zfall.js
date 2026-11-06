// (art probe, not in ALL) the waterfalls on the fixed seed, camera on each fall, the player hidden: shots/zfall_<n>_<rot>.png.
// ZFALL='[[x, y, rot], ...]' picks river-head tiles and camera turns; by default the tallest few, from the turn that faces them
module.exports = async page=>{
  await page.evaluate(async nr=>{ window.__norock = nr[0]; window.__zdist = nr[1]; goToCharCreate(); ccBegin(); wgRegenerate(+(window.__zseed || 12345)); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{}; }, [!!process.env.ZNOROCK, +(process.env.ZDIST || 10)]);
  const want = process.env.ZFALL ? JSON.parse(process.env.ZFALL) : [[107, 48, -1], [102, 28, -1], [117, 27, -1], [126, 45, -1]];
  for (const [fx, fy, rot0] of want){
    const r = await page.evaluate(async ([fx, fy, rot0])=>{ G.owPos = { x:fx, y:fy }; G.player.clock = G.player.turnCount = Math.round(DAY_LENGTH*0.45); G.weather = 'clear'; O3.win = null; O3.ppos = null; O3.dist = +(window.__zdist || 10);
      for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
      const f = (GFX.falls||[]).find(f=>f.tx===fx && f.ty===fy); if (!f) return { none:true, have:(GFX.falls||[]).map(f=>[f.tx, f.ty]) };
      const p = f.path, mid = p[Math.min(p.length - 1, 3)], dx = p[0][0] - p[p.length-1][0], dz = p[0][1] - p[p.length-1][1];
      /* (the turn whose camera looks most up the stream: the fall faces it) */
      let rot = rot0; if (rot < 0){ let best = -9; for (let k=0;k<4;k++){ ISO.rot = k; VIEW.yaw = null; const yw = viewYaw(), cx = Math.sin(yw), cz = Math.cos(yw), d = cx*dx + cz*dz; if (d > best){ best = d; rot = k; } } }
      ISO.rot = rot; VIEW.yaw = null; G.owPos = { x:Math.round(mid[0] - 0.5), y:Math.round(mid[1] - 0.5) }; O3.ppos = null;
      for (let i=0;i<10;i++){ renderGame(); if (O3.pgrp) O3.pgrp.visible = false; if (window.__norock) for (const q of GFX.falls) q.rock.visible = false; await new Promise(r=>setTimeout(r, 40)); }
      return { at:[fx, fy], rot, steps:f.steps, drop:+f.drop.toFixed(2), pts:p.length }; }, [fx, fy, rot0]);
    console.log('fall', JSON.stringify(r));
    if (!r.none) await page.screenshot({ path: SHOTS + '/zfall_' + fx + '_' + fy + '_' + r.rot + '.png', timeout:120000 });
  }
};
