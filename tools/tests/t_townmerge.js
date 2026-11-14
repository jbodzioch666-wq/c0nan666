// RS-380: a town's still props merge by make, not just by material: parts of the same kind of material bake together across
// their colours (which go into the vertices), the window panes (kept apart by a list nothing read) merge into their
// buildings, the puddles are one instanced mesh, and a palette material the day and night change by hand - the glass - is
// never swapped for a copy. Measured against the same town built the old way
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    weatherSync = ()=>{}; G.weather = 'rain'; const t = townList()[0]; G.owPos = { x:t.x, y:t.y };
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    const measure = async ()=>{ enterVillage(); setUi('playing'); await frames(8); const R = gfxViewRenderer(); let calls = 0, tris = 0, least = 1e9; for (let i=0;i<3;i++){ R.info.autoReset = false; R.info.reset(); renderGame(); calls = Math.max(calls, R.info.render.calls); least = Math.min(least, R.info.render.calls); tris = Math.max(tris, R.info.render.triangles); R.info.autoReset = true; await new Promise(r=>setTimeout(r, 30)); }   /* (the heaviest of three frames: the sun's shadow map is drawn every second or third one, RS-380) */
      let meshes = 0, baked = 0, glassMerged = 0, glassLoose = 0; V3.world.traverse(o=>{ if (o.isMesh && o.visible){ meshes++; if (o.userData.baked) baked++; if (o.material===V3.mats.glass){ if (o.userData.merged) glassMerged++; else glassLoose++; } } });
      const winGone = V3.windows.length ? V3.windows.filter(w=>!w.parent).length/V3.windows.length : 1, pud = V3.townPuddles ? V3.townPuddles.children.length : 0, pudInst = !!(V3.townPuddles && V3.townPuddles.userData.im);
      let bakedOk = true; V3.world.traverse(o=>{ if (o.isMesh && o.userData.baked){ const m = o.material, c = o.geometry.attributes.color; if (!(m.vertexColors && c && m.color.r===1 && m.color.g===1 && m.color.b===1)) bakedOk = false; } });
      return { calls, least, tris, meshes, baked, bakedOk, glassMerged, glassLoose, winGone:+winGone.toFixed(2), windows:V3.windows.length, pud, pudInst, from:V3.mergedFrom, to:V3.mergedTo }; };
    const now = await measure(); V3_MERGE_MAKE = false; V3.parked = null; V3.worldTown = false; const old = await measure();   /* (RS-582 keeps a town between visits: built afresh for the old way) */ V3_MERGE_MAKE = true;
    return { now, old }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.now.windows > 20 && r.now.winGone >= 0.9 && r.old.winGone < 0.5, 'the window panes merge into their buildings (they stayed apart before); a lantern on a door that swings stays its own');
  A(r.now.glassMerged >= 1 && r.now.glassLoose <= r.now.windows*0.1, 'the merged glass keeps the palette\'s own glass material, so the night glow still reaches it');
  A(r.now.baked >= 5 && r.now.bakedOk && r.old.baked===0, 'parts of different colours bake into one mesh with their colours in the vertices');
  A(r.now.pud===1 && r.now.pudInst, 'the puddles are one instanced mesh');
  A(r.now.meshes < r.old.meshes - 60, 'the same town is far fewer meshes: '+r.old.meshes+' before, '+r.now.meshes+' now ('+r.old.calls+' and '+r.now.calls+' draws on a shadow frame; the folk wander between the two builds, so the draws are only told)');
  A(r.now.least < r.now.calls*0.6, 'the sun\'s shadow map is drawn every second or third frame: the lightest frame draws far less than the heaviest ('+r.now.least+' against '+r.now.calls+')');
};
