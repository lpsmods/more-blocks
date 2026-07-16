import { BlockComponentRegistry } from "@minecraft/server";
import {
  ConcretePowderComponent,
  CopperBulbComponent,
  CoralComponent,
  FallingBlockComponent,
  FarmlandComponent,
  HeightComponent,
  RedstoneLampComponent,
  SlabComponent,
  SpongeComponent,
  VerticalSlabComponent,
  TntBlockComponent,
} from "@lpsmods/mc-utils";
import { makeId } from "./utils";

export function registerBlockComponents(registry: BlockComponentRegistry): void {
  registry.registerCustomComponent(makeId("tnt"), new TntBlockComponent());
  registry.registerCustomComponent(makeId("sponge"), new SpongeComponent());
  registry.registerCustomComponent(makeId("falling_block"), new FallingBlockComponent());
  registry.registerCustomComponent(makeId("coral"), new CoralComponent());
  registry.registerCustomComponent(makeId("concrete_powder"), new ConcretePowderComponent());
  registry.registerCustomComponent(makeId("copper_bulb"), new CopperBulbComponent());
  registry.registerCustomComponent(makeId("farmland"), new FarmlandComponent());
  registry.registerCustomComponent(makeId("redstone_lamp"), new RedstoneLampComponent());

  registry.registerCustomComponent(makeId("slab"), new SlabComponent());
  registry.registerCustomComponent(makeId("vertical_slab"), new VerticalSlabComponent());
  registry.registerCustomComponent(makeId("height"), new HeightComponent());
}
