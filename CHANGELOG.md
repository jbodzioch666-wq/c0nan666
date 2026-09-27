# Depthcrawl patch notes

## v154 — Monsters in 3D, part one

In first person, monsters are becoming real 3D models instead of painted cut-outs. This update covers every humanoid and four-legged beast, 108 kinds of creature in all. The rest follow in later updates.

### Humanoids
- **Covered:** goblins, kobolds, orcs, hobgoblins, gnolls, bugbears, ogres, trolls, giants, fiends, cultists, knights and every other two-legged foe.
- **Built to match its painting:**
  - the face, with pointed goblin ears, orc tusks, kobold snouts, gnoll muzzles, fiendish horns, hooded faces with glowing eyes, and golem heads;
  - its skin and outfit: robes, rags, leather, chain, plate with pauldrons, fur, loincloths, or a body of living stone or ice;
  - helmets, crowns, capes, tabards, wings and tails.
- **Weapons and shields:** each one wields its real weapon, from the same 3D models you fight with, and carries its shield on its arm.

### Beasts
- **Covered:** rats, wolves, dire wolves, winter wolves, bears, panthers, boars, elk, jackals, owlbears, displacer beasts, the rust monster and the manticore.
- **Built from their parts:** each has its own head, fur, tail, claws or hooves, plus manes, bristles, antlers, carapaces, wings or tentacles where they have them.

### Alive
- **Idle:** monsters breathe, turn to face you, and walk with a real stride when they move. Beasts stand side-on and look about until they strike.
- **Attacking:** humanoids draw their weapon back over the shoulder and bring it down, and beasts lunge.
- **Hit and killed:** a hit makes a monster flash and flinch, and a killing blow knocks it over.
- **In the world:** monsters are lit by the torches and your lantern, are hidden properly behind walls, and cast a soft shadow on the ground.
- Skeletons keep their sculpted 3D model, and every other creature keeps its painted figure for now.

### Fixes
- Roadside fights were quietly falling back to the old flat renderer after the graveyard update. They now use the full 3D view again.

## v153 — The crypt and the catacombs

Graveyards are now a real place: carved headstones and stone tombs up top, a crypt holding the way down, and catacombs below.

### The graveyard
- **Tombs:** every tomb is a real stone mausoleum:
  - a weathered, rain-streaked body on a plinth, with corner pilasters and a cornice;
  - a gabled roof topped with a cross, or a stepped top with a stone urn;
  - a framed, riveted iron door, or a sealed slab carved with a worn inscription.
- **Headstones:** real carved stones in five shapes: round-topped, shouldered, plain crosses, Celtic crosses with a ring, and obelisks. They're weathered and spotted with lichen, a little tilted, and lettered.
- **Graves:** each headstone stands over its grave, either a grassy mound or a stone ledger slab.
- **The crypt:** the way down is inside a large walk-in crypt in the corner of the plot:
  - a pitched roof topped with a cross;
  - a columned porch with its own small gable over the doorway;
  - a stone hall inside, with candles burning and the stair down at the back.

### The catacombs
- Every floor below a graveyard is now catacombs, a warren of burial passages and chambers. Before, every floor was another open graveyard.
- Their walls are lined with two rows of real burial niches cut into the stone. The niches hold:
  - skulls resting on heaps of bones;
  - bodies wrapped in shrouds;
  - little clusters of candles.
- Heaps of bones and skulls, and guttering candles, line the passages.
- Wall torches light the catacombs.

## v152 — Under open skies

The graveyard and every roadside fight now use the new 3D renderer too, so all of first person is in full 3D.

### Roadside fights
- **Sky:** a real sky with drifting clouds by day, and stars and the moon by night. Clouds thicken in rain and storms, and an overcast night has no stars.
- **Sun and moon:** the sun, or the moon at night, lights the field and casts shadows from everything standing on it.
- **Horizon:** the land runs on to the horizon, with a far tree line in forests and marshes, and rolling hills in deserts and snowfields. It fades into the haze and vanishes in thick fog.
- **Obstacles are real objects:**
  - leafy bushes in forests and marshes;
  - boulders on rocky ground, in the desert and in the snow;
  - stacked cargo crates and a barrel on a ship's deck.
- **Grass:** forest and marsh grass is a carpet of real blades swaying in the wind.
- **Water:** marsh water is dark and murky instead of sea-blue, and the sea runs to the horizon beyond a ship's deck.

### The graveyard
- The wrought-iron railings are real see-through fences with spear-tipped bars and stone posts.
- Mausoleums stand as solid little tombs, with their gabled roofs against a starry sky.
- Grass sways between the graves, and a dark tree line rings the plot.

### Fixes
- Your lantern in dungeons now has its proper brightness and reach. The previous update had left it at a fixed default.

