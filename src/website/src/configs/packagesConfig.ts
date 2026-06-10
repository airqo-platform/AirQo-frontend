// Package configuration with real npm statistics
export interface Package {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tagline?: string;
  version: string;
  weeklyDownloads: string;
  totalDownloads: string;
  iconCount: number;
  categories: number;
  frameworks: Array<{
    name: 'React' | 'Vue' | 'Flutter';
    package: string;
    displayName: string;
    icon: string;
    installCommand: string;
  }>;
  features: string[];
  repository: string;
  homepage: string;
  npmPackage: string;
  docsUrl: string;
  bundleSize: string;
  license: string;
  lastPublished: string;
  treeshakeable: boolean;
  typescript: boolean;
  ssr: boolean;
}

export const packagesData: Package[] = [
  {
    id: 'icons',
    name: 'icons',
    displayName: 'AirQo Icons',
    description:
      'Production-ready icon library with 1,383+ optimized SVG icons across 22 categories. Available for React, Vue, and Flutter with full TypeScript support.',
    tagline: 'Beautiful icons for your AirQo projects',
    // TODO: These metrics should be fetched from npm registry API at build time to stay current
    version: '0.2.7',
    weeklyDownloads: '36',
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
    homepage: 'https://aero-glyphs.vercel.app',
    npmPackage: 'https://www.npmjs.com/package/@airqo/icons-react',
    docsUrl: 'https://aero-glyphs.vercel.app/docs',
    bundleSize: '~15 MB unpacked, tree-shakeable',
    license: 'MIT',
    lastPublished: '6 months ago',
    treeshakeable: true,
    typescript: true,
    ssr: true,
  },
];

export const getPackageById = (id: string): Package | undefined =>
  packagesData.find((pkg) => pkg.id === id);
export const getAllPackages = (): Package[] => packagesData;
