// RS-339: the god spells have their own labelled rows in the Spells tab - name, the god's colour, and which staff they need -
// and a god staff's description names the spell it casts
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const sp = ()=>document.getElementById('sidePanel'), out = {};
    SP.open = true; SP.tab = 'spells'; hudLayout(); await new Promise(r=>setTimeout(r, 50));
    out.low = [...sp().querySelectorAll('.sp-god')].map(e=>({ t:e.innerText.replace(/\s+/g, ' '), locked:e.classList.contains('locked') }));
    out.head = /GOD SPELLS/.test(sp().innerText);
    out.inGrid = [...sp().querySelectorAll('.sp-spl')].some(e=>/sarastrike|guthclaws|zamflames/.test(e.dataset.spSpell));
    G.player.skills.magic = 5e6; G.gear.weapon = rsMakeGodStaff('sara'); hudLayout(); await new Promise(r=>setTimeout(r, 50));
    out.held = [...sp().querySelectorAll('.sp-god')].map(e=>({ id:e.dataset.spSpell, t:e.innerText.replace(/\s+/g, ' '), locked:e.classList.contains('locked') }));
    out.desc = itemDesc(G.gear.weapon);
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.head && r.low.length===3 && !r.inGrid, 'three labelled god spell rows, not lost among the plain spell squares');
  A(r.low.every(g=>g.locked && /Magic 60/.test(g.t)) && /Saradomin Strike/.test(r.low.map(g=>g.t).join()), 'each named, and locked with what it needs');
  const sara = r.held.find(g=>g.id==='sarastrike'), guth = r.held.find(g=>g.id==='guthclaws');
  A(sara && !sara.locked && /in hand/.test(sara.t) && guth && guth.locked && /Guthix staff/.test(guth.t), 'holding the Saradomin staff opens Saradomin Strike only');
  A(/casts Saradomin Strike/.test(r.desc), 'the staff names its spell');
  console.log('godspells ok', JSON.stringify(r).slice(0, 400));
};
