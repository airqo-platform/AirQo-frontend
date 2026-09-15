import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "AirQo Digital Product Documentation",
  tagline: "Documentation for AirQo's Open Air Quality Data Digital Products",
  titleDelimiter: "|",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  stylesheets: [
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  ],

  // Public host where docs are served.
  url: "https://platform.airqo.net",
  // Docs are mounted under /docs on the shared platform domains.
  baseUrl: "/docs/",
  trailingSlash: true,

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          breadcrumbs: false,
          sidebarPath: "./sidebars.ts",
          async sidebarItemsGenerator({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);

            // Docs hidden from sidebar navigation only (page stays published at its URL).
            const HIDDEN_DOC_IDS = new Set([
              "nexus/managing-locations/favorite-locations",
            ]);

            const removeHiddenItems = (items: any[]): any[] =>
              items
                .map((item) => {
                  if (
                    item.type === "doc" &&
                    item.id &&
                    HIDDEN_DOC_IDS.has(item.id)
                  ) {
                    return null;
                  }
                  if (item.type === "category") {
                    if (
                      item.link?.type === "doc" &&
                      item.link.id &&
                      HIDDEN_DOC_IDS.has(item.link.id)
                    ) {
                      delete item.link;
                    }
                    item.items = removeHiddenItems(item.items);
                    if (!item.items.length) {
                      return null;
                    }
                  }
                  return item;
                })
                .filter((item): item is any => item !== null);

            const capitalize = (str: string) =>
              str.charAt(0).toUpperCase() + str.slice(1);

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
            return capitalizeItems(removeHiddenItems(sidebarItems));
          },
          editUrl:
            "https://github.com/airqo-platform/AirQo-frontend/edit/staging/src/docs-website/",
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.7,
          filename: "sitemap.xml",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  headTags: [
    {
      tagName: "meta",
      attributes: {
        name: "description",
        content:
          "Official AirQo product documentation for Nexus, Vertex, Beacon, API, and AI Platform.",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "keywords",
        content:
          "AirQo, air quality, product documentation, API docs, Nexus docs, vertex docs, beacon docs",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "robots",
        content:
          "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:type",
        content: "website",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:title",
        content: "AirQo Digital Product Documentation",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:description",
        content:
          "Official AirQo product documentation for Nexus, Vertex, Beacon, API, and AI Platform.",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:url",
        content: "https://platform.airqo.net/docs/",
      },
    },
    {
      tagName: "meta",
      attributes: {
        property: "og:image",
        content: "https://platform.airqo.net/docs/img/airqo_logo.svg",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "twitter:card",
        content: "summary_large_image",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "twitter:title",
        content: "AirQo Digital Product Documentation",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "twitter:description",
        content:
          "Official AirQo product documentation for Nexus, Vertex, Beacon, API, and AI Platform.",
      },
    },
  ],

  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        docsRouteBasePath: "/",
        indexBlog: false,
        indexPages: false,
        language: ["en"],
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    image: "img/airqo_logo.svg",
    metadata: [
      {
        name: "googlebot",
        content:
          "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      },
    ],
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Product Docs",
      logo: {
        alt: "AirQo Logo",
        src: "img/airqo_logo.svg",
        style: {
          height: "24px",
          width: "auto",
        },
      },
      items: [
        {
          type: "search",
          position: "right",
        },
        {
          href: "https://github.com/airqo-platform/AirQo-frontend/tree/staging/src/docs-website",
          label: "GitHub",
          position: "right",
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
