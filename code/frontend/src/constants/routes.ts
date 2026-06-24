export interface NavLink {
  labelKey: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  {
    labelKey: "common.home",
    href: "/",
  },
  {
    labelKey: "common.menu",
    href: "/menu",
  },
];
