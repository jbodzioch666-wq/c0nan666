// RS-581: no screen-edge flashes unless you ask for them, and a settings page in tabs with sliders for the picture. The red, green
// and gold edges (hurt, healed, a level) and the red low-life pulse are off by default; the big spells' flash can be switched off;
// brightness, contrast, colour, glow and vignette sliders go over each place's own grade, live as you drag; a render resolution slider
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, U = { vig2:{}, hurt:{}, heal:{}, glow:{}, fade:{}, flashK:{}, flashC:{ value:new THREE.Vector3() } };
    out.def = { edge:SET_DEF.edgeFx, low:SET_DEF.lowHpFx, spell:SET_DEF.spellFlash, now:SET.edgeFx };
    /* the dungeon frame's edges: healed, hurt and low on life, with the defaults and then switched on */
    const p = G.player; p.maxHp = 100; p.hp = 20; FP.hurt = 1; FP.heal = 1; FP.glow = 1; ISO.flash = { col:'#ffffff', t:0.1 };
    gfxFpdPost(U); out.off = { hurt:U.hurt.value, heal:U.heal.value, glow:U.glow.value, flash:U.flashK.value };
    SET.edgeFx = true; SET.lowHpFx = true; gfxFpdPost(U); out.on = { hurt:U.hurt.value, heal:U.heal.value, glow:U.glow.value };
    SET.spellFlash = false; gfxFpdPost(U); out.spellOff = U.flashK.value; SET.edgeFx = false; SET.lowHpFx = false; SET.spellFlash = true; ISO.flash = null;
    /* the page: each tab and what it holds */
    G.setBack = 'playing'; out.tabs = {};
    for (const t of ['sound', 'graphics', 'picture', 'effects', 'ui']){ G.setTab = t; setUi('settings'); await new Promise(r=>setTimeout(r, 50)); const ov = document.getElementById('overlay') || document.body;
      out.tabs[t] = { sliders:ov.querySelectorAll('.setrow input[type=range]').length, tabs:ov.querySelectorAll('.settabs > button').length, on:(ov.querySelector('.settabs > button.on')||{}).textContent }; }
    /* a picture slider moves the picture as you drag, and is kept when you let go */
    G.setTab = 'picture'; setUi('settings'); await new Promise(r=>setTimeout(r, 50));
    const rows = [...document.querySelectorAll('.setrow')], br = rows.find(x=>/brightness/.test(x.textContent)), inp = br && br.querySelector('input');
    if (inp){ inp.value = 1.3; inp.dispatchEvent(new Event('input', { bubbles:true })); out.live = SET.bright; out.label = inp.nextElementSibling.textContent; inp.dispatchEvent(new Event('change', { bubbles:true })); out.kept = JSON.parse(localStorage.getItem('depthcrawl_settings')).bright; }
    out.k = { bright:gfxSetK('bright', 0.5, 1.6), clampHi:(SET.bright = 9, gfxSetK('bright', 0.5, 1.6)), unset:(delete SET.bright, gfxSetK('bright', 0.5, 1.6)) };
    /* the render resolution */
    SET.res = 1; const pr1 = gfxPR(); SET.res = 0.5; const pr2 = gfxPR(); SET.res = 0.1; const pr3 = gfxPR(); SET.res = 1; out.res = [+(pr2/pr1).toFixed(2), +(pr3/pr1).toFixed(2)];
    setUi('playing'); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.def.edge===false && r.def.low===false && r.def.spell===true && !r.def.now, 'the edges are off by default, the spell flash on');
  A(r.off.hurt===0 && r.off.heal===0 && r.off.glow===0 && r.off.flash > 0, 'by default no edge lights up, hurt, healed, levelled or low on life');
  A(r.on.hurt > 0.3 && r.on.heal > 0.3 && r.on.glow > 0.3, 'switched on, they do');
  A(r.spellOff===0, 'the spell flash can be switched off');
  A(Object.values(r.tabs).every(t=>t.tabs===5), 'five tabs on every page: ' + JSON.stringify(r.tabs));
  A(r.tabs.sound.sliders===5 && r.tabs.picture.sliders===5 && r.tabs.graphics.sliders >= 1 && r.tabs.ui.sliders >= 1, 'the sliders: five volumes, five for the picture, the resolution, the interface size');
  A(r.tabs.picture.on==='PICTURE' && r.tabs.effects.on==='EFFECTS', 'the open tab is marked');
  A(r.live===1.3 && r.label==='130%' && r.kept===1.3, 'a picture slider changes the picture as you drag and is kept');
  A(r.k.clampHi===1.6 && r.k.unset===1, 'the sliders stay in range, and an old save without them looks as before');
  A(r.res[0]===0.5 && r.res[1]===0.5, 'the render resolution scales the pixels, to half at least: ' + r.res);
};
