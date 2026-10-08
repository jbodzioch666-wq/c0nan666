// RS-229/230: inside a building the way out is a real door - its frame in the front wall and the door shut in it:
// a round hobbit door in a halfling shire, a plank door anywhere else; rooms with no way to the street have none
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(async ()=>{
    goToCharCreate(); G.chosenRace = RACES.findIndex(r=>r[0]==='Halfling'); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const all = townList().concat(G.ow.spawnPos ? [G.ow.spawnPos] : []), other = all.find(q=>(townFlavorAt(q.x, q.y)||{}).race!=='halfling');
    const look = async (t, key)=>{ G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); enterInterior(key); setUi('playing');
      for (let i=0;i<40 && !(V3.world && G.interior && V3.world.children.length > 5);i++){ renderGame(); await new Promise(r=>setTimeout(r, 200)); }
      const kinds = []; V3.world.traverse(o=>{ if (o.userData && o.userData.exitDoor) kinds.push(o.userData.exitDoor); }); return kinds; };
    return { shire:await look(G.ow.spawnPos, 'shop'), other:await look(other, 'shop'), otherRace:(townFlavorAt(other.x, other.y)||{}).race, cellar:ROOM_STREET_DOOR('cellar') ? null : await look(other, 'cellar') };
  });
  A(R.shire.length===1 && R.shire[0]==='round', 'a halfling shop has a round door out: '+JSON.stringify(R));
  A(R.other.length===1 && R.other[0]==='plank', 'a '+R.otherRace+' shop has a plank door out: '+JSON.stringify(R));
  A(R.cellar===null || R.cellar.length===0, 'a cellar has no street door: '+JSON.stringify(R));
};
