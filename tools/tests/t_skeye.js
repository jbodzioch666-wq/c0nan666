// RS-215: a dressed skeleton's eyes glow its class's colour in the flat fallback drawing too (it used to read a variable
// that wasn't there, so every one got the default); the table matches the 3D kits
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    try{ sk3Build(); }catch(e){} for (let i=0;i<150 && !SK3.ok;i++) await new Promise(r=>setTimeout(r, 200));
    const out = {};
    for (const [nm, cls] of [['skeleton champion','champion'],['skeleton archer','archer'],['skeleton mage','mage']]){
      out[nm] = [sk3Class(nm), SK3_EYE[cls], sk3Kit(cls).eye];
      if (sk3Class(nm)!==cls || SK3_EYE[cls]!==sk3Kit(cls).eye) throw new Error('eye table matches the kit for '+nm+' '+JSON.stringify(out[nm]));
    }
    if (SK3_EYE[sk3Class('skeleton')]!==undefined) throw new Error('a plain skeleton keeps the default');
    // the flat fallback itself: draw a champion and read the eye colour it set
    FP.cam = FP.cam || { x:0, y:0 }; FP.monFlash = FP.monFlash || new Map();
    const m = { nm:'skeleton champion', x:1, y:1, alive:1, hp:10, maxHp:10 }; G.player.x = 2; G.player.y = 1;
    /* (RS-400: no flat fallback any more - the eyes are read off a built figure's own eye material) */
    const e = sk3Instance(m); let drawn = -1; e.holder.traverse(o=>{ if (o.isMesh && o.material && o.material.color && o.material.isMeshBasicMaterial && drawn < 0 && [...o.material.color.toArray()].some(v=>v > 0.3)) drawn = o.material.color.getHex(); });
    out.drawn = drawn; if (out.drawn!==SK3_EYE.champion) throw new Error('a champion is built with gold eyes: '+out.drawn.toString(16));
    return out; });
  console.log(JSON.stringify(r));
};
