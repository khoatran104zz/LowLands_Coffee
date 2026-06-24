export interface NavLink {
  labelKey: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  {
    labelKey: "common.menu",
    href: "/menu",
  },
  {
    labelKey: "common.about",
    href: "/about",
  },
  {
    labelKey: "common.careers",
    href: "/careers",
  },
  {
    labelKey: "common.support",
    href: "/support",
  },
];
