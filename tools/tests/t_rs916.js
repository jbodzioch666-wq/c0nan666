// RS-916: no gaps in the house's walls beside a doorway - a wall that turns a corner right by a doorway runs on to its edge, so the lintel
// and casing meet it (every house size, both floors). Shot: shots/rs916-doors.png
const path = require('path');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = { gaps:[], checked:0 }; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    p.gold = 5e6; skGainXP('construction', 6e7); const T = THREE;
    try{
    for (const size of [1, 2, 3, 4]){ if (G.interior) exitInterior(); houseBuy(size); enterHouse(); for (const fl of size >= 3 ? [0, 1] : [0]){ if (houseFl()!==fl) houseStair(); await fr(8); V3.world.updateMatrixWorld(true);
        const K = G.houseDoorKind || {}; for (const k in K){ const I = K[k]; if (I.kind!=='full') continue; const [x, y] = k.split(',').map(Number), meshes = []; for (const g of I.link||[]) g.traverse(o=>{ if (o.isMesh) meshes.push(o); });
          for (const sd of [-1, 1]){ const dir = I.across ? new T.Vector3(sd, 0, 0) : new T.Vector3(0, 0, sd), ray = new T.Raycaster(new T.Vector3(x + 0.5, 1.0, y + 0.5), dir, 0, 3), h = ray.intersectObjects(meshes, false)[0]; out.checked++;
            if (!h || h.distance > 0.53) out.gaps.push([size, fl, k, sd, h ? +h.distance.toFixed(2) : null]); } } } }
    const P = housePlan(), d = Object.keys(G.houseDoorKind).find(k=>G.houseDoorKind[k].kind==='full'); if (d){ const [x, y] = d.split(',').map(Number); p.x = x; p.y = y + 1; if (G.map[p.x][p.y]!==T_FLOOR) houseUnstick(); } await fr(30);
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    return out; });
  await page.screenshot({ path:path.join(__dirname, 'shots', 'rs916-doors.png') });
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(r.checked > 20 && !r.gaps.length, 'the walls meet every doorway, both sides', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
