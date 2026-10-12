// RS-355: double-click the fps meter and it diagnoses the card's time on this machine - switching one thing off at a
// time for forty frames each (sprites, grass, lamps, soft shadows, shadows, the multisampled post buffer, people, the
// ground, see-through parts) and reading how many milliseconds each saves against a base. Every switch is undone after
// its turn, and the whole thing undone when the meter goes off. Driven here with made-up card times, since the software
// renderer has no timer
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 15)); } }; await fr(4);
    SET.fps = true; let ts = 1000; FPSC.t0 = ts; fpsTick(ts); const out = {};
    const sprites = ()=>{ let n = 0, v = 0; V3.scene.traverse(o=>{ if (o.isSprite){ n++; if (o.visible) v++; } }); return [n, v]; };
    const R = V3.renderer, P = GFXP.get(R); out.samples0 = P ? P.scene.samples : -1; out.shadowType0 = R.shadowMap.type;
    diagToggle(); out.on = DIAG.on;
    const feed = (ms, n)=>{ for (let i=0;i<n;i++) diagFrame(ms); };
    const at = ()=>DIAG.k % 2 ? DIAG_STEPS[(DIAG.k+1)/2][0] : 'base';
    feed(10, 46); out.base = DIAG.res.base; out.stepAfterBase = at(); out.spritesHidden = sprites();
    feed(9.6, 46); out.spritesBack = sprites(); out.resSprites = DIAG.res.sprites; out.stepNow = at();
    feed(10, 46); feed(7, 46); feed(10, 46); feed(8.8, 46);   // base, grass, base, lamps (RS-357: a fresh base before every step)
    feed(10, 46); out.stepSoft = at(); out.softType = R.shadowMap.type; feed(8, 46); out.softBack = R.shadowMap.type;
    feed(10, 46); out.stepShadows = at(); out.shadowsOff = R.shadowMap.enabled; feed(6, 46); out.shadowsBack = R.shadowMap.enabled;
    feed(10, 46); out.stepMsaa = at(); out.msaaSamples = P ? P.scene.samples : -1; feed(9, 46); out.msaaBack = P ? P.scene.samples : -1;
    feed(12, 46); out.stepPeople = at(); out.peopleHidden = !V3.player.g.visible; feed(10, 46); out.peopleBack = V3.player.g.visible; out.stepAfterPeople = at();
    renderGame(); FPSC.n = 40; FPSC.t0 = ts; ts += 600; fpsTick(ts); out.meter = document.getElementById('fpsCounter').textContent;
    diagToggle(); out.off = DIAG.on; out.spritesAfterOff = sprites(); SET.fps = false; fpsTick(ts + 1000); out.diagOffWithMeter = DIAG.on;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.on && r.base===10 && r.stepAfterBase==='sprites' && r.spritesHidden[0] > 0 && r.spritesHidden[1]===0, 'after the base, the sprites are switched off');
  A(r.spritesBack[1]===r.spritesBack[0] && Math.abs(r.resSprites - 0.4) < 0.01, 'the sprites come back and their saving is kept');
  A(r.stepSoft==='softshadow' && r.softType===1 && r.softBack===r.shadowType0, 'the soft shadow filtering is swapped and restored');
  A(r.stepShadows==='shadows' && r.shadowsOff===false && r.shadowsBack===true, 'the shadows go off and come back');
  A(r.stepMsaa==='msaa' && (r.samples0===0 ? r.msaaSamples===0 : r.msaaSamples===0 && r.msaaBack===r.samples0), 'the multisampling goes off and comes back');
  A(r.stepPeople==='people' && r.peopleHidden && r.peopleBack, 'the people go and come back');
  A(r.stepNow==='base' && r.stepAfterPeople==='base', 'a fresh base is read between the steps');
  A(/diag base 12\.0 -sprites 0\.4 -grass 3\.0 -lamps 1\.2 -softshadow 2\.0 -shadows 4\.0 -msaa (1\.0|n\/a) -people 2\.0/.test(r.meter), 'the meter reads each saving against the base just before it: '+r.meter);
  A(!r.off && r.spritesAfterOff[1]===r.spritesAfterOff[0] && !r.diagOffWithMeter, 'switching off undoes everything, and the meter going off does too');
};
