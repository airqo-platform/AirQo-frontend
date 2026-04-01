import { AirQoAppProps, AppManifest } from '@airqo/app-store-modules';
import { manifest as pm25Manifest } from './apps/pm25-heatmap/manifest';

export interface AppRegistryEntry {
  manifest: AppManifest;
  load?: () => Promise<{ default: React.ComponentType<AirQoAppProps> }>;
}

export const appRegistry: AppRegistryEntry[] = [
  {
    manifest: pm25Manifest,
    load: () => import('./apps/pm25-heatmap/App'),
  }
];

export const getAppManifest = (id: string) =>
  appRegistry.find(entry => entry.manifest.id === id)?.manifest ?? null;
