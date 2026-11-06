// RS-178: a dragon's lair sits on top of its mountain, with the pass carved out to it climbing up as a path from the foot of the range
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null;
    // a lair with mountains round it
    let L = null;
    for (let x=2;x<OW_COLS-2 && !L;x++) for (let y=2;y<OW_ROWS-2;y++){ if (G.ow.map[x][y]!==OW_LAIR) continue; let m = 0; for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++) if (G.ow.map[x+i][y+j]===OW_MOUNTAIN) m++; if (m>=3){ L = { x, y }; break; } }
    if (!L) return { none:true };
    // the pass out from it, in order
    const path = []; let cur = [L.x, L.y], seen = new Set([L.x+','+L.y]);
    for (let s=0;s<60;s++){ const nx = [[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[cur[0]+a, cur[1]+b]).find(([a,b])=>!seen.has(a+','+b) && G.ow.map[a] && G.ow.map[a][b]===OW_MOUNTAINPASS); if (!nx) break; seen.add(nx[0]+','+nx[1]); path.push(nx); cur = nx; }
    G.owPos = { x:L.x, y:L.y + 2 }; if (G.ow.map[L.x][L.y+2]===OW_MOUNTAIN && path.length) G.owPos = { x:path[0][0], y:path[0][1] };
    for (let i=0;i<4;i++){ renderGame(); try{ o3Render(); }catch(e){} await new Promise(r=>setTimeout(r, 60)); }
    const hA = (x,y)=>+O3.heightAt(x+0.5, y+0.5).toFixed(2);
    const out = { lair:hA(L.x, L.y), peaks:[], path:path.map(([x,y])=>hA(x,y)) };
    for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++) if ((i||j) && G.ow.map[L.x+i][L.y+j]===OW_MOUNTAIN) out.peaks.push(hA(L.x+i, L.y+j));
    // the lair's own model stands on the summit
    let site = null; O3.world.traverse(o=>{ if (!site && o.isGroup && Math.abs(o.position.x - (L.x+0.5)) < 0.01 && Math.abs(o.position.z - (L.y+0.5)) < 0.01 && o.position.y > 0.5) site = +o.position.y.toFixed(2); });
    out.site = site;
    return out; });
  console.log(JSON.stringify(r));
  if (r.none){ console.log('no lair in the mountains in this world - nothing to check'); return; }
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.lair > 1.6 && r.lair >= Math.max(...r.peaks)*0.85, 'the lair sits up on the mountain, as high as the peaks round it');
  A(r.site && Math.abs(r.site - r.lair) < 0.3, 'its model stands on the summit');
  if (r.path.length >= 2){
    A(r.path[0] > r.path[r.path.length-1] + 0.5, 'the path climbs from the foot of the range up to the lair');
    A(r.path.every((h, i)=>i===0 || h <= r.path[i-1] + 0.25), 'and it rises steadily, without dips');
  }
};
