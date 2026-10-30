// (probe, not in ALL) RS-565's world: the river tiles the water's flow left still, and the ground round each
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{};
    G.owPos = { x:100, y:24 }; G.player.clock = G.player.turnCount = DAY_LENGTH/2; O3.win = null; O3.ppos = null; for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const m = O3.water.material, tex = m.userData.ownTex[0], D = tex.image.data, N = tex.image.width, ox = O3.win.x0 - 5, oy = O3.win.y0 - 5, out = [];
    const ch = t=>({ [OW_WATER]:'~', [OW_RIVER]:'r', [OW_MOUNTAIN]:'M', [OW_MOUNTAINPASS]:'p', [OW_GRASS]:'.', [OW_FOREST]:'f', [OW_SWAMP]:'s', [OW_DESERT]:'d', [OW_TUNDRA]:'t' }[t] || '#');
    for (let j=1;j<N-1;j++) for (let i=1;i<N-1;i++){ const x = ox + i, y = oy + j; if (o3Tile(x, y)!==OW_RIVER) continue; const k = (j*N + i)*4; if (!(D[k+2]===128 && D[k+3]===128)) continue;
      const rows = []; for (let dy=-3; dy<=3; dy++){ let s = ''; for (let dx=-3; dx<=3; dx++) s += (dx===0 && dy===0) ? '@' : ch(o3Tile(x + dx, y + dy)); rows.push(s); } out.push({ x, y, rows }); }
    return out; });
  for (const o of r){ console.log(o.x + ',' + o.y); for (const s of o.rows) console.log('  ' + s); }
};
