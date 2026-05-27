"""
Generates common files like loot tables, and recipes.
"""

from mcaddon import Ingredient, ShapelessRecipe, ShapedRecipe, ItemStack, BaseDescription
import glob
import json
import os

BP = "behavior_packs/more_blocks"
RP = "resource_packs/more_blocks"
PROJECT_ID = "lpsm_mb"
PATH_ID =  PROJECT_ID.replace("_", '/')
BLOCKS_PATH = f"{BP}/blocks/{PATH_ID}"
RECIPES_PATH = f"{BP}/recipes/{PATH_ID}/gen"
LOOT_TABLES_PATH = f"{BP}/loot_tables/{PATH_ID}"

def mk(pathname:str):
    os.makedirs(os.path.dirname(pathname), exist_ok=True)
    return pathname

def to_item(id:str):
    """
    Convert custom id to a Minecraft ingredient item.
    """
    id = str(id)
    var1 = id.replace('_layer', '').replace('_vertical_slab','').replace('_slab', '').replace('_stairs','').replace('brick', 'bricks').replace('tile', 'tiles').replace('tiless', 'tiles')
    match var1:
        case 'acacia'|'pale_oak'|'oak'|'dark_oak'|'warped'|'crimson'|'spruce'|'birch'|'mangrove'|'cherry'|'jungle':
            return var1+'_planks'
        case 'rooted_dirt':
            return 'dirt_with_roots'
        case 'pale_moss':
            return 'pale_moss_block'
        case 'moss':
            return 'moss_block'
        case 'magma_block':
            return 'magma'
        case 'copper':
            return 'copper_block'
        case 'terracotta':
            return 'hardened_clay'
        case 'slime_block': return 'slime'
        case 'nether_bricks_block': return 'nether_brick'
        case 'nether_bricks': return 'nether_brick'
        case 'clay_block': return 'clay'
        case 'bricks_block': return 'brick_block'
        case 'bricks': return 'brick_block'
        case 'smooth_quartz_block': return 'smooth_quartz'
        case 'red_nether_bricks': return 'red_nether_brick'
        case 'nether_quartz_ore': return 'quartz_ore'
        case 'end_stone_bricks': return 'end_bricks'
        case 'dirt_path': return 'grass_path'
        case 'light_gray_glazed_terracotta': return 'silver_glazed_terracotta'
        case 'flowering_azalea_leaves': return 'azalea_leaves_flowered'
        case 'powder_snow': return 'powder_snow_bucket'
        case 'muddy_mangrove_root': return 'muddy_mangrove_roots'
        case 'mangrove_root': return 'mangrove_roots'
    return var1

def fix_data(data):
    """
    Remove "count" from ingredients. Will be fixed in the next mcaddon release.
    """
    if 'minecraft:recipe_shapeless' in data:
        if 'ingredients' in data['minecraft:recipe_shapeless']:
            for ing in data['minecraft:recipe_shapeless']['ingredients']:
                if 'count' in ing:
                    del ing['count']

                # Add data=0 to sandstone and red_sandstone
                if ing['item'] == 'minecraft:sandstone' or ing['item'] == 'minecraft:red_sandstone':
                    ing['data'] = 0
    if 'minecraft:recipe_shaped' in data:
        if 'key' in data['minecraft:recipe_shaped']:
            for ing in data['minecraft:recipe_shaped']['key'].values():
                if ing['item'] == 'minecraft:sandstone' or ing['item'] == 'minecraft:red_sandstone':
                    ing['data'] = 0

def save(data:dict, fp:str):
    """
    Save JSON data
    """
    fix_data(data)
    with open(mk(fp), 'w') as fd:
        fd.write(json.dumps(data, indent=4))

