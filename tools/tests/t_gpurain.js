// RS-398: the dungeon dust and the rain (land and town) move in their vertex shaders - the CPU no longer moves and uploads every
// mote and drop each frame. The geometry is written once; the clock, the player's spot and the weather go in as uniforms
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; o3Pref = true; G.gameMode = 0; G.interior = null;
    G.player.clock = DAY_LENGTH*5 + DAY_LENGTH*0.5; G.weather = 'rain';
    const run = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); } };
    const still = async (att, n)=>{ const v0 = att.version; await run(n); return att.version===v0; };
    await run(5);
    const out = {};
    { const R = O3.rain, a = R.geometry.attributes.position, u = R.material.uniforms, t0 = u.uT.value; const noUpload = await still(a, 4);
      out.land = { vis:R.visible, lines:R.isLineSegments, shader:R.material.isShaderMaterial, noUpload, ticks:u.uT.value > t0, follows:Math.abs(u.uP.value.x - O3.pgrp.position.x) < 1e-6, n:a.count/2, len:+Math.hypot(a.getX(1)-a.getX(0), a.getY(1)-a.getY(0), a.getZ(1)-a.getZ(0)).toFixed(2) }; }
    enterVillage(); setUi('playing'); G.weather = 'storm'; await run(5);
    { const R = V3.rain, a = R.geometry.attributes.position, u = R.material.uniforms, t0 = u.uT.value; const noUpload = await still(a, 4);
      out.town = { vis:R.visible, shader:R.material.isShaderMaterial, noUpload, ticks:u.uT.value > t0, storm:u.uFall.value===15 && R.geometry.drawRange.count===1400, n:a.count/2 };
      G.weather = 'rain'; await run(2); out.town.rainLive = R.geometry.drawRange.count; }
    G.gameMode = 0; G.interior = null; G.villageNpcs = null; G.weather = 'clear';   /* (back out onto the land the way the other tests do) */
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); await run(5);
    { const D = FPD.dust, a = D.geometry.attributes.position, u = D.material.uniforms, t0 = u.uT.value; const noUpload = await still(a, 4);
      out.dust = { vis:D.visible, shader:D.material.isShaderMaterial, noUpload, ticks:u.uT.value > t0, centred:Math.abs(u.uC.value.x - FP.cam.x) < 1e-6, n:a.count, size:u.uSize.value, op:u.uOp.value }; }
    return out;
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.land.vis && r.land.lines && r.land.shader && r.land.noUpload && r.land.ticks && r.land.follows && r.land.n===900 && r.land.len > 0.3, 'the land rain falls on the card and follows you');
  A(r.town.vis && r.town.shader && r.town.noUpload && r.town.ticks && r.town.storm && r.town.n===700 && r.town.rainLive===840, 'the town rain falls on the card, heavier in a storm');
  A(r.dust.vis && r.dust.shader && r.dust.noUpload && r.dust.ticks && r.dust.centred && r.dust.n===180 && r.dust.size > 0 && r.dust.op > 0, 'the dust drifts on the card round you');
};
