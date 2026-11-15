// RS-400: the skeleton's studio renderer (a second WebGL context drawing it to a canvas for the old first-person view) and the
// raycaster's frame buffer are gone; a skeleton still stands in the dungeon as a built figure from the same template
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<150 && !SK3.ok;i++) await new Promise(r=>setTimeout(r, 200));
    const p = G.player; let gx = p.x+1, gy = p.y; if (G.map[gx][gy]!==T_FLOOR){ gx = p.x; gy = p.y+1; }
    const m = { nm:'skeleton warrior', alive:true, hp:9, maxHp:9, x:gx, y:gy, sym:'s', col:'#ddd', undead:true }; G.mon.push(m);
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const e = M3D.inst.get(m), out = { built:!!SK3.ok, noStudio:SK3.r===undefined && SK3.scene===undefined && SK3.cv===undefined, noSprite:typeof sk3Sprite==='undefined', noBuffer:typeof fpEnsureBuffer==='undefined' && FP.off===undefined && FP.img===undefined,
      figure:!!(e && e.sk && e.holder.parent===FPD.scene), inScene:!!(e && M3D.live.has(e)) };
    let gl = 0; for (const c of document.querySelectorAll('canvas')){ try{ if (c.getContext('webgl2') || c.getContext('webgl')) gl++; }catch(err){} } out.glCanvases = gl;
    G.mon = G.mon.filter(q=>q!==m); return out;
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.built && r.figure && r.inScene, 'a skeleton still stands in the dungeon as a built figure');
  A(r.noStudio && r.noSprite, 'the studio renderer and the sprite path are gone');
  A(r.noBuffer, 'the raycaster\'s frame buffer is gone');
};
