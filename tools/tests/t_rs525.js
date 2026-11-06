// RS-525: the body sliders - one per setting of the build, in the character creator and at the barber's (for nothing) - with
// presets, a random build and reset; the number follows a drag and the figure is sculpted when you let go, a few ms a frame,
// the figure you had standing until the new one is ready; and the build you set is the one your character is made with
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {};
    goToCharCreate(); renderOverlay(); saveCurrentGame = ()=>{};
    const sl = [...document.querySelectorAll('.bdrow input[onchange^="lookBodySet"]')]; out.sliders = sl.length; out.keys = sl.map(s=>s.dataset.k).join(',');
    out.presets = document.querySelector('.bdwrap').querySelectorAll('.bdpre .btn').length; out.avgSel = !!document.querySelector('.bdpre .btn.sel') && document.querySelector('.bdpre .btn.sel').textContent==='Average';
    /* a drag moves the number only; letting go sets the look */
    const fatEl = sl.find(s=>s.dataset.k==='fat'); fatEl.value = 90; lookBodyDrag(fatEl); out.dragNum = fatEl.parentElement.querySelector('.bdv').textContent; out.dragLook = lookBody(lookTarget()).fat;
    lookBodySet('fat', 0.9); out.setLook = lookBody(lookTarget()).fat; out.touched = G.ccLookTouched; out.custom = !document.querySelector('.bdpre .btn.sel');
    /* presets, random, reset */
    lookBodyPreset('Brute'); const B = lookBody(lookTarget()); out.brute = B.muscle===0.9 && B.frame===0.9 && B.hips===0.5; out.bruteSel = document.querySelector('.bdpre .btn.sel') && document.querySelector('.bdpre .btn.sel').textContent==='Brute';
    lookBodyRandom(); const Rb = lookBody(lookTarget()); out.random = LOOK_BODY.every(([k])=>Rb[k] >= 0 && Rb[k] <= 1) && Rb.posture <= 0.45 && lookTarget().bd && Object.keys(lookTarget().bd).length===LOOK_BODY.length;
    lookBodyReset(); out.reset = !lookTarget().bd && lookBody(lookTarget()).fat===0.3;
    /* the preview sculpts the new figure over frames, the old one standing meanwhile */
    lookBodySet('fat', 0.5); await new Promise(res=>setTimeout(res, 300)); let n = 0; while (LP.pend && n++ < 600){ await new Promise(res=>requestAnimationFrame(res)); }
    const e0 = LP.e; lookBodySet('fat', 1); lookBodySet('muscle', 1); await new Promise(res=>requestAnimationFrame(res));
    let worst = 0, keptOld = true, frames = 0; const f0 = lpFrame; while (LP.pend && frames++ < 900){ if (LP.e!==e0) keptOld = false; const t0 = performance.now(); await new Promise(res=>requestAnimationFrame(res)); worst = Math.max(worst, performance.now() - t0); }
    out.swapped = !!LP.e && LP.e!==e0 && !LP.pend; out.keptOld = keptOld; out.worstFrame = Math.round(worst); out.framesToBuild = frames; out.hint = document.querySelector('.lkhint') && document.querySelector('.lkhint').textContent;
    /* the build you set is the one your character is made with, and it saves and loads */
    lookBodyPreset('Giant'); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const pt = rsPlayerLook(); out.made = pt.stature > 1.07 && pt.o.bulk > 1.1 && pt.o.bodyMus===0.7; out.saved = G.player.look.bd && G.player.look.bd.height===1;
    /* at the barber's: the sliders, free */
    openMakeover(); renderOverlay(); out.barber = document.querySelectorAll('.bdrow input[onchange^="lookBodySet"]').length===LOOK_BODY.length && /for nothing/.test(document.querySelector('.bdhead').textContent);
    const gold = G.player.gold; lookBodySet('fat', 0.2); out.moCost = makeoverCost(); makeoverConfirm(); out.moApplied = G.player.look.bd.fat===0.2 && G.player.gold===gold && G.ui!=='makeover';
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.sliders===13 && r.keys==='frame,fat,muscle,shoulders,chest,waist,hips,neck,head,legs,arms,height,posture', 'a slider for each setting of the build');
  A(r.presets===10 && r.avgSel, 'the presets, with Average lit for a fresh look');
  A(r.dragNum==='90' && r.dragLook===0.3 && r.setLook===0.9 && r.touched && r.custom, 'a drag moves the number; letting go sets the look, and no preset is lit');
  A(r.brute && r.bruteSel && r.random && r.reset, 'presets, a random build and reset');
  A(r.swapped && r.keptOld && r.worstFrame < 120 && r.framesToBuild > 1, 'the new figure is sculpted over frames, the old one standing meanwhile');
  A(r.hint==='drag to turn', 'the hint goes back to drag to turn');
  A(r.made && r.saved, 'the build you set is the one your character is made with');
  A(r.barber && r.moCost===0 && r.moApplied, 'at the barber\'s the build is yours to set, for nothing');
};
