// RS-492: a cape's emblem is chosen on its own at the dye works - any device you know, on any cape (a plain red one too), in its own
// colour - and left unchosen it follows your shield's; and a new emblem shows at once (the figure used to wait for a change of gear)
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player, out = {}, lk = ()=>rsPlayerLook().o;
    G.gear.cape = rsMakeCape(0, 'Red Cape'); G.player.rsLastType = 'melee'; rsSync && rsSync();
    out.plainBefore = lk().capeEm || null;
    const k0 = rsLookKey(); capeEmblemPick('cross'); out.cross = lk().capeEm; out.keyMoved = rsLookKey()!==k0;
    { const e = m3dInstance({}, rsPlayerLook()); let mapped = false; e.holder.traverse(x=>{ if (x.isMesh && x.material && x.material.map && x.material.map.isCanvasTexture && x.material.map.image && x.material.map.image.width >= 256) mapped = true; }); out.painted = mapped; }
    emblemPick('bend'); out.shieldApart = lk().capeEm;   /* (bend may be locked at tier 0 - either way the cape keeps its own) */
    capeEmblemPick('chevron2'); out.locked = p.capeEmblem;   /* (a device you haven't learned is refused) */
    capeEmblemPick('plain'); out.plain = lk().capeEm || null;
    const d = DYES[0]; skAdd('dye_' + d[0], 2); capeEmblemPick('cross'); capeEmblemDye(d[0]); out.dyed = lk().capeEmCol===d[2]; out.shieldDye = p.emblemDye || null;
    capeEmblemPick(null); G.gear.cape = rsMakeCape(0, 'Black Cape'); out.follows = [lk().capeEm, p.emblem || null];
    setUi('dyeworks'); out.ui = /CAPE EMBLEM/.test(buildDyeWorks()) && /SHIELD EMBLEM/.test(buildDyeWorks());
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.plainBefore===null, 'a plain red cape bears no emblem of its own');
  A(r.cross==='cross' && r.keyMoved && r.painted, 'a cross chosen for it shows at once');
  A(r.shieldApart==='cross', 'changing the shield emblem leaves the cape\'s');
  A(r.locked==='cross', 'a device not yet learned is refused');
  A(r.plain===null, 'plain unpicks it');
  A(r.dyed && r.shieldDye===null, 'the cape emblem takes its own dye, the shield\'s untouched');
  A(r.ui, 'the dye works offers both the shield and the cape emblem');
};
