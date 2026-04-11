"""
Render text templates
"""

import commentjson
import glob
import mclang
import chevron

PROJECT_ID = "lpsm_mb"
PATH_ID =  PROJECT_ID.replace("_", '/')
BP = "behavior_packs/more_blocks"
RP = "resource_packs/more_blocks"
BLOCKS_PATH = f"{BP}/blocks/{PATH_ID}"

layer_blocks = []
slab_blocks = []
stair_blocks = []
vertical_slab_blocks = []

# Find blocks
print("Gathering block IDs")
for fn in glob.glob(f'{BLOCKS_PATH}/**/*.json'):
    with open(fn, 'r') as fd:
        block = commentjson.load(fd)

    id = block['minecraft:block']['description']['identifier']

    if "layer" in id:
        layer_blocks.append(id)
        
    if "vertical_slab" in id:
        vertical_slab_blocks.append(id)

    elif "slab" in id:
        slab_blocks.append(id)

    if "stairs" in id:
        stair_blocks.append(id)

def fmt(items: list[str]) -> str:
    return ", ".join([x.lower().replace(PROJECT_ID+":", '').replace('_layer','').replace('_vertical_slab', '').replace('_slab', '').replace('_stairs', '').replace('_', ' ') for x in items])

print("Rendering templates")
for fn in glob.glob(f'{RP}/texts/*.lang'):
    with mclang.open(fn) as texts:
        data = {
            'layers': fmt(layer_blocks),
            'slabs': fmt(slab_blocks),
            'stairs': fmt(stair_blocks),
            "vertical_slabs": fmt(vertical_slab_blocks),
        }
        for comment in texts.comments:
            if comment.text.startswith("template: "):
                template = comment.text.replace("template: ", "")
                subtexts = mclang.loads(chevron.render(template, data))
                texts.update(subtexts)

        texts.save(fn)
