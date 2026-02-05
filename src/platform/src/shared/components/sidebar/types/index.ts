export interface SidebarProps {
  className?: string;
  hideToggle?: boolean;
  isCollapsed?: boolean;
}

export interface SidebarContentProps {
  flow?: 'user' | 'organization' | 'admin' | 'system';
  orgSlug?: string;
  isCollapsed?: boolean;
  onItemClick?: () => void;
  className?: string;
}

export interface SubRoute {
  id: string;
  label: string;
  href: string;
  description?: string;
  disabled?: boolean;
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
    subroutes?: SubRoute[];
  };
  isCollapsed?: boolean;
  onClick?: () => void;
  className?: string;
  enableSubroutes?: boolean;
}
