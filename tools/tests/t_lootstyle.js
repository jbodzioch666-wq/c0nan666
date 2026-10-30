// RS-169: drops lean to the way you fight - a mage finds staves and robes, an archer bows and hide
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); setUi('playing'); const p = G.player, out = {};
    const roll = style=>{ p.rsLastType = style; let staff = 0, bow = 0, cloth = 0, hide = 0, metal = 0;
      for (let i=0;i<300;i++){ const w = genItem(6, 'weapon', 3); if (w.rsStaff) staff++; else if (w.slot==='ranged' || w.range) bow++;
        const a = genItem(6, 'chest', 3); if (a.rsFam==='cloth') cloth++; else if (a.rsFam==='hide') hide++; else if (a.rsFam==='metal') metal++; }
      return { staff, bow, cloth, hide, metal }; };
    out.magic = roll('magic'); out.ranged = roll('ranged'); out.melee = roll('melee'); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.magic.staff > 90 && r.magic.cloth > 110, 'a mage finds staves and robes often');
  A(r.ranged.bow > 90 && r.ranged.hide > 110, 'an archer finds bows and hide often');
  A(r.melee.staff < 70 && r.melee.metal > 120, 'a fighter mostly finds metal and blades');
};
