# AirQo Icons Website

> Beautiful multi-framework icon library website showcasing React, Vue, and Flutter packages

A comprehensive documentation and showcase website for the AirQo Icons library, featuring 1,383+ icons across 22 categories with support for React, Vue 3, and Flutter frameworks.

## ✨ Features

- 🎯 **1,383+ Icons** - Comprehensive collection across 22 categories
- 🖥️ **Multi-Framework Support** - React, Vue 3, and Flutter packages
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🔍 **Advanced Search** - AI-powered fuzzy search with Fuse.js
- 🎨 **Interactive Preview** - Live icon preview with customization
- 📚 **Comprehensive Docs** - Complete documentation for all frameworks
- ⚡ **Performance Optimized** - Tree-shakable with minimal bundle impact
- 🌙 **Dark Mode** - Beautiful dark/light theme support

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/airqo-platform/airqo-libraries.git

# Navigate to the website directory
cd airqo-libraries/icon-website

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📦 AirQo Icons Packages

### React Package

```bash
npm install @airqo/icons-react
```

[View on npm](https://www.npmjs.com/package/@airqo/icons-react) | [Documentation](https://aero-glyphs.vercel.app/docs)

### Vue 3 Package

```bash
npm install @airqo/icons-vue
```

[View on npm](https://www.npmjs.com/package/@airqo/icons-vue) | [Documentation](https://aero-glyphs.vercel.app/docs#vue)

### Flutter Package

```yaml
dependencies:
  airqo_icons_flutter: ^1.0.1
```

[View on pub.dev](https://pub.dev/packages/airqo_icons_flutter) | [Documentation](https://aero-glyphs.vercel.app/docs#flutter)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Search**: Fuse.js
- **Icons**: AirQo Icons React package
- **TypeScript**: Full type safety
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (home)/            # Home page route group
│   ├── docs/              # Documentation pages
│   ├── icons/             # Icon browser page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── docs/              # Documentation components
│   ├── home/              # Home page components
│   ├── icons/             # Icon browser components
│   └── ui/                # Shared UI components
└── styles/                # Global styles
```

## 🎨 Development

### Running Locally

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### Building

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Linting

```bash
# Run ESLint
pnpm lint
```

## 🌐 Deployment

The website is automatically deployed to Vercel on every push to the main branch. The live version is available at [aero-glyphs.vercel.app](https://aero-glyphs.vercel.app).

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/airqo-platform/airqo-libraries/blob/main/CONTRIBUTING.md) for details.

## 📄 License

MIT © [AirQo Platform](https://github.com/airqo-platform)

---

Built with ❤️ by the AirQo team

[Website](https://airqo.net/) • [GitHub](https://github.com/airqo-platform) • [Twitter](https://twitter.com/airqo)
