export type PackageType = 'library' | 'cli';

export interface Package {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tagline?: string;
  type: PackageType;
  version: string;
  weeklyDownloads: string;
  totalDownloads: string;
  iconCount?: number;
  categories?: number;
  frameworks?: Array<{
    name: 'React' | 'Vue' | 'Flutter';
    package: string;
    displayName: string;
    icon: string;
    installCommand: string;
  }>;
  installCommand: string;
  usageExample: string;
  features: string[];
  repository?: string;
  homepage: string;
  npmPackage: string;
  docsUrl: string;
  bundleSize?: string;
  license: string;
  lastPublished: string;
  treeshakeable?: boolean;
  typescript?: boolean;
  ssr?: boolean;
}

export const packagesData: Package[] = [
  {
    id: 'icons',
    name: 'icons',
    displayName: 'AirQo Icons',
    description:
      'Production-ready icon library with 1,383+ optimized SVG icons across 22 categories. Available for React, Vue, and Flutter with full TypeScript support.',
    tagline: 'Beautiful icons for your AirQo projects',
    type: 'library',
    // TODO: These metrics should be fetched from npm registry API at build time to stay current
    version: '0.2.10',
    weeklyDownloads: '113',
    totalDownloads: '500+',
    iconCount: 1383,
    categories: 22,
    frameworks: [
      {
        name: 'React',
        package: '@airqo/icons-react',
        displayName: 'React',
        icon: 'react',
        installCommand: 'npm install @airqo/icons-react',
      },
      {
        name: 'Vue',
        package: '@airqo/icons-vue',
        displayName: 'Vue 3',
        icon: 'vue',
        installCommand: 'npm install @airqo/icons-vue',
      },
      {
        name: 'Flutter',
        package: 'airqo_icons_flutter',
        displayName: 'Flutter',
        icon: 'flutter',
        installCommand: 'flutter pub add airqo_icons_flutter',
      },
    ],
    installCommand: 'npm install @airqo/icons-react',
    usageExample: `import { AqHome01 } from '@airqo/icons-react';

<AqHome01 size={24} color="#0284C7" />`,
    features: [
      '1,383 carefully crafted icons',
      'Tree-shakable (2-4KB per icon)',
      'Smart search with fuzzy matching',
      'Full TypeScript support',
      'SSR compatible',
      '196+ country flags',
      '22 icon categories',
      'Zero dependencies (optional fuse.js)',
    ],
    repository:
      'https://github.com/airqo-platform/AirQo-api/tree/staging/packages/airqo-icons',
    homepage: 'https://airqo.net/packages',
    npmPackage: 'https://www.npmjs.com/package/@airqo/icons-react',
    docsUrl: 'https://aero-glyphs.vercel.app/docs',
    bundleSize: '~15 MB unpacked, tree-shakeable',
    license: 'MIT',
    lastPublished: '3 months ago',
    treeshakeable: true,
    typescript: true,
    ssr: true,
  },
  {
    id: 'create-vertex-app',
    name: '@airqo/create-vertex-app',
    displayName: 'Create Vertex App',
    description:
      'Scaffold a configurable, mock-first Vertex IoT dashboard app for managing devices and sensor networks.',
    tagline: 'Bootstrap an IoT console in seconds',
    type: 'cli',
    version: '0.1.4',
    weeklyDownloads: '—',
    totalDownloads: '—',
    installCommand: 'npx @airqo/create-vertex-app@latest',
    usageExample: `npx @airqo/create-vertex-app@latest

# Follow the prompts to configure your Vertex app`,
    features: [
      'Configurable Vertex IoT dashboard starter',
      'Mock-first development workflow',
      'Device management UI foundation',
      'Interactive project scaffolding',
    ],
    homepage: 'https://www.npmjs.com/package/@airqo/create-vertex-app',
    npmPackage: 'https://www.npmjs.com/package/@airqo/create-vertex-app',
    docsUrl: 'https://www.npmjs.com/package/@airqo/create-vertex-app',
    license: 'MIT',
    lastPublished: '21 days ago',
  },
];

export const getPackageById = (id: string): Package | undefined =>
  packagesData.find((pkg) => pkg.id === id);
export const getAllPackages = (): Package[] => packagesData;
