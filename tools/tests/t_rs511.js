// RS-511: trousers are finer each tier, as the robe bottoms were - a trim cuff at each ankle from Splitbark, glowing runes stitched
// down the outer seam from Mystic, gold from Infinity, a second cuff and green runes on Ahrim's - and their trim takes a dye
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.chest = rsMakeArmour('hide', 2, 'chest'); const out = { tiers:[] };
    const count = ()=>{ const e = m3dInstance({}, rsPlayerLook()); let tris = 0, glow = 0;   /* (the figure is skinned into one mesh, so: the whole figure's triangles, tier against tier, and whether the runes' glowing material is among them) */
      e.holder.traverse(o=>{ if (!o.isMesh) return; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count)/3; const ms = Array.isArray(o.material) ? o.material : [o.material]; if (ms.some(m=>m && m.isMeshBasicMaterial && m.color && m.color.getHexString()===(rsPlayerLook().o.trouserRunes||'#000000').slice(1))) glow++; }); return { tris, glow }; };
    for (let t=0;t<5;t++){ G.gear.legs = rsMakeArmour('cloth', t, 'legs'); const o = rsPlayerLook().o; out.tiers.push(Object.assign(count(), { trim:o.trouserTrim || null, runeCol:o.trouserRunes || null })); }
    skAdd('dye_red', 3); G.gear.legs = rsMakeArmour('cloth', 2, 'legs'); out.trimmable = trimmable(G.gear.legs); trimDyeApply('g:legs', 'red'); const o2 = rsPlayerLook().o; out.dyed = [o2.trouserTrim, o2.trouserRunes];
    out.plainTrim = trimmable(rsMakeArmour('cloth', 0, 'legs'));
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const T = r.tiers;
  A(T[1].tris > T[0].tris + 200, 'Wizard trousers are plain; Splitbark adds a cuff at each ankle');
  A(T[2].tris > T[1].tris + 100 && T[2].runeCol==='#9ab8ff' && !T[1].runeCol, 'Mystic: glowing runes down the seams');
  A(T[3].trim==='#d8b050' && T[3].runeCol==='#ffd27a', 'Infinity: gold');
  A(T[4].tris > T[3].tris + 200 && T[4].runeCol==='#8aff9a', "Ahrim's: a second cuff and green runes");
  A(r.trimmable && r.dyed[0]==='#9a2a24' && r.dyed[1]==='#9a2a24' && !r.plainTrim, 'their trim takes a dye; plain ones have none');
};
