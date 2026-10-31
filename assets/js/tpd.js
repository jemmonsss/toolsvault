/* Minecraft Datapack Creator — app logic.
 * Depends on: TpcZip (assets/js/zip-writer.js)
 * State: project = { name, format, description, namespace, files: Map<path, {content, type}> }
 * path example: "data/minecraft/functions/tick.mcfunction"
 */
(function () {
  'use strict';

  /* ---------- Templates ---------- */
  var TEMPLATES = {
    functions: {
      ext: ".mcfunction",
      content: "# Datapack function\nsay Hello from <namespace>!\n"
    },
    advancements: {
      ext: ".json",
      content: "{\n  \"display\": {\n    \"title\": {\n      \"text\": \"Example Advancement\"\n    },\n    \"description\": {\n      \"text\": \"First advancement\"\n    },\n    \"icon\": {\n      \"id\": \"minecraft:stone\"\n    },\n    \"frame\": \"task\",\n    \"announce_to_chat\": true,\n    \"show_toast\": true,\n    \"hidden\": false\n  },\n  \"criteria\": {\n    \"example\": {\n      \"trigger\": \"minecraft:impossible\"\n    }\n  }\n}\n"
    },
    recipes: {
      ext: ".json",
      content: "{\n  \"type\": \"minecraft:crafting_shaped\",\n  \"pattern\": [\n    \"#  \",\n    \" # \",\n    \"  #\"\n  ],\n  \"key\": {\n    \"#\": \"minecraft:diamond\"\n  },\n  \"result\": {\n    \"id\": \"minecraft:diamond_sword\",\n    \"count\": 1\n  }\n}\n"
    },
    loot_tables: {
      ext: ".json",
      content: "{\n  \"pools\": [\n    {\n      \"rolls\": 1,\n      \"entries\": [\n        {\n          \"type\": \"minecraft:item\",\n          \"name\": \"minecraft:stone\"\n        }\n      ]\n    }\n  ]\n}\n"
    },
    tags: {
      ext: ".json",
      content: "{\n  \"replace\": false,\n  \"values\": []\n}\n"
    },
    predicates: {
      ext: ".json",
      content: "{\n  \"condition\": \"minecraft:entity_properties\",\n  \"entity\": \"this\",\n  \"predicate\": {\n    \"location\": {\n      \"biomes\": \"minecraft:plains\"\n    }\n  }\n}\n"
    },
    item_modifiers: {
      ext: ".json",
      content: "{\n  \"function\": \"minecraft:set_count\",\n  \"count\": {\n    \"type\": \"minecraft:uniform\",\n    \"min\": 1,\n    \"max\": 3\n  }\n}\n"
    },
    dimension: {
      ext: ".json",
      content: "{\n  \"type\": \"minecraft:overworld\",\n  \"generator\": {\n    \"type\": \"minecraft:noise\",\n    \"settings\": \"minecraft:overworld\",\n    \"biome_source\": {\n      \"type\": \"minecraft:multi_noise\",\n      \"preset\": \"minecraft:overworld\"\n    }\n  }\n}\n"
    },
    dimension_type: {
      ext: ".json",
      content: "{\n  \"ultrawarm\": false,\n  \"natural\": true,\n  \"coordinate_scale\": 1.0,\n  \"bed_works\": true,\n  \"respawn_anchor_works\": false,\n  \"min_y\": -64,\n  \"height\": 384,\n  \"logical_height\": 384,\n  \"infiniburn\": \"#minecraft:infiniburn_overworld\",\n  \"effects\": \"minecraft:overworld\",\n  \"ambient_light\": 0.0,\n  \"piglin_safe\": false,\n  \"has_raids\": true,\n  \"monster_spawn_light_level\": {\n    \"type\": \"minecraft:uniform\",\n    \"value\": {\n      \"min_inclusive\": 0,\n      \"max_inclusive\": 7\n    }\n  },\n  \"monster_spawn_block_light_limit\": 0\n}\n"
    },
    worldgen: {
      ext: ".json",
      content: "{\n  \"type\": \"minecraft:simple_block\",\n  \"config\": {\n    \"to_place\": {\n      \"type\": \"minecraft:simple_state_provider\",\n      \"state\": {\n        \"Name\": \"minecraft:stone\"\n      }\n    }\n  }\n}\n"
    },
    structures: {
      ext: ".nbt",
      content: "# Binary .nbt structures are not editable as text.\n# Import an existing structure file or leave this file empty.\n"
    },
    smithing_trim: {
      ext: ".json",
      content: "{\n  \"type\": \"minecraft:smithing_trim\",\n  \"template\": \"minecraft:sentry_armor_trim_smithing_template\",\n  \"base\": \"#minecraft:trimmable_armor\",\n  \"addition\": \"#minecraft:trim_materials\",\n  \"pattern\": \"minecraft:sentry\"\n}\n"
    },
    smithing_transform: {
      ext: ".json",
      content: "{\n  \"type\": \"minecraft:smithing_transform\",\n  \"template\": \"minecraft:netherite_upgrade_smithing_template\",\n  \"base\": \"minecraft:diamond_sword\",\n  \"addition\": \"minecraft:netherite_ingot\",\n  \"result\": {\n    \"id\": \"minecraft:netherite_sword\"\n  }\n}\n"
    },
    chat_type: {
      ext: ".json",
      content: "{\n  \"chat\": {\n    \"translation_key\": \"chat.type.text\",\n    \"parameters\": [\n      \"sender\",\n      \"content\"\n    ]\n  },\n  \"narration\": {\n    \"translation_key\": \"chat.type.text.narrate\",\n    \"parameters\": [\n      \"sender\",\n      \"content\"\n    ]\n  }\n}\n"
    },
    jukebox_song: {
      ext: ".json",
      content: "{\n  \"sound_event\": \"minecraft:music_disc.pigstep\",\n  \"description\": {\n    \"text\": \"Custom Song\"\n  },\n  \"length_in_seconds\": 148.0,\n  \"comparator_output\": 13\n}\n"
    },
    trim_pattern: {
      ext: ".json",
      content: "{\n  \"asset_id\": \"minecraft:sentry\",\n  \"description\": {\n    \"translate\": \"trim_pattern.minecraft.sentry\"\n  }\n}\n"
    },
    trim_material: {
      ext: ".json",
      content: "{\n  \"asset_name\": \"quartz\",\n  \"description\": {\n    \"translate\": \"trim_material.minecraft.quartz\"\n  },\n  \"ingredient\": \"minecraft:quartz\"\n}\n"
    },
    damage_type: {
      ext: ".json",
      content: "{\n  \"exhaustion\": 0.1,\n  \"message_id\": \"my_damage\",\n  \"scaling\": \"never\",\n  \"effects\": \"hurt\",\n  \"death_message_type\": \"default\"\n}\n"
    },
    painting_variant: {
      ext: ".json",
      content: "{\n  \"asset_id\": \"minecraft:backyard\",\n  \"height\": 1,\n  \"width\": 2,\n  \"title\": {\n    \"text\": \"Custom Painting\"\n  },\n  \"author\": {\n    \"text\": \"Toolsvault\"\n  }\n}\n"
    },
    wolf_variant: {
      ext: ".json",
      content: "{\n  \"assets\": {\n    \"wild\": \"minecraft:entity/wolf/wolf\",\n    \"tame\": \"minecraft:entity/wolf/wolf_tame\",\n    \"angry\": \"minecraft:entity/wolf/wolf_angry\"\n  },\n  \"spawn_conditions\": []\n}\n"
    },
    instrument: {
      ext: ".json",
      content: "{\n  \"sound_event\": \"minecraft:item.goat_horn.sound.0\",\n  \"use_duration\": 7.0,\n  \"range\": 256.0,\n  \"description\": {\n    \"translate\": \"instrument.minecraft.ponder_goat_horn\"\n  }\n}\n"
    },
    file: {
      ext: "",
      content: ""
    }
  };

  var TYPE_GROUPS = [
    { label: 'Functions', key: 'functions' },
    { label: 'Advancements', key: 'advancements' },
    { label: 'Recipes', key: 'recipes' },
    { label: 'Loot tables', key: 'loot_tables' },
    { label: 'Tags', key: 'tags' },
    { label: 'Predicates', key: 'predicates' },
    { label: 'Item modifiers', key: 'item_modifiers' },
    { label: 'Dimension', key: 'dimension' },
    { label: 'Dimension type', key: 'dimension_type' },
    { label: 'Worldgen', key: 'worldgen' },
    { label: 'Structures', key: 'structures' },
    { label: 'Smithing trims', key: 'smithing_trim' },
    { label: 'Smithing transforms', key: 'smithing_transform' },
    { label: 'Chat types', key: 'chat_type' },
    { label: 'Jukebox songs', key: 'jukebox_song' },
    { label: 'Trim patterns', key: 'trim_pattern' },
    { label: 'Trim materials', key: 'trim_material' },
    { label: 'Damage types', key: 'damage_type' },
    { label: 'Painting variants', key: 'painting_variant' },
    { label: 'Wolf variants', key: 'wolf_variant' },
    { label: 'Instruments', key: 'instrument' },
    { label: 'File (any)', key: 'file' }
  ];

  var PACK_TEMPLATES = {
    hello_world: {
      name: 'Hello World',
      description: 'A minimal datapack that prints a message on load.',
      files: [
        { path: 'pack.mcmeta', type: 'meta', content: '{\n  "pack": {\n    "pack_format": 61,\n    "description": "Hello World Datapack"\n  }\n}\n' },
        { path: 'data/hello_world/functions/load.mcfunction', type: 'functions', content: '# Runs when the datapack loads\nsay Hello from my datapack!\n' },
        { path: 'data/hello_world/functions/tick.mcfunction', type: 'functions', content: '# Runs every tick\n# execute as @a at @s run say Tick!\n' }
      ]
    },
    custom_recipe: {
      name: 'Custom Crafting Recipe',
      description: 'Adds a new shaped crafting recipe (netherite ingot example).',
      files: [
        { path: 'data/custom_recipe/recipes/netherite_ingot.json', type: 'recipes', content: '{\n  "type": "minecraft:crafting_shaped",\n  "pattern": ["NNN", "GNG", "NNN"],\n  "key": {\n    "N": { "item": "minecraft:netherite_scrap" },\n    "G": { "item": "minecraft:gold_ingot" }\n  },\n  "result": {\n    "item": "minecraft:netherite_ingot",\n    "count": 1\n  }\n}\n' }
      ]
    },
    loot_table_modifier: {
      name: 'Loot Table Modifier',
      description: 'Adds an item modifier that sets count on chest loot.',
      files: [
        { path: 'data/custom_loot/loot_tables/chests/simple_dungeon.json', type: 'loot_tables', content: '{\n  "pools": [\n    {\n      "rolls": 1,\n      "entries": [\n        {\n          "type": "minecraft:item",\n          "name": "minecraft:diamond",\n          "functions": [\n            {\n              "function": "minecraft:set_count",\n              "count": {\n                "type": "minecraft:uniform",\n                "min": 1,\n                "max": 3\n              }\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}\n' }
      ]
    },
    tag_example: {
      name: 'Tag Example',
      description: 'Adds a custom item tag and a function that uses it.',
      files: [
        { path: 'data/custom_tags/tags/item/my_gems.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:diamond",\n    "minecraft:emerald",\n    "minecraft:lapis_lazuli"\n  ]\n}\n' },
        { path: 'data/custom_tags/functions/check_gems.mcfunction', type: 'functions', content: '# This function references the tag above\n# execute as @a if entity @s[nbt={Inventory:[{tag:{Tags:["my_gems"]}}]}] run say You have a custom gem!\n' }
      ]
    },
    advancement_reward: {
      name: 'Advancement Reward',
      description: 'Grants the player a reward when they craft a diamond.',
      files: [
        { path: 'data/advancement_rewards/advancements/craft_diamond.json', type: 'advancements', content: '{\n  "display": {\n    "title": "Diamond Crafter",\n    "description": "Craft a diamond",\n    "icon": { "item": "minecraft:diamond" },\n    "frame": "task",\n    "announce_to_chat": true,\n    "show_toast": true\n  },\n  "criteria": {\n    "crafted_diamond": {\n      "trigger": "minecraft:recipe_crafted",\n      "conditions": {\n        "recipe_id": "minecraft:diamond"\n      }\n    }\n  },\n  "rewards": {\n    "function": "advancement_rewards:give_reward"\n  }\n}\n' },
        { path: 'data/advancement_rewards/functions/give_reward.mcfunction', type: 'functions', content: '# Reward function\ngive @s minecraft:golden_apple 1\nadvancement revoke @s only advancement_rewards:craft_diamond\n' }
      ]
    },
    custom_dimension: {
      name: 'Custom Dimension',
      description: 'Adds a new dimension type and dimension JSON (requires worldgen folder).',
      files: [
        { path: 'data/custom_dim/dimension_type/my_dimension.json', type: 'dimension_type', content: '{\n  "name": "my_dimension",\n  "ultrawarm": false,\n  "natural": true,\n  "coordinate_scale": 1.0,\n  "has_skylight": true,\n  "has_ceiling": false,\n  "ambient_light": 0.0,\n  "bed_works": true,\n  "respawn_anchor_works": true,\n  "has_raids": true,\n  "logical_height": 256,\n  "min_y": 0,\n  "max_y": 256,\n  "infiniburn": "#minecraft:infiniburn_overworld",\n  "effects": "minecraft:overworld"\n}\n' },
        { path: 'data/custom_dim/dimension/my_dimension.json', type: 'dimension', content: '{\n  "type": "minecraft:overworld",\n  "generator": {\n    "type": "minecraft:noise",\n    "seed": 0,\n    "settings": "minecraft:overworld",\n    "biome_source": {\n      "type": "minecraft:fixed",\n      "biome": "minecraft:plains"\n    }\n  }\n}\n' }
      ]
    },
    custom_biome: {
      name: 'Custom Biome (Worldgen)',
      description: 'Adds a basic configured_feature, placed_feature, and biome for world generation.',
      files: [
        { path: 'data/custom_biome/worldgen/configured_feature/my_tree.json', type: 'worldgen', content: '{\n  "type": "minecraft:tree",\n  "config": {\n    "minimum_size": {\n      "type": "minecraft:two_layers_feature_size",\n      "limit": 1,\n      "lower_size": 0,\n      "upper_size": 1\n    },\n    "trunk_provider": {\n      "type": "minecraft:simple_state_provider",\n      "state": { "Name": "minecraft:oak_log" }\n    },\n    "foliage_provider": {\n      "type": "minecraft:simple_state_provider",\n      "state": { "Name": "minecraft:oak_leaves" }\n    },\n    "trunk_height": 5,\n    "foliage_height": 3,\n    "foliage_radius": 2\n  }\n}\n' },
        { path: 'data/custom_biome/worldgen/placed_feature/my_tree.json', type: 'worldgen', content: '{\n  "feature": "custom_biome:my_tree",\n  "placement": [\n    { "type": "minecraft:count", "count": 2 },\n    { "type": "minecraft:in_square" },\n    { "type": "minecraft:surface_water_depth_filter", "max_water_depth": 0 },\n    { "type": "minecraft:heightmap", "heightmap": "WORLD_SURFACE_WG" },\n    { "type": "minecraft:block_predicate_filter", "predicate": { "type": "minecraft:matching_blocks", "blocks": [ "minecraft:grass_block" ] } }\n  ]\n}\n' }
      ]
    },
    custom_item: {
      name: 'Custom Item Pack',
      description: 'Adds a recipe, loot table entry, and item tag for a custom item.',
      files: [
        { path: 'data/custom_item/recipes/my_item.json', type: 'recipes', content: '{\n  "type": "minecraft:crafting_shaped",\n  "pattern": ["###", "###", "###"],\n  "key": {\n    "#": { "item": "minecraft:diamond" }\n  },\n  "result": {\n    "item": "minecraft:netherite_ingot",\n    "count": 1\n  }\n}\n' },
        { path: 'data/custom_item/loot_tables/chests/village_blacksmith.json', type: 'loot_tables', content: '{\n  "pools": [\n    {\n      "rolls": 1,\n      "entries": [\n        {\n          "type": "minecraft:item",\n          "name": "minecraft:emerald",\n          "weight": 1,\n          "functions": [\n            { "function": "minecraft:set_count", "count": { "type": "minecraft:uniform", "min": 1, "max": 5 } }\n          ]\n        }\n      ]\n    }\n  ]\n}\n' },
        { path: 'data/custom_item/tags/item/my_item_tag.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:diamond",\n    "minecraft:emerald",\n    "minecraft:netherite_ingot"\n  ]\n}\n' }
      ]
    },
    tag_pack: {
      name: 'Tag Pack',
      description: 'Shows item, block, function, entity_type, and fluid tags.',
      files: [
        { path: 'data/tag_pack/tags/item/my_gems.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:diamond",\n    "minecraft:emerald",\n    "minecraft:lapis_lazuli"\n  ]\n}\n' },
        { path: 'data/tag_pack/tags/block/my_ores.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:coal_ore",\n    "minecraft:iron_ore",\n    "minecraft:gold_ore"\n  ]\n}\n' },
        { path: 'data/tag_pack/tags/function/load.json', type: 'tags', content: '{\n  "values": [\n    "tag_pack:init"\n  ]\n}\n' },
        { path: 'data/tag_pack/functions/init.mcfunction', type: 'functions', content: '# Initialize tag pack\ndatapack enable "self"\nsay Tag pack loaded!\n' }
      ]
    },
    predicate_showcase: {
      name: 'Predicate Showcase',
      description: 'Shows entity_properties and location_check predicates used by advancements or loot tables.',
      files: [
        { path: 'data/pred_show/predicates/is_in_plains.json', type: 'predicates', content: '{\n  "condition": "minecraft:entity_properties",\n  "entity": "this",\n  "predicate": {\n    "location": {\n      "biome": "minecraft:plains",\n      "structure": "minecraft:village"\n    }\n  }\n}\n' },
        { path: 'data/pred_show/predicates/random_drop.json', type: 'predicates', content: '{\n  "condition": "minecraft:random_chance",\n  "chance": 0.15\n}\n' }
      ]
    },
    function_pack: {
      name: 'Function Pack',
      description: 'Multiple functions linked via tags and advancements.',
      files: [
        { path: 'data/func_pack/tags/function/load.json', type: 'tags', content: '{\n  "values": [\n    "func_pack:main"\n  ]\n}\n' },
        { path: 'data/func_pack/functions/main.mcfunction', type: 'functions', content: '# Main load function\ndatapack enable "self"\nsay Function pack loaded!\nfunction func_pack:give_items\n' },
        { path: 'data/func_pack/functions/give_items.mcfunction', type: 'functions', content: '# Give starter items\ngive @a minecraft:stone 64\ngive @a minecraft:oak_log 64\n' },
        { path: 'data/func_pack/advancements/root.json', type: 'advancements', content: '{\n  "display": {\n    "title": "Function Pack",\n    "description": "Loaded the function pack",\n    "icon": { "item": "minecraft:knowledge_book" },\n    "frame": "task",\n    "show_toast": true,\n    "announce_to_chat": true\n  },\n  "criteria": {\n    "loaded": {\n      "trigger": "minecraft:tick"\n    }\n  }\n}\n' }
      ]
    },
    full_pack: {
      name: 'Full Starter Pack',
      description: 'A complete starter pack with advancement, recipe, function, tag, predicate, and item modifier.',
      files: [
        { path: 'data/full_pack/tags/function/load.json', type: 'tags', content: '{\n  "values": [\n    "full_pack:on_load"\n  ]\n}\n' },
        { path: 'data/full_pack/functions/on_load.mcfunction', type: 'functions', content: 'say Full pack loaded!\ngive @a minecraft:stone 1\n' },
        { path: 'data/full_pack/advancements/first_join.json', type: 'advancements', content: '{\n  "display": {\n    "title": "Welcome",\n    "description": "Joined the world",\n    "icon": { "item": "minecraft:grass_block" },\n    "frame": "task",\n    "show_toast": true,\n    "announce_to_chat": true\n  },\n  "criteria": {\n    "joined": {\n      "trigger": "minecraft:tick"\n    }\n  }\n}\n' },
        { path: 'data/full_pack/recipes/stone_recipe.json', type: 'recipes', content: '{\n  "type": "minecraft:crafting_shaped",\n  "pattern": ["## ", "## ", "   "],\n  "key": {\n    "#": { "item": "minecraft:cobblestone" }\n  },\n  "result": {\n    "item": "minecraft:stone",\n    "count": 2\n  }\n}\n' },
        { path: 'data/full_pack/tags/item/starters.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:stone",\n    "minecraft:cobblestone"\n  ]\n}\n' },
        { path: 'data/full_pack/predicates/always_true.json', type: 'predicates', content: '{\n  "condition": "minecraft:random_chance",\n  "chance": 1.0\n}\n' },
        { path: 'data/full_pack/item_modifiers/give_chance.json', type: 'item_modifiers', content: '{\n  "function": "minecraft:set_count",\n  "count": {\n    "type": "minecraft:uniform",\n    "min": 1,\n    "max": 3\n  }\n}\n' }
      ]
    },
    sound_pack: {
      name: 'Sound Pack',
      description: 'Functions that play sounds using /playsound and a tag to auto-run on load.',
      files: [
        { path: 'data/sound_pack/tags/function/load.json', type: 'tags', content: '{\n  "values": [\n    "sound_pack:play_sounds"\n  ]\n}\n' },
        { path: 'data/sound_pack/functions/play_sounds.mcfunction', type: 'functions', content: '# Play a few vanilla sounds\ndatapack enable "self"\nplaysound minecraft:block.note_block.pling master @a ~ ~ ~ 1.0 1.0\nplaysound minecraft:entity.player.levelup master @a ~ ~ ~ 1.0 1.0\nsay Sound pack loaded!\n' }
      ]
    },
    smelting_pack: {
      name: 'Smelting Recipes',
      description: 'Furnace, smoker, and blast furnace recipes.',
      files: [
        { path: 'data/smelting_pack/recipes/cooked_pork.json', type: 'recipes', content: '{\n  "type": "minecraft:cooking",\n  "ingredient": { "item": "minecraft:porkchop" },\n  "result": "minecraft:cooked_porkchop",\n  "experience": 0.35,\n  "cookingtime": 200\n}\n' },
        { path: 'data/smelting_pack/recipes/smoked_beef.json', type: 'recipes', content: '{\n  "type": "minecraft:cooking",\n  "ingredient": { "item": "minecraft:beef" },\n  "result": "minecraft:steak",\n  "experience": 0.35,\n  "cookingtime": 100\n}\n' },
        { path: 'data/smelting_pack/recipes/blast_gold.json', type: 'recipes', content: '{\n  "type": "minecraft:blasting",\n  "ingredient": { "item": "minecraft:raw_gold" },\n  "result": "minecraft:gold_ingot",\n  "experience": 0.7,\n  "cookingtime": 100\n}\n' }
      ]
    },
    smithing_trim_pack: {
      name: 'Smithing Trim Pack',
      description: 'Adds a custom armor trim recipe using a trim template, base armor, and trim material.',
      files: [
        { path: 'data/trim_pack/smithing_trim/spire_trim.json', type: 'smithing_trim', content: '{\n  "type": "minecraft:smithing_trim",\n  "template": "minecraft:template_sentry",\n  "base": "minecraft:netherite_chestplate",\n  "trim": "minecraft:quartz"\n}\n' }
      ]
    },
    chat_pack: {
      name: 'Custom Chat Type',
      description: 'Adds a custom chat_type JSON so commands can use a custom chat style.',
      files: [
        { path: 'data/chat_pack/chat_type/my_chat.json', type: 'chat_type', content: '{\n  "chat_type": {\n    "display_name": { "translate": "chat.type.text" },\n    "parameters": ["text", "selector"]\n  }\n}\n' }
      ]
    },
    damage_type_pack: {
      name: 'Custom Damage Type',
      description: 'Adds a damage_type JSON for custom weapon or environmental damage.',
      files: [
        { path: 'data/damage_pack/damage_types/freeze.json', type: 'damage_type', content: '{\n  "damage_type": {\n    "exhaustion": 0.1,\n    "message_id": "my_freeze",\n    "scaling": "never",\n    "effects": "freeze",\n    "death_message_type": "default"\n  }\n}\n' }
      ]
    },
    jukebox_pack: {
      name: 'Jukebox Song',
      description: 'Adds a custom jukebox song JSON.',
      files: [
        { path: 'data/jukebox_pack/jukebox_song/my_song.json', type: 'jukebox_song', content: '{\n  "jukebox_song": {\n    "comparator_output": 6,\n    "length_in_seconds": 180,\n    "sound_event": "minecraft:record.pigstep"\n  }\n}\n' }
      ]
    },
    trim_material_pack: {
      name: 'Trim Material Pack',
      description: 'Adds a custom trim material JSON for armor trims.',
      files: [
        { path: 'data/trim_mat/trim_material/my_material.json', type: 'trim_material', content: '{\n  "trim_material": {\n    "description": { "translate": "trim_material.minecraft.quartz" },\n    "ingredient": "minecraft:quartz",\n    "item_model_index": 0.5\n  }\n}\n' }
      ]
    },
    worldgen_pack: {
      name: 'Worldgen Biome Pack',
      description: 'Adds a basic biome, configured_feature, and placed_feature for world generation.',
      files: [
        { path: 'data/worldgen_pack/worldgen/biome/my_biome.json', type: 'worldgen', content: '{\n  "temperature": 0.8,\n  "downfall": 0.4,\n  "precipitation": "rain",\n  "category": "forest",\n  "effects": {\n    "sky_color": 7842047,\n    "fog_color": 12638463,\n    "water_color": 4159204,\n    "water_fog_color": 329011\n  }\n}\n' },
        { path: 'data/worldgen_pack/worldgen/configured_feature/my_flower.json', type: 'worldgen', content: '{\n  "type": "minecraft:flower",\n  "config": {\n    "tries": 64,\n    "xz_spread": 7,\n    "y_spread": 3,\n    "state": { "Name": "minecraft:dandelion" }\n  }\n}\n' },
        { path: 'data/worldgen_pack/worldgen/placed_feature/my_flower.json', type: 'worldgen', content: '{\n  "feature": "worldgen_pack:my_flower",\n  "placement": [\n    { "type": "minecraft:count", "count": 4 },\n    { "type": "minecraft:in_square" },\n    { "type": "minecraft:surface_water_depth_filter", "max_water_depth": 0 },\n    { "type": "minecraft:heightmap", "heightmap": "WORLD_SURFACE_WG" },\n    { "type": "minecraft:block_predicate_filter", "predicate": { "type": "minecraft:matching_blocks", "blocks": [ "minecraft:grass_block" ] } }\n  ]\n}\n' }
      ]
    },
    complete_pack: {
      name: 'Complete Datapack',
      description: 'Uses almost every datapack folder: functions, recipes, advancements, loot tables, tags, predicates, item modifiers, chat types, jukebox songs, damage types, trims, worldgen, and dimensions.',
      files: [
        { path: 'data/complete_pack/tags/function/load.json', type: 'tags', content: '{\n  "values": [\n    "complete_pack:on_load"\n  ]\n}\n' },
        { path: 'data/complete_pack/functions/on_load.mcfunction', type: 'functions', content: 'say Complete pack loaded!\nplaysound minecraft:block.note_block.pling master @a ~ ~ ~ 1.0 1.0\ngive @a minecraft:stone 1\n' },
        { path: 'data/complete_pack/advancements/root.json', type: 'advancements', content: '{\n  "display": {\n    "title": "Complete Pack",\n    "description": "Uses many datapack features",\n    "icon": { "item": "minecraft:knowledge_book" },\n    "frame": "task",\n    "show_toast": true,\n    "announce_to_chat": true\n  },\n  "criteria": {\n    "loaded": {\n      "trigger": "minecraft:tick"\n    }\n  }\n}\n' },
        { path: 'data/complete_pack/recipes/stone_from_cobble.json', type: 'recipes', content: '{\n  "type": "minecraft:crafting_shaped",\n  "pattern": ["## ", "## ", "   "],\n  "key": {\n    "#": { "item": "minecraft:cobblestone" }\n  },\n  "result": { "item": "minecraft:stone", "count": 2 }\n}\n' },
        { path: 'data/complete_pack/recipes/cooked_pork.json', type: 'recipes', content: '{\n  "type": "minecraft:cooking",\n  "ingredient": { "item": "minecraft:porkchop" },\n  "result": "minecraft:cooked_porkchop",\n  "experience": 0.35,\n  "cookingtime": 200\n}\n' },
        { path: 'data/complete_pack/smithing_trim/trim_example.json', type: 'smithing_trim', content: '{\n  "type": "minecraft:smithing_trim",\n  "template": "minecraft:template_sentry",\n  "base": "minecraft:netherite_chestplate",\n  "trim": "minecraft:quartz"\n}\n' },
        { path: 'data/complete_pack/loot_tables/chests/simple_dungeon.json', type: 'loot_tables', content: '{\n  "pools": [\n    {\n      "rolls": 1,\n      "entries": [\n        {\n          "type": "minecraft:item",\n          "name": "minecraft:diamond",\n          "functions": [\n            { "function": "minecraft:set_count", "count": { "type": "minecraft:uniform", "min": 1, "max": 3 } }\n          ]\n        }\n      ]\n    }\n  ]\n}\n' },
        { path: 'data/complete_pack/tags/item/my_items.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:stone",\n    "minecraft:cobblestone",\n    "minecraft:diamond"\n  ]\n}\n' },
        { path: 'data/complete_pack/predicates/always_true.json', type: 'predicates', content: '{\n  "condition": "minecraft:random_chance",\n  "chance": 1.0\n}\n' },
        { path: 'data/complete_pack/item_modifiers/set_count.json', type: 'item_modifiers', content: '{\n  "function": "minecraft:set_count",\n  "count": {\n    "type": "minecraft:uniform",\n    "min": 1,\n    "max": 3\n  }\n}\n' },
        { path: 'data/complete_pack/chat_type/custom_chat.json', type: 'chat_type', content: '{\n  "chat_type": {\n    "display_name": { "translate": "chat.type.text" },\n    "parameters": ["text", "selector"]\n  }\n}\n' },
        { path: 'data/complete_pack/jukebox_song/my_song.json', type: 'jukebox_song', content: '{\n  "jukebox_song": {\n    "comparator_output": 6,\n    "length_in_seconds": 180,\n    "sound_event": "minecraft:record.pigstep"\n  }\n}\n' },
        { path: 'data/complete_pack/damage_types/freeze.json', type: 'damage_type', content: '{\n  "damage_type": {\n    "exhaustion": 0.1,\n    "message_id": "my_freeze",\n    "scaling": "never",\n    "effects": "freeze",\n    "death_message_type": "default"\n  }\n}\n' },
        { path: 'data/complete_pack/trim_pattern/spire.json', type: 'trim_pattern', content: '{\n  "trim_pattern": {\n    "description": { "translate": "trim_pattern.minecraft.spire" },\n    "template_item": "minecraft:template_sentry"\n  }\n}\n' },
        { path: 'data/complete_pack/trim_material/quartz.json', type: 'trim_material', content: '{\n  "trim_material": {\n    "description": { "translate": "trim_material.minecraft.quartz" },\n    "ingredient": "minecraft:quartz",\n    "item_model_index": 0.5\n  }\n}\n' },
        { path: 'data/complete_pack/dimension_type/my_dim.json', type: 'dimension_type', content: '{\n  "name": "my_dim",\n  "ultrawarm": false,\n  "natural": true,\n  "coordinate_scale": 1.0,\n  "has_skylight": true,\n  "has_ceiling": false,\n  "ambient_light": 0.0,\n  "bed_works": true,\n  "respawn_anchor_works": true,\n  "has_raids": true,\n  "logical_height": 256,\n  "min_y": 0,\n  "max_y": 256,\n  "infiniburn": "#minecraft:infiniburn_overworld",\n  "effects": "minecraft:overworld"\n}\n' },
        { path: 'data/complete_pack/dimension/my_dim.json', type: 'dimension', content: '{\n  "type": "minecraft:overworld",\n  "generator": {\n    "type": "minecraft:noise",\n    "seed": 0,\n    "settings": "minecraft:overworld",\n    "biome_source": {\n      "type": "minecraft:fixed",\n      "biome": "minecraft:plains"\n    }\n  }\n}\n' },
        { path: 'data/complete_pack/worldgen/configured_feature/my_tree.json', type: 'worldgen', content: '{\n  "type": "minecraft:tree",\n  "config": {\n    "minimum_size": { "type": "minecraft:two_layers_feature_size", "limit": 1, "lower_size": 0, "upper_size": 1 },\n    "trunk_provider": { "type": "minecraft:simple_state_provider", "state": { "Name": "minecraft:oak_log" } },\n    "foliage_provider": { "type": "minecraft:simple_state_provider", "state": { "Name": "minecraft:oak_leaves" } },\n    "trunk_height": 5,\n    "foliage_height": 3,\n    "foliage_radius": 2\n  }\n}\n' },
        { path: 'data/complete_pack/worldgen/placed_feature/my_tree.json', type: 'worldgen', content: '{\n  "feature": "complete_pack:my_tree",\n  "placement": [\n    { "type": "minecraft:count", "count": 2 },\n    { "type": "minecraft:in_square" },\n    { "type": "minecraft:surface_water_depth_filter", "max_water_depth": 0 },\n    { "type": "minecraft:heightmap", "heightmap": "WORLD_SURFACE_WG" },\n    { "type": "minecraft:block_predicate_filter", "predicate": { "type": "minecraft:matching_blocks", "blocks": [ "minecraft:grass_block" ] } }\n  ]\n}\n' }
      ]
    }
  };

  var TEMPLATE_LIST = Object.keys(PACK_TEMPLATES).map(function (k) {
    return { key: k, name: PACK_TEMPLATES[k].name, desc: PACK_TEMPLATES[k].description };
  });

  /* ---------- State ---------- */
  var project = {
    name: 'My Datapack',
    format: '107.1',
    description: 'My custom datapack',
    namespace: 'mypack',
    files: new Map()
  };
  var selectedPath = null;
  var inited = false;
  var saveDebounce = null;
  var simpleMode = false;

  /* ---------- Element refs ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var editor = $('tpd-editor');

  /* ---------- Persistence (localStorage + file import/export) ---------- */
  var STORAGE_KEY = 'tpd:project';
  var SAVE_VERSION = 1;

  function serializeProject() {
    if (selectedPath && project.files.has(selectedPath)) {
      var entry = project.files.get(selectedPath);
      if (entry.blob) {
        entry.content = arrayBufferToBase64(entry.blob);
      } else {
        entry.content = editor.value;
      }
    }
    var filesArr = [];
    project.files.forEach(function (entry, path) {
      var obj = { path: path, name: entry.name, type: entry.type };
      if (entry.blob) {
        obj.content = arrayBufferToBase64(entry.blob);
        obj.blob = true;
      } else {
        obj.content = entry.content || '';
      }
      filesArr.push(obj);
    });
    return {
      version: SAVE_VERSION,
      name: project.name,
      format: project.format,
      description: project.description,
      namespace: project.namespace,
      files: filesArr
    };
  }

  function applyProject(obj) {
    if (!obj || !obj.files) throw new Error('Invalid project');
    project.name = obj.name || 'My Datapack';
    project.format = String(obj.format || '107.1');
    project.description = obj.description || '';
    project.namespace = obj.namespace || 'mypack';
    project.files = new Map();
    $('tpd-name').value = project.name;
    $('tpd-format').value = String(project.format);
    $('tpd-desc').value = project.description;
    $('tpd-namespace').value = project.namespace;
    var tasks = [];
    obj.files.forEach(function (f) {
      tasks.push(function () {
        var entry = {
          name: f.name || f.path.split('/').pop(),
          type: f.type || guessType(f.path),
          content: f.blob ? '' : (f.content || '')
        };
        if (f.blob && f.content) {
          try {
            entry.blob = base64ToArrayBuffer(f.content);
          } catch (e) {
            entry.content = f.content || '';
          }
        } else {
          entry.content = f.content || '';
        }
        if (f.path !== 'pack.mcmeta') project.files.set(f.path, entry);
      });
    });
    return Promise.all(tasks.map(function (t) { try { t(); } catch (e) {} return Promise.resolve(); }));
  }

  function storageAvailable() {
    try {
      var k = '__tpd_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  }

  function saveProject() {
    if (!storageAvailable()) { showMsg('Browser storage is unavailable — cannot save here.', false); return; }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeProject()));
      setSavedLabel(true);
      showMsg('Saved "' + project.name + '" to this browser.', true);
    } catch (e) {
      showMsg('Save failed: ' + e.message, false);
    }
  }

  function loadSavedProject() {
    if (!storageAvailable()) { showMsg('Browser storage is unavailable.', false); return; }
    var raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) { showMsg('No saved project found in this browser.', false); return; }
    try {
        applyProject(JSON.parse(raw)).then(function () {
          selectedPath = null;
          editor.value = '';
          updateEditorHeader();
          refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
          autoResizeEditor();
          showMsg('Loaded saved project.', true);
        }).catch(function (e) { showMsg('Could not load saved project: ' + e.message, false); });
    } catch (e) { showMsg('Saved project is corrupted.', false); }
  }

  function deleteSavedProject() {
    if (!storageAvailable()) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setSavedLabel(false);
    showMsg('Deleted saved project from this browser.', true);
  }

  function importProjectFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var obj = JSON.parse(reader.result);
        applyProject(obj).then(function () {
          selectedPath = null;
          editor.value = '';
          updateEditorHeader();
          refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
          autoResizeEditor();
          setSavedLabel(false);
          showMsg('Imported "' + (obj.name || 'project') + '".', true);
        }).catch(function (e) { showMsg('Import failed: ' + e.message, false); });
      } catch (e) { showMsg('Invalid project file.', false); }
    };
    reader.onerror = function () { showMsg('Could not read file.', false); };
    reader.readAsText(file);
  }

  function exportProjectFile() {
    var data = serializeProject();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = sanitizeName(project.name) + '.tpd.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    showMsg('Exported project file "' + sanitizeName(project.name) + '.tpd.json".', true);
  }

  function setSavedLabel(has) {
    var el = $('tpd-saved-label');
    if (!el) return;
    if (has) {
      var raw = storageAvailable() ? window.localStorage.getItem(STORAGE_KEY) : null;
      var name = 'project';
      if (raw) { try { name = JSON.parse(raw).name || 'project'; } catch (e) {} }
      el.hidden = false;
      el.textContent = 'Saved: ' + name;
    } else { el.hidden = true; el.textContent = ''; }
  }

  function checkSavedExists() {
    if (!storageAvailable()) { setSavedLabel(false); return; }
    setSavedLabel(!!window.localStorage.getItem(STORAGE_KEY));
  }

  /* ---------- Helpers ---------- */
  function guessType(path) {
    if (/\.mcfunction$/i.test(path)) return 'functions';
    if (/\/(advancement|advancements)\//.test(path)) return 'advancements';
    if (/\/(recipe|recipes)\//.test(path)) return 'recipes';
    if (/\/(loot_table|loot_tables)\//.test(path)) return 'loot_tables';
    if (/\/tags\//.test(path)) return 'tags';
    if (/\/(predicate|predicates)\//.test(path)) return 'predicates';
    if (/\/(item_modifier|item_modifiers)\//.test(path)) return 'item_modifiers';
    if (/\/dimension(_type)?\//.test(path)) return /\/dimension_type\//.test(path) ? 'dimension_type' : 'dimension';
    if (/\/worldgen\//.test(path)) return 'worldgen';
    if (/\/(structure|structures)\//.test(path)) return 'structures';
    if (/\/smithing_trim\//.test(path)) return 'smithing_trim';
    if (/\/smithing_transform\//.test(path)) return 'smithing_transform';
    if (/\/chat_type\//.test(path)) return 'chat_type';
    if (/\/jukebox_song\//.test(path)) return 'jukebox_song';
    if (/\/trim_pattern\//.test(path)) return 'trim_pattern';
    if (/\/trim_material\//.test(path)) return 'trim_material';
    if (/\/damage_type\//.test(path)) return 'damage_type';
    if (/\/painting_variant\//.test(path)) return 'painting_variant';
    if (/\/wolf_variant\//.test(path)) return 'wolf_variant';
    if (/\/instrument\//.test(path)) return 'instrument';
    return 'file';
  }

  function isModernLayout() { return parseFloat($('tpd-format').value || project.format || 0) >= 48; }

  function folderForType(typeKey) {
    if (!isModernLayout()) return typeKey;
    var folders = {
      functions: 'function', advancements: 'advancement', recipes: 'recipe',
      loot_tables: 'loot_table', tags: 'tags/function', predicates: 'predicate',
      item_modifiers: 'item_modifier', structures: 'structure',
      smithing_trim: 'recipe', smithing_transform: 'recipe', worldgen: 'worldgen/configured_feature'
    };
    return folders[typeKey] || typeKey;
  }

  function modernizePath(path) {
    if (!isModernLayout()) return path;
    var replacements = [
      ['/functions/', '/function/'], ['/advancements/', '/advancement/'],
      ['/recipes/', '/recipe/'], ['/loot_tables/', '/loot_table/'],
      ['/predicates/', '/predicate/'], ['/item_modifiers/', '/item_modifier/'],
      ['/structures/', '/structure/'], ['/tags/functions/', '/tags/function/'],
      ['/tags/items/', '/tags/item/'], ['/tags/blocks/', '/tags/block/'],
      ['/tags/entity_types/', '/tags/entity_type/'], ['/tags/fluids/', '/tags/fluid/'],
      ['/tags/game_events/', '/tags/game_event/']
    ];
    replacements.forEach(function (pair) { path = path.replace(pair[0], pair[1]); });
    if (/^data\/[^/]+\/tags\/[^/]+\.json$/.test(path)) path = path.replace('/tags/', '/tags/function/');
    return path;
  }


  function sanitizeName(s) {
    return (s || 'pack').toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'pack';
  }

  function sanitizeNamespace(ns) {
    return (ns || 'mypack').toLowerCase().replace(/[^a-z0-9_.-]+/g, '_').replace(/^_+|_+$/g, '') || 'mypack';
  }

  function fileNameFromPath(path) {
    return path.replace(/^.*\//, '');
  }

  function isLikelyBinary(name) {
    name = (name || '').toLowerCase();
    return /\.(ogg|wav|mp3|nbt|bin|png|jpg|jpeg|gif|webp|zip|rar|7z|tar|gz)$/.test(name);
  }

  function arrayBufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = '';
    for (var i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function base64ToArrayBuffer(base64) {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  function autoResizeEditor() {
    var el = $('tpd-editor');
    if (!el) return;
    el.style.height = 'auto';
    var maxH = 600;
    el.style.height = Math.min(el.scrollHeight, maxH) + 'px';
  }

  /* ---------- New file menu ---------- */
  function showNewFileMenu() {
    var existing = $('tpd-new-menu');
    if (existing) { existing.remove(); return; }
    var btn = $('tpd-new-file');
    var rect = btn.getBoundingClientRect();
    var menu = document.createElement('div');
    menu.className = 'tpd-new-menu';
    menu.id = 'tpd-new-menu';
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = rect.left + 'px';
    var ns = sanitizeNamespace($('tpd-namespace').value || 'mypack');
    TYPE_GROUPS.forEach(function (g) {
      var groupLabel = document.createElement('div');
      groupLabel.className = 'tpd-new-group';
      groupLabel.textContent = g.label;
      menu.appendChild(groupLabel);
      var item = document.createElement('div');
      item.className = 'tpd-new-item';
      if (g.key === 'file') {
        item.innerHTML = '<span>Add file...</span><span class=\"tpd-new-ext\">any</span>';
      } else {
        item.innerHTML = '<span>New ' + g.label.toLowerCase().slice(0, -1) + '</span><span class="tpd-new-ext">' + TEMPLATES[g.key].ext + '</span>';
      }
      item.addEventListener('click', function () {
        createNewFile(g.key, ns);
        menu.remove();
      });
      menu.appendChild(item);
    });
    document.body.appendChild(menu);
    var close = function (e) {
      if (!menu.contains(e.target) && e.target !== btn) { menu.remove(); document.removeEventListener('click', close); }
    };
    setTimeout(function () { document.addEventListener('click', close); }, 0);
  }

  function createNewFile(typeKey, ns) {
    if (typeKey === 'file') {
      $('tpd-add-file-input').click();
      return;
    }
    var tmpl = TEMPLATES[typeKey];
    if (!tmpl) return;
    var ext = tmpl.ext;
    var content = tmpl.content.replace(/<namespace>/g, ns);
    var basePath = 'data/' + ns + '/' + folderForType(typeKey);
    var name = 'new_' + typeKey.slice(0, -1);
    var path = basePath + '/' + name + ext;
    var counter = 1;
    while (project.files.has(path)) {
      path = basePath + '/' + name + '_' + counter + ext;
      counter++;
    }
    project.files.set(path, { name: fileNameFromPath(path), type: typeKey, content: content });
    selectFile(path);
    autoResizeEditor();
    refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
    showMsg('Created ' + path, true);
  }

  function showTemplateMenu() {
    var existing = $('tpd-template-menu');
    if (existing) { existing.remove(); return; }
    var btn = $('tpd-load-template');
    var rect = btn.getBoundingClientRect();
    var menu = document.createElement('div');
    menu.className = 'tpd-new-menu';
    menu.id = 'tpd-template-menu';
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = rect.left + 'px';
    TEMPLATE_LIST.forEach(function (t) {
      var item = document.createElement('div');
      item.className = 'tpd-new-item';
      item.innerHTML = '<span>' + t.name + '</span><span class="tpd-new-ext">pack</span>';
      item.addEventListener('click', function () {
        loadPackTemplate(t.key);
        menu.remove();
      });
      menu.appendChild(item);
    });
    document.body.appendChild(menu);
    var close = function (e) {
      if (!menu.contains(e.target) && e.target !== btn) { menu.remove(); document.removeEventListener('click', close); }
    };
    setTimeout(function () { document.addEventListener('click', close); }, 0);
  }

  function modernizeTemplateContent(type, content) {
    if (!isModernLayout() || !/\.json$/i.test(TEMPLATES[type] ? TEMPLATES[type].ext : '.json')) return content;
    var data;
    try { data = JSON.parse(content); } catch (e) { return content; }

    if (type === 'advancements' && data.display && data.display.icon) {
      if (typeof data.display.icon === 'string') data.display.icon = { id: data.display.icon };
      if (data.display.icon.item && !data.display.icon.id) {
        data.display.icon.id = data.display.icon.item;
        delete data.display.icon.item;
      }
    }
    if (type === 'recipes') {
      if (data.result && data.result.item && !data.result.id) {
        data.result.id = data.result.item;
        delete data.result.item;
      }
      if (data.key) Object.keys(data.key).forEach(function (key) {
        var ingredient = data.key[key];
        if (ingredient && typeof ingredient === 'object' && ingredient.item && Object.keys(ingredient).length === 1) data.key[key] = ingredient.item;
      });
      if (data.ingredient && typeof data.ingredient === 'object' && data.ingredient.item && Object.keys(data.ingredient).length === 1) data.ingredient = data.ingredient.item;
    }
    var directRegistryTypes = ['chat_type', 'jukebox_song', 'trim_pattern', 'trim_material', 'damage_type', 'painting_variant', 'wolf_variant', 'instrument'];
    if (directRegistryTypes.indexOf(type) !== -1 && data[type] && Object.keys(data).length === 1) data = data[type];
    return JSON.stringify(data, null, 2) + '\n';
  }

  function loadPackTemplate(key) {
    var tmpl = PACK_TEMPLATES[key];
    if (!tmpl) return;
    project.name = tmpl.name;
    project.description = tmpl.description;
    $('tpd-name').value = project.name;
    $('tpd-desc').value = project.description;
    project.files = new Map();
    selectedPath = null;
    editor.value = '';
    tmpl.files.forEach(function (f) {
      if (f.path === 'pack.mcmeta') return;
      var path = modernizePath(f.path.replace('<namespace>', project.namespace));
      project.files.set(path, { name: fileNameFromPath(path), type: f.type || guessType(path), content: modernizeTemplateContent(f.type || guessType(path), f.content) });
    });
    updateEditorHeader(); validateCurrent();
    buildTree(); renderFileList(); renderPreview(); renderMeta();
    if (project.files.size > 0) selectFile(Array.from(project.files.keys())[0]);
    autoResizeEditor();
    showMsg('Loaded template: ' + tmpl.name, true);
  }

  /* ---------- Tree ---------- */
  function buildTree() {
    var body = $('tpd-tree-body');
    body.innerHTML = '';
    if (project.files.size === 0) {
      body.innerHTML = '<p class="tpd-empty-tree">No files yet. Use "New file" to add one.</p>';
      return;
    }
    var groups = {};
    project.files.forEach(function (entry, path) {
      var parts = path.split('/');
      if (parts.length < 3) return;
      var type = parts[2];
      if (!groups[type]) groups[type] = [];
      groups[type].push({ path: path, entry: entry });
    });
    Object.keys(groups).sort().forEach(function (type) {
      var group = document.createElement('div');
      group.className = 'tpd-group';
      var head = document.createElement('div');
      head.className = 'tpd-cat tpd-cat-toggle';
      head.innerHTML = '<span class="tpd-caret">&#9654;</span> ' + type;
      var bodyGroup = document.createElement('div');
      bodyGroup.className = 'tpd-group-body';
      groups[type].forEach(function (f) {
        var node = document.createElement('div');
        node.className = 'tpd-node';
        node.dataset.path = f.path;
        node.innerHTML = '<span class="tpd-dot"></span><span class="tpd-name">' + f.entry.name + '</span>';
        node.addEventListener('click', function () { selectFile(f.path); });
        bodyGroup.appendChild(node);
      });
      head.addEventListener('click', function () {
        var open = bodyGroup.style.display !== 'none';
        bodyGroup.style.display = open ? 'none' : 'block';
        head.querySelector('.tpd-caret').textContent = open ? '&#9654;' : '&#9660;';
      });
      group.appendChild(head);
      group.appendChild(bodyGroup);
      body.appendChild(group);
    });
    refreshTreeFlags();
  }

  function refreshTreeFlags() {
    document.querySelectorAll('.tpd-node').forEach(function (n) {
      n.classList.toggle('has', project.files.has(n.dataset.path));
      n.classList.toggle('active', n.dataset.path === selectedPath);
    });
  }

  function selectFile(path) {
    if (selectedPath && project.files.has(selectedPath)) {
      var prev = project.files.get(selectedPath);
      if (!prev.blob) {
        prev.content = editor.value;
      }
    }
    selectedPath = path;
    var entry = project.files.get(path);
    if (entry) {
      if (entry.blob) {
        editor.value = '[Binary file]\nSize: ' + entry.blob.byteLength + ' bytes\n\nThis file cannot be edited as text.\nUse Export to download the .zip, or delete and re-upload if needed.';
        editor.disabled = true;
      } else {
        editor.value = entry.content;
        editor.disabled = false;
      }
    } else {
      editor.value = '';
      editor.disabled = true;
    }
    updateEditorHeader();
    validateCurrent();
    refreshTreeFlags();
    editor.focus();
    autoResizeEditor();
    if (simpleMode) renderSimpleForm();
  }

  function updateEditorHeader() {
    var header = $('tpd-editor-filename');
    if (selectedPath && project.files.has(selectedPath)) {
      header.textContent = selectedPath;
    } else {
      header.textContent = 'No file selected';
    }
  }

  /* ---------- Validation ---------- */
  function validateJSON(str) {
    try {
      JSON.parse(str);
      return { ok: true, msg: 'Valid JSON' };
    } catch (e) {
      var match = /position\s+(\d+)/.exec(e.message);
      var pos = match ? parseInt(match[1], 10) : 0;
      var line = 1;
      for (var i = 0; i < pos && i < str.length; i++) {
        if (str[i] === '\n') line++;
      }
      var col = pos - (str.lastIndexOf('\n', pos - 1) + 1) + 1;
      return { ok: false, msg: 'Invalid JSON at line ' + line + ', col ' + col + ': ' + e.message };
    }
  }

  function validateMcfunction(str) {
    var lines = str.split('\n');
    var issues = [];
    lines.forEach(function (line, i) {
      var trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('#')) return;
      if (trimmed.startsWith('//')) issues.push('Line ' + (i + 1) + ': use # for comments; // is parsed as a command');
      if (trimmed.startsWith('/')) issues.push('Line ' + (i + 1) + ': remove the leading slash from datapack commands');
      if (trimmed.startsWith('$')) return;
      if (!/^[a-z0-9_.$]/.test(trimmed)) issues.push('Line ' + (i + 1) + ': command starts with an unexpected character');
    });
    if (issues.length === 0) return { ok: true, msg: lines.length + ' line(s)' };
    return { ok: true, msg: lines.length + ' line(s), ' + issues.length + ' warning(s)' };
  }

  function validateCurrent() {
    var validity = $('tpd-validity');
    if (!selectedPath || !project.files.has(selectedPath)) {
      if (validity) { validity.textContent = ''; validity.className = 'tpd-validity'; }
      return;
    }
    var content = editor.value;
    var entry = project.files.get(selectedPath);
    if (entry.blob) {
      if (validity) { validity.textContent = 'Binary file'; validity.className = 'tpd-validity'; }
      return;
    }
    var result;
    if (entry.type === 'functions') {
      result = validateMcfunction(content);
    } else {
      result = validateJSON(content);
    }
    if (validity) {
      validity.textContent = result.msg;
      validity.className = 'tpd-validity ' + (result.ok ? 'ok' : 'err');
    }
  }

  /* ---------- pack.mcmeta ---------- */
  function buildMeta() {
    if (window.MinecraftPack) return MinecraftPack.buildPackMeta('data', $('tpd-format').value, $('tpd-desc').value || '');
    return { pack: { pack_format: parseInt($('tpd-format').value, 10) || 61, description: $('tpd-desc').value || '' } };
  }

  function syncSelectedContent() {
    if (selectedPath && project.files.has(selectedPath) && !project.files.get(selectedPath).blob) project.files.get(selectedPath).content = editor.value;
  }

  function validatePack() {
    syncSelectedContent();
    var out = [];
    function add(level, message, path) { out.push({ level: level, message: message, path: path || null }); }
    var modern = isModernLayout();
    var namespace = sanitizeNamespace($('tpd-namespace').value || 'mypack');
    if (!String($('tpd-name').value || '').trim()) add('error', 'Pack name is required.');
    if (!project.files.size) add('error', 'Add at least one datapack file.');
    if (!/^[a-z0-9_.-]+$/.test(namespace)) add('error', 'Namespace may only contain lowercase letters, numbers, _, -, and dots.');
    var hasLoadFn = false, hasTickFn = false, hasLoadTag = false, hasTickTag = false;
    project.files.forEach(function (entry, path) {
      try { if (window.MinecraftPack) MinecraftPack.safePath(path); } catch (e) { add('error', 'Unsafe archive path.', path); }
      if (path !== path.toLowerCase()) add('error', 'Datapack paths must be lowercase.', path);
      if (path === 'pack.mcmeta') add('error', 'Remove pack.mcmeta from project files; it is generated automatically.', path);
      if (!/^data\/[a-z0-9_.-]+\/.+/.test(path)) add('error', 'File must be inside data/<namespace>/.', path);
      var legacySegment = /\/(functions|advancements|recipes|loot_tables|predicates|item_modifiers|structures)\//.test(path) || /\/tags\/(functions|items|blocks|entity_types|fluids|game_events)\//.test(path);
      var modernSegment = /\/(function|advancement|recipe|loot_table|predicate|item_modifier|structure)\//.test(path);
      if (modern && legacySegment) add('error', 'Uses a pre-1.21 plural registry folder; rename it to the singular form.', path);
      if (!modern && modernSegment) add('warning', 'Uses a modern singular registry folder that older versions may not load.', path);
      if (/\/function\/load\.mcfunction$|\/functions\/load\.mcfunction$/.test(path)) hasLoadFn = true;
      if (/\/function\/tick\.mcfunction$|\/functions\/tick\.mcfunction$/.test(path)) hasTickFn = true;
      if (/^data\/minecraft\/tags\/(function|functions)\/load\.json$/.test(path)) hasLoadTag = true;
      if (/^data\/minecraft\/tags\/(function|functions)\/tick\.json$/.test(path)) hasTickTag = true;
      if (!entry.blob) {
        if (/\.json$/i.test(path)) {
          try {
            var parsed = JSON.parse(entry.content || '');
            if (modern && entry.type === 'recipes') {
              if (parsed && parsed.result && parsed.result.item && !parsed.result.id) add('error', 'Modern recipes use result.id instead of result.item.', path);
              if (parsed && parsed.key) Object.keys(parsed.key).forEach(function (key) {
                var ingredient = parsed.key[key];
                if (ingredient && typeof ingredient === 'object' && ingredient.item && Object.keys(ingredient).length === 1) add('warning', 'Modern recipe ingredients can use the item ID directly instead of { item: ... }.', path);
              });
            }
            if (modern && entry.type === 'advancements' && parsed && parsed.display && parsed.display.icon) {
              if (typeof parsed.display.icon === 'string') add('error', 'Modern advancement icons must be an item stack object such as { id: "minecraft:stone" }.', path);
              else if (parsed.display.icon.item && !parsed.display.icon.id) add('error', 'Modern advancement icons use icon.id instead of icon.item.', path);
            }
            if (modern && ['chat_type', 'jukebox_song', 'trim_pattern', 'trim_material', 'damage_type', 'painting_variant', 'wolf_variant', 'instrument'].indexOf(entry.type) !== -1 && parsed && parsed[entry.type] && Object.keys(parsed).length === 1) {
              add('error', 'Registry JSON should contain its fields directly, without an extra "' + entry.type + '" wrapper.', path);
            }
            if (/^data\/minecraft\/tags\/(function|functions)\/(load|tick)\.json$/.test(path)) {
              if (!parsed || !Array.isArray(parsed.values)) add('error', 'Function tag requires a values array.', path);
              else parsed.values.forEach(function (id) {
                if (typeof id !== 'string' || id.startsWith('#')) return;
                var parts = id.split(':');
                var ns = parts.length > 1 ? parts[0] : 'minecraft';
                var fn = parts.length > 1 ? parts.slice(1).join(':') : parts[0];
                var expected = 'data/' + ns + '/' + (modern ? 'function' : 'functions') + '/' + fn + '.mcfunction';
                if (!project.files.has(expected)) add('warning', 'Tag references missing function ' + id + '.', path);
              });
            }
          } catch (e) { add('error', 'Invalid JSON: ' + e.message, path); }
        } else if (/\.mcfunction$/i.test(path)) {
          var check = validateMcfunction(entry.content || '');
          if (/warning/.test(check.msg)) add('warning', check.msg + '.', path);
        }
      }
    });
    if (hasLoadFn && !hasLoadTag) add('warning', 'A load.mcfunction exists but minecraft:load does not reference it.');
    if (hasTickFn && !hasTickTag) add('warning', 'A tick.mcfunction exists but minecraft:tick does not reference it.');
    if (!out.some(function (item) { return item.level === 'error'; })) add('success', 'Datapack structure and text syntax are ready to export.');
    return out;
  }

  function renderDiagnostics() {
    var root = $('tpd-diagnostics');
    if (!root) return;
    root.innerHTML = '<ul class="tpd-diagnostic-list">' + validatePack().map(function (item) {
      return '<li class="' + item.level + '"><span>' + (item.level === 'error' ? '✕' : item.level === 'warning' ? '!' : '✓') + '</span><div>' + escHtml(item.message) + (item.path ? '<code>' + escHtml(item.path) + '</code>' : '') + '</div></li>';
    }).join('') + '</ul>';
  }

  function renderMeta() {
    var el = $('tpd-meta-preview');
    if (el) el.textContent = JSON.stringify(buildMeta(), null, 2);
    renderDiagnostics();
  }

  /* ---------- File list ---------- */
  function renderFileList() {
    var list = $('tpd-filelist');
    var count = project.files.size;
    $('tpd-file-count').textContent = count + (count === 1 ? ' file' : ' files');
    if (count === 0) { list.innerHTML = '<p class="tpc-empty">No files yet. Create one in the Editor tab.</p>'; return; }
    list.innerHTML = '';
    project.files.forEach(function (entry, path) {
      var card = document.createElement('div');
      card.className = 'tpd-filecard';
      var type = document.createElement('div');
      type.className = 'tpd-type'; type.textContent = entry.type;
      var name = document.createElement('div');
      name.className = 'tpd-fname'; name.textContent = entry.name;
      var del = document.createElement('button');
      del.className = 'tpd-del'; del.textContent = '×'; del.title = 'Remove';
      del.addEventListener('click', function () {
        if (selectedPath === path) { selectedPath = null; editor.value = ''; updateEditorHeader(); validateCurrent(); }
        project.files.delete(path);
        refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
      });
      card.appendChild(del); card.appendChild(type); card.appendChild(name);
      list.appendChild(card);
    });
  }

  /* ---------- Preview ---------- */
  function renderPreview() {
    var list = $('tpd-preview-list');
    if (project.files.size === 0) { list.innerHTML = '<p class="tpc-empty">Add files to see a live preview here.</p>'; return; }
    list.innerHTML = '';
    project.files.forEach(function (entry, path) {
      var item = document.createElement('div');
      item.className = 'tpd-preview-item';
      var head = document.createElement('div');
      head.className = 'tpd-prev-head';
      var name = document.createElement('div');
      name.className = 'tpd-fname'; name.textContent = entry.name;
      var type = document.createElement('div');
      type.className = 'tpd-type'; type.textContent = entry.type;
      head.appendChild(name); head.appendChild(type);
      var content = document.createElement('div');
      content.className = 'tpd-preview-content';
      if (entry.blob) {
        content.textContent = '[Binary file] ' + entry.blob.byteLength + ' bytes';
      } else {
        content.textContent = entry.content || '(empty)';
      }
      item.appendChild(head); item.appendChild(content);
      list.appendChild(item);
    });
  }

  /* ---------- Export ---------- */
  function textToBytes(str) {
    return window.MinecraftPack ? MinecraftPack.textBytes(str) : new TextEncoder().encode(str);
  }

  function zipName() { return sanitizeName($('tpd-name').value) + '.zip'; }

  var statusTimer = null;
  function showMsg(text, ok) {
    var m = $('tpd-status');
    if (!m) return;
    m.hidden = false;
    m.className = 'tpd-status ' + (ok ? 'ok' : 'err');
    m.textContent = text;
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { m.hidden = true; }, ok ? 3500 : 6000);
  }

  function exportZip() {
    var errors = validatePack().filter(function (item) { return item.level === 'error'; });
    if (errors.length) { showMsg('Fix ' + errors.length + ' validation error' + (errors.length === 1 ? '' : 's') + ' before exporting.', false); activateTab('export'); return; }
    try {
      var files = [];
      var meta = buildMeta();
      var metaStr = JSON.stringify(meta, null, 2);
      files.push({ name: 'pack.mcmeta', data: textToBytes(metaStr) });
      project.files.forEach(function (entry, path) {
        if (entry.blob) {
          files.push({ name: path, data: new Uint8Array(entry.blob) });
        } else {
          files.push({ name: path, data: textToBytes(entry.content || '') });
        }
      });
      var zip = TpcZip.createZip(files);
      var url = URL.createObjectURL(zip);
      var a = document.createElement('a');
      a.href = url; a.download = zipName();
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      showMsg('Exported ' + files.length + ' files to ' + zipName() + '.', true);
    } catch (e) {
      showMsg('Export failed: ' + e.message, false);
    }
  }

  function exportMetaOnly() {
    var metaStr = JSON.stringify(buildMeta(), null, 2);
    var blob = new Blob([metaStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'pack.mcmeta';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* ---------- Upload handling ---------- */
  async function handleFiles(fileList) {
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      var rel = (f.webkitRelativePath || f.name).replace(/\\/g, '/');
      var dataPos = rel.toLowerCase().indexOf('/data/');
      if (dataPos >= 0) rel = rel.slice(dataPos + 1);
      if (/(^|\/)pack\.mcmeta$/i.test(rel)) {
        try {
          var importedMeta = JSON.parse(await readFileAsText(f));
          if (importedMeta.pack) {
            $('tpd-desc').value = typeof importedMeta.pack.description === 'string' ? importedMeta.pack.description : JSON.stringify(importedMeta.pack.description || '');
            var importedFmt = importedMeta.pack.max_format || importedMeta.pack.min_format || importedMeta.pack.pack_format;
            if (Array.isArray(importedFmt)) importedFmt = importedFmt[0] + '.' + (importedFmt[1] || 0);
            var importedOption = Array.from($('tpd-format').options).find(function (o) { return parseFloat(o.value) === parseFloat(importedFmt); });
            if (importedOption) $('tpd-format').value = importedOption.value;
          }
        } catch (e) { showMsg('Could not parse pack.mcmeta.', false); }
        continue;
      }
      var path;
      if (/^data\//i.test(rel)) {
        path = rel;
      } else {
        var ns = sanitizeNamespace($('tpd-namespace').value || 'mypack');
        var base = sanitizeName(rel.replace(/\.[^.]+$/, ''));
        var ext = '';
        if (/\.mcfunction$/.test(rel)) {
          path = 'data/' + ns + '/' + folderForType('functions') + '/' + base + '.mcfunction';
        } else if (/\.json$/.test(rel)) {
          var type = guessTypeFromName(rel);
          path = 'data/' + ns + '/' + folderForType(type) + '/' + base + '.json';
        } else if (isLikelyBinary(rel)) {
          var binType = guessTypeFromName(rel);
          if (binType === 'functions') binType = '';
          var binExt = rel.replace(/^.*\./, '.');
          path = 'data/' + ns + (binType ? '/' + folderForType(binType) : '') + '/' + base + binExt;
        } else {
          path = 'data/' + ns + '/' + folderForType('functions') + '/' + base + '.txt';
        }
      }
      try {
        var text = await readFileAsText(f);
        var type = guessType(path);
        if (isLikelyBinary(f.name) && !(type === 'functions' || type === 'worldgen' || type === 'dimension' || type === 'dimension_type')) {
          var buffer = await readFileAsArrayBuffer(f);
          project.files.set(path, { name: fileNameFromPath(path), type: type, content: '', blob: buffer });
        } else {
          project.files.set(path, { name: fileNameFromPath(path), type: type, content: text });
        }
      } catch (e) {
        showMsg('Could not load ' + f.name, false);
      }
    }
    buildTree(); renderFileList(); renderPreview(); renderMeta();
    if (!selectedPath && project.files.size > 0) selectFile(Array.from(project.files.keys())[0]);
    showMsg('Imported ' + fileList.length + ' file(s).', true);
  }

  function readFileAsArrayBuffer(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  function guessTypeFromName(name) {
    name = name.toLowerCase();
    if (name.indexOf('advancement') !== -1) return 'advancements';
    if (name.indexOf('recipe') !== -1) return 'recipes';
    if (name.indexOf('loot') !== -1 || name.indexOf('loot_table') !== -1) return 'loot_tables';
    if (name.indexOf('tag') !== -1) return 'tags';
    if (name.indexOf('predicate') !== -1) return 'predicates';
    if (name.indexOf('item_modifier') !== -1 || name.indexOf('loot_modifier') !== -1) return 'item_modifiers';
    if (name.indexOf('dimension_type') !== -1) return 'dimension_type';
    if (name.indexOf('dimension') !== -1) return 'dimension';
    if (name.indexOf('worldgen') !== -1 || name.indexOf('configured_feature') !== -1 || name.indexOf('placed_feature') !== -1) return 'worldgen';
    if (name.indexOf('structure') !== -1) return 'structures';
    if (name.indexOf('smithing_trim') !== -1 || name.indexOf('trim') !== -1) return 'smithing_trim';
    if (name.indexOf('smithing_transform') !== -1) return 'smithing_transform';
    if (name.indexOf('chat_type') !== -1 || name.indexOf('chat') !== -1) return 'chat_type';
    if (name.indexOf('jukebox') !== -1) return 'jukebox_song';
    if (name.indexOf('trim_pattern') !== -1) return 'trim_pattern';
    if (name.indexOf('trim_material') !== -1) return 'trim_material';
    if (name.indexOf('damage_type') !== -1) return 'damage_type';
    if (name.indexOf('painting') !== -1) return 'painting_variant';
    if (name.indexOf('wolf') !== -1) return 'wolf_variant';
    if (name.indexOf('instrument') !== -1) return 'instrument';
    return 'file';
  }

  function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /* ---------- Simple mode ---------- */
  function toggleSimpleMode() {
    simpleMode = !simpleMode;
    var btn = $('tpd-mode-toggle');
    var simpleEl = $('tpd-simple');
    var editorEl = $('tpd-editor');
    if (btn) btn.textContent = 'Simple mode: ' + (simpleMode ? 'on' : 'off');
    if (simpleEl) simpleEl.hidden = !simpleMode;
    if (simpleMode) {
      if (editorEl) editorEl.style.display = 'none';
      renderSimpleForm();
    } else {
      if (editorEl) editorEl.style.display = '';
    }
  }

  function renderSimpleForm() {
    var body = $('tpd-simple-body');
    if (!body) return;
    body.innerHTML = '';
    if (!selectedPath || !project.files.has(selectedPath)) {
      body.innerHTML = '<div class=\"tpd-field\"><label>No file selected</label></div>';
      return;
    }
    var entry = project.files.get(selectedPath);
    var content = editor.value || entry.content || '';
    if (entry.type === 'functions') {
      renderSimpleFunctions(body, content);
    } else if (entry.type === 'recipes') {
      renderSimpleRecipe(body, content);
    } else if (entry.type === 'advancements') {
      renderSimpleAdvancement(body, content);
    } else if (entry.type === 'loot_tables') {
      renderSimpleLootTable(body, content);
    } else if (entry.type === 'tags') {
      renderSimpleTag(body, content);
    } else if (entry.type === 'item_modifiers') {
      renderSimpleItemModifier(body, content);
    } else if (entry.type === 'predicates') {
      renderSimplePredicate(body, content);
    } else if (entry.type === 'dimension_type') {
      renderSimpleDimensionType(body, content);
    } else if (entry.type === 'dimension') {
      renderSimpleDimension(body, content);
    } else if (entry.type === 'worldgen') {
      renderSimpleWorldgen(body, content);
    } else if (entry.type === 'smithing_trim') {
      renderSimpleSmithingTrim(body, content);
    } else if (entry.type === 'smithing_transform') {
      renderSimpleSmithingTransform(body, content);
    } else if (entry.type === 'chat_type') {
      renderSimpleChatType(body, content);
    } else if (entry.type === 'jukebox_song') {
      renderSimpleJukeboxSong(body, content);
    } else if (entry.type === 'trim_pattern') {
      renderSimpleTrimPattern(body, content);
    } else if (entry.type === 'trim_material') {
      renderSimpleTrimMaterial(body, content);
    } else if (entry.type === 'damage_type') {
      renderSimpleDamageType(body, content);
    } else if (entry.type === 'painting_variant') {
      renderSimplePaintingVariant(body, content);
    } else if (entry.type === 'wolf_variant') {
      renderSimpleWolfVariant(body, content);
    } else if (entry.type === 'instrument') {
      renderSimpleInstrument(body, content);
    } else {
      body.innerHTML = '<div class=\"tpd-field\"><label>Simple editing is not supported for this file type yet. Use Code mode.</label></div>';
    }
  }

  function renderSimpleFunctions(body, content) {
    body.innerHTML = '<div class=\"tpd-field\"><label>Commands (one per line)</label><textarea id=\"tpd-simple-cmds\">' + escHtml(content) + '</textarea></div>';
    bindSimpleInput('tpd-simple-cmds', content);
  }

  function renderSimpleRecipe(body, content) {
    var data = tryParseJson(content) || {};
    var type = data.type || 'minecraft:crafting_shaped';
    var pattern = Array.isArray(data.pattern) ? data.pattern.join('\n') : '###\n # \n # ';
    var key = data.key || {};
    var result = data.result || {};
    var resultItem = result.item || 'minecraft:stone';
    var resultCount = result.count || 1;
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Type</label><select id=\"tpd-simple-recipe-type\"><option value=\"minecraft:crafting_shaped\">Shaped</option><option value=\"minecraft:crafting_shapeless\">Shapeless</option><option value=\"minecraft:stonecutting\">Stonecutting</option><option value=\"minecraft:smithing\">Smithing</option></select></div>' +
        '<div class=\"tpd-field\"><label>Result item</label><input id=\"tpd-simple-recipe-result\" value=\"' + escHtml(resultItem) + '\"></div>' +
        '<div class=\"tpd-field\"><label>Count</label><input id=\"tpd-simple-recipe-count\" type=\"number\" min=\"1\" max=\"64\" value=\"' + resultCount + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Pattern (3 lines, use # for key placeholders)</label><textarea id=\"tpd-simple-recipe-pattern\">' + escHtml(pattern) + '</textarea></div>' +
      '<div class=\"tpd-field\"><label>Key (one per line, format: symbol=item_id)</label><textarea id=\"tpd-simple-recipe-key\">' + escHtml(formatRecipeKey(key)) + '</textarea></div>';
    bindSimpleInput('tpd-simple-recipe-type', data, function () { return buildRecipe(); });
    bindSimpleInput('tpd-simple-recipe-result', data, function () { return buildRecipe(); });
    bindSimpleInput('tpd-simple-recipe-count', data, function () { return buildRecipe(); });
    bindSimpleInput('tpd-simple-recipe-pattern', data, function () { return buildRecipe(); });
    bindSimpleInput('tpd-simple-recipe-key', data, function () { return buildRecipe(); });
  }

  function formatRecipeKey(key) {
    var lines = [];
    Object.keys(key).forEach(function (k) {
      var item = key[k] && key[k].item ? key[k].item : 'minecraft:stone';
      lines.push(k + '=' + item);
    });
    return lines.join('\n');
  }

  function buildRecipe() {
    var type = $('tpd-simple-recipe-type') ? $('tpd-simple-recipe-type').value : 'minecraft:crafting_shaped';
    var resultItem = $('tpd-simple-recipe-result') ? $('tpd-simple-recipe-result').value : 'minecraft:stone';
    var resultCount = $('tpd-simple-recipe-count') ? parseInt($('tpd-simple-recipe-count').value, 10) || 1 : 1;
    var patternRaw = $('tpd-simple-recipe-pattern') ? $('tpd-simple-recipe-pattern').value : '';
    var keyRaw = $('tpd-simple-recipe-key') ? $('tpd-simple-recipe-key').value : '';
    var pattern = patternRaw.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var key = {};
    keyRaw.split('\n').forEach(function (line) {
      line = line.trim();
      if (!line) return;
      var parts = line.split('=');
      if (parts.length >= 2) key[parts[0].trim()] = { item: parts[1].trim() };
    });
    var out = { type: type, result: { item: resultItem, count: resultCount } };
    if (type === 'minecraft:crafting_shaped' || type === 'minecraft:smithing') {
      out.pattern = pattern;
      out.key = key;
    } else if (type === 'minecraft:crafting_shapeless') {
      out.ingredients = [];
      Object.keys(key).forEach(function (k) {
        out.ingredients.push({ item: key[k].item });
      });
    }
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleAdvancement(body, content) {
    var data = tryParseJson(content) || {};
    var display = data.display || {};
    var criteria = data.criteria || {};
    var firstKey = Object.keys(criteria)[0] || 'example';
    var firstCriteria = criteria[firstKey] || { trigger: 'minecraft:impossible' };
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Title</label><input id=\"tpd-simple-adv-title\" value=\"' + escHtml(display.title || '') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Description</label><input id=\"tpd-simple-adv-desc\" value=\"' + escHtml(display.description || '') + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Icon item</label><input id=\"tpd-simple-adv-icon\" value=\"' + escHtml((display.icon && display.icon.item) || 'minecraft:stone') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Frame</label><select id=\"tpd-simple-adv-frame\"><option value=\"task\">Task</option><option value=\"challenge\">Challenge</option><option value=\"goal\">Goal</option></select></div>' +
      '</div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Trigger</label><select id=\"tpd-simple-adv-trigger\"><option value=\"minecraft:impossible\">Impossible</option><option value=\"minecraft:recipe_crafted\">Recipe Crafted</option><option value=\"minecraft:inventory_changed\">Inventory Changed</option><option value=\"minecraft:player_killed_entity\">Player Killed Entity</option><option value=\"minecraft:entity_killed_player\">Entity Killed Player</option></select></div>' +
        '<div class=\"tpd-field\"><label>Background (optional)</label><input id=\"tpd-simple-adv-bg\" value=\"' + escHtml(display.background || '') + '\"></div>' +
      '</div>';
    if (display.frame) $('tpd-simple-adv-frame').value = display.frame;
    if (firstCriteria.trigger) $('tpd-simple-adv-trigger').value = firstCriteria.trigger;
    bindSimpleInput('tpd-simple-adv-title', data, function () { return buildAdvancement(); });
    bindSimpleInput('tpd-simple-adv-desc', data, function () { return buildAdvancement(); });
    bindSimpleInput('tpd-simple-adv-icon', data, function () { return buildAdvancement(); });
    bindSimpleInput('tpd-simple-adv-frame', data, function () { return buildAdvancement(); });
    bindSimpleInput('tpd-simple-adv-trigger', data, function () { return buildAdvancement(); });
    bindSimpleInput('tpd-simple-adv-bg', data, function () { return buildAdvancement(); });
  }

  function buildAdvancement() {
    var title = $('tpd-simple-adv-title') ? $('tpd-simple-adv-title').value : '';
    var desc = $('tpd-simple-adv-desc') ? $('tpd-simple-adv-desc').value : '';
    var icon = $('tpd-simple-adv-icon') ? $('tpd-simple-adv-icon').value : 'minecraft:stone';
    var frame = $('tpd-simple-adv-frame') ? $('tpd-simple-adv-frame').value : 'task';
    var trigger = $('tpd-simple-adv-trigger') ? $('tpd-simple-adv-trigger').value : 'minecraft:impossible';
    var bg = $('tpd-simple-adv-bg') ? $('tpd-simple-adv-bg').value : '';
    var out = {
      display: { title: title, description: desc, icon: { item: icon }, frame: frame, show_toast: true, announce_to_chat: true },
      criteria: { triggered: { trigger: trigger } }
    };
    if (bg) out.display.background = bg;
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleLootTable(body, content) {
    var data = tryParseJson(content) || {};
    var pool = (data.pools && data.pools[0]) || {};
    var entries = Array.isArray(pool.entries) ? pool.entries : [];
    var entry = entries[0] || {};
    var functions = entry.functions || [];
    var func = functions[0] || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Entry type</label><select id=\"tpd-simple-loot-type\"><option value=\"minecraft:item\">Item</option><option value=\"minecraft:empty\">Empty</option><option value=\"minecraft:tag\">Tag</option><option value=\"minecraft:loot_table\">Loot Table</option></select></div>' +
        '<div class=\"tpd-field\"><label>Item / target</label><input id=\"tpd-simple-loot-name\" value=\"' + escHtml(entry.name || 'minecraft:stone') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Weight</label><input id=\"tpd-simple-loot-weight\" type=\"number\" value=\"' + (entry.weight || 1) + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Function</label><select id=\"tpd-simple-loot-func\"><option value=\"\">None</option><option value=\"minecraft:set_count\">Set Count</option><option value=\"minecraft:set_damage\">Set Damage</option><option value=\"minecraft:enchant_randomly\">Enchant Randomly</option><option value=\"minecraft:looting_enchant\">Looting Enchant</option></select></div>' +
        '<div class=\"tpd-field\"><label>Min</label><input id=\"tpd-simple-loot-min\" type=\"number\" value=\"' + (func.count ? (typeof func.count === 'object' ? (func.count.min || 1) : func.count) : 1) + '\"></div>' +
        '<div class=\"tpd-field\"><label>Max</label><input id=\"tpd-simple-loot-max\" type=\"number\" value=\"' + (func.count ? (typeof func.count === 'object' ? (func.count.max || 1) : func.count) : 1) + '\"></div>' +
      '</div>';
    bindSimpleInput('tpd-simple-loot-type', data, function () { return buildLootTable(); });
    bindSimpleInput('tpd-simple-loot-name', data, function () { return buildLootTable(); });
    bindSimpleInput('tpd-simple-loot-weight', data, function () { return buildLootTable(); });
    bindSimpleInput('tpd-simple-loot-func', data, function () { return buildLootTable(); });
    bindSimpleInput('tpd-simple-loot-min', data, function () { return buildLootTable(); });
    bindSimpleInput('tpd-simple-loot-max', data, function () { return buildLootTable(); });
  }

  function buildLootTable() {
    var type = $('tpd-simple-loot-type') ? $('tpd-simple-loot-type').value : 'minecraft:item';
    var name = $('tpd-simple-loot-name') ? $('tpd-simple-loot-name').value : 'minecraft:stone';
    var weight = $('tpd-simple-loot-weight') ? parseInt($('tpd-simple-loot-weight').value, 10) || 1 : 1;
    var func = $('tpd-simple-loot-func') ? $('tpd-simple-loot-func').value : '';
    var min = $('tpd-simple-loot-min') ? parseInt($('tpd-simple-loot-min').value, 10) || 1 : 1;
    var max = $('tpd-simple-loot-max') ? parseInt($('tpd-simple-loot-max').value, 10) || 1 : 1;
    var entry = { type: type, name: name, weight: weight };
    if (func) {
      entry.functions = [];
      var f = { function: func };
      if (func === 'minecraft:set_count') f.count = { type: 'minecraft:uniform', min: min, max: max };
      if (func === 'minecraft:set_damage') f.damage = { type: 'minecraft:uniform', min: min/100, max: max/100 };
      entry.functions.push(f);
    }
    var out = { pools: [{ rolls: 1, entries: [entry] }] };
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleTag(body, content) {
    var data = tryParseJson(content) || {};
    var values = Array.isArray(data.values) ? data.values : [];
    body.innerHTML =
      '<div class=\"tpd-field\"><label>Values (one per line, e.g. minecraft:diamond)</label><textarea id=\"tpd-simple-tag-values\">' + escHtml(values.join('\n')) + '</textarea></div>';
    bindSimpleInput('tpd-simple-tag-values', data, function () { return buildTag(); });
  }

  function buildTag() {
    var raw = $('tpd-simple-tag-values') ? $('tpd-simple-tag-values').value : '';
    var values = raw.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
    return JSON.stringify({ values: values }, null, 2);
  }

  function renderSimpleItemModifier(body, content) {
    var data = tryParseJson(content) || {};
    var func = data.function || 'minecraft:set_count';
    var count = data.count || 1;
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Function</label><select id=\"tpd-simple-im-func\"><option value=\"minecraft:set_count\">Set Count</option><option value=\"minecraft:set_damage\">Set Damage</option><option value=\"minecraft:enchant_randomly\">Enchant Randomly</option><option value=\"minecraft:set_attributes\">Set Attributes</option></select></div>' +
        '<div class=\"tpd-field\"><label>Value</label><input id=\"tpd-simple-im-value\" type=\"number\" value=\"' + (typeof count === 'object' ? (count.min || 1) : count) + '\"></div>' +
        '<div class=\"tpd-field\"><label>Max (for range)</label><input id=\"tpd-simple-im-max\" type=\"number\" value=\"' + (typeof count === 'object' ? (count.max || 1) : count) + '\"></div>' +
      '</div>';
    bindSimpleInput('tpd-simple-im-func', data, function () { return buildItemModifier(); });
    bindSimpleInput('tpd-simple-im-value', data, function () { return buildItemModifier(); });
    bindSimpleInput('tpd-simple-im-max', data, function () { return buildItemModifier(); });
  }

  function buildItemModifier() {
    var func = $('tpd-simple-im-func') ? $('tpd-simple-im-func').value : 'minecraft:set_count';
    var val = $('tpd-simple-im-value') ? parseInt($('tpd-simple-im-value').value, 10) || 1 : 1;
    var max = $('tpd-simple-im-max') ? parseInt($('tpd-simple-im-max').value, 10) || val : val;
    var out = { function: func };
    if (func === 'minecraft:set_count') out.count = { type: 'minecraft:uniform', min: val, max: max };
    if (func === 'minecraft:set_damage') out.damage = { type: 'minecraft:uniform', min: Math.max(0, val/100), max: Math.max(0, max/100) };
    return JSON.stringify(out, null, 2);
  }

  function renderSimplePredicate(body, content) {
    var data = tryParseJson(content) || {};
    var condition = data.condition || 'minecraft:entity_properties';
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Condition</label><select id=\"tpd-simple-pred-cond\"><option value=\"minecraft:entity_properties\">Entity Properties</option><option value=\"minecraft:location_check\">Location Check</option><option value=\"minecraft:random_chance\">Random Chance</option><option value=\"minecraft:match_tool\">Match Tool</option></select></div>' +
        '<div class=\"tpd-field\"><label>Entity / target</label><input id=\"tpd-simple-pred-entity\" value=\"' + escHtml(data.entity || 'this') + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Biome (for location_check)</label><input id=\"tpd-simple-pred-biome\" value=\"' + escHtml((data.predicate && data.predicate.location && data.predicate.location.biome) || 'minecraft:plains') + '\"></div>';
    bindSimpleInput('tpd-simple-pred-cond', data, function () { return buildPredicate(); });
    bindSimpleInput('tpd-simple-pred-entity', data, function () { return buildPredicate(); });
    bindSimpleInput('tpd-simple-pred-biome', data, function () { return buildPredicate(); });
  }

  function buildPredicate() {
    var cond = $('tpd-simple-pred-cond') ? $('tpd-simple-pred-cond').value : 'minecraft:entity_properties';
    var entity = $('tpd-simple-pred-entity') ? $('tpd-simple-pred-entity').value : 'this';
    var biome = $('tpd-simple-pred-biome') ? $('tpd-simple-pred-biome').value : 'minecraft:plains';
    var out = { condition: cond, entity: entity };
    if (cond === 'minecraft:entity_properties') {
      out.predicate = { location: { biome: biome } };
    } else if (cond === 'minecraft:location_check') {
      out.predicate = { location: { biome: biome } };
    }
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleDimensionType(body, content) {
    var data = tryParseJson(content) || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Name</label><input id=\"tpd-simple-dimtype-name\" value=\"' + escHtml(data.name || 'my_dimension') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Effects</label><select id=\"tpd-simple-dimtype-fx\"><option value=\"minecraft:overworld\">Overworld</option><option value=\"minecraft:the_nether\">Nether</option><option value=\"minecraft:the_end\">End</option></select></div>' +
      '</div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Min Y</label><input id=\"tpd-simple-dimtype-miny\" type=\"number\" value=\"' + (data.min_y || 0) + '\"></div>' +
        '<div class=\"tpd-field\"><label>Max Y</label><input id=\"tpd-simple-dimtype-maxy\" type=\"number\" value=\"' + (data.max_y || 256) + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Infiniburn</label><input id=\"tpd-simple-dimtype-inf\" value=\"' + escHtml(data.infiniburn || '#minecraft:infiniburn_overworld') + '\"></div>';
    bindSimpleInput('tpd-simple-dimtype-name', data, function () { return buildDimensionType(); });
    bindSimpleInput('tpd-simple-dimtype-fx', data, function () { return buildDimensionType(); });
    bindSimpleInput('tpd-simple-dimtype-miny', data, function () { return buildDimensionType(); });
    bindSimpleInput('tpd-simple-dimtype-maxy', data, function () { return buildDimensionType(); });
    bindSimpleInput('tpd-simple-dimtype-inf', data, function () { return buildDimensionType(); });
  }

  function buildDimensionType() {
    var name = $('tpd-simple-dimtype-name') ? $('tpd-simple-dimtype-name').value : 'my_dimension';
    var fx = $('tpd-simple-dimtype-fx') ? $('tpd-simple-dimtype-fx').value : 'minecraft:overworld';
    var minY = $('tpd-simple-dimtype-miny') ? parseInt($('tpd-simple-dimtype-miny').value, 10) || 0 : 0;
    var maxY = $('tpd-simple-dimtype-maxy') ? parseInt($('tpd-simple-dimtype-maxy').value, 10) || 256 : 256;
    var inf = $('tpd-simple-dimtype-inf') ? $('tpd-simple-dimtype-inf').value : '#minecraft:infiniburn_overworld';
    var out = {
      name: name,
      ultrawarm: false,
      natural: true,
      coordinate_scale: 1.0,
      has_skylight: true,
      has_ceiling: false,
      ambient_light: 0.0,
      bed_works: true,
      respawn_anchor_works: true,
      has_raids: true,
      logical_height: maxY,
      min_y: minY,
      max_y: maxY,
      infiniburn: inf,
      effects: fx
    };
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleDimension(body, content) {
    var data = tryParseJson(content) || {};
    var gen = data.generator || {};
    body.innerHTML =
      '<div class=\"tpd-field\"><label>Dimension type</label><input id=\"tpd-simple-dim-type\" value=\"' + escHtml(data.type || 'minecraft:overworld') + '\"></div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Generator type</label><select id=\"tpd-simple-dim-gen\"><option value=\"minecraft:noise\">Noise</option><option value=\"minecraft:flat\">Flat</option><option value=\"minecraft:debug\">Debug</option></select></div>' +
        '<div class=\"tpd-field\"><label>Seed</label><input id=\"tpd-simple-dim-seed\" type=\"number\" value=\"' + (gen.seed || 0) + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Biome source type</label><select id=\"tpd-simple-dim-biome\"><option value=\"minecraft:fixed\">Fixed</option><option value=\"minecraft:multi_noise\">Multi Noise</option><option value=\"minecraft:checkerboard\">Checkerboard</option></select></div>' +
      '<div class=\"tpd-field\"><label>Fixed biome (if fixed)</label><input id=\"tpd-simple-dim-biome-fixed\" value=\"' + escHtml((gen.biome_source && gen.biome_source.biome) || 'minecraft:plains') + '\"></div>';
    bindSimpleInput('tpd-simple-dim-type', data, function () { return buildDimension(); });
    bindSimpleInput('tpd-simple-dim-gen', data, function () { return buildDimension(); });
    bindSimpleInput('tpd-simple-dim-seed', data, function () { return buildDimension(); });
    bindSimpleInput('tpd-simple-dim-biome', data, function () { return buildDimension(); });
    bindSimpleInput('tpd-simple-dim-biome-fixed', data, function () { return buildDimension(); });
  }

  function buildDimension() {
    var type = $('tpd-simple-dim-type') ? $('tpd-simple-dim-type').value : 'minecraft:overworld';
    var genType = $('tpd-simple-dim-gen') ? $('tpd-simple-dim-gen').value : 'minecraft:noise';
    var seed = $('tpd-simple-dim-seed') ? parseInt($('tpd-simple-dim-seed').value, 10) || 0 : 0;
    var biomeType = $('tpd-simple-dim-biome') ? $('tpd-simple-dim-biome').value : 'minecraft:fixed';
    var fixedBiome = $('tpd-simple-dim-biome-fixed') ? $('tpd-simple-dim-biome-fixed').value : 'minecraft:plains';
    var biomeSource = { type: biomeType };
    if (biomeType === 'minecraft:fixed') biomeSource.biome = fixedBiome;
    var out = {
      type: type,
      generator: {
        type: genType,
        seed: seed,
        settings: 'minecraft:overworld',
        biome_source: biomeSource
      }
    };
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleWorldgen(body, content) {
    var data = tryParseJson(content) || {};
    var featureType = data.type || 'minecraft:tree';
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Feature type</label><select id=\"tpd-simple-wg-type\"><option value=\"minecraft:tree\">Tree</option><option value=\"minecraft:ore\">Ore</option><option value=\"minecraft:flower\">Flower</option><option value=\"minecraft:random_patch\">Random Patch</option></select></div>' +
        '<div class=\"tpd-field\"><label>Target block</label><input id=\"tpd-simple-wg-target\" value=\"' + escHtml(data.config && data.config.trunk_provider && data.config.trunk_provider.state ? data.config.trunk_provider.state.Name : 'minecraft:oak_log') + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Notes / extra JSON</label><textarea id=\"tpd-simple-wg-notes\">Use simple fields above or paste custom JSON in the code editor.</textarea></div>';
    bindSimpleInput('tpd-simple-wg-type', data, function () { return buildWorldgen(); });
    bindSimpleInput('tpd-simple-wg-target', data, function () { return buildWorldgen(); });
    bindSimpleInput('tpd-simple-wg-notes', data, function () { return buildWorldgen(); });
  }

  function buildWorldgen() {
    var type = $('tpd-simple-wg-type') ? $('tpd-simple-wg-type').value : 'minecraft:tree';
    var target = $('tpd-simple-wg-target') ? $('tpd-simple-wg-target').value : 'minecraft:oak_log';
    var notes = $('tpd-simple-wg-notes') ? $('tpd-simple-wg-notes').value : '';
    var out = { type: type };
    if (type === 'minecraft:tree') {
      out.config = {
        minimum_size: { type: 'minecraft:two_layers_feature_size', limit: 1, lower_size: 0, upper_size: 1 },
        trunk_provider: { type: 'minecraft:simple_state_provider', state: { Name: target } },
        foliage_provider: { type: 'minecraft:simple_state_provider', state: { Name: target.replace('_log', '_leaves') } },
        trunk_height: 5,
        foliage_height: 3,
        foliage_radius: 2
      };
    } else if (type === 'minecraft:ore') {
      out = {
        type: 'minecraft:ore',
        config: {
          target: {
            target: { type: 'minecraft:replace', predicate: { type: 'minecraft:block', block: target } },
            state: { Name: target }
          },
          size: 8,
          discard_chance_on_air_exposure: 0
        }
      };
    } else {
      out.config = { raw: notes };
    }
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleSmelting(body, content) {
    var data = tryParseJson(content) || {};
    var ingredient = data.ingredient && data.ingredient.item ? data.ingredient.item : 'minecraft:porkchop';
    var result = data.result || 'minecraft:cooked_porkchop';
    var cookingtime = data.cookingtime || 200;
    var experience = data.experience || 0.35;
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Recipe type</label><select id=\"tpd-simple-smelt-type\"><option value=\"minecraft:cooking\">Cooking (Furnace)</option><option value=\"minecraft:blasting\">Blasting</option><option value=\"minecraft:smoking\">Smoking</option></select></div>' +
        '<div class=\"tpd-field\"><label>Ingredient item</label><input id=\"tpd-simple-smelt-ing\" value=\"' + escHtml(ingredient) + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Result item</label><input id=\"tpd-simple-smelt-result\" value=\"' + escHtml(result) + '\"></div>' +
        '<div class=\"tpd-field\"><label>Cook time (ticks)</label><input id=\"tpd-simple-smelt-time\" type=\"number\" value=\"' + cookingtime + '\"></div>' +
        '<div class=\"tpd-field\"><label>Experience</label><input id=\"tpd-simple-smelt-xp\" type=\"number\" step=\"0.01\" value=\"' + experience + '\"></div>' +
      '</div>';
    bindSimpleInput('tpd-simple-smelt-type', data, function () { return buildSmelting(); });
    bindSimpleInput('tpd-simple-smelt-ing', data, function () { return buildSmelting(); });
    bindSimpleInput('tpd-simple-smelt-result', data, function () { return buildSmelting(); });
    bindSimpleInput('tpd-simple-smelt-time', data, function () { return buildSmelting(); });
    bindSimpleInput('tpd-simple-smelt-xp', data, function () { return buildSmelting(); });
  }

  function buildSmelting() {
    var type = $('tpd-simple-smelt-type') ? $('tpd-simple-smelt-type').value : 'minecraft:cooking';
    var ing = $('tpd-simple-smelt-ing') ? $('tpd-simple-smelt-ing').value : 'minecraft:porkchop';
    var result = $('tpd-simple-smelt-result') ? $('tpd-simple-smelt-result').value : 'minecraft:cooked_porkchop';
    var time = $('tpd-simple-smelt-time') ? parseInt($('tpd-simple-smelt-time').value, 10) || 200 : 200;
    var xp = $('tpd-simple-smelt-xp') ? parseFloat($('tpd-simple-smelt-xp').value) || 0.35 : 0.35;
    return JSON.stringify({ type: type, ingredient: { item: ing }, result: result, cookingtime: time, experience: xp }, null, 2);
  }

  function renderSimpleSmithingTrim(body, content) {
    var data = tryParseJson(content) || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Template</label><input id=\"tpd-simple-trim-tmpl\" value=\"' + escHtml(data.template || 'minecraft:template_sentry') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Base armor</label><input id=\"tpd-simple-trim-base\" value=\"' + escHtml(data.base || 'minecraft:netherite_chestplate') + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Trim material</label><input id=\"tpd-simple-trim-mat\" value=\"' + escHtml(data.trim || 'minecraft:quartz') + '\"></div>';
    bindSimpleInput('tpd-simple-trim-tmpl', data, function () { return buildSmithingTrim(); });
    bindSimpleInput('tpd-simple-trim-base', data, function () { return buildSmithingTrim(); });
    bindSimpleInput('tpd-simple-trim-mat', data, function () { return buildSmithingTrim(); });
  }

  function buildSmithingTrim() {
    var tmpl = $('tpd-simple-trim-tmpl') ? $('tpd-simple-trim-tmpl').value : 'minecraft:template_sentry';
    var base = $('tpd-simple-trim-base') ? $('tpd-simple-trim-base').value : 'minecraft:netherite_chestplate';
    var trim = $('tpd-simple-trim-mat') ? $('tpd-simple-trim-mat').value : 'minecraft:quartz';
    return JSON.stringify({ type: 'minecraft:smithing_trim', template: tmpl, base: base, trim: trim }, null, 2);
  }

  function renderSimpleSmithingTransform(body, content) {
    var data = tryParseJson(content) || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Template</label><input id=\"tpd-simple-stran-tmpl\" value=\"' + escHtml(data.template || 'minecraft:template_sentry') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Base item</label><input id=\"tpd-simple-stran-base\" value=\"' + escHtml(data.base || 'minecraft:netherite_sword') + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Addition item</label><input id=\"tpd-simple-stran-add\" value=\"' + escHtml(data.addition || 'minecraft:netherite_ingot') + '\"></div>';
    bindSimpleInput('tpd-simple-stran-tmpl', data, function () { return buildSmithingTransform(); });
    bindSimpleInput('tpd-simple-stran-base', data, function () { return buildSmithingTransform(); });
    bindSimpleInput('tpd-simple-stran-add', data, function () { return buildSmithingTransform(); });
  }

  function buildSmithingTransform() {
    var tmpl = $('tpd-simple-stran-tmpl') ? $('tpd-simple-stran-tmpl').value : 'minecraft:template_sentry';
    var base = $('tpd-simple-stran-base') ? $('tpd-simple-stran-base').value : 'minecraft:netherite_sword';
    var add = $('tpd-simple-stran-add') ? $('tpd-simple-stran-add').value : 'minecraft:netherite_ingot';
    return JSON.stringify({ type: 'minecraft:smithing_transform', template: tmpl, base: base, addition: add }, null, 2);
  }

  function renderSimpleChatType(body, content) {
    var data = tryParseJson(content) || {};
    var chat = data.chat_type || {};
    body.innerHTML =
      '<div class=\"tpd-field\"><label>Display name translate</label><input id=\"tpd-simple-chat-display\" value=\"' + escHtml((chat.display_name && chat.display_name.translate) || 'chat.type.text') + '\"></div>' +
      '<div class=\"tpd-field\"><label>Parameters (comma separated)</label><input id=\"tpd-simple-chat-params\" value=\"' + escHtml((chat.parameters || []).join(', ')) + '\"></div>';
    bindSimpleInput('tpd-simple-chat-display', data, function () { return buildChatType(); });
    bindSimpleInput('tpd-simple-chat-params', data, function () { return buildChatType(); });
  }

  function buildChatType() {
    var display = $('tpd-simple-chat-display') ? $('tpd-simple-chat-display').value : 'chat.type.text';
    var paramsRaw = $('tpd-simple-chat-params') ? $('tpd-simple-chat-params').value : '';
    var params = paramsRaw.split(',').map(function (p) { return p.trim(); }).filter(function (p) { return p.length > 0; });
    return JSON.stringify({ chat_type: { display_name: { translate: display }, parameters: params } }, null, 2);
  }

  function renderSimpleJukeboxSong(body, content) {
    var data = tryParseJson(content) || {};
    var song = data.jukebox_song || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Sound event</label><input id=\"tpd-simple-juke-sound\" value=\"' + escHtml(song.sound_event || 'minecraft:record.pigstep') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Comparator output</label><input id=\"tpd-simple-juke-comp\" type=\"number\" value=\"' + (song.comparator_output || 6) + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Length in seconds</label><input id=\"tpd-simple-juke-len\" type=\"number\" value=\"' + (song.length_in_seconds || 180) + '\"></div>';
    bindSimpleInput('tpd-simple-juke-sound', data, function () { return buildJukeboxSong(); });
    bindSimpleInput('tpd-simple-juke-comp', data, function () { return buildJukeboxSong(); });
    bindSimpleInput('tpd-simple-juke-len', data, function () { return buildJukeboxSong(); });
  }

  function buildJukeboxSong() {
    var sound = $('tpd-simple-juke-sound') ? $('tpd-simple-juke-sound').value : 'minecraft:record.pigstep';
    var comp = $('tpd-simple-juke-comp') ? parseInt($('tpd-simple-juke-comp').value, 10) || 6 : 6;
    var len = $('tpd-simple-juke-len') ? parseInt($('tpd-simple-juke-len').value, 10) || 180 : 180;
    return JSON.stringify({ jukebox_song: { comparator_output: comp, length_in_seconds: len, sound_event: sound } }, null, 2);
  }

  function renderSimpleTrimPattern(body, content) {
    var data = tryParseJson(content) || {};
    var trim = data.trim_pattern || {};
    body.innerHTML =
      '<div class=\"tpd-field\"><label>Description translate</label><input id=\"tpd-simple-trimp-desc\" value=\"' + escHtml((trim.description && trim.description.translate) || 'trim_pattern.minecraft.spire') + '\"></div>' +
      '<div class=\"tpd-field\"><label>Template item</label><input id=\"tpd-simple-trimp-tmpl\" value=\"' + escHtml(trim.template_item || 'minecraft:template_sentry') + '\"></div>';
    bindSimpleInput('tpd-simple-trimp-desc', data, function () { return buildTrimPattern(); });
    bindSimpleInput('tpd-simple-trimp-tmpl', data, function () { return buildTrimPattern(); });
  }

  function buildTrimPattern() {
    var desc = $('tpd-simple-trimp-desc') ? $('tpd-simple-trimp-desc').value : 'trim_pattern.minecraft.spire';
    var tmpl = $('tpd-simple-trimp-tmpl') ? $('tpd-simple-trimp-tmpl').value : 'minecraft:template_sentry';
    return JSON.stringify({ trim_pattern: { description: { translate: desc }, template_item: tmpl } }, null, 2);
  }

  function renderSimpleTrimMaterial(body, content) {
    var data = tryParseJson(content) || {};
    var mat = data.trim_material || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Description translate</label><input id=\"tpd-simple-trimm-desc\" value=\"' + escHtml((mat.description && mat.description.translate) || 'trim_material.minecraft.quartz') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Ingredient item</label><input id=\"tpd-simple-trimm-ing\" value=\"' + escHtml(mat.ingredient || 'minecraft:quartz') + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Item model index</label><input id=\"tpd-simple-trimm-idx\" type=\"number\" step=\"0.1\" value=\"' + (mat.item_model_index || 0.5) + '\"></div>';
    bindSimpleInput('tpd-simple-trimm-desc', data, function () { return buildTrimMaterial(); });
    bindSimpleInput('tpd-simple-trimm-ing', data, function () { return buildTrimMaterial(); });
    bindSimpleInput('tpd-simple-trimm-idx', data, function () { return buildTrimMaterial(); });
  }

  function buildTrimMaterial() {
    var desc = $('tpd-simple-trimm-desc') ? $('tpd-simple-trimm-desc').value : 'trim_material.minecraft.quartz';
    var ing = $('tpd-simple-trimm-ing') ? $('tpd-simple-trimm-ing').value : 'minecraft:quartz';
    var idx = $('tpd-simple-trimm-idx') ? parseFloat($('tpd-simple-trimm-idx').value) || 0.5 : 0.5;
    return JSON.stringify({ trim_material: { description: { translate: desc }, ingredient: ing, item_model_index: idx } }, null, 2);
  }

  function renderSimpleDamageType(body, content) {
    var data = tryParseJson(content) || {};
    var dt = data.damage_type || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Message ID</label><input id=\"tpd-simple-dmg-id\" value=\"' + escHtml(dt.message_id || 'my_damage') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Scaling</label><select id=\"tpd-simple-dmg-scale\"><option value=\"never\">Never</option><option value=\"always\">Always</option><option value=\"until_kill\">Until Kill</option></select></div>' +
      '</div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Effects</label><select id=\"tpd-simple-dmg-fx\"><option value=\"hurt\">Hurt</option><option value=\"freeze\">Freeze</option></select></div>' +
        '<div class=\"tpd-field\"><label>Death message</label><select id=\"tpd-simple-dmg-death\"><option value=\"default\">Default</option><option value=\"fall_variants\">Fall Variants</option></select></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Exhaustion</label><input id=\"tpd-simple-dmg-exh\" type=\"number\" step=\"0.01\" value=\"' + (dt.exhaustion || 0.1) + '\"></div>';
    bindSimpleInput('tpd-simple-dmg-id', data, function () { return buildDamageType(); });
    bindSimpleInput('tpd-simple-dmg-scale', data, function () { return buildDamageType(); });
    bindSimpleInput('tpd-simple-dmg-fx', data, function () { return buildDamageType(); });
    bindSimpleInput('tpd-simple-dmg-death', data, function () { return buildDamageType(); });
    bindSimpleInput('tpd-simple-dmg-exh', data, function () { return buildDamageType(); });
  }

  function buildDamageType() {
    var id = $('tpd-simple-dmg-id') ? $('tpd-simple-dmg-id').value : 'my_damage';
    var scale = $('tpd-simple-dmg-scale') ? $('tpd-simple-dmg-scale').value : 'never';
    var fx = $('tpd-simple-dmg-fx') ? $('tpd-simple-dmg-fx').value : 'hurt';
    var death = $('tpd-simple-dmg-death') ? $('tpd-simple-dmg-death').value : 'default';
    var exh = $('tpd-simple-dmg-exh') ? parseFloat($('tpd-simple-dmg-exh').value) || 0.1 : 0.1;
    return JSON.stringify({ damage_type: { exhaustion: exh, message_id: id, scaling: scale, effects: fx, death_message_type: death } }, null, 2);
  }

  function renderSimplePaintingVariant(body, content) {
    var data = tryParseJson(content) || {};
    var pv = data.painting_variant || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Asset ID</label><input id=\"tpd-simple-paint-asset\" value=\"' + escHtml(pv.asset_id || 'minecraft:backyard') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Width</label><input id=\"tpd-simple-paint-w\" type=\"number\" value=\"' + (pv.width || 2) + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Height</label><input id=\"tpd-simple-paint-h\" type=\"number\" value=\"' + (pv.height || 1) + '\"></div>';
    bindSimpleInput('tpd-simple-paint-asset', data, function () { return buildPaintingVariant(); });
    bindSimpleInput('tpd-simple-paint-w', data, function () { return buildPaintingVariant(); });
    bindSimpleInput('tpd-simple-paint-h', data, function () { return buildPaintingVariant(); });
  }

  function buildPaintingVariant() {
    var asset = $('tpd-simple-paint-asset') ? $('tpd-simple-paint-asset').value : 'minecraft:backyard';
    var w = $('tpd-simple-paint-w') ? parseInt($('tpd-simple-paint-w').value, 10) || 2 : 2;
    var h = $('tpd-simple-paint-h') ? parseInt($('tpd-simple-paint-h').value, 10) || 1 : 1;
    return JSON.stringify({ painting_variant: { asset_id: asset, width: w, height: h } }, null, 2);
  }

  function renderSimpleWolfVariant(body, content) {
    var data = tryParseJson(content) || {};
    var wv = data.wolf_variant || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Asset name</label><input id=\"tpd-simple-wolf-asset\" value=\"' + escHtml(wv.asset_name || 'pale') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Tame texture</label><input id=\"tpd-simple-wolf-tame\" value=\"' + escHtml(wv.tame_texture || 'minecraft:entity/wolf/tame/pale') + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Wild texture</label><input id=\"tpd-simple-wolf-wild\" value=\"' + escHtml(wv.wild_texture || 'minecraft:entity/wolf/wild/pale') + '\"></div>';
    bindSimpleInput('tpd-simple-wolf-asset', data, function () { return buildWolfVariant(); });
    bindSimpleInput('tpd-simple-wolf-tame', data, function () { return buildWolfVariant(); });
    bindSimpleInput('tpd-simple-wolf-wild', data, function () { return buildWolfVariant(); });
  }

  function buildWolfVariant() {
    var asset = $('tpd-simple-wolf-asset') ? $('tpd-simple-wolf-asset').value : 'pale';
    var tame = $('tpd-simple-wolf-tame') ? $('tpd-simple-wolf-tame').value : 'minecraft:entity/wolf/tame/pale';
    var wild = $('tpd-simple-wolf-wild') ? $('tpd-simple-wolf-wild').value : 'minecraft:entity/wolf/wild/pale';
    return JSON.stringify({ wolf_variant: { asset_name: asset, tame_texture: tame, wild_texture: wild } }, null, 2);
  }

  function renderSimpleInstrument(body, content) {
    var data = tryParseJson(content) || {};
    var ins = data.instrument || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Sound event</label><input id=\"tpd-simple-ins-sound\" value=\"' + escHtml(ins.sound_event || 'minecraft:block.note_block.pling') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Duration</label><input id=\"tpd-simple-ins-dur\" type=\"number\" step=\"0.1\" value=\"' + (ins.use_duration || 0.5) + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Range</label><input id=\"tpd-simple-ins-range\" type=\"number\" step=\"0.5\" value=\"' + (ins.range || 16) + '\"></div>';
    bindSimpleInput('tpd-simple-ins-sound', data, function () { return buildInstrument(); });
    bindSimpleInput('tpd-simple-ins-dur', data, function () { return buildInstrument(); });
    bindSimpleInput('tpd-simple-ins-range', data, function () { return buildInstrument(); });
  }

  function buildInstrument() {
    var sound = $('tpd-simple-ins-sound') ? $('tpd-simple-ins-sound').value : 'minecraft:block.note_block.pling';
    var dur = $('tpd-simple-ins-dur') ? parseFloat($('tpd-simple-ins-dur').value) || 0.5 : 0.5;
    var range = $('tpd-simple-ins-range') ? parseFloat($('tpd-simple-ins-range').value) || 16 : 16;
    return JSON.stringify({ instrument: { sound_event: sound, use_duration: dur, range: range } }, null, 2);
  }

  function bindSimpleInput(id, data, cb) {
    var el = $('tpd-simple-' + id.replace('tpd-simple-', ''));
    if (!el) return;
    el.addEventListener('input', function () {
      if (selectedPath && project.files.has(selectedPath)) {
        var generated = cb ? cb() : el.value;
        project.files.get(selectedPath).content = generated;
        editor.value = generated;
        validateCurrent();
        renderPreview();
      }
    });
  }

  function escHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function tryParseJson(str) {
    try { return JSON.parse(str); } catch (e) { return {}; }
  }


  function setOrMergeFunctionTag(kind, functionId) {
    var path = 'data/minecraft/tags/' + (isModernLayout() ? 'function' : 'functions') + '/' + kind + '.json';
    var data = { values: [] };
    if (project.files.has(path)) {
      try { data = JSON.parse(project.files.get(path).content || '{}'); } catch (e) {}
      if (!Array.isArray(data.values)) data.values = [];
    }
    if (!data.values.includes(functionId)) data.values.push(functionId);
    project.files.set(path, { name: kind + '.json', type: 'tags', content: JSON.stringify(data, null, 2) + '\n' });
  }

  function addLifecycle(kind) {
    var ns = sanitizeNamespace($('tpd-namespace').value || 'mypack');
    var path = 'data/' + ns + '/' + folderForType('functions') + '/' + kind + '.mcfunction';
    if (!project.files.has(path)) project.files.set(path, { name: kind + '.mcfunction', type: 'functions', content: '# Runs on datapack ' + kind + '\n' + (kind === 'load' ? 'tellraw @a {"text":"' + ns + ' loaded","color":"green"}\n' : '# Add commands carefully: this runs 20 times per second.\n') });
    setOrMergeFunctionTag(kind, ns + ':' + kind);
    buildTree(); renderFileList(); renderPreview(); renderMeta(); selectFile(path);
    showMsg('Added ' + kind + ' function and minecraft:' + kind + ' tag.', true);
  }

  function renameSelected() {
    if (!selectedPath || !project.files.has(selectedPath)) return showMsg('Select a file first.', false);
    var next = prompt('New datapack path:', selectedPath);
    if (next == null || next === selectedPath) return;
    try {
      next = MinecraftPack.safePath(next.toLowerCase());
      if (project.files.has(next)) throw new Error('A file already uses that path.');
      var entry = project.files.get(selectedPath);
      project.files.delete(selectedPath);
      entry.name = fileNameFromPath(next);
      entry.type = guessType(next);
      project.files.set(next, entry);
      selectedPath = next;
      buildTree(); renderFileList(); renderPreview(); renderMeta(); selectFile(next);
      showMsg('File renamed.', true);
    } catch (e) { showMsg(e.message, false); }
  }

  function duplicateSelected() {
    if (!selectedPath || !project.files.has(selectedPath)) return showMsg('Select a file first.', false);
    syncSelectedContent();
    var entry = project.files.get(selectedPath);
    var dot = selectedPath.lastIndexOf('.');
    var base = dot > selectedPath.lastIndexOf('/') ? selectedPath.slice(0, dot) : selectedPath;
    var ext = dot > selectedPath.lastIndexOf('/') ? selectedPath.slice(dot) : '';
    var i = 1, path = base + '_copy' + ext;
    while (project.files.has(path)) path = base + '_copy_' + (++i) + ext;
    var copy = { name: fileNameFromPath(path), type: entry.type, content: entry.content || '' };
    if (entry.blob) copy.blob = entry.blob.slice(0);
    project.files.set(path, copy);
    buildTree(); renderFileList(); renderPreview(); renderMeta(); selectFile(path);
    showMsg('Duplicated file.', true);
  }

  async function importDatapackZip(file) {
    if (!file) return;
    try {
      var entries = await MinecraftPack.readZip(file);
      var metaEntry = entries.find(function (entry) { return entry.name === 'pack.mcmeta'; });
      if (metaEntry) {
        var meta = JSON.parse(MinecraftPack.bytesText(metaEntry.data));
        if (meta.pack) {
          $('tpd-desc').value = typeof meta.pack.description === 'string' ? meta.pack.description : JSON.stringify(meta.pack.description || '');
          var fmt = meta.pack.max_format || meta.pack.min_format || meta.pack.pack_format;
          if (Array.isArray(fmt)) fmt = fmt[0] + '.' + (fmt[1] || 0);
          var option = Array.from($('tpd-format').options).find(function (o) { return parseFloat(o.value) === parseFloat(fmt); });
          if (option) $('tpd-format').value = option.value;
        }
      }
      project.files = new Map();
      entries.forEach(function (entry) {
        if (entry.name === 'pack.mcmeta' || entry.name === 'pack.png') return;
        var path = entry.name;
        var type = guessType(path);
        if (isLikelyBinary(path)) project.files.set(path, { name: fileNameFromPath(path), type: type, content: '', blob: entry.data.buffer.slice(entry.data.byteOffset, entry.data.byteOffset + entry.data.byteLength) });
        else project.files.set(path, { name: fileNameFromPath(path), type: type, content: MinecraftPack.bytesText(entry.data) });
      });
      project.format = $('tpd-format').value;
      project.description = $('tpd-desc').value;
      var firstData = Array.from(project.files.keys()).find(function (path) { return /^data\/[^/]+\//.test(path) && !path.startsWith('data/minecraft/'); });
      if (firstData) { project.namespace = firstData.split('/')[1]; $('tpd-namespace').value = project.namespace; }
      selectedPath = null; editor.value = '';
      buildTree(); renderFileList(); renderPreview(); renderMeta();
      if (project.files.size) selectFile(Array.from(project.files.keys())[0]);
      showMsg('Imported ' + project.files.size + ' datapack files.', true);
    } catch (e) { showMsg('Datapack import failed: ' + e.message, false); }
  }

  function exportValidationReport() {
    syncSelectedContent();
    var report = { generatedAt: new Date().toISOString(), pack: buildMeta(), namespace: project.namespace, fileCount: project.files.size, diagnostics: validatePack() };
    MinecraftPack.downloadBlob(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }), sanitizeName($('tpd-name').value) + '-validation.json');
  }

  /* ---------- Wire up UI ---------- */
  function activateTab(name) {
    document.querySelectorAll('.tpd .tab').forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.tpd .panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'tab-' + name);
    });
    if (name === 'preview') renderPreview();
    if (name === 'files') renderFileList();
    if (name === 'export') renderMeta();
  }

  function bindUI() {
    var tabsEl = document.querySelector('.tpd .tabs');
    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('.tab') : null;
        if (t && t.dataset && t.dataset.tab) activateTab(t.dataset.tab);
      });
    }
    document.querySelectorAll('.tpd .tab').forEach(function (tab) {
      tab.addEventListener('click', function () { activateTab(tab.dataset.tab); });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateTab(tab.dataset.tab); }
      });
    });

    $('tpd-new-file').addEventListener('click', function (e) {
      e.stopPropagation();
      showNewFileMenu();
    });

    $('tpd-load-template').addEventListener('click', function (e) {
      e.stopPropagation();
      showTemplateMenu();
    });

    $('tpd-add-load').addEventListener('click', function () { addLifecycle('load'); });
    $('tpd-add-tick').addEventListener('click', function () { addLifecycle('tick'); });
    $('tpd-rename-file').addEventListener('click', renameSelected);
    $('tpd-duplicate-file').addEventListener('click', duplicateSelected);

    $('tpd-new-blank').addEventListener('click', function () {
      var ns = sanitizeNamespace($('tpd-namespace').value || 'mypack');
      showNewFileMenu();
    });

    var templateFilesBtn = $('tpd-load-template-files');
    if (templateFilesBtn) {
      templateFilesBtn.addEventListener('click', function () {
        showTemplateMenu();
      });
    }

    $('tpd-delete-file').addEventListener('click', function () {
      if (!selectedPath) { showMsg('No file selected.', false); return; }
      project.files.delete(selectedPath);
      selectedPath = null;
      editor.value = '';
      updateEditorHeader(); validateCurrent();
      refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
      showMsg('Deleted file.', true);
    });

    $('tpd-mode-toggle').addEventListener('click', function () {
      toggleSimpleMode();
    });

    $('tpd-validate').addEventListener('click', function () {
      validateCurrent();
      var validity = $('tpd-validity');
      if (validity && validity.classList.contains('err')) {
        showMsg(validity.textContent, false);
      } else {
        showMsg('File looks valid.', true);
      }
    });

    $('tpd-pretty').addEventListener('click', function () {
      if (!selectedPath || !project.files.has(selectedPath)) { showMsg('Select a JSON file first.', false); return; }
      try {
        var parsed = JSON.parse(editor.value);
        editor.value = JSON.stringify(parsed, null, 2);
        project.files.get(selectedPath).content = editor.value;
        validateCurrent();
        renderPreview();
        showMsg('Pretty-printed.', true);
      } catch (e) {
        showMsg('Cannot pretty-print invalid JSON.', false);
      }
    });

    editor.addEventListener('input', function () {
      if (saveDebounce) clearTimeout(saveDebounce);
      saveDebounce = setTimeout(function () {
        if (selectedPath && project.files.has(selectedPath)) {
          var entry = project.files.get(selectedPath);
          if (!entry.blob) {
            entry.content = editor.value;
            renderPreview();
          }
        }
      }, 300);
      validateCurrent();
      autoResizeEditor();
    });

    // Metadata inputs
    $('tpd-name').addEventListener('input', function () { project.name = this.value; renderMeta(); });
    $('tpd-format').addEventListener('change', function () { project.format = this.value || '107.1'; renderMeta(); });
    $('tpd-desc').addEventListener('input', function () { project.description = this.value; renderMeta(); });
    $('tpd-namespace').addEventListener('input', function () { project.namespace = sanitizeNamespace(this.value || 'mypack'); renderMeta(); });

    // Tree search
    $('tpd-tree-search').addEventListener('input', function () {
      var q = this.value.toLowerCase();
      document.querySelectorAll('.tpd-node').forEach(function (n) {
        var show = !q || n.dataset.path.toLowerCase().indexOf(q) !== -1 || (n.textContent || '').toLowerCase().indexOf(q) !== -1;
        n.style.display = show ? '' : 'none';
      });
      document.querySelectorAll('.tpd-group').forEach(function (group) {
        var cat = group.querySelector('.tpd-cat');
        var nodes = group.querySelectorAll('.tpd-node');
        var visible = false;
        nodes.forEach(function (n) { if (n.style.display !== 'none') visible = true; });
        if (cat) cat.style.display = visible ? '' : 'none';
      });
    });

    // Export
    $('tpd-export-zip').addEventListener('click', exportZip);
    $('tpd-export-meta').addEventListener('click', exportMetaOnly);
    $('tpd-export-report').addEventListener('click', exportValidationReport);

    // Save / load / import / delete
    $('tpd-save').addEventListener('click', saveProject);
    $('tpd-load').addEventListener('click', loadSavedProject);
    $('tpd-export-project').addEventListener('click', exportProjectFile);
    $('tpd-import').addEventListener('click', function () { $('tpd-import-file').click(); });
    $('tpd-import-file').addEventListener('change', function () {
      if (this.files && this.files[0]) importProjectFile(this.files[0]);
      this.value = '';
    });
    $('tpd-clear-project').addEventListener('click', function () {
      if (window.confirm('Delete the saved project from this browser?')) deleteSavedProject();
    });

    $('tpd-import-pack').addEventListener('click', function () { $('tpd-pack-file').click(); });
    $('tpd-pack-file').addEventListener('change', function () { importDatapackZip(this.files[0]); this.value = ''; });
    $('tpd-import-folder').addEventListener('click', function () { $('tpd-folder').click(); });
    $('tpd-folder').addEventListener('change', function () { handleFiles(this.files); this.value = ''; });

    // Upload
    $('tpd-upload-btn').addEventListener('click', function () { $('tpd-upload').click(); });
    $('tpd-upload').addEventListener('change', function () { handleFiles(this.files); this.value = ''; });
    var addFileBtn = $('tpd-add-file');
    if (addFileBtn) {
      addFileBtn.addEventListener('click', function () { $('tpd-add-file-input').click(); });
    }
    var addFileInput = $('tpd-add-file-input');
    if (addFileInput) {
      addFileInput.addEventListener('change', function () { handleFiles(this.files); this.value = ''; });
    }
    var dz = $('tpd-drop');
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('drag'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); saveProject(); }
    });
  }

  /* ---------- Init ---------- */
  function init() {
    if (inited) return;
    inited = true;
    if (!editor || typeof TpcZip === 'undefined' || typeof MinecraftPack === 'undefined') {
      console.error('TPD init failed: missing editor, TpcZip, or MinecraftPack.');
      return;
    }
    project.name = $('tpd-name').value;
    project.format = $('tpd-format').value || '107.1';
    project.description = $('tpd-desc').value;
    project.namespace = sanitizeNamespace($('tpd-namespace').value || 'mypack');
    bindUI();
    buildTree();
    renderFileList();
    renderPreview();
    renderMeta();
    try { checkSavedExists(); } catch (e) {}
    autoResizeEditor();
    // Auto-select first file if any
    try {
      var first = project.files.size > 0 ? Array.from(project.files.keys())[0] : null;
      if (first) selectFile(first);
    } catch (e) {}
  }

  window.ToolsvaultDatapack = { getState: function () { return project; }, buildMeta: buildMeta, validate: validatePack, modernizePath: modernizePath, applyProject: applyProject, loadTemplate: loadPackTemplate, templateKeys: TEMPLATE_LIST.map(function (item) { return item.key; }) };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
