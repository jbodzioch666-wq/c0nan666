// RS-479: dungeons look and feel more modern - each kind of place below ground its own grade (amber mines, green-grey crypts, violet
// sunken temples, torchlit castles, gold pyramids, red-lit lairs), darker between the torches with a faint cold fill and stronger
// torches, sparks, bone, slime or blood by what a blow strikes, dust where it misses, a beat's pause on a crit or a kill (no shake),
// and the camera easing in a little in a fight
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}; G.gameMode = 1;
    out.grades = {}; for (const k of ['dungeon', 'mine', 'graveyard', 'necro', 'temple', 'castle', 'pyramid', 'lair']){ G.siteKind = k; out.grades[k] = gfxGradeKey('fpd'); }
    G.gameMode = 2; out.field = gfxGradeKey('fpd');
    out.kinds = ['skeleton', 'iron golem', 'gray ooze', 'wraith', 'goblin'].map(nm=>fxStrikeKind({ nm, undead:/skeleton|wraith/.test(nm) }));
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = [];
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    await frames(15); out.amb = +FPD.amb.intensity.toFixed(3); out.ambBlue = FPD.amb.color.b > FPD.amb.color.r; out.zf0 = +(ISO.zf||1).toFixed(3);
    const P = G.player, spot = [[1,0],[-1,0],[0,1],[0,-1],[2,0],[0,2]].map(([a,b])=>[P.x+a, P.y+b]).find(([x,y])=>G.map[x][y]!==T_WALL);
    const m = newMonster(); Object.assign(m, { alive:1, x:spot[0], y:spot[1], hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, nm:'goblin', sym:'g', col:'#6a8a3a' }); G.mon.push(m); await frames(40); out.zf1 = +(ISO.zf||1).toFixed(3);
    FP.hitStop = 0.1; const t0 = FP.t; await frames(1); out.slowed = FP.t - t0 < 0.02;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const g = r.grades;
  A(g.mine==='mine' && g.graveyard==='crypt' && g.necro==='crypt' && g.temple==='sunken' && g.castle==='castle' && g.pyramid==='pyramid' && g.lair==='lair' && g.dungeon==='dungeon' && r.field==='neutral', 'each place below ground its own grade; a fight in the open keeps the neutral one');
  A(r.kinds.join(',')==='bone,spark,slime,spirit,flesh', 'a blow strikes bone, iron, slime, spirit or flesh');
  A(r.ambBlue && r.amb < 0.6, 'darker between the torches, a faint cold fill');
  A(r.zf0 > 0.98 && r.zf1 < 0.95, 'the camera eases in a little in a fight');
  A(r.slowed, "a heavy blow's beat of pause slows the world's motion");
};
