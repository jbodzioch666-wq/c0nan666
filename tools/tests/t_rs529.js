// RS-529: face sliders - jaw, chin, cheeks, brow, nose length and width, mouth, lips and age - in the character creator and at the
// barber's, each its own sculpt of the head; at their defaults the face is the one you had (and monsters keep theirs); age lines the
// face from a young adult on; the preview closes on the face while you shape it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {};
    goToCharCreate(); renderOverlay(); saveCurrentGame = ()=>{};
    const heads = document.querySelectorAll('#overlay .bdhead'); out.sections = [...heads].map(h=>h.textContent.trim().split(' ')[0]);
    out.faceSliders = [...document.querySelectorAll('#overlay .bdrow input')].filter(i=>LOOK_FACE.some(f=>f[0]===i.dataset.k) && i.getAttribute('onchange').startsWith('lookFaceSet')).length;
    /* defaults are the face you had: no face spec, the old sculpt key */
    out.none = m3dFaceSpec(null)===null && m3dFaceSpec(lookFace({}))===null;
    const box = g=>{ g.computeBoundingBox(); return g.boundingBox; }, span = (g, ax)=>{ const p = g.attributes.position; let lo = 1, hi = -1; for (let i=0;i<p.count;i++){ if (p.getY(i) > 0.04 || p.getY(i) < 0.01 || p.getZ(i) < 0.03) continue; const v = p.getX(i); lo = Math.min(lo, v); hi = Math.max(hi, v); } return hi - lo; };   /* (across the lower face, below the ears)*/
    const H = fc=>m3dHeadGeo('human', false, m3dFaceSpec(Object.assign({}, M3D_FACE0, fc)));
    const base = m3dHeadGeo('human', false), wide = H({ jaw:1 }), narrow = H({ jaw:0 }), longN = H({ noseLen:1 }), shortN = H({ noseLen:0 }), old = H({ age:1 });
    out.sameAsBefore = H({})===base;
    out.jaw = [span(narrow, 'x'), span(base, 'x'), span(wide, 'x')].map(v=>+v.toFixed(4));
    out.nose = [box(shortN).max.z, box(base).max.z, box(longN).max.z].map(v=>+v.toFixed(4));
    out.oldVerts = old.attributes.position.count!==base.attributes.position.count;
    out.monster = m3dHeadGeo('golem', false)===m3dHeadGeo('golem', false, null);
    /* the slider sets the look, the preview zooms in on the face, and the character is made with it */
    LP.zoom = 1; lookFaceSet('chin', 0.9); out.set = lookFace(lookTarget()).chin===0.9; out.zoomed = LP.zoom > 2;
    lookFaceRandom(); const F = lookFace(lookTarget()); out.random = LOOK_FACE.every(([k])=>F[k] >= 0 && F[k] <= 1) && F.age <= 0.7;
    lookFaceReset(); out.reset = !lookTarget().fc; LP.zoom = 1; lookFaceZoom(); out.zoomToggle = LP.zoom; lookFaceZoom();
    lookFaceSet('age', 1); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const pt = rsPlayerLook(); out.made = pt.o.face && pt.o.face.age===1 && G.player.look.fc.age===1;
    openMakeover(); renderOverlay(); out.barber = [...document.querySelectorAll('#overlay .bdhead')].some(h=>/FACE/.test(h.textContent)); lookFaceSet('jaw', 0.2); out.free = makeoverCost()===0; makeoverConfirm(); out.kept = G.player.look.fc && G.player.look.fc.jaw===0.2;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.sections.join(',')==='BUILD,FACE' && r.faceSliders===9, 'a FACE section of nine sliders under the build');
  A(r.none && r.sameAsBefore && r.monster, 'at the defaults the face is the one you had, and monsters keep theirs');
  A(r.jaw[0] < r.jaw[1] && r.jaw[1] < r.jaw[2], 'the jaw slider widens the lower face');
  A(r.nose[0] < r.nose[1] && r.nose[1] < r.nose[2], 'the nose slider lengthens the nose');
  A(r.oldVerts, 'age lines the face');
  A(r.set && r.zoomed && r.random && r.reset && r.zoomToggle > 2, 'the sliders set the face, close the preview in on it; random and reset');
  A(r.made && r.barber && r.free && r.kept, 'the character is made with the face, and the barber reshapes it for nothing');
};
