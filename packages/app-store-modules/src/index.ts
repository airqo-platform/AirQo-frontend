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

export const defaultInstalledAppIds: string[] = [
  'pm25-heatmap'
];

export * from '../../../src/app-store-projects/registry';
