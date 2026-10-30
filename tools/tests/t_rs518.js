// RS-518: the tome's icon is drawn like the rest of the paper doll - a cover in its dye, finer each tier (corner caps, glowing rune
// borders, gold corners and a clasp with your device, a gem) - and the hotbar's ranged button shows the very bow, crossbow or thrown
// weapon you carry, not one stock bow for everything
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const sig = it=>{ const e = obItemEntry(it), img = fpUndeadSprite(e, false).img, d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data; let h = 0; for (let i=0;i<d.length;i+=16) h = (h*31 + d[i] + d[i+1]*3 + d[i+2]*7) | 0; return { k:e.o.k, h }; };
    const out = {}, tomes = [0,1,2,3,4].map(t=>sig(rsMakeArmour('cloth', t, 'offhand')));
    out.tomeKind = tomes.every(s=>s.k==='tome'); out.tomeTiers = new Set(tomes.map(s=>s.h)).size===5;
    const t1 = rsMakeArmour('cloth', 1, 'offhand'), h0 = sig(t1).h; G.player.emblem = 'cross'; out.emblem = sig(t1).h!==h0; delete G.player.emblem;
    /* the hotbar's ranged button */
    const hb = ()=>{ const el = document.querySelector('.hud, #hud, body'); renderImmersiveHud(); return document.body.innerHTML; };
    G.gear.ranged = rsMakeCrossbow(3); G.player.rangedMode = 'bow'; G.player.arrows = 0; G.player.rsLastType = 'ranged'; rsSync && rsSync(); renderGame(); await new Promise(r2=>setTimeout(r2, 100));
    const want = dhIcon(obItemEntry(G.gear.ranged)), stock = dhIcon(obEntry('weapon', { kind:'bow' }));
    renderImmersiveHud(); const html = document.body.innerHTML;
    out.crossbowShown = html.includes(want); out.stockGone = !html.includes(stock) || want===stock;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.tomeKind && r.tomeTiers, 'every tome tier has its own drawn icon');
  A(r.emblem, 'your chosen device shows on the tome');
  A(r.crossbowShown, 'the hotbar shows the crossbow you carry');
};
