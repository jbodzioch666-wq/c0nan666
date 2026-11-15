// RS-928: the plot's animals move - each wanders its own ground (the hens before their house, the sheep in the fold, the cows in the open),
// a few steps at a time at its own pace, turning to where it goes and grazing between, the way there kept clear of the trough, the byre
// and the bales and of the other animals. Shots: shots/rs928-0..2.jpg (the yard over five minutes)
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    { const roomy = ()=>{ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN && plotFind(x, y)) return { x, y }; return null; }, t = plotFind(G.owPos.x, G.owPos.y) ? null : roomy(); if (t){ G.owPos = t; enterVillage(); setUi('playing'); } }
    p.gold = 3e6; skGainXP('construction', 6e7); houseBuy(1); out.bought = plotBuy(); { const PQ = plotGet(); if (PQ) PQ.q = 0; }   /* (RS-921: the gate pinned to the south, as this test's walks expect) */
    try{
    houseBuy(3); const P = plotGet();
    if (plotR() < 5){ let best = null; for (let r=6;r<70 && !best;r++) for (let a=-r;a<=r && !best;a++) for (const [x, y] of [[P.x + a, P.y - r], [P.x + a, P.y + r], [P.x - r, P.y + a], [P.x + r, P.y + a]]) if (!best && x > 8 && y > 8 && x < OW_COLS - 8 && y < OW_ROWS - 8 && plotSiteOk(x, y)) best = [x, y];
      if (best){ P.x = best[0]; P.y = best[1]; P.r = null; G.plotSolid = null; O3.win = null; } }
    out.R = plotR(); const h = houseP(), now = clockNow(), beds = gardenP(); out.houseBeds = beds.length;
    beds[0] = { id:'sunpetal', t0:now - 500, w:1 }; if (beds.length > 1) beds[1] = { id:'flax', t0:now - 20 }; if (beds.length > 2) beds[2] = { id:'ghostcap', t0:now - 5 }; for (let i=3;i<beds.length;i++) beds[i] = null;
    const f = farmP(); out.farm = !!f; if (f){ f.a = [{ k:'chicken', g:999 }, { k:'chicken', g:999 }, { k:'chicken', g:5 }, { k:'cow', g:999 }, { k:'cow', g:5 }, { k:'sheep', g:999, w:2 }, { k:'sheep', g:999, w:0 }]; f.feed = 30; }
    G.gameMode = 0; G.owPos = { x:P.x, y:P.y + 7 }; O3.ppos = null; await fr(60);
    const live = ()=>O3.yardRoot && O3.yardRoot.getObjectByName('yardLive');
    const count = ()=>{ const g = live(); if (!g) return null; let beds = 0, plants = 0; const an = {}; for (const c of g.children){ if (c.userData.farm){ an[c.userData.farm] = (an[c.userData.farm]||0) + 1; continue; } beds++; c.traverse(o=>{ if (o.isMesh) plants++; }); } return { beds, plants, an }; };
    out.first = count(); const Y = o3YardGeom(3, plotR()), fw = Math.min(Y.sw - 0.2, 1.4), fz = 0.2 + (plotR() - 3)*0.15 + 0.9, AN = O3.yardAnims || []; out.anims = AN.length;
    /* (RS-928) five minutes in the yard: every animal walks, never off its own ground, never into another */
    const start = AN.map(a=>[a.x, a.z]); let outZ = 0, clash = 0, far = 0, moved = 0; const R0 = O3.yardRoot, T = THREE, sh = [];
    const c = o3C(P.x, P.y), Rn = O3.renderer, sz = Rn.getSize(new T.Vector2()), shot = ()=>{ const w = R0.localToWorld(new T.Vector3(Y.px - 3.2, 3.0, Y.hz + 4.2)), t = R0.localToWorld(new T.Vector3(Y.px, 0.15, Y.hz + 2)), cam = new T.PerspectiveCamera(40, sz.x/sz.y, 0.05, 200); cam.position.copy(w); cam.lookAt(t); Rn.render(O3.scene, cam); sh.push(Rn.domElement.toDataURL('image/jpeg', 0.85)); };
    shot();
    for (let i=0;i<3000;i++){ O3.t += 0.1; o3SyncLandmarks(0.1); if (i===1500 || i===2999) shot();
      for (const a of AN){ const x = a.g.position.x, z = a.g.position.z; if (Math.hypot(x - a.x, z - a.z) > 1e-6) far++;
        const ok = /chick/.test(a.kind) ? z < Y.hz + 1.5 && z > Y.hz + 0.3 : /sheep|lamb/.test(a.kind) ? Math.abs(x - Y.px) < fw/2 && Math.abs(z - fz) < 0.55 : z > Y.hz + 0.9 && z < Y.z1 - 0.2 && Math.abs(x - Y.px) < Y.sw/2; if (!ok) outZ++; }
      for (let j=0;j<AN.length;j++) for (let k=j + 1;k<AN.length;k++) if (Math.hypot(AN[j].x - AN[k].x, AN[j].z - AN[k].z) < (AN[j].r + AN[k].r)*0.6) clash++; }
    out.walks = AN.map(a=>a.n); out.dist = AN.map((a, i)=>+Math.hypot(a.x - start[i][0], a.z - start[i][1]).toFixed(2)); out.mw = AN.every(a=>new T.Vector3().setFromMatrixPosition(a.g.matrixWorld).distanceTo(a.g.parent.localToWorld(a.g.position.clone())) < 1e-3); out.outZ = outZ; out.clash = clash; out.far = far; out.shots = sh;
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    return out; });
  (r.shots||[]).forEach((q, i)=>fs.writeFileSync(path.join(__dirname, 'shots', 'rs928-' + i + '.jpg'), Buffer.from(q.split(',')[1], 'base64'))); delete r.shots;
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(r.anims===7 && r.walks.every(n=>n >= 3), 'every animal wanders, a walk at a time', r);
  A(r.outZ===0, 'each on its own ground: the hens before their house, the sheep in the fold, the cows in the open', r);
  A(r.clash===0, 'never into one another', r);
  A(r.far===0 && r.mw, 'the figure goes where the animal is, drawn there too (the landmarks are frozen)', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