# LAYERS
for fn in glob.glob(f'{BLOCKS_PATH}/layer/*.json'):
    print(fn)
    with open(fn) as fd:
        layer = json.load(fd)['minecraft:block']
    ID = layer['description']['identifier']
    PATH = ID.split(":")[1]
    NAMESPACE = ID.split(":")[0]

    # Layer Loot Tables
    for x in range(1,9):
        loot = {
            'pools': [
                {
                    'rolls': 1,
                    "entries": [
                        {
                            'type': "item",
                            'name': ID,
                            'functions': [
                                {
                                    'function': "set_count",
                                    'count': x
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        save(loot, os.path.join(LOOT_TABLES_PATH, 'blocks', PATH+str(x)+'.json'))

    # Layer Recipes
    ing = ItemStack(item=to_item(PATH))
    recipe = ShapelessRecipe(description=BaseDescription(identifier= ID+"_stonecutting"), result=ItemStack(item=ID, count=8))
    recipe.ingredients.append(Ingredient(item=ing.item))
    recipe.tags = ["stonecutter"] # type: ignore
    data = recipe.model_dump()
    data['minecraft:recipe_shapeless']['unlock'] = [{'item':ing.model_dump()['item']}]

    fp = os.path.join(RECIPES_PATH, 'layer', f'{ PATH }_stonecutting.json')
    save(data, fp)
    
# SLAB
for fn in glob.glob(f'{BLOCKS_PATH}/slab/*.json'):
    print(fn)
    with open(fn) as fd:
        slab = json.load(fd)['minecraft:block']
    ID = slab['description']['identifier']
    PATH = ID.split(":")[1]
    NAMESPACE = ID.split(":")[0]
    
    # Slab Loot Tables
    loot = {
        'pools': [
            {
                'rolls': 1,
                'entries': [
                    {
                        'type': 'item',
                        'name': ID,
                        'functions': [
                            {
                                'function': "set_count",
                                'count': 2
                            }
                        ]
                    }
                ]
            }
        ]
    }
    fp = os.path.join(LOOT_TABLES_PATH, 'blocks', PATH.replace('_slab', '_double_slab')+'.json')
    save(loot, fp)

    # Slab Recipes
    ing = ItemStack(item=to_item(PATH))
    recipe = ShapelessRecipe(description=BaseDescription(identifier=ID+"_stonecutting"), result=ItemStack(item=ID, count=2))
    recipe.tags = ["stonecutter"] # type: ignore
    recipe.ingredients.append(Ingredient(item=ing.item))
    data = recipe.model_dump()
    data['minecraft:recipe_shapeless']['unlock'] = [{'item':ing.model_dump()['item']}]

    fp = os.path.join(RECIPES_PATH, 'slab', f'{ PATH }_stonecutting.json')
    save(data, fp)

    recipe = ShapedRecipe(description=BaseDescription(identifier=ID), result=ItemStack(item=ID, count=2), pattern=['###'])
    recipe.key["#"] = ing # type: ignore
    data = recipe.model_dump()
    data['minecraft:recipe_shaped']['unlock'] = [{'item':ing.model_dump()['item']}]
    fp = os.path.join(RECIPES_PATH, 'slab', f'{ PATH }.json')
    save(data, fp)

# STAIRS
for fn in glob.glob(f'{BLOCKS_PATH}/stairs/*.json'):
    print(fn)
    with open(fn) as fd:
        stairs = json.load(fd)['minecraft:block']
    ID = stairs['description']['identifier']
    PATH = ID.split(":")[1]
    NAMESPACE = ID.split(":")[0]
    
    # Stairs Recipes
    ing = ItemStack(item=to_item(PATH))
    recipe = ShapelessRecipe(description=BaseDescription(identifier=ID+"_stonecutting"), result=ItemStack(item=ID))
    recipe.tags = ['stonecutter'] # type: ignore
    recipe.ingredients.append(Ingredient(item=ing.item))
    data = recipe.model_dump()
    data['minecraft:recipe_shapeless']['unlock'] = [{'item':ing.model_dump()['item']}]

    fp = os.path.join(RECIPES_PATH, 'stairs', f'{ PATH }_stonecutting.json')
    save(data, fp)

    recipe = ShapedRecipe(description=BaseDescription(identifier=ID), result=ItemStack(item=ID, count=4), pattern=['#','##','###'])
    recipe.key["#"] = ing # type: ignore
    data = recipe.model_dump()
    data['minecraft:recipe_shaped']['unlock'] = [{'item':ing.model_dump()['item']}]
    fp = os.path.join(RECIPES_PATH, 'stairs', f'{ PATH }.json')
    save(data, fp)

# VERTICAL SLAB
for fn in glob.glob(f'{BLOCKS_PATH}/vertical_slab/*.json'):
    print(fn)
    with open(fn) as fd:
        vertical_slab = json.load(fd)['minecraft:block']
    ID = vertical_slab['description']['identifier']
    PATH = ID.split(":")[1]
    NAMESPACE = ID.split(":")[0]

    # Vertical Slab Loot Tables
    loot = {
        'pools': [
            {
                'rolls': 1,
                'entries': [
                    {
                        'type': "item",
                        'name': ID,
                        'functions': [
                            {
                                'function': 'set_count',
                                'count': 2
                            }
                        ]
                    }
                ]
            }
        ]
    }
    fp = os.path.join(LOOT_TABLES_PATH, 'blocks', PATH.replace('_vertical_slab', '_double_vertical_slab')+'.json')
    save(loot, fp)
    
    # Vertical Slab Recipes
    ing = ItemStack(item=to_item(PATH))
    recipe = ShapelessRecipe(description=BaseDescription(identifier=ID+"_stonecutting"), result=ItemStack(item=ID, count=2))
    recipe.tags = ["stonecutter"] # type: ignore
    recipe.ingredients.append(Ingredient(item=ing.item))
    data = recipe.model_dump()
    data['minecraft:recipe_shapeless']['unlock'] = [{'item':ing.model_dump()['item']}]

    fp = os.path.join(RECIPES_PATH, 'vertical_slab', f'{ PATH }_stonecutting.json')
    save(data, fp)

    ing = ItemStack(item=to_item(PATH))
    recipe = ShapedRecipe(description=BaseDescription(identifier=ID), result=ItemStack(item=ID, count=6), pattern=['#','#','#'])
    recipe.key["#"] = ing # type: ignore
    data = recipe.model_dump()
    data['minecraft:recipe_shaped']['unlock'] = [{'item':ing.model_dump()['item']}]
    fp = os.path.join(RECIPES_PATH, 'vertical_slab', f'{ PATH }.json')
    save(data, fp)
