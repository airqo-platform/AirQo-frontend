export type FrameworkType =
  | 'react'
  | 'vue'
  | 'flutter'
  | 'typescript'
  | 'javascript';

export type PackageStatus = 'stable' | 'beta' | 'alpha' | 'coming-soon';

export interface PackageMetrics {
  downloads?: number;
  stars?: number;
  version?: string;
  lastUpdated?: string;
}

export interface PackageLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface Package {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  frameworks: FrameworkType[];
  status: PackageStatus;
  featured: boolean;
  icon?: string;
  metrics?: PackageMetrics;
  links: {
    npm?: string;
    vue?: string;
    pub?: string;
    github?: string;
    docs?: string;
  };
  features?: string[];
  installCommands?: {
    [key in FrameworkType]?: string;
  };
  usageExamples?: {
    [key in FrameworkType]?: string;
  };
}

export interface PackageCategory {
  id: string;
  name: string;
  description: string;
  packages: Package[];
}
