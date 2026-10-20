# Depthcrawl tests

These tests open `depthcrawl.html` in Chromium through Playwright and play through each system. Each `t_<name>.js` exports `async (page) => {}` and throws if something is wrong. The runner also fails a test if the page logs any error.

## Setup (once)

```
cd tools/tests
npm install
npx playwright install chromium
```

## Running

```
node tools/tests/run.js              # every test
node tools/tests/run.js town eco     # just these
node tools/tests/run.js --headed     # in a visible window: the GPU draws the 3D, fastest on a desktop
node tools/tests/run.js --soft       # software WebGL, for machines with no GPU (slow)
node tools/tests/run.js --timeout=40 # minutes allowed per test (default 20)
```

Screenshots go to `tools/tests/shots/`.

| test | covers |
|---|---|
| boot | the page loads and a character starts |
| rs586 | a hearth fire with logs, embers and shader flames in an open firebox; the sage hat's moon and stars in the trim dye; the robe's cord at the middle of the waist; the shut tome held in the palm |
| rs585 | the dye works: a tome's emblem and clasp as its trim, on both covers; every dyeable unique has a trim that shows; worn gear only; the book shut; the staff up in the palm |
| rs584 | lakes are fresh water: lake spots with river fish, no sea spots or platforms, no surf or gulls; the sea keeps its own; the bar names the land after the time |
| rs583 | the finish textures made at boot in workers, to the byte the generator's, kept in the cache for the next session; the first town's people sculpted over frames after the town shows, with their plates and clicks |
| rs582 | a town's scene parked while you're in a building and put straight back on the way out; back from the land the same houses, new people; a siege staged in town leaves the scene alone; a forced rebuild still rebuilds |
| rs581 | no screen-edge flashes unless asked for; the settings page in five tabs, picture sliders live as you drag and kept, the render resolution |
| rs580 | instanced meshes culled by a sphere round all their instances: a town's palisade is drawn from every side of the town |
| rs579 | the atlas tiles are read from their own row: a spider rendered close up shows its fur, against the same spider flat |
| rs578 | one material for a figure: the finish textures in one atlas, each vertex carrying its tile, roughness, metalness and skin flag; a figure one skinned mesh plus its eyes, a prop one mesh, a townsperson in nine draws or fewer |
| rs577 | lighter land: still things stop recomputing their matrices (unfrozen when they move), plants drawn only within sight (none in view missing), cloth stepped at most sixty times a second |
| rs576 | steadier town frames: no shadows from tiny parts (figures, town), the town sun shadow round what is in view, background work in idle time in short slices, room boards painted ahead a few rows a step (same picture) |
| rs575 | lighter frames: animals and beasts off screen leave the frame (hidden, matrices skipped) and come back up to date in view; your figure sculpted lighter out in the world on every machine (see rs563) |
| rs574 | three.js r159 drawing as r149 did: colour management off, old light units, custom shaders on the new chunk names, instanced/skinned meshes culled by their own geometry, shaders started at once (three compile + isReady) |
| rs572 | a floor loads without long freezes: the parallel link returns at once and draws the same pixels, creatures sculpted a slice a frame behind the card, the chart painted a few ms a step (same picture) |
| rs571 | shaders load faster: a point shadow takes 5 samples round one cubeToUV (was 9 cubeToUVs), every program started at once and linked off the frame (KHR_parallel_shader_compile), no sun below ground |
| rs570 | the skeleton sculpted a few ms a tick with the cache cold (no long stall); hill towns terrace only their buildings, not trees; no woodcutting trees against a town; roads stop at its edge; its pad level with the ground round it |
| rs569 | a sunken temple is laid out as the plain dungeons are: whole rooms and one-tile passages, no loose columns, doorways, all reachable; the sanctum keeps its drowned idol and pools |
| rs568 | the catacombs under a graveyard are laid out as the plain dungeons are: whole burial chambers and one-tile passages, no pillars, doorways, all reachable, still niche-walled with bones and candles |
| rs566 | waterfalls come down the mountains in steps - pools on rock ledges, curtains over the lips - into the river; the water never climbs or sinks into the ground |
| rs565 | Rivers run downstream: each river tile knows its flow (walked back from the sea), and the ripples stream that way |
| rs564 | A tap on a phone leaves no hover box (the made-up mouse move no longer sets the hover spot) |
| rs563 | The phone tier draws less: 3D pixel density capped at 1.75, your own figure sculpted on a coarser grid |
| rs561 | Living details below ground: cobwebs that tremble, chains that swing, rats that scatter, water dripping from the ceiling |
| rs560 | Rooms dressed by purpose: guard rooms, shrines, flooded halls, collapsed passages, stores, root-hung rooms; the solid decos block and never cut a way off |
| rs559 | Stone materials: cracks, worn patches, moss in damp joints, specular maps from the height, wet floors in the catacombs, temples and swamps |
| rs558 | Bloom tuned per site: each underground grade has its own threshold and glow width |
| rs557 | Dungeon ambient occlusion: a half-size depth prepass, twelve-tap occlusion, blurred and multiplied in before the bloom; high setting only |
| rs556 | Dungeon fog and dust: floor mist in caves and crypts, dust that burns in torchlight, a haze of light round each torch |
| rs555 | Butterflies over the flower fields by day and fireflies by night, each one instanced mesh flown on the card |
| rs554 | Painterly grade: golden fields, blue-green woods, a sickly swamp; a painted haze on the distant land; light shafts in a foggy morning |
| rs553 | Plants lean downwind by the gust, waves roll across the grass in the wind's direction, fallen leaves blow downwind |
| rs552 | Water: sun glints, the banks reflected along shores, lily pads on calm water above the waves, reeds at the edge of lakes and rivers |
| rs551 | Cloud shadows drift with the wind (faster in a storm), denser in rain, and fall on the water, roads, leaves and grass as well as the ground |
| rs550 | Painted ground: wandering tile borders, dry and damp washes, sand on beaches and dunes, roads as worn tracks; off on low and phone; GPU cost measured |
| rs549 | Jerkins, hauberks and tunics drape over a heavy body, a woman's hauberk clears her thighs, a tunic skirt in its top's cloth; cloaks hang outside what the body wears |
| rs548 | The robe in one piece: its cloth from the hem up to under the bust over the bodice, no seam at the hips, the cord at the natural waist, turning with the torso |
| rs547 | Robes fall over the hips (no bulge below the belt), meet the bodice front and back, no pinched waist, pot belly in the cloth's shade; rope dreadlocks; mohawk crest |
| rs546 | Nothing worn but what you wear (underclothes in the world, no shirt or trouser pickers); the robe one garment - skirt in the bodice's cloth, a cord, a drape over a heavy body |
| rs544 | Arms and sides across builds: mail sleeves on a hauberk, a jerkin skirt wide enough for heavy hips, arms hanging clear of a heavy body |
| rs543 | Every hairstyle as cards: plaited braids, rope dreadlocks, coiled curls, a standing mohawk crest, a topknot with a wound bun; soft nape fringe |
| rs542 | The creator shows you in linen underclothes cut from the body (briefs from the hips alone, RS-545; a band round a woman's breasts, bent with a stoop), bare feet; dressed again out of it |
| rs541 | Plate fitted to the limbs at every build: poleyn and couter cup the joints (no balls), greave follows the calf, vambrace as thick as the forearm |
| rs540 | Hair moves: hairW weights along the cards, a sway that trails the head on a spring and settles, each figure its own, compiled on the GPU |
| rs539 | Hair finished: scalp under the cards on the hairline, long hair parted and over the ears, swept and ponytail combed back, hair from under helmets, shine kept in the world |
| rs538 | Armour fits the build: belts round the body, robe waists and skirts as wide as the body, tabards laid on chest and belly |
| rs537 | Hair as cards in combed rows (alpha-cut strand clumps, soft second pass, Kajiya-Kay shine); beards too |
| rs536 | Beasts and dragons die on their side, legs out of their bodies, hips square (no rump in the air) |
| rs534 | An empty off hand rests open (closes on shield, tome, blade, bow, two-hand grip); shod feet wear a made boot |
| rs533 | Hair, brows and beards in a streaked hair finish with sheen; more, finer locks drawn to points; beasts keep fur |
| rs532 | Eye sliders: size and spacing, sockets, lids and eyeballs moving together; defaults unchanged |
| rs531 | Muscle shows: chest, traps, delts, lats, arms, thighs and calves swell from soft to hard; sleeves fit; default unchanged |
| rs530 | No flat cards on the face: square jaw sculpted, scars and paint laid on the skin, moustaches of strands |
| rs529 | Face sliders (jaw, chin, cheeks, brow, nose, nose width, mouth, lips, age) in the creator and at the barber's; defaults keep the old face |
| rs528 | Skin shading: a warm subsurface shader for skin, and a flush in the cheeks, nose, ears and lips of flesh faces |
| rs527 | The appearance preview frames every race head to foot (hats and boots included); zoom still finds the face |
| rs526 | The creation screen's race is a picker (arrows, gift, skills, dots); the starting stats row is gone |
| rs525 | Body sliders in the creator and at the barber's (free): presets, random build, reset; the preview sculpts the new figure over frames |
| rs524 | Bodies sculpted to a build (weight, muscle, shoulders, chest, waist, hips, neck, head, legs, arms, height, posture); garments fit every build; old looks default |
| rs523 | A staff with a shield is held in one hand, the shield up on the other arm (it was held like a book) |
| rs522 | Robes as heavy wool (Gandalf in Bakshi's film), finer each tier, Ahrim's billowing; the hem stirs in the wind outdoors, more in a storm |
| rs521 | A far tile change works out the regions, far ground and land normals a little a frame - same results, worst frame at 4x well under 350ms |
| rs520 | A creature kind never seen is built in slices: sculpts splatted and meshed a layer at a time, the build run as a survey, not every frame |
| rs519 | Duergar scouts shoot crossbows (bolts at the loose); old Archers given the kit's quiver once |
| rs518 | Tome icons per tier with your device; the hotbar ranged button shows your own bow or crossbow |
| rs517 | Weapons, staves, bows, crossbows, thrown and jewellery icons drawn per kind and tier, all distinct |
| rs516 | Robe skirts as cloth near you: trail when walking, flare on turns, settle, legs inside; far folk posed |
| rs514 | A worn piece tapped on the figure is described at the bottom, with a take-off button |
| rs513 | Paper doll icons drawn per family and tier (helms, bodies, robes, legs, gloves, boots, capes, shields), dye and emblem shown |
| rs511 | Trousers finer each tier (cuffs, seam runes, gold, green), their trim dyeable |
| rs510 | Every robe takes a trim dye; a plain robe gains a trim band in the dye |
| rs509 | The robe one piece to the ankles over any legs; robe bottoms are trousers; old saves' pieces renamed |
| rs508 | Casts-left worked out once per change of bag, staff or turn, still following the bag at once |
| rs507 | Bending tubes (tails, tentacles, serpents) take normals from the cross-section; bounds every 20th bend |
| rs506 | A tile changing far off rebuilds the land in slices, not in one 1.5s frame at a phone's pace |
| rs505 | A long open-land walk at a phone's pace: land rebuilds start early and speed up, no loading warm-up mid-walk |
| rs504 | skP defaults once per player (the HUD asks every frame); villager cloaks at four solver passes |
| rs503 | Mid-play shader warms sip frames without the card; the freeze sweep skips unchanged land; cache writes in sips |
| rs502 | Deeper floors reuse the first floor's shaders: warm-once materials and a padded, steady light count |
| rs501 | The placed land frozen out of the per-frame matrix walk, its matrices still exact; animated pieces and beasts live |
| rs500 | Sculpts cached in IndexedDB: a warm session rebuilds figures byte-identical with no sculpting at all |
| rs499 | Dungeon and town entry compile their shaders in slices under the loading card instead of one page-freezing call |
| rs498 | The cloth maths gone fast with the same folds: fast normals match three.js, cape bounds measured once |
| rs497 | Zoom on the dye works and barber figure: wheel, pinch and +/- buttons, panned by dragging while zoomed |
| rs495 | A trim dye on the whole cape perimeter and embroidery, a robe's hem runes, a tabard's device and a hat's glow |
| rs494 | You at 540 x 659 (RS-496) on the left of the dye works, redressed as you dye, stacked on a phone |
| rs493 | Gear trims (body bands, helm bands, coif stitching, hat band, cape hem, shield rim) dyed on their own |
| rs492 | A cape emblem chosen and dyed on its own at the dye works, on any cape, shown at once |
| rs491 | The Archer kit's leather quiver on the back (and monster archers'), and a put-away bow across the back |
| rs490 | A crossbow with its own model, shouldered and aimed at the foe, loosed with a kick, then spanned and reloaded |
| rs489 | A bow drawn at an archer's pace with the arrow leaving at the loose, the drawing elbow up and back |
| rs488 | The bow in the left hand, the arrow on its thumb, the bow arm raised at the foe (yours at a monster, an archer at you) |
| rs487 | A bow drawn to the cheek with a bent string and a nocked arrow, the bow arm on the mark, then loosed |
| rs486 | The sun moves in small steps, so the land's shadows hold still between them, yet still swing over the day |
| rs485 | Towns on the land are built in their race's style and sized by village, town or city, with a plate saying so |
| rs483 | The title screen's import is the page's own any-file picker; save files and save-code text files both import |
| rs482 | A save copied as a text code and pasted back brings the adventurer back; a pasted save file works too |
| rs481 | The lantern casts no shadows and torch shadows are only redrawn while something moves |
| rs479 | A grade for each dungeon kind, darker fill, strike effects by material, a beat's pause, the camera easing in for fights |
| rs478 | Leather coifs finer each tier - seam, studs, feather, scales, clasp, spines |
| rs477 | The back gesture closes the open menu or opens pause, and never leaves the game |
| rs476 | Magic staves finer each grade - orb and prongs, gold claws and spiral, horned crown and circling stones |
| rs475 | Cloth hats finer each tier, hem runes shine at the top, tome covers inlaid with your emblem |
| rs473 | The vampire skull emblem unlocks at Defence 60 and is painted on shields and capes |
| rs472 | Capes are finer each tier - hem, emblem, gold edging, fur collar, embroidery, glow; a fire cape is molten |
| rs471 | A dye paints the shield emblem on every metal shield; washing it out restores the tier's colour |
| rs470 | Shield emblems chosen at the dye works, each metal learned (worn or forged) teaching another |
| rs469 | Tower shields in every metal: more defence, worse aim, forged from four bars or found, tall in the hand |
| rs468 | A stooped wood elf's face looks ahead like a human's, not up |
| rs467 | A shield is strapped to the forearm and, raised, covers the body face out and point down |
| rs466 | Metal full helms are closed great helms and kiteshields metal kites, each tier finer than the last |
| rs465 | Two-handed weapons keep the left hand on the grip through guard and blow, each with its own blow; wizard staves stay one-handed |
| rs464 | Every recipe row has a bench; bolts, darts, knives and special ammo are made at the fletching bench |
| rs463 | No resource tooltip reads undefined, sends you to the alchemist for runes or quotes an old-tier level; the skill guides match the game |
| rs462 | No D&D ability scores: none on the sheet or in the save, none rolled on gear, old score bonuses folded into gear bonuses |
| rs461 | Only you and folk near you wear simulated cloth; distant folk swing their cloaks the cheap way and still move |
| rs460 | Dyeing the Visage of the Sage recolours the hat at once; washing it out brings back its indigo |
| rs459 | A cloak stays calm through snap turns, lunges and fast runs, stays out of the body, and drapes over dragon and tiefling tails |
| rs458 | A cloak is cloth: pinned at the neck and shoulders, it hangs, trails behind as you walk, settles, and stays out of the body and legs |
| rs456 | A unique armour piece's material follows its name or strongest stat; the Visage of the Sage is a wizard's hat with its own look, old ones fixed on load |
| rs455 | No orb-from-glass recipe; the unpowered orb comes from a silver bar |
| rs454 | The D&D ability score improvements and feats are gone; an old save with feats loads and plays without them |
| rs453 | Gear arrows judge base stats only; bonuses in their own box with a weapon's kills and awakening |
| rs452 | Dungeon stairs and ways out are solid to monsters, and nothing lies in them |
| rs451 | A giant crab is well over a tile across; giant rats and plain crabs stay small |
| rs450 | A skeleton archer's arrows fly from it to its foe |
| rs449 | Fishing a cave pool shows the line from rod tip to float; a tome shuts whenever the weapon is put away |
| rs448 | Any part of a shopkeeper's counter opens the shop when clicked |
| rs444 | (RS-446: the round step back, no band under the rose's points; RS-447: no gaps between them) The compass rose is a stone step of bevelled two-tone points under the waypoint, which stands a step higher on it |
| rs443 | The town's cobbles are a fine 1024px layer in irregular courses over the paved tiles, made once and reused; the compass rose over it |
| rs442 | A trinket's icon is a claw charm, not a pendant like an amulet |
| rs441 | A timber house's braces never cross its windows; its shutters swing open either way, none square out from the wall |
| rs440 | The XP tracker shows while you cook or work a batch, clear of the cooking card |
| rs439 | Every craft takes 1.3s a piece (twice as long); at your campfire you sit further back, the marshmallow held out over the flames |
| rs438 | A dead boar lies on its side, legs out, mouth shut, head in line; its jaw meets its snout |
| rs437 | Someone on the road turns up a few leagues off and waits to be met; a skeleton with its note lies where you can see it, to be searched |
| rs436 | A story quest's place in the wilds is drawn as a scene (the Goblin King's hall and nine others), not just a ! |
| rs435 | The loot filter salvages Gilded armour by tier and bonus; real rare, set and locked pieces stay kept |
| rs434 | Ambushes while camping or gathering are real roamers that come for you - seen first, closing in as you move or work, stopping your work, fighting when they reach you, losing your trail if outrun |
| rs433 | A treasure map's X and a clue scroll's spot are marked on the world map, the minimap and the ground; reading there digs up the casket or moves the trail on |
| rs432 | Frogs and birds slump belly down where they die (no tipping onto a side, no legs through the floor); a beast's legs stay outside its body as it falls |
| rs431 | Every armour tier (plate, hide, robes) keeps the lower tier's finery and adds more; a robe's trim band and runes ride on the skirt; the mantle shows |
| rs430 | A rune robe's hem runes are a gold layer on the skirt that moves with it, not loose glowing blocks |
| rs428 | Mining and woodcutting swing the tool again (weapon put away); a room has sconces on the back and west walls and on posts in its low east and front walls (RS-429) |
| rs427 | A fallen body's thighs stay within about 20 degrees back to 120 forward of the spine; altars solid, none in a pyramid; no chest or altar blocks a way through or stands by the stairs |
| rs426 | The bounty board at the tavern's right-hand wall with the Captain to its right; a minion hurrying two squares (straight or on the slant) walks through both, without jumping |
| rs424 | At night every town lamp keeps glowing as you walk away (a pool under it, a glow at its head, dimmer where a real light has it); a light handed on fades up; no obelisks round the waypoint, none of it by day |
| rs423 | A shut tome is only the shut book (the open book's merged pages no longer show inside it), and open only the open one |
| rs422 | (RS-425: the waypoint in line with the Peddler's path, no one on its steps) Food on the fire while you cook (a grill over the campfire, a skillet on the hearth, browning as the bar fills; the cook panel a corner card meanwhile); the waypoint in the middle of the square, with benches and a lamp at each corner, everything still reachable; your weapon put away out of a fight (hip or back, the shield on the back) and drawn to fight |
| rs420 | Minions go round walls to the foe and archers shoot only what they can see; you pick the minion and the bones; monsters (and you) step and strike on the diagonal, round no corner; the XP tracker's auto/manual switch; RS-421: idle minions follow you round walls |
| siege | breaking a siege, fought at the real town: the field before its barred gate (three waves, the watch beside you), then its own streets and buildings with the gate swung open, the warlord in the square; a raid in the real streets |
| rs416 | The watch's torch flame is sconce-sized; doorway arches spring higher in the floor's own pillar stone, the doors as tall; women's clothes lie flat across the front below the belt |
| rs415 | Her hips no wider set than his and her tunic closer at the waist; an Egyptian pyramid; the rat king bigger and crowned; stone archways over every dungeon door, the treasure room's door studded and no taller than the walls; sconces on the gate towers; capes over the shoulders |
| walkleak | A minute's walk over the land leaves almost nothing behind on the graphics card (animals, wandering groups, corpses, old land's foam, glows and depth maps); the water reads the depth of the land showing |
| deathall | Every creature dies its own way and ends on the floor: octopuses slump, sharks, frogs and treants tumble, swarms scatter; nothing floats over the floor; thighs swing back no more than about 20 degrees |
| xptstay | The XP tracker holds still while you gain xp, in its own place and where you've dragged it |
| rs411 | The XP tracker's bar wraps round at a level-up; explored doorways stay drawn out of sight; a recipe's logs count plain logs only (building costs any kind); the fight minimap hides behind menus; the world map pans by the pixel |
| dgshadow | In a dungeon the lantern over your shoulder throws your shadow on the floor, redrawn every frame as you walk |
| nosnap | Rapid key presses never get you ahead of your figure (no jump to catch up), in the dungeon, on the land and in town; the dusk light fades without a jump |
| dgminiwalk | A click on a seen spot of the dungeon minimap walks you there; an unseen spot does nothing; the floor under it isn't clicked |
| dgrooms | Plain dungeons: rectangular rooms, corridors a tile wide, arches and oak doors that block sight and open on a push |
| dgkeep | Every dungeon you haven't cleared keeps its floors through saving and loading - not just the three most recent |
| savelock | A character can be locked on the title screen so it can't be deleted; the lock outlasts saving |
| grottoexit | Out of a grotto, cave or ruin (won, fled or turned away) you stand on the next tile, not inside its model |
| walkstutter | A long walk: the new land compiles a few shaders a frame before the swap, the woods build in slices, animals in reach are kept |
| nativeres | RS-403: every view at the screen's own resolution; one scaler steps down only under 60 fps |
| owdraws | RS-401: the open land's draws - batched gathering-spot effects, merged land, creature culling and shadow distance |
| deadcode | RS-400: the skeleton studio renderer and the raycaster frame buffer are gone; skeletons still built |
| hudthrottle | RS-399: the game loop rebuilds the HTML HUD ten times a second; actions still rebuild at once |
| gpurain | RS-398: dungeon dust and the land and town rain move in vertex shaders, no per-frame upload |
| dgfx | RS-397: particles, loot beams, vein glows, hover glow and arrows/spell bolts as scene objects, not 2D |
| dgcanvas | RS-396: the dungeon view on its own canvas (no per-frame copy); vignette and hurt/heal edges in the post shader |
| shadowwalk | RS-395: on the open land the shadow map is redrawn every frame while you walk, and snapped to its texels |
| dminimap | RS-394: the dungeon minimap turns with the camera, shows N, and has the turn buttons |
| dsconce | RS-393: dungeon wall torches are 3D iron sconces; their light is on the GPU, no CPU light map |
| sconces | rooms are lit by torches in wall sconces, not ceiling lanterns; daylight by day, torchlight at night |
| tavgames | RS-391: the tavern's games played for real: dice poker, twenty-one, the wheel and darts at a standard board |
| winlight | RS-390: window light follows the hour: rose at dawn, warm white by day, orange at dusk, none at night, in the shafts, the glass and the room's tint |
| bedsleep | RS-389: renting a bed lays you in it, fades the night out, wakes you just after dawn with daylight in the windows, and gets you up |
| rs386 | RS-386: stools pulled in to tables; bank ammo coloured and quiver rows with tooltips; seated robes drape round the seat; posts stop short of the wall top; you stand at the edge of a town's tile |
| hbsweep | RS-385: gathering no longer rebuilds the hotbar every frame (the sweep carries its start time); the gather bar only writes what changed |
| rs382 | RS-382/383: the hooded figure sits in the tavern's dim corner, back to the walls, behind a table; a game saved in a town loads in that town |
| fieldwon | RS-382: a won overworld fight stays open until you walk off its edge (ambushes too); a field with no way out gets a portal |
| hoverpick | RS-381: mouse moves are only noted and picked once a frame; the land is picked by its heightfield, creatures by a sphere; the tooltip follows once a frame |
| townmerge | RS-380: town props merge by make with baked vertex colours, window panes merge into their buildings, puddles are one instanced mesh, the glass keeps its palette material |
| skinall | RS-379: every creature template is skinned into a few meshes once, one skeleton per figure, culled by one sphere; props baked whole; spiders too; a copy binds to its own joints |
| restrig | RS-378: dragons, hydras and crocodiles as chains of joints, serpents as a rope, birds tumbling out of the air |
| quadrig | RS-377: the four-legged beasts: a bending chest with the forelegs and neck, wrists and hocks, the trot, the chain-of-joints death |
| humanrig | RS-376: the two-legged figure: waist pivot, split torso, ankles, the walk cycle, the chain-of-joints death |
| rs375 | RS-375: menus under the top bar; boss-beaten card framed; small folk taller; the open treasure door stays drawn when you stand in it |
| rs374 | RS-374: no white flash on the dead; bank side by side with the quiver; one row of bag tabs; citizen names on pointing; no boss menu; the treasure door swings open |
| menupanel | RS-373: menus are centred framed panels sized to their content; title, character making, death and equipment keep the whole screen |
| deaths | RS-371: beasts roll on their side, folk fall with limp limbs and drop their gear, skeletons fall apart, oozes puddle, ghosts dissolve; harder blows throw harder |
| lootfammo | RS-370: the loot filter's ammo tag (arrows, bolts, thrown weapons) |
| townwalk | RS-369: townsfolk walk errands all over town, go into the tavern in the evening, home at night |
| templerunes | RS-369: the basic runes are sold at the temple, not the alchemist |
| ammostack | RS-369: arrows and bolts stack in the quiver (never loose in the pack), darts onto the ones in hand; the bag's Quiver tab |
| dgsolid | RS-369: solid refuse never cuts a way off; chests are solid, bump-to-open, lid animates; no pyramid braziers |
| roamterrain | RS-369: wandering groups keep to land or water, by where they first turned up |
| townpuddle | RS-369: town puddles shrink and dry after the rain |
| weatherclock | RS-369: weather on the real-time clock: rain every 3-7 days for a few hours, foggy mornings |
| travelmap | RS-368: the waypoint and house portal maps zoom, pan and pick; the portal shows its places on the map |
| ragdoll | RS-367: bugs die as rigid-body ragdolls (on their backs, legs curled, never in a wall); every corpse stays above the floor and fades |
| landreach | RS-366: the built land is 96 tiles a side and rebuilt by the camera's reach, so its edge never shows zoomed out |
| phonetier | RS-365: the phone tier as a setting on a computer, switched on and off live |
| lootfilter | RS-362/364: the loot filter menu - tiers and gear bonuses to salvage; no junk tag |
| snakesize | RS-361: serpents sized by footprint - a snake about a tile, a giant two, a mythic three |
| spire | RS-360: the Black Spire landmark: sealed before the quest, the gate and knight's floor on it, eight floors of the dead after |
| spiregate | RS-359: arriving at a quest site takes the quest's dialog, not the dungeon prompt (the Black Spire's knight's floor) |
| cull | in towns, whole things the camera can't see are skipped; dungeon lights' shadows refresh on their own clocks; a desktop dungeon never drops below render scale 0.7 |
| diag | double-clicking the fps meter switches sprites, grass, lamps, soft shadows, shadows, multisampling, people and the ground off in turn and reads the card time each saves; each is undone after |
| profile | the fps meter shows where a frame's time goes (3d, hud, loop, gpu), measured only while it is on |
| jointmerge | townsfolk are one skinned mesh per make of part, colour in the vertices, still walking and striking through their bones; your figure is untouched |
| gpupref | the town and land renderers ask for the high-performance GPU, and the fps meter names the card drawing the view |
| nodering | gathering-spot chunks reach as far as the camera sees, never past the built land; a walk keeps the chunks round you; a window move keeps the chunks still inside it |
| landfar | a coarse far ground of the whole world sits under the built land; a window move builds the new land over several frames while the old shows, then swaps in |
| townperf | a town's still parts bake into one mesh per material per building or tree, the townsfolk are sculpted coarse, far folk cast no shadow, fades still work; draw and triangle counts stay under their caps |
| lich4 | The Waking Lich IV points at a graveyard (never a tower), its relic on floor 6, and the graveyard is made six floors deep; an old save aimed at a tower is moved |
| mobanim | every bestiary creature has a 3D model that moves when it walks, when it winds up or strikes, and topples when it dies (serpents slither, oozes heave, floaters lean, crocodiles lunge) |
| viewwarm | the open land and a town compile their shaders at build (whole scene plus stand-ins for animals, spot kinds, camps, markers, see-through buildings), so a walk, a turn and nightfall compile nothing new |
| dgwarm | a floor's props and monsters are compiled with it at load, so no shader builds mid-walk (the dungeon hitch) |
| rs342 | dragon lair masters are level 126 and big; god staves, capes and relics are Unique and never sold by the loot filter or junk sellers |
| bigbosses | mythic beasts and world bosses are level 126 and sized by what they are, bigger than the run of their kind |
| heads | many-headed creatures (hydras, King Black Dragon) keep their necks and heads apart through the whole animation |
| godspells | the god spells have their own labelled rows in the Spells tab, and a god staff names its spell |
| rs337 | the carpentry bench saws logs your Construction level can work; resources A to Z; story quests follow a site that moves when its master falls |
| cutclick | a click on floor seen through a wall the cutaway has dissolved goes to that floor, not the wall |
| gates | every town gate is bigger, with two oak doors standing open and the race's banner on each side |
| rs335 | the hooded figure can be clicked; trees and rocks can be searched for on the world map |
| rs334 | arrow types by name with icons in the bag, world map bars at the top, a draggable fps meter on the right, race banners on city gates |
| sqreturn | a fight, boss, puzzle or choice after a "go to" keeps its quest marker when left unfinished, and is offered again on coming back |
| perfwild | gathering spots are baked into one mesh per material, and the land's deer, rabbits and boar are sculpted coarse |
| dummy | the archery butts are training dummies: walk in for melee, click from range for bow or magic; tallied by style against chosen armour, nothing spent |
| dgquest | a quest in the dungeon you're in shows under the top bar; the quest bar has its own Quests, Journal and Tasks tabs |
| questtabs | the side window's quests tab has Active, Journal (story quests, click for the log) and Tasks (Slayer, contracts, bounties) tabs |
| bladewalk | the swinging blade is a trap: cocked and still until you step under it, then it drops and sweeps; paths go round it when they can |
| qbtip | hovering a quick-bar slot shows what it holds; protection prayers wear a shield round their mark |
| dgminimap | the minimap in dungeons and roadside fights turns with the camera, like the overworld's |
| starlily | starlily patches show by day (closed, not pickable) on the map and land, and open at night |
| mimic | the mimic has its own chest model with a toothy lid, tongue and six legs; the lid gapes and snaps |
| hooded | The Thieves' Guild quests come from a hooded figure in the tavern's corner, not the tavernkeeper |
| bagmats | Herbs, forage, ores and materials show in the side window's bag and under the All tab |
| dglight | Light carries half as far in dungeons (lantern, torches, fog, glows, narrower shafts); a blade swings in real time |
| ferry | Taking a ferry sails you across the water in your boat to the far landing (no jump), unsteerable, same time cost |
| qbpick | Clicking an empty quick-bar slot opens the bag in the side window showing only what can go on the bar; tapping one fills the slot |
| thrall | A resurrected thrall stands beside you as a 3D ghost, skeleton or zombie and swings at the foe it strikes |
| waitbtn | On a phone the d-pad's middle hourglass waits a turn in dungeons and fights (dimmed on the land) |
| sidebooks | G and N open the side window's Spellbook and Prayer tabs (rune pouch, books, bones there; the old menus are gone); arrows are enchanted at the fletching bench |
| compactbtn | On a phone the hotbar has a button for Y (compact mode on and off), still there in compact mode |
| dragfirm | A dragged window follows the pointer exactly and stays where it's dropped (no easing, no tug back) |
| townmap | The world map opened in a town fills the window like outside, hides the town minimap, and has its hotbar slot |
| boardink | The bounty board's parchment cards use dark ink for rewards, difficulty and level (contrast at least 4.5:1) |
| mapsearch | The world map's search box finds discovered places by name or kind, rings and lists them, and hides undiscovered ones; a wandering merchant is a merchant from first sight |
| clicksure | A click always works in a fight (the monsters' answer is hurried, held HUD buttons are not redrawn); no water inside the boat |
| shore | RS-105 to 117, RS-311: water stays on the water; a sea or lake shore is a beach that slopes into the water, land corners out in the sea are rounded off, the middle of every land tile stays dry, river banks stay low; waterfalls flow |
| sitrobe | RS-310: a robe bottom on a seated figure folds onto the lap over the thighs, falls from the knees, stays above the ground, and takes its own shape again on standing - on six race and sex combinations |
| campseat | RS-309/310: at your campfire, with a tent or just the fire, you sit on a stool facing the flames, beyond the fire from the camera and beside the tent, the staff and book put down and a marshmallow on a stick over the fire; walking off gets you up |
| praymix | RS-306/307: which prayers go together - a ranged or magic prayer clashes only with attack and strength prayers and with each other; in the curses a Leech switches off the Saps and Turmoil both; the two books never mix |
| beltline | RS-305: a robe top is a bodice ending flat at the belt line and the robe bottom's waist rises to meet it with the same oval, under the sash, on every race and both sexes; a one-piece robe and a robe top over plate legs too |
| qbars | RS-304: two quick bars up by default (1-9 and shift + 1-9), each across or down, either switched off in Settings; the prayer page's stars put prayers on them |
| bagtabs | RS-298: I opens the stats beside the equipment, centred; the bag under the figure in tabs (all, gear, food, scrolls, resources, junk) with the old inventory's search, sort, buttons and details; P is the stats alone |
| drape | RS-297: a cloak drapes over a wood elf's and half-orc's hump instead of through it; a shield sits against the knuckles; a tome rests on the left palm, pages tipped up; the land is named under the clock bar |
| stairclick | RS-297: a click anywhere on a drawn staircase (treads, risers, sides) picks the stairs from every camera turn, and walking there takes them |
| offhand | RS-295: an off-hand blade in the left fist (held ready, drawn back with the main hand), a tome held to read, shields unchanged; hair under a helmet stays inside it |
| mhead | RS-294: sculpted monster heads (golem, fish-man, mind flayer, umber hulk with moving mandibles, gnoll and jackal with a hinged jaw, bugbear, yeti, kobold, lizardfolk); dragonborn helmets sit on the skull, the cowl opens for the snout, the crest stays under a helmet |
| skirt | RS-288: a woman's tunic skirt and robe bottom stay outside the garment's hips at every height and angle, in every build, over plate, cloth or no legs |
| cloak | RS-282: a cloak hanging from both shoulders in folds, clear of the pauldrons, with cord and brooches, swaying with the stride; kite shields (curved, rimmed, riveted, a cross) point down for emblem bearers and metal kiteshields; round shields stay round |
| helm | RS-281: sculpted helmets - kettle hat, great helm (visor slits, breathing holes), spangenhelm skull cap (nasal, cheek plates; horned, winged, crested), wizard's hat, hood; the hooded head wears the hood |
| face | RS-280: eyes in sculpted sockets under lids, eyeballs with iris and pupil, brows, nostrils; hair and beards grown as strands merged into one mesh over a scalp dome |
| wear | RS-279: sculpted garments over the body (tunic, jerkin, hauberk, breastplate and fauld, robe), matching sleeves and hose, a neck in the neckline, a belt round the body, sculpted pauldrons, a hanging tabard |
| beetle | RS-278: giant scarab, tomb scarab, scarab swarm and rust monster rebuilt as high-detail beetles (shell opens over wings, mandibles, feelers, six legs, propeller tail); the hyena pack and town dogs on the sculpted wolf |
| quad | RS-277: bears, owlbear, boars, elk, great cats, rats rebuilt on one sculpted builder: on their feet, jaws that bite, antlers/tusks/mane/tentacles/wings; wild animals and the town cat build |
| lowtier | RS-276: sharks, quippers, birds (and the town hen), treants, five-headed hydras, xorn, dust devil and manticore rebuilt in high detail; they move when they attack and stand on the floor |
| frog | RS-271: frogs, toads, crocodiles rebuilt (tongue, warts, teeth, crested tail, ammit's mane, sacred collar); RS-272: the shambling mound a shaggy swamp shambler with a trunk; the wisp a tall flame |
| ooze | RS-270: oozes rebuilt: a smooth heaving jelly with bones inside, three jellyfish, a whirling water column, a vine-hung shambling mound, a wisp; they move when they attack and each figure moves its own surface |
| tentacle | RS-269: tentacled monsters rebuilt: sculpted mantle/eye-orb/roper, every arm a smooth tapering tube that writhes and lashes on the attack; right arm counts, the herald's crown |
| serpent | RS-268: serpents rebuilt: one smooth body bent along a moving spine (snake, cobra hood, worm maw, finned eel, leech, remorhaz); it moves as it strikes; each figure bends its own body |
| breath | RS-267: a dragon's breath shows: it rears back, a cone of its element pours from its jaws onto you, and its jaws gape |
| dragon | RS-266: dragons rebuilt in high detail: sculpted body, horned head with a toothed jaw that bites, clawed legs, membrane wings; wyvern on two legs, turtle shell, plesiosaurus flippers, three-headed King Black Dragon |
| women | RS-265: women look like women: feminine head sculpt (narrower jaw, fuller lips), lashes, no square jaw, slimmer arms; about two in five townsfolk are beardless women |
| torso | RS-264: torsos sculpted finer; a woman's bust sculpted into the torso (stands out, no stuck-on balls), narrower waist, wider hips; picking Feminine clears the beard |
| wolf | RS-263: the wolf rebuilt in high detail: sculpted body, ruff, black nose, ears, a jaw that opens on its fangs to bite, four legs on their paws, a jointed bushy tail; jackals, hellhounds and werewolves share it, a town dog doesn't |
| hdbugs | RS-262: the spider and scorpion in high detail like the crab: glossy shells, smooth round parts of 20+ sides, the spider still furry, two sculpted finger blades on each scorpion pincer |
| crab | RS-258/259: the crab rebuilt after the Sally Lightfoot: a colourful glossy shell wider than long, eyes on stalks, two matching red claws, four pairs of legs on the ground; scorpion and spider still build |
| spider | RS-257: the spider rebuilt: head-and-chest and a raised abdomen, eight arched legs on the ground, it animates; frost and cave spiders too; scorpion and crab still build |
| scorpion | RS-256: the scorpion rebuilt: plated back, eight arched legs on the ground, two pincers, a five-segment tail curling over the back to a sting; it animates; spider and crab still build |
| human | RS-255: the human after the Men of Gondor and Rohan: squarer jaw, long hair and full beard, a belted tunic with an embroidered hem under a fur-collared red cloak; armour takes over; townsfolk wear tunics too |
| halfelf | RS-254: the half-elf as a Strider-like ranger: elf-touched face and stubble, a leather jerkin over linen sleeves, dark trousers in the chosen colour, a green cloak with the hood down; armour takes over; townsfolk match |
| tiefling | RS-253: the tiefling after Bakshi's dark cloaked figures: narrow angular face, pointed chin and ears, eyes glowing in their own colour, a long dark trimmed coat under a high-collared mantle; armour takes over; townsfolk match |
| gnome | RS-252: the gnome: a tall felt hat curling back with goggles on the brim, bushy brows, rosy cheeks, round belly on short legs, a tinker's apron; a helm and armour take over; townsfolk match |
| halfling | RS-251: the halfling after the cartoon hobbits: round belly, curls, rosy round face, button nose, big hairy bare feet, a buttoned waistcoat over shirt sleeves with knee breeches; armour takes over; townsfolk match |
| halforc | RS-250: the half-orc after Bakshi: broad hunched shoulders and long arms, heavy brow, flat nose, underbite and tusks, swept-back ears, amber eyes, dark rags; orcish townsfolk match |
| dwarf | RS-246: the dwarf after Bakshi: broad barrel chest and shoulders on short legs, big nose, heavy brow, a great beard to the belt with gold-bound braids (not when clean-shaven); dwarven townsfolk match |
| highelf | RS-245: the high elf after Bakshi (circlet, almond eyes, long gold-hemmed robe and mantle out of armour); ticks on the figure slots hide a worn piece on your figure while it still counts |
| woodelf | RS-242: elves split into high elves (magic) and wood elves (bows); the wood elf is tall, gaunt and stooped on long thin limbs, with a leaf cap, leaf tunic and bare long toes; an old elf save loads as a wood elf |
| cblvl | RS-240: the 1-20 power tier is gone - monsters are scaled to exact combat levels, floors and bands are in combat levels, gear drops from the level it needs |
| gearcmp | upgrade/downgrade is judged against the style you fight with: plate is a different style to a mage in robes, better robes are an upgrade; and the other way round for a fighter |
| solid | landmarks are solid: no walking through the tower, the great tree or the volcano, and no site, point of interest, road, gathering spot or wandering group inside them; each can still be reached |
| lookout | the tower is a lookout: climb it from its foot, the camera stands high on the gallery with a wide, turning view, the land in sight goes on your map, a key climbs down |
| volcano | the volcano is part of the land: a tall cone with a sunken crater, lava runs down its flanks; the stand-in cone only shows from afar |
| intdoor | inside a building the way out is a real door, shut in its frame: round in a halfling shire, plank elsewhere, in oak, golden oak or cherry matching the street side; none where there is no street door |
| skroam | a wandering group led by a skeleton walks the overworld as the sculpted skeleton (it had no model) |
| hobbit | a halfling shire is hobbit holes: every building a turfed hill shaped round its round hinged door and windows, and the overworld town is little hills round a party tree |
| racetowns | every race has a town (a shuffled deck per world); the new towns have their landmark (kitchens, workshop, brazier, ember altar, minstrels), once a day, and townsfolk of their race at its height |
| races | every race has its own figure (heights, orc face, dragonborn head, tail and claws, tiefling tail, halfling feet, gnome nose) and reworked trait: skill xp, accuracy, crits, damage taken, haggling, Relentless Endurance |
| foebeat | in a 3D fight the monster's counterattack lands a beat (~1.1s) after your blow, you can't act until it has, and with deferral off it's instant |
| nofs | the game never goes fullscreen on its own (first click, game start or resume); only the corner button asks for it |
| skeye | a dressed skeleton's eyes glow its class colour in the flat fallback drawing too, matching the 3D kits |
| pyramid | pyramids in the desert: placed in a new world, their own floors, theme and tomb-dweller roster with 3D models, the risen pharaoh or a god of the old lore as the boss, the land model and the bestiary |
| rs211 | dragon heads look ahead, a skeletal warrior is bare bones and a sword, and the player's staff stands as it does in the barber's chair |
| maptown | the world map opens in a town (no walking while it's up), and its ! marks - quest objectives and wandering threats - show a tooltip |
| bestboss | the bestiary's bosses tab: every boss can be picked, turns in the model viewer and shows its lore, style and drops |
| wpfit | the waypoint window fits the screen with no scroll bar on a phone, the map shrinking to the room left |
| held | staves and bows stay upright with the arm low and tip back on an overhead wind-up, a staff's orbs circle its head, the shield sits past the fingertips, and leaving a dungeon puts you beside its entrance |
| grip | the left hand is a mirrored right hand, and every weapon, staff, bow and tool handle sits inside the curled fingers |
| dgpersist | a site's floors are kept with the save (dying, stairs and reloads bring back the same floor), the gravestone stands where you fell below ground and is reclaimed there, and the fallen master opens a portal out instead of ending the run |
| iso | isometric 3D everywhere: no key or saved setting switches to a flat view |
| bvzoom | the bestiary model zooms (wheel, pinch, buttons), picking a creature keeps the list's scroll, weapon wrists turned and one-handed axes flipped |
| crafttier | each crafted quality step (Fine, Exceptional, higher level) and each reinforce step gives better stats, even on small numbers |
| townanim | the town's dogs, cats and chickens are animated, not frozen |
| classgear | monsters look like their trade: each goblin, orc and kobold rank has its own figure and gear, and every skeleton is the sculpted model dressed for its class |
| potstack | potions stack in one bag slot with a count; drinking or selling takes one; counts add up stacks; old saves merge on load |
| nosockets | the old socket runes and runewords are gone: old saves' runes are cashed in, sockets come off gear, rune quests become potion quests |
| hearth | the hearthstone: bind it at a waypoint stone, T takes you back from the open land or a town, not a dungeon; it cools down and is saved |
| altarspace | runecrafting altars stand only on their own ground and keep their distance from each other |
| charsheet | the character sheet: two pages side by side over the game (no dark backdrop), stats with tabs, the figure with the whole bag under it; gear moves by drag and drop |
| bal2 | the RS-194 balance pass: combat xp per damage, trimmed coins, the smith's falling prices, gathering and production xp rates, bones, slayer and runecrafting |
| xpt | tick skills in the skills menu to choose what the XP window shows |
| rooms | building interiors: floorboards and flagstones with depth, panelled walls, rugs, daylight through the windows |
| door | walking through a door: swings open, camera leans in, room appears, eases out; and back out with the door shutting |
| roads | nothing spawns on a road except the towns, and nothing spawns on top of anything else (RS-131) |
| chardel | deleting a character on the title screen: tap once to arm, tap again to delete, no browser pop-up |
| routebtn | the route and gravestone buttons over the hot bar: plan a route, set off, stop; walk back to your grave |
| graves | one gravestone per death (up to ten), the nearest is the one you head for, picking one up leaves the rest |
| crash | on a phone: a saved character loads after a reload, half-size room textures, errors shown on screen |
| wmapm | the world map on a phone: clear of other panels, one row of tools, no legend by default; tap a grave to walk to it or forget it |
| viewrot | the towns and overworld turn like dungeons (Z/X, minimap rim buttons); keys and minimap turn with the view; rooms keep the usual view |
| los | ranged attacks need a clear line of fire: no squeezing past a wall corner, and the same answer from either end |
| export | exporting a save: the claude.ai save prompt when the page runs there, a plain download elsewhere |
| daylight | town light follows the clock: the sun crosses the sky, the moon lights the night, no jumps between dawn, day, dusk and night, lamps fade up, softer desert sun |
| nodetip | a resource node tooltip updates its "left" count live as you gather |
| campfire | on your campfire with resources in reach, E lists every option (cooking first) and cooking works |
| monshadow | creatures have no round blob and cast real torch shadows; the fps meter sits centred under the clock bar |
| models | renamed creatures (the highwayman, a mythic beast) keep their 3D model; a mythic beast stands at its lair on the map |
| rush | a melee monster rushes you from well off and finds its way round walls, and a dashing one stops beside you |
| dwalk | walking a dungeon: even diagonal strides, the camera leads ahead, pillars dissolve in the cutaway, and on a phone you stand mid-view |
| anim | strides follow the ground covered at any speed, ease in and out, creatures look where they walk, and a monster swings on a miss too, swings follow through, the legs keep the old steady pace, and hits cause no reaction |
| beasts | the world's giant and the mythic beasts are 3D creatures on the map that walk tile to tile; mythic beasts roam round their lairs and keep their spot in the save; landmark edge markers bunched together don't freeze the game |
| robe | a robe top is a tunic with no skirt of its own, a robe bottom is a long skirt (not trousers), its icon is a skirt, and the skirt moves with the legs so they don't poke through |
| townlights | at night every town lamp can light up - gate and watchtower torches and street lamps - as the town's few real lights go to the lamps nearest you |
| xpdrop | the xp numbers from any skill rise over your head on the overworld, in town and in a dungeon |
| essvein | mines have seams of rune essence: mined at Mining 1 for rune essence and xp, shown as rock split on pale crystal |
| qroll | the quest window rolls up to its title bar and back down when tapped, stays put when dragged, and stays rolled after a reload |
| lairtop | a dragon's lair sits on its mountain's summit, with the pass to it climbing as a path from the foot of the range |
| peddlertools | the gathering tools are sold by the Peddler, not the blacksmith; a staff's orbs hide while you hold a tool |
| mythmap | a mythic beast is found when you come near it: a map icon (world map and minimap), a tooltip on the map and its 3D figure, and on touch a first tap shows the tooltip |
| rich | rich spots (gold vein, ancient oak, legendary fishing spot) never turn up on a road, a site or a point of interest |
| altar | a runecrafting altar asks before binding your essence (Bind / Cancel), and the xp it shows is the xp you get |
| encmodel | a wandering group shows as its strongest member's 3D figure with the crossed swords over its head, and walking into it you fight that group |
| necro3d | raised minions are 3D figures (the sculpted skeleton, or their own model) ringed in green; the Raise box drags without raising; the skill guide lists each minion's level |
| interior | building interiors: a real doorway, the floor stops at the walls, cabinets clear of windows, wall furniture against walls, stairs up to a door, no overlapping rugs |
| seats | seats and beds: two-tile beds that sleep you till dawn, person-sized chairs and stools, the player and tavern regulars sit on them, a lid-free stairwell, the trapdoor in the shop corner |
| cavetip | hovering (or tapping, on a phone) an ore vein in a mine shows its tooltip: level, xp, how much is left |
| portalwall | in every kind of site the portal and the stairs back onto a wall and never block a passage |
| newworld | the load screen takes a character to a new world: a new save keeps the character, the old save stays untouched |
| foodbar | cooked dishes show in the bag; every food in the side panel has its own picture and name; U shows what it eats next |
| noscrolls | the old spell scrolls are gone: never stocked or dropped, and old saves cash them in for gold |
| utilspell | utility spells are apart from combat spells, with their own pick and an auto-utility toggle that opens fights with them |
| crafthave | every crafting screen colours ingredients (green have, red short) and shows how many you can make |

## Probes (not in `ALL`)

`persist.js` runs a probe in two separate browser launches that share one kept profile, to see what the browser keeps on disk between days (`node tools/tests/persist.js zdgload <profileDir>`).

`t_z*.js` files are hand-run probes for screenshots and measurements. They are not part of the suite and don't assert. Run them by name, e.g. `node tools/tests/run.js --headed zow`. Shots go to `tools/tests/shots/`.

| probe | what it does |
|---|---|
| zdg | a site of a named kind on a fixed seed (`ZDG='[["name","kind",depth,dist],...]'`); `ZDG_GPU=1` prints GPU ms |
| zdgroom | the dungeon camera over a room of a named purpose |
| zow | the open land at named kinds of place, hours and weather (`ZOW='[["name","kind",clockFrac,"weather",dist],...]'`); `ZOW_GPU=1` prints GPU ms |
| zfall | the waterfalls on the fixed seed, the camera on each from the turn that faces it, the player hidden (`ZFALL='[[x,y,rot],...]'`, `ZDIST`, `ZNOROCK=1` hides the rock) |
| zsiege | a siege at the spawn town (or, with `ZCITY=1`, a stone-walled city): the field before its gate, then its streets and square; `ZRAID=1` starts a raid |
| zdgwalk | walks every room of a dungeon floor with a save (`ZSAVE`, `ZDEPTH`) at the real frame rate: frame-time spread, the slow frames, the shaders the warm-up links and how long each took, the scene's lights, and a CPU profile of the slow frames |
| zherb | picks the last of a cave herb patch on a dungeon floor (with `ZSAVE`, a real save): every frame, gather tick and save timed around it |
| zdgload | how long a dungeon floor takes to come up from a fresh page (with `ZSAVE`): load to the end of the shader warm-up, the longest frames, the programs built; `ZNOPRE=1` turns off the parallel link to compare |
| zlink | how long one standard material takes to link against a set of lights (point lights, how many shadowed, the shadow filter) |
| zdgcache | t_zdgload twice in one browser, the page reloaded between: what the browser's own shader cache saves a second visit |
| zland | the open land from a fresh page with a save (`ZSAVE`): load to the end of its warm-up, the longest frames |
| zpre | whether gfxPrelink returns at once: its call timed against the wait for the driver, on fresh heavy materials |
| zviews | the open land and a town drawn through the players' warm-up path (sliced, parallel link): screenshots |
| zparity | the same views on the fixed seed (land at three spots, the spawn town, a dungeon) as shots/zpar_<view>_<ZTAG>.png, to compare two builds |
| zperf | frame cost while walking the land, a town and a dungeon with a save (`ZSAVE`, `ZVIEWS`, `ZSECS`): frame spread, CPU and GPU ms, a CPU profile's top functions; `THREE_JS=` the unminified build for readable names |
| zbear | a creature (`ZMON`) killed eight times: how far its body tips each time |
| zleak | t_walkleak, listing each geometry left behind with where it was made |
| zscene | what the land's scene holds (`ZSAVE`): objects, meshes, matrix updates, culling, by group |
| zcost | the land's frame (`ZSAVE`): draw calls and triangles, and the CPU cost of each big group (hidden in turn) |
| zmat | the land's matrix walk (`ZSAVE`): per frame, and each top-level group's share |
| zhero | your figure close up in a town, sculpted on a given grid (`ZPC`): a shot and its triangle count |
| zdraws | draw calls and triangles of a view's frame (`ZSAVE`, `ZVIEW`), with and without the shadow pass; shadow casters by size; figures' meshes and why their parts aren't merged |
| zsk3 | in a dungeon from a fresh start: when the skeleton's background sculpt finishes and a skeleton gets its model |
| ztris | the land's heaviest meshes by triangles (`ZSAVE`; `ZNOVC=1` without the plant culling) |
| zparts | the unmerged parts of a few creator figures: which rig key refers to each, whether posing moves it, what it is |
| zparts2 | the same for the spawn town's own people, with their skinned meshes' material makes |
| zleft | in the spawn town: every figure, its draws, and each part not in the atlas mesh with the reason |
| zmons | a few creatures stood round you on a dungeon floor, for a close look (`ZMONS='[...]'`) |
| zrd | a beast's ragdoll after the merge (`ZMON`): what the body measure sees, its lowest point after the fall, with `ZFREEZE=1` after its joints were left still |
| zlp | the look preview's figure build timed piece by piece: the atlas draws, the sculpt tries, the skinning, the instance, each render |
| zinst | what an instance of your figure costs, piece by piece: the template, the clone, the boxes, the material copies |
| ztri | the skinning merge profiled by what it calls, and the dye works' figure timed |
| zspider | one creature close up in its own renderer (`ZMON`, `ZTAG` names the shot) |
| zspid2 | what a creature's parts carry into the atlas mesh: tiles, uv ranges, the atlas pixels |
| zinout | into a building and back out (`ZREAL=1` with the sliced warm-up on): shots inside, just out and later, and the frame times |
| ztex | every textured material in town before a building visit and after: maps gone, empty or flat, and any disposed |
| zfence | a town's instanced meshes from four corners and the middle: whether the culling draws the ones in view |
| zset | the settings page on one tab (`ZTAB`, default picture) |
| zrepeat | the same thing three times over with the real warm-up on - into a shop and out, out of town and back, down a floor and up: worst frames, and what was made again (programs, textures, geometries, builds, templates, materials re-warmed) |
| zpark | why a town come back to from the land isn't put back from the parked scene: which part of its key differs |
| zpark2 | each scene build on re-entering a town: what called it, whether the map and the grid key changed, who reset the map reference, sieges staged |
| zpark3 | after a shop round trip: the town's materials the warm-up hasn't seen, whether the loading card showed, whose geometry got disposed |
| zfirst | the first arrival profiled: every v3/o3/m3d/gfx function's inclusive time and calls for the first town build and the first step onto the land (`ZLAND=1`) |
| zarrive | the first arrival at a town with the real warm-up on: the build's parts, the worst frames and what ran in them, the shaders compiled mid-frame, when the townsfolk appear (`ZWAIT=1` waits for the finish workers first) |
| zstaff | the mage's staff in the fist from three sides, and the tome shut, close up (`ZTAG`; `ZDX`/`ZDY` try a grip; `ZNOSKIN=1` measures the fist's hole in the hand's frame) |
| zuniq | every unique item: whether it takes a dye and whether it has a trim |
| zhearth | the tavern's hearth close up at night, from the front and the side (`ZTAG`) |
| zhold | a robed figure's shut tome in the left hand from three sides, and the waist cord from the front (`ZTAG`) |
| zhair | heads with each hairstyle from four sides, and under helmets |
| zplate | plate armour on builds from slight to heavy |
| zunder | the creator's undressed figures by race and sex |
| zphone | a save (`ZSAVE=path`) on an emulated phone with the CPU slowed 4x: frame times and a CPU profile |
| zphone2 | a save (`ZSAVE=path`) on an emulated phone: draw calls, triangles, shadow casters, GPU ms |
