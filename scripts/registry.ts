import { Block, ItemStack } from "@minecraft/server";
import {
  flattenableBlocks,
  oxidizableBlocks,
  strippableBlocks,
  tillableBlocks,
  waxableBlocks,
} from "@lpsmods/mc-utils";
import { makeId } from "./utils";
import { Vector3Utils } from "@minecraft/math";

const variants = ["stairs", "layer", "slab", "vertical_slab"];
const waxable = ["copper", "exposed_copper", "weathered_copper", "oxidized_copper"];
const woods = ["oak", "spruce", "birch", "jungle", "acacia", "dark_oak", "mangrove", "cherry", "pale_oak"];

for (const v of variants) {
  // Flatten
  flattenableBlocks.register(makeId(`grass_block_${v}`), {
    block: makeId(`dirt_path_${v}`),
  });
  flattenableBlocks.register(makeId(`dirt_${v}`), {
    block: makeId(`dirt_path_${v}`),
  });
  flattenableBlocks.register(makeId(`coarse_dirt_${v}`), {
    block: makeId(`dirt_path_${v}`),
  });
  flattenableBlocks.register(makeId(`rooted_dirt_${v}`), {
    block: makeId(`dirt_path_${v}`),
  });
  flattenableBlocks.register(makeId(`mycelium_${v}`), {
    block: makeId(`dirt_path_${v}`),
  });

  // Shearable

  // Tillable
  tillableBlocks.register(makeId(`dirt_path_${v}`), {
    block: makeId(`farmland_${v}`),
  });
  tillableBlocks.register(makeId(`grass_block_${v}`), {
    block: makeId(`farmland_${v}`),
  });
  tillableBlocks.register(makeId(`dirt_${v}`), {
    block: makeId(`farmland_${v}`),
  });
  tillableBlocks.register(makeId(`coarse_dirt_${v}`), {
    block: makeId(`dirt_${v}`),
  });
  tillableBlocks.register(makeId(`rooted_dirt_${v}`), {
    block: makeId(`dirt_${v}`),
    onConvert(block: Block) {
      block.dimension.spawnItem(new ItemStack("hanging_roots"), Vector3Utils.add(block.location, { x: 0.5, z: 0.5 }));
    },
  });

  // Wood
  for (const w of woods) {
    for (const bark of ["log", "wood"]) {
      strippableBlocks.register(makeId(`${w}_${bark}_${v}`), {
        block: makeId(`stripped_${w}_${bark}_${v}`),
      });
    }
  }

  // Mushroom
  for (const bark of ["stem", "hyphae"]) {
    strippableBlocks.register(makeId(`crimson_${bark}_${v}`), {
      block: makeId(`stripped_crimson_${bark}_${v}`),
    });
    strippableBlocks.register(makeId(`warped_${bark}_${v}`), {
      block: makeId(`stripped_warped_${bark}_${v}`),
    });
  }

  // Oxidizable
  oxidizableBlocks.register(makeId(`exposed_copper_${v}`), {
    block: makeId(`copper_${v}`),
  });
  oxidizableBlocks.register(makeId(`weathered_copper_${v}`), {
    block: makeId(`exposed_copper_${v}`),
  });
  oxidizableBlocks.register(makeId(`oxidized_copper_${v}`), {
    block: makeId(`weathered_copper_${v}`),
  });

  oxidizableBlocks.register(makeId(`exposed_copper_bulb_${v}`), {
    block: makeId(`copper_bulb_${v}`),
  });
  oxidizableBlocks.register(makeId(`weathered_copper_bulb_${v}`), {
    block: makeId(`exposed_copper_bulb_${v}`),
  });
  oxidizableBlocks.register(makeId(`oxidized_copper_bulb_${v}`), {
    block: makeId(`weathered_copper_bulb_${v}`),
  });

  oxidizableBlocks.register(makeId(`exposed_copper_grate_${v}`), {
    block: makeId(`copper_grate_${v}`),
  });
  oxidizableBlocks.register(makeId(`weathered_copper_grate_${v}`), {
    block: makeId(`exposed_copper_grate_${v}`),
  });
  oxidizableBlocks.register(makeId(`oxidized_copper_grate_${v}`), {
    block: makeId(`weathered_copper_grate_${v}`),
  });

  oxidizableBlocks.register(makeId(`exposed_chiseled_copper_${v}`), {
    block: makeId(`chiseled_copper_${v}`),
  });
  oxidizableBlocks.register(makeId(`weathered_chiseled_copper_${v}`), {
    block: makeId(`exposed_chiseled_copper_${v}`),
  });
  oxidizableBlocks.register(makeId(`oxidized_chiseled_copper_${v}`), {
    block: makeId(`weathered_chiseled_copper_${v}`),
  });

  // Waxable
  for (const wax of waxable) {
    waxableBlocks.register(makeId(`${wax}_${v}`), {
      block: makeId(`waxed_${wax}_${v}`),
    });
    waxableBlocks.register(makeId(`${wax}_bulb_${v}`), {
      block: makeId(`waxed_${wax}_bulb_${v}`),
    });
    waxableBlocks.register(makeId(`${wax}_grate_${v}`), {
      block: makeId(`waxed_${wax}_grate_${v}`),
    });
    waxableBlocks.register(makeId(`${wax}_${v}`.replace("copper", "chiseled_copper")), {
      block: makeId(`waxed_${wax}_${v}`.replace("copper", "chiseled_copper")),
    });
  }
}

// Cut copper
for (const v of ["vertical_slab", "layer"]) {
  oxidizableBlocks.register(makeId(`exposed_cut_copper_${v}`), {
    block: makeId(`cut_copper_${v}`),
  });
  oxidizableBlocks.register(makeId(`weathered_cut_copper_${v}`), {
    block: makeId(`exposed_cut_copper_${v}`),
  });
  oxidizableBlocks.register(makeId(`oxidized_cut_copper_${v}`), {
    block: makeId(`weathered_cut_copper_${v}`),
  });

  for (const wax of waxable) {
    waxableBlocks.register(makeId(`${wax}_${v}`.replace("copper", "cut_copper")), {
      block: makeId(`waxed_${wax}_${v}`.replace("copper", "cut_copper")),
    });
  }
}
