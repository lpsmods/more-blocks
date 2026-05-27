"""
Auto generate falling block entity variants.
"""

import commentjson
import glob

PROJECT_ID = "lpsm_mb"
PATH_ID =  PROJECT_ID.replace("_", '/')
BP = "behavior_packs/more_blocks"
RP = "resource_packs/more_blocks"
BLOCKS_PATH = f"{BP}/blocks/{PATH_ID}"

def tex_id_to_path(id: str) -> str:
    name = id.replace("minecraft:", '')
    if '_concrete_powder' in name:
        name = 'concrete_powder_'+name.replace("_concrete_powder", '')

    if 'light_gray' in name:
        name = name.replace("light_gray", 'silver')
    return f'textures/blocks/{name}'

def find_geo(id: str) -> str:
    if 'vertical_slab' in id:
        return 'Geometry.lpsm_assetsplus.vertical_slab'
    if 'slab' in id:
        return 'Geometry.lpsm_assetsplus.slab.top'
    if 'layer' in id:
        return 'Geometry.lpsm_assetsplus.layer_1'
    if 'stairs' in id:
        return 'Geometry.lpsm_assetsplus.stairs.straight'
    return 'Geometry.lpsm_assetsplus.full_block'

falling = []

print("Finding falling blocks...")
for fn in glob.glob(f'{BLOCKS_PATH}/**/*.json'):
    with open(fn, 'r') as fd:
        block = commentjson.load(fd)['minecraft:block']

    id = block['description']['identifier']
    components = block['components']

    type_id = f"{PROJECT_ID}:falling_block"
    if type_id in components:
        # Add to falling block registry
        falling.append(block)

entity_component_groups = {}
entity_events = {}

client_entity_geo = {'default': 'geometry.lpsm_assetsplus.full_block'}
client_entity_tex = {'default': 'textures/lpsm/mb/blocks/falling_block'}

render_controller_geo = ['Geometry.default']
render_controller_tex = ['Texture.default']

for index, block in enumerate(falling, 1):
    id = block['description']['identifier']
    print(index, id)
    name = id.replace(PROJECT_ID+":", '')
    entity_component_groups[id] = {'minecraft:variant': {'value': index}}
    entity_events[id] = {'add': {'component_groups': [id]}}

    client_entity_geo[name] = find_geo(id)

    tex = block['components']['minecraft:material_instances']['*']['texture']
    client_entity_tex[name] = tex_id_to_path(tex)
    
    render_controller_geo.append(f'Geometry.{name}')
    render_controller_tex.append(f'Texture.{name}')

# Entity

ENTITY = f'{BP}/entities/{PATH_ID}/falling_block.json'
with open(ENTITY, 'r') as fd:
    data = commentjson.load(fd)

    data['minecraft:entity']['component_groups'] = entity_component_groups
    data['minecraft:entity']['events'] = entity_events

content = commentjson.dumps(data, indent=2)
with open(ENTITY, 'w') as fd:
    fd.write(content)

# Client Entity

CLIENT_ENTITY = f'{RP}/entity/{PATH_ID}/falling_block.entity.json'
with open(CLIENT_ENTITY, 'r') as fd:
    data = commentjson.load(fd)
    desc = data['minecraft:client_entity']['description']
    desc['textures'] = client_entity_tex
    desc['geometry'] = client_entity_geo


content = commentjson.dumps(data, indent=2)
with open(CLIENT_ENTITY, 'w') as fd:
    fd.write(content)

# Render Controller

RENDER_CONTROLLER = f'{RP}/render_controllers/{PATH_ID}/falling_block.rc.json'
with open(RENDER_CONTROLLER, 'r') as fd:
    data = commentjson.load(fd)
    arrays = data['render_controllers']['controller.render.lpsm_mb.falling_block']['arrays']
    arrays['textures']['array.tex'] = render_controller_tex
    arrays['geometries']['array.geo'] = render_controller_geo

content = commentjson.dumps(data, indent=2)
with open(RENDER_CONTROLLER, 'w') as fd:
    fd.write(content)
