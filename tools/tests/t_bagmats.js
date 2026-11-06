// RS-323: what you've gathered - herbs and other forage, ores, logs, crafting materials - shows in the side window's bag and
// under the equipment page's All tab, not only on its Resources tab
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const herb = SK_HERB[0].id, mat = (SK_CRAFT_MATS.find(m=>m.id==='seaweed') || SK_CRAFT_MATS[0]).id; skAdd(herb, 4); skAdd(mat, 2); skAdd(SK_ORE[0].id, 3);
    SP.open = true; SP.tab = 'inv'; SP.pick = null; hudLayout(); await new Promise(r=>setTimeout(r, 50));
    const side = document.getElementById('sidePanel').textContent, want = [resName(herb), resName(mat), resName(SK_ORE[0].id)];
    const out = { want, side:want.map(n=>side.includes(n)) };
    SP.open = false; hudLayout(); G.csBag = 'all'; setUi('inventory'); await new Promise(r=>setTimeout(r, 50));
    const all = document.getElementById('overlay').textContent; out.all = want.map(n=>all.includes(n));
    return out; });
  console.log(JSON.stringify(r));
  if (r.side.some(v=>!v)) throw new Error('the side window bag shows the materials '+JSON.stringify(r));
  if (r.all.some(v=>!v)) throw new Error('the All tab shows the materials '+JSON.stringify(r));
};
