// FP-040: a hunched wood elf's arms hang - in the creator's preview along the drawn arms, and on the model's own idle, not swung back behind the hips
// with the bent back (the arms aimed again after the bend, the turn kept for the clips)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const arm = clip=>page.evaluate(async clip=>{ goToCharCreate(); renderOverlay(); ccSelectRace(2); LP.key = ''; if (LP.e) LP.scene.remove(LP.e.holder); LP.e = null; let k = 0; do { await new Promise(r=>requestAnimationFrame(r)); } while ((LP.pend || !LP.e || !LP.e.tp) && k++ < 600);
    if (clip) LP.e.tp.mon = false; for (let i=0;i<(clip ? 90 : 4);i++) await new Promise(r=>requestAnimationFrame(r));
    const T = THREE, e = LP.e, tp = e.tp, D = TPB.data, r = e.rig; e.holder.updateMatrixWorld(true); const Li = e.holder.matrixWorld.clone().invert(), W = m=>new T.Vector3().setFromMatrixPosition(m).applyMatrix4(Li), B = n=>tp.bones[D.bones.indexOf(n)].matrixWorld;
    const out = {}; for (const [s, i] of [['r', 0], ['l', 1]]){ const d = W(r.arms[i].el.matrixWorld).sub(W(r.arms[i].sh.matrixWorld)).normalize(), m = W(B('lowerarm_' + s)).sub(W(B('upperarm_' + s))).normalize(); out[s] = { drawn:d.toArray().map(x=>+x.toFixed(3)), model:m.toArray().map(x=>+x.toFixed(3)), dot:+d.dot(m).toFixed(3) }; }
    out.curve = !!(e.o && e.o.curve) || Object.keys(tp.bend).length > 0; return out; }, clip);
  const pv = await arm(false), ic = await arm(true); console.log('arms', JSON.stringify({ pv, ic }));
  A(pv.curve && pv.r.dot > 0.98 && pv.l.dot > 0.98, 'in the preview the model arms along the drawn arms: ' + JSON.stringify(pv));
  A(ic.r.model[2] > -0.45 && ic.l.model[2] > -0.45 && ic.r.model[1] < -0.85 && ic.l.model[1] < -0.85, 'on the idle clip the arms hang as a straight back figure does (before, -0.83 back), not swung back: ' + JSON.stringify(ic));
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
