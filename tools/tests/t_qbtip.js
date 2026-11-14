// RS-329: hovering a quick-bar slot shows what it holds (the prayer's effect, the spell's runes, the item); the protection
// prayers wear a shield round their mark, so Protect from Magic no longer looks just like Mystic Will
module.exports = async page=>{
  await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const q = qbSlots(0); q[0] = { t:'prayer', id:'will' }; q[1] = { t:'prayer', id:'pmag' }; q[2] = { t:'spell', id:RS_SPELLS[0][0] };
    renderGame(); hudLayout(); await new Promise(r=>setTimeout(r, 200)); });
  const box = async i=>(await page.$(`#quickBar [data-qb="${i}"]`)).boundingBox();
  const hover = async i=>{ const b = await box(i); await page.mouse.move(b.x + b.width/2, b.y + b.height/2); await page.waitForTimeout(150);
    return page.evaluate(()=>{ const t = document.getElementById('itemTooltip'); return t.style.display!=='none' ? t.innerText : ''; }); };
  const r = {};
  r.will = await hover(0); r.pmag = await hover(1); r.spell = await hover(2);
  if (process.env.SHOT_DIR){ const b = await box(1); await page.screenshot({ path:process.env.SHOT_DIR+'/qbtip.png', clip:{ x:b.x - 60, y:b.y - 200, width:420, height:260 } }); }
  r.empty = await hover(5);
  r.icons = await page.evaluate(()=>[0,1].map(i=>{ const s = document.querySelector(`#quickBar [data-qb="${i}"] .ico`); return s ? s.className : null; }));
  r.side = await page.evaluate(()=>{ SP.open = true; SP.tab = 'prayer'; hudLayout(); const e = document.querySelector('[data-sp-pray="pmag"] .ico-prot'), w = document.querySelector('[data-sp-pray="will"] .ico-prot'); return { pmag:!!e, will:!!w }; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(/Mystic Will/.test(r.will) && /magic accuracy/.test(r.will) && /key 1/.test(r.will), 'a prayer slot tells you its name, effect and key');
  A(/Protect from Magic/.test(r.pmag) && /block 60% of magic/.test(r.pmag), 'the protection prayer says what it blocks');
  A(/rune cost/.test(r.spell) && /key 3/.test(r.spell), 'a spell slot shows its runes and damage');
  A(r.empty==='', 'an empty slot shows no tooltip (its title says how to fill it)');
  A(r.icons[0]==='ico' && /ico-prot/.test(r.icons[1]), 'protection wears a shield on the bar, the accuracy prayer does not');
  A(r.side.pmag && !r.side.will, 'and the same in the prayer tab');
  console.log('qbtip ok', JSON.stringify(r).slice(0, 400));
};
