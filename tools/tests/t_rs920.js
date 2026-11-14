// RS-920: the grounds of your plot on the land show what's really there. Each raised bed grows the crop sown in the house's bed of the same
// number, as far as it has grown (ready, in bud, sprouting - an empty bed is bare earth); the pasture keeps your own animals - hens, cows
// and sheep, the young ones smaller - and both change as the crops grow and the herd does, without leaving the land.
// Shots: shots/rs920-grounds.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    { const roomy = ()=>{ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN && plotFind(x, y)) return { x, y }; return null; }, t = plotFind(G.owPos.x, G.owPos.y) ? null : roomy(); if (t){ G.owPos = t; enterVillage(); setUi('playing'); } }
    p.gold = 3e6; skGainXP('construction', 6e7); houseBuy(1); out.bought = plotBuy();
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
    /* the shot: the grounds from above the garden and the pasture */
    { const c = o3C(P.x, P.y), R = O3.renderer, T = THREE, y = O3.heightAt(c[0], c[1]), sz = R.getSize(new T.Vector2()), sheet = document.createElement('canvas'); sheet.width = 960; sheet.height = 540; const sx = sheet.getContext('2d');
      const shot = (ex, ez, tx, tz, i)=>{ const root = O3.yardRoot, w = root.localToWorld(new T.Vector3(ex, 0, ez)), t = root.localToWorld(new T.Vector3(tx, 0, tz)), cam = new T.PerspectiveCamera(34, sz.x/sz.y, 0.05, 200); cam.position.set(w.x, y + 2.6, w.z); cam.lookAt(t.x, y + 0.1, t.z); R.render(O3.scene, cam); sx.drawImage(R.domElement, (i%2)*480, 0, 480, 540*480/960*sz.y/sz.x*960/540 > 540 ? 540 : 270*2); };
      const Y = o3YardGeom(3, plotR()); if (Y){ shot(Y.gx + 2.4, Y.bedZ(1) + 2.6, Y.gx, Y.bedZ(1), 0); shot(Y.px - 2.6, Y.hz + 3.6, Y.px, Y.hz + 1.3, 1); } out.shot = sheet.toDataURL('image/jpeg', 0.88); }
    /* the crops grow and the herd changes, out on the land */
    beds[1].t0 = now - 500; f.a.push({ k:'sheep', g:5 }); f.a.splice(3, 1); await fr(70); out.after = count(); out.key2 = O3.yardLiveKey;
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    return out; });
  if (r.shot){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs920-grounds.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot; }
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(r.R >= 5 && r.first && r.farm, 'the Manor\'s grounds on the land, with its live layer', r);
  A(r.first.beds >= 3 && r.first.plants > 20, 'the beds grow the house garden\'s crops (three sown, the rest bare)', r);
  A(r.first.an.chicken===3 && r.first.an.cow===2 && r.first.an.sheep===2, 'the pasture keeps your own animals', r);
  A(r.key2!==r.key && r.after.an.cow===1 && r.after.an.sheep===3 && r.after.plants > r.first.plants, 'a crop grown and the herd changed show on the land', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
