// RS-370: the loot filter has an ammo tag (arrows, bolts and thrown weapons). Kept with it in keep mode; salvaged with it
// in salvage mode while other gear is left alone
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const F = lootfP(); F.tiers = LOOTF_TIERS.map((_, i)=>i); F.safeUp = false; lootArrow = ()=>'';
    const arrows = rsMakeAmmo(1); arrows.qty = 20; const bolts = rsMakeAmmo(RS_BOLT0); bolts.qty = 10; const darts = rsMakeThrown('dart', 1, 20); const sword = genItem(5, 'weapon'); sword.quality = 0;
    const m = ()=>[arrows, bolts, darts, sword].map(it=>lootfMatch(it, F) ? 1 : 0).join('');
    const out = { chip:LOOTF_STATS.some(s=>s[0]==='ammo') };
    F.stats = ['ammo']; F.statMode = 'keep'; out.keep = m();
    F.statMode = 'match'; out.match = m();
    F.stats = []; out.none = m();
    setUi('lootfilter'); out.html = [...document.querySelectorAll('#overlay .lf-chip')].some(b=>b.textContent.trim()==='ammo'); setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.chip && r.html, 'an ammo tag in the menu');
  A(r.keep==='0001', 'keep ammo: arrows, bolts and darts kept, the sword salvaged');
  A(r.match==='1110', 'salvage ammo: only the ammo goes');
};
