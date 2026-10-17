// RS-442: a trinket's icon is a charm - a claw bound to an iron ring, with beads and a feather - not a pendant on a neck cord like an amulet
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const px = e=>{ const im = fpUndeadSprite(e, false).img, c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 64, 64); return x.getImageData(0, 0, 64, 64).data; };
    const t = px(obItemEntry(rsMakeTrinket(10))), a = px(obItemEntry(rsMakeJewel('necklace', 2)));
    let diff = 0, ink = 0; for (let i=3;i<t.length;i+=4){ if (t[i] > 40) ink++; if (Math.abs(t[i] - a[i]) > 80) diff++; }
    /* (the top corners: an amulet's cord runs up into them, the charm leaves them bare) */
    let corner = 0; for (let y=0;y<14;y++) for (const x0 of [2, 50]) for (let x=x0;x<x0+12;x++) if (t[(y*64 + x)*4 + 3] > 40) corner++;
    return { ink, diff, corner }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ink > 200, 'the trinket icon draws');
  A(r.diff > 400 && r.corner < 10, 'and looks nothing like an amulet - no cord up to the corners');
};
