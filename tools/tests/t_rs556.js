// RS-556: fog and dust below ground. Mist hugs the floor of the caves and crypts (catacombs, mines, lairs, temples, necro towers;
// none in a plain dungeon), turning slowly; the dust motes burn in the torches' light (the lit torches go into the dust shader);
// and a soft haze of light hangs round each lit torch, moving with it. Measures the card's cost in the catacombs
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    const go = async (want, depth)=>{ G.gameMode = 0; let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===want){ dx = x; dy = y; break; }
      G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = []; if (depth > 1){ loadLevel(depth, false); G.mon = []; } for (let i=0;i<14;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    await go(OW_GRAVEYARD, 2); out.crypt = { theme:fpTheme().key, mist:(FPD.mist||[]).length, inWorld:(FPD.mist||[]).every(m=>m.parent===FPD.world), noPick:(FPD.mist||[]).every(m=>m.raycast!==THREE.Mesh.prototype.raycast) };
    /* the mist lies in the open rooms, on the floor */
    out.crypt.onFloor = (FPD.mist||[]).every(m=>{ const x = Math.floor(m.position.x), y = Math.floor(m.position.z); return G.map[x][y]===T_FLOOR && m.position.y < 0.2; });
    FP.flames.push({ x:G.player.x + 1.5, y:G.player.y + 0.5, dx:0, dy:0, seed:0.3, h:0.85, k:1 }); FPD.lightKey = ''; for (let i=0;i<3;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }   /* (a torch of our own by the player - a layout may spawn you out of reach of any) */
    const u = FPD.dust.material.uniforms; out.dust = { tor:!!u.uTor && u.uTor.value.length===4, lit:u.uTor.value.filter(v=>v.w > 0).length, shader:/uTor/.test(FPD.dust.material.vertexShader) };
    const on = FPD.torches.map((L, j)=>[L, FPD.torchHaze[j]]).filter(([L])=>L.intensity > 0.01); out.haze = { n:on.length, follow:on.every(([L, sp])=>sp.visible && sp.position.distanceTo(L.position) < 1e-6 && sp.material.opacity > 0.02), count:FPD.torchHaze.length };
    const r0 = FPD.mist[0].rotation.z; for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } out.turns = Math.abs(FPD.mist[0].rotation.z - r0) > 1e-5;
    SET.fps = true; let ms = null; for (let k=0;k<3 && ms===null;k++){ PROF.t = {}; PROF.gpuN = 0; for (let i=0;i<60;i++){ renderGame(); gfxGpuPoll(); await new Promise(r=>setTimeout(r, 16)); } gfxGpuPoll(); if (PROF.gpuN > 10) ms = (PROF.t.gpu||0)/PROF.gpuN; } SET.fps = false; out.ms = ms===null ? null : +ms.toFixed(2);
    await go(OW_DUNGEON, 1); out.dungeon = { theme:fpTheme().key, mist:(FPD.mist||[]).length };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.crypt.theme==='catacomb' && r.crypt.mist > 5 && r.crypt.inWorld && r.crypt.onFloor && r.crypt.noPick, 'mist on the catacomb floor, in the open, never picked');
  A(r.turns, 'the mist turns');
  A(r.dust.tor && r.dust.shader && r.dust.lit > 0, 'the lit torches go into the dust');
  A(r.haze.count===4 && r.haze.n > 0 && r.haze.follow, 'a haze of light on every lit torch');
  A(r.dungeon.mist===0, 'no mist in a plain dungeon');
  A(r.ms===null || r.ms < 6, 'the catacombs stay under 6ms of card time: ' + r.ms);
};
