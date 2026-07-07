export interface NavItem {
  title: string;
  description?: string;
  href: string;
  newTab?: boolean;
}

export type NavItems = Record<string, NavItem[]>;
