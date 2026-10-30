// RS-772: bent over below ground - stooped over a cave herb patch, or down on a knee burying bones - the back came up through the cape:
// the stoop came after the cape and robe were hung for standing. Now the player's cape and robe hang after the last bend, below ground
// and on the open land, whatever bends you. Every body and robe point (skinned too) behind the cape, standing and stooped, for a tiefling
// woman broad in the shoulders and chest (the player's own). The probe t_zingrid does it on a save (ZSAVE) with a shot from behind
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const out = {};
    goToCharCreate(); G.chosenRace = RACES.findIndex(r=>r[0]==='Tiefling'); G.ccLook = Object.assign(lookDefault('Tiefling'), { body:1, build:1, hair:2, bd:{ frame:0, fat:0, muscle:0, shoulders:1, chest:1, waist:0, hips:0, neck:0.7, head:0.01, legs:0.7, arms:0.42, height:0.5, posture:0 } });   /* (the player's own: a tiefling woman, broad in the shoulders and chest) */ ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.chest = rsMakeArmour('cloth', 3, 'chest'); G.gear.legs = rsMakeArmour('cloth', 3, 'legs'); G.gear.head = rsMakeArmour('cloth', 3, 'head'); G.gear.cape = rsMakeCape(113, 'Fire Cape'); G.gear.weapon = rsMakeStaff(1); G.gear.offhand = rsMakeArmour('cloth', 3, 'offhand');
    skP().skills.foraging = 2e6; G.player.clock = 60;
    /* every point of the body and the robe that lies behind the cape (in the cape's frame, -z is out from the back) */
    const through = e=>{ const rg = e.rig, c = rg.cape; e.holder.updateMatrixWorld(true); const Ac = c.geometry.attributes.position.array, ci = c.matrixWorld.clone().invert(), v = new THREE.Vector3();
      const capeZ = (x, y)=>{ let best = null, bd = 1e9; for (let k=0;k<Ac.length/3;k++){ const d = Math.hypot(Ac[k*3] - x, Ac[k*3+1] - y); if (d < bd){ bd = d; best = Ac[k*3+2]; } } return bd < 0.03 ? best : null; };
      let n = 0, tot = 0, worst = 0; e.holder.traverse(o=>{ if (!o.isMesh || !o.visible || !o.geometry.attributes.position) return; let robe = false; for (let pa = o; pa; pa = pa.parent) if (pa===rg.skirt) robe = true; if (!(robe || (o.isSkinnedMesh && !/hair/i.test(o.name||'')))) return;   /* (the body and the robe - gear slung on the back and a lantern lie over the cape, hair may fall over it) */
        const q = o.geometry.attributes.position; for (let k=0;k<q.count;k++){ if (o.isSkinnedMesh) o.getVertexPosition(k, v); else v.fromBufferAttribute(q, k); v.applyMatrix4(o.matrixWorld).applyMatrix4(ci); const cz = capeZ(v.x, v.y); if (cz===null) continue; tot++; if (v.z < cz - 0.002){ n++; worst = Math.max(worst, cz - v.z); } } });
      return { n, tot, worst:+worst.toFixed(3), bend:+(rg.torso.rotation.x).toFixed(2) }; };
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    /* below ground */
    let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON && !owSeaSite(x, y)){ dx = x; dy = y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(m=>m.alive = false); G.mon = [];
    const p = G.player, D = G.dungeonDeco; let at = null; for (const [i,j] of [[1,0],[-1,0],[0,1],[0,-1]]) if (!at && G.map[p.x+i][p.y+j]===T_FLOOR && !D[p.x+i][p.y+j]) at = [p.x+i, p.y+j];
    D[at[0]][at[1]] = 'cavherb'; G.veinLeft = G.veinLeft || {}; G.veinLeft[G.dungeonSlot+'/'+G.depth+':'+at[0]+','+at[1]] = 99;
    ISO.rot = 0; await fr(30); out.stand = through(ISO.player);
    const o = skOptions().find(o=>o.vein && o.vein.x===at[0] && o.vein.y===at[1]); if (!o) return { noOpt:true };
    skDo(o); out.herb = []; for (let k=0;k<4;k++){ await fr(8); if (!G.gather) skDo(o); out.herb.push(through(ISO.player)); }
    skStop && skStop(); G.gather = null; await fr(20);
    PFX.bury = performance.now()/1000; await fr(12); out.bury = through(ISO.player);
    /* the open land: burying bones */
    G.gameMode = 0; G.interior = null; setUi('playing'); await fr(30); out.owStand = through(O3.player.e);
    PFX.bury = performance.now()/1000; await fr(12); out.owBury = through(O3.player.e);
    return out; });
  console.log(JSON.stringify(r));
  A(!r.noOpt, 'a cave herb patch to pick');
  A(r.stand.tot > 1000 && r.stand.worst < 0.05 && r.stand.n < 80, 'standing below ground, the cape over the back: ' + JSON.stringify(r.stand));
  A(r.herb.every(h=>h.bend > 0.6 && h.tot > 1000 && h.worst < 0.05 && h.n < 40), 'stooped over the herbs, the back under the cape: ' + JSON.stringify(r.herb));
  A(r.bury.bend > 0.6 && r.bury.worst < 0.05 && r.bury.n < 40, 'burying bones below ground: ' + JSON.stringify(r.bury));
  A(r.owBury.bend > 0.6 && r.owBury.worst < 0.05 && r.owBury.n < 40, 'burying bones on the open land: ' + JSON.stringify(r.owBury));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
