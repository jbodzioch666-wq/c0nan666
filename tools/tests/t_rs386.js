// RS-386: stools pulled in to their tables (and whoever sits on one sits there); arrows and bolts coloured in the bank and with
// a tooltip in the bank's pack; a seated robe drapes round its seat; interior posts stop short of the wall top and bed posts
// clear the panelling; on the open land you stand at the edge of a town's or site's tile, not inside its model
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    const out = {};
    // stools at the tables
    const L = ROOM_LAYOUT.tavern.benches, near = [];
    for (const [k,x,y] of L) if (k==='stool'){ const sp = benchSpot(k, x, y, 'tavern'); let bd = 9; for (const [bk,bx,by] of L) if (bk==='table'){ const tp = benchSpot('table', bx, by, 'tavern'); bd = Math.min(bd, Math.hypot(sp[0]-tp[0], sp[1]-tp[1])); } near.push(+bd.toFixed(2)); }
    out.stoolGap = near; const st = roomSeat('stool', 7, 9, 'tavern'), sp = benchSpot('stool', 7, 9, 'tavern'); out.seatAtStool = Math.hypot(st.x + 0.5 - sp[0], st.y + 0.5 - sp[1]) < 1e-6 && st.k==='stool';
    // the bank: ammo coloured, a quiver row with a tooltip
    const p = G.player; p.ammoStacks = Object.assign(p.ammoStacks||{}, { 1:25 }); out.q = quiverList().length; bankP().stash.push(Object.assign(rsMakeAmmo(0), { qty:20 }));
    enterVillage(); setUi('bank'); renderGame(); await new Promise(r=>setTimeout(r, 200));
    const ov = document.getElementById('overlay'), rows = [...ov.querySelectorAll('.invrow')];
    const qrow = rows.find(e=>/quiver/.test(e.textContent)), brow = [...document.querySelectorAll('#bankListBox .invrow')].find(e=>/×20/.test(e.textContent));
    out.quiverTip = !!(qrow && /showItemTooltip/.test(qrow.getAttribute('onmouseenter')||'')); out.bankCol = !!(brow && /color:/.test(brow.innerHTML));
    setUi('playing');
    // the tavern: posts, beds, a seated robe round its seat
    enterInterior('tavern'); setUi('playing'); await frames(10);
    { let wallTop = 0, postTops = []; V3.world.traverse(o=>{ if (o.isMesh && o.geometry.type==='BoxGeometry'){ const h = o.geometry.parameters.height, w = o.geometry.parameters.width, d = o.geometry.parameters.depth; if (Math.abs(w - 0.14) < 1e-6 && Math.abs(d - 0.14) < 1e-6 && h > 2) postTops.push(+(o.position.y + h/2).toFixed(3)); if ((w > 5 || d > 5) && h > 2) wallTop = Math.max(wallTop, o.position.y + h/2); } }); out.postTops = [...new Set(postTops)]; out.wallTop = +wallTop.toFixed(3); out.posts = postTops.length; }
    { const hooded = V3.npcs.find(q=>q.n.service==='hooded'), r2 = hooded.e.rig; hooded.g.position.set(hooded.n.seat.x + 0.5 - Math.sin(hooded.n.seat.yaw)*0.06, 0, hooded.n.seat.y + 0.5 - Math.cos(hooded.n.seat.yaw)*0.06); v3SeatPose(hooded, hooded.n.seat);
      const B = r2.seatBox, m = r2.skirt; out.seatBox = !!B; if (B && m){ m.updateMatrixWorld(true); const P = m.geometry.attributes.position, v = new THREE.Vector3(), cy = Math.cos(B.yaw), sy = Math.sin(B.yaw); let inside = 0;
        for (let i=0;i<P.count;i++){ v.fromBufferAttribute(P, i).applyMatrix4(m.matrixWorld); if (v.y > B.top) continue; const dx = v.x - B.x, dz = v.z - B.z, lx = dx*cy - dz*sy, lz = dx*sy + dz*cy; if (Math.abs(lx) < B.hw - 0.005 && lz < -0.005 && lz > -B.hd + 0.005) inside++; } out.robeInSeat = inside; } }
    // the open land: on a town's tile you stand at its edge
    G.interior = null; G.gameMode = 0; setUi('playing'); await frames(3);
    const tw = { x:G.owPos.x, y:G.owPos.y }; O3.prevTile = [tw.x - 1, tw.y]; O3.tileKey = tw.x+','+tw.y; const off = o3SiteStandOff(tw.x, tw.y);
    out.townTile = G.ow.map[tw.x][tw.y]===OW_TOWN; out.off = off && off.map(v=>+v.toFixed(2));
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.stoolGap.length >= 6 && r.stoolGap.every(d=>d < 0.7), 'every stool stands pulled in to its table: '+r.stoolGap);
  A(r.seatAtStool, 'and the seat is where the stool is');
  A(r.quiverTip && r.bankCol, 'arrows in the bank keep their colour; the quiver rows in the bank\'s pack have a tooltip');
  A(r.posts >= 4 && r.postTops.every(t=>t < r.wallTop - 0.005), 'the wall posts stop short of the wall top');
  A(r.seatBox && r.robeInSeat===0, 'a seated robe drapes round the seat, not through it: '+r.robeInSeat);
  A(r.townTile && r.off && Math.abs(r.off[0] + 0.72) < 0.01 && Math.abs(r.off[1]) < 0.01, 'on a town tile you stand at its edge, on the side you came from');
};
