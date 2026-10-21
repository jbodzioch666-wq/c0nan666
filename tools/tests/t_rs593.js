// RS-593: no god rays on the open land - no shafts of light through the woods, at sunrise or any time
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.mon = [];
    let wood = null; const sp = G.ow.spawnPos; for (let r=0; r<30 && !wood; r++) for (let dx=-r; dx<=r && !wood; dx++) for (let dy=-r; dy<=r; dy++){ const x = sp.x+dx, y = sp.y+dy; if (G.ow.map[x] && G.ow.map[x][y]===OW_FOREST){ wood = { x, y }; break; } }
    if (wood) G.owPos = wood; const out = { wood:!!wood, beams:0 };
    for (const h of [0.02, 0.06, 0.5, 0.95]){ G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*h; GFX.raysAt = -9; for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
      const tb = GFX.tex && GFX.tex.beam; O3.scene.traverse(o=>{ if (o.isMesh && o.visible && o.material && tb && o.material.map===tb && o.geometry.type==='PlaneGeometry' && o.geometry.parameters.height===3.4) out.beams++; }); }
    out.rays = (GFX.rays||[]).length; return out; });
  console.log(JSON.stringify(r));
  if (!(r.wood && r.rays===0 && r.beams===0)) throw new Error('assert: no shafts of light through the woods ' + JSON.stringify(r));
};
