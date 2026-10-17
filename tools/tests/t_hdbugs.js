// RS-262: the spider and scorpion are built in high detail like the crab - smooth many-sided parts in a glossy shell
// (the spider keeps its furry abdomen and legs), and each scorpion pincer has two curved, bevelled, toothed finger blades
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    for (const nm of ['giant scorpion', 'giant desert scorpion', 'giant spider', 'frost spider', 'giant crab']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })); e.anim(e.rig, 0.9, 1, 0.5, 0, 0, e);
      let gloss = 0, fur = 0, horn = 0, lowSph = 0, sph = 0, ext = 0;
      e.holder.traverse(x=>{ if (!x.isMesh) return; const k = x.material && x.material.userData && x.material.userData.kind;
        if (k==='gloss') gloss++; else if (k==='fur') fur++; else if (k==='horn') horn++;
        const g = x.geometry; if (g.type==='SphereGeometry'){ sph++; if (k==='gloss' && g.parameters.widthSegments < 20) lowSph++; } if (g.type==='ExtrudeGeometry') ext++; });
      out[nm] = { gloss, fur, horn, sph, lowSph, ext, claws:(e.rig.claws||[]).map(C=>{ let n = 0; C.g.traverse(x=>{ if (x.isMesh && x.geometry.type==='ExtrudeGeometry') n++; }); return n; }) };
    }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const nm of ['giant scorpion', 'giant desert scorpion', 'giant spider', 'frost spider', 'giant crab']){ const s = r[nm];
    A(s.gloss > (s.fur ? 12 : 60) && s.horn===0, nm+': a glossy shell, not the old ridged horn');
    A(s.sph > 5 && s.lowSph===0, nm+': every round shell part is smooth (20+ sides)'); }
  for (const nm of ['giant scorpion', 'giant desert scorpion']) A(r[nm].claws.length===2 && r[nm].claws.every(n=>n===2), nm+': each pincer has two sculpted finger blades');
  for (const nm of ['giant spider', 'frost spider']) A(r[nm].fur > 10, nm+': still hairy');
  console.log('hd bugs ok', JSON.stringify(r));
};
