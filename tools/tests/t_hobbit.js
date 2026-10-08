// RS-224: a halfling shire is built of hobbit holes - every building a turfed hill with a round door that still swings open
// as you go in, round windows and a chimney through the grass - and on the land outside it shows as a ring of little hills
// round a party tree inside a hedge, instead of the usual roofs and palisade.
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const all = townList().concat(G.ow.spawnPos ? [G.ow.spawnPos] : []);
    const hob = all.find(q=>(townFlavorAt(q.x, q.y)||{}).race==='halfling'), other = all.find(q=>(townFlavorAt(q.x, q.y)||{}).race!=='halfling');
    const turfIn = g=>{ let n = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.map && o.material.map===O3.tex.turf) n++; }); return n; };
    const out = { hob:!!hob }; for (const k of ['windows','smoke','flames']) O3[k] = O3[k] || []; O3.tex = O3.tex || {}; if (!O3.heightAt) O3.heightAt = ()=>0;   /* (the land's 3D isn't built yet: just the town models) */
    out.owHob = turfIn(o3Site(OW_TOWN, hob.x+0.5, hob.y+0.5)); out.owOther = turfIn(o3Site(OW_TOWN, other.x+0.5, other.y+0.5));
    G.owPos = { x:hob.x, y:hob.y }; enterVillage(); setUi('playing');
    for (let i=0;i<40 && !(V3.world && V3.mats && V3.mats.turf);i++){ renderGame(); await new Promise(r=>setTimeout(r, 250)); }
    out.v3 = v3Active() && !!V3.world;
    if (!out.v3) return out;
    const withDoor = VILLAGE_BUILDINGS.filter(b=>b.door && b.key);
    out.doors = withDoor.map(b=>{ const pv = V3.doors && V3.doors[b.key]; let round = false; if (pv) pv.traverse(o=>{ if (o.geometry && o.geometry.type==='CylinderGeometry') round = true; }); return { k:b.key, ok:!!pv, round, glow:!!(pv && pv.userData.glow) }; });
    let hills = 0; V3.world.traverse(o=>{ if (o.isMesh && o.material===V3.mats.turf && o.geometry.type==='SphereGeometry') hills++; });
    out.hills = hills; out.lots = VILLAGE_BUILDINGS.length + VILLAGE_HOUSES.length;
    return out; });
  A(R.hob, 'the world has a halfling shire');
  A(R.owHob > 4 && R.owOther===0, 'on the land the shire is little hills, other towns are not: '+R.owHob+' / '+R.owOther);
  A(R.v3, 'the town is drawn in 3D');
  A(R.hills===R.lots, 'every building and house is a hill: '+R.hills+' of '+R.lots);
  A(R.doors.length && R.doors.every(d=>d.ok && d.round && d.glow), 'every shop door is a round door on its hinge: '+JSON.stringify(R.doors));
};
