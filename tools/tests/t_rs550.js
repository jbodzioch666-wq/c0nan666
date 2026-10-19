// RS-550: painted ground. The land's shader paints each point from the tile a little way off, so the borders between grass,
// wood, sand and snow wander instead of running along the grid; broad drier and damper patches wash over the grass; sand on the
// beaches and dunes (a fourth blend channel); roads are worn tracks with ragged edges and ruts. All of it off on the low setting
// and the phone tier (gfxPaintOn), where the ground is drawn as before. Also measures the card's cost of the painted ground
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{};
    G.owPos = { x:24, y:54 }; G.player.clock = G.player.turnCount = DAY_LENGTH/2; O3.win = null; O3.ppos = null;
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const g = O3.land.geometry; out.blend = g.getAttribute('blend').itemSize; out.tcol = !!g.getAttribute('tcol');
    const m = O3.land.material; out.key = m.customProgramCacheKey(); out.paint = gfxPaintOn();
    const sh = { uniforms:{}, vertexShader:'void main(){\n#include <begin_vertex>\n#include <project_vertex>\n}', fragmentShader:'void main(){\n#include <map_fragment>\n}' }; m.onBeforeCompile(sh);
    out.shader = { tile:/uTile/.test(sh.fragmentShader) && !!sh.uniforms.uTile, sand:!!sh.uniforms.uDet3, wash:/tint/.test(sh.fragmentShader) };
    /* sand where the beach is, under the blend */
    { const p = g.attributes.position, b = g.attributes.blend; let beachSand = 0, inlandSand = 0, n1 = 0, n2 = 0;
      for (let i=0;i<p.count;i++){ const y = p.getY(i), x = Math.floor(p.getX(i) - 0.5), z = Math.floor(p.getZ(i) - 0.5), t = o3Tile(x, z); if (t!==OW_GRASS) continue; if (y < O3_WATER_Y + 0.12 && y > O3_WATER_Y){ beachSand += b.getW(i); n1++; } else if (y > 0.1){ inlandSand += b.getW(i); n2++; } }
      out.sand = { beach:+(beachSand/Math.max(1, n1)).toFixed(3), inland:+(inlandSand/Math.max(1, n2)).toFixed(3) }; }
    /* the roads: a worn track with its crown line, under its own shader */
    let road = null; O3.scene.traverse(o=>{ if (o.isMesh && [].concat(o.material).some(mm=>mm && mm.customProgramCacheKey && /^gfxroad/.test(mm.customProgramCacheKey()))) road = o; });   /* (merged with the rest of the still land - see o3MergeWorld - but its material is its own) */
    out.road = road ? { rd:!!road.geometry.getAttribute('rd'), verts:road.geometry.attributes.position.count } : null;
    /* the cost: the card's ms a frame, painted against plain */
    const cost = async ()=>{ SET.fps = true; for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); } for (let k=0;k<4;k++){ PROF.t = {}; PROF.gpuN = 0; for (let i=0;i<80;i++){ renderGame(); gfxGpuPoll(); await new Promise(r=>setTimeout(r, 16)); } gfxGpuPoll(); if (PROF.gpuN > 10) return (PROF.t.gpu||0)/PROF.gpuN; } return null; };
    out.msPaint = await cost();
    window.__noPaint = true; O3.win = null; for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } out.plainKey = O3.land.material.customProgramCacheKey(); out.plainBlend = O3.land.geometry.getAttribute('blend').itemSize;
    out.msPlain = await cost(); window.__noPaint = false; SET.fps = false;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.paint && r.key==='gfxlandP' && r.blend===4 && r.tcol, 'the painted ground, with four blends and the tile colours');
  A(r.shader.tile && r.shader.sand && r.shader.wash, 'the shader takes the tiles, the sand and the wash');
  A(r.sand.beach > 0.5 && r.sand.inland < 0.05, 'sand on the beach, none inland');
  A(r.road && r.road.rd && r.road.verts > 100, 'the roads are worn tracks');
  A(r.plainKey==='gfxland' && r.plainBlend===4, 'with painting off, the plain ground');
  A(r.msPaint===null || r.msPlain===null || r.msPaint < r.msPlain + 2.5, 'the painted ground costs under 2.5ms more: ' + r.msPaint + ' vs ' + r.msPlain);
};
