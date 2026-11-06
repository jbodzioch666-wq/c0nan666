// RS-471: the emblem on your shields can be dyed too - a dye from your pack paints it on every metal shield, whatever emblem it is, and
// washing it out brings back its tier's colour
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player, out = {}, sh = ()=>{ rsSync && rsSync(); return rsPlayerLook().o.shield; };
    G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); out.before = sh().emblem;
    skAdd('dye_red', 2); emblemDye('red'); out.red = sh().emblem; out.left = skHave('dye_red');
    emblemPick('bend'); out.bend = [sh().em, sh().emblem]; G.gear.offhand = rsMakeArmour('metal', 1, 'tower'); out.tower = sh().emblem;
    emblemPick('plain'); out.plain = sh().em;
    emblemPick(null); emblemDye(null); G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); out.washed = sh().emblem;
    skAdd('dye_red', -skHave('dye_red')); emblemDye('red'); out.noDye = p.emblemDye || null;
    skAdd('dye_blue', 1); setUi('dyeworks'); out.picker = /emblemDye\('blue'\)/.test(document.body.innerHTML); setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.before==='#d8b050' && r.red==='#9a2a24' && r.left===1, 'a red dye paints the emblem red, and is used up');
  A(r.bend[0]==='bend' && r.bend[1]==='#9a2a24' && r.tower==='#9a2a24', 'whatever the emblem and the shield, it stays red');
  A(r.plain==='none', 'a plain shield has nothing to colour');
  A(r.washed==='#d8b050', "washed out, it is its tier's gold again");
  A(r.noDye===null, 'no dye, no colour');
  A(r.picker, 'the dye works offers your dyes for the emblem');
};
