// (probe, not in ALL) where the road builder finds the volcano, against where the finished world has it (generator 11 roads on its slopes)
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); const out = [];
    const og = geoBuild; let seen = []; window.geoBuild = function(k){ const g = og.apply(this, arguments); try{ const v = g.landmarks.find(l=>l.kind==='volcano'); seen.push(v ? [v.x, v.y] : null); }catch(e){} return g; };
    for (const [kind, seed] of [['continents', 777777], ['pangaea', 777777], ['archipelago', 777777]]){ seen = []; G.ow.continent = kind; wgRegenerate(seed);
      const lm = geoBuild(pmMapKey()).landmarks.find(l=>l.kind==='volcano'); let near = 0; for (let x=lm.x-9;x<=lm.x+9;x++) for (let y=lm.y-9;y<=lm.y+9;y++) if (x>=0 && y>=0 && x<OW_COLS && y<OW_ROWS && G.ow.road[y*OW_COLS+x] && Math.hypot(x-lm.x, y-lm.y) < VOLC.R + 1) near++;
      out.push({ kind, final:[lm.x, lm.y], seen:seen.slice(0, 4), near }); }
    window.geoBuild = og; return out; });
  console.log(JSON.stringify(r));
};
