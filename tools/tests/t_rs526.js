// RS-526: the creation screen tidied - the race is a picker (arrows either side of its name, what it is, its gift, its skills and
// a dot for each race) instead of a list of ten rows, and the row of starting stats at the bottom is gone
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); const out = {}, q = s=>document.querySelector('#overlay ' + s);
    out.rows = document.querySelectorAll('#overlay .choice-row[onclick^="ccSelectRace"]').length; out.stats = document.querySelectorAll('#overlay .statgrid').length;
    out.pick = !!q('.racepick'); out.dots = document.querySelectorAll('#overlay .rpdots i').length; out.name0 = q('.rpnm').textContent;
    q('.racepick .rpb:last-child').click(); out.next = [G.chosenRace, q('.rpnm').textContent.startsWith(RACES[1][0]), q('.rpdots i.on')===document.querySelectorAll('#overlay .rpdots i')[1]];
    q('.racepick .rpb').click(); q('.racepick .rpb').click(); out.wrap = G.chosenRace===RACES.length - 1;
    document.querySelectorAll('#overlay .rpdots i')[3].click(); out.dot = G.chosenRace===3;
    handleKeydown({ key:'ArrowRight', target:document.body, preventDefault(){} }); out.key = G.chosenRace===4;
    handleKeydown({ key:'2', target:document.body, preventDefault(){} }); out.num = G.chosenRace===1;
    out.aff = /xp/.test(q('.rpaff').textContent) && q('.rpgift b').textContent===RACES[1][3];
    out.kits = document.querySelectorAll('#overlay .choice-row[onclick*="chosenKit"]').length; out.sliders = document.querySelectorAll('#overlay .bdrow').length;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.rows===0 && r.pick && r.dots===10, 'the race is a picker, not a list');
  A(r.stats===0, 'no row of starting stats');
  A(r.next[0]===1 && r.next[1] && r.next[2] && r.wrap && r.dot, 'the arrows step through the races (wrapping round), and a dot picks one');
  A(r.key && r.num, 'the arrow keys and the number keys pick too');
  A(r.aff, 'it shows the race\'s gift and skills');
  A(r.kits===3 && r.sliders===13, 'the kits and the body sliders are still there');
};
