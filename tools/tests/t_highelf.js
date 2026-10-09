// RS-245: the high elf after Bakshi's - a circlet, almond eyes, high cheekbones and, out of armour, a long gold-hemmed robe
// under a mantle - and a tick on each figure slot that hides that piece on your figure while you still wear it
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    goToCharCreate(); G.chosenRace = RACES.findIndex(r=>r[0]==='High Elf'); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    const p = G.player, L = ()=>rsPlayerLook().o;
    for (const sl of ['head','chest','legs','arms','feet','cape']) G.gear[sl] = newItem();
    { const o = L(); out.robe = { outfit:o.outfit, trim:o.robeTrim, legWear:o.legWear||null, cape:o.cape, circlet:o.circlet, almond:o.almond, cheek:o.cheekbones }; }
    m3dInstance({}, rsPlayerLook());   /* (it builds) */
    G.gear.head = rsMakeArmour('metal', 2, 'head'); G.gear.chest = rsMakeArmour('metal', 2, 'chest');
    { const o = L(); out.armoured = { outfit:o.outfit, circlet:!!o.circlet, helm:o.helm }; }
    // untick the helm: still worn, still counted, but not on the figure - so the circlet shows again
    const ac0 = playerAC(), key0 = rsLookKey(); lookToggle('head');
    { const o = L(); out.hidden = { helm:o.helm||null, circlet:!!o.circlet, worn:!!(G.gear.head && G.gear.head.used), ac:playerAC()===ac0, keyChanged:rsLookKey()!==key0 }; }
    setUi('charsheet'); G.csPage = 'gear'; renderOverlay();
    const tick = document.querySelector('#overlay .doll-slot[data-slot="head"] .doll-tick'), tChest = document.querySelector('#overlay .doll-slot[data-slot="chest"] .doll-tick');
    out.ticks = { head:tick ? tick.classList.contains('on') : 'none', chest:tChest ? tChest.classList.contains('on') : 'none', ring:!!document.querySelector('#overlay .doll-slot[data-slot="ring1"] .doll-tick') };
    // a click on the tick toggles it back, and doesn't start a drag
    tick.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true, button:0 })); out.drag = !!CSD.on;
    document.querySelector('#overlay .doll-slot[data-slot="head"] .doll-tick').click(); out.back = { hidden:lookHidden('head'), helm:L().helm||null };
    setUi('playing');
    // a save without the field loads fine
    delete p.hideLook; out.noField = lookHidden('chest');
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.robe.outfit==='robe' && r.robe.trim && !r.robe.legWear && r.robe.cape && r.robe.circlet && r.robe.almond && r.robe.cheek, 'a high elf out of armour wears a long trimmed robe and mantle, a circlet, almond eyes');
  A(r.armoured.outfit==='plate' && !r.armoured.circlet && r.armoured.helm, 'in armour the robe and circlet give way');
  A(!r.hidden.helm && r.hidden.circlet && r.hidden.worn && r.hidden.ac && r.hidden.keyChanged, 'a hidden helm is still worn and counted, but not shown');
  A(r.ticks.head===false && r.ticks.chest===true && !r.ticks.ring, 'the figure slots carry ticks (none on rings)');
  A(!r.drag && !r.back.hidden && r.back.helm, 'the tick toggles back without starting a drag');
  A(r.noField===false, 'old saves show everything');
  console.log('highelf ok');
};
