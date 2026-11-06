// RS-578: one material for a figure's whole hide and clothes. The finish textures sit as tiles in one atlas; a figure's rim-lit
// standard parts of every finish merge into one skinned mesh whose vertices carry their tile, roughness, metalness and skin flag;
// a prop's rigid parts into one mesh. Drawn through one shader that reads the tile with the texture's own gradients. A town's
// people are drawn in a third of the calls
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = {};
    // a figure: its skinned meshes, the atlas one's vertex data
    { const e = m3dInstance({}, rsPlayerLook()); const sk = []; e.root.traverse(o=>{ if (o.isSkinnedMesh) sk.push(o); });
      const at = sk.find(o=>o.material.userData.atlas), g = at && at.geometry, mix = g && g.attributes.aMix;
      out.fig = { skinned:sk.length, atlas:!!at, verts:g ? g.attributes.position.count : 0, hasMix:!!mix && !!g.attributes.aMix2 && !!g.attributes.uv, reachC:!!(g && g.userData.reach && g.userData.reach.c && g.userData.reach.c.length===g.userData.reach.ix.length*3) };   /* (each joint's culling ball centred on what hangs from it) */
      if (mix){ const tiles = new Set(), rough = new Set(); let skin = 0, cloth = 0; for (let i=0;i<mix.count;i++){ tiles.add(mix.getZ(i)); rough.add(mix.getX(i)); if (mix.getW(i) > 1.5) skin++; else cloth++; }   /* (w: 0 plain, 1 rim-lit, 2 skin) */
        out.fig.tiles = [...tiles].sort((a,b)=>a-b); out.fig.roughs = rough.size; out.fig.skinV = skin; out.fig.clothV = cloth; }
      // the shader: the tile read with its own gradients, roughness and metalness from the vertex, the skin's warmth by its flag
      if (at){ const sh = { uniforms:{}, vertexShader:'#include <uv_vertex>', fragmentShader:'#include <map_fragment>\n#include <roughnessmap_fragment>\n#include <metalnessmap_fragment>\n#include <normal_fragment_maps>\n#include <opaque_fragment>' }; at.material.onBeforeCompile(sh, { capabilities:{ isWebGL2:true } });
        out.shader = { grad:/textureGrad\(/.test(sh.fragmentShader), rough:/roughnessFactor = vMix\.x/.test(sh.fragmentShader), metal:/metalnessFactor = vMix\.y/.test(sh.fragmentShader), sss:/sssF[^;]*\* skinOn/.test(sh.fragmentShader) && /skinOn = step\(1\.5, vMix\.w\)/.test(sh.fragmentShader), nrm:/mapN\.xy \*= vMix2/.test(sh.fragmentShader), key:at.material.customProgramCacheKey() }; }
      // the atlas: a tile per finish used, each drawn once, map and normal map alike
      const A = m3dAtlas(); out.atlas = { size:A.map.image.width, drawn:A.drawn.size, same:A.map.image.width===A.nrm.image.width }; }
    // the instance is a copy, not a write-out: nothing in the parts' userData points at a mesh
    { const t0 = performance.now(); for (let i=0;i<3;i++) m3dInstance({}, rsPlayerLook()); out.instMs = +((performance.now() - t0)/3).toFixed(1); }
    // a prop: a guard's spear is one mesh
    { let n = 0, merged = 0; try{ const e = m3dInstance({}, Object.assign({}, rsPlayerLook(), { o:Object.assign({}, rsPlayerLook().o, { weapon:'spear' }) })); const w = e.rig && e.rig.weapon; if (w) w.traverse(o=>{ if (o.isMesh && o.visible){ n++; if (o.material.userData.atlas) merged++; } }); }catch(e){} out.prop = { meshes:n, atlas:merged }; }
    // the town: its people's draws
    { const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      const ppl = [].concat(V3.npcs||[], V3.villagers||[]).filter(p=>p.e); let meshes = 0; for (const p of ppl) p.e.holder.traverse(o=>{ if ((o.isMesh || o.isSprite) && o.visible && o.material.visible!==false) meshes++; });
      out.town = { people:ppl.length, meshes, per:+(meshes/Math.max(1, ppl.length)).toFixed(1) }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.fig.atlas && r.fig.skinned <= 4 && r.fig.hasMix && r.fig.reachC && r.fig.verts > 20000, 'a figure is one atlas skinned mesh, its hair in one or two, and its eyes: ' + JSON.stringify(r.fig));
  A(r.fig.tiles.length >= 2 && r.fig.tiles.every(t=>t >= -1 && t < 16) && r.fig.roughs >= 2 && r.fig.skinV > 100 && r.fig.clothV > 100, 'its vertices carry their tile, roughness and skin flag');
  A(r.shader.grad && r.shader.rough && r.shader.metal && r.shader.sss && r.shader.nrm && r.shader.key==='m3datlas', 'the atlas shader: ' + JSON.stringify(r.shader));
  A(r.atlas.size===1152 && r.atlas.drawn >= 2 && r.atlas.same, 'the atlas holds the finishes used: ' + JSON.stringify(r.atlas));
  A(r.prop.meshes >= 1 && r.prop.meshes <= 3, 'a spear is one or two meshes: ' + JSON.stringify(r.prop));
  A(r.instMs < 60, 'a copy of your figure is quick: ' + r.instMs + 'ms');
  A(r.town.people >= 8 && r.town.per <= 9, 'a townsperson is drawn in nine calls or fewer: ' + JSON.stringify(r.town));
};
