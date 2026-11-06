// RS-436: a story quest's place in the wilds is drawn - the Goblin King's hall, a war camp, the hermit's hut, a grave, ruins, a dig, a stone
// circle, a thieves' cave, the Herald's obelisk, or a cairn - not just a ! over the grass; and the scene goes when the quest moves on
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0;
    const out = {}, frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    const sq = sqP(); for (const id of ['gob1','gob2']) sq[id] = { step:99, state:'done', flags:{}, log:[], loc:{} };
    for (const k of ['attack','strength','defence','hitpoints']) skP().skills[k] = SK_XP[30]; rsSync && rsSync();
    sqStart('gob3'); sqAdvance('gob3');   /* (past "talk to the Captain" to "find the Goblin King's hall") */
    const t = questTarget({ kind:'story', sq:'gob3' }); out.key = sqSceneKey('gob3'); out.t = t && [t.x, t.y];
    if (t){ G.owPos = { x:t.x, y:t.y + 2 }; O3.qKey = null; await frames(8);
      const near = []; O3.qGrp.traverse(o=>{ if (o.isMesh && Math.hypot(o.position.x - t.x - 0.5, o.position.z - t.y - 0.5) < 0.8) near.push(o.geometry.type); });
      out.meshes = near.length; out.kinds = [...new Set(near)].join(','); }
    // every scene builds
    const g = new THREE.Group(); out.built = {}; for (const k of ['hall','warcamp','hut','grave','ruin','dig','circle','hideout','obelisk','cairn']){ const n0 = g.children.length; const h = o3QuestScene(k, g, 0, 0, 0); out.built[k] = [g.children.length - n0, +h.toFixed(2)]; }
    // the step's done: the hall goes
    sqAdvance('gob3'); O3.qKey = null; await frames(4); let left = 0; if (t) O3.qGrp.traverse(o=>{ if (o.isMesh && o.geometry.type==='ExtrudeGeometry' && Math.hypot(o.position.x - t.x - 0.5, o.position.z - t.y - 0.5) < 0.8) left++; }); out.gone = left===0;
    out.key2 = sqSceneKey('gob3');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.key==='hall' && r.t, 'the Goblin King\'s hall is the place to find');
  A(r.meshes >= 8 && /ExtrudeGeometry/.test(r.kinds), 'the hall stands at the quest\'s spot, roof and all');
  A(Object.values(r.built).every(([n, h])=>n >= 4 && h > 0.5), 'every scene builds');
};
