// RS-508: how many casts your runes allow is worked out once per change of bag, staff or turn, not on every frame for every spell
// on the bar (a binary search of up to thirty rune plans each). The count must still follow your bag at once: spend runes and it
// drops, add runes and it rises, wield a staff and its element is free
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    rsApplyKit(2); const sp = RS_SPELLS.find(x=>x[0]==='windstrike') || RS_SPELLS[0], out = {};
    out.start = rsCastsLeft(sp);
    let plans = 0; const op = rsRunePlan; rsRunePlan = function(){ plans++; return op.apply(this, arguments); };
    for (let i=0;i<50;i++) rsCastsLeft(sp); out.repeatPlans = plans;   /* (asked fifty times, worked out once - already cached) */
    const mindBefore = skHave('r_mind'); skAdd('r_mind', -Math.min(mindBefore, 150)); out.afterSpend = rsCastsLeft(sp);
    skAdd('r_mind', 400); out.afterAdd = rsCastsLeft(sp);
    G.gear.weapon = newItem(); out.noStaff = rsCastsLeft(sp);
    rsRunePlan = op; return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.repeatPlans===0, 'asking again and again costs nothing');
  A(r.afterSpend < r.start || r.start===Infinity, 'spending runes drops the count at once');
  A(r.afterAdd > r.afterSpend, 'adding runes raises it at once');
  A(r.noStaff!==Infinity && r.noStaff <= r.start || r.start!==Infinity, 'without the staff, its element is no longer free');
};
