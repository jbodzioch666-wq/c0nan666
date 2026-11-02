// FP-043: nothing through a cape or a robe - the sculpted figure run in a cape, in plain clothes and in a robe: a human, a wood elf (long legs,
// hunched), a dwarf, a dragonborn (thick tail) and a tiefling (thin tail), a man and a woman. No more than a few of the model's points through
// the cloth in a sampled frame (FP-042 had hundreds: a run's back leg through the cape, the knees and shins out of the robe, the tails through both)
const { clip } = require('./t_zclip.js');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = [];
  for (const [race, set, fem] of [[0, 'plain'], [0, 'robe', 1], [2, 'plain'], [2, 'robe'], [3, 'plain'], [3, 'robe'], [7, 'robe'], [8, 'robe', 1]]){
    const r = await clip(page, race, set, 36, 1, !!fem, true); delete r.shot; out.push(r);
    A(!r.err, 'a model: ' + JSON.stringify(r)); A(r.mean.cape <= 2 && r.mean.skirt <= 6, 'little through the cape and the robe: ' + JSON.stringify(r)); }
  console.log('fp043', JSON.stringify(out.map(r=>[r.race, r.set, r.fem, r.mean.cape, r.mean.skirt])));
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
