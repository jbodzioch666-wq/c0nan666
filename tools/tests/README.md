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
