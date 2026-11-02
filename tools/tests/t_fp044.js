// FP-044: the robe's shape and the tail kept while nothing comes through - FP-043 pushed each point of a robe out of the legs, which left
// lumps and stood its waist out like a hoop (1.3-1.44 x the hips when standing), and set a robed dragonborn's tail back off its body (0.1
// from the pelvis). Standing, a robe's waist within 1.2 x the model's hips, a tail's root within 0.06 of its pelvis; running, nothing through
const { clip } = require('./t_zclip.js');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = [];
  for (const [race, mv] of [[0, 0], [2, 0], [7, 0], [8, 0], [2, 1], [7, 1]]){ const r = await clip(page, race, 'robe', 24, mv, false, true); delete r.shot; out.push([r.race, mv, r.waist, r.tailGap, r.mean.cape, r.mean.skirt]);
    A(!r.err, 'a model: ' + JSON.stringify(r)); A(r.mean.cape <= 2 && r.mean.skirt <= 4, 'nothing through the cape or the robe: ' + JSON.stringify(r));
    if (!mv) A(r.waist!=null && r.waist <= 1.2, 'the robe snug at the waist, standing: ' + JSON.stringify(r)); if (r.tailGap!=null) A(r.tailGap <= 0.06, 'the tail on the body: ' + JSON.stringify(r)); }
  console.log('fp044', JSON.stringify(out));
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
