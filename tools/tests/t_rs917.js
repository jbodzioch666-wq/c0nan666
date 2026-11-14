// RS-917: no quest's cairn and signpost by your plot (its spots kept two tiles clear of it, and none drawn there); the house's stair as
// joinery - a closed flight with risers, nosed treads, a runner on brass rods, stringers, turned balusters, a handrail and newels, the way up
// dark at its head; upstairs its framed well and a balustrade round it. Shots: shots/rs917-stair.jpg (both floors, close), rs917-room.png
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    { const roomy = ()=>{ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN && plotFind(x, y)) return { x, y }; return null; }, t = plotFind(G.owPos.x, G.owPos.y) ? null : roomy(); if (t){ G.owPos = t; enterVillage(); setUi('playing'); } }
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    p.gold = 5e6; skGainXP('construction', 6e7); houseBuy(1); out.plot = plotBuy(); { const PQ = plotGet(); if (PQ) PQ.q = 0; }   /* (RS-921: the gate pinned to the south, as this test's walks expect) */ houseBuy(3);
    try{
    const P = plotGet(); let near = 0, n = 0; for (let i=0;i<300;i++){ const t = questWildTile(P.x, P.y, 0, 9); if (!t) continue; n++; if (Math.abs(t.x - P.x) <= plotR() + 2 && Math.abs(t.y - P.y) <= plotR() + 2) near++; } out.quest = [n, near];
    enterHouse(); await fr(10); const S = housePlan().stair, shots = [], T = THREE;
    const snap = ()=>{ const R = V3.renderer, cam = V3.cam.clone(), c = new T.Vector3(S[0] + 0.5, 0.8, S[1] + 0.5); cam.position.set(c.x + 2.2, c.y + 2.4, c.z + 3.0); cam.lookAt(c); cam.updateMatrixWorld(); R.render(V3.scene, cam); return R.domElement.toDataURL('image/jpeg', 0.85); };
    p.x = S[0] + 1; p.y = S[1] + 2; if (G.map[p.x][p.y]!==T_FLOOR) houseUnstick(); await fr(25); shots.push(snap());
    houseStair(); await fr(25); out.up = houseFl(); p.x = S[0] + 1; p.y = S[1] + 2; if (G.map[p.x][p.y]!==T_FLOOR) houseUnstick(); await fr(25); shots.push(snap()); out.shots = shots;
    houseStair(); await fr(10); out.down = houseFl(); p.x = S[0]; p.y = S[1] + 2; await fr(30);
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    return out; });
  if (r.shots){ for (let i=0;i<r.shots.length;i++) fs.writeFileSync(path.join(__dirname, 'shots', 'rs917-stair' + i + '.jpg'), Buffer.from(r.shots[i].split(',')[1], 'base64')); delete r.shots; }
  await page.screenshot({ path:path.join(__dirname, 'shots', 'rs917-room.png') });
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(r.plot && r.quest[0] > 50 && r.quest[1]===0, 'no quest spot in or by the plot', r);
  A(r.up===1 && r.down===0, 'up the stair and down again', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
