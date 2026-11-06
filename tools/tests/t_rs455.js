// RS-455: there's no "orb from glass" recipe any more - the unpowered orb is made from a silver bar, and charged from there
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const R = crRecipes(); return { glassOrb:R.filter(x=>/orb from glass/i.test(x.nm)).length, orbs:R.filter(x=>x.bag==='orb').map(x=>Object.keys(x.need).join('+')), charge:R.filter(x=>/^Charge /.test(x.nm)).length }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.glassOrb===0, 'no orb from glass');
  A(r.orbs.length===1 && r.orbs[0]==='silverb' && r.charge > 0, 'the unpowered orb from a silver bar, and charging it, still there');
};
