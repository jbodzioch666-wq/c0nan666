// RS-565: rivers run downstream. Each river tile in the water's foam texture carries the way it runs (blue, alpha; 128 = still), worked
// out by walking back from the sea and lakes up every river (or, with no water in reach, down from the mountains); the water shader
// draws its ripples long along that way, moving with it. Followed from any river tile, the flow never doubles back, and most of it
// comes down to the sea, a lake or the edge of the land built round you
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{};
    G.owPos = { x:100, y:24 }; G.player.clock = G.player.turnCount = DAY_LENGTH/2; O3.win = null; O3.ppos = null; for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const m = O3.water.material, tex = m.userData.ownTex[0], D = tex.image.data, N = tex.image.width, sh = { uniforms:{}, vertexShader:'void main(){\n#include <begin_vertex>\n#include <project_vertex>\n}', fragmentShader:'void main(){\n#include <output_fragment>\n}' }; m.onBeforeCompile(sh);
    const ox = O3.win.x0 - 5, oy = O3.win.y0 - 5, R8 = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]; let rivers = 0, still = 0, reach = 0, tried = 0, back = 0;
    for (let j=1;j<N-1;j++) for (let i=1;i<N-1;i++){ if (o3Tile(ox + i, oy + j)!==OW_RIVER) continue; rivers++; const k = (j*N + i)*4; if (D[k+2]===128 && D[k+3]===128){ still++; continue; }
      if (tried >= 60 || (i + j) % 3) continue; tried++; let x = i, y = j; const seen = new Set([x + ',' + y]);
      for (let s=0;s<400;s++){ const kk = (y*N + x)*4, fx = (D[kk+2] - 128)/120, fz = (D[kk+3] - 128)/120; let best = null, bd = 0.3;
        for (const [a, b] of R8){ const dd = (a*fx + b*fz)/Math.hypot(a, b), t2 = o3Tile(ox + x + a, oy + y + b); if (dd > bd && (t2===OW_RIVER || t2===OW_WATER)){ bd = dd; best = [a, b]; } }
        if (!best) break; x += best[0]; y += best[1]; if (x<0 || y<0 || x>=N || y>=N || o3Tile(ox + x, oy + y)===OW_WATER){ reach++; break; }
        if (seen.has(x + ',' + y)){ back++; break; } seen.add(x + ',' + y); } }
    return { rivers, still, tried, reach, back, shader:/along\*0\.35 - uT/.test(sh.fragmentShader) }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.rivers > 10 && r.still===0, 'every river tile knows which way it runs');
  A(r.tried > 5 && r.back===0, 'followed downstream, a river never doubles back on itself');
  A(r.reach >= r.tried*0.5, 'most rivers come down to the sea, a lake or the land beyond: ' + r.reach + '/' + r.tried);
  A(r.shader, 'the water draws its ripples along the flow');
};
