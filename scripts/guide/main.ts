import { Icon, Pages } from "@lpsmods/mc-common";
import { blocks } from "./blocks";
import { items } from "./items";
import { changelogs } from "./changelogs";

export const pages: Pages = {
  home: {
    title: "guide.common.guide_book",
    body: "#desc",
    buttons: ["blocks", "items", "creator", "changelogs"],
  },
  creator: {
    title: "#creator",
    icon: Icon.Comment,
    body: "#creator.desc",
  },
  ...blocks,
  ...items,
  ...changelogs,
};
