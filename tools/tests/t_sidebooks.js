// RS-319: G and N (and their hotbar buttons) open the side window's Spellbook and Prayer tabs - the old full-screen menus are
// gone - and those tabs hold what only the old menus had: the rune pouch, changing books (any time since RS-321), burying bones. Enchanting
// gem-tipped arrows has moved to the fletching bench
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    const key = k=>handleKeydown({ key:k, target:document.body, preventDefault(){} }), sp = ()=>document.getElementById('sidePanel'), out = {};
    skAdd('r_air', 40); skAdd('r_mind', 25); skAdd('bones', 3); SP.open = false; await frames(3);
    key('g'); await frames(2); out.g = { open:SP.open, tab:SP.tab, ui:G.ui, shown:!!(sp() && sp().offsetHeight), pouch:/RUNE POUCH/.test(sp().innerHTML) && sp().querySelectorAll('.sp-rune').length >= 2 };
    // (RS-321) change spellbooks right there in the tab, any time - no altar needed; a book you haven't earned stays shut
    skGainXP('magic', 2e5); hudLayout(); await frames(1); const btn = nm=>[...sp().querySelectorAll('.sp-b')].find(b=>b.textContent===nm);
    out.books = { altar:rsNearAnyAltar(), arceuus:!!btn('Arceuus Spellbook') && !btn('Arceuus Spellbook').disabled, lunarLocked:!!btn('Lunar Spellbook') && btn('Lunar Spellbook').disabled };
    if (out.books.arceuus) btn('Arceuus Spellbook').click(); await frames(1); out.books.now = rsBook();
    rsSwitchBook('lunar'); out.books.stillArc = rsBook()==='arceuus'; rsSwitchBook('standard'); out.books.back = rsBook()==='standard';
    key('g'); await frames(1); out.gClose = !SP.open;
    key('n'); await frames(2); out.n = { open:SP.open, tab:SP.tab, ui:G.ui, bury:[...sp().querySelectorAll('.sp-b')].some(b=>/bury 3 bones/.test(b.textContent)) };
    const xp0 = skP().skills.prayer||0; [...sp().querySelectorAll('.sp-b')].find(b=>/bury/.test(b.textContent)).click(); out.buried = skHave('bones')===0 && (skP().skills.prayer||0) > xp0;
    // the hotbar's G button too, and from compact mode it brings the HUD back
    SP.open = false; SET.compact = true; applyUiPrefs(); await frames(2); dhPress('G'); await frames(2); out.compact = { open:SP.open, tab:SP.tab, compact:SET.compact, shown:!!sp().offsetHeight };
    // the old menus are gone
    out.gone = typeof buildRsMagic==='undefined' && typeof buildPrayer==='undefined';
    // the fletching bench enchants arrows
    G.bench = 'fletching'; setUi('bench'); out.bench = /ENCHANT ARROWS/.test(document.getElementById('overlay').innerHTML); out.ui = G.ui;
    return out; });
  await page.evaluate(async ()=>{ for (let i=0;i<3;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/bench-enchant.png' });
  await page.evaluate(async ()=>{ setUi('playing'); G.bench = null; SP.open = true; SP.tab = 'spells'; hudLayout(); for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const box = await page.evaluate(()=>{ const b = document.getElementById('sidePanel').getBoundingClientRect(); return { x:b.left-6, y:b.top-6, width:b.width+12, height:b.height+12 }; });
  await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/side-spells.png', clip:box });
  await page.evaluate(async ()=>{ SP.tab = 'prayer'; skAdd('bigbones', 2); hudLayout(); for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  const box2 = await page.evaluate(()=>{ const b = document.getElementById('sidePanel').getBoundingClientRect(); return { x:b.left-6, y:b.top-6, width:b.width+12, height:b.height+12 }; });
  await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/side-prayer.png', clip:box2 });
  console.log(JSON.stringify(r));
  if (!(r.g.open && r.g.tab==='spells' && r.g.ui==='playing' && r.g.shown)) throw new Error('G opens the Spellbook tab '+JSON.stringify(r.g));
  if (!r.g.pouch) throw new Error('the Spellbook tab shows the rune pouch');
  if (r.books.altar || !r.books.arceuus || r.books.now!=='arceuus' || !r.books.lunarLocked || !r.books.stillArc || !r.books.back) throw new Error('spellbooks change any time from the tab, locked ones stay locked '+JSON.stringify(r.books));
  if (!r.gClose) throw new Error('G again closes it');
  if (!(r.n.open && r.n.tab==='prayer' && r.n.ui==='playing')) throw new Error('N opens the Prayer tab '+JSON.stringify(r.n));
  if (!r.n.bury || !r.buried) throw new Error('bones are buried from the Prayer tab');
  if (!(r.compact.open && r.compact.tab==='spells' && !r.compact.compact && r.compact.shown)) throw new Error('the hotbar G button opens the tab, out of compact mode '+JSON.stringify(r.compact));
  if (!r.gone) throw new Error('the old spellbook and prayer menus are gone');
  if (!r.bench) throw new Error('the fletching bench enchants arrows '+r.ui);
};
