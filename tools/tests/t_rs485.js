// RS-485: towns on the land look like their people and their size - each race builds its own way (white elven spires, dwarven halls,
// orc tents, gnome mushroom-houses, dragonborn terraces, tiefling spires, wood-elf tree halls...), a city has more houses behind a stone
// wall than a village, stands bigger, and its name plate says what it is
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, mats = o3Mats(); for (const k of ['windows','smoke','glows','flames']) O3[k] = O3[k] || []; if (!O3.heightAt) O3.heightAt = ()=>0;
    const sig = g=>{ let n = 0, tri = 0; const m = new Set(); g.traverse(o=>{ if (o.isMesh){ n++; m.add(o.material.uuid); tri += o.geometry.index ? o.geometry.index.count/3 : o.geometry.attributes.position.count/3; } }); const b = new T.Box3().setFromObject(g), s = b.getSize(new T.Vector3()); return { n, mats:m.size, tri:Math.round(tri), h:+s.y.toFixed(2), w:+Math.max(s.x, s.z).toFixed(2) }; };
    const out = { race:{}, size:{} }, rnd = s=>((s*9301 + 49297) % 233280)/233280;
    for (const race of ['human','halfelf','elf','woodelf','dwarf','orc','gnome','dragon','tiefling']){ const g = new T.Group(); o3TownBuild(g, race, 1, mats, rnd, ()=>{}, 10.5, 10.5); out.race[race] = sig(g); }
    for (const tier of [0, 1, 2]){ const g = new T.Group(); o3TownBuild(g, 'human', tier, mats, rnd, ()=>{}, 10.5, 10.5); out.size[tier] = sig(g); }
    const t = townList()[0]; out.sub = o3TownSub(t.x, t.y).replace(/<[^>]+>/g, '');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const sigs = Object.values(r.race).map(s=>[s.n, s.mats, s.tri, s.h].join('/'));
  A(new Set(sigs).size===sigs.length, 'every race builds its own town');
  A(r.size[0].n < r.size[1].n && r.size[1].n < r.size[2].n && r.size[2].tri > r.size[0].tri*1.5, 'a city is bigger than a town, a town than a village');
  A(/(human|elven|dwarven|orcish|halfling|gnomish|dragonborn|tiefling|half-elven|wood-elven) (&middot;|.) (village|town|city)/.test(r.sub), 'the name plate says its people and its size: '+r.sub);
};
