// RS-733 (generator 25): a dragon's lair goes deep in a big range - it sat on any mountain tile with four mountains round it, often a
// little hill at a range's edge, built low in 3D - and its pass takes the shortest way out to open ground. Every lair of a new world:
// at least two tiles in (the pass counted as mountain), in a range of 30 tiles or more, its pass reaching open ground; the nearest
// one stands high, its path climbing to it. Shot: shots/rs733_lair.png (from the foot of its pass)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m); };
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null;
    const W = OW_COLS, H = OW_ROWS, M = G.ow.map, isM = (x,y)=>{ const t = M[x][y]; return t===OW_MOUNTAIN || t===OW_LAIR || t===OW_MOUNTAINPASS; }, OPEN = [OW_GRASS, OW_FOREST, OW_TUNDRA, OW_DESERT, OW_SWAMP];
    const lairs = [];
    for (let x=0;x<W;x++) for (let y=0;y<H;y++){ if (M[x][y]!==OW_LAIR) continue;
      let d = 4; for (let r=1;r<=3 && d===4;r++) for (let i=-r;i<=r && d===4;i++) for (let j=-r;j<=r;j++){ if (Math.max(Math.abs(i),Math.abs(j))!==r) continue; const nb = owNbG(x, y, i, j); if (!nb || !isM(nb[0], nb[1])){ d = r; break; } }
      const seen = new Set([x*H+y]), st = [[x,y]]; let n = 0; while (st.length && n < 3000){ const [cx, cy] = st.pop(); n++;
        for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nb = owNbG(cx, cy, dx, dy); if (!nb || !isM(nb[0], nb[1])) continue; const k = nb[0]*H + nb[1]; if (seen.has(k)) continue; seen.add(k); st.push(nb); } }
      /* the pass, in order, and the open tile at its foot */
      const path = []; let cur = [x, y], ps = new Set([x*H+y]), foot = null;
      for (let s=0;s<60 && !foot;s++){ let nx = null; for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nb = owNbG(cur[0], cur[1], dx, dy); if (!nb || ps.has(nb[0]*H + nb[1])) continue;
          if (M[nb[0]][nb[1]]===OW_MOUNTAINPASS){ nx = nb; break; } if (path.length && OPEN.includes(M[nb[0]][nb[1]])) foot = nb; else if (!path.length && OPEN.includes(M[nb[0]][nb[1]])) foot = nb; }
        if (foot) break; if (!nx) break; ps.add(nx[0]*H + nx[1]); path.push(nx); cur = nx; }
      lairs.push({ x, y, d, range:n, pass:path.length, foot, path }); }
    lairs.sort((a, b)=>Math.hypot(a.x - G.owPos.x, a.y - G.owPos.y) - Math.hypot(b.x - G.owPos.x, b.y - G.owPos.y));
    const L = lairs[0]; if (L && L.foot){ G.owPos = { x:L.foot[0], y:L.foot[1] }; owReveal(L.x, L.y, 8); }
    for (let i=0;i<30;i++){ renderGame(); try{ o3Render(); }catch(e){} await new Promise(r=>setTimeout(r, 100)); }
    const hA = (x,y)=>+O3.heightAt(x+0.5, y+0.5).toFixed(2);
    return { gen:G.ow.genVer, lairs:lairs.map(l=>({ d:l.d, range:l.range, pass:l.pass, foot:!!l.foot })), h:L && hA(L.x, L.y), path:L ? L.path.map(([x,y])=>hA(x,y)) : [], at:G.owPos, L:L && { x:L.x, y:L.y } };
  });
  await page.waitForTimeout(2500); await page.screenshot({ path:SHOTS + '/rs733_lair.png' });
  console.log(JSON.stringify(r));
  A(r.gen===25, 'a new world is generator 25');
  A(r.lairs.length && r.lairs.every(l=>l.d >= 2 && l.range >= 30), 'every lair deep in a big range: ' + JSON.stringify(r.lairs));
  A(r.lairs.every(l=>l.foot && l.pass >= 1), 'every lair has a pass out to open ground');
  A(r.h > 3, 'the nearest lair stands high: ' + r.h);
  A(r.path.length < 2 || r.path[r.path.length - 1] < r.path[0], 'its path climbs from the foot to the lair: ' + r.path.join(' '));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
