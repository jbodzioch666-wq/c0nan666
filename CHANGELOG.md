# Depthcrawl patch notes

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
