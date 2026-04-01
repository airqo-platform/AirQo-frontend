import { AppManifest } from '@airqo/app-store-modules';

export const manifest: AppManifest = {
  id: 'pm25-heatmap',
  name: 'PM2.5 Heatmap',
  version: '1.0.0',
  description: 'Visualize PM2.5 density as an interactive heatmap.',
  author: 'AirQo Labs',
  category: 'visualization',
  targets: ['analytics'],
  permissions: ['ANALYTICS_VIEW', 'DATA_VIEW'],
  apis: ['map-readings'],
  entrypoint: 'App.tsx',
  thumbnail: '/thumbnails/pm25-heatmap.png',
  minAnalyticsVersion: '2.0.0',
  runtime: 'internal',
};
