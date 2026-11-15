// (probe, not in ALL) the player's figure in the world in a robe: where it is drawn and with what materials
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.chest = rsMakeArmour('cloth', 0, 'chest'); G.player.look.body = 1; for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r));
    const out = { keys:{} }; for (const [nm, sc] of [['O3', typeof O3!=='undefined' && O3.scene], ['V3', typeof V3!=='undefined' && V3.scene]]) if (sc) sc.traverse(o=>{ if (!o.isMesh || !o.material || Array.isArray(o.material)) return; const k = nm + ':' + (o.material.customProgramCacheKey ? o.material.customProgramCacheKey() : '') + (o.isSkinnedMesh ? ':skin' : '') + (o.geometry.attributes.aTri ? ':aTri' : ''); if (/rim|tri/.test(k)) out.keys[k] = (out.keys[k]||0) + 1; });
    out.inst = Object.keys(window).filter(k=>/^(O3|M3D)$/.test(k)); out.live = M3D.live ? M3D.live.size : -1; const ls = [...(M3D.live||[])].map(e=>({ sk:!!(e.rig && e.rig.skirt), tri:e.rig && e.rig.skirt ? (e.rig.skirt.material.customProgramCacheKey ? e.rig.skirt.material.customProgramCacheKey() : '') : '', merged:!!e.merged, keys:Object.keys(e).slice(0, 30).join(',') })); out.ls = ls.slice(0, 4); return out; });
  console.log(JSON.stringify(r, null, 1).slice(0, 3000));
};