## v151 — Deeper dungeons

Dungeons in first person are now drawn by your graphics card in full 3D, instead of the old software renderer.

### Sharper stone
- The view is drawn at your screen's full resolution, so walls, floors and ceilings are crisp instead of chunky.
- Stone has real depth: mortar joints, cracks and chisel marks catch the light and cast tiny shadows as you move past.
- Floors have a faint sheen, and pools of water are glossy.
- Lava seams, glowing runes and gold ore shine on their own in the dark.

### Light and shadow
- Every nearby wall torch is a real light: it throws a warm pool across the floor and walls, and casts shadows around pillars and corners.
- Your lantern lights the stone around you, and the dark closes in beyond it.
- Corners are softly shaded where walls meet the floor and ceiling.
- Dust drifts in the air around you.

### Built like a dungeon
- Square stone pillars stand wherever a wall turns a corner.
- A low stone plinth runs along the foot of every wall.
- Corridors have ribs across the ceiling. Mines and keeps are shored up with timber frames: a post on each side and a beam overhead.
- Up-staircases climb into a dark stairwell in the ceiling.
- Every site keeps its own look: stone halls, castle keeps, necromancer towers, overgrown temples, mines and lava lairs.

### Performance
- If your computer struggles, the dungeon view lowers its resolution until it runs smoothly, then raises it again when it can.
- If 3D graphics aren't available, the game falls back to the classic renderer.

## v150 — Every weapon fights its own way

Each weapon type now has its own grip, stance and attack in first person, modelled on how melee games handle first-person weapons.

### Grips and stances
- **Swords, scimitars, sickles:** held upright at your right side, ready to cut.
- **Daggers:** held low and point-forward, close to the body.
- **Rapiers:** held point-first toward the enemy in a fencing line.
- **Greatswords, greataxes, mauls and halberds** are held upright in a proper two-handed grip:
  - the right hand high on the grip, by the guard, with its arm coming in from the lower right;
  - the left hand just below it, with its arm coming in from the lower left;
  - both sets of knuckles face forward, with the fingers wrapped round the grip toward you.
- **Axes, maces, hammers, clubs, picks, morningstars:** held upright by the haft, head up and ready to fall.
- **Spears:** both hands on the shaft and the point levelled at the enemy.
- **Quarterstaves:** both hands on the staff, held across your body.
- **Unarmed:** both fists raised in a guard.
- The flail's head hangs from its chain and sways as you move.

### Attacks
- Swords **slash** across from upper right to lower left.
- Daggers **stab** forward; rapiers **lunge** with a long reach.
- One-handed axes and blunt weapons **chop** down from overhead.
- Greatswords **cleave** in a heavy two-handed arc.
- Greataxes, mauls and halberds **smash** down with a long windup.
- Spears **thrust** straight out; staves **sweep** across.
- Fists **punch** straight ahead.
- The flail whirls its head round on the chain as you swing.
- Hits connect with a brief hitstop, and heavy blows jolt the view.

### Feel
- The weapon lags a little behind when you turn and bobs as you walk.
- Your arms follow your hands, with slim leather sleeves and steel cuffs.

## v149 — Steel in hand

### First-person weapons in 3D
- The weapon in your hand in first person is now a real 3D model instead of a flat painting, gripped in an armoured gauntlet.
- Every weapon type has its own model:
  - **Blades:** a dagger, shortsword, longsword and greatsword, a curved scimitar and a swept-hilt rapier.
  - **Axes and picks:** a hand axe, battleaxe and double-headed greataxe, a sickle and a war pick.
  - **Blunt weapons:** a knotted club, a light hammer, warhammer and maul, a flanged mace, a spiked morningstar and a chained flail.
  - **Polearms and staves:** a spear, a halberd, and a quarterstaff topped with a glowing crystal.
- The weapon is lit by the torch or lantern light where you stand, and polished steel catches the light.
- Better weapons look better: rare blades have glowing runes etched along them, and uniques have gold fittings.
- Fire, frost and poison enchantments glow along the weapon, with drifting motes of their colour.

## v148 — Quests worth taking

Quests now send you to real places, track your progress on screen, and let you choose your reward.

### Quests with a place
- Every town's Captain of the Watch has their own board of three jobs, set in the land around that town:
  - **Conquer** a specific dungeon, keep, tower, temple, graveyard, mine or lair.
  - **Wanted:** hunt down a named villain, like *Skarn the Cruel*, who roams near where they were last seen.
  - **Break a camp:** storm a bandit hideout, orc raiding camp or cultist circle and defeat its chieftain.
  - **Rescue** a captive held on a given floor of a site: clear that floor to free them, then bring them home. If you fall, they're dragged back.
  - **Escort** a merchant to another town. They walk at your heels, and if you fall, they're lost.
  - The old errands are still around too: hunts, supply runs and deliveries.
