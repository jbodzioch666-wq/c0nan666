// RS-196: runecrafting altars stand only on their own ground, and spread out - at least RC_GAP tiles from any other altar and
// RC_GAP_SAME from one of their own kind - instead of three or four together by a tower or along a pass
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = [];
    for (let w=0; w<3; w++){
      goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
      const alt = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ const n = skNodeStatic(x, y); if (n && n.k==='runecrafting') alt.push({ x, y, type:n.type }); }
      let minAny = 1e9, minSame = 1e9, offGround = 0;
      for (let i=0;i<alt.length;i++){ const a = alt[i]; if (rcAltarType(a.x, a.y, skOwTile(a.x, a.y))!==a.type) offGround++;
        for (let j=i+1;j<alt.length;j++){ const b = alt[j], d = Math.max(Math.abs(a.x-b.x), Math.abs(a.y-b.y)); minAny = Math.min(minAny, d); if (a.type===b.type) minSame = Math.min(minSame, d); } }
      const kinds = {}; for (const a of alt) kinds[a.type] = (kinds[a.type]||0) + 1;
      out.push({ n:alt.length, minAny, minSame, offGround, kinds });
    }
    return { out, gap:RC_GAP, same:RC_GAP_SAME };
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const w of r.out){
    A(w.n >= 8, 'altars still turn up'); A(Object.keys(w.kinds).length >= 5, 'most kinds of altar turn up');
    A(w.minAny >= r.gap, 'no two altars within '+r.gap+' tiles'); A(w.minSame >= r.same, 'none of the same kind within '+r.same);
    A(w.offGround===0, 'every altar on its own ground');
  }
};
