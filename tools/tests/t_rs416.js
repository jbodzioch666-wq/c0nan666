// RS-416: the watch's torch burns with a sconce-sized flame; the dungeon doorways' arches spring higher, in the floor's own pillar
// stone, the doors cut to them; and a woman's clothes lie flat across her front below the belt, not round her like a tyre
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const T = THREE, out = {};
    // the torch
    V3.flames = V3.flames || []; V3.lamps = V3.lamps || []; const p = { g:new T.Group() }, tg = v3GuardTorch(p); let fs = 1; for (let o = tg.flame; o && o!==tg; o = o.parent) fs *= o.scale.x; out.flame = +fs.toFixed(2);
    // the arches, on a dungeon floor
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); FPD.mapRef = null;
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const g = isoPropModel({ x:0, y:0, kind:'dress', d:'door', rot:0, side:1 }); let arch = 0, trim = 0, plankTop = 0;
    g.updateMatrixWorld(true); g.traverse(o=>{ if (o.isMesh && o.geometry.type==='ExtrudeGeometry'){ const bb = new T.Box3().setFromObject(o); if (bb.min.y > 0.6){ arch++; if (o.material===FPD.trimMat) trim++; } else if (bb.max.y > plankTop && bb.min.y < 0.05) plankTop = bb.max.y; } });
    out.arch = { arch, trim, plankTop:+plankTop.toFixed(3), haveTrim:!!FPD.trimMat };
    // her clothes, front to back below the belt, against his
    const front = (fem)=>{ const geo = m3dWearGeo(m3dBodySpec({ fem }), 'jerkin', 'bot'), pa = geo.attributes.position;   /* (RS-524: sculpted to a body spec) */ let z = -9; for (let i=0;i<pa.count;i++){ const y = pa.getY(i); if (y < -0.02 && y > -0.07 && Math.abs(pa.getX(i)) < 0.03) z = Math.max(z, pa.getZ(i)); } return +z.toFixed(4); };
    out.front = { f:front(true), m:front(false) };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.flame <= 0.5, 'the watch\'s torch flame is a sconce torch\'s size');
  A(r.arch.haveTrim && r.arch.arch >= 9 && r.arch.trim===r.arch.arch, 'the arch is built of the floor\'s own pillar stone');
  A(r.arch.plankTop > 0.85, 'the door is as tall as the higher arch: '+r.arch.plankTop);
  A(r.front.f < r.front.m - 0.008, 'her clothes lie flatter across her front than his');
};
