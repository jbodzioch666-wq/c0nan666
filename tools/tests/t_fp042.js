// FP-042: the look's proportions on the sculpted body - a wood elf's long shanks and short trunk (Rankin/Bass), a dwarf's short legs, against a human's:
// the model's leg (pelvis to ankle) over its trunk (pelvis to neck) in the creator's preview, the limbs thinner, the feet on the ground
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  await page.evaluate(()=>{ goToCharCreate(); renderOverlay(); });
  const prop = race=>page.evaluate(async race=>{ LP.key = ''; if (LP.e) LP.scene.remove(LP.e.holder); LP.e = null; ccSelectRace(race); await new Promise(r=>setTimeout(r, 60)); let k = 0; do { await new Promise(r=>requestAnimationFrame(r)); } while ((LP.pend || !LP.e || !LP.e.tp) && k++ < 600); for (let i=0;i<4;i++) await new Promise(r=>requestAnimationFrame(r));
    const T = THREE, e = LP.e, tp = e.tp, D = TPB.data; e.holder.updateMatrixWorld(true); const Li = e.holder.matrixWorld.clone().invert(), B = n=>new T.Vector3().setFromMatrixPosition(tp.bones[D.bones.indexOf(n)].matrixWorld).applyMatrix4(Li);
    const pel = B('pelvis'), leg = pel.distanceTo(B('calf_r')) + B('calf_r').distanceTo(B('foot_r')), trunk = pel.distanceTo(B('neck_01')), body = tp.meshes.find(m=>/\.Legs$/.test(m.name));
    const bx = new T.Box3().setFromObject(body, true); let ground = Infinity; for (const m of tp.meshes){ if (!m.visible) continue; const b2 = new T.Box3().setFromObject(m, true); if (!b2.isEmpty())ground = Math.min(ground, b2.min.clone().applyMatrix4(Li).y); }   /* (the shown parts: the shoes cut for drawn feet are hidden) */
    return { neckY:+B("neck_01").y.toFixed(3), pelY:+B("pelvis").y.toFixed(3), race:RACES[race][0], ratio:+(leg/trunk).toFixed(3), ground:+ground.toFixed(3), prop:Object.keys(TPB.geo).some(k2=>TPB.geo[k2]===body.geometry && /\|p[0-9]/.test(k2)) || Object.keys(TPB.geo).some(k2=>k2.includes('|p') && k2.startsWith(body.name.slice(3))) }; }, race);
  const hu = await prop(0), we = await prop(2), dw = await prop(3); console.log('proportions', JSON.stringify({ hu, we, dw }));
  A(we.ratio > hu.ratio*1.4, 'the wood elf legs long against its trunk, far more than a human: ' + JSON.stringify([hu, we]));
  A(dw.ratio < hu.ratio*0.95, 'a dwarf shorter in the leg than a human: ' + JSON.stringify([hu, dw]));
  A(we.prop && Math.abs(we.ground - hu.ground) < 0.03 && Math.abs(dw.ground - hu.ground) < 0.03, 'the wood elf and the dwarf models their own proportions, standing on the ground (not sunk to the ankles on longer legs, nor afloat on shorter): ' + JSON.stringify([hu, we, dw]));
  A(we.neckY > hu.neckY && we.neckY < hu.neckY*1.2, 'the wood elf sized by its neck, as tall as the figure drawn - not grown on its long legs: ' + JSON.stringify([hu, we]));
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
