import { z } from 'zod';

export const appManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  category: z.string().min(1),
  targets: z.array(z.string().min(1)),
  permissions: z.array(z.string().min(1)).default([]),
  apis: z.array(z.string().min(1)).default([]),
  entrypoint: z.string().min(1),
  thumbnail: z.string().min(1),
  minAnalyticsVersion: z.string().min(1),
  hostedUrl: z.string().url().optional(),
  runtime: z.enum(['internal', 'iframe']).default('internal'),
});

export type AppManifest = z.infer<typeof appManifestSchema>;

export interface AirQoUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AirQoGroup {
  id: string;
  name: string;
  slug?: string;
}

export interface AirQoTheme {
  mode: 'light' | 'dark';
}

export interface AirQoApiClient {
  get: (path: string) => Promise<unknown>;
  post: (path: string, body?: unknown) => Promise<unknown>;
}

export interface AirQoAppProps {
  user: AirQoUser;
  group?: AirQoGroup;
  permissions: string[];
  api: AirQoApiClient;
  theme: AirQoTheme;
}

export interface AppRegistryClient {
  listApps: (params?: {
    search?: string;
    category?: string;
    target?: string;
  }) => Promise<AppManifest[]>;
  getApp: (id: string) => Promise<AppManifest | null>;
  listInstalled: () => Promise<string[]>;
  installApp: (id: string) => Promise<void>;
  uninstallApp: (id: string) => Promise<void>;
}

export const mockApps: AppManifest[] = [
  {
    id: 'pm25-heatmap',
    name: 'PM2.5 Heatmap',
    version: '1.0.0',
    description: 'Visualize PM2.5 density as an interactive heatmap.',
    author: 'AirQo Labs',
    category: 'visualization',
    targets: ['analytics'],
    permissions: ['ANALYTICS_VIEW', 'DATA_VIEW'],
    apis: ['map-readings'],
    entrypoint: 'index.tsx',
    thumbnail: '/thumbnails/pm25-heatmap.png',
    minAnalyticsVersion: '2.0.0',
    runtime: 'internal',
  },
  {
    id: 'data-downloader',
    name: 'Data Downloader',
    version: '1.0.0',
    description: 'Export datasets to CSV or JSON with a guided flow.',
    author: 'AirQo Labs',
    category: 'data',
    targets: ['analytics'],
    permissions: ['ANALYTICS_VIEW', 'DATA_EXPORT'],
    apis: ['download-data'],
    entrypoint: 'index.tsx',
    thumbnail: '/thumbnails/data-downloader.png',
    minAnalyticsVersion: '2.0.0',
    runtime: 'internal',
  },
  {
    id: 'air-quality-map',
    name: 'Air Quality Map',
    version: '1.0.0',
    description: 'Explore sensor readings on a live map.',
    author: 'AirQo Labs',
    category: 'visualization',
    targets: ['analytics'],
    permissions: ['ANALYTICS_VIEW'],
    apis: ['map-readings', 'recent-measurements'],
    entrypoint: 'index.tsx',
    thumbnail: '/thumbnails/air-quality-map.png',
    minAnalyticsVersion: '2.0.0',
    runtime: 'internal',
  },
  {
    id: 'live-sensors',
    name: 'Live Sensor Dashboard',
    version: '1.0.0',
    description: 'Monitor the latest readings across your devices.',
    author: 'AirQo Labs',
    category: 'monitoring',
    targets: ['analytics'],
    permissions: ['ANALYTICS_VIEW'],
    apis: ['recent-measurements'],
    entrypoint: 'index.tsx',
    thumbnail: '/thumbnails/live-sensors.png',
    minAnalyticsVersion: '2.0.0',
    runtime: 'iframe',
    hostedUrl: '/mock-apps/hello-app.html',
  },
];

export const mockInstalledAppIds: string[] = ['pm25-heatmap', 'data-downloader'];
