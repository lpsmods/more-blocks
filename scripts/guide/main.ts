import { Icon, Pages } from "@lpsmods/mc-common";
import { blocks } from "./blocks";
import { items } from "./items";
import { changelog } from "#changelog";

export const pages: Pages = {
  home: {
    title: "guide.common.guide_book",
    body: "#desc",
    buttons: ["blocks", "items", "creator", "changelog"],
  },
  creator: {
    title: "#creator",
    icon: Icon.Comment,
    body: "#creator.desc",
  },
  ...blocks,
  ...items,
  ...changelog,
};
