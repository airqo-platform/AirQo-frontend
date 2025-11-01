export interface SidebarProps {
  className?: string;
  hideToggle?: boolean;
  isCollapsed?: boolean;
}

export interface SidebarContentProps {
  flow?: 'user' | 'organization';
  orgSlug?: string;
  isCollapsed?: boolean;
  onItemClick?: () => void;
  className?: string;
}

export interface NavItemProps {
  item: {
    id: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    group?: string;
    badge?: string | number;
    disabled?: boolean;
  };
  isCollapsed?: boolean;
  onClick?: () => void;
  className?: string;
}
