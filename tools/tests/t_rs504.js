// RS-504: skP() fills a player's missing skill fields once per player object, not on every call - the HUD asks skHave/skP hundreds
// of times a frame, and the re-defaulting was 6% of a town frame. A fresh player (new game or load) still gets every default; the
// bag still adds and counts; and a villager's cloak still settles onto the body (it now uses four solver passes to the player's six)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {};
    const p1 = skP(); out.defaults = p1.skills.mining!==undefined && p1.skills.hitpoints > 0 && !!p1.bag && !!p1.tools;
    delete p1.skills.mining; skP(); out.memoized = p1.skills.mining===undefined;   /* (the defaults no longer re-run for a known player) */
    p1.skills.mining = 0;
    skAdd('c_shrimp', 3); out.bag = skHave('c_shrimp') >= 3;
    const old = G.player; G.player = { }; out.fresh = skP().skills.mining===0 && skP().skills.hitpoints > 0; G.player = old;
    /* a villager's cloak still drapes: settle one on a non-hero rig and check it lies against the back, not exploded */
    const T = THREE; G.gear.cape = rsMakeCape(0, 'Black Cape');
    const e = m3dInstance({}, rsPlayerLook()), sc = new T.Scene(); sc.add(e.holder);
    const cape = e.rig.cape; for (let i=0;i<60;i++) m3dCapeCloth(cape, e.rig, 1/60);
    const u = m3dCapeOwn(cape), P = u.P; let worst = 0, span = 0;
    for (let i=0;i<P.length;i+=3){ worst = Math.max(worst, Math.abs(P[i]), Math.abs(P[i+1]), Math.abs(P[i+2])); span = Math.max(span, P[i+2] - u.rest[i+2]); }
    out.cloth = { worst:+worst.toFixed(2), span:+span.toFixed(3) };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.defaults && r.fresh, 'a fresh player still gets every default');
  A(r.memoized, 'the defaults run once per player, not per call');
  A(r.bag, 'the bag still adds and counts');
  A(r.cloth.worst < 2 && r.cloth.span < 0.12, 'a non-hero cloak settles sanely against the back');
};
