// RS-921: the plot's gate faces its town. A plot is staked out turned (P.q, quarter turns) so the way from the house to the gate points
// at the town it was bought from; an old plot is turned on loading the same way. Turned any of the four ways, the fence, gate, house and
// door stand where the 3D grounds show them: the gate open, the fence beside it shut, in at the gate and up the path to the front door.
// Shots: shots/rs921-gate.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = { q:[] }; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    { const roomy = ()=>{ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN && plotFind(x, y)) return { x, y }; return null; }, t = plotFind(G.owPos.x, G.owPos.y) ? null : roomy(); if (t){ G.owPos = t; enterVillage(); setUi('playing'); } }
    p.gold = 3e6; skGainXP('construction', 6e7); houseBuy(1); out.bought = plotBuy(); const P = plotGet();
    try{
    const [tx, ty] = P.town.split(',').map(Number), d = [tx - P.x, ty - P.y], V = PLOT_V[plotQ(P)]; out.faces = V[0]*d[0] + V[1]*d[1]; out.best = Math.max(...PLOT_V.map(v=>v[0]*d[0] + v[1]*d[1]));
    const q0 = P.q; delete P.q; out.again = plotQ(P)===q0;   /* (an old plot, turned on loading) */
    const shots = [], R = plotR();
    for (let q=0;q<4;q++){ P.q = q; G.plotSolid = null; const at = (u, v)=>{ const [dx, dy] = plotGrid(u, v, P); return [P.x + dx, P.y + dy]; }, o = { q };
      o.gate = plotBlock(...at(0, R)); o.fence = plotBlock(...at(1, R)); o.back = plotBlock(...at(0, -R)); o.door = plotBlock(...at(0, -1)); o.yard = plotBlock(...at(1, 1));
      /* walk in at the gate and up the path to the door */
      G.gameMode = 0; G.interior = null; const [sx, sy] = at(0, R + 2); G.owPos = { x:sx, y:sy }; O3.ppos = null; O3.win = null; await fr(40); const [mx, my] = plotGrid(0, -1, P);
      for (let i=0;i<R + 6 && G.gameMode===0;i++){ tryMoveOverworld(mx, my); await fr(2); } o.at = plotLoc(G.owPos.x - P.x, G.owPos.y - P.y, P); o.inHouse = G.gameMode===3 && !!G.interior && G.interior.key==='house'; if (o.inHouse){ exitInterior(); await fr(5); }
      /* the 3D grounds: the gate where the grid has it */
      await fr(10); const root = O3.yardRoot; if (root){ root.updateMatrixWorld(true); const w = root.localToWorld(new THREE.Vector3(0, 0, R)), c = o3C(...at(0, R)); o.gate3d = +Math.hypot(w.x - c[0], w.z - c[1]).toFixed(2);
        const R3 = O3.renderer, sz = R3.getSize(new THREE.Vector2()), cam = new THREE.PerspectiveCamera(40, sz.x/sz.y, 0.05, 200), cc = o3C(P.x, P.y), y = O3.heightAt(cc[0], cc[1]); cam.position.set(cc[0] + 0.01, y + 14, cc[1] + 6); cam.lookAt(cc[0], y, cc[1]); R3.render(O3.scene, cam); shots.push(R3.domElement.toDataURL('image/jpeg', 0.8)); }
      out.q.push(o); }
    P.q = q0;
    { const sheet = document.createElement('canvas'); sheet.width = 960; sheet.height = 540; const sx = sheet.getContext('2d'); for (let i=0;i<shots.length;i++){ const im = new Image(); im.src = shots[i]; await new Promise(q=>im.onload = q); sx.drawImage(im, (i%2)*480, Math.floor(i/2)*270, 480, 270); sx.fillStyle = '#fff'; sx.font = '16px sans-serif'; sx.fillText('q ' + i, (i%2)*480 + 6, Math.floor(i/2)*270 + 18); } out.sheet = sheet.toDataURL('image/jpeg', 0.88); }
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    return out; });
  if (r.sheet){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs921-gate.jpg'), Buffer.from(r.sheet.split(',')[1], 'base64')); delete r.sheet; }
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(r.bought && r.faces===r.best && r.again, 'the gate faces the town it was bought from; an old plot turned the same way', r);
  for (const o of r.q){ A(o.gate===null && o.fence==='wall' && o.back==='wall' && o.door==='door' && o.yard===null, 'turned ' + o.q + ': gate open, fence shut, door at the house', r);
    A(o.inHouse, 'turned ' + o.q + ': in at the gate and up the path to the door', r); A(o.gate3d!=null && o.gate3d < 0.6, 'turned ' + o.q + ': the 3D gate where the grid has it', r); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
