// RS-552: water. Sun glints - small points winking on the water's own ripples; the banks' green cast along a shore; lily pads
// (some with a flower) on calm water - lake coves and the water beside swamps, never the open sea - set above the wave tops;
// reeds at the edge of lakes and rivers (they only grew in the swamps)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{};
    G.owPos = { x:100, y:24 }; G.player.clock = G.player.turnCount = DAY_LENGTH/2; G.weather = 'clear'; O3.win = null; O3.ppos = null;
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const sh = { uniforms:{}, vertexShader:'void main(){\n#include <begin_vertex>\n#include <project_vertex>\n}', fragmentShader:'void main(){\n#include <opaque_fragment>\n}' }; O3.water.material.onBeforeCompile(sh);
    out.glint = /directionalLights\[0\]/.test(sh.fragmentShader) && /winking/.test(sh.fragmentShader); out.bank = /banks in the water/.test(sh.fragmentShader);
    let lily = null, reeds = 0, flowers = 0; O3.world.traverse(o=>{ if (o.isInstancedMesh && o.userData.lily) lily = o; });
    O3.scene.traverse(o=>{ if (!o.isInstancedMesh) return; const pr = o.geometry.parameters || {}; if (o.geometry.type==='ConeGeometry' && Math.abs(pr.height - 0.4) < 1e-6) reeds += o.count; if (o.geometry.type==='ConeGeometry' && Math.abs(pr.height - 0.05) < 1e-6) flowers += o.count; });
    out.reeds = reeds; out.flowers = flowers; out.lily = lily ? lily.count : 0;
    /* every pad on calm water, above the waves; reeds at the water's edge on land tiles */
    if (lily){ const m = new THREE.Matrix4(), v = new THREE.Vector3(); let bad = 0, low = 0; for (let i=0;i<lily.count;i++){ lily.getMatrixAt(i, m); v.setFromMatrixPosition(m); const x = Math.floor(v.x), z = Math.floor(v.z); if (o3Tile(x, z)!==OW_WATER) bad++; let land = 0, sw = 0; for (const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const u = o3Tile(x+a, z+b); if (u!==OW_WATER && u!==OW_RIVER) land++; if (u===OW_SWAMP) sw++; } if (land < 3 && !sw) bad++; if (v.y < O3_WATER_Y + 0.05) low++; } out.lilyBad = bad; out.lilyLow = low; }
    { let onLand = 0, byWater = 0, n = 0; O3.scene.traverse(o=>{ if (!(o.isInstancedMesh && o.geometry.type==='ConeGeometry' && Math.abs((o.geometry.parameters||{}).height - 0.4) < 1e-6)) return; const m = new THREE.Matrix4(), v = new THREE.Vector3();
        for (let i=0;i<o.count;i++){ o.getMatrixAt(i, m); v.setFromMatrixPosition(m); const x = Math.floor(v.x), z = Math.floor(v.z), t = o3Tile(x, z); n++; if (t===OW_GRASS || t===OW_FOREST){ onLand++; for (const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const u = o3Tile(x+a, z+b); if (u===OW_WATER || u===OW_RIVER){ byWater++; break; } } } } });
      out.reedLand = onLand; out.reedByWater = byWater; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.glint && r.bank, 'the water carries the sun\'s glints and the banks\' cast');
  A(r.lily > 20 && r.lilyBad === 0 && r.lilyLow === 0, 'lily pads on calm water, above the waves');
  A(r.flowers > 0, 'some with a flower');
  A(r.reedLand > 10 && r.reedByWater === r.reedLand, 'reeds on the banks of lakes and rivers, every one at the water\'s edge');
};
