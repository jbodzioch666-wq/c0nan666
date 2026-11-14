// RS-209: the bestiary's bosses tab - each boss can be picked, turns in the model viewer and has its lore, style and drops
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {}, wait = ms=>new Promise(r=>setTimeout(r, ms));
    G.player.bossKc = { 'orc overlord':2 };
    G.bestTab = 'bosses'; G.bestSel = null; setUi('bestiary'); await wait(100);
    const rows = [...document.querySelectorAll('#overlay [onclick^="bestPick"]')].map(e=>e.textContent);
    out.rows = rows.length; A(rows.length >= 13, 'every boss is a pickable row: '+rows.length);
    for (const nm of ['King Black Dragon','Kalphite Queen','Giant Mole','Dagannoth Prime','Ahrim the Blighted','orc overlord']){
      const i = BEST_LIST.indexOf(nm); A(i >= 0, nm+' listed'); bestPick(i);
      for (let k=0;k<80 && !(BV.e && BV.key===nm+'true');k++) await wait(150);
      const txt = document.getElementById('overlay').textContent;
      out[nm] = { model:!!BV.e, slot:!!document.getElementById('bvSlot'), style:/attack style/.test(txt), drops:/drops:/.test(txt) };
      A(out[nm].slot && out[nm].model, nm+': the viewer shows it '+JSON.stringify(out[nm]));
      A(out[nm].style && out[nm].drops, nm+': its stats '+JSON.stringify(out[nm]));
    }
    // (RS-216) the risen pharaoh is shown as one of the dead, not the nearest living figure
    const ph = bvPortrait({ nm:'risen pharaoh' }); out.pharaoh = ph===m3dPortrait({ nm:'risen pharaoh', undead:true }) && ph!==m3dPortrait({ nm:'bandit' });
    A(out.pharaoh, 'the risen pharaoh wears its own undead model in the viewer');
    A(/god-king/.test(bestLore('risen pharaoh', {})), 'and has its lore');
    return out; });
  console.log(JSON.stringify(r));
};
