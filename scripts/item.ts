import { ItemComponentRegistry } from "@minecraft/server";
import { GuideBookComponent } from "@lpsmods/mc-utils";
import { pages } from "./guide/main";
import { makeId } from "./utils";

export function registerItemComponents(reg: ItemComponentRegistry): void {
  reg.registerCustomComponent(makeId("guide_book"), new GuideBookComponent(pages));
  GuideBookComponent.setup(makeId("guide_book"));
}
