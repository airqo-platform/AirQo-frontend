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
