// RS-385: gathering no longer halves the frame rate. The hotbar's "stop" slot showed a cooldown sweep whose elapsed time was
// baked into the bar's HTML, so the whole hotbar was torn down and rebuilt every frame you gathered; the gather bar wrote its
// position, width and text to the page every frame too. Now the sweep carries its start time and the bar is rebuilt only
// when something really changed, and the gather bar is only touched when a value changes
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    o3Pref = false; v3Pref = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; setUi('playing');
    const frames = async n=>{ for (let i=0;i<n;i++){ frameLoop(performance.now()); await new Promise(r=>setTimeout(r, 25)); } };
    const hb = document.getElementById('dhud') || document.querySelector('.dh-slots') && document.querySelector('.dh-slots').closest('[id]');
    G.gather = { o:{ k:'foraging', label:'Foraging' }, iv:900000, next:performance.now()+600000, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0 };
    await frames(3);
    const slots = document.querySelector('.dh-slots'), bar = slots && slots.closest('div[id]'), gb = document.getElementById('gbar');
    const out = { bar:!!bar, gbar:!!gb };
    if (!bar) return out;
    let hbMut = 0, gbMut = 0; const mo = new MutationObserver(ms=>{ hbMut += ms.length; }); mo.observe(bar, { childList:true, subtree:true, characterData:true });
    const mo2 = new MutationObserver(ms=>{ gbMut += ms.length; }); if (gb) mo2.observe(gb, { childList:true, subtree:true, characterData:true, attributes:true });
    const h0 = bar.__lastHtml; await frames(12); mo.disconnect(); mo2.disconnect();
    out.sameHtml = bar.__lastHtml===h0; out.hbMut = hbMut; out.gbMut = gbMut;
    const sw = bar.querySelector('.cdw.run'); out.sweep = !!sw; out.delay = sw ? sw.style.animationDelay : null; out.at = sw ? sw.dataset.at : null;
    G.gather = null; await frames(2); out.gone = !bar.querySelector('.cdw.run');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.bar && r.gbar, 'the hotbar and the gather bar are there');
  A(r.sweep && r.at && /^-?\d+ms$/.test(r.delay), 'the stop slot shows a sweep that picked up where the swing is');
  A(r.sameHtml && r.hbMut===0, 'the hotbar is not rebuilt while you gather: '+r.hbMut+' changes over twelve frames');
  A(r.gbMut <= 30, 'the gather bar only writes what changed: '+r.gbMut+' changes over twelve frames');
  A(r.gone, 'the sweep goes when you stop');
};
