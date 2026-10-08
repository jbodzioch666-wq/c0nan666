// RS-226: a wandering group led by a skeleton walks the land as the sculpted skeleton the dungeons use (it used to have no model
// and fell back to a flat marker) - a skeleton with two kobolds, as reported
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const wait = ms=>new Promise(r=>setTimeout(r, ms)), p = G.owPos;
    let spot = null; for (let r=2;r<6 && !spot;r++) for (let a=-r;a<=r && !spot;a++) for (const [x,y] of [[p.x+a,p.y+r],[p.x+r,p.y+a]]) if (encounterEligible(G.ow.map[x][y]) && !owSpotTaken(x, y)) spot = { x, y };
    const sk = MONSTER_LEVELS.find(m=>m.nm==='skeleton') || { nm:'skeleton', lvl:2, undead:true }, kb = MONSTER_LEVELS.find(m=>m.nm==='kobold') || { nm:'kobold', lvl:1 };
    const e = { x:spot.x, y:spot.y, id:9901, party:[Object.assign({}, sk), Object.assign({}, kb), Object.assign({}, kb)] }; G.ow.encounters = [e];
    const out = { leader:encLeader(e).nm, has:o3HasModel(encLeader(e)) };
    for (let i=0;i<60;i++){ renderGame(); await wait(200); const f = O3.beasts && [...O3.beasts.values()][0]; if (f && f.e && f.e.sk){ out.sk = true; out.h = +f.top.toFixed(2); out.inScene = !!f.e.holder.parent; break; } }
    return out; });
  A(R.leader==='skeleton' && R.has, 'a skeleton leads, and counts as having a model: '+JSON.stringify(R));
  A(R.sk && R.inScene, 'it walks the land as the sculpted skeleton: '+JSON.stringify(R));
  A(R.h > 0.6 && R.h < 1.3, 'about as tall as the other roamers: '+R.h);
};
