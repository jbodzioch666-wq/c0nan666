// RS-439: every craft takes twice as long - 1.3 seconds a piece, cooking, smelting and the rest alike (0.65 before); and at your
// campfire you sit a little further back, the marshmallow held out over the flames on a stick that rises from your hand, not dips into them
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = {};
    skAdd('trout', 10); G.cookAt = 'hearth'; setUi('cook'); const t0 = performance.now(); cqAdd('cook', 'trout', '', 3);
    out.first = Math.round(CQ.next - t0); const n0 = skHave('c_trout') + skHave('burnt');
    cqTick(t0 + 700); out.at700 = skHave('c_trout') + skHave('burnt') - n0; cqTick(t0 + 1320); out.at1320 = skHave('c_trout') + skHave('burnt') - n0;
    CQ.list = []; setUi('playing'); out.steps = ['cook','dish','smelt','forge','brew','craft'].map(k=>cqStepOf({ kind:k }));
    // the campfire
    G.gameMode = 0; let spot = null; const sp = G.ow.spawnPos;
    for (let rr=1; rr<12 && !spot; rr++) for (let dx=-rr; dx<=rr && !spot; dx++) for (let dy=-rr; dy<=rr; dy++){ const x = sp.x+dx, y = sp.y+dy, t = G.ow.map[x] && G.ow.map[x][y]; if ((t===OW_GRASS || t===OW_DESERT) && !skNodeAt(x, y) && !owPlaceAt(x, y)){ spot = { x, y }; break; } }
    G.owPos = { x:spot.x, y:spot.y }; G.mon = []; skP().fire = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 500 }; G.player.campPitch = null;
    for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const P = O3.player, st = O3.campStick, f = skP().fire, v = new THREE.Vector3(); P.e.holder.getWorldPosition(v);
    const mm = st && st.getObjectByName('marshmallow').getWorldPosition(new THREE.Vector3()), hand = P.e.rig.arms[0].hand.getWorldPosition(new THREE.Vector3()), fy = Math.max(O3.heightAt(f.x + 0.5, f.y + 0.5), -0.1);
    out.camp = { sat:!!P.campSit, dist:+Math.hypot(v.x - f.x - 0.5, v.z - f.y - 0.5).toFixed(2), tipUp:mm ? +(mm.y - hand.y).toFixed(3) : null, overFire:mm ? +(mm.y - fy).toFixed(2) : null, tipAt:mm ? +Math.hypot(mm.x - f.x - 0.5, mm.z - f.y - 0.5).toFixed(2) : null };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.steps.every(s=>s===1300), 'every craft takes 1.3 seconds a piece');
  A(Math.abs(r.first - 1300) < 5 && r.at700===0 && r.at1320===1, 'a piece is done at 1.3s, not at 0.7s');
  A(r.camp.sat && r.camp.dist > 0.45, 'sat a little further back from the fire');
  A(r.camp.tipUp > 0 && r.camp.overFire > 0.28 && r.camp.tipAt < 0.12, 'the marshmallow over the flames, the stick rising from the hand');
};
