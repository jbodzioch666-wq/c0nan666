// RS-229/230/231: inside a building the way out is a real door - its frame in the front wall and the door shut in it:
// a round hobbit door in a halfling shire, a plank door anywhere else; rooms with no way to the street have none; the door is oak, golden oak or cherry, the same wood inside and out
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(async ()=>{
    goToCharCreate(); G.chosenRace = RACES.findIndex(r=>r[0]==='Halfling'); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const all = townList().concat(G.ow.spawnPos ? [G.ow.spawnPos] : []), other = all.find(q=>(townFlavorAt(q.x, q.y)||{}).race!=='halfling');
    const mapOf = g=>{ let m = null; if (g) g.traverse(o=>{ if (!m && o.isMesh && o.material && o.material.map && /doorwood/.test(Object.keys(V3.tex).find(k=>V3.tex[k]===o.material.map)||'')) m = o.material.map; }); return m; };
    const woods = [];
    const look = async (t, key)=>{ G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
      for (let i=0;i<40 && !(V3.world && !G.interior && V3.doors && V3.doors[key]);i++){ renderGame(); await new Promise(r=>setTimeout(r, 200)); }
      const outside = mapOf(V3.doors && V3.doors[key]);
      enterInterior(key); setUi('playing');
      for (let i=0;i<40 && !(V3.world && G.interior && V3.world.children.length > 5);i++){ renderGame(); await new Promise(r=>setTimeout(r, 200)); }
      const kinds = []; let inside = null; V3.world.traverse(o=>{ if (o.userData && o.userData.exitDoor){ kinds.push(o.userData.exitDoor); inside = mapOf(o); } });
      if (kinds.length) woods.push({ key, wood:doorWoodOf(key)[0], match:!!outside && outside===inside }); return kinds; };
    return { woods, shire:await look(G.ow.spawnPos, 'shop'), other:await look(other, 'shop'), otherRace:(townFlavorAt(other.x, other.y)||{}).race, cellar:ROOM_STREET_DOOR('cellar') ? null : await look(other, 'cellar') };
  });
  A(R.shire.length===1 && R.shire[0]==='round', 'a halfling shop has a round door out: '+JSON.stringify(R));
  A(R.other.length===1 && R.other[0]==='plank', 'a '+R.otherRace+' shop has a plank door out: '+JSON.stringify(R));
  A(R.woods.length===2 && R.woods.every(w=>w.match && /oak|cherry/.test(w.wood)), 'each door is the same wood inside and out: '+JSON.stringify(R.woods));
  A(R.cellar===null || R.cellar.length===0, 'a cellar has no street door: '+JSON.stringify(R));
};
