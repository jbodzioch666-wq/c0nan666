// RS-451: a giant crab is giant - well over a tile across, far bigger than a man - not the size of a giant rat
module.exports = async page=>{
  const r = await page.evaluate(()=>({ crab:monSizeK({ nm:'giant crab' }), king:monSizeK({ nm:'king crab' }), rat:monSizeK({ nm:'giant rat' }), crabby:monSizeK({ nm:'crab' }), man:monSizeK({ nm:'goblin' }) }));
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.crab > 1.5 && r.king > 1.5, 'a giant crab stands far bigger than a man');
  A(r.rat < 1 && r.crabby < 1, 'a giant rat and a plain crab stay small');
};