- Each job tells you where to go, like "29 leagues south of Ingrid's Crossing", and uncovers that spot on your world map.
- Objectives are marked on the 3D land with a pillar of light and a floating **!** (a blue **?** when it's time to turn in). Wanted foes have a bounty marker, and camps have tents and a campfire.
- The world map shows a pin for each objective, with a dashed trail to the one you're tracking.
- When a site moves (a conquered site rises again somewhere else), any quest about it follows it to its new home, or points to the nearest site of the same kind. You're told where the new mark is.

### Quest tracker
- Your active quests sit on the right of the screen with live progress. Click one to track it.
- The tracked quest shows an arrow pointing the way, with the distance and direction.
- A banner pops up whenever a quest moves forward.

### Better rewards
- Turning in a quest lets you pick **one of three rewards**: a weapon, a piece of armour or jewellery, or a heavy purse with a rune.
- Harder jobs (conquests, wanted foes and rescues) offer a **legendary pick** in place of the purse: a unique item when one exists.
- Reward gear is always at least magic quality and matched to your level.
- **Town reputation:** every quest raises your standing with the town that posted it.
  - **Friend:** 5% off in its shops.
  - **Ally:** 10% off, and the peddler keeps an extra piece back for you.
  - **Champion:** 15% off, and the peddler's best stock is yours.
  - The Captain shows your standing and how close you are to the next rank.

## v147 — The open world

The overworld has been rebuilt as a 3D landscape, and the world map is now a painted parchment chart.

### 3D overworld
- The wilds are real 3D land, seen from the same angled camera as the town:
  - rolling grassland, dense forests, snow-capped mountains, sandy deserts, frozen tundra and murky swamps that blend into each other;
  - lakes, rivers and the sea under rippling water, with beaches along the shore;
  - oaks, pines, snowy pines, swamp willows, dead trees, bushes, rocks and cacti.
- Every place you can visit is a landmark you can see from a distance:
  - walled villages with chimney smoke and glowing windows at night;
  - cave mouths flanked by torches, and castles with towers and a flag;
  - a necromancer's spire with a floating violet light, and a sunken temple glowing teal;
  - graveyards with a crypt and drifting mist, mines with a timber entrance and a cart track;
  - dragon's lairs ringed by jagged rocks, with smoke and an ember glow.
- Village names float over the towns. Other landmarks show their name when you're close or hover over them.
- Roaming encounters and mythic beasts are marked on the land, so you can see danger coming.
- The sun moves across the sky with the in-game clock. Nights are dark with your lantern lit, and rain, fog and thunderstorms are real weather.
- You sail open water in a proper little boat: a curved plank hull with benches and rails, a mast with a striped sail and pennant, and a foam wake. You stand aboard, and it turns to face the way you're sailing.
- Click anywhere to walk there, or click a landmark to travel to it and go in. WASD still works, and the mouse wheel zooms.
- Zooming the camera out keeps you and the land around you clear; weather haze only closes in beyond that.
- **O** switches between the 3D view and the classic flat map.
- When you conquer a site, it disappears from the 3D land as soon as you come back out, and its replacement appears elsewhere.

### Painted world map (M)
- The world map is an old parchment chart that fills the screen:
  - inked coastlines, a blue-grey sea with ripple lines along the shore, and land washed in the colour of each region;
  - hand-drawn mountains, forests, marsh tufts, dunes and rivers;
  - every site in coloured ink, village names lettered on, a compass rose and an illustrated legend.
- Sites are bright icons on dark round badges, with a large illustrated legend.
- A big red "You" marker always shows where you are.
- **Fog of war:** land you haven't been near is hidden under drifting cloud until you explore it. Your explored map is saved with your game.
  - For saves from before this update, the land around every town you've visited starts uncovered.

## v146 — The 3D update

Everything since v145: dungeons in first-person 3D, a hub town you can walk around, hand-painted monsters, a new action-RPG HUD, loot that keeps up with you, and item comparisons you can trust.

### First-person 3D dungeons
- Dungeons and roadside fights can be played in first person. **M** switches between 3D and the classic top-down map.
- Controls:
  - **W/S** step forward and back, **A/D** strafe.
  - Arrow keys or **Z/X** turn. Turning doesn't use up your turn.
  - You can also click the edges of the screen to turn.
- Every kind of site has its own look:
  - stone dungeons, castle masonry, rune-carved necropolises, mossy temples, crypts, timbered mines and lava lairs;
  - grass, sand and snow fields under an open sky with stars and rain.
- Torches flicker, and you carry a lantern. There are floating damage numbers, particles and a visible weapon that swings in first person.
- A minimap, a compass, your current target, and warnings when you're being flanked.
- Stairs are real staircases: up-flights rise into the ceiling, and down-flights drop through the floor.
- The graveyard is outdoors:
  - no ceiling, a misty moonlit sky, and grass underfoot;
  - wrought-iron railings instead of walls, and free-standing mausoleums.
- Falling through a pit lands you on open floor instead of on the up-staircase, and the game remembers which floor you fell from.

### 3D skeleton warriors
- Skeletons are fully sculpted 3D models:
  - a hollow skull with a chattering jaw and individual teeth, and real ribs, spine, pelvis, hands and feet;
  - lit by the torch or moonlight where they stand;
  - drawn sharp at whatever size they appear on screen.
- They're dressed as barbarians:
  - a shaggy fur mantle, a strapped leather bracer, a buckled belt with a pouch, and fur-cuffed wrapped boots;
  - a rusted sword and a weathered round shield.
- They stand in a guard with the sword raised beside the head, walk, stagger when you hit them, and wind up and cut when they strike.

### Hand-painted monsters
- Every monster in the game has a painted portrait: humanoids, beasts, dragons, serpents, spiders, oozes, tentacled horrors, hydras, swarms and more.
- 30 undead in 9 painted styles: skeletons, zombies, ghouls, wights, spirits, mummies, a death knight, vampire spawn and liches.
  - Spirits float and are see-through, undead eyes glow, and corrupted undead have a violet taint.
- Monsters are shaded with lighting, rim light and glossy eyes. The same art appears in 3D, on the map, in the bestiary and on the Last Foe panel.
- Treasure, potions, scrolls, gear, portals, altars, thrones, headstones, ore, shops and torches are all painted objects too.

### The town hub
- Villages are a full 3D town seen from an angled action-RPG camera:
  - timber and stone buildings whose windows glow at night, chimney smoke, a smithy with sparks, and an alchemist's bubbling cauldron;
  - a market stall and a palisade with a torch-lit gate.
- Each town's look matches its region (forest, swamp, desert, tundra, mountain) and its people. Day and night follow the in-game clock.
- New features in town:
  - a **waypoint** on the plaza, for travel to any town you've visited;
  - a **stash** chest with 60 slots, shared between every town;
  - the **Captain of the Watch**, who now hands out quests (look for the ! or ? overhead).
- Every vendor is a named character standing outside their shop.
- Click the ground or a person to walk there. WASD still works, and the mouse wheel zooms.
- Buildings between you and the camera fade out so they never hide you.

### New action-RPG HUD
- The game fills the whole window:
  - life and charges orbs on either side of a skill bar that matches your hotkeys;
  - an XP bar, a character plate and a target frame;
  - a combat log that fades out.
- Stats and spells slide out as a drawer (**Tab**).
- A button switches back to the classic three-column layout if you prefer it.

### Loot that levels with you
- Drops now scale with what you're fighting instead of with the floor number.
  - Dungeon loot keeps pace with shop gear all the way to level 20. Before, it was about half as good by the endgame.
  - Roadside fights drop loot for your level. Before, it never improved.
  - Boss loot drops at the boss's level with a steady bonus. Before, it was always level 20, which was far too strong early and then never got better.
- Uniques get stronger as their item level rises.
- Newly unlocked base items and mods turn up more often around the level they unlock, and half of your gear drops are usable by your class.
- Potions, scrolls, wands, vaults and chests follow the same scaling, so the higher-tier potions can actually drop.

### Item comparison you can trust
- Upgrade arrows and the shop's upgrade/downgrade verdict now try the item on and score your whole kit with it, using the same maths combat uses. They count:
  - every mod, runeword and set bonus, including completing or breaking a set;
  - your stats, as your class actually uses them;
  - weapon proficiency, crit, deadly strike, elemental damage, life steal, regen, thorns, damage reduction and unique on-hit effects.
- Gear is scored against the real monsters around your level and against a boss, so armour class, attack and regen still count on a strong character.
- A weapon your class isn't trained with is no longer marked as junk. You can wield it without your proficiency bonus to hit, and it's compared on that basis.
- New rings replace whichever of your two rings you'd miss least.

### Fixes
- Bonus damage from anything other than your weapon now actually applies to your attacks:
  - +damage and +% damage from armour, jewellery, runewords and sets;
  - Dragonborn's Draconic Might;
  - the Battle Master, War Domain and Berserker subclasses.
- Crit bonuses from gear other than your weapon now count.
- The death recap log is no longer hidden behind the new HUD.

### Under the hood
- The game runs fully offline. The itch.io build includes its 3D library and fonts, so it doesn't depend on any outside site.
- If 3D can't start on a device, the game falls back to the classic painted and top-down views.
