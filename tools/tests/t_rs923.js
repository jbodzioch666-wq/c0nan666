// RS-923: the plot's animals are the farmyard's own jointed, furred figures (sized to the yard, breathing and grazing), the sheep in the fold,
// the hens before their house, the cows between; round straw bales with twine, a plank trough on trestles, a smooth hedge. Was RS-920:
// the grounds of your plot on the land show what's really there. Each raised bed grows the crop sown in the house's bed of the same
// number, as far as it has grown (ready, in bud, sprouting - an empty bed is bare earth); the pasture keeps your own animals - hens, cows
// and sheep, the young ones smaller - and both change as the crops grow and the herd does, without leaving the land.
// Shots: shots/rs923-0..3.jpg
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
    out.first = count(); out.key = O3.yardLiveKey; out.geom = o3YardGeom(3, plotR()) && o3YardGeom(3, plotR()).nb;
    { const c = o3C(P.x, P.y), R = O3.renderer, T = THREE, y = O3.heightAt(c[0], c[1]), sz = R.getSize(new T.Vector2()); out.shots = []; const Y = o3YardGeom(3, plotR()), root = O3.yardRoot;
      const shot = (ex, ey, ez, tx, tz)=>{ const w = root.localToWorld(new T.Vector3(ex, ey, ez)), t = root.localToWorld(new T.Vector3(tx, 0.15, tz)), cam = new T.PerspectiveCamera(40, sz.x/sz.y, 0.05, 200); cam.position.copy(w); cam.lookAt(t); R.render(O3.scene, cam); out.shots.push(R.domElement.toDataURL('image/jpeg', 0.85)); };
      const an = live().children.filter(o=>o.userData.farm); out.pos = an.map(o=>[o.userData.farm, +o.position.x.toFixed(2), +o.position.z.toFixed(2)]); out.anims = (O3.yardAnims||[]).length;
      const ht = k=>{ const o = an.find(q=>q.userData.farm===k); if (!o) return 0; root.updateMatrixWorld(true); const b = new T.Box3().setFromObject(o), s = root.getWorldScale(new T.Vector3()).x; return +((b.max.y - b.min.y)/s).toFixed(2); }; out.ht = { cow:ht('cow'), sheep:ht('sheep'), chicken:ht('chicken') };
      out.meshes = an.map(o=>{ let n = 0; o.traverse(m=>{ if (m.isMesh || m.isSkinnedMesh) n++; }); return n; });
      const fw = Math.min(Y.sw - 0.2, 1.4), fz = 0.2 + (plotR() - 3)*0.15 + 0.9; out.sheepIn = an.filter(o=>o.userData.farm==='sheep').every(o=>Math.abs(o.position.x - Y.px) < fw/2 && Math.abs(o.position.z - fz) < 0.55);
      out.henNear = an.filter(o=>o.userData.farm==='chicken').every(o=>o.position.z < Y.hz + 1.5);
      shot(Y.px - 3.5, 3.2, Y.hz + 4, Y.px, Y.hz + 2); shot(Y.px - 2.2, 1.6, 0.6, Y.px, -0.6); const cw = an.find(o=>o.userData.farm==='cow'); if (cw) shot(cw.position.x - 1.1, 0.9, cw.position.z + 1.0, cw.position.x, cw.position.z);
      const sh = an.find(o=>o.userData.farm==='sheep'); if (sh) shot(sh.position.x - 0.9, 0.7, sh.position.z + 0.8, sh.position.x, sh.position.z); }
    /* the crops grow and the herd changes, out on the land */
    beds[1].t0 = now - 500; f.a.push({ k:'sheep', g:5 }); f.a.splice(3, 1); await fr(70); out.after = count(); out.key2 = O3.yardLiveKey;
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    return out; });
  (r.shots||[]).forEach((q, i)=>fs.writeFileSync(path.join(__dirname, 'shots', 'rs923-' + i + '.jpg'), Buffer.from(q.split(',')[1], 'base64'))); delete r.shots;
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(r.R >= 5 && r.first && r.first.an.chicken===3 && r.first.an.cow===2 && r.first.an.sheep===2 && r.anims===7, 'your animals out on the land, each a posed figure', r);
  A(r.meshes.every(n=>n >= 1) && r.ht.cow > 0.4 && r.ht.cow < 0.75 && r.ht.chicken < 0.3 && r.ht.sheep < r.ht.cow, "the farmyard's own models, sized to the yard", r);
  A(r.sheepIn && r.henNear, 'the sheep in the fold, the hens before their house', r);
  A(r.key2!==r.key && r.after.an.cow===1 && r.after.an.sheep===3, 'the herd changes on the land', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
