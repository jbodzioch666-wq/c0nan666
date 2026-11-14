// (probe, not in ALL) sea cliffs in generator 13 against 14 (14: open sea only, no lake shores), per seed
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); const out = [];
    for (const seed of [1947342953, 2659250257, 777, 99]){ const row = { seed }; for (const v of [13, 14]){ G.ow.genVer = v; wgRegenerate(seed); let n = 0, lake = 0; const sea = owOpenSea(), W = OW_COLS;
        for (let x=1;x<OW_COLS-1;x++) for (let y=1;y<OW_ROWS-1;y++) if (owCliffAt(x, y)){ n++; if (!(sea[y*W+x+1] || sea[y*W+x-1] || sea[(y+1)*W+x] || sea[(y-1)*W+x])) lake++; }
        row['v' + v] = n + ' (' + lake + ' by lakes)'; } out.push(row); } G.ow.genVer = OW_GEN_VER; return out; });
  console.log(JSON.stringify(r));
};
