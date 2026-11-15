// RS-180: a runecrafting altar asks before it binds your essence - reaching one (or pressing E by it) no longer crafts on its own
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0;
    const type = Object.keys(RC_ALTARS).find(k=>RC_ALTARS[k].lvl <= 1) || 'air';
    skAdd('essence', 10 - skHave('essence'));
    const before = { ess:skHave('essence'), runes:skHave('r_'+type), xp:G.player.skills.runecrafting||0 };
    // what reaching the altar does (skDo with its option)
    const keep = skNodeAt; skNodeAt = ()=>({ type, k:'runecrafting', x:1, y:1 });
    try{ skDo({ k:'runecrafting', node:{ x:1, y:1 } }); }finally{ skNodeAt = keep; }
    const m = document.getElementById('ctxMenu'), asked = { open:!!(m && m.style.display==='block'), text:m ? m.textContent : '', ess:skHave('essence'), runes:skHave('r_'+type) };
    // choose Bind
    const bind = [...m.querySelectorAll('[data-ci]')].find(o=>/Bind/.test(o.textContent)); bind.click();
    const after = { ess:skHave('essence'), runes:skHave('r_'+type), closed:m.style.display==='none', xp:(G.player.skills.runecrafting||0) - before.xp, shown:+((asked.text.match(/\((\d+) xp\)/)||[])[1]) };
    // and Cancel leaves it all alone
    skAdd('essence', 5); skNodeAt = ()=>({ type, k:'runecrafting', x:1, y:1 }); try{ skDo({ k:'runecrafting', node:{ x:1, y:1 } }); }finally{ skNodeAt = keep; }
    const cancel = [...m.querySelectorAll('[data-ci]')].find(o=>/Cancel/.test(o.textContent)); cancel.click();
    const cancelled = { ess:skHave('essence') };
    return { type, before, asked, after, cancelled };
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.asked.open && /Bind/.test(r.asked.text) && r.asked.ess===r.before.ess && r.asked.runes===r.before.runes, 'reaching the altar asks first, and spends nothing');
  A(r.after.ess===0 && r.after.runes > r.before.runes && r.after.closed, 'choosing Bind binds the essence into runes');
  A(r.after.shown===r.after.xp, 'the xp it promises is the xp you get');
  A(r.cancelled.ess===5, 'Cancel leaves your essence alone');
};
