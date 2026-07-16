import { emitJson, lootPool, lootTable, recipeShaped, recipeStonecutter, type Ingredient } from "@lpsmods/mc-build";
import fs from "fs";
import path from "path";
import JSON5 from "json5";

type JsonObject = Record<string, any>;

const PROJECT_ID = "lpsm_mb";
const PATH_ID = PROJECT_ID.replaceAll("_", path.sep);
let BP: string;
let RP: string;
let BLOCKS_PATH: string;
let RECIPES_PATH: string;
let LOOT_TABLES_PATH: string;

function jsonFiles(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const filepath = path.join(directory, entry.name);
      return entry.isDirectory() ? jsonFiles(filepath) : entry.name.endsWith(".json") ? [filepath] : [];
    })
    .sort();
}

function readJson(filepath: string): JsonObject {
  return JSON5.parse(fs.readFileSync(filepath, "utf8"));
}

function writeJson(filepath: string, data: JsonObject): void {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function textureIdToPath(id: string): string {
  let name = id.replace("minecraft:", "");
  if (name.includes("_concrete_powder")) {
    name = `concrete_powder_${name.replace("_concrete_powder", "")}`;
  }
  name = name.replace("light_gray", "silver");
  return `textures/blocks/${name}`;
}

function geometryFor(id: string): string {
  if (id.includes("vertical_slab")) return "Geometry.lpsm_assetsplus.vertical_slab";
  if (id.includes("slab")) return "Geometry.lpsm_assetsplus.slab.top";
  if (id.includes("layer")) return "Geometry.lpsm_assetsplus.layer_1";
  if (id.includes("stairs")) return "Geometry.lpsm_assetsplus.stairs.straight";
  return "Geometry.lpsm_assetsplus.full_block";
}

function buildFallingBlocks(): void {
  const falling = jsonFiles(BLOCKS_PATH)
    .map(readJson)
    .map((data) => data["minecraft:block"])
    .filter((block) => `${PROJECT_ID}:falling_block` in block.components);

  const componentGroups: JsonObject = {};
  const events: JsonObject = {};
  const geometries: JsonObject = { default: "geometry.lpsm_assetsplus.full_block" };
  const textures: JsonObject = { default: "textures/lpsm/mb/blocks/falling_block" };
  const geometryArray = ["Geometry.default"];
  const textureArray = ["Texture.default"];

  falling.forEach((block, offset) => {
    const id = block.description.identifier as string;
    const name = id.replace(`${PROJECT_ID}:`, "");
    componentGroups[id] = { "minecraft:variant": { value: offset + 1 } };
    events[id] = { add: { component_groups: [id] } };
    geometries[name] = geometryFor(id);
    textures[name] = textureIdToPath(block.components["minecraft:material_instances"]["*"].texture);
    geometryArray.push(`Geometry.${name}`);
    textureArray.push(`Texture.${name}`);
  });

  const entityPath = path.join(BP, "entities", PATH_ID, "falling_block.json");
  const entity = readJson(entityPath);
  entity["minecraft:entity"].component_groups = componentGroups;
  entity["minecraft:entity"].events = events;
  writeJson(entityPath, entity);

  const clientPath = path.join(RP, "entity", PATH_ID, "falling_block.entity.json");
  const client = readJson(clientPath);
  const description = client["minecraft:client_entity"].description;
  description.textures = textures;
  description.geometry = geometries;
  writeJson(clientPath, client);

  const controllerPath = path.join(RP, "render_controllers", PATH_ID, "falling_block.rc.json");
  const controller = readJson(controllerPath);
  const arrays = controller.render_controllers[`controller.render.${PROJECT_ID}.falling_block`].arrays;
  arrays.textures["array.tex"] = textureArray;
  arrays.geometries["array.geo"] = geometryArray;
  writeJson(controllerPath, controller);
}

const ITEM_ALIASES: Record<string, string> = {
  rooted_dirt: "dirt_with_roots",
  pale_moss: "pale_moss_block",
  moss: "moss_block",
  magma_block: "magma",
  copper: "copper_block",
  terracotta: "hardened_clay",
  slime_block: "slime",
  nether_bricks_block: "nether_brick",
  nether_bricks: "nether_brick",
  clay_block: "clay",
  bricks_block: "brick_block",
  bricks: "brick_block",
  smooth_quartz_block: "smooth_quartz",
  red_nether_bricks: "red_nether_brick",
  nether_quartz_ore: "quartz_ore",
  end_stone_bricks: "end_bricks",
  dirt_path: "grass_path",
  light_gray_glazed_terracotta: "silver_glazed_terracotta",
  flowering_azalea_leaves: "azalea_leaves_flowered",
  powder_snow: "powder_snow_bucket",
  muddy_mangrove_root: "muddy_mangrove_roots",
  mangrove_root: "mangrove_roots",
};
const WOOD_ITEMS = new Set([
  "acacia",
  "pale_oak",
  "oak",
  "dark_oak",
  "warped",
  "crimson",
  "spruce",
  "birch",
  "mangrove",
  "cherry",
  "jungle",
]);

function toItem(id: string): string {
  let item = id
    .replace("_layer", "")
    .replace("_vertical_slab", "")
    .replace("_slab", "")
    .replace("_stairs", "")
    .replace("brick", "bricks")
    .replace("tile", "tiles")
    .replace("tiless", "tiles");
  if (WOOD_ITEMS.has(item)) item += "_planks";
  return ITEM_ALIASES[item] ?? item;
}

function ingredient(item: string): Ingredient {
  return item === "sandstone" || item === "red_sandstone" ? { item: `minecraft:${item}`, data: 0 } : { item };
}

function loot(item: string, count: number): JsonObject {
  const data = lootTable()
    .pool(lootPool(1).entry({ type: "item", name: item }).build())
    .build() as JsonObject;
  data.pools[0].entries[0].functions = [{ function: "set_count", count }];
  return data;
}

function shapeless(id: string, item: string, count = 1): JsonObject {
  const ing = ingredient(item);
  const data = recipeStonecutter(`${id}_stonecutting`)
    .input(ing)
    .result({ item: id, ...(count === 1 ? {} : { count }) })
    .build() as JsonObject;
  data.format_version = "1.20.10";
  data["minecraft:recipe_shapeless"].unlock = [{ item: typeof ing === "string" ? ing : ing.item }];
  return data;
}

function shaped(id: string, item: string, count: number, pattern: string[]): JsonObject {
  const ing = ingredient(item);
  const data = recipeShaped(id, pattern)
    .tag("crafting_table")
    .key("#", ing)
    .result({ item: id, count })
    .build() as JsonObject;
  data.format_version = "1.20.10";
  data["minecraft:recipe_shaped"].unlock = [{ item: typeof ing === "string" ? ing : ing.item }];
  return data;
}

function blockEntries(kind: string): Array<{ id: string; name: string }> {
  return jsonFiles(path.join(BLOCKS_PATH, kind)).map((filepath) => {
    const id = readJson(filepath)["minecraft:block"].description.identifier as string;
    return { id, name: id.split(":")[1] };
  });
}

function buildObtainFiles(): void {
  for (const { id, name } of blockEntries("layer")) {
    for (let count = 1; count <= 8; count++) {
      emitJson(path.join(LOOT_TABLES_PATH, "blocks", `${name}${count}.json`), loot(id, count));
    }
    emitJson(path.join(RECIPES_PATH, "layer", `${name}_stonecutting.json`), shapeless(id, toItem(name), 8));
  }
  for (const { id, name } of blockEntries("slab")) {
    emitJson(path.join(LOOT_TABLES_PATH, "blocks", `${name.replace("_slab", "_double_slab")}.json`), loot(id, 2));
    emitJson(path.join(RECIPES_PATH, "slab", `${name}_stonecutting.json`), shapeless(id, toItem(name), 2));
    emitJson(path.join(RECIPES_PATH, "slab", `${name}.json`), shaped(id, toItem(name), 2, ["###"]));
  }
  for (const { id, name } of blockEntries("stairs")) {
    emitJson(path.join(RECIPES_PATH, "stairs", `${name}_stonecutting.json`), shapeless(id, toItem(name)));
    emitJson(path.join(RECIPES_PATH, "stairs", `${name}.json`), shaped(id, toItem(name), 4, ["#", "##", "###"]));
  }
  for (const { id, name } of blockEntries("vertical_slab")) {
    emitJson(
      path.join(LOOT_TABLES_PATH, "blocks", `${name.replace("_vertical_slab", "_double_vertical_slab")}.json`),
      loot(id, 2),
    );
    emitJson(path.join(RECIPES_PATH, "vertical_slab", `${name}_stonecutting.json`), shapeless(id, toItem(name), 2));
    emitJson(path.join(RECIPES_PATH, "vertical_slab", `${name}.json`), shaped(id, toItem(name), 6, ["#", "#", "#"]));
  }
}

const WOOD_TYPES = [
  "spruce",
  "birch",
  "jungle",
  "acacia",
  "dark_oak",
  "mangrove",
  "cherry",
  "pale_oak",
  "oak",
  "bamboo",
];

function includesAny(value: string, names: string[]): boolean {
  return names.some((name) => value.includes(name));
}

function buildTags(): void {
  const missing: string[] = [];
  for (const filepath of jsonFiles(BLOCKS_PATH)) {
    const data = readJson(filepath);
    const block = data["minecraft:block"];
    const id = block.description.identifier as string;
    const name = id.replace(`${PROJECT_ID}:`, "");
    const material = name.replace(/_(vertical_slab|slab|stairs|layer)$/, "");
    const components = block.components as JsonObject;
    Object.keys(components)
      .filter((key) => key.startsWith("tag:"))
      .forEach((key) => delete components[key]);
    const tag = (name: string): void => {
      components[`tag:${name}`] = {};
    };

    if (id.includes("wool")) tag("minecraft:is_shears_item_destructible");
    if (id.endsWith("_stairs")) tag("minecraft:cornerable_stairs");
    if (id.endsWith("_slab") && !id.includes("vertical_slab")) tag("minecraft:slab");
    if (id.endsWith("_vertical_slab")) tag(`${PROJECT_ID}:vertical_slab`);
    if (id.endsWith("layer")) tag(`${PROJECT_ID}:layer`);
    if (includesAny(id, ["dirt", "farmland", "grass_block", "moss_block", "mycelium", "podzol"])) {
      tag("dirt");
      tag("minecraft:is_shovel_item_destructible");
    }
    if (includesAny(id, ["dirt", "grass_block", "path"])) tag("grass");
    if (id.includes("gravel")) {
      tag("gravel");
      tag("minecraft:is_shovel_item_destructible");
    }
    if (id.includes("_log_")) tag("log");
    if (includesAny(id, ["copper", "iron", "gold"])) tag("metal");
    if (id.includes("bedrock")) tag("not_feature_replaceable");
    if (id.includes("pumpkin")) {
      tag("pumpkin");
      tag("minecraft:is_axe_item_destructible");
    }
    if (!id.includes("sandstone") && includesAny(id, ["red_sand", "sand"])) {
      tag("sand");
      tag("minecraft:is_shovel_item_destructible");
    }
    if (includesAny(id, ["diamond", "emerald", "gold", "redstone_ore"])) tag("minecraft:iron_tier_destructible");
    if (includesAny(id, ["ancient_debris", "obsidian", "netherite_block"])) tag("minecraft:diamond_tier_destructible");
    if (
      includesAny(id, [
        "dried_kelp",
        "hay_block",
        "tnt",
        "moss",
        "azalea",
        "moss_block",
        "nether_wart",
        "warped_wart",
        "sculk",
        "sponge",
        "shroomlight",
        "target",
      ])
    )
      tag("minecraft:is_hoe_item_destructible");
    if (
      includesAny(id, ["concrete_powder", "clay_", "mud", "soul_soil", "snow"]) &&
      !id.includes("sandstone") &&
      !id.includes("packed_mud")
    )
      tag("minecraft:is_shovel_item_destructible");
    const pickaxe = [
      "concrete",
      "ancient_debris",
      "netherite_block",
      "netherrack",
      "resin_block",
      "sea_lantern",
      "iron_block",
      "lapis_block",
      "magma",
      "coal_block",
      "gold_block",
      "diamond_block",
      "emerald_block",
      "amethyst",
      "glass",
      "bone",
      "terracotta",
      "copper",
      "ice",
      "packed_mud",
      "andesite",
      "granite",
      "diorite",
      "calcite",
      "basalt",
      "blackstone",
      "cinnabar",
      "deepslate",
      "sulfur",
      "tuff",
      "prismarine",
      "purpur",
      "quartz",
      "sandstone",
      "redstone_block",
      "coral",
      "nylium",
      "_ore_",
      "raw_",
      "stone_",
      "brick",
      "obsidian",
    ];
    if (includesAny(id, pickaxe) && !id.includes("concrete_powder")) tag("minecraft:is_pickaxe_item_destructible");
    if (includesAny(id, ["bookshelf", "warped", "crimson", "hyphae", "stem", "mushroom", "melon"]))
      tag("minecraft:is_axe_item_destructible");
    if (includesAny(id, WOOD_TYPES)) {
      components["minecraft:flammable"] = {};
      if (id.includes("leaves")) tag("is_hoe_item_destructible");
      else {
        tag("wood");
        tag("is_axe_item_destructible");
      }
    }
    for (const wood of WOOD_TYPES) if (id.includes(`${wood}_log`)) tag(wood);
    if (id.includes("_ore")) tag(`ulkd_ess:ore_${material.replace("_ore", "")}`);
    if (id.includes("_leaves")) tag(`ulkd_ess:tree_leaves_${material.replace("_leaves", "")}`);
    if (id.includes("_log")) tag(`ulkd_ess:tree_log_${material.replace("_log", "")}`);
    if (
      !Object.keys(components).some((key) => key.includes("item_destructible")) &&
      !includesAny(id, ["bedrock", "honeycomb", "honey", "slime", "froglight"])
    )
      missing.push(filepath);
    writeJson(filepath, data);
  }
  if (missing.length) console.warn(`No item destructible:\n${missing.map((file) => `- ${file}`).join("\n")}`);
}

function formatIds(ids: string[]): string {
  return ids
    .map((id) =>
      id
        .toLowerCase()
        .replace(`${PROJECT_ID}:`, "")
        .replace(/_(layer|vertical_slab|slab|stairs)$/, "")
        .replaceAll("_", " "),
    )
    .join(", ");
}

function buildTexts(): void {
  const ids = jsonFiles(BLOCKS_PATH).map((file) => readJson(file)["minecraft:block"].description.identifier as string);
  const values: Record<string, string> = {
    layers: formatIds(ids.filter((id) => id.includes("layer"))),
    vertical_slabs: formatIds(ids.filter((id) => id.includes("vertical_slab"))),
    slabs: formatIds(ids.filter((id) => id.includes("slab") && !id.includes("vertical_slab"))),
    stairs: formatIds(ids.filter((id) => id.includes("stairs"))),
  };
  for (const filepath of fs
    .readdirSync(path.join(RP, "texts"))
    .filter((file) => file.endsWith(".lang"))
    .map((file) => path.join(RP, "texts", file))) {
    const newline = fs.readFileSync(filepath, "utf8").includes("\r\n") ? "\r\n" : "\n";
    const lines = fs.readFileSync(filepath, "utf8").split(/\r?\n/);
    for (const line of lines.filter((item) => item.startsWith("##template: "))) {
      const rendered = line
        .slice("##template: ".length)
        .replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => values[key] ?? "");
      const key = rendered.slice(0, rendered.indexOf("="));
      const index = lines.findIndex((item) => item.startsWith(`${key}=`) && !item.startsWith("##"));
      if (index >= 0) lines[index] = rendered;
      else lines.push(rendered);
    }
    fs.writeFileSync(filepath, lines.join(newline));
  }
}

export function buildPacks(behaviorPackPath: string, resourcePackPath: string): void {
  BP = path.resolve(behaviorPackPath);
  RP = path.resolve(resourcePackPath);
  BLOCKS_PATH = path.join(BP, "blocks", PATH_ID);
  RECIPES_PATH = path.join(BP, "recipes", PATH_ID);
  LOOT_TABLES_PATH = path.join(BP, "loot_tables", PATH_ID);

  buildFallingBlocks();
  buildObtainFiles();
  buildTags();
  buildTexts();
}
