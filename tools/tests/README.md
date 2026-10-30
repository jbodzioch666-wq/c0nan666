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
| rs671 | at a cube Planet's corner the land is framed on the face you're on at once (not kept on the face you came from, with the void between the arms drawn as sea): every tile round you picks, a click over the seam walks you onto the next face |
| rs672 | the Crypt Stair: a graveyard is a churchyard round a crypt; stepped onto from behind, you walk round its railings to the gate (never through them), the carving wakes, the barred gates swing in, you go down the stair into the graveyard and the gates shut behind you; no stone drawn black for want of its colours. Shot `shots/rs672.png` |
| rs674 | the dragon's lair: a crag with a cave mouth and the dragon asleep across his hoard; you walk round the crag to the mouth (its way round from behind and both sides checked to keep off it), he wakes, comes out over the gold and rears, roars once and breathes fire, the camera comes down before the mouth and shakes, he draws back into the dark and you go on in and down; asleep again behind you. Shot `shots/rs674.png` (the fire) |
| rs679 | the Folding Stair: the Great Pyramid's shape again with a jackal of Anubis on a shrine either side of its foot; you walk round it to its foot (the way round from behind and both sides checked to keep off it, the shrines and the obelisks), the capstone chimes once, the seven casing stones of the strip up its face fold down one after another into a stair (one grind, sand as each lands, no shake) through the land's cut (`g.stairCut`, `O3_PYR_PIT`), the glyph rows light from the top down with their torches, and you walk down it your own size into the pyramid; shut again after. Shot `rs679.png` |
| rs683 | half as many wandering groups: a medium world keeps about 25 (`OW_ENCOUNTER_TARGET`, was 50), a fresh world starts with no more; an old save's 50 thin out one a step, always the farthest from you, down to the target and stay there; the Wilderness keeps its extra 40% |
| rs685 | a woman's hips taper into her thighs (no ledge where the legs come out, measured at the thighs' tops in the hips' frame), her briefs cut high at the leg, a jerkin's skirt and a breastplate's lames following her hips in; a man's figure as before |
| rs686 | no clusters of sites: generator 22 keeps a site's spacing before its liked terrain and halves the graveyards - on two medium and two planet worlds no site within 4 tiles of another, no more than three within 8 of one, 4 graveyards on a medium world and none bunched; a generator 21 world keeps its eight |
| rs687 | the Drowned Temple, since RS-688 the Rotunda: generator 24 puts every other sunken temple at sea (open water 3.5 tiles round, a shore within six, out of reach without a boat; a generator 23 world keeps every one at sea, a generator 22 world on the land); the well in the seabed (floor under -2.1, the lip just under the waves), the dome above the waves and the columns under them, a boat beside it lying out past the well, the far sea open over it, fish and light; sailing onto it: one toll, the sea parts (one rush, the wall, the water down), out of the boat which waits at the mooring stone, down the stair to the floor, the doors swinging open as you come (one grind), no shake or zoom, your own size, into the temple, the sea whole again |
| rs688 | Temples to Your Size, the Guardians' Gate: every other sunken temple on the land with open land two tiles round it, nothing gathered or growing under it; the door 1.3 high (you are 0.95), facing open land, no stair cut; on each tile round it you stand clear of it; from behind you walk round it to the front and stop before its steps; one toll, the guardians' eyes kindle, the doors swing in (one grind, a light within, no water), no shake or zoom, your own size, into the temple, the doors shut again |
| rs689 | Taps at the Gate (phone): beside a Guardians' Gate, where you're nudged clear of it (over 0.75 from the tile's middle), figLag counts from the nudged spot, so a tap walks you off; a tap on the gate's door, a guardian or its crown takes you in (its tap box is its own size), and a tap on the Rotunda's dome from your boat |
| rs690 | Back in the Boat: in to a drowned temple from your boat (it waits at the mooring) and back out: the boat under you again, you in it, outside the well, and it sails off with you (it stayed at the mooring and you floated beside it). Shot shots/rs690.png |
| rs691 | Lobsters and Shoals: a lobster on the fire is a lobster (sculpted, shared between rigs, dark raw and scarlet done; a trout and a shrimp still the fish); its bag icons raw blue and cooked red; every fishing spot has three circling fish and one leaper (batched, their shader built, on screen at the spot; one leaper alone out of the water at the top of its leap, hidden between). Shot shots/rs691.png. Probe zlobster renders the lobster raw and cooked from three sides, the icons, and a fishing spot RS-692: no ripple rings round a spot. |
| rs693 | Import Without a Picker: where IMPORT's picker never opens the paste box opens after a moment (not when a picker takes the focus or a file comes); a save file dropped on the title screen or the paste box imports; a click still opens a picker |
| rs694 | The Dwarf Gate set into its mountain (RS-695: every mine about you has its cliff, and two mines five tiles apart both do, the land between them whole): the land itself rises behind the gate (no crag of its own), the ground before it as it was; the doorway open, the face beside it solid; no holes or doubled land in the finer patch, its edge on the land round it; the walk level; the open tiles round it not buried; nothing grown in the cliff |
| rs696 | Fishing, animated: the first cast (rod back over the shoulder, the float flown out from the tip and landed on the water), waiting with the float out, a miss that strikes at nothing (the float yanked up), a catch (the bite pulls the float under with a splash, the strike lifts the rod, the fish comes out on the line, swung in to the tip, into the bag) and the cast out again; a catch is marked by the real loop; nothing left when you stop. Shot `rs696.png` |
| rs704 | Loot with prefixes and suffixes in tiers: the rarity shares at cap 3; a magic piece's one or two bonuses and its name from them; a rare's three to six, its own name over its base; every tier opened by the drop's level, the top tier at 126; a rolled attack, defence or ranged bonus feeds the real to-hit and armour (and the arrows and loot filter); the tooltip's tier tags and Alt ranges; plain rune gear white, magic blue, rare yellow, worth more; an old save recoloured, a ring's recoil built in; sets drop again; an awakening weapon's roll; a boss drop rare at the least |
| rs705 | Loot on the ground: a beam for each drop, taller the rarer, a rare's sparks; each drop's name on a plate in its rarity's colour, a top roll tagged T1; one chime a kill for its best drop (none off a kill); a salvaged drop's name and gold without a beam; the loot filter's rarity row and top-roll guard, an old filter's defaults |
| rs706 | A base's own bonus and the skilling suffixes: every weapon, bow, staff and most armour has one built-in bonus (a dagger crits on 19, a platebody's damage reduction, a wizard hat's magic find), plain and its price unchanged, shown above the rolls; old pieces get theirs once; thirteen skilling suffixes only on hats, gloves, boots, capes and jewellery, their xp and double-haul text, the xp they add |
| rs707 | Essences and the smith's anvil: the four essences as resources, their drop shares, old Scrolls of Reforging turned to Change; Change within a tier, Law a tier up (capped by the piece's level), Chaos (a rare keeps its name), Blood plain to magic to rare up to six; a Unique untouched; breaking down; masterworking to +8 with Law at +4 and +8, starred bonuses, an old reinforced piece; the smith's screen |
| rs708 | A blow carried by a spell or an arrow shows when it lands: the foe's life bar, the target plate and the log keep still till the shot lands, then show the hit; a foe the bolt kills keeps its plate till then |
| rs709 | The Ancestral tier: from level 90 a magic or rare drop may be Ancestral (item level 126, top-tier bonuses, some greater - half again their tier); the anvil keeps a greater bonus greater, the loot filter keeps one, its ground label says Ancestral |
| rs710 | A blow is felt as the weapon connects: a melee swing starts at once, but the foe's life bar, the target plate, the log and the hit sound wait for the blade (and a killed foe's plate); a monster's blow at you - your life, the log and the sound - waits for its swing |
| rs711 | What you make rolls bonuses: Fine one, Exceptional two, at the level its bar and your skill give it, in a crafted colour; Inspired (once Masterwork) one more at the best tier; Superior pieces Ancestral; the anvil keeps a made piece's name and count, no breaking down; old crafted pieces get their bonuses once |
| rs712 | The anvil screen: a bench opens it on Forge, the smith's button on Work a piece; real drags put a piece on the anvil and Law on a bonus, a tapped Chaos then the anvil rerolls, Smash takes two taps, Masterwork raises a piece; each bonus shows its Change and Law outcomes and the piece what it could roll; Escape back to the smith |
| rs713 | The anvil says why an essence won't work: a tap with no piece, a plain piece, an all-T1 piece, six bonuses, a relic, none left; holding Law, a T1 bonus says why under it and Law stays held; a real drag's label over a bonus it can't raise and one it can; Masterwork and Smash dimmed, a tap says why |
| rs714 | The compare tooltip lists prayer and says what its verdict left out: a magic ring with HP on Kill against the Ring of Saint Aurel is a downgrade to a fighter, who is told magic doesn't help and HP on Kill isn't weighed; to a mage the magic counts |
| rs715 | Uniques roll five bonuses of their own families at the best tier their level opens (level + 15, from 90 the top), on the best base for their level; Barrows weapons four; an old Unique is reforged once with its masterwork growth; a level-126 Unique weapon well above a middling rare |
| rs716 | Unique rings and amulets: the same jewel and the same stats every time (only those their kit leans to, to the level's budget), five bonuses and no random jewel's own; one reforged in RS-715 keeps its bonuses and takes its jewel; a Unique weapon from then is left as it is |
| rs717 | The guild hall: six guild masters where the banners stood (turned away till you qualify, then their training), and the Cooks' Guild range by the west wall (waved off below Cooking 32, then you cook on it); shots rs717_hall.png, rs717_range.png |
| rs718 | Food cooking on the Cooks' Guild range: the corner card, the hearth's skillet on the hotplate in place of the idle pan with the fish in it going from raw to done, the idle pan back after; shots rs718_cook.png, rs718_cook2.png |
| rs719 | A lobster is boiled: at the guild range it goes into the stewpot (bubbling, steam off it, the range's own pan staying), over a hearth or campfire grill into an iron pot; still raw to scarlet; a fish still fries in the skillet; shots rs719_boil.png, rs719_boil2.png, rs719_hearth.png |
| rs720 | The crafts quarter: a hamlet's tannery and fletcher, a city's every workshop, each door and room with its own benches and keeper, the loom robes only, leather and staves on their own benches, each keeper's own wares, leather stitched at the new bench; shots rs720_quarter.png, rs720_tannery.png, rs720_fletcher.png, rs720_jeweller.png |
| rs721 | A click on the game view outside a menu (a shop, the bag, a bench) closes it and goes no further; a click inside stays; the title screen stays; the glassblower has no menu, a word in the log |
| rs721m | The same on a phone: a tap outside the shop closes it, and you stay put |
| rs723 | The furnace screen: every bar listed, a tap picks one, smelting pours it, a drag onto the furnace smelts one, a bar you can't make says why |
| rs724 | The spinning wheel and the loom work screens: a tap picks, the wheel spins linen, a drag makes a bowstring, the loom weaves a hat, Ahrim's asks for its book |
| rs725 | The anvil's Forge from bars tab: bar chips pick the metal, pieces as cards, all daggers from twelve bars with the hammer going, a platebody short of bars says why, nails, no silver (RS-728) |
| rs726 | The tanning rack and leatherworking bench work screens: two leathers tanned for gold, dragon leather asks for the hide, leather boots stitched |
| rs727 | The fletching bench and the staff-carver's lathe work screens: arrows into the quiver, a shortbow carved and strung, a plain staff turned, the fire staff's orb shown; enchanting arrows folds below |
| rs728 | The gem-cutting table and jeweller's bench work screens: two sapphires cut, a silver ring cast at the bench (silver jewellery moved off the anvil, first row), the anvil and furnace no longer offer silver forging |
| rs729 | The potter's wheel and kiln work screens: two pots thrown (all counts two), glass melted, a vial blown, a torch lit, charging a fire orb asks for runes |
| rs730 | the brewing cauldron and the dye vat get the work screen: brew potions (a vial for a stronger one), antipoison and a dye; the dye works still opens |
| rs731 | the dye works says what each worn piece is (gauntlets, boots, trousers) beside its name and icon, for named pieces that don't say it |
| rs732 | a tome's emblem takes its trim dye (its glow is the emblem's own colour, not a fixed gold) |
| rs733 | (generator 25) every dragon's lair deep in a big range, its pass reaching open ground, the nearest standing high with its path climbing to it |
| rs734 | Stooped to forage in a robe and cape, the robe's top no longer comes out through the cape: robe and cape hang after the work's pose (shots rs734_forage, rs734_side) |
| rs735 | The Boatyard: planks sawn at the saw pit, rope and sailcloth at the ropewalk, a rowboat built on the slipway stage by stage through the work queue (the boat growing in 3D), then a sloop at Construction 20 with its fee; no boat for sale at the Peddler |
| rs736 | A house of rooms: a cottage bought (parlour with the front door and a bedroom, its bed built first), built bigger to a house and a workshop built on its plot, the house built bigger to an estate for its gold and planks, every room and piece of furniture built and within reach from the door, a back wall fading when it hides you, an old one-room house rebuilt as rooms with its furniture kept |
| rs737 | the garden: four beds (the paths don't overlap), starter seeds, sow, water, grow on the clock, harvest; seeds from foraging under Seeds in the bag; the beds' crops in 3D at each stage (shots rs737_garden, rs737_beds) |
| rs738 | the farmyard: hen house, byre and trough; flax in the trough, chicks and calves bought (and no more than the room), growing while fed and stalling when it's empty, a hen and a cow butchered, roast chicken and cooked beef, the animals wander the yard and make way; the sculpted cow (shots rs738_yard, rs738_close, rs738_cow) |
| rs741 | five melee monsters in a line close in on every side of you in an open room (corners too, none stacked); in a one-wide corridor they still come one at a time |
| rs742 | no spell casts (but the alchemy) without a wizard's staff in hand, and one does with a staff; no minion rises in plate (the Raise button says to wear a robe), one does in a cloth robe |
| rs743 | a town's arena fight is in its colosseum (an oval of sand, walled, two gate tiles the only way out, the monsters on the sand), the stands' crowd built (over 200) and roaring at a kill; beaten, you're dragged out alive beside the arena master; out through the gate you yield; a won wave puts you beside the master; shots rs743_arena, _crowd, _town |
| rs744 | the arena's wave is won only once the last beast has fallen (not the instant its life runs out); the choice is made on the sand; the next wave comes on in the same arena from the far side; the winnings walk you out to the arena master; a death: you fall (shot rs744_fallen), the world greys, "Oh dear, you are dead!" and Release before the death screen; beaten in the arena, Release drags you out |
| rs745 | the carpentry bench stands in the Boatyard (6,6): walking into it opens it, flatpacks for Construction xp and gold; the house's Workshop has none, and an old house's built one is dropped; shots rs745_yard, rs745_bench |
| rs746 | estate property kept through a reload and listed by every agent, a moved town's record rehomed, the Release box high on the screen |
| rs747 | the guild store and quest point rewards of the loot system: essences, a strongbox of rare gear, rares for your level, an Ancestral Quest Point Cape |
| rs748 | monsters for the loot system's gear: life, damage, aim and xp by tier (most in the middle levels), applied once, in real fights |
| rs749 | the liches are the sculpted skeleton in robes, sleeves, hood or crown, a skull staff and green eyes, each rank its own (shot rs749_lich) |
| rs750 | a house costs 50,000 gold; the agent asks it, "Buy a house" is a tier-3 Heartlands diary task |
| rs751 | a cape lies flat under a 2h sword, staff, bow or shield slung on the back: gear tilted out onto it, cloth held under it, standing and walking (shot rs751_hero) |
| rs752 | a tiefling's tail stays inside a robe (tucked, small swish); a willow's dome is closed underneath, its shadow whole (no crescent) |
| rs753 | a tail comes out through a robe and hangs clear of it (tiefling and dragonborn), full swish, caps for the cape |
| rs754 | a plain dungeon matches its land: desert barrow sandstone under sand inside and out, dry (no water or roots); grassland as before |
| rs755 | a plain dungeon's floors draw their monster families from its land (desert ringed: desert folk); grassland the old mix |
| rs756 | the Lost City: generator 26 grows a jungle round each land temple, which is now siteKind city - its names, theme and folk; the jungle's plants |
| rs757 | the Lost City's surface: generateCityLevel (jungle ring, stepped pyramid with the way down at its foot, ruined houses, paving and grass), theme cityOut lit by the hour, fpdCityJungle; halls below; an RS-756 cached floor 1 made afresh |
| rs758 | the Lost City's entrance (o3LostCityGate: temple-pyramid, sun, serpents, shrine, vines) and generator 27's owJungleRoom - every Lost City in its jungle |
| rs759 | the pen menus stay open (buy one or a pen-full, butcher one or all); butchering shown: led up, cleaver, two chops, blood and feathers, toppled, a pool, gone; walking off cuts it short |
| rs760 | the Lost City's pyramid centred on its way down; a flight down ends in a stone-framed doorway under the wall, walked into and out of sight |
| rs761 | garden beds' hover plates: the crop, its stage, time to ready, watered or not; empty or ready to pick |
| rs762 | a tail over a robe under a cape: out through the robe, down under the cape, out below its hem - never through the cape, never inside the robe over a stride |
| zloot | probe: the drops at a few levels - rarity shares, names with their bonuses and tiers, a rare's tooltip text (ZL levels, ZN drops a level) |
| zloottip | probe: a rare's, a magic piece's and a Ring of Recoil's tooltip, plain and with Alt held, as shots/zloottip0-3.png |
| rs703 | A spell leaves the staff as it comes forward: a real cast at a foe three tiles off, sampled every frame - the bolt waits about half a second, leaves from the staff's head as it leans ahead, its sound with it; the foe flinches (and a miss splashes) only as it lands; the cast lasts about a second; a foe it kills stands till the bolt lands, and the staff isn't put away mid-cast |
| rs702 | Casting with a staff flows: the cast eases out of your guard and back into it with no jump, its moves smooth all through, the staff upright overhead as it's raised and pointing ahead at the thrust - two-handed and one-handed with a tome. Shot: shots/rs702.png |
| rs701 | What's in the off hand while you chop: a tome is put away while your hands are on the axe and is back in the left hand when you stop; a shield stays slung on your back through the swing |
| rs697 | Felling a tree: you walk up to the trunk (an axe's reach from it; RS-698: the tree well over your head, its crown up above the cut; RS-699: side-on, the tree on your left, the axe back over your right shoulder and swung round from your right, both fists on the haft all through - the right up toward the head, the left at the butt; RS-700: the arms out long, nearly straight at the blow), the tree stands on its own while you chop (out of its chunk); wound up, the axe is over your shoulder and the body turned away; at the blow its head is at the trunk at waist height, the body turned into it; the left hand stays on the haft; real blows throw chips (which lie on the ground), shake leaves down, jolt the tree and cut a notch that deepens with the logs taken; stopping walks you back and puts the tree back in its chunk; the last log fells this tree, a stump left. Shot `rs697.png` |
| zsea | probe: the Drowned Temple from the four camera turns (shots/zsea-r<n>.png) and twelve frames of its walk-in (shots/zsea-walk.png) |
| rs670 | a tap whose lift was lost (the page stalled) doesn't swallow every later tap as a pinch; a hidden page lets every finger go; a click-walk over a Planet's seam reaches the far side (its steps kept over the frame switch, a diagonal step over the edge allowed) |
| rs669 | dye a cape inside a building and step out: the town's figure (parked while you were inside) is dressed again; a town's plate on the land says what it is as big as its name |
| rs668 | the Dwarf Gate: every mine at a mountain's foot (generator 21), the gate looking out from it; stepping on, the runes wake, the stone leaves swing in, you go on into the mine and they shut behind you |
| rs667 | no white ring round the boat: sailing on open water, the boat carries no patch of foam under its hull |
| rs666 | after leaving a barrow you can walk again: the figure stands 1.05 out at the door, and a step no longer waits for it to reach the tile's middle |
| rs665 | no risk window when you step onto a dungeon: every kind of site takes you straight in at the standard risk |
| rs664 | no sheer turf beside the barrow's door: the bank comes forward beside the door past the lintel, nowhere steeper than about 65 degrees, the doorway and stair clear (every barrow near the start) |
| rs663 | the barrow's door dug into its mound: one sheet of turf up behind the lintel to its top, a bank either side down to the ground past the facade, none over the doorway or stair (every barrow near the start) |
| rs661 | the barrow's mound runs out into the land: wider than tall by far, its edge sunk under the ground, its skirt washed toward the land's colour (every barrow near the start) |
| rs660 | the last town hitches: a town's point lights padded to a floor of ten from the start, so a room with more lights than the town (the tavern's nine) keys the same programs and its first entry builds none; the robe's shaping yields to the next sculpt try when the budget is spent |
| rs659 | a Planet's loose ends: the chart's trees and peaks drawn upright on the globe's turned faces (a bare chart, a turned glyph layer per face), the landmarks and pins turned too, a stipple instead of hatching on a cube planet, roamers scaled to the land on every size, generator 20's neighbour loops over face edges |
| rs658 | the room-entry and first-floor hitches: the town's palette made once per race and theme and cloned per build, the hearth's grill made in idle time, the post passes compiled against the targets they draw to and the occlusion's depth stand-ins so the first frame below ground links nothing, the people slice tracking the shortest frame |
| rs657 | the town's hitches: a cloak's forty settling steps spread over frames when a cloaked figure comes near (stepped by hand they still settle at once); the shadow passes' programs linked in the prelink with the scene's, so a room's first torch shadow links none; newcomers made mid-play unseen until their programs are linked |
| rs654 | a Planet's turned faces audited: framed off the front face, the plants keep off the gathering trees and the landmarks' feet, the winter ice lies on the frozen water, the far land is laid in the frame you're in, a treasure map's mark stands at its tile; a medium world as it was |
| rs652 | a barrow's sunken stair: the land is cut open in front of its door (no ground in it, a finer patch round it), no water or plants in it, and the walk goes down the steps to the door and into the dark |
| rs651 | a dungeon on the land is a barrow you walk into: you stop clear of its door, Enter walks you up the forecourt, eyes look out of the dark, you go in and down as the dark takes the screen, then floor 1 |
| rs650 | the bar at the top names the rarer lands painted over the ground (haunted forest, jungle, volcanic land, snowy highlands, crystal wasteland) on a medium world and a Planet; plain grass is still grassland |
| rs649 | a landmark first seen from far off (hidden past a Planet's horizon) is drawn where it stands once you come near, its click box with it, and a click on it reaches it |
| rs647 | on a Planet everything goes where the curve puts the land: the sprites bend with it, a town's name sits where the curve has drawn the town, a click on a dungeon a little way off reaches it, a landmark past the horizon is hidden and one near is seen, and the animals of the old frame are freed when it changes |
| rs646 | nothing builds up on the graphics card over a session: rounds into the same dungeon (three floors, its monsters killed) and out leave the dungeon renderer with as many textures and shapes in the last round as in the second, the templates kept at their cap, and a released model's bones' texture freed |
| rs645 | the fps meter's diagnosis on a phone: with no GPU timer it reads each frame's own time (and says so), starts from a double tap, has a dungeon's steps (its torches' shadows, the figures, the cloth, the post-processing, the ambient occlusion, half the resolution) and puts everything back when it stops |
| rs644 | more of a Planet's world in its place on the turned faces: a bridge stands on its own tiles in the 3D land (no plank out at sea), a town is built by its tile in the world (its people and size), a ferry's pier runs out over the water; on the globe's chart a name drawn by two faces' charts turns the same in both, so its halves meet over the seam |
| rs643 | the 3D land's ground in its own colours on every face of a Planet: framed on each face, the ground at every frame tile is its stored tile's (o3Ground read it through the frame a second time); stood in a tundra and a desert off the front face, the land laid in their colours; the map's places the same whichever face you're on; a medium world as it was |
| rs642 | a cube Planet's globe chart without seams: every face that shows has its own chart (every point of the globe on the screen under its own face's), the tiles past a seam the grid doesn't join copy the land across (no inked coast there, its fog the land's), no name out in the void, a line across the void lifted, writing kept on its face, a click across the seam read on that face's chart, turning smooth; generator 19 makes a forest or a desert over a seam one place, generator 18 keeps its places; a generator 14 planet keeps its one chart |
| rs641 | the globe turns any way, as far as you like: dragged down it rolls over the north pole and on down the far side, upside down; a drag across then still moves the land the way you drag; a flick carries on; swung round to a place it comes north up; close in and rolled over, the chart redrawn with its writing upright; a generator 14 planet rolls over its pole too |
| rs640 | a Planet's spacing set to the other sizes': roamers in proportion to its land (one to some 237 tiles, up to 150), generator 18 trimming its dungeons, graveyards and mines to a site per 160+ tiles of land, the same after a save and load; a generator 17 planet keeps its sites and the medium world its 50 roamers |
| rs639 | the names, badges and level tags on the globe's chart stand upright on the polar faces: each turned back about its own place by the angle the face's grid lies at on the screen |
| rs638 | the game's own searches go over a Planet's face edges: a route from the north face onto L found by both planners, its steps landing on the stop, walked to the end; the minimap shows the land past the edge |
| rs637 | generator 17: no narrow seas on a Planet's face edges, small seas only at the eight cube corners, land over the edges with the ground matching across them about as often as inside a face; a generator 16 planet unchanged |
| rs636 | the hand-written shaders on the open land bend with a planet's curve: fishing ripples, bubbles and glows (and rain, fireflies, spell sparks) no longer hang in the air from afar |
| rs635 | no glowing ring on the ground round a gathering spot on the open land; the spots still there to click |
| rs634 | walking works on every face of a Planet: the arrow keys and a click on the ground move you on faces other than the middle one, the figure measured where it is drawn |
| rs633 | generator 16: land, rivers and roads run over four of the seven unjoined cube edges (the seas there gone), seas left only on the back face's three edges and the middle face's corners, nothing left in the void, a walk on foot over the north face's edge continuous with land drawn past it |
| rs632 | the 3D land's frame on a cube-sphere: the lookups exact both ways, the north face's frame that face, sailing over its edge continuous, the frame changing a few tiles in with the camera turned so a key walks the same way, sites clicked at their world place; flat worlds untouched |
| rs631 | a Planet's 3D land bends away round you: the curve in three's shared vertex chunk, one uniform shared by every material, on only for a planet's open land and cleared after; clicks find the bent ground; other sizes flat |
| rs630 | generator 15: a Planet is a cube-sphere of six 124-tile faces: every tile to the sphere and back, a step over each of the 12 edges lands beside it, tiles near one size, land over the joined edges, the preview a world map; a generator 14 Planet unchanged |
| rs629 | a Planet is round: sailing west off the edge comes in at the east and back, sight revealed across the seam, the 3D land rebuilt on the far side; other sizes still stop at the edge |
| rs628 | on a Planet world the map is the globe at every zoom, the chart laid over it: opens turned to you, a town found and a pin dropped by clicking the globe, turns where the map is moved, zooms from the whole world to the chart's nearest, smooth to drag; other sizes keep the flat chart |
| rs625 | the Planet size (generator 14): plates, about a third land, ranges where plates push, deserts in the dry belts, tundra poleward, sea down the seam and at the poles; world code W, saves and loads; zoomed right out the map is a globe you drag to turn and zoom back into the chart; other sizes unchanged |
| rs624 | the first kill has no long frame: hitsplat digits stamped from a sheet drawn at start-up (text only for non-digits), the Last Foe portrait an image drawn once per foe |
| rs623 | provinces: every town the seat of a named province with a ruler and a foe, far land and townless islands wild marches, all land shared out; entering names it; borders on the world map and preview |
| rs622 | world generator 13: sea cliffs high to their lip with deep water below, never by a road, pier, site or river, never lone, dark on the preview; none in a generator 12 world |
| rs621 | world generator 12: roads on lower ground than generator 11, island ferries landing nearer their towns, signposts where roads meet |
| rs620 | the HUD fonts (the hitsplat's 800 weight, which the page never loaded) fetched and drawn while the game starts |
| rs619 | the world preview in clear colours (grass lighter than forest, bright rivers, pale ranges) and no Wilderness: no band, no level, an ordinary death with a grave where it lay, its achievement now The Far Reaches |
| rs618 | world generator 11: ranges in chains, wind-borne moisture, more rivers running together, green banks, no specks, towns on fair-sized land; the same seed remakes the same world; a generator 10 world comes out exactly as before |
| rs616 | on a phone the roads are painted into the ground as on a computer (no old strips), the rest of the painted ground off (runs on an emulated phone) |
| rs615 | a raised house (stilts in a marsh town, a hill terrace) has a stair up to its door; you climb it walking in and come down it walking out |
| rs614 | the land build's end no longer walks the road mask's bytes (the merge under 40ms), and the mask is painted a few stretches a slice, the same as in one go |
| rs613 | the Serpentskin Shroud a robe of snake's skin: scales and diamonds on its skirt and chest alike, glossier, green-edged unless dyed; other robes keep their weave |
| rs612 | a unique named as a robe (the Serpentskin Shroud) is drawn and named as one, still a Defence piece; an old one is put right on load; other uniques keep their look |
| rs611 | a raised minion crawls up out of the ground: sunk and hunched at first, earth thrown up, its ring hidden, then standing ringed on the floor |
| rs610 | raised minions on the coarser dungeon grid (a ghost under 110,000 triangles, a skeleton under 260,000 with at most 24 shadow casters), a ghost's shroud front-sided, a dungeon creature's template the coarse one |
| rs609 | into a dungeon's portal: walked up to the gate, it flares, drawn in shrinking and turning, then the road at full size; a robe's top carries none of the hem's runes |
| rs608 | a robe in at the waist as the body under it, its cloth over the shoulders' tops to the neckline with no bodice showing, the figure in the world in the same weave, and a monster's death with no boneTransform warnings |
| rs606 | the robe over the shoulders to the neck in one cloth with the shoulders and sleeves, its weave laid as theirs, its top in to the neck; RS-607: the weave blended three ways, kept under the rim light |
| rs605 | a dungeon ready in seconds again (not the half-minute shader wait), and the canvas cleared as a new place is built |
| rs604 | a robe in one piece, its cloth up over the chest to the shoulders; no automatic resolution drop |
| rs603 | making "all" counts it: the cooking card says 0 / 7, and what's queued after by its number |
| rs602 | floor after floor, nothing left behind on the graphics card (shapes and pictures hold level) |
| rs601 | a real fight below ground: bodies lie a few seconds and go (no turn of the land needed), never more than a dozen at once |
| rs600 | walking a dungeon only the two torches nearest you redraw their shadows, you cast from them alone (the shadow pass split), the catacombs' skulls and bones cast none |
| rs599 | the tavern's stairs walked up and down before the other floor, off the far end onto the landing; the willow's canopy throws its whole shadow |
| rs598 | below ground you face a foe on the diagonal and a vein at an angle; a gathering spot's disc glows at its rim only |
| rs597 | solid shadows under the trees again: no leaf masked for a dapple |
| rs596 | no road on a mountain or over water, none worn up a steep bank; trees' shadows dappled, leaves drawn whole; rain dims the sun and fills the sky |
| rs595 | the wind slowed (the plants' lean wave, how fast they follow a gust, the gusts' pace) and the dungeon torches' soft waver |
| rs594 | sat at the campfire in a robe and a cape: no cloth worked a frame, the cape still hung; up again, cloth again |
| rs593 | no god rays on the open land: no shafts of light through the woods at any hour |
| rs592 | the walks between scenes: a door swings open before you go in, the town gate opens as you come near and you walk out through it, the stairs walked down into the dark before the next floor |
| rs591 | roads traced into smooth curves and painted into the ground (verge, bed, ruts, lane strip, old paving), no grass on the bed, no tile-square dirt, stones by the road, the road texture built fast, the old strip on low graphics |
| rs590 | a robe's cord low on the waist in the robe's trim colour, tied with a bound knot and two tasselled ends |
| rs589 | the book shut at your side in the barber's chair |
| rs588 | a seated robe folded once and kept (no refolds a frame), up again the seat forgotten; the hearth's grill out on the hearth stone |
| rs587 | the treasure room's door at the room's face, the wandering merchant in a boat on open water, a roamer clicked to chase and fight, a grill over the hearth fire, lighting a campfire compiles nothing |
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
| touch | on an emulated phone: real taps, a long press, a pinch and a drag drive the game, and the touch UI keeps up |
| bal | the RS-100 balance: monsters bite harder, the lair boss has fixed strength, the world-boss giant is a real fight |
| gen | RS-102 world generation: mountain ranges, an open start, nothing out of reach, old saves untouched |
| grave | the gravestone card in the tracker: dismissed (the grave stays), F6 brings it back, a new death shows it again |
| clock | RS-104: day and night on a real-time clock, 20 minutes of day and 10 of night; steps don't move the sun |
| tasks | the town's task board: a task is taken, worked and handed in for its reward |
| soak | a long fight at combat level 70: nothing leaks or stalls over many turns |
| pace | RS-119: a fight you can see - one attack per beat however fast you click; a bow or spell stops walking in range |
| fpdres | RS-107: the dungeon view's resolution steps between a few fixed sizes and doesn't see-saw |
| map | the world map: its geography, drawn in good time, and what it marks |
| wev | the open land's events: set up, ticking, and played through (random world - rerun once if it fails) |
| wg | the world generator: the land as made, checked over (random world - rerun once if it fails) |
| sail | an archipelago: islands to find, a boat to sail between them |
| big | the house and Construction, and the other large systems played through end to end |
| town | a town played through: its buildings, people and services (random world - rerun once if it fails) |
| folk | RS-117: townsfolk step out of your way and walk in real time whether or not you move |
| eco | the economy: shop stock, prices and selling, with the 3D off |
| gfx | the graphics settings: each level draws, and switching between them holds up |
| quest | quests: given, tracked, worked and finished |
| audio | the music and sound: the title track, then the right music and sounds as you play |
| lootstyle | RS-169: drops lean to the way you fight - a mage finds staves and robes, an archer bows and hide |
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
| zenterroom | stepping into a building the real way (standing near its door first, then in): the frames over 16ms with what ran in them, the sculpt's inner steps timed, the benches by kind, and the driver link stalls by program - with whether the program was prelinked and whether its link was already complete (a stall after a complete link is the driver finalising a program on first use, once a session) |
| zfloors | going down floor by floor from a fresh character: each floor's wall time, longest main-thread task and fresh programs, with the CPU profile's long runs and their top functions (`ZFLOORS` floors below the first). Found RS-656's per-floor freeze |
| ztavern2 | the tavern's lights round the hooded figure's corner: every main lamp with its distance from the corner, the candles, the layout near it (for t_rs382) |
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
| zcamp | the open land's frame with no camp, a campfire and a fire with a tent: frame times, draw calls, point lights and programs |
| ztavern | a tavern at night: frame and CPU times with the hearth fire, the cook rigs and the people each taken out, the heaviest meshes, a CPU profile |
| zsit | what changes a seated robe's fold from frame to frame, and who calls the normals |
| zcord | a robe's cord height, where its cloth starts and its top, on a woman and a man |
| zroad | the roads on the open land: far, close and by a town's gate |
| zdoor | walking into a building: the door's hinge, frames part way through |
| zcamp2 | the open land's frame by the game's own timers, camping in a robe and cape: no camp, fire, tent, each piece off, the cloth calls a frame |
| ztree | a tree's shadow at midday close in: as it is, leaves hidden, the sun's shadow off, in rain |
| zroadbad | road points that land on a mountain or the water, and where in their chain they sit |
| zsavewalk | a save (ZSAVE) walked where it stands: frame times, the 3D and GPU timers, draws, triangles, programs, slow frames, the heaviest meshes, a CPU profile |
| zfloorgrow | what piles up on a dungeon floor (fresh, after its monsters die, after leaving and coming back); ZSAVE for a save |
| zfloorplay | a minute of real fighting on one floor, every ten seconds the frame and what could pile up, then leaving and coming back |
| zfloorleak | ten trips between two floors: geometries and textures after each, what was drawn and never freed |
| zrobe | a fine robe close in on a woman and a man, front, three-quarter and side |
| zenter | into a dungeon, another, and a roadside fight: how long each takes to draw, the sculpting and warm-up frames, what holds it up |
| zuv | how the robe's pieces lay their weave: bodice, skirt and sleeve vertices, position against uv |
| zwaist | a woman's body under a robe: the bodice's, pelvis's and cloth's breadth and depth by height (ZW sets the waist slider) |
| zdeath | what a monster's death costs a frame, with a CPU profile over five deaths |
| zworld | the player's robed figure in the world: which scene draws it and with what materials |
| ztavout | into the tavern and out again by walking, in a robe or from a save (ZT, ZH, ZSAVE), with any error on the way |
| zminion | what raised minions cost a frame (ZK kind, ZN count): frame and GPU times, draw calls, triangles, and each figure's parts, with a shot |
| zsk3 | the sculpted skeleton's and a ghost's parts by triangles |
| zrise | a raised minion's rise frame by frame: its age, height and lean as drawn |
| zdelve | a cave, a grotto and a ruin delve with the real warm-up on: the entry frames, then a steady stretch |
| zroadms | what the land's road mask costs: tracing the roads, painting the mask |
| zwalkprof | RS-505's walk at a phone's pace with a CPU profile and the land swap timed |
| zsaves | every save in ZSAVES loaded and played a moment: any error, where it stands, what it kept |
| zstilts | a marsh town on stilts (ZH=hill for a hill town): the tavern's stair, and you on it walking in (ZMS ms after the step) |
| zworlds | a dozen worlds side by side (ZN, ZSEEDS): maps, difficulty bands and numbers - writes Downloads/Depthcrawl world maps.html and shots/zworlds.png |
| zvolcroad | where the road builder finds the volcano, against where the finished world has it |
| zstill | RS-565's world: river tiles the flow left still, with the ground round each |
| zroadms | heads with each hairstyle from four sides, and under helmets |
| zplate | plate armour on builds from slight to heavy |
| zunder | the creator's undressed figures by race and sex |
| zphone | a save (`ZSAVE=path`) on an emulated phone with the CPU slowed 4x: frame times and a CPU profile |
| zphone2 | a save (`ZSAVE=path`) on an emulated phone: draw calls, triangles, shadow casters, GPU ms |
| zkill | the frames after several kills: interval and frameLoop CPU per frame, plus a GPU trace of the longest events (`ZOFF=art/foe/hud/splat` switches a part off) |
| zkill2 | the 2D canvas draw kinds seen for the first time after a kill |
| zplanet | Planet worlds (`ZSEEDS=a,b`): generation time, terrain shares, temperature and moisture spread on land, each preview as shots/zplanet-<seed>.png |
| zplanet2 | what the tiles are at given points of a planet (`ZSEED`, `ZPTS=x:y,...`) |
| zglobe | a Planet world's globe from several turns and facing the seam (`ZSEEN=1` reveals the map): shots/zglobe-<n>.png and frame times |
| zglobe2 | RS-628's globe map at the zoom it opens on, zoomed in, nearest, the whole world and up north (`ZSEEN=1` reveals the map): shots/zglobe2-<name>.png and frame times |
| zcurve | a Planet's 3D land zoomed right out, with the curve (shots/zcurve-on.png) and without (zcurve-off.png) |
| zframe | RS-632's frame: the 3D land on the north face and sailing west over its edge, with the frame, the camera's turns and the player's place at each step |
| zmove | does walking work: real arrow keys and a click on the 3D ground, on a medium world and a Planet |
| zmove2 | where a step fails on a Planet: each stage of a move by hand |
| zmove3 | a click on the 3D ground walks you there, on a Planet, on three faces |
| zfirstdg | a fresh character's first dungeon straight from the world preview (no land or town first): every frame over 25ms from the step in, with the m3d/fpd/gfx calls in it and M3D_COARSE at each m3dInstance |
| zroomcompile | what a room's prelink costs (`ZSAVE`, `ZROOM`): the programs its entry makes, each with its material and object, the lights in the town and the room, and r.compile's time on the room's scene once its programs exist |
| zroomlights | the point lights of each room against the town's ceiling (`ZSAVE`): a room with more than the ceiling keyed every program afresh before RS-660 |
| zpole | a cube Planet's globe looking at one face (`ZFACE`, its thickest woods or `ZAT=x,y`) at a few zooms (`ZZOOM`), with each face chart's draw time and its glyph layer's share; `ZCLIP=1` saves the middle at full size: shots/zpole-&lt;face&gt;-&lt;zoom&gt;.png |
| zseam | a cube Planet's globe looking straight at its face edges (`ZSEAM=tl,fr,bl,tb,dr,c`, `ZZOOM=0,2.2,5`; `ZCHART=1` saves the chart laid over it, `ZCLIP=1` the middle at full size): shots/zseam-<edge>-<zoom>.png and where the seam lies on the screen |
| zbiome | the land's colours in each view: stood in the middle of a desert, a tundra, a grassland and a forest (`ZTIER`, `ZKINDS=desert,tundra`), the 3D land with its minimap (shots/zbiome-<kind>.png), the globe's chart close in (zbiome-<kind>-map.png) and the globe right out (zbiome-globe.png) |
| zsession | does anything build up over a session: `ZROUNDS` rounds into the same dungeon (three floors) and out - the scenes' objects, the renderers' geometries, textures and programs, the templates kept, the heap and the frame times after each (`ZTIER`) |
| zleak2 | what's taken out of a 3D scene and never disposed of, by kind and by the code that took it out |
| zleak3 | the textures made and kept, by where in the game they were made (and copied) |
| zleak4 | geometries and textures a renderer uploaded that nothing uses any more (`ZTEX=1` textures only, `ZTIER`) |
| zlandmark | a Planet's landmarks in the 3D land, stood some way off each (`ZDIST`, `ZKIND`, `ZTIER`): where it is in the world and the frame, whether it shows, with a shot each |
| zstuck | loads a save (`ZSAVE`) and reports what blocks a click-walk: the flags, the figure's lag, a walk to each neighbour |
| zsiteiso | a walk-in site (`ZK` mine/graveyard/lair/pyramid/dungeon, `ZOPEN` seconds looked at, `ZD` the sheet camera's distance) in its place on the land at the four turns, and alone on a green from eight angles, shut and open |
| zlair | the dragon's lair (RS-674): the game beside one (`zlair-land`), the lair alone from four sides asleep and awake (`zlair-iso`), twelve frames of its walk-in as the game draws it (`zlair-walk`), and how long a lair takes to build (`build` with the dragon's template made afresh, `again` from it); `ZPOSE=1` adds the dragon close up at eight moments of the walk-in (`zlair-pose`) |
| zpyr | the Folding Stair (RS-679, was the Sun-Slab Tomb of RS-675): the game beside a pyramid (`zpyr-land`), the pyramid alone from four sides shut and opened (`zpyr-iso`), twelve frames of its walk-in as the game draws it (`zpyr-walk`) and its build time; `ZPOSE=1` adds close views of the stair at eight moments (`zpyr-pose`) |
| ztemple | the Drowned Shrine (RS-677): the game beside a sunken temple (`ztemple-land`), the shrine alone from four sides shut and opened (`ztemple-iso`), twelve frames of its walk-in as the game draws it (`ztemple-walk`) and its build time; `ZPOSE=1` adds close views of the stair (RS-681) at eight moments (`ztemple-pose`) |
| zseamwalk | walks eight steps over many of a Planet's face seams by the key path and click-walks on, reporting any step or click that fails (`ZN`) |
| zseam2 | click-walks over a Planet's seams on the water: sailing in summer, the winter ice, a boat in winter (`ZSAVE`, `ZN`); reports crossings that stop short or freeze |
| zcorner | a Planet's cube corners (the last narrow seas): a route and a sail over each (`ZSAVE`); reports a freeze with the state then |
| zlut | a Planet's frame lookups on every face: unmapped tiles, clashes, round trips |
| zhudscan | every tile of a world as the place you stand: does the top bar, the area, the place or the province throw (`ZSAVE`) |
