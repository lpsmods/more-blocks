"""
Auto generate block tags
"""

import commentjson
import glob

PROJECT_ID = "lpsm_mb"
PATH_ID =  PROJECT_ID.replace("_", '/')
BP = "behavior_packs/more_blocks"
BLOCKS_PATH = f"{BP}/blocks/{PATH_ID}"

WOOD_TYPES = ['spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry', 'pale_oak', 'oak', 'bamboo']

def anyOf(*names: str) -> bool:
    return any([x for x in names if x in id])

no_item_destructible = []

for fn in glob.glob(f'{BLOCKS_PATH}/**/*.json'):
    print(fn)

    with open(fn, 'r') as fd:
        block = commentjson.load(fd)

    id = block['minecraft:block']['description']['identifier']
    name = id.replace(f"{PROJECT_ID}:", "")
    material = name.replace("_vertical_slab", "").replace("_slab", "").replace("_stairs", "").replace("_layer", "")
    components = block['minecraft:block']['components']

    # Remove tags
    for k in {**components}.keys():
        if k.startswith("tag:"):
            del components[k]

    # Add tags

    if "wool" in id:
        components["tag:minecraft:is_shears_item_destructible"] = {}

    if id.endswith("_stairs"):
        components["tag:minecraft:cornerable_stairs"] = {}
        
    if id.endswith("_slab") and "vertical_slab" not in id:
        components["tag:minecraft:slab"] = {}
        
    if id.endswith("_vertical_slab"):
        components["tag:lpsm_mb:vertical_slab"] = {}
        
    if id.endswith("layer"):
        components["tag:lpsm_mb:layer"] = {}

    if anyOf('dirt', 'farmland', 'grass_block', 'moss_block', 'mycelium', 'podzol'):
        components["tag:dirt"] = {}
        components["tag:minecraft:is_shovel_item_destructible"] = {}
        
    if anyOf('dirt', 'grass_block', 'path'):
        components["tag:grass"] = {}
        
    if "gravel" in id:
        components["tag:gravel"] = {}
        components["tag:minecraft:is_shovel_item_destructible"] = {}
        
    if "_log_" in id:
        components["tag:log"] = {}

    if anyOf('copper', 'iron', 'gold'):
        components["tag:metal"] = {}

    if "bedrock" in id:
        components["tag:not_feature_replaceable"] = {}
        
    if "pumpkin" in id:
        components["tag:pumpkin"] = {}
        components["tag:minecraft:is_axe_item_destructible"] = {}
        
    if "sandstone" not in id and anyOf('red_sand', 'sand'):
        components["tag:sand"] = {}
        components["tag:minecraft:is_shovel_item_destructible"] = {}

    # Tiers

    if anyOf('diamond', 'emerald', 'gold', 'redstone_ore'):
        components["tag:minecraft:iron_tier_destructible"] = {}

    if anyOf('ancient_debris', 'obsidian', 'netherite_block'):
        components["tag:minecraft:diamond_tier_destructible"] = {}

    # Tool destructible

    if anyOf('dried_kelp', 'hay_block', "tnt", 'moss', 'azalea', 'moss_block', 'nether_wart', 'warped_wart', 'sculk', 'sponge', 'shroomlight', 'target'):
        components["tag:minecraft:is_hoe_item_destructible"] = {}
        
    if anyOf('concrete_powder', 'clay_', 'mud', 'soul_soil', 'snow') and "sandstone" not in id and 'packed_mud' not in id:
        components["tag:minecraft:is_shovel_item_destructible"] = {}
        
    pickaxe = ['concrete', 'ancient_debris', 'netherite_block', 'netherrack', 'resin_block', 'sea_lantern', 'iron_block', 'lapis_block', 'magma', 'coal_block', 'gold_block' ,'diamond_block', 'emerald_block', 'amethyst', 'glass', 'bone', 'terracotta', 'copper', 'ice', 'packed_mud', 'andesite', 'granite', 'diorite', 'calcite', 'basalt', 'blackstone', 'cinnabar', 'deepslate', 'sulfur', 'tuff', 'prismarine', 'purpur', 'quartz', 'sandstone', 'redstone_block', 'coral', 'nylium', '_ore_', 'raw_', "stone_", 'brick', 'obsidian']
    if anyOf(*pickaxe) and "concrete_powder" not in id:
        components["tag:minecraft:is_pickaxe_item_destructible"] = {}
        
    if anyOf('bookshelf', 'warped', 'crimson', 'hyphae', 'stem', 'mushroom', 'melon'):
        components["tag:minecraft:is_axe_item_destructible"] = {}

    # wood

    if anyOf(*WOOD_TYPES):
        if 'leaves' in id:
            components["tag:is_hoe_item_destructible"] = {}
            components["minecraft:flammable"] = {}
        else:
            components["minecraft:flammable"] = {}
            components["tag:wood"] = {}
            components["tag:is_axe_item_destructible"] = {}

    # Log tags

    for wood in WOOD_TYPES:
        if f"{wood}_log" in id:
            components[f"tag:{wood}"] = {}

    # Essentials

    if '_ore' in id:
        group = material.replace('_ore', "")
        components[f"tag:ulkd_ess:ore_{group}"] = {}

    if '_leaves' in id:
        group = material.replace('_leaves', "")
        components[f"tag:ulkd_ess:tree_leaves_{group}"] = {}

    if '_log' in id:
        group = material.replace('_log', "")
        components[f"tag:ulkd_ess:tree_log_{group}"] = {}

    # Validate that it has a item_destructible tag
    ignore = ['bedrock', 'honeycomb', 'honey', 'slime', 'froglight']
    if not any([x for x in components.keys() if 'item_destructible' in x]) and not anyOf(*ignore):
        no_item_destructible.append(fn)

    content = commentjson.dumps(block, indent=2)
    with open(fn, 'w') as fd:
        fd.write(content)
        

if len(no_item_destructible):
    print("\nNo item destructible:")
    for x in no_item_destructible:
        print(f"- {x}")
