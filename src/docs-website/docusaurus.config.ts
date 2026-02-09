import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AirQo Digital Product Documentation',
  tagline: 'Documentation for AirQo\'s Open Air Quality Data Digital Products',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  ],

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',

  baseUrl: '/',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          breadcrumbs: false,
          sidebarPath: './sidebars.ts',
          async sidebarItemsGenerator({defaultSidebarItemsGenerator, ...args}) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);
            
            const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

            const capitalizeItems = (items: any[]): any[] => {
              return items.map((item) => {
                if (item.label) {
                  item.label = capitalize(item.label);
                }
                if (item.items) {
                  item.items = capitalizeItems(item.items);
                }
                return item;
              });
            };
            return capitalizeItems(sidebarItems);
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Product Docs',
      logo: {
        alt: 'AirQo Logo',
        src: 'img/airqo_logo.svg',
        style: {
          height: '24px',
          width: 'auto',
        },
      },
      items: [
        {
          href: 'https://github.com/airqo-platform/AirQo-frontend/tree/staging/src/docs-website',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
