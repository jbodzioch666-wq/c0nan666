// RS-202: the town's dogs, cats and chickens move - they breathe, wag, peck and walk like the creatures in the wild, instead of
// standing frozen and only turning
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, wait = ms=>new Promise(r=>setTimeout(r, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let found = null;
    for (const t of townList()){ G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); for (let i=0;i<6;i++){ renderGame(); await wait(60); }
      if (v3Active() && (V3.villagers||[]).some(p=>p.v && p.v.animal && p.e)){ found = t; break; } }
    A(found, 'a town with animals in 3D');
    const pets = V3.villagers.filter(p=>p.v && p.v.animal && p.e);
    const snap = p=>{ const a = []; p.e.holder.traverse(o=>{ if (!o.isMesh) a.push(o.rotation.x.toFixed(4), o.rotation.y.toFixed(4), o.rotation.z.toFixed(4), o.position.y.toFixed(4)); }); return a.join(','); };
    const s0 = pets.map(snap); for (let i=0;i<10;i++){ renderGame(); await wait(80); } const s1 = pets.map(snap);
    const moved = pets.map((p, i)=>({ k:p.v.animal, moved:s0[i]!==s1[i] }));
    A(moved.every(m=>m.moved), 'every animal moves: '+JSON.stringify(moved));
    return { moved };
  });
  console.log(JSON.stringify(r));
};
